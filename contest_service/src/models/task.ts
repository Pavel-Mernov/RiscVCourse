
export type AnswerType = 'theory' | 'choice' | 'multichoice' | 'text' | 'code'

export interface ChoiceAnswers {
  correct_answer : string,
  [key : number] : string, // неправильные ответы
}

interface MultichoiceAnswer {
  answer : string,
  is_correct : boolean,
}

export interface CodeData {
  time_limit_ms?: number
  memory_limit_kb?: number
  points?: number
  attempts?: number
}

export interface TextAnswer {
  correct_answers : string[]
}

export interface Task {
  id: string
  contest_id: string
  name: string
  number_in_contest?: number
  text: string
  answer_type: AnswerType
  
  task_data ?: ChoiceAnswers | MultichoiceAnswer[] | CodeData | TextAnswer // в SQL это должно быть поле типа JSONB
}

export interface TaskCreate extends Omit<Task, 'id' | 'contest_id'> {}
