import CorrectIcon from "@mui/icons-material/Done"
import WrongIcon from "@mui/icons-material/Cancel"
import { Stack, Typography, TextField, Button, colors, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material"
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

export default ({ 'taskData' : { time_limit_ms, memory_limit_kb, attempts, points, tests_shown, input_data_format, output_data_format }, 
        tests } : Props) => {

    const [answer, setAnswer] = useState('')

    const [isCorrectAnswerShown, setCorrectAnswerShown] = useState(false)

    const { isTokenValid, getLogin } = useAuth()

    const [verdict, setVerdict] = useState<'OK' | 'WA' | 'RE' | 'TL' | undefined>(undefined)

    const [emptyCodeError, setEmptyCodeError] = useState(false)

    const isAnswerCorrect = () => verdict == 'OK'

    const testsShown = tests_shown ?? 3

    const sendAnswer = async () => {

        if (!answer || !answer.trim()) {
            setEmptyCodeError(true)
            return
        }

        setCorrectAnswerShown(false)

        setVerdict(undefined);

        await (async () => {

        tests.forEach(async ({ input, expected_output }) => {
            const body = {
                input : input,
                code : answer,
            }

            const serverIp = '130.49.150.32'
            const PORT = 3000
            const url = `http://${serverIp}:${PORT}/api/compile`    
            const method = 'POST'

            const data = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body : JSON.stringify(body)
            })
            .then(resp => resp.json())

            console.log(data)

            if ('output' in data && 'error' in data) {
                if (data.output.trim() !== expected_output) {
                    setVerdict('WA')
                    return
                }
            }
            else {
                setVerdict('RE')

                if ('error' in data) {
                    console.log('Error: ' + data.error)
                }
            }
        })

        })()

        if (!verdict) {
            setVerdict('OK')
        }

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
            { input_data_format &&
                <Stack
                    spacing='10px'
                >
                    <Typography
                        variant="h2"
                        fontWeight='bold'
                        fontSize='28px'
                    >
                        Формат входных данных
                    </Typography>

                    <Typography
                        variant="body1"                        
                        fontSize='24px'
                    >
                        { input_data_format }
                    </Typography>
                </Stack>
            }

            { output_data_format &&
                <Stack
                    spacing='10px'
                >
                    <Typography
                        variant="h2"
                        fontWeight='bold'
                        fontSize='28px'
                    >
                        Формат выходных данных
                    </Typography>

                    <Typography
                        variant="body1"                        
                        fontSize='24px'
                    >
                        { output_data_format }
                    </Typography>
                </Stack>
            }
            
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
                            Ограничение по памяти, кБ:
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

            <TableContainer
                component={Paper}
                sx={{ maxWidth: '60%', margin: 'auto', mt: 4, borderRadius: 2, overflow: 'hidden' }}
            >
            <Table>
                <TableHead>
                <TableRow
                    sx={{
                    backgroundColor: '#f5f5f5',
                    MozBorderRadiusTopright: '12px', // Работает для TableContainer, для TableRow нет
                    MozBorderRadiusTopleft: '12px', // Работает для TableContainer, для TableRow нет
                    }}
                >
                    <TableCell
                        sx={{
                            fontWeight: 'bold',
                            
                            borderTopLeftRadius: '12px',
                            borderBottomLeftRadius: '12px',
                            backgroundColor: '#e0e0e0',
                        }}
                    >
                    Входные данные
                    </TableCell>
                    <TableCell
                    sx={{
                        fontWeight: 'bold',
                        borderTopRightRadius: '12px',
                        borderBottomRightRadius: '12px',
                        backgroundColor: '#e0e0e0',
                    }}
                    >
                    Выходные данные
                    </TableCell>
                </TableRow>
                </TableHead>
                <TableBody>
                { tests.slice(0, testsShown).map((row, index) => (
                    <TableRow
                    key={index}
                    sx={{
                        borderTop: index === 0 ? '1px solid #444' : undefined,
                        borderBottom: index === tests.length - 1 ? '1px solid #444' : undefined,
                    }}
                    >
                    <TableCell sx={{ whiteSpace: 'pre-line', fontSize : '20px' }} >{row.input}</TableCell>
                    <TableCell sx={{ whiteSpace: 'pre-line', fontSize : '20px' }} >{row.expected_output}</TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
            </TableContainer>

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
                    maxRows={15}
                    error={ emptyCodeError }
                    helperText={emptyCodeError ? 'Код не может быть пустым' : ''}
                    label={"Введите код"}
                    value={answer}
                    onChange={(e) => { 
                        setAnswer(e.target.value)
                        setCorrectAnswerShown(false)
                        setEmptyCodeError(false)
                    }}
                />
                {
                    isCorrectAnswerShown && verdict && isAnswerCorrect() && <Correct />
                }
                {
                    isCorrectAnswerShown && verdict && !isAnswerCorrect() && <Wrong />
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