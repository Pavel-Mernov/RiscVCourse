import { Stack, Typography } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/navbar";
import { Navigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import type { Contest } from "./ContestsPage";
import { useServerConnection } from "../context/ServerConnectionContext";
import ReportTable from "../components/ReportTable";

export interface TaskDict {
    [contestId : string] : {
        title : string
        tasks : {
            [taskId : string] : { points: number | undefined, name : string }
        }
    }
}

export default function ReportPage() {
  
    const { getLogin, isUserValidTeacher, isTokenValid, accessToken } = useAuth()
    const { serverIp, contest, submission, auth } = useServerConnection()


    const [pointsForAllTasks, setPointsForAllTasks] = useState<TaskDict | undefined | 'user not found'>(undefined)

    const [params] = useSearchParams()

    const userIdParam = params.get("userId")

    useEffect(() => {

        if (!getLogin() || !isTokenValid() || (isUserValidTeacher() && !userIdParam)) {
            return
        }

        const login = (isUserValidTeacher() && userIdParam) ? userIdParam : getLogin()!


        const checkUserExists = async () => {
            const url = `https://${serverIp}/${auth}/api/users/${login}`

            const user = await fetch(url, {
                method : 'GET',
                    headers : {
                    'Content-Type': 'application/json',
                    'Authorization' : `Bearer ${accessToken}`
                }
                })
                .then(resp => resp.json())

            return user
        }

        const fetchContests = async () => {
            const url = `https://${serverIp}/${contest}/api/contests`

            const contestList = await fetch(url, {
                method : 'GET',
                headers : {
                    'Content-Type': 'application/json'
                        
                }
            })
            .then(resp => resp.json())
            .then(resp => resp as any[])
            .then(resp => resp.map((c : any) => c as Contest))
            .then(resp => resp.filter(({ is_active }) => isUserValidTeacher() || is_active))
            .then(c => c.map(({ id, title }) => ({ id, title })))
            

            return contestList            
        }

        const fetchTaskNames = async (contestId : string) => {
            const url = `https://${serverIp}/${contest}/api/contests/${contestId}/tasks`    

            const taskList = await fetch(url, {
                    method : 'GET',
                    headers : {
                        'Content-Type': 'application/json'  
                    }
                })
                .then(resp => resp.json())
                .then(resp => resp as any[])
                .then(resp => resp.map(({ id, name }) => { return { id, name } }))

            return taskList
        }

        const fetchPointsForTask = async (taskId : string) => {
            const url = `https://${serverIp}/${submission}/api/points?userId=${login}&taskId=${taskId}`

            const points = await fetch(url, {
                method : 'GET',
                headers : {
                    'Content-Type': 'application/json'
                },
                })
                .then(resp => resp.json())
                .then(resp => resp.points as number | undefined)

            return points
        }

        const fetchPoints = async () => {

            const foundUser = await checkUserExists()
            .then(user => {
                if (!user || !user.email || 'error' in user) {
                    setPointsForAllTasks('user not found')
                    return false
                }
                return true
            })

            if (!foundUser) {
                return
            }
            
            const contestList = await fetchContests()

            const pointsDict : TaskDict = {}

            for (const { id : contestId, title } of contestList) {

                const taskList = await fetchTaskNames(contestId)

                pointsDict[contestId] = { title, tasks: {} }
                for (const { id, name } of taskList) {

                    const points = await fetchPointsForTask(id)

                    pointsDict[contestId].tasks[id] = { points, name }
                }
            }

            setPointsForAllTasks(pointsDict)
        }

        fetchPoints()
    }, [])

    if (!isTokenValid()) {
    
        return <Navigate to="/login" />
    }

    if (isUserValidTeacher() && !userIdParam) {
        return <Navigate to="/report/teacher" />
    }

    return (
        <Stack
            spacing='150px'
        >
            <Navbar />

            <Stack 
                spacing='70px'
                alignItems='center'
            >
                { pointsForAllTasks == 'user not found' &&
                    <Typography 
                        variant='h1' 
                        fontSize='50px' 
                        fontWeight='bold'
                        >
                        Пользователь не найден
                    </Typography>
                }
                { pointsForAllTasks !== 'user not found' &&
                    <Typography 
                        variant='h1' 
                        fontSize='50px' 
                        fontWeight='bold'
                        >
                        Отчёт об успеваемости пользователя
                    </Typography>
                }
                { pointsForAllTasks === 'user not found' && userIdParam &&
                    <Typography 
                        variant='h1' 
                        fontSize='50px' 
                        fontWeight='bold'
                        >
                        Пользователь {userIdParam} не найден
                    </Typography>
                }
                {
                    (pointsForAllTasks && pointsForAllTasks !== 'user not found') && <ReportTable pointsForAllTasks={pointsForAllTasks} />
                }
            </Stack>
        </Stack>
    );
}