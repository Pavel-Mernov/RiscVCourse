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

    const id1 = '8895b056-6892-4374-9d62-e0c319a46713'
    const id2 = '59e305d9-daf7-4caf-ab8f-ea8d7505ef16'

    const [task1, setTask1] = useState<Task | undefined>(undefined)
    const [task2, setTask2] = useState<Task | undefined>(undefined)

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
        
        fetchTask(id1, setTask1)
    }, [])

    useEffect(() => { 
        fetchTask(id2, setTask2)
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
        { (!!task1 || !!task2) &&
        
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
            task1 && <PreviewTaskLink task={task1} maxTextLength={600} />
        }

        {
            task2 && <PreviewTaskLink task={task2} />
        }
        </Stack>

        
    </Stack>
}