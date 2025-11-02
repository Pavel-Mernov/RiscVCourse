
export type AnswerType = 'theory' | 'choice' | 'text' | 'code'

export interface Task {
  id: string
  contestId: string
  name: string
  numberInContest?: number
  text: string
  deadline?: string
  answerType: AnswerType
  timeLimitMs?: number
  memoryLimitKb?: number
  points?: number
  attempts?: number
}

export interface TaskCreate extends Omit<Task, 'id' | 'contestId'> {}
