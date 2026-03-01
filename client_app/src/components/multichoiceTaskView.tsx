import { Stack, Typography, Button, colors, Checkbox } from "@mui/material"
import { green, red } from "@mui/material/colors"
import { useEffect, useState } from "react"
import { useAuth } from "../context/AuthContext"
import type { MultichoiceAnswers } from "../pages/CreateTaskPage"

import CorrectIcon from "@mui/icons-material/Done"
import WrongIcon from "@mui/icons-material/Cancel"
import type { Submission } from "./codeTaskView"
import SubmissionsTable from "./submissionsTable"

function Correct() {
    return (
        <Stack
            direction='row'
            spacing='5px'
            padding='5px'
            alignContent='center'
            sx={{
                borderRadius : '5px',
                background : green[200]
            }}
        >
            <CorrectIcon sx={{ color : green[800] }} />

            <Typography
                variant='body2'
                fontSize='15px'
                fontWeight='bold'
                sx={{ color : green[900] }}
            >
                Правильно
            </Typography>
        </Stack>
    )
}

function Wrong() {
    return (
        <Stack
            direction='row'
            spacing='5px'
            padding='5px'
            alignContent='center'
            sx={{
                borderRadius : '5px',
                background : red[200],

            }}
        >
            <WrongIcon sx={{ color : red[800] }} />

            <Typography
                variant='body2'
                fontSize='15px'
                fontWeight='bold'
                sx={{ color : red[900] }}
            >
                Неправильно
            </Typography>
        </Stack>
    )
}

interface Props {
    taskId : string
    taskName : string
    taskData : MultichoiceAnswers
}

export default ({ taskId, taskName, 'taskData' : { answers, attempts, points } } : Props) => {

    const [selectedAnswers, setSelectedAnswers] = useState(answers.map(_ => false))

    const [isCorrectAnswerShown, setCorrectAnswerShown] = useState(false)

    const { isTokenValid, getLogin } = useAuth()

    const [submissions, setSubmissions] = useState<Submission[]>([])

    useEffect(() => { 

        if (!getLogin() || !isTokenValid()) {
            return
        }

        const fetchSubmissions = async () => {
            const serverIp = '130.49.150.32'
            const submissionPort = 3004
            const submissionUrl1 = `http://${serverIp}:${submissionPort}/api/submissions?userId=${getLogin()}&taskId=${taskId}`
            const submissionMethod1 = 'GET'        

            const text = await fetch(submissionUrl1, {
                method : submissionMethod1,
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            .then(resp => resp.text())

            const submissionsData = JSON.parse(text) as Submission[]

            const sortedSubmissions = submissionsData.sort((a, b) => ( +(new Date(b.timestamp)) - +new Date(a.timestamp) ))


            setSubmissions(sortedSubmissions)
        }

        fetchSubmissions()
    }, [])

    const handleCorrectChange = (index: number) => {
        
        const newAnswers = [ ...selectedAnswers] 

        newAnswers[index] = !newAnswers[index]

        setCorrectAnswerShown(false)
        setSelectedAnswers(newAnswers)
    }

    // useEffect(() => console.log(selectedAnswers), [selectedAnswers])

    const sendAnswer = async () => {

        setCorrectAnswerShown(true)

        if (!isTokenValid) return

        const login = getLogin()

        if (!login) return

            const serverIp = '130.49.150.32'
            const submissionPort = 3004
            const submissionUrl = `http://${serverIp}:${submissionPort}/api/submissions`
            const submissionMethod = 'POST'

            const submissionBody = {
                task_id: taskId,
                student_id: getLogin(),
                text: answers.filter((_, i) => selectedAnswers[i]).map(({ answer }) => answer),
                verdict: answers.every(({ is_correct }, i) => selectedAnswers[i] == is_correct) ? 'OK' : 'WA' 
            }

            try {
            const text = await fetch(submissionUrl, {
                method : submissionMethod,
                headers: {
                    'Content-Type': 'application/json',
                },
                body : JSON.stringify(submissionBody)
            })
            .then(resp => resp.text())

            // console.log(text)

            const data = JSON.parse(text)

            if (!('error' in data)) {
                setSubmissions([data as Submission, ...submissions])
                
            }
            }
            catch (err : any) {
                console.error(err)
            }

    }

    return (
        <Stack
            spacing='80px'
        >
            <Stack 
                spacing='20px'
            >
                <Typography
                    variant="h4"
                    fontSize='28px'
                    fontWeight='bold'
                >
                    Выберите один или несколько ответов:
                </Typography>

                
                {
                    answers.map(({ answer, is_correct }, i) => {

                    return    (
                        <Stack key={i} spacing='10px' direction='row'>
                            <Checkbox
                                checked={selectedAnswers[i]}
                                onChange={() => handleCorrectChange(i)}
                            />

                            <Typography variant="body1" fontSize='24px'>{ answer }</Typography>
                            {
                                isCorrectAnswerShown && is_correct && selectedAnswers[i] && <Correct />
                            }
                            {
                                isCorrectAnswerShown && !is_correct && selectedAnswers[i] && <Wrong />
                            }
                        </Stack>
                        )
                    })
                }
            </Stack>

            <Button
                variant='contained'
                sx={{
                    padding : '10px',
                    background : colors.green[500],
                    fontWeight : 'bold',
                    fontSize : '25px',
                    border : 'solid',
                    borderWidth : '2px',
                    borderRadius : '15px',
                    borderColor : colors.green[800],
                    
                }}
                onClick={sendAnswer}
            >
                Отправить ответ
            </Button>

            <Stack
                spacing='20px'
            >
                {   points && isTokenValid() &&
                    <Typography>
                        <Typography
                            component="span"
                            fontWeight={700}
                            fontSize="25px"
                        >
                            Баллы за задачу:
                        </Typography>

                        <Typography
                            component="span"
                            fontSize="24px"
                            sx={{ marginLeft: "6px" }}
                        >
                            { points }.
                        </Typography>
                    </Typography>
                }
                { attempts && isTokenValid() &&
                    <Typography>
                        <Typography
                            component="span"
                            fontWeight={700}
                            fontSize="25px"
                        >
                            Максимальное количество попыток:
                        </Typography>

                        <Typography
                            component="span"
                            fontSize="24px"
                            sx={{ marginLeft: "6px" }}
                        >
                            { attempts }.
                        </Typography>
                    </Typography>
                }
            </Stack>

            {
                isTokenValid() && submissions.length > 0 && <Stack spacing='20px'>

                <Typography
                    variant="h2"
                    fontSize='28px'
                    fontWeight='bold'
                >
                    Посылки:
                </Typography>

                    <SubmissionsTable taskName={taskName} submissions={submissions} points={ points } />    
                </Stack>
                
            }

        </Stack>
    )
}