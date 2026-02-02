import { Button, Stack, Typography } from "@mui/material"
import Navbar from "../components/navbar"
import { useNavigate, useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { ContestNavPanel } from "../components/contestNavPanel"
import { useAuth } from "../context/AuthContext"
import UrlText from "../components/urlText"
import type { ChoiceAnswers, CodeData, MultichoiceAnswers, TextAnswer } from "./CreateTaskPage"
import ChoiceTaskView from "../components/choiceTaskView"

type AnswerType = 'theory' | 'choice' | 'multichoice' | 'text' | 'code'

interface Task {
  id: string
  contest_id: string
  name: string
  number_in_contest?: number
  text: string
  
  answer_type: AnswerType
  
  task_data ?: CodeData | ChoiceAnswers | MultichoiceAnswers | TextAnswer
}



export default () => {

    const { id } = useParams()

    const [task, setTask] = useState<Task | { error : any } | undefined>(undefined)

    const navigate = useNavigate()

    const { isUserValidTeacher } = useAuth()

    useEffect(() => {
        const fetchTask = async () => {
            const PORT = 3002
            const serverIp = '130.49.150.32'
            const url = `http://${serverIp}:${PORT}/api/tasks/${id}`    
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

                {
                    task.answer_type == 'choice' && task.task_data 
                        && ('answers' in task.task_data ) && ('correct_answer' in task.task_data) &&
                            <ChoiceTaskView taskData={ task.task_data } />
                    
                }
                
            </Stack>
        </Stack>
    )
}