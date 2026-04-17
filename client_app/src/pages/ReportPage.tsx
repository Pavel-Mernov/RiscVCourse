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
        [taskId : string] : number | undefined, // points
    }
}

export default function ReportPage() {
  
    const { getLogin  } = useAuth()
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
                .then(resp => resp.map(t => t.id as string))

            return taskList
        }

        const fetchPointsForTask = async (taskId : string) => {
            const url = `https://${serverIp}/${submission}/api/tasks/${taskId}/points?userId=${login}`

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

            for (const { id : contestId } of contestList) {

                const taskList = await fetchTaskNames(contestId)

                pointsDict[contestId] = {}
                for (const id of taskList) {

                    const points = await fetchPointsForTask(id)

                    pointsDict[contestId][id] = points
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

        >
            <Navbar />

            <Stack 
                spacing='30px'
            >
                <Typography 
                    variant='h2' 
                    fontSize='30px' 
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