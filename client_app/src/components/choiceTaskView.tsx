import { Button, colors, FormControlLabel, Radio, RadioGroup, Stack, Typography } from "@mui/material"
import type { ChoiceAnswers } from "../pages/CreateTaskPage"
import { useState } from "react"
import CorrectIcon from "@mui/icons-material/Done"
import WrongIcon from "@mui/icons-material/Cancel"
import { green, red } from "@mui/material/colors"
import { useAuth } from "../context/AuthContext"

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
    taskData : ChoiceAnswers
}

export default ({ 'taskData' : { answers, correct_answer, attempts, points } } : Props) => {

    const [selectedAnswer, setselectedAnswer] = useState(-1)

    const [isCorrectAnswerShown, setCorrectAnswerShown] = useState(false)

    const { isTokenValid, getLogin } = useAuth()

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
        </Stack>
    )
}