import { Stack, Typography } from "@mui/material";
import Navbar from "../components/navbar";
import StudentLink from "../components/titleLink"
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import { useServerConnection } from "../context/ServerConnectionContext";
import { useEffect, useState } from "react";

type Student = {
    email : string
}

export default function TeacherReportPage() {
    const { isTokenValid, isUserValidTeacher } = useAuth()

    const [students, setStudents] = useState<Student[] | undefined>(undefined)

    const { serverIp, auth } = useServerConnection()

    const { accessToken } = useAuth()

    useEffect(() => {
        if ( !accessToken || !isUserValidTeacher() || !isTokenValid()) {
            return
        }

        const fetchStudents = async () => {
            try {
                const url = `https://${serverIp}/${auth}/api/students`

                const studentsList = await fetch(url, {
                    method : 'GET',
                    headers : {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                    }
                })

                const studentsData = await studentsList.json()

                console.log(JSON.stringify(studentsData))

                if (!Array.isArray(students)) {
                    throw new Error('Error from server')
                }

                setStudents(studentsData)
            }
            catch {
                // setStudents([])
            }
        }

        fetchStudents()
    }, [])

    if (!isTokenValid()) {
        return <Navigate to='/login' />
    }

    if (!isUserValidTeacher()) {
        return (
            <Stack spacing='150px'>
                <Navbar />

                <Typography 
                    variant="h1" 
                    alignSelf='center'
                    fontSize='40px' 
                    fontWeight='bold'
                >
                    403 Доступ запрещён
                </Typography>
            </Stack>
        );        
    }

    return (
        <Stack spacing='150px'>
            <Navbar />

            <Typography
                variant="h1"
                alignSelf='center'
                fontSize='40px'
                fontWeight='bold'
            >
                Отчёты об успеваемости студентов
            </Typography>

            <Stack
                spacing='25px'
                alignItems='center'
            >
                {
                    students && students.map(({ email }) => (
                        <StudentLink
                            key={email}
                            title={email}
                            link={`/report?userId=${email}`}
                        />
                    ))
                }
            </Stack>
        </Stack>
    );
}