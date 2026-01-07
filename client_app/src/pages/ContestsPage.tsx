import { Button, colors, createTheme, Stack, TextField, ThemeProvider, Typography } from "@mui/material"
import Navbar from "../components/navbar"
import { useState } from "react"

export default () => {
    const [searchText, setSearchText] = useState('')

    const blueButtonTheme = createTheme({
        palette : {
            primary : {
                main : colors.lightBlue[400]
            }
        }
    })

    const fetchSearchContests = async () => {

    }

    return <Stack
    
    >
        <Navbar />  

        <Stack
            marginTop='150px'
            spacing='90px'
            
            alignItems='center'
        >

            <Typography
                variant="h2"
                fontWeight='bold'
                alignSelf='center'
            >
                Контесты
            </Typography>

            <Stack
                sx={{ width : '70%' }}
                direction='row'
                alignItems='stretch'
                spacing='15px'   
            >


                <TextField 
                    sx={{
                        marginTop: '20px',
                        width : '100%', 
                        background : 'white', 
                        border : '2px solid', 
                        borderColor : '#5f5f5f'
                    }} 
                    variant="filled"
                    
                    value={searchText} 
                    onChange={(e) => { 
                        setSearchText(e.target.value) 
                        
                    }} 
                    label="Введите название контеста" 
                        
                />

                <ThemeProvider theme={blueButtonTheme}>
                    <Button 
                        variant="contained" 
                        sx={{ 
                            
                            marginTop : '15px', 
                            paddingTop : '15px', 
                            paddingBottom : '15px', 
                            paddingLeft : '40px', 
                            paddingRight : '40px' 
                        }}
                        onClick={fetchSearchContests}
                        >
                        <Typography variant="h3" fontSize='22px' fontWeight='bold' color="#fff">Найти</Typography>
                    </Button>
                </ThemeProvider>
            </Stack> 


        </Stack>  
    </Stack>
}