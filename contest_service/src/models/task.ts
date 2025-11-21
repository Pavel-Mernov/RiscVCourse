
export type AnswerType = 'theory' | 'choice' | 'text' | 'code'

export interface Task {
  id: string
  contest_id: string
  name: string
  number_in_contest?: number
  text: string
  
  answer_type: AnswerType
  time_limit_ms?: number
  memory_limit_kb?: number
  points?: number
  attempts?: number
}

export interface TaskCreate extends Omit<Task, 'id' | 'contest_id'> {}
