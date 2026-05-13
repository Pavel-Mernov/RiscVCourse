import { Button, Stack, Typography } from "@mui/material"
import Navbar from "../components/navbar"
import { useNavigate, useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { ContestNavPanel } from "../components/contestNavPanel"
import { useAuth } from "../context/AuthContext"

import ChoiceTaskView from "../components/choiceTaskView"
import MultichoiceTaskView from "../components/multichoiceTaskView"
import TextAnswersTaskView from "../components/textAnswersTaskView"
import CodeTaskView from "../components/codeTaskView"
import { useServerConnection } from "../context/ServerConnectionContext"
import type { Task, Test } from "../types/types"
import UrlText from "../components/urlText"





export default () => {

    const { id } = useParams()

    const [task, setTask] = useState<Task | { error : any } | undefined>(undefined)

    const [tests, setTests] = useState<Test[]>([])

    const [authorizedOnly, setAuthorizedOnly] = useState<boolean | undefined>(undefined)

    const [isActive, setActive] = useState(false)

    const [deadline, setDeadline] = useState<string | undefined>(undefined)

    const navigate = useNavigate()

    const { isUserValidTeacher, isTokenValid } = useAuth()

    const { serverIp, contest } = useServerConnection()

    useEffect(() => {
        const fetchTaskAndTests = async () => {
            const url = `https://${serverIp}/${contest}/api/tasks/${id}`    
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


                const contestUrl = `https://${serverIp}/${contest}/api/contests/${response.contest_id}` 
                const contestsResponse = await fetch(contestUrl, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                
                })
                .then(resp => resp.json()) 

                setAuthorizedOnly(contestsResponse.authorized_only)
                setActive(contestsResponse.is_active)
                setDeadline(contestsResponse.deadline)

                if (response.answer_type != 'code') {
                    return
                }

                const testUrl = `https://${serverIp}/${contest}/api/tasks/${id}/tests` 

                const testsData = await fetch(testUrl, {
                    method,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                
                })
                .then(resp => resp.json()) 

                if ('error' in testsData) {
                    console.log('Error fetch tests: ', testsData.error)
                }

                setTests(testsData as Test[])
            }
            catch (err : any) {
                console.log(err)
            }
        }



        try {
            fetchTaskAndTests()
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

    if ((authorizedOnly && !isTokenValid()) || (!isUserValidTeacher() && !isActive)) {
        return (
            <Stack>
                <Navbar />

                <Typography
                    variant="h2"
                    alignSelf='center'
                    marginTop='150px'
                >
                    403 Доступ запрещён
                </Typography>
            </Stack>
        )  
    }

    const { name, number_in_contest, contest_id, text  } = task

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
                    { (number_in_contest != null ? `${number_in_contest}. ` : '') + 'Задача. ' + name }
                </Typography>  

                <ContestNavPanel curTaskId={id} contestId={ contest_id } />

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
                        { text }
                    </UrlText>
                }

                {
                    task.answer_type == 'choice' && task.task_data 
                        && ('answers' in task.task_data ) && ('correct_answer' in task.task_data) &&
                            <ChoiceTaskView deadline={deadline} taskId={ task.id } taskName={name} taskData={ task.task_data } />
                    
                }

                {
                    task.answer_type == 'multichoice' && task.task_data 
                        && ('answers' in task.task_data ) && !('correct_answer' in task.task_data) &&
                            <MultichoiceTaskView deadline={deadline} taskId={ task.id } taskName={task.name} taskData={ task.task_data } />
                    
                }

                {
                    task.answer_type == 'text' && task.task_data 
                        && ('correct_answers' in task.task_data ) &&
                            <TextAnswersTaskView taskId={task.id} taskName={task.name} taskData={ task.task_data } />
                    
                }

                {
                    task.answer_type == 'code' && task.task_data 
                        &&
                            <CodeTaskView deadline={ deadline } taskId={ task.id } taskName={ task.name } 
                                taskData={task.task_data} tests={tests} />
                    
                }
                
            </Stack>
        </Stack>
    )
}