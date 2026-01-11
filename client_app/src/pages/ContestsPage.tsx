import { Button, colors, createTheme, Stack, TextField, ThemeProvider, Typography } from "@mui/material"
import Navbar from "../components/navbar"
import { useEffect, useState } from "react"
import ContestLink from "../components/titleLink"

export interface Contest {
    id : string,
    title : string,
    authorized_only ?: boolean,
}

async function getContests() {
    const PORT = 3002

    const url = `http://localhost:${PORT}/api/contests`

    const contestList = await fetch(url, {
        method : 'GET',
        headers : {
            'Content-Type': 'application/json'
                
        }
    })
    .then(resp => resp.json())
    .then(resp => resp.map((c : any) => c as Contest))
    .then(c => c as Contest[])

    return contestList
}

export default () => {
    const [searchText, setSearchText] = useState('')

    const [contests, setContests] = useState<Contest[]>([])

    useEffect(() => {
        const fetchContests = async () => { 
            const contestList = await getContests()

            setContests(contestList)
        }

        fetchContests()
    }, [])

    const blueButtonTheme = createTheme({
        palette : {
            primary : {
                main : colors.lightBlue[400]
            }
        }
    })

    const fetchSearchContests = async () => {
        const contestList = await getContests()

        if (searchText.trim() == '') {
            setContests(contestList as Contest[])

            
            return
        }

        const regex = new RegExp(searchText, 'i')

        const filteredContests = contestList.filter(c => regex.test(c.title))

        setContests(filteredContests)
    }

    // console.log(JSON.stringify(contests))

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

            <Stack
                width='70%'
                spacing='20px'
            >
                {
                    contests
                        .filter(contest => !contest.authorized_only)
                        .map(({ title, id }, i) => <ContestLink key={`link_${i}`} title={ title } link={ `/contests/${id}` } />)
                }
            </Stack>

        </Stack>  
    </Stack>
}