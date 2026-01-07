import { Button, createTheme, Stack, TextField, ThemeProvider, Typography } from "@mui/material"
import Navbar from "../components/navbar"
import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"

export default () => {
    const [loginText, setLoginText] = useState('')

    const [loginError, setLoginError] = useState(false)

    const [passwordText, setPasswordText] = useState('')

    const { setAccessToken } = useAuth()

    const navigate = useNavigate()

    const blueButtonTheme = createTheme({
        palette : {
            primary : {
                main : '#1f1faf'
            }
        }
    })

    const fetchLogin = async () => {

        if (!loginText.trim() || !passwordText.trim()) {
            setLoginError(true)
            return
        }

        const url = `http://localhost:3003/api/login`
        const method = 'POST'
        const data = {
            login : loginText,
            password : passwordText,
        }

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
            
        })
        
        if (!response.ok) {
            setLoginError(true)
            return
        }

        const result = await response.json()

        // console.log(JSON.stringify(result))

        if ('accessToken' in result) {
            
            setAccessToken(result.accessToken)

            console.log('Auth successful')
            navigate(-1)
        }
    }

    return <Stack
    
    >
        <Navbar />    

        <Stack
            marginTop='150px'
            spacing='25px'
            alignItems='center'
        >
            <Typography
                variant="h2"
                >
                    Авторизация
                </Typography>

            <Stack
                padding='20px'
                border='2px solid black'
                sx={{
                    background : '#cfcfcf',
                    minWidth : '500px'
                }}
            >
                <TextField 
                    sx={{marginTop: '20px', background : 'white'}} 
                    variant="filled" 
                    value={loginText} 
                    onChange={(e) => { 
                        setLoginError(false)
                        setLoginText(e.target.value) 
                    }} 
                    label="Введите логин" 
                    error={loginError}    
                />
                
                <TextField 
                    sx={{marginTop: '20px', background : 'white'}} 
                    variant="filled"
                    type="password" 
                    value={passwordText} 
                    onChange={(e) => { 
                        setPasswordText(e.target.value) 
                        setLoginError(false)
                    }} 
                    label="Введите пароль" 
                    error={loginError}    
                />

                <ThemeProvider theme={blueButtonTheme}>
                    <Button 
                        variant="contained" 
                        sx={{ marginTop : '15px' }}
                        onClick={fetchLogin}
                        >
                        <Typography variant="h3" fontSize='22px' fontWeight='semiBold'>Войти через ЕЛК ВШЭ</Typography>
                    </Button>
                </ThemeProvider>
                
            </Stack>
        </Stack>
    </Stack>
}