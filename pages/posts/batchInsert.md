---
title: 批量插入的江湖：性能优化的终极修炼
date: 2025-01-04T23:00:00Z
lang: zh
duration: 60min
plum: true
---
在数据库的江湖里，批量插入就是一门顶级内功。虽然它不像“分布式事务”那样炫酷，也没有“CAP理论”那么玄妙，但它关乎性能、关乎优雅，更关乎一颗程序员的秃头能不能在五年后依然坚守阵地。

批量插入是什么？简单说，就是把一车苹果塞进数据库，而不是一颗颗扔进去。你可能觉得这是常识，但如果说我们把一百个苹果丢进数据库竟然能慢到让老板生疑，甚至质问你是不是趁机偷摸去吃了十几个……嗯，这就有问题了。

----

## 为什么批量插入重要？
想象一下，你在餐馆点了一百份炸鸡。如果服务员每送来一块鸡腿就跑回厨房一趟，这饭还怎么吃？效率高的做法是直接推辆小车，把一百块炸鸡一次送到你面前，这就是批量插入的精髓——**少跑路，快上菜**。

在现实开发中，程序员面临的挑战是这样的：
- 单条插入慢如蜗牛：一个一个插入，等数据量大了，慢得令人发指。
- 不做批量就会拖垮系统：插入1000条数据的网络请求，硬生生搞出了1000次数据库交互，浪费了无数带宽、CPU、内存。
- 批量插入并非一劳永逸：数据库也有自己的脾气，插得多不一定快，设计不好可能还会搞垮索引。

## 本文要讲什么
这篇文章不是来教你如何 **“用力插入”** 的，而是基于一个笔者真实遇到的调优过程来揭示批量插入的真相：不同场景下，不同技术方案的优劣，以及那些隐藏在深处的性能杀手。

我们会聊聊这些问题：
- MyBatis-Plus 的批量插入：是不是拿着开箱即用的工具就能通杀所有场景？
- InsertBatchSomeColumn 究竟“香不香”？为啥它理论上效率爆表，但用起来还得小心翼翼？
- 什么场景下批量插入会变成“批量插雷”？索引、表结构、事务管理，这些让你崩溃的细节我们一一扒光。

以上内容均非空谈，我们会通过一个真实的项目，用一个业务、不同数据量和多种插入方式，还原批量插入在性能上的真实表现。

## 谁适合读这篇文章？
- 如果你正在开发数据导入功能，并被性能问题困扰，请继续往下读。
- 如果你的数据库插入慢到老板发出灵魂拷问——“这也叫优化？”——那更要读。
- 如果你只是想装个懂数据库性能的大佬，这篇文章也能让你在技术会议上发出“嗯，这个我研究过”的点头声。

批量插入的江湖，没有最优解，只有最适合的策略。接下来，我们一起揭开这门技术的神秘面纱，找到属于你的答案。

----

