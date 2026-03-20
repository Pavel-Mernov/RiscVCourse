import { Box, Button, colors, Link, Stack, Typography } from "@mui/material"
import Navbar from "../components/navbar"
import { useNavigate, useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import TaskLink from "../components/titleLink"
import { useAuth } from "../context/AuthContext"
import { useServerConnection } from "../context/ServerConnectionContext"

interface Contest {
  id: string
  deadline?: string
  title: string
  description?: string
  authorized_only ?: boolean
  is_active ?: boolean
}

interface Task {
    id : string,
    name : string,
}

function Title(props : { title : string }) {
    const { title } = props

    return (
            <Typography
                sx={{ marginTop : '50px', maxWidth : '100%' }}
                alignSelf='center'
                alignContent='center'
                textAlign='center'
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

    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')

    // Формируем строку
    const formattedDate = `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()} года, ${hours}:${minutes}`;

    return formattedDate
}

export default () => {

    const { id } = useParams()

    const [contestState, setContest] = useState<Contest | { error : any } | null>(null)

    const [ tasks, setTasks ] = useState<Task[]>([])

    const navigate = useNavigate()

    const { isUserValidTeacher, isTokenValid } = useAuth()

    const { serverIp, contest } = useServerConnection()

    useEffect(() => {
        const fetchContest = async () => {
            const url = `https://${serverIp}/${contest}/api/contests/${id}`    
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
            
            const url = `https://${serverIp}/${contest}/api/contests/${id}/tasks`    
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

    if (!contestState) {
        return (
            <Stack
        
            >
                <Navbar /> 
                
            </Stack>
        )        
    }

    if (contestState && typeof contestState == 'object' && 'error' in contestState) {
        return (
            <Stack
                spacing='150px'
            >
                <Navbar /> 
                
                <Title title="Контест не найден" />
            </Stack>
        )        
    }

    if (contestState && typeof contestState == 'object' && contestState.authorized_only && !isTokenValid()) {
        return (
            <Stack
                spacing='150px'
            >
                <Navbar /> 
                
                <Title title="403 Доступ запрещён" />
            </Stack>
        )        
    }

    // console.log(JSON.stringify(contest), contest.title, JSON.stringify(tasks))

    const { title } = contestState as Contest

    return (
        <Stack
            paddingBottom='80px'
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
            

            { isUserValidTeacher() && 
                <Button 
                    variant="outlined" 
                    onClick={() => navigate(`/contests/${id}/edit`)}
                    sx={{ fontSize : '20px', borderWidth : '2px', alignSelf : 'end', right : '15vw' }}
                >
                Редактировать Контест
                </Button>
            } 
            { isUserValidTeacher() && 
                <Button 
                    variant="outlined"
                     
                    onClick={() => navigate(`/contests/${id}/create-task`)}
                    sx={{ 
                        marginTop : '40px',
                        fontSize : '20px', 
                        borderWidth : '2px', 
                        alignSelf : 'end', 
                        right : '15vw', 
                        borderColor : colors.green[500], 
                        color : colors.green[500],
                    }}
                >
                +  Добавить задачу
                </Button>
            }            

            <Title title={ title } /> 

            {
                contestState && contestState.description &&
                <Typography
                    sx={{ marginTop : '20px', alignSelf : 'center', maxWidth : '70%' }}
                    variant="h5"
                >
                    { contestState.description }
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
                contestState.deadline && 
                <Stack 
                    direction='row'
                    alignSelf='center'
                    marginTop='60px'
                    alignItems='center'
                    spacing='10px'
                >
                    <Typography
                        variant="h5"
                        fontSize='25px'
                        fontWeight='semiBold'
                    >
                        Дедлайн: 
                    </Typography>

                    <Typography
                        variant="h5"
                        fontSize='22px'
                        fontWeight='semiBold'
                    >
                        { formatDate(contestState.deadline) } 
                    </Typography>
                </Stack>
            }
        </Stack>
    )
}