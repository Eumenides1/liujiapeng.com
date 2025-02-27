---
title: J.A.R.V.I.S智能客服核心 - 理论篇
date: 2023-05-11T23:00:00Z
lang: zh
duration: 60min
plum: true
---

我们已经到了2023年，你难道还没有听说过ChatGPT吗！

到底什么是ChatGPT？

是一个问答系统？它拥有强大的搜索功能；在这个信息爆炸的时代，ChatGPT可以帮助你快速找到你需要的信息。

是一个搜索引擎？ChatGPT可以根据你的搜索关键词，自动匹配并推荐相关的答案。这让你可以省去繁琐的手动搜索，节省时间和精力。

是一个Ai工具？ChatGPT还可以学习用户的搜索习惯和反馈，逐渐提高自己的搜索准确度和效率。这使得ChatGPT成为了一个越用越顺手的工具。

无论是谁，相信在第一次使用ChatGPT的时候，都惊艳于他的智能；那么然后呢？我能用他做什么呢？提高工作效率，增加摸鱼时间？但其实在使用过程中你会发现，GPT提供的答案偶尔是天马行空的，Check Answer的心智负担增加了；再者，ChatGPT惊艳的编码功能也只局限于单文件，单问题，他确实带来了一些效能提升，但是说释放生产力，还有一定的距离。

Ai元年，跨时代的产物，就这？

## 所以，他还可以做什么？

不知道，你在使用完ChatGPT后，有想到用他来做什么呢？去做一个号商 😂去做一个手摸手教你申请账号的韭菜老师？ 🙅🏻哒咩！

不得不说，行业属性是一个程序猿工作之后脱不掉的标签；我原就职于一个大型连锁餐饮品牌的数字化业务中心，也就是客服中心；对于餐饮客服的敏感度还是有的，我第一时间想到的就是**智能客服。**

现在的客服是如何工作的，以Yum的在线客服为例，前置会有一道上时代Ai智能客服，通过多轮的对话，获取所需数据，调用业务API去获取结果，处理部分业务；如果无法检索到或者业务敏感则转人工处理，对于人工客服，他们会有一个知识库，积年累月的沉淀了客服所能遇到的大部分问题，当用户提问，客服就去知识库中手动搜索，然后回复给客户。

新Ai时代，ChatGPT是否能够作为前置Ai，解决掉用户大部分的问题，释放客服人力呢？答案当然是可以的，通过上面的描述，很明显，我们需要解决的问题其实不多，如何让Ai能去读我们自定义的知识库以及如何让Ai能够知道什么样的问题去寻找怎样的答案。

理论存在，实践开始！

## 从搜索功能说起

传统的搜索引擎是通过分析网页内容和链接来为用户提供有关搜索词的结果。 对于像腾讯、百度这样的大公司有很多内部复杂的策略和模型，通过复杂的算法使用大量的数据来分析用户的搜索历史，地理位置和其他因素，以便提供更加个性化的搜索结果。此外，搜索引擎还可以使用自然语言处理技术来理解用户的意图，从而提供更加精确的搜索结果。

但通俗来讲，在不引入Ai算法之前，基础的搜索引擎就是使用Elasticsearch的先分词再倒排索引的办法来进行搜索的。简单来说，对于“芝士猪柳蛋帕尼尼”(ps:👻还挺好吃的)拆分成“芝士”，“猪柳”，“蛋”，“帕尼尼”，每个标题都是这样切分。然后，建立一个索引，比如“芝士”这个词，出现过的标题的编号，都按编号顺序跟在气质后面。其他的词也类似。

然后，当用户搜索的时候，比如用户搜索“芝士帕尼尼”，也会拆分成“芝士”和“帕尼尼”两个词。然后就根据这两个词，找到包含这些词的标题，根据出现的词的数量、权重等等找出一些商品。

但是，这个策略有一个缺点，就是如果我们有同义词，那么这么简单地去搜索是搜不到的。比如，我们如果搜“牛柳蛋帕尼尼”，虽然语义上很接近，但是因为“牛柳”这个词在这个商品标题里都没有出现，所以就没有办法匹配上了。为了提升搜索效果，你就得做更多的工程研发工作，比如找一个同义词表，把标题里出现的同义词也算上等等。

