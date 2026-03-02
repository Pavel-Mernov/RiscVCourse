import { Stack, Typography, Button, colors, TextField } from "@mui/material"
import { green, red } from "@mui/material/colors"
import { useEffect, useState } from "react"
import { useAuth } from "../context/AuthContext"
import type { TextAnswer } from "../pages/CreateTaskPage"
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
    taskData : TextAnswer
}

export default ({ taskId, taskName, 'taskData' : { correct_answers, attempts, points } } : Props) => {

    const [answer, setAnswer] = useState('')

    const [isCorrectAnswerShown, setCorrectAnswerShown] = useState(false)

    const { isTokenValid, getLogin } = useAuth()

    const [submissions, setSubmissions] = useState<Submission[]>([])

    const [emptyCodeError, setEmptyCodeError] = useState(false)

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

    const isAnswerCorrect = () => correct_answers.filter(ans => ans.trim() == answer.trim()).length != 0

    const sendAnswer = async () => {

        if (!answer || !answer.trim()) {
            setEmptyCodeError(true)
            return
        }

        setCorrectAnswerShown(true)

        if (!isTokenValid) return

        const login = getLogin()

        if (!login) return

        const serverIp = '130.49.150.32'


        if (answer.trim() === '') return

            const submissionPort = 3004
            const submissionUrl1 = `http://${serverIp}:${submissionPort}/api/submissions`
            const submissionMethod1 = 'POST'

            const submissionBody1 = {
                task_id: taskId,
                student_id: getLogin(),
                text: answer.trim(),
                verdict: isAnswerCorrect() ? 'OK' : 'WA' 
            }

            try {
            const text = await fetch(submissionUrl1, {
                method : submissionMethod1,
                headers: {
                    'Content-Type': 'application/json',
                },
                body : JSON.stringify(submissionBody1)
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
                    Введите текстовый ответ:
                </Typography>

                
            <Stack spacing='10px' >

                <TextField
                    fullWidth
                    multiline
                    label="Введите ответ"
                    error={ emptyCodeError }
                    helperText={ emptyCodeError ? 'Ответ не может быть пустым' : '' }
                    value={answer}
                    onChange={(e) => { 
                        setAnswer(e.target.value)
                        setCorrectAnswerShown(false)
                        setEmptyCodeError(false)
                    }}
                />
                {
                    isCorrectAnswerShown && isAnswerCorrect() && <Correct />
                }
                {
                    isCorrectAnswerShown && !isAnswerCorrect() && <Wrong />
                }
            </Stack>
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
                    maxWidth : '30%',
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