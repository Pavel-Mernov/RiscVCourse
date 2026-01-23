import { Stack, Typography } from "@mui/material"
import Navbar from "../components/navbar"
import { Description } from "../components/description"
import { useEffect, useState } from "react"
import PreviewTaskLink from "../components/previewTaskLink"

interface Task {
    id : string,
    name : string,
    text : string,
}

const fetchTask = async (taskId : string, setTask : (task : Task) => void) => {
            const PORT = 3002
            const url = `http://localhost:${PORT}/api/tasks/${taskId}`    
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

export default () => {

    const id1 = '2204c607-4fd8-439c-9dbe-4a52a5498418'
    const id2 = 'c2753146-16b8-4081-890b-fd73d84fca6c'

    const [task1, setTask1] = useState<Task | undefined>(undefined)
    const [task2, setTask2] = useState<Task | undefined>(undefined)

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