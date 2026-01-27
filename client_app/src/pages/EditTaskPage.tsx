import { colors, Stack, TextField, Typography } from "@mui/material"
import Button from "@mui/material/Button"
import { useState, useEffect } from "react"
import { useNavigate, useParams, Navigate } from "react-router-dom"
import Navbar from "../components/navbar"
import { useAuth } from "../context/AuthContext"

type AnswerType = 'theory'

interface TaskUpdate {

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
    const { id } = useParams()
    const [taskFound, setTaskFound] = useState(false)

    const [name, setName] = useState('')
    const [nameError, setNameError] = useState(false)

    const [text, setText] = useState('')
    const [textError, setTextError] = useState(false)

    const [contest_id, setContestId] = useState('')

    useEffect(() => { 
        const findContest = async () => {
            if (!id) {
                setTaskFound(false)
                return
            }

            if (taskFound) {
                return
            }

            const serverIp = '130.49.150.32'
            const PORT = 3002
            const url = `http://${serverIp}:${PORT}/api/tasks/${id}`    
            const method = 'GET'

            const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
            
            })
            .then(resp => resp.json())
            
            if ('error' in response) {
                setTaskFound(false)
                return
            }
            else {
                setTaskFound(true)

                setName(response.name || '')
                setText(response.text || '')

                setContestId(response.contest_id || '')

                return
            }
        }

        findContest()
    }, [])

    if (!id || !taskFound) {
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

    const fetchEditTask = async () => {
                        if (!name ) {
                            setNameError(true)
                            return
                        }

                        if (!text ) {
                            setTextError(true)
                            return
                        }


                        const newTask : TaskUpdate = {
                            name,
                            text,
                            contest_id,
                            answer_type: "theory"
                        }

                        const PORT = 3002
                        const serverIp = '130.49.150.32'
                        const url = `http://${serverIp}:${PORT}/api/tasks/${id}`

                        const response = await fetch(url, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer: ${accessToken}`,
                            },
                            body: JSON.stringify(newTask),
                            
                        })  
                        
                        console.log(JSON.stringify(response))

                        navigate(-1)
                    }

    const fetchDeleteTask = async () => {

                        const PORT = 3002
                        const serverIp = '130.49.150.32'
                        const url = `http://${serverIp}:${PORT}/api/tasks/${id}`

                        const response = await fetch(url, {
                            method: 'DELETE',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer: ${accessToken}`,
                            },
                            
                        })  
                        
                        console.log(JSON.stringify(response))

                        navigate(-2)
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
                    onClick={fetchEditTask}
                >
                    Сохранить Изменения
                </Button>

                <Button 
                    sx={{ borderColor : colors.red[500], borderWidth : '1px', fontSize : '20px', color : colors.red[500] }}
                    variant="outlined"
                    onClick={fetchDeleteTask}
                >
                    Удалить задачу
                </Button>
            </Stack>
        </Stack>
    )
}