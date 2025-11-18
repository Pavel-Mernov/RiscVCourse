
export interface Contest {
  id: string
  deadline?: string
  title: string
  description?: string
}

export type ContestCreate = Omit<Contest, 'id'>
