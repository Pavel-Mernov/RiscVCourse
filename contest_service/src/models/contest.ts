
export interface Contest {
  id: string
  deadline?: string,
  authorized_only ?: boolean,
  title: string
  description?: string
}

export type ContestCreate = Omit<Contest, 'id'>
