import { Box, Link, Stack, Typography } from "@mui/material"
import Navbar from "../components/navbar"
import { useNavigate, useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import TaskLink from "../components/titleLink"

interface Contest {
  id: string
  deadline?: string
  title: string
  description?: string
}

interface Task {
    id : string,
    name : string,
}

function Title(props : { title : string }) {
    const { title } = props

    return (
            <Typography
                sx={{ marginTop : '50px' }}
                alignSelf='center'
                variant="h3"
                fontWeight='bold'
                >
                    { title }
            </Typography>  
    )
}

function formatDate(timestamp : string) {
    const date = new Date(timestamp);

    // Массив с названиями месяцев по-русски
    const months = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
    ];

    // Формируем строку
    const formattedDate = `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()} года`;

    return formattedDate
}

export default () => {

    const { id } = useParams()

    const [contest, setContest] = useState<Contest | { error : any } | null>(null)

    const [ tasks, setTasks ] = useState<Task[]>([])

    const navigate = useNavigate()

    useEffect(() => {
        const fetchContest = async () => {
            const PORT = 3002
            const url = `http://localhost:${PORT}/api/contests/${id}`    
            const method = 'GET'

            const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
            
            })
            .then(resp => resp.json()) 
            
            

            setContest(response)
        }

        fetchContest()
    }, [])

    useEffect(() => {
        const fetchTasks = async () => {
            const PORT = 3002
            const url = `http://localhost:${PORT}/api/contests/${id}/tasks`    
            const method = 'GET'

            const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
            
            })
            .then(resp => resp.json()) 
            
            

            setTasks(response)
        }

        fetchTasks()
    }, [])

    if (!contest) {
        return (
            <Stack
        
            >
                <Navbar /> 
                
            </Stack>
        )        
    }

    if (contest && typeof contest == 'object' && 'error' in contest) {
        return (
            <Stack
        
            >
                <Navbar /> 
                
                <Title title="Контест не найден" />
            </Stack>
        )        
    }

    // console.log(JSON.stringify(contest), contest.title, JSON.stringify(tasks))

    return (
        <Stack
    
        >
            <Navbar /> 
            
            <Box 
                marginTop='150px'
                width='30vw'
                marginLeft='15vw'
            >
                {//<BackLink title='Все контесты' link="/contests" />
                }

                <Link  
                    fontSize='28px'
                    onClick={() => { navigate('/contests') }}
                    >
                        ← Все контесты
                </Link>
            </Box>
            

            <Title title={ contest.title } /> 

            {
                contest.description &&
                <Typography
                    sx={{ marginTop : '20px', alignSelf : 'center', maxWidth : '70%' }}
                    variant="h5"
                >
                    { contest.description }
                </Typography>
            }
        
            { tasks.length != 0 && 
                <Typography
                    sx={{ marginTop : '50px', alignSelf : 'center' }}
                    variant="h4"
                    fontWeight='bold'
                    fontSize='50px'
                >
                    Задачи
                </Typography> 
            }
            <Stack
                width='70%'
                spacing='20px'
                alignSelf='center'
                marginTop='20px'
            >
                {
                    tasks.map(({ name, id }, i) => <TaskLink key={`link_${i}`} title={ name } link={ `/tasks/${id}` } />)
                }
            </Stack>

            {
                contest.deadline && 
                <Stack 
                    direction='row'
                    alignSelf='center'
                    spacing='10px'
                >
                    <Typography
                        variant="h5"
                        fontSize='22px'
                        fontWeight='semiBold'
                    >
                        Дедлайн: 
                    </Typography>

                    <Typography
                        variant="h5"
                        fontSize='22px'
                        fontWeight='semiBold'
                    >
                        { formatDate(contest.deadline) } 
                    </Typography>
                </Stack>
            }
        </Stack>
    )
}