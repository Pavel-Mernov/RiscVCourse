import { Stack, Typography } from "@mui/material"
import Navbar from "../components/navbar"
import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"

type AnswerType = 'theory' | 'choice' | 'text' | 'code'

interface Task {
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

export default () => {

    const { id } = useParams()

    const [task, setTask] = useState<Task | { error : any } | undefined>(undefined)

    useEffect(() => {
        const fetchTask = async () => {
            const PORT = 3002
            const url = `http://localhost:${PORT}/api/tasks/${id}`    
            const method = 'GET'

            const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
            
            })
            .then(resp => resp.json()) 
            
            console.log(response)

            setTask(response)
        }

        fetchTask()
    }, [])    

    if (!task) {
        return (
            <Stack>
                <Navbar />

            </Stack>
        )        
    }

    if ('error' in task) {
        return (
            <Stack>
                <Navbar />

                <Typography
                    variant="h2"
                    alignSelf='center'
                    marginTop='150px'
                >
                    Задача не найдена
                </Typography>
            </Stack>
        )        
    }

    return (
        <Stack>
            <Navbar />

            <Stack
                marginTop='150px'
                alignSelf='center'
                maxWidth='80%'
                spacing='50px'>

                <Typography
                    variant="h2"
                    marginTop='150px'
                >
                    {'Задача. ' + task.name}
                </Typography>  

                <Typography
                    variant='body1'
                    marginTop='150px'
                    fontSize='24px'
                    textAlign='justify'
                    style={{ whiteSpace : 'pre-line' }}
                >
                    {task.text}
                </Typography>
            </Stack>
        </Stack>
    )
}