export interface Post {
  path: string
  title: string
  date: string
  lang?: string
  desc?: string
  platform?: string
  duration?: string
  recording?: string
  upcoming?: boolean
}

export interface Reference {
  type: string
  title: string
  icon: string
  link: string
}
