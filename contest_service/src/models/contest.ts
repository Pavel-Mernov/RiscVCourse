
export interface Contest {
  id: string
  deadline?: string
  title: string
  description?: string
}

export interface ContestCreate {
  title: string
  deadline?: string
  description?: string
}
