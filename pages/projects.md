---
title: Projects - Jaguarliu
display: Projects
description: List of projects that I am proud of
plum: true
wrapperClass: "text-center"
projects:
  Latest:
    - name: "瑶池-yaoci"
      link: "https://github.com/Eumenides1/yaoci"
      desc: "Go 语言实现的 高性能 非关系型数据库 "
      icon: "i-material-symbols:shutter-speed-rounded"
    - name: "ashbur-db-router"
      link: "https://gitee.com/ashbur-e/ashbur-db-router-spring-boot-starter"
      desc: "基于Hash扰动的数据库分库分表组件"
      icon: "i-logos:mysql saturate-0"
    - name: "chat-api-go"
      link: "https://gitee.com/ashbur-e/chatbot-api-go"
      desc: "go-知识星球智能AI助手"
      icon: "i-mdi:robot"
    - name: "rookie news"
      link: "https://gitee.com/ashbur-e/rookie-news"
      desc: "Spring Cloud 自媒体网站"
      icon: "i-logos:designernews"
  Game:
    - name: "扫雷"
      link: "https://minseweeper.jaguarliu.me/"
      desc: "扫雷小游戏～休闲一下"
      icon: "i-arcticons:minesweeper"
    - name: "汉兜"
      link: "https://handle.jaguarliu.me/"
      desc: "A Chinese Hanzi variation of Wordle"
      icon: "i-carbon-scatter-matrix"
  开源AI:
    - name: "DeepSpeed"
      link: "https://github.com/microsoft/DeepSpeed"
      desc: "微软推出用于个人的ChatGPT模型，传闻性能飞快，成本低"
      icon: "i-mdi:microsoft-dynamics-365"
    - name: "full-body keyboard"
      link: "https://github.com/everythingishacked/Semaphore"
      desc: "微软推出用于个人的ChatGPT模型，传闻性能飞快，成本低"
      icon: "i-icon-park:enter-the-keyboard"
    - name: "Chat2Stats"
      link: "https://chart.2stats.chat/"
      desc: "一款基于人工智能技术的数据分析平台"
      icon: "i-carbon:data-reference"
    - name: "JARVIS"
      link: "https://github.com/microsoft/JARVIS"
      desc: "微软推出的私人智能管家"
      icon: "i-mdi:robot-confused-outline"
---

<ListProjects :projects="frontmatter.projects" />
