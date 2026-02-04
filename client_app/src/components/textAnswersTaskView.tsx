import { Stack, Typography, Button, colors, TextField } from "@mui/material"
import { green, red } from "@mui/material/colors"
import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import type { TextAnswer } from "../pages/CreateTaskPage"
import CorrectIcon from "@mui/icons-material/Done"
import WrongIcon from "@mui/icons-material/Cancel"

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
    taskData : TextAnswer
}

export default ({ 'taskData' : { correct_answers, attempts, points } } : Props) => {

    const [answer, setAnswer] = useState('')

    const [isCorrectAnswerShown, setCorrectAnswerShown] = useState(false)

    const { isTokenValid, getLogin } = useAuth()

    const isAnswerCorrect = () => correct_answers.filter(ans => ans.trim() == answer.trim()).length != 0

    const sendAnswer = () => {

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
        </Stack>
    )
}