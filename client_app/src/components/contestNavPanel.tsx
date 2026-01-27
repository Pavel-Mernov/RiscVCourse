import { Link, Stack, Typography } from "@mui/material"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

interface Props {
    curTaskId : string,
    contestId : string
}

interface TaskName {
    id : string,
    name : string
}

export function ContestNavPanel(props : Props) {
    const { contestId, curTaskId } = props

    const [ contestTitle, setContestTitle ] = useState<string>('')

    const [ taskNames, setTaskNames ] = useState<TaskName[]>([])

    useEffect(() => {
        const fetchContest = async () => {
            const serverIp = '130.49.150.32'
            const PORT = 3002
            const url = `http://${serverIp}:${PORT}/api/contests/${contestId}`    
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

            setContestTitle(response.title)
        }

        fetchContest()
    }, [])

    useEffect(() => {
        const fetchTasks = async () => {
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
                return
            }

            setTaskNames((response as TaskName[]).filter(t => t.id != curTaskId))
        }

        fetchTasks()
    }, []) 

    const navigate = useNavigate()

    return (
        <Stack
            maxWidth='40%'
            sx={{ 
                padding : '10px', 
                border : '1px solid', 
                borderColor : '#5f5f5f', 
                background : '#d6d6d6' 
            }}
            spacing='15px'
        >
            <Link  
                onClick={() => { navigate(`/contests/${contestId}`) }}
                fontSize='28px'
                >
                    { '← ' + contestTitle }
            </Link>

            <Typography
                fontSize='24px'
            >
                Другие задачи контеста:
            </Typography>

            {
                taskNames.map(({ id, name }, i) => {
                    return <Link 
                        key={`task_${i}`} 
                        onClick={() => { navigate(`/tasks/${id}`) }}
                        fontSize='24px'
                    >
                        { '    * ' + name }
                    </Link>
                })
            }
        </Stack>
    )
}