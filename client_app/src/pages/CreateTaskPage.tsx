import { Navigate, useNavigate, useParams } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { Button, colors, Stack, TextField, Typography } from "@mui/material"
import Navbar from "../components/navbar"
import { useEffect, useState } from "react"

type AnswerType = 'theory'

interface TaskCreate {

  contest_id: string
  name: string
  number_in_contest?: number
  text: string
  
  answer_type: AnswerType
  
  task_data ?: object
}

export default () => {
    const { isTokenValid, isUserValidTeacher, accessToken } = useAuth()
    const navigate = useNavigate()
    const { contestId } = useParams()
    const [contestFound, setContestFound] = useState(false)

    const [name, setName] = useState('')
    const [nameError, setNameError] = useState(false)

    const [text, setText] = useState('')
    const [textError, setTextError] = useState(false)

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
                return
            }
            else {
                setContestFound(true)
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

    const fetchAddContest = async () => {
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
                            answer_type: "theory"
                        }

                        const PORT = 3002
                        const serverIp = '130.49.150.32'
                        const url = `http://${serverIp}:${PORT}/api/contests/${contestId}/tasks`

                        const response = await fetch(url, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer: ${accessToken}`,
                            },
                            body: JSON.stringify(newTask),
                            
                        })  
                        
                        console.log(JSON.stringify(response))

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

                <Button 
                    sx={{ background : colors.green[500], fontSize : '24px', fontWeight : 'bold' }}
                    variant="contained"
                    onClick={fetchAddContest}
                >
                    Добавить задачу
                </Button>
            </Stack>
        </Stack>
    )
}