这时候，ChatGPT的Embedding就来了～

## 如何让Ai搜索更智能-Embedding

什么是Embedding？他是将离散的数据转换为连续的向量表示，即将对象映射到一个低维向量空间中。在自然语言处理中，可以将每个单词或字符转换为一个向量表示，使得计算机可以更好地处理自然语言。而ChatGPT中的Embedding是指将单词转换为向量表示的过程，其中采用的是Transformer模型，能够在保留上下文信息的同时，将每个单词表示为一个固定长度的向量。

说人话就是说：我们就可以把一段文本的语义表示成一段向量。而向量之间是可以计算距离的，如果我们把用户的搜索，也通过 Embedding 接口变成向量。然后把它和所有的商品的标题计算一下余弦距离，找出离我们搜索词最近的几个向量。那最近的几个向量，其实就是语义和这个商品相似的，而并不一定需要相同的关键词。

---

## 如何让Ai获取外部资料库-\***\*Llama Index\*\***

有些信息和问题我们只想提供给自己公司的内部使用，并不想开放给所有人。这个时候，我们既希望能够利用 OpenAI 的大语言模型的能力，但是又需要这些能力仅仅在我们自己指定的数据上。那么这个问题如何解决呢？

在使用GPT的时候，不知道你有没有问过他“马云的儿子是谁”，不同人问的这个问题，会得到不同的各种答案，之所以会出现这样的情况，和大模型的原理以及它使用训练的数据集是有关的。大语言模型的原理，就是利用训练样本里面出现的文本的前后关系，通过前面的文本对接下来出现的文本进行概率预测。如果类似的前后文本出现得越多，那么这个概率在训练过程里会收敛到少数正确答案上，回答就准确。如果这样的文本很少，那么训练过程里就会有一定的随机性，对应的答案就容易似是而非。而在 GPT-3 的模型里，虽然整体的训练语料很多，但是中文语料很少。只有不到 1% 的语料是中文的，所以如果问很多中文相关的知识性或者常识性问题，它的回答往往就很扯。

当然，你可以说我们有一个解决办法，就是多找一些高质量的中文语料训练一个新的模型。或者，对于我们想让 AI 能够回答出来的问题，找一些数据。然后利用 OpenAI 提供的“微调”（Fine-tune）接口，在原来的基础上训练一个新模型出来。

这样当然是可以的，就是成本有点高。对于上面那个例子来说，只是缺少一些文本数据，还好说。如果是时效性要求比较强的资讯类的信息，就很难这么做。比如，我们想让 AI 告诉我们十分钟前用户下了一单KFC订单，我们不太可能每隔几分钟就单独训练或者微调一下模型，那样干的成本太高了。

### Bing是如何做的

有朋友会说，之前微软不是在 Bing 这个搜索引擎里，加上了 ChatGPT 的问答功能吗？效果似乎也还不错，那 Bing 是怎么做到的呢，是因为他们用了更加厉害的语言模型吗？

虽然我并没有什么内幕消息，不了解 Bing 是怎么做的。但是如果是我的话，会用这样一个解决办法——那就是先搜索，后提示（Prompt）。

- 我们先通过搜索的方式，找到和询问的问题最相关的语料。这个搜索过程中，我们既可以用传统的基于关键词搜索的技术，也可以用 Embedding 的相似度进行语义搜索的技术。
- 然后，我们将和问题语义最接近的前几条内容，作为提示语的一部分给到 AI。然后请 AI 参考这些内容，再来回答这个问题。

这也是利用大语言模型的一个常见模式。因为大语言模型其实内含了两种能力。

- 第一种，是海量的语料中，本身已经包含了的知识信息。比如，我们前面问 AI 鱼香肉丝的做法，它能回答上来就是因为语料里已经有了充足的相关知识。我们一般称之为“世界知识”。
- 第二种，是根据你输入的内容，理解和推理的能力。这个能力，不需要训练语料里有一样的内容。而是大语言模型本身有“思维能力”，能够进行阅读理解。这个过程里，“知识”不是模型本身提供的，而是我们找出来，临时提供给模型的。如果不提供这个上下文，再问一次模型相同的问题，它还是答不上来的。

