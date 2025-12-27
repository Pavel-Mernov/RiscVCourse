import { Button, createTheme, Stack, TextField, ThemeProvider, Typography } from "@mui/material"
import Navbar from "../components/navbar"
import { useState } from "react"

export default () => {
    const [loginText, setLoginText] = useState('')

    const [loginError, ] = useState(false)

    const [passwordText, setPasswordText] = useState('')

    const blueButtonTheme = createTheme({
        palette : {
            primary : {
                main : '#1f1faf'
            }
        }
    })

    const fetchLogin = async () => {
        
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
                    onChange={(e) => setLoginText(e.target.value)} 
                    label="Введите логин" 
                    error={loginError}    
                />
                
                <TextField 
                    sx={{marginTop: '20px', background : 'white'}} 
                    variant="filled"
                    type="password" 
                    value={passwordText} 
                    onChange={(e) => setPasswordText(e.target.value)} 
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