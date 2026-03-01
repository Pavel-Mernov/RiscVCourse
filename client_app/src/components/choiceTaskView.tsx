import { Button, colors, FormControlLabel, Radio, RadioGroup, Stack, Typography } from "@mui/material"
import type { ChoiceAnswers } from "../pages/CreateTaskPage"
import { useEffect, useState } from "react"
import CorrectIcon from "@mui/icons-material/Done"
import WrongIcon from "@mui/icons-material/Cancel"
import { green, red } from "@mui/material/colors"
import { useAuth } from "../context/AuthContext"
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
    taskData : ChoiceAnswers
}

type Verdict = 'OK' | 'WA' | 'RE' | 'TL'

export interface Submission {
  submission_id: string;
  task_id: string;
  student_id: string;
  timestamp: string; // ISO string
  text: string | string[];
  verdict?: Verdict | undefined;
}

export default ({ taskId, taskName, 'taskData' : { answers, correct_answer, attempts, points } } : Props) => {

    const [selectedAnswer, setselectedAnswer] = useState(-1)

    const [isCorrectAnswerShown, setCorrectAnswerShown] = useState(false)

    const [submissions, setSubmissions] = useState<Submission[]>([])

    const { isTokenValid, getLogin } = useAuth()

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

    const sendAnswer = async () => {

        setCorrectAnswerShown(true)

        if (!isTokenValid) return

        const login = getLogin()

        const serverIp = '130.49.150.32'

        if (!login) return

        if (selectedAnswer == -1) return

            const submissionPort = 3004
            const submissionUrl1 = `http://${serverIp}:${submissionPort}/api/submissions`
            const submissionMethod1 = 'POST'

            const submissionBody1 = {
                task_id: taskId,
                student_id: getLogin(),
                text: answers[selectedAnswer],
                verdict: (selectedAnswer == correct_answer) ? 'OK' : 'WA' 
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
                    Выберите один ответ:
                </Typography>

                <RadioGroup
                    value={selectedAnswer}
                    onChange={e => { 
                        setCorrectAnswerShown(false)
                        setselectedAnswer(parseInt(e.target.value))
                    }}

                >
                {
                    answers.map((ans, i) => {
                    return    (
                        <FormControlLabel
                            key={i}
                            value={i}
                            control={<Radio />}
                            label={<Stack spacing='10px' direction='row'>
                                    <Typography variant="body1" fontSize='24px'>{ ans }</Typography>
                                    {
                                        isCorrectAnswerShown && (i == correct_answer) && (i == selectedAnswer) && <Correct />
                                    }
                                    {
                                        isCorrectAnswerShown && (i != correct_answer) && (i == selectedAnswer) && <Wrong />
                                    }
                                </Stack>}
                        />
                        )
                    })
                }
                </RadioGroup>
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