### 通过 llama_index 封装“第二大脑”

我给上面这种先搜索、后提示的方式，取了一个名字，叫做 AI 的“第二大脑”模式。因为这个方法，需要提前把你希望 AI 能够回答的知识，建立一个外部的索引，这个索引就好像 AI 的“第二个大脑”。每次向 AI 提问的时候，它都会先去查询一下这个第二大脑里面的资料，找到相关资料之后，再通过自己的思维能力来回答问题。实际上，你现在在网上看到的很多读论文、读书回答问题的应用，都是通过这个模式来实现的。那么，现在我们就来自己实现一下这个“第二大脑”模式。

不过，我们不必从 0 开始写代码。因为这个模式实在太过常用了，所以有人为它写了一个开源 Python 包，叫做 llama-index。

这是一段使用的基本示例：

```python
import openai, os
from llama_index import GPTVectorStoreIndex, SimpleDirectoryReader

openai.api_key = os.environ.get("OPENAI_API_KEY")

documents = SimpleDirectoryReader('./data/mr_fujino').load_data()
index = GPTSimpleVectorIndex.from_documents(documents)

index.save_to_disk('index_mr_fujino.json')
```

- 首先，我们通过一个叫做 SimpleDirectoryReader 的数据加载器，将整个./data/mr_fujino 的目录给加载进来。这里面的每一个文件，都会被当成是一篇文档。
- 然后，我们将所有的文档交给了 GPTSimpleVectorIndex 构建索引。顾名思义，它会把文档分段转换成一个个向量，然后存储成一个索引。
- 最后，我们会把对应的索引存下来，存储的结果就是一个 json 文件。后面，我们就可以用这个索引来进行相应的问答。

---

## 如何链式调用

整个ChatGPT对外其实只提供了简简单单的 Completion 和 Embedding 这样两个核心接口；通过组合这两个接口，其实已经能够做很多事情了

- 通过提示语（Prompt）里包含历史的聊天记录，我们能够让 AI 根据上下文正确地回答问题。
- 通过将 Embedding 提前索引好存起来，我们能够让 AI 根据外部知识回答问题。
- 通过多轮对话，将 AI 返回的答案放在新的问题里，我们能够让 AI 帮我们给自己的代码撰写单元测试。

这些方法，也是一个实用的自然语言类应用里常见的模式。我之前也都通过代码为你演示过具体的做法。但是，如果我们每次写应用的时候，都需要自己再去 OpenAI 提供的原始 API 里做一遍，那就太麻烦了。于是，开源社区就有人将这些常见的需求和模式抽象了出来，开发了一个叫做 Langchain 的开源库。

### 链式调用有什么用

我们知道，GPT-3 的基础模型里面，中文的语料很少。用中文问它问题，很多时候它回答得不好。所以有时候，我会迂回处理一下，先把中文问题给 AI，请它翻译成英文，然后再把英文问题贴进去提问，得到一个英文答案。最后，再请 AI 把英文答案翻译回中文，但是每次都需要去提问三次，对于我们来说，实在是一个不太友好且成本很高的事情。

如果用 API 来实现这个过程，其实就是一个链式调用的过程。

- 我们先调用 OpenAI，把翻译请求和原始问题组合在一起发送给 AI，完成问题的中译英。
- 然后再把拿到的翻译好的英文问题发送给 OpenAI，得到英文答案。
- 最后再把英文答案，和对应要求 AI 翻译答案的请求组合在一起，完成答案的英译中。

```python
import openai, os
from langchain.prompts import PromptTemplate
from langchain.llms import OpenAI
from langchain.chains import LLMChain

openai.api_key = os.environ.get("OPENAI_API_KEY")

llm = OpenAI(model_name="text-davinci-003", max_tokens=2048, temperature=0.5)

en_to_zh_prompt = PromptTemplate(
    template="请把下面这句话翻译成英文： \n\n {question}?", input_variables=["question"]
)

question_prompt = PromptTemplate(
    template = "{english_question}", input_variables=["english_question"]
)

zh_to_cn_prompt = PromptTemplate(
    input_variables=["english_answer"],
    template="请把下面这一段翻译成中文： \n\n{english_answer}?",
)

question_translate_chain = LLMChain(llm=llm, prompt=en_to_zh_prompt, output_key="english_question")
english = question_translate_chain.run(question="请你作为一个数据安全的专家，介绍一下casb的原理。")
print(english)

qa_chain = LLMChain(llm=llm, prompt=question_prompt, output_key="english_answer")
english_answer = qa_chain.run(english_question=english)
print(english_answer)

answer_translate_chain = LLMChain(llm=llm, prompt=zh_to_cn_prompt)
answer = answer_translate_chain.run(english_answer=english_answer)
print(answer)
```

