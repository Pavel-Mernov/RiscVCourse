
export interface Contest {
  id: string
  deadline?: string
  authorized_only ?: boolean
  title: string
  description?: string
  number ?: number
  is_active : boolean
}

export type ContestCreate = Omit<Contest, 'id'>
