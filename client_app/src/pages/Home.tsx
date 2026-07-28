import { Stack, Typography } from "@mui/material"
import Navbar from "../components/navbar"
import { Description } from "../components/description"
import { useEffect, useState } from "react"
import PreviewTaskLink from "../components/previewTaskLink"
import { useServerConnection } from "../context/ServerConnectionContext"

interface Task {
    id : string,
    name : string,
    text : string,
}

export default () => {

    const id_s = [
        '9213778a-cdc7-4819-90a8-470b4b2aa255',
        '3d99d423-37dd-4885-91d2-e241b35d7f6f',
        '6dfbc7cb-071e-4988-80c2-dbe05395627d',
        'a63f4620-cc04-4f11-a797-bbb6f31725b3',
    ]


    const [tasks, setTasks] = useState<Task[]>([])

    const { serverIp, contest } = useServerConnection()

    const fetchTask = async (taskId : string, setTask : (task : Task) => void) => {
        try {
                
                const url = `https://${serverIp}/${contest}/api/tasks/${taskId}`    
                const method = 'GET'

                const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                
                })
                .then(resp => resp.json()) 
                
                if ('error' in response) {
                    return
                }

                

                setTask(response)
        }
        catch {}
    }

    useEffect(() => { 
        
        const fetchTasks = async () => {
            const newTasks : Task[] = []

            for (const id of id_s) {
                await fetchTask(id, task => { 
                    if (task) { 
                        newTasks.push(task)
                    }
                })
            }

            setTasks(newTasks)
        }

        fetchTasks()
    }, [])

    return <Stack
        // spacing='120px'
        paddingBottom='150px'
    >
        <Navbar />    

        <Description />

        <Stack
            marginTop='180px'
            spacing='40px'
        >
        { (tasks.length > 0) &&
        
        <Typography
            
            variant="h2"
            fontWeight='bold'
            fontSize='40px'
            alignSelf='center'
        >
            Задачи
        </Typography>
        }

        {
            tasks.map( task => <PreviewTaskLink key={task.id} task={task} maxTextLength={600} />)
        }

        </Stack>

        
    </Stack>
}