```python
Please explain the principle of CASB as an expert in data security.

CASB (Cloud Access Security Broker) is a security technology that helps organizations protect data stored in cloud applications and services. It provides visibility and control over cloud usage, allowing organizations to monitor, enforce, and protect their data in the cloud. CASB works by creating a secure bridge between the cloud and the organization's existing security policies and tools. It provides organizations with real-time insights into user activity and access to data, allowing them to detect and prevent unauthorized access and malicious activity. CASB also offers a range of security capabilities, such as data loss prevention, encryption, malware detection, and access control. By providing a comprehensive security solution for cloud environments, CASB helps organizations protect their data and maintain compliance with regulatory requirements.

CASB（云访问安全经纪人）是一种帮助组织保护存储在云应用程序和服务中的数据的安全技术。它提供了对云使用的可见性和控制，使组织能够监控，执行和保护云中的数据。CASB通过在云和组织现有安全策略和工具之间建立安全桥梁来工作。它为组织提供实时的用户活动和数据访问洞察，使其能够检测和防止未经授权的访问和恶意活动。CASB还提供了一系列安全功能，如数据丢失预防，加密，恶意软件检测和访问控制。通过为云环境提供全面的安全解决方案，CASB帮助组织保护其数据并符合监管要求。
```

这里的代码，我们使用了 Langchain 这个库，不过还没有动用它的链式调用过程。我们主要用了 Langchain 的三个包。

- LLM，也就是我们使用哪个大语言模型，来回答我们提出的问题。在这里，我们还是使用 OpenAIChat，也就是最新放出来的 gpt-3.5-turbo 模型。
- PromptTemplate，它可以定义一个提示语模版，里面能够定义一些可以动态替换的变量。比如，代码里的 question_prompt 这个模版里，我们就定义了一个叫做 question 的变量，因为我们每次问的问题都会不一样。事实上，llamd-index 里面的 PromptTemplate 就是对 Langchain 的 PromptTemplate 做了一层简单的封装。
- 主角 LLMChain，它的构造函数接收一个 LLM 和一个 PromptTemplate 作为参数。构造完成之后，可以直接调用里面的 run 方法，将 PromptTemplate 需要的变量，用 K=>V 对的形式传入进去。返回的结果，就是 LLM 给我们的答案。

不过如果看上面这段代码，我们似乎只是对 OpenAI 的 API 做了一层封装而已。我们构建了 3 个 LLMChain，然后按照顺序调用，每次拿到答案之后，再作为输入，交给下一个 LLM 调用。感觉好像更麻烦了，没有减少什么工作量呀？

别着急，这是因为我们还没有真正用上 LLMChain 的“链式调用”功能，而用这个功能，只需要加上一行小小的代码。我们用一个叫做 SimpleSequentialChain 的 LLMChain 类，把我们要按照顺序依次调用的三个 LLMChain 放在一个数组里，传给这个类的构造函数。

然后对于这个对象，我们调用 run 方法，把我们用中文问的问题交给它。这个时候，这个 SimpleSequentialChain，就会按照顺序开始调用 chains 这个数组参数里面包含的其他 LLMChain。并且，每一次调用的结果，会存储在这个 Chain 构造时定义的 output_key 参数里。而下一个调用的 LLMChain，里面模版内的变量如果有和之前的 output_key 名字相同的，就会用 output_key 里存入的内容替换掉模版内变量所在的占位符。

这次，我们只向这个 SimpleSequentialChain 调用一次 run 方法，把一开始的问题交给它就好了。后面根据答案去问新的问题，这个 LLMChain 会自动地链式搞定。我在这里把日志的 Verbose 模式打开了，你在输出的过程中，可以看到其实这个 LLMChain 是调用了三次，并且中间两次的返回结果你也可以一并看到。

