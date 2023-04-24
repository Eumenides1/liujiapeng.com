---
title: vue中的html是真实的html么
date: 2023-04-24T23:00:00Z
lang: zh
duration: 25min
---

## **在 .vue 文件的 template 中写入的 html 是真实的 html 标签节点吗？**

---

答案是：不是的！

原因非常简单，如果我们写入的是真实 `html` 节点，对于 `v-if、v-bind、keep-alive` 这些东西，浏览器明显是 **不认识** 的，所以这些东西理应无法解析。

但是现实是这些指令或组件被正确解析了，所以 **vue 一定在中间做了什么**，让 **假的 html 标签节点** 被渲染成了 **真实的 html 标签节点**。

那么 `Vue` 在中间做了什么事情呢？

简单来说可以分成两件事（排序按执行顺序）：

- 1. 编译时：`compile`
- 2. 运行时：`runtime`

这两个东西对于大家而言，可能比较陌生，但是在 [Vue 官网](https://cn.vuejs.org/guide/extras/reactivity-in-depth.html#runtime-vs-compile-time-reactivity) 中早就提到了这几个概念。

这些概念一共有三个，如果我们想要学习 `Vue` 的框架设计，那么必须要了解它们，它们分别是：

1. 运行时：`runtime`
2. 编译时：`compiler`
3. 运行时 + 编译时：`runtime + compiler`

---

## ****08：什么是运行时？****

在 `Vue 3` 的 [源代码](https://github.com/vuejs/core) 中存在一个 [runtime-core](https://github.com/vuejs/core/tree/main/packages/runtime-core) 的文件夹，该文件夹内存放的就是 **运行时** 的核心代码逻辑。

[runtime-core](https://github.com/vuejs/core/tree/main/packages/runtime-core) 中对外暴露了一个函数，叫做 **渲染函数 [render](https://v3.cn.vuejs.org/api/options-dom.html#render)**

我们可以通过 `render` 代替 `template` 来完成 `DOM` 的渲染：

```jsx
<head>
  <meta charset="UTF-8">
  <title>Document</title>
  <script src="https://unpkg.com/vue@3.2.36/dist/vue.global.js"></script>
</head>

<body>
  <div id="app"></div>
</body>

<script>
  const { render, h } = Vue
  // 生成 VNode
  const vnode = h('div', {
    class: 'test'
  }, 'hello render')

  // 承载的容器
  const container = document.querySelector('#app')

  // 渲染函数
  render(vnode, container)
</script>
```

但是，在 `Vue`的项目中，我们是通过 `tempalte`渲染 `DOM`节点，如下：

```jsx
<template>
	<div class="test">hello render</div>
</template>
```

但是对于 `render` 的例子而言，我们并没有使用 `tempalte`，而是通过了一个名字叫做 `render` 的函数，返回了一个不知道是什么的东西，为什么也可以渲染出 `DOM` 呢？

---

> 假设有一天你们领导跟你说：
> 
> 
> 我希望根据如下数据：
> 
> ```jsx
> {
> 	type: 'div',
> 	props: {
> 		class: test
> 	},
> 	children: 'hello render'
> }
> ```
> 
> 渲染出这样一个 div：
> 
> ```jsx
> <div class="test">hello render</div>
> ```
> 

针对这样的一个需求，我们可以这样做

```jsx
<script>
  const VNode = {
    type: 'div',
    props: {
      class: 'test'
    },
    children: 'hello render'
  }
  // 创建 render 渲染函数
  function render(vnode) {
    // 根据 type 生成 element
    const ele = document.createElement(vnode.type)
    // 把 props 中的 class 赋值给 ele 的 className
    ele.className = vnode.props.class
    // 把 children 赋值给 ele 的 innerText
    ele.innerText = vnode.children
    // 把 ele 作为子节点插入 body 中
    document.body.appendChild(ele)
  }

  render(VNode)
</script>
```

在这样的一个代码中，我们成功的通过一个 `render` 函数渲染出了对应的 `DOM`，和前面的 `render 示例` 类似，它们都是渲染了一个 `vnode`，你觉得这样的代码真是 妙极了！

---

## ****09：什么是编译时？****

> 但是你的领导用了一段时间你的 `render` 之后，却说：天天这样写也太麻烦了，每次都得写一个复杂的 `vnode`，能不能让我直接写 **HTML 标签结构的方式** 你来进行渲染呢？
> 
> 
> 你想了想之后，说：如果是这样的话，那就不是以上 **运行时** 的代码可以解决的了！
> 

如果只靠 **运行时**，那么是没有办法通过 **HTML 标签结构的方式**的方式来进行渲染解析的。这里需要用到编译时。

`Vue`中的编译时，更准确的说法应该是 **编译器**的意思。它的代码主要存在于 `compiler-core`
 模块下。

```jsx
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <title>Document</title>
  <script src="https://unpkg.com/vue@3.2.36/dist/vue.global.js"></script>
</head>

<body>
  <div id="app"></div>
</body>

<script>
  const { compile, createApp } = Vue

  // 创建一个 html 结构
  const html = `
    <div class="test">hello compiler</div>
  `
  // 利用 compile 函数，生成 render 函数
  const renderFn = compile(html)

  // 创建实例
  const app = createApp({
    // 利用 render 函数进行渲染
    render: renderFn
  })
  // 挂载
  app.mount('#app')
</script>

</html>
```

对于编译器而言，它的主要作用就是：**把 template 中的 html 编译成 render 函数**。然后再利用 **运行时**通过 `render`挂载对应的 `DOM`。

---

## ****10：运行时 + 编译时****

**vue 是一个 运行时+编译时**的框架！

> `vue`通过 `compiler`解析 `html`模板，生成 `render`函数，然后通过 `runtime`解析 `render`
，从而挂载真实 `dom`。
> 

既然 **compiler 可以直接解析 html 模板**，那么为什么还要生成 `render`函数，然后再去进行渲染呢？为什么不直接利用 `compiler`进行渲染呢?

那么想要理清楚这个问题，我们就需要知道 **dom 渲染是如何进行的。**

对于 `dom` 渲染而言，可以被分为两部分：

- 1. **初次渲染** ，我们可以把它叫做 **挂载**
- 2. **更新渲染** ，我们可以把它叫做 **打补丁**

---

### ****初次渲染****

那么什么是初次渲染呢？

当初始 `div` 的 `innerHTML` 为空时

```jsx
<div id="app"></div>
```

我们在该 `div`中渲染如下节点：

```jsx
<ul>
	<li>1</li>
	<li>2</li>
	<li>3</li>
</ul>
```

那么这样的一次渲染，就是 **初始渲染**。在这样的一次渲染中，我们会生成一个 `ul`标签，同时生成三个 `li`标签，并且把他们挂载到 `div`中。

---

### ****更新渲染****

如果此时如果 `ul`标签的内容发生了变化：

```jsx
<ul>
	<li>3</li>
	<li>1</li>
	<li>2</li>
</ul>
```

`li - 3` 上升到了第一位，那么此时大家可以想一下：**我们期望浏览器如何来更新这次渲染呢？**

浏览器更新这次渲染无非有两种方式：

- 1. 删除原有的所有节点，重新渲染新的节点
- 2. 删除原位置的 `li - 3`，在新位置插入 `li - 3`

哪一种方式更好呢？我们来分析一下：

1. 首先对于第一种方式而言：它的好处在于不需要进行任何的比对，需要执行 6 次（删除 3 次，重新渲染 3 次）`dom` 处理即可。
2. 对于第二种方式而言：在逻辑上相对比较复杂。他需要分成两步来做：
    1. 对比 **旧节点** 和 **新节点** 之间的差异
    2. 根据差异，删除一个 **旧节点**，增加一个 **新节点**

那么根据以上分析，我们知道了：

1. 第一种方式：会涉及到更多的 `dom` 操作
2. 第二种方式：会涉及到 `js` 计算 + 少量的 `dom` 操作

---

那么这两种方式，哪一种更快呢？来实验一下：

```jsx
const length = 10000
  // 增加一万个dom节点，耗时 3.992919921875 ms
  console.time('element')
  for (let i = 0; i < length; i++) {
    const newEle = document.createElement('div')
    document.body.appendChild(newEle)
  }
  console.timeEnd('element')

  // 增加一万个 js 对象，耗时 0.402099609375 ms
  console.time('js')
  const divList = []
  for (let i = 0; i < length; i++) {
    const newEle = {
      type: 'div'
    }
    divList.push(newEle)
  }
  console.timeEnd('js')
```

 从测试情况来看`dom` 的操作要比 `js` 的操作耗时多得多，即：**`dom` 操作比 `js` 更加耗费性能**。

> 首先对于第一种方式而言：它的好处在于不需要进行任何的比对，仅需要执行 6 次（删除 3 次，重新渲染 3 次）`dom` 处理即可。
> 
> 
> 对于第二种方式而言：在逻辑上相对比较复杂。他需要分成两步来做：
> 
> 1. 对比 **旧节点** 和 **新节点** 之间的差异
> 2. 根据差异，删除一个 **旧节点**，增加一个 **新节点**

---

1. 针对于 **纯运行时** 而言：因为不存在编译器，所以我们只能够提供一个复杂的 `JS` 对象。
2. 针对于 **纯编译时** 而言：因为缺少运行时，所以它只能把分析差异的操作，放到 **编译时** 进行，同样因为省略了运行时，所以速度可能会更快。但是这种方式这将损失灵活性（具体可查看第六章虚拟 `DOM` ，或可点击 [这里](https://v3.cn.vuejs.org/guide/render-function.html#%E6%B8%B2%E6%9F%93%E5%87%BD%E6%95%B0) 查看官方示例）。比如 [svelte](https://www.sveltejs.cn/) ，它就是一个纯编译时的框架，但是它的实际运行速度可能达不到理论上的速度。
3. **运行时 + 编译时**：比如 `vue` 或 `react` 都是通过这种方式来进行构建的，使其可以在保持灵活性的基础上，尽量的进行性能的优化，从而达到一种平衡。