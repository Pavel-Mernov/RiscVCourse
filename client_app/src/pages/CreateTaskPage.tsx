import { Navigate, useNavigate, useParams } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { Button, colors, InputLabel, MenuItem, Select, Stack, TextField, Typography } from "@mui/material"
import Navbar from "../components/navbar"
import { useEffect, useState } from "react"
import ChoiceAnswersEditor from "../components/choiceAnswersEditor"
import MultichoiceEditor from "../components/multichoiceEditor"
import TextAnswersEditor from "../components/textAnswersEditor"
import CodeTaskEditor from "../components/codeTaskEditor"

type AnswerType = 'theory' | 'choice' | 'multichoice' | 'text' | 'code'

type AnswerTypeNames = {
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

const answerTypeNames : AnswerTypeNames = {
    theory: "Теория",
    choice: "Выбор одного ответа",
    multichoice : 'Выбор нескольких ответов',
    text : 'Ввод текстового ответа',
    code : 'Задача на программирование'
}

export interface ChoiceAnswers {
  correct_answer : number,
  answers : [string, ...string[]], // все ответы
  points?: number
  attempts?: number
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
  correct_answers : [string, ...string[]]
  points?: number
  attempts?: number
}

interface TaskCreate {

  contest_id: string
  name: string
  number_in_contest?: number
  text: string
  
  answer_type: AnswerType
  
  task_data ?: CodeData | ChoiceAnswers | MultichoiceAnswers | TextAnswer
}

export interface Test {
    id ?: string
    input ?: string
    expected_output : string
}

export default () => {
    const { isTokenValid, isUserValidTeacher, accessToken } = useAuth()
    const navigate = useNavigate()
    const { contestId } = useParams()
    const [contestFound, setContestFound] = useState(false)
    const [isContestForAuthorizedOnly, setContestForAuthorizedOnly] = useState(false)

    const [name, setName] = useState('')
    const [nameError, setNameError] = useState(false)

    const [text, setText] = useState('')
    const [textError, setTextError] = useState(false)

    const [answer_type, setAnswerType] = useState<AnswerType>('theory')

    const [taskAnswers, setTaskAnswers] = useState<TaskAnswers>(defaultTaskAnswers)

    const [tests, setTests] = useState<Test[]>([])

    const setChoiceAnswers = (answer : ChoiceAnswers) => {
        
        const newAnswer : ChoiceAnswers = isContestForAuthorizedOnly ? 
            answer : { ...answer, points : undefined, attempts : undefined }

        const newTaskAnswers = { ...taskAnswers, choice : newAnswer } as TaskAnswers

        setTaskAnswers(newTaskAnswers)
    }

    const setMultichoiceAnswers = (answer : MultichoiceAnswers) => {

        const newAnswer : MultichoiceAnswers = isContestForAuthorizedOnly ? 
            answer : { ...answer, points : undefined, attempts : undefined }

        const newAnswers : TaskAnswers = { ...taskAnswers, multichoice : newAnswer }

        setTaskAnswers(newAnswers)
    }

    const setTextAnswers = (answer : TextAnswer) => {

        const newAnswer : TextAnswer = isContestForAuthorizedOnly ? 
            answer : { ...answer, points : undefined, attempts : undefined }

        const newAnswers : TaskAnswers = { ...taskAnswers, text : newAnswer }

        setTaskAnswers(newAnswers)
    }

    const setCodeData = (answer : CodeData) => {

        const newData : CodeData = isContestForAuthorizedOnly ? 
            answer : { ...answer, points : undefined, attempts : undefined }

        const newAnswers : TaskAnswers = { ...taskAnswers, code : newData }

        setTaskAnswers(newAnswers)
    }

    useEffect(() => { 
        const findContest = async () => {
            if (!contestId) {
                setContestFound(false)
                return
            }

            if (contestFound) {
                return
            }

            const serverIp = '130.49.150.32'
            const PORT = 3002
            const url = `http://${serverIp}:${PORT}/api/contests/${contestId}/tasks`    
            const method = 'GET'

            const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
            
            })
            .then(resp => resp.json())
            
            if ('error' in response) {
                setContestFound(false)
                setContestForAuthorizedOnly(false)
                return
            }
            else {
                setContestFound(true)

                if ('authorized_only' in response && response.authorized_only) {
                    setContestForAuthorizedOnly(true)
                } 

                return
            }
        }

        findContest()
    }, [])

    if (!contestId || !contestFound) {
        return (
            <Stack
                spacing='150px'
            >
                <Navbar />

                <Typography 
                    variant="h2" 
                    fontSize='30px' 
                    fontWeight='semiBold'
                >                    
                    Контест не найден
                </Typography>                
            </Stack>            
        )
    }

    if (!accessToken || !isTokenValid()) {
        return <Navigate to='/login' />
    }

    if (!isUserValidTeacher()) {
        return (
            <Stack
                spacing='150px'
            >
                <Navbar />

                <Typography 
                    variant="h2" 
                    fontSize='30px' 
                    alignSelf='center'
                    fontWeight='bold'
                >                    
                    403 Доступ Запрещён
                </Typography>                
            </Stack>
        )
    }

    const fetchAddTask = async () => {
                        if (!name ) {
                            setNameError(true)
                            return
                        }

                        if (!text ) {
                            setTextError(true)
                            return
                        }


                        const newTask : TaskCreate = {
                            name,
                            text,
                            contest_id: contestId,
                            answer_type,
                            task_data : taskAnswers[answer_type as Exclude<AnswerType, 'theory'>]
                        }

                        const PORT = 3002
                        const serverIp = '130.49.150.32'
                        const url = `http://${serverIp}:${PORT}/api/contests/${contestId}/tasks`

                        const addedTask = await fetch(url, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer: ${accessToken}`,
                            },
                            body: JSON.stringify(newTask),
                            
                        })
                        .then( resp => resp.json() )

                        if ('error' in addedTask) {
                            return
                        }

                        const taskId = addedTask.id
                        
                        console.log(JSON.stringify(addedTask))

                        if (answer_type == 'code') {
                            tests.forEach(async test => {

                                const url = `http://${serverIp}:${PORT}/api/tasks/${taskId}/tests`

                                await fetch(url, {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': `Bearer: ${accessToken}`,
                                    },
                                    body: JSON.stringify(test),
                                    
                                })
                                .then( resp => resp.json() )
                            })
                        }

                        navigate(-1)
                    }

    return (
        <Stack
            spacing='150px'
        >
            <Navbar />

            <Stack
                spacing='40px'
                alignSelf='center'
                width='75%'
            >
                <Button
                    variant="outlined"
                    
                    sx={{ maxWidth : '300px', fontWeight : 'bold', fontSize : '18px' }}
                    onClick={() => { navigate(-1) }}
                >
                    Назад
                </Button>

                <TextField 
                    sx={{marginTop: '50px', background : 'white'}} 
                    variant="filled" 
                    value={name} 
                    onChange={(e) => { 
                        setNameError(false)
                        setName(e.target.value) 
                    }} 
                    label="Введите название задачи" 
                    helperText={ nameError ? "Название задачи не может быть пустым" : "" }
                    error={nameError}    
                />
                
                <TextField 
                    sx={{marginTop: '50px', background : 'white'}} 
                    variant="filled" 
                    multiline
                    rows={5}
                    value={text} 
                    onChange={(e) => { 
                        setTextError(false)
                        setText(e.target.value) 
                    }} 
                    label="Введите текст задачи" 
                    helperText={ textError ? "Текст задачи не может быть пустым" : "" }
                    error={textError}    
                />

                <Stack spacing='10px'>
                    <InputLabel id="select-type">Выберите тип задачи</InputLabel>
                    <Select
                        labelId="select-type"
                        value={answer_type}
                        label="Выберите тип задачи"
                        onChange={e => setAnswerType(e.target.value)}
                    >
                        {
                            Object.keys(answerTypeNames).map(answer_type => {
                                return <MenuItem 
                                    key={ answer_type } 
                                    value={ answer_type }>
                                        { answerTypeNames[answer_type as AnswerType] }
                                    </MenuItem>
                            })
                        }
                    </Select>
                </Stack>
                
                {
                    (answer_type == 'choice') &&
                        <ChoiceAnswersEditor 
                            enableSetPointsAndAttempts={ isContestForAuthorizedOnly }
                            setChoiceAnswers={setChoiceAnswers}
                            choiceAnswers={taskAnswers.choice} 
                        />
                }

                {
                    (answer_type == 'multichoice') &&
                        <MultichoiceEditor 
                            enableSetPointsAndAttempts={ isContestForAuthorizedOnly }
                            setAnswers={setMultichoiceAnswers}
                            multichoiceAnswers={taskAnswers.multichoice} 
                        />
                }

                {
                    (answer_type == 'text') &&
                        <TextAnswersEditor 
                            enableSetPointsAndAttempts={ isContestForAuthorizedOnly }
                            setAnswers={setTextAnswers}
                            answers={taskAnswers.text} 
                        />
                }

                {
                    (answer_type == 'code') &&
                        <CodeTaskEditor 
                            enableSetPointsAndAttempts={isContestForAuthorizedOnly} 
                            taskData={taskAnswers.code} 
                            setData={setCodeData} 
                            tests={tests} 
                            setTests={setTests}                            
                        />
                }

                <Button 
                    sx={{ background : colors.green[500], fontSize : '24px', fontWeight : 'bold' }}
                    variant="contained"
                    onClick={fetchAddTask}
                >
                    Добавить задачу
                </Button>
            </Stack>
        </Stack>
    )
}