```python
from langchain.chains import SimpleSequentialChain

chinese_qa_chain = SimpleSequentialChain(
    chains=[question_translate_chain, qa_chain, answer_translate_chain], input_key="question",
    verbose=True)
answer = chinese_qa_chain.run(question="请你作为一个数据安全的专家，介绍一下DSGC的原理。")
print(answer)
```

```python
> Entering new SimpleSequentialChain chain...

Please as a data security expert, introduce the principle of DSGC.

The Data Security Governance Council (DSGC) is a set of principles and best practices for organizations to consider when developing, implementing, and managing a comprehensive data security program. The DSGC focuses on the protection of personal data, the prevention of data breaches, and the enforcement of data security laws and regulations. The DSGC provides guidance on the use of technologies, processes, and policies to protect personal data and prevent data breaches. It also provides guidance on the management of data security risks, including the identification and assessment of risks, the development of risk management strategies, and the implementation of security controls. The DSGC also focuses on the enforcement of data security laws and regulations, including the development of policies and procedures to ensure compliance with applicable laws and regulations.

数据安全治理委员会（DSGC）是一套原则和最佳实践，用于组织在制定、实施和管理全面的数据安全计划时考虑的内容。DSGC专注于保护个人数据、预防数据泄露和执行数据安全法律法规。DSGC提供有关使用技术、流程和政策来保护个人数据和防止数据泄露的指导。它还提供有关管理数据安全风险的指导，包括识别和评估风险、制定风险管理策略以及实施安全控制。DSGC还专注于执行数据安全法律法规，包括制定政策和程序以确保遵守适用的法律法规。

> Finished chain.

数据安全治理委员会（DSGC）是一套原则和最佳实践，用于组织在制定、实施和管理全面的数据安全计划时考虑的内容。DSGC专注于保护个人数据、预防数据泄露和执行数据安全法律法规。DSGC提供有关使用技术、流程和政策来保护个人数据和防止数据泄露的指导。它还提供有关管理数据安全风险的指导，包括识别和评估风险、制定风险管理策略以及实施安全控制。DSGC还专注于执行数据安全法律法规，包括制定政策和程序以确保遵守适用的法律法规。
```

事实上，因为使用变量的输入输出，是用这些参数定义的。所以我们不是只能用前一个 LLMChain 的输出作为后一个 LLMChain 的输入。我们完全可以连续问多个问题，然后把这些问题的答案，作为后续问题的输入来继续处理。下面我就给你看一个例子。

```python
from langchain.chains import SequentialChain

q1_prompt = PromptTemplate(
    input_variables=["year1"],
    template="{year1}年的欧冠联赛的冠军是哪支球队，只说球队名称。"
)
q2_prompt = PromptTemplate(
    input_variables=["year2"],
    template="{year2}年的欧冠联赛的冠军是哪支球队，只说球队名称。"
)
q3_prompt = PromptTemplate(
    input_variables=["team1", "team2"],
    template="{team1}和{team2}哪只球队获得欧冠的次数多一些？"
)
chain1 = LLMChain(llm=llm, prompt=q1_prompt, output_key="team1")
chain2 = LLMChain(llm=llm, prompt=q2_prompt, output_key="team2")
chain3 = LLMChain(llm=llm, prompt=q3_prompt)

sequential_chain = SequentialChain(chains=[chain1, chain2, chain3], input_variables=["year1", "year2"], verbose=True)
answer = sequential_chain.run(year1=2000, year2=2010)
print(answer)
```

```python
> Entering new SequentialChain chain...
> Finished chain.

西班牙皇家马德里队获得欧冠的次数更多，共13次，而拜仁慕尼黑只有5次。
```

在这个例子里，我们定义了两个 PromptTemplate 和对应的 LLMChain，各自接收一个年份作为输入，回答这两个年份的欧冠冠军。然后将两个队名作为输入，放到第三个问题里，让 AI 告诉我们这两支球队哪一支获得欧冠的次数多一些。只需要在我们的 SequentialChain 里输入两个年份，就能通过三次回答得到答案。

---
