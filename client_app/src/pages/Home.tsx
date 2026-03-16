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
        '8895b056-6892-4374-9d62-e0c319a46713', 
        '751e35e8-7d78-4e10-855f-b795244dee0a',
        '14b60a3b-a237-4322-b8d4-68c9ea02a15a',
        '936722a1-a0ea-4ca8-ba00-a073867d2b4e',
        '2ab56204-7f59-4a16-9dd4-ae86c382578c',
        '59e305d9-daf7-4caf-ab8f-ea8d7505ef16',
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

                // console.log('Fetch Task. Id: ' + taskId + ' Result: ' + JSON.stringify(response))

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
            tasks.map( task => <PreviewTaskLink task={task} maxTextLength={600} />)
        }

        </Stack>

        
    </Stack>
}