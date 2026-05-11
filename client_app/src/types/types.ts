export interface Contest {
  id: string
  deadline?: string 
  title: string
  number?: number
  description?: string
  authorized_only ?: boolean
  is_active : boolean
}

export type AnswerType = 'theory' | 'choice' | 'multichoice' | 'text' | 'code'

export type AnswerTypeNames = {
    [answer_type in AnswerType] : string
}

export type TaskAnswers = {
    choice : ChoiceAnswers,
    multichoice : MultichoiceAnswers
    text : TextAnswer
    code : CodeData
}

export const defaultTaskAnswers : TaskAnswers = {
    choice : {
        correct_answer: 0,
        answers: [''],
    },
    multichoice : {
        answers: [{
            answer: "",
            is_correct: false
        }]
    },
    text : {
        correct_answers : ['']
    },
    code : {}
} as const

export interface ChoiceAnswers {
  correct_answer : number,
  answers : [string, ...string[]], // все ответы
  points?: number
}

export interface MultichoiceAnswer {
    answer : string
    is_correct : boolean
}

export interface MultichoiceAnswers {
  answers : [
    MultichoiceAnswer,
    ...MultichoiceAnswer[]],
    
  points?: number
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
  correct_answers : [string, ...string[]]
  points?: number
  attempts?: number
}

export interface TaskCreate {

  contest_id: string
  name: string
  number_in_contest?: number
  text: string
  
  answer_type: AnswerType
  
  task_data ?: CodeData | ChoiceAnswers | MultichoiceAnswers | TextAnswer
}

export type Task = TaskCreate & { id : string }

export interface Test {
    id ?: string
    input ?: string
    expected_output : string
}