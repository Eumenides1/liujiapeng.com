---
title: Projects - Jaguar Liu
display: Projects
subtitle: List of projects that I am proud of
description: List of projects that I am proud of
plum: true
projects:
  Latest:
    - name: '瑶池-yaoci'
      link: 'https://github.com/Eumenides1/yaoci'
      desc: 'Go 语言实现的 高性能 非关系型数据库 '
      icon: 'i-material-symbols:shutter-speed-rounded'
    - name: 'ashbur-db-router'
      link: 'https://gitee.com/ashbur-e/ashbur-db-router-spring-boot-starter'
      desc: '基于Hash扰动的数据库分库分表组件'
      icon: 'i-logos:mysql saturate-0'
    - name: 'chat-api-go'
      link: 'https://gitee.com/ashbur-e/chatbot-api-go'
      desc: 'go-知识星球智能AI助手'
      icon: 'i-mdi:robot'
    - name: 'rookie news'
      link: 'https://gitee.com/ashbur-e/rookie-news'
      desc: 'Spring Cloud 自媒体网站'
      icon: 'i-logos:designernews'
  Game:
    - name: '扫雷'
      link: 'https://minseweeper.jaguarliu.me/'
      desc: '扫雷小游戏～休闲一下'
      icon: 'i-arcticons:minesweeper'
    - name: '汉兜'
      link: 'https://handle.jaguarliu.me/'
      desc: 'A Chinese Hanzi variation of Wordle'
      icon: 'i-carbon-scatter-matrix'
---

<ListProjects :projects="frontmatter.projects" />
