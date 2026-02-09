
export type AnswerType = 'theory' | 'choice' | 'multichoice' | 'text' | 'code'

export interface ChoiceAnswers {
  correct_answer : number, // индекс правильного ответа
  answers : string[], // все ответы
  points?: number
  attempts?: number
}



interface MultichoiceAnswers {
  answers : { 
    answer : string,
    is_correct : boolean } [],
    
  points?: number
  attempts?: number
}

export interface CodeData {
  time_limit_ms?: number
  memory_limit_kb?: number
  points?: number
  attempts?: number
  tests_shown?: number
  input_data_format ?: string
  output_data_format ?: string
}

export interface TextAnswer {
  correct_answers : string[]
  points?: number
  attempts?: number
}

export interface Task {
  id: string
  contest_id: string
  name: string
  number_in_contest?: number
  text: string
  answer_type: AnswerType
  
  task_data ?: ChoiceAnswers | MultichoiceAnswers | CodeData | TextAnswer // в SQL это должно быть поле типа JSONB
}

export interface TaskCreate extends Omit<Task, 'id' | 'contest_id'> {}
