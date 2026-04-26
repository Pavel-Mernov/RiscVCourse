import { Box, Button, ButtonGroup, colors, Stack, TextField, Typography } from "@mui/material"
import { green, grey, red } from "@mui/material/colors"
import { useState } from "react"
import { useServerConnection } from "../context/ServerConnectionContext"
import CorrectIcon from "@mui/icons-material/Done"
import WrongIcon from "@mui/icons-material/Cancel"
import Navbar from "../components/navbar"

type Verdict = 'OK' | 'WA' | 'RE' | 'TL'

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
                Ошибка
            </Typography>
        </Stack>
    )
}

const isTextUnder10KB = (text : string) => {
    return new TextEncoder().encode(text).length <= 10 * 1024
} 

type FileError = '' | 'Файл не выбран или пуст' | 'Превышен максимальный размер входного файла: 10 КБайт'

type CodeError = '' | 'Код не может быть пустым' | 'Превышен максимальный размер кода: 10 КБайт'

export default () => {

    const [textAnswer, setTextAnswer] = useState('')

    const [fileAnswer, setFileAnswer] = useState('')

    const [fileName, setFileName] = useState('')

    const [isCorrectAnswerShown, setCorrectAnswerShown] = useState(false)

    

    const [verdict, setVerdict] = useState<Verdict | undefined>(undefined)

    const [codeHereError, setCodeHereError] = useState<CodeError>('')

    const [fileError, setFileError] = useState<FileError>('')

    const [codeInputMode, setCodeInputMode] = useState<'here' | 'file'>('here')

    const [input, setInput] = useState('')

    const [output, setOutput] = useState('')

    const [isLoading, setLoading] = useState(false)

    const { serverIp, compilation } = useServerConnection()

    const isAnswerCorrect = () => verdict == 'OK'

    

    const sendAnswer = async () => {

        if (codeInputMode == 'here' && (!textAnswer || !textAnswer.trim() || !isTextUnder10KB(textAnswer))) {
            setCodeHereError(!isTextUnder10KB(textAnswer) ? 'Превышен максимальный размер кода: 10 КБайт' : 'Код не может быть пустым')
            return
        }
        else if (codeInputMode == 'file' && (!fileAnswer || !fileAnswer.trim() || !isTextUnder10KB(fileAnswer))) {
            setFileError((!fileAnswer || !fileAnswer.trim()) ? 'Файл не выбран или пуст' : 'Превышен максимальный размер входного файла: 10 КБайт')
            return
        }

        setCorrectAnswerShown(false)

        setVerdict(undefined);

        setLoading(true)

        let localVerdict : Verdict | undefined = undefined
        

        
        
            

            // console.log(input)

            

            

            const body = {
                input,
                code : codeInputMode == 'here' ? textAnswer : fileAnswer,
                timeout : 5000
            }

            const url = `https://${serverIp}/${compilation}/api/compile`    
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
                    setOutput(data.output)

                    if (data.error) {
                        setVerdict('RE')
                        localVerdict = 'RE'

                        console.log('Error: ' + data.error)
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
        


        // console.log('Local verdict: ' + localVerdict)

        if (!localVerdict) {
            setVerdict('OK')
            
            localVerdict = 'OK'
        }

        setCorrectAnswerShown(true)

        setLoading(false)

    }

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const text = await file.text();

        
        setFileAnswer(text);
        setFileName(file.name);

        const fileErrorValue = isTextUnder10KB(text) ? '' : 'Превышен максимальный размер входного файла: 10 КБайт'

        setFileError(fileErrorValue)
    };

    const isSendButtonDisabled = () => isLoading

    return (
        <Stack spacing='150px'>

            <Navbar />

            <Stack
                spacing='80px'
                width='75%'
                alignSelf='center'
                sx={{
                    paddingBottom : '80px'
                }}
            >


                
                <Stack
                    spacing='20px'
                >
                    <Typography
                        variant="h1"
                        fontSize='60px'
                        fontWeight='bold'
                    >
                        Песочница
                    </Typography>

                    <Typography
                        variant="h4"
                        fontSize='28px'
                    >
                        Компилируйте и тестируйте код на языке ассемблера RISC-V
                    </Typography>
                </Stack>



            <ButtonGroup
                variant="contained"
                
                sx={{
                    width: 'fit-content',
                    "& .MuiButtonGroup-grouped": {
                    backgroundColor: grey[200],
                    borderColor: grey[700],
                    
                    fontSize: '22px',
                    fontWeight: 'semibold',
                    color: "black",
                    "&:hover": {
                        backgroundColor: grey[300],
                    },
                    },
                }}
            >
                <Button
                    disabled={ codeInputMode == 'here' }
                    onClick={() => setCodeInputMode('here')}
                    sx={{
                        ...(codeInputMode == 'here' && {
                            backgroundColor: grey[700],
                            color: "white",
                            fontWeight: "bold",
                            "&.Mui-disabled": {
                            backgroundColor: grey[700],
                            color: "white",
                            },
                        }),
                        }}
                >
                    Ввести код здесь
                </Button>
                <Button
                    disabled={ codeInputMode == 'file' }
                    onClick={() => setCodeInputMode('file')}
                    sx={{
                        ...(codeInputMode == 'file' && {
                            backgroundColor: grey[700],
                            color: "white",
                            fontWeight: "bold",
                            "&.Mui-disabled": {
                            backgroundColor: grey[700],
                            color: "white",
                            },
                        }),
                        }}
                >
                    Выбрать файл
                </Button>
            </ButtonGroup>

            {
                codeInputMode == 'file' &&
                    <Box gap='10px'>
                        {/* Скрытый input */}
                        <input
                            accept=".s,.asm"
                            style={{ display: "none" }}
                            id="file-upload"
                            type="file"
                            onChange={handleFileChange}
                        />

                        {/* Кнопка MUI */}
                        <label htmlFor="file-upload">
                            <Button 
                                variant="contained" 
                                component="span"
                                sx={{
                                    backgroundColor: grey[200],
                                    fontSize : '20px',
                                    fontWeight : 'bold',
                                    color : grey[700],
                                    borderRadius : '10px',
                                    border : '2px solid',
                                    borderColor : fileError ? 'red' : grey[400],
                                    paddingInline : '50px'
                                }}
                            >
                            Загрузить
                            </Button>
                        </label>

                        { fileName &&
                            <Typography
                                variant='body1'
                                sx={{
                                    marginTop : '18px',
                                    color : fileError ? 'red' : grey[700],
                                    fontSize : '22px',
                                    fontWeight : 'semiBold'
                                }}
                            >
                                { fileName }
                            </Typography>
                        }
                        
                            {
                                fileError &&
                                    <Typography
                                        variant='body1'
                                        sx={{
                                            marginTop : '18px',
                                            color : 'red',
                                            fontSize : '22px',
                                            fontWeight : 'semiBold'
                                        }}
                                    >
                                        { fileError }
                                    </Typography>

                            }

                            {
                                isCorrectAnswerShown && verdict && isAnswerCorrect() && <Correct />
                            }
                            {
                                isCorrectAnswerShown && verdict && !isAnswerCorrect() && <Wrong />
                            }
                    
                    </Box>
            }

            { codeInputMode == 'here' &&
                <Stack 
                    spacing='20px'
                >
                    <Typography
                        variant="h4"
                        fontSize='28px'
                        fontWeight='bold'
                    >
                        Введите код на языке ассемблера RISC-V:
                    </Typography>

                        <TextField
                            fullWidth
                            multiline
                            minRows={10}
                            maxRows={15}
                            error={ !!codeHereError }
                            helperText={ codeHereError }
                            label={"Введите код"}
                            value={textAnswer}
                            onChange={(e) => { 
                                setTextAnswer(e.target.value)
                                setCorrectAnswerShown(false)
                                setCodeHereError('')
                            }}
                        />
                    
                    <Stack spacing='10px' >

                        {
                            isCorrectAnswerShown && verdict && isAnswerCorrect() && <Correct />
                        }
                        {
                            isCorrectAnswerShown && verdict && !isAnswerCorrect() && <Wrong />
                        }
                    </Stack>
                </Stack>
            }

            <Stack 
                spacing='20px'
            >
                    <Typography
                        variant="h4"
                        fontSize='28px'
                        fontWeight='bold'
                    >
                        Введите входные данные для консоли:
                    </Typography>

                        <TextField
                            fullWidth
                            multiline
                            minRows={2}
                            maxRows={6}
                            helperText={ !input ? 'Введите входные данные с консоли' : '' }
                            label={"Введите входные данные"}
                            value={ input }
                            onChange={(e) => { 
                                setInput(e.target.value)
                                setCorrectAnswerShown(false)
                                
                            }}
                        />
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
                    borderColor : isSendButtonDisabled() ? colors.grey[600] : colors.green[800],
                    maxWidth : '30%',
                }}
                disabled={ isSendButtonDisabled() }
                onClick={sendAnswer}
            >
                Отправить
            </Button>

            <Stack 
                spacing='20px'
            >
                    <Typography
                        variant="h4"
                        fontSize='28px'
                        fontWeight='bold'
                    >
                        Вывод программы:
                    </Typography>

                { output &&
                    <Typography
                        variant="body1"
                        fontSize='22px'
                    >
                        {output}
                    </Typography>
                }
            </Stack>            

        </Stack>

        </Stack>
    )
}