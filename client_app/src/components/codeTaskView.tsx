import CorrectIcon from "@mui/icons-material/Done"
import WrongIcon from "@mui/icons-material/Cancel"
import { Stack, Typography, TextField, Button, colors } from "@mui/material"
import { green, red } from "@mui/material/colors"
import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import type { CodeData, Test } from "../pages/CreateTaskPage"

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
    tests : Test[]
    taskData : CodeData
}

export default ({ 'taskData' : { time_limit_ms, memory_limit_kb, attempts, points } } : Props) => {

    const [answer, setAnswer] = useState('')

    const [isCorrectAnswerShown, setCorrectAnswerShown] = useState(false)

    const { isTokenValid, getLogin } = useAuth()

    const [verdict, _] = useState<'OK' | 'WA' | 'RE' | 'TL' | undefined>(undefined)

    const isAnswerCorrect = () => verdict == 'OK'

    const sendAnswer = () => {

        // tests.forEach(async test => {

        // })

        setCorrectAnswerShown(true)

        if (!isTokenValid) return

        const login = getLogin()

        if (!login) return

        // const answer = selectedAnswer == correct_answer ? 'OK' : 'WA'

        // const PORT = 3004 // submission service port
    }

    return (
        <Stack
            spacing='80px'
        >

            <Stack
                spacing='20px'
            >
                {   time_limit_ms &&
                    <Typography>
                        <Typography
                            component="span"
                            fontWeight={700}
                            fontSize="25px"
                        >
                            Ограничения по времени, мс:
                        </Typography>

                        <Typography
                            component="span"
                            fontSize="24px"
                            sx={{ marginLeft: "6px" }}
                        >
                            { time_limit_ms }.
                        </Typography>
                    </Typography>
                }
                { memory_limit_kb &&
                    <Typography>
                        <Typography
                            component="span"
                            fontWeight={700}
                            fontSize="25px"
                        >
                            Ограничение по времени, кБ:
                        </Typography>

                        <Typography
                            component="span"
                            fontSize="24px"
                            sx={{ marginLeft: "6px" }}
                        >
                            { memory_limit_kb }.
                        </Typography>
                    </Typography>
                }
            </Stack>

            <Stack 
                spacing='20px'
            >
                <Typography
                    variant="h4"
                    fontSize='28px'
                    fontWeight='bold'
                >
                    Введите код решения:
                </Typography>

                
            <Stack spacing='10px' >

                <TextField
                    fullWidth
                    multiline
                    minRows={10}
                    maxRows={20}
                    label="Введите код"
                    value={answer}
                    onChange={(e) => { 
                        setAnswer(e.target.value)
                        setCorrectAnswerShown(false)
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
                Отправить
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
        </Stack>
    )
}