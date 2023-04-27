---
title: 被遗忘的Java关键字：transient
date: 2023-04-26T13:00:00Z
lang: zh
duration: 25min
plum: true
---

[[toc]]

今天在看项目代码时候，看到了下面这样一行代码，用transient修饰了一个变量，主要作用是做一个全局开关。说实话我是第一次看到这个关键字。激发了我的好奇心，所以就了解一下这是何方神圣。

```java
/**
 * 全局开关
 */
public static transient boolean running = true;
```
## transient 是什么？

在 Java 中，transient 是一个关键字，用于指定一个类的字段（成员变量）在序列化时应该被忽略。在 Java 对象序列化期间，对象的状态被转换为字节流，以便在网络上传输或持久保存到磁盘。如果一个字段被标记为 transient，那么它的值不会被序列化，在反序列化时会被恢复其默认值。

### 简单示例
```java
public class Example implements Serializable {
    private String name;
    private transient int age;

    public Example(String name, int age) {
        this.name = name;
        this.age = age;
    }

    public String toString() {
        return "Example{name='" + name + "', age=" + age + "}";
    }

    public static void main(String[] args) throws Exception {
        String dir = "/Users/JaguarLiu/Desktop/";

        // 创建一个Example对象并序列化到文件
        Example obj = new Example("JaguarLiu", 20);

        System.out.println("Before serialization: " + obj);
        OutputStream outputStream = Files.newOutputStream(Paths.get(dir + "example.ser"));
        try (ObjectOutputStream out = new ObjectOutputStream(outputStream)) {
            out.writeObject(obj);
        }

        // 从文件中反序列化Example对象
        InputStream inputStream = Files.newInputStream(Paths.get(dir + "example.ser"));
        try (ObjectInputStream in = new ObjectInputStream(inputStream)) {
            System.out.println("After deserialization: " + in.readObject());
        }
    }
}
```
### 执行结果：
```shell
Before serialization: Example{name='JaguarLiu', age=20}
After deserialization: Example{name='JaguarLiu', age=0}
```
在上述示例中，我们创建了一个名为 `Example` 的类，并在其中定义了两个字段 `name` 和 `age`，其中 `age` 被标记为 `transient`。然后，我们创建了一个 `Example` 对象并将其序列化到名为 `example.ser` 的文件中。

接着，我们从文件中反序列化了刚刚序列化的 `Example` 对象，并将其赋值给一个新的对象 `newObj`。然后，我们打印出了原始对象和反序列化后的对象。可以看到，在反序列化后，`age` 字段的值被恢复为其默认值 0。
![就这玩意儿](https://pic3.zhimg.com/v2-66dfb461d985bfc7acf202db378041ee_b.webp)

## 使用场景
- 序列化敏感数据
    - 有些对象包含一些敏感信息，如密码、访问令牌等，这些信息在对象序列化时需要被保护，以防被未授权的用户访问和泄露。

- 提高序列化性能
    - 有些对象中的字段可能会影响序列化和反序列化的性能，如包含大量数据的对象，这些数据可能会在网络传输或磁盘存储期间增加延迟和负载，使用 transient 关键字可以排除这些字段，提高序列化性能。

- 临时数据
    - 有些字段仅用于对象的内部计算或临时存储数据，这些数据在序列化时无需保留，因此可以使用 transient 关键字来忽略这些字段，从而减少序列化后对象的大小。

- 需要注意的点
    - `transient`关键字只能修饰变量，而不能修饰方法和类。
    - `transient`标记的变量所在的类必须实现Serializable接口。
    - `transient`标记的变量在反序列化时会被初始化为默认值，需要在程序中手动进行初始化操作。

## 总结
transient 关键字只是暂时地在序列化过程中忽略了该字段，而不是永久性地从对象中删除该字段。在反序列化时，该字段将被恢复为其默认值。因此，如果需要永久地从对象中删除一个字段，直接将其从类中完全删除。

