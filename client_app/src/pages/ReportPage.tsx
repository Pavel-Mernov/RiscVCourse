import { Stack, Typography } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/navbar";
import { Navigate } from "react-router-dom";
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
  
    const { getLogin, isUserValidTeacher } = useAuth()
    const { serverIp, contest, submission } = useServerConnection()


    const [pointsForAllTasks, setPointsForAllTasks] = useState<TaskDict | undefined>(undefined)

    useEffect(() => {

        if (!getLogin()) {
            return
        }

        const login = getLogin()!

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
                }
                })
                .then(resp => resp.json())
                .then(resp => resp.points as number | undefined)

            return points
        }

        const fetchPoints = async () => {

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

    if (!getLogin()) {
    
        return <Navigate to="/login" />
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
                <Typography 
                    variant='h1' 
                    fontSize='50px' 
                    fontWeight='bold'
                    >
                    Отчёт об успеваемости пользователя
                </Typography>

                {
                    (pointsForAllTasks) && <ReportTable pointsForAllTasks={pointsForAllTasks} />
                }
            </Stack>
        </Stack>
    );
}