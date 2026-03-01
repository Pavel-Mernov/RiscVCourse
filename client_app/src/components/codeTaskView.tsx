import CorrectIcon from "@mui/icons-material/Done"
import WrongIcon from "@mui/icons-material/Cancel"
import { Stack, Typography, TextField, Button, colors, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material"
import { green, red } from "@mui/material/colors"
import { useEffect, useState } from "react"
import { useAuth } from "../context/AuthContext"
import type { CodeData, Test } from "../pages/CreateTaskPage"
import SubmissionsTable from "./submissionsTable"

type Verdict = 'OK' | 'WA' | 'RE' | 'TL'

export interface Submission {
  submission_id: string;
  task_id: string;
  student_id: string;
  timestamp: string; // ISO string
  text: string | string[];
  verdict?: Verdict | undefined;
}

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
    tests : Test[]
    taskData : CodeData
}

export default ({ taskId, taskName, 'taskData' : { time_limit_ms, memory_limit_kb, attempts, points, tests_shown, input_data_format, output_data_format }, 
        tests } : Props) => {

    const [answer, setAnswer] = useState('')

    const [isCorrectAnswerShown, setCorrectAnswerShown] = useState(false)

    const { isTokenValid, getLogin } = useAuth()

    const [verdict, setVerdict] = useState<Verdict | undefined>(undefined)

    const [emptyCodeError, setEmptyCodeError] = useState(false)

    const [submissions, setSubmissions] = useState<Submission[]>([])

    const serverIp = '130.49.150.32'

    useEffect(() => { 

        if (!getLogin() || !isTokenValid()) {
            return
        }

        const fetchSubmissions = async () => {
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

            if (sortedSubmissions.length > 0 && answer.length == 0) {
                setAnswer(sortedSubmissions[0].text as string)
            }

            setSubmissions(sortedSubmissions)
        }

        fetchSubmissions()
    }, [])

    useEffect(() => {

        const updateVerdict = async () => {


        }

        updateVerdict()

    }, [verdict])

    const isAnswerCorrect = () => verdict == 'OK'

    const testsShown = tests_shown ?? 3

    const sendAnswer = async () => {

        if (!answer || !answer.trim()) {
            setEmptyCodeError(true)
            return
        }

        setCorrectAnswerShown(false)

        setVerdict(undefined);

        let lastSubmission : Submission | undefined = undefined

        let localVerdict : Verdict | undefined = undefined
            
        if (getLogin() && isTokenValid()) {
            const submissionPort = 3004
            const submissionUrl1 = `http://${serverIp}:${submissionPort}/api/submissions`
            const submissionMethod1 = 'POST'

            const submissionBody1 = {
                task_id: taskId,
                student_id: getLogin(),
                text: answer
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
                lastSubmission = data as Submission
            }
            }
            catch (err : any) {
                console.error(err)
            }
        }
        

        
        for (const { input, expected_output } of tests) {
            

            // console.log(input)

            

            

            const body = {
                input,
                code : answer,
            }

            const PORT = 3000
            const url = `http://${serverIp}:${PORT}/api/compile`    
            const method = 'POST'

            try {
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
                        localVerdict = 'WA'
                        console.log('Verdict: WA')
                    }
                }
                else {
                    setVerdict('RE')
                    localVerdict = 'RE'

                    if ('error' in data) {
                        console.log('Error: ' + data.error)
                    }
                }
            }
            catch (err : any) {
                console.log((err as Error).message)

                setVerdict('RE')
                localVerdict = 'RE'
            }
        }


        console.log('Local verdict: ' + localVerdict)

        if (!localVerdict) {
            setVerdict('OK')
            
            localVerdict = 'OK'
        }

        if (localVerdict && getLogin() && isTokenValid() && lastSubmission) {

            const lastSubmissionId = lastSubmission.submission_id

            const submissionPort = 3004
            const submissionUrl = `http://${serverIp}:${submissionPort}/api/submissions/${lastSubmissionId}/verdict`
            const submissionMethod = 'PUT'

            console.log(localVerdict)

            const submissionBody = {
                verdict : localVerdict || 'OK'
            }

            try {
            // const text = 
            await fetch(submissionUrl, {
                method : submissionMethod,
                headers: {
                    'Content-Type': 'application/json',
                },
                body : JSON.stringify(submissionBody)
            })
            .then(resp => resp.text())

            const lastSubmissions = [...submissions]

            const lastSubmissionIndex = lastSubmissions.findIndex(sub => sub.submission_id == lastSubmissionId)


            if (lastSubmissionIndex == -1) {

                lastSubmission.verdict = localVerdict

                setSubmissions([lastSubmission, ...lastSubmissions])
            }
            else {
                lastSubmissions[lastSubmissionIndex].verdict = localVerdict

                setSubmissions(lastSubmissions)
            }

            
        }
        catch (err : any) {
            console.error(err)
        }
        }

        setCorrectAnswerShown(true)


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