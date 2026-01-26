import { Button, Stack, Typography } from "@mui/material"
import Navbar from "../components/navbar"
import { useNavigate, useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { ContestNavPanel } from "../components/contestNavPanel"
import { useAuth } from "../context/AuthContext"
import UrlText from "../components/urlText"

type AnswerType = 'theory' | 'choice' | 'multichoice' | 'text' | 'code'

interface Task {
  id: string
  contest_id: string
  name: string
  number_in_contest?: number
  text: string
  
  answer_type: AnswerType
  
  task_data ?: object
}



export default () => {

    const { id } = useParams()

    const [task, setTask] = useState<Task | { error : any } | undefined>(undefined)

    const navigate = useNavigate()

    const { isUserValidTeacher } = useAuth()

    useEffect(() => {
        const fetchTask = async () => {
            const PORT = 3002
            const url = `http://localhost:${PORT}/api/tasks/${id}`    
            const method = 'GET'

            try {
            const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
            
            })
            .then(resp => resp.json()) 
            
            

            setTask(response)
            }
            catch {}
        }

        try {
            fetchTask()
        }
        catch {}
    }, [])    

    if (!task) {
        return (
            <Stack>
                <Navbar />

            </Stack>
        )        
    }

    if (!id || 'error' in task) {
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
                marginBottom='80px'
                spacing='50px'>

                { isUserValidTeacher() && 
                    <Button 
                        variant="outlined" 
                        onClick={() => navigate(`/tasks/${id}/edit`)}
                        sx={{ fontSize : '20px', borderWidth : '2px', alignSelf : 'end', right : '15vw' }}
                    >
                    Редактировать Задачу
                    </Button>
                } 

                <Typography
                    variant="h2"
                    marginTop='150px'
                >
                    {'Задача. ' + task.name}
                </Typography>  

                <ContestNavPanel curTaskId={id} contestId={ task.contest_id } />

                {
                    /*
                    <Typography
                        variant='body1'
                        marginTop='150px'
                        fontSize='24px'
                        textAlign='justify'
                        style={{ whiteSpace : 'pre-line' }}
                    >
                        {task.text}
                    </Typography>
                    */

                    <UrlText>
                        { task.text }
                    </UrlText>
                }
                
            </Stack>
        </Stack>
    )
}