## 数据插入的江湖
### 初入江湖
这个江湖开始于笔者正在做的一个项目，一个仿腾讯云 IM 的开源即时通讯接入平台：[菜鸟 IM](https://cnb.cool/rookie-stack/rookie-im-server.git)；在用户相关服务构建的过程中，涉及到一个很简单的 API - **批量导入用户**。
这里就不过多赘述系统开发设计的业务背景，有兴趣的朋友可以去仓库查看。但**看似简单的“批量导入”，却暗藏杀机**，我们先来看代码：

```java
...
// 分批处理用户数据
List<List<ImportUserData>> userDataBatches = partitionList(importUserReq.getUserData(), 100);

ExecutorService executor = Executors.newFixedThreadPool(Runtime.getRuntime().availableProcessors() * 2);

List<Callable<Void>> tasks = new ArrayList<>();
for (List<ImportUserData> batch : userDataBatches) {
    tasks.add(() -> {
        List<ImUserData> imUserDataList = batch.stream()
                .map(data -> ImUserAdapter.buildImUserData(data, appId))
                .collect(Collectors.toList());
        try {
            // 批量插入
            imUserDataDao.saveBatch(imUserDataList);
            imUserDataList.forEach(user -> successId.add(user.getUserId()));
        } catch (Exception e) {
            log.error("批量插入失败: {}", e.getMessage(), e);
            imUserDataList.forEach(user -> failedId.add(user.getUserId()));
        }
        return null;
    });
}

try {
    executor.invokeAll(tasks);
} catch (InterruptedException e) {
    log.error("任务中断: {}", e.getMessage(), e);
} finally {
    executor.shutdown();
}
...
```
一上来我们就并发和批量两套组合拳，我相信没有什么数据量能在两套招式下还能拖慢我们的后腿。简单来说：
1. 我们首先将用户数据按每批 100 条分成若干批次，便于分块处理，避免一次性处理大量数据导致内存或数据库性能问题。
2. 紧接着我们创建一个固定大小的线程池，用于并发执行批量插入任务。
3. 遍历分批后的数据列表，为每一批创建一个任务，并加入 tasks 列表。
4. 调用 `executor.invokeAll(tasks)` 批量执行所有任务。
这里的核心在于**分片和多线程**，但是我们的关注点需要放在`imUserDataDao.saveBatch`上，这是 MyBatis Plus 提供的一个批量插入数据库的方法；我们来看下他的表现，我们来构造一组20 条的数据，先来试个水：
[![batch1.png](https://www.helloimg.com/i/2025/01/04/677904b2bf63e.png)](https://www.helloimg.com/i/2025/01/04/677904b2bf63e.png)
很难想象，20 条数据的插入居然花费了 1.4s。这让人难以接受。要知道，现代数据库插入一条简单记录的耗时通常在毫秒级，1.4 秒的表现仿佛让我们回到了拨号上网的年代。那么，问题出在哪里？
### 问题分析
面对这样令人发指的性能问题，我们需要冷静拆解，逐层分析瓶颈可能存在的地方：
#### 是 **saveBatch** 本身的问题吗？
**saveBatch** 是 MyBatis-Plus 提供的一个常用批量插入方法。它背后其实是循环调用批量 SQL 的封装，也就是说：
- 它会将数据按照指定批次大小拆分（默认 1000 条），然后一批一批执行插入。
- 每一批次都会生成类似这样的 SQL：`INSERT INTO table (col1, col2) VALUES (val1, val2), (val3, val4), ...;`如果没有复杂逻辑，单批插入的性能应该很高。

问题看来并不出现**saveBatch**，吗？经过进一步查阅 MyBatis-Plus 的文档，我们发现问题并不是出现在 **saveBatch** 本身的实现逻辑上，而是出在默认配置没有启用关键功能。要想让 **saveBatch** 发挥真正的批量插入威力，需要确保 MyBatis-Plus 的批量操作配置正确。

MyBatis-Plus 的 **saveBatch** 方法依赖于底层的 JDBC 批量处理功能。默认情况下，许多开发者会忽略这一点，从而导致实际执行的插入操作退化为逐条执行。所以我们需要在项目的配置文件(application.yml)中，添加`rewriteBatchedStatements=true`的配置。
[![batch2.png](https://www.helloimg.com/i/2025/01/04/677907817387c.png)](https://www.helloimg.com/i/2025/01/04/677907817387c.png)
ok～这下应该搞定了吧，批量插入的问题要被我们解决了！我们再来 20 条数据看看。
[![batch3.png](https://www.helloimg.com/i/2025/01/04/677908128b60d.png)](https://www.helloimg.com/i/2025/01/04/677908128b60d.png)
立竿见影，就没见过这么快的～1.4s 到 400ms 的优化，只是因为我们添加了一个配置。好了，神功大成，我们无敌了。

但是，如果你真实的去实践了，去观察了执行的控制台日志输出后，你会发出和我一样的疑问：**这不还是一条一条插入的吗？**
[![1735985619950.png](https://www.helloimg.com/i/2025/01/04/6779095b9b6bc.png)](https://www.helloimg.com/i/2025/01/04/6779095b9b6bc.png)
从控制台输出日志可以看出，这里 MyBatis-Plus 实现的批量插入和我们常规印象中的批量好像不是一个概念，我们期望的批量插入是：
```sql
INSERT INTO table_name (col1, col2, col3)
VALUES
(val1, val2, val3),
(val4, val5, val6),
(val7, val8, val9);
```
单条 SQL，插入多行数据；同时我也可以分批控制以及可以控制单次的事务；理论上来讲，只要单条插入数据的性能不是瓶颈，这种使用 sql 的方式应该是最快的批量插入；因此我就产生了两个疑问： MyBatis-Plus 为什么没有这样做？拼接 sql 的方式能让我快多少？

### saveBatch 是如何实现的
想要搞清楚 MyBatis-Plus 的批量插入为什么看起来像是一个骗局？我们首先得搞明白它的基础——**JDBC 的批量提交机制**。
#### JDBC 的批量提交机制
在 JDBC 中，批量提交是通过 Statement 或 PreparedStatement 的 addBatch() 和 executeBatch() 方法实现的。它的核心思想是将多条 SQL 操作放入一个批量中，减少与数据库的交互次数，从而提升性能。
通过一段代码我们来了解下：
```java
try (Connection connection = dataSource.getConnection()) {
    String sql = "INSERT INTO table_name (col1, col2, col3) VALUES (?, ?, ?)";
    try (PreparedStatement pstmt = connection.prepareStatement(sql)) {
        for (int i = 0; i < 1000; i++) {
            pstmt.setString(1, "value1-" + i);
            pstmt.setInt(2, i);
            pstmt.setString(3, "value3-" + i);
            pstmt.addBatch();  // 将语句加入批量
        }
        pstmt.executeBatch();  // 批量执行
    }
}
```
在这段代码中：
1. addBatch()：将 SQL 添加到批次中。
2. executeBatch()：一次性执行批次中的所有 SQL。
3. 性能提升：
   - 减少网络交互：批量提交的所有 SQL 通过一次网络请求发送给数据库。
   - 减少事务开销：如果不手动控制事务，默认情况下整个批量操作在一个隐式事务中完成。

也就是说，我们忽略分批的情况下，默认一批次的数据插入，不会一条一条的执行，而是批量打包为一个 insert 语句包，一次性的丢给数据库去执行；这个过程只需要一次网络传输，而且一个批次的所有记录共用一条 SQL 模板。

了解完 JDBC 的批量提交机制之后，我们来看看saveBatch的源码是如何实现的。

#### saveBatch源码分析
先看看 saveBatch 的核心实现，这里直接引出一个关键方法：
```java
public static <E> boolean executeBatch(SqlSessionFactory sqlSessionFactory, Log log,
                                       Collection<E> list, int batchSize,
                                       BiConsumer<SqlSession, E> consumer) {
    // 1. 校验批次大小是否有效
    Assert.isFalse(batchSize < 1, "batchSize must not be less than one");

    // 2. 如果集合为空，直接返回 false
    return !CollectionUtils.isEmpty(list) && executeBatch(sqlSessionFactory, log, sqlSession -> {
        int size = list.size(); // 数据总量
        int idxLimit = Math.min(batchSize, size); // 当前批次限制
        int i = 1;

        // 3. 遍历数据集合
        for (E element : list) {
            // 执行具体的插入逻辑（通过 consumer 定义）
            consumer.accept(sqlSession, element);

            // 达到当前批次的限制时，flush 数据并更新批次计数
            if (i == idxLimit) {
                sqlSession.flushStatements(); // 刷新批量操作到数据库
                idxLimit = Math.min(idxLimit + batchSize, size); // 更新下一个批次的限制
            }
            i++;
        }
    });
}
```
这段代码乍一看不复杂，但隐藏的细节非常有趣！我们一步步剖析：
1. 批次大小校验
```java
Assert.isFalse(batchSize < 1, "batchSize must not be less than one");
```
首先，它会检查 batchSize 是否有效，确保不能小于 1。
- 如果你传入 batchSize = 0，saveBatch 就直接让你“扑街”——报错毫不客气。
- 这是为了保证最基本的逻辑正确性：每个批次至少要插一条数据，不然批量插入还有啥意义？
2. 集合为空的优化处理
```java
return !CollectionUtils.isEmpty(list) && executeBatch(...);
```
如果要插入的数据集合是空的，saveBatch 也会直接短路，返回 false。
- 这是一个很实用的优化：空集合没必要再浪费资源走后续逻辑。
- 实战场景中，这种处理可以避免你“辛辛苦苦遍历到最后发现啥都没干”的尴尬。
3. 数据分批核心逻辑
```java
int idxLimit = Math.min(batchSize, size);
int i = 1;

for (E element : list) {
    consumer.accept(sqlSession, element); // 执行插入逻辑
    if (i == idxLimit) {
        sqlSession.flushStatements(); // 刷新当前批次到数据库
        idxLimit = Math.min(idxLimit + batchSize, size); // 更新批次限制
    }
    i++;
}
```
这段代码可以说是 saveBatch 的核心了！它的执行过程可以用“快递装箱”来打比方：
- 分批装箱：
  - 它按照 batchSize（批次大小）把数据分成一批一批的“快递箱”。
  - 每次最多装 batchSize 条数据，不超过总数据量 size。
- 送快递（flushStatements）：
  - 每装满一个箱子，就通过 flushStatements() 把这批数据送到数据库，类似于“快递员来收件”。
  - flushStatements 的本质就是批量提交，把之前 addBatch() 的操作执行到数据库。
- 更新下一批次：
  - 装完一箱后，计算下一批次的数据范围，并继续“装箱”。
4. 插入逻辑的自定义（consumer）
```java
consumer.accept(sqlSession, element);
```
这里的 consumer 是一个自定义的逻辑，定义了“每一条数据的插入操作”。你可以理解为，这是 saveBatch 的可扩展部分。
通常情况下，consumer 会调用 MyBatis 的 insert 方法，把数据加入 addBatch 列表。比如：
```java
(sqlSession, element) -> sqlSession.insert("namespace.insert", element);
```
这让 saveBatch 变得非常灵活——它本身不关心具体的 SQL，而是把实际的插入逻辑交给用户定义。

学习完saveBatch的源码，我们了解了 MyBatis-Plus 的批量的具体实现。解决了我们的一部分疑问，但是，还有一个比较大的问题并没有解决，那就是，在刻板映像中，我们还是会觉得拼接为批量的一条 sql 才是批量插入的完美解决方案，为什么 MyBatis 没支持呢？

### insertBatchSomeColumn
其实早在 2018 年，MyBatis-Plus 的“江湖大佬”们就已经另辟蹊径，推出了一个真正意义上可以拼接 SQL 完成批量插入的方法——`insertBatchSomeColumn`。

这个方法的核心思路是：通过动态拼接 SQL，生成一条包含多条数据的 INSERT 语句。和我们之前分析的 saveBatch 不同，insertBatchSomeColumn 是一个真正符合“批量插入”直觉的操作。

这个方法并不是MyBatis-Plus默认的一个方法，我们需要在 idea 里全局搜索，或者进入源码中直接寻找，在`package com.baomidou.mybatisplus.extension.injector.methods;`包中，我们可以找到他；而他的实现也相对比较简单，我们能看到他的核心逻辑是拼接 Sql生成一个MappedStatement：
```java
@Override
public MappedStatement injectMappedStatement(Class<?> mapperClass, Class<?> modelClass, TableInfo tableInfo) {
    KeyGenerator keyGenerator = NoKeyGenerator.INSTANCE;
    SqlMethod sqlMethod = SqlMethod.INSERT_ONE;
    List<TableFieldInfo> fieldList = tableInfo.getFieldList();
    String insertSqlColumn = tableInfo.getKeyInsertSqlColumn(true, null, false) +
        this.filterTableFieldInfo(fieldList, predicate, TableFieldInfo::getInsertSqlColumn, EMPTY);
    String columnScript = LEFT_BRACKET + insertSqlColumn.substring(0, insertSqlColumn.length() - 1) + RIGHT_BRACKET;
    String insertSqlProperty = tableInfo.getKeyInsertSqlProperty(true, ENTITY_DOT, false) +
        this.filterTableFieldInfo(fieldList, predicate, i -> i.getInsertSqlProperty(ENTITY_DOT), EMPTY);
    insertSqlProperty = LEFT_BRACKET + insertSqlProperty.substring(0, insertSqlProperty.length() - 1) + RIGHT_BRACKET;
    String valuesScript = SqlScriptUtils.convertForeach(insertSqlProperty, "list", null, ENTITY, COMMA);
    String keyProperty = null;
    String keyColumn = null;
    // 表包含主键处理逻辑,如果不包含主键当普通字段处理
    if (tableInfo.havePK()) {
        if (tableInfo.getIdType() == IdType.AUTO) {
            /* 自增主键 */
            keyGenerator = Jdbc3KeyGenerator.INSTANCE;
            keyProperty = tableInfo.getKeyProperty();
            // 去除转义符
            keyColumn = SqlInjectionUtils.removeEscapeCharacter(tableInfo.getKeyColumn());
        } else {
            if (null != tableInfo.getKeySequence()) {
                keyGenerator = TableInfoHelper.genKeyGenerator(this.methodName, tableInfo, builderAssistant);
                keyProperty = tableInfo.getKeyProperty();
                keyColumn = tableInfo.getKeyColumn();
            }
        }
    }
    String sql = String.format(sqlMethod.getSql(), tableInfo.getTableName(), columnScript, valuesScript);
    SqlSource sqlSource = super.createSqlSource(configuration, sql, modelClass);
    return this.addInsertMappedStatement(mapperClass, modelClass, methodName, sqlSource, keyGenerator, keyProperty, keyColumn);
}
```
在 MyBatis-Plus 的世界里，injectMappedStatement 是一个超级工具，它的使命就是动态生成 SQL 映射，让我们写少量代码甚至不写代码，就能轻松实现复杂的数据库操作。

我们来剖析下在这个类中injectMappedStatement的具体实现。
1. 准备工具与原材料
```java
KeyGenerator keyGenerator = NoKeyGenerator.INSTANCE; // 默认无主键生成器
SqlMethod sqlMethod = SqlMethod.INSERT_ONE; // 插入一条数据的方法
List<TableFieldInfo> fieldList = tableInfo.getFieldList(); // 获取表的字段信息
```
这几行代码的作用就像准备生产工具和原材料：
- keyGenerator：用来控制主键生成逻辑，默认情况下没有主键生成器。
- sqlMethod：定义了操作类型，这里是“插入一条数据”。
- fieldList：从 TableInfo（表信息）中获取所有字段，后面会用到它来动态生成 SQL。
2. 拼接 SQL 的“SELECT 模板”
```java
String insertSqlColumn = tableInfo.getKeyInsertSqlColumn(true, null, false) +
    this.filterTableFieldInfo(fieldList, predicate, TableFieldInfo::getInsertSqlColumn, EMPTY);
String columnScript = LEFT_BRACKET + insertSqlColumn.substring(0, insertSqlColumn.length() - 1) + RIGHT_BRACKET;
``` 
这里是“拼 SQL 模板”的关键步骤：
- tableInfo.getKeyInsertSqlColumn：获取主键的 SQL 字段。
  - 比如：id 是主键，它会返回 "id,"。
- filterTableFieldInfo：根据 predicate（过滤条件）过滤字段，并将每个字段拼成 SQL。
  - 比如字段有 name 和 age，它会生成 "name, age,"。
- columnScript：拼接成括号包裹的完整字段列表。
  - 输出结果：(id, name, age)

这部分就像是为插入操作画了一张“插槽模板”：这些字段告诉数据库“我要插入这些东西”。

3. 拼接 SQL 的“VALUES 模板”
```java
String insertSqlProperty = tableInfo.getKeyInsertSqlProperty(true, ENTITY_DOT, false) +
    this.filterTableFieldInfo(fieldList, predicate, i -> i.getInsertSqlProperty(ENTITY_DOT), EMPTY);
insertSqlProperty = LEFT_BRACKET + insertSqlProperty.substring(0, insertSqlProperty.length() - 1) + RIGHT_BRACKET;
String valuesScript = SqlScriptUtils.convertForeach(insertSqlProperty, "list", null, ENTITY, COMMA);
```
这部分的作用是生成插入数据对应的“占位符”：
- tableInfo.getKeyInsertSqlProperty：获取主键对应的属性占位符。
  - 比如主键是 id，对应的占位符是 #{id}。
- filterTableFieldInfo：和字段列表一样，把每个字段的占位符都拼接起来。
  - 比如字段 name 和 age，会生成：#{name}, #{age}。
- valuesScript：通过 foreach 把占位符应用到多条记录上。
输出结果：
```
(#{list[0].id}, #{list[0].name}, #{list[0].age}),
(#{list[1].id}, #{list[1].name}, #{list[1].age}),
...
```
这就像给“插槽模板”填充了数据，让每一条记录有对应的占位符。

4. 主键生成器的特殊处理
```java
if (tableInfo.havePK()) {
    if (tableInfo.getIdType() == IdType.AUTO) {
        keyGenerator = Jdbc3KeyGenerator.INSTANCE; // 自增主键
        keyProperty = tableInfo.getKeyProperty();
        keyColumn = SqlInjectionUtils.removeEscapeCharacter(tableInfo.getKeyColumn());
    } else if (null != tableInfo.getKeySequence()) {
        keyGenerator = TableInfoHelper.genKeyGenerator(this.methodName, tableInfo, builderAssistant);
        keyProperty = tableInfo.getKeyProperty();
        keyColumn = tableInfo.getKeyColumn();
    }
}
```
这里是主键生成逻辑的处理：
- 自动递增主键：
  - 如果主键是 AUTO_INCREMENT，用 Jdbc3KeyGenerator 自动生成主键。
- 手动指定主键：
  - 如果主键使用了序列（如 Oracle 的 sequence），就会用序列生成器来生成主键。

主键的生成逻辑被封装在这里，让插入操作可以智能处理有无主键的情况。

5. 生成最终 SQL 脚本
```java
String sql = String.format(sqlMethod.getSql(), tableInfo.getTableName(), columnScript, valuesScript);
SqlSource sqlSource = super.createSqlSource(configuration, sql, modelClass);
```
这一部分是重头戏，把前面拼接的“字段”和“数据”模板组装成完整的 SQL.
最终生成的 SQL：
```sql
INSERT INTO user_table (id, name, age)
VALUES
  (#{list[0].id}, #{list[0].name}, #{list[0].age}),
  (#{list[1].id}, #{list[1].name}, #{list[1].age}),
  ...
```

6. 返回最终 MappedStatement
```java
return this.addInsertMappedStatement(mapperClass, modelClass, methodName, sqlSource, keyGenerator, keyProperty, keyColumn);
```
这一步将生成的 SQL 包装成 MyBatis 的 MappedStatement，并交给框架去管理和执行。