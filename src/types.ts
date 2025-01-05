export interface Post {
  path: string
  title: string
  place?: string
  date: string
  lang?: string
  desc?: string
  platform?: string
  duration?: string
  recording?: string
  radio?: boolean
  video?: boolean
  inperson?: boolean
  redirect?: string
}

export interface Reference {
  type: string
  title: string
  icon: string
  link: string
}

export interface Algorithm {
  id: number // 唯一标识，每道题的编号
  path: string // 题目页面的路由路径
  title: string // 题目标题
  difficulty: '简单' | '中等' | '困难' // 题目难度
  tags?: string[] // 题目分类标签（如动态规划、贪心算法等）
  description?: string // 简短描述，用于快速预览
  date: string // 题目发布日期，格式：YYYY-MM-DD
  author?: string // 作者或贡献者
  timeLimit?: number // 时间限制（单位：毫秒）
  memoryLimit?: number // 内存限制（单位：MB）
  acceptedCount?: number // 已完成该题的用户数量
  status?: 'completed' | 'in-progress' | 'not-started' // 当前用户完成状态
  related?: number[] // 相关题目编号列表
  lang?: string // 语言标识，如 'zh' 或 'en'
  redirect?: string // 外部链接跳转（如果题目托管在其他平台）
}
