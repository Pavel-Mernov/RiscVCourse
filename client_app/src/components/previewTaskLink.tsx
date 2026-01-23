import { colors, Stack, Typography } from "@mui/material"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

interface Task {
    id : string,
    name : string,
    text : string
}

interface Props {
    task : Task
    maxTextLength ?: number
}

export default ({ 'task' : { id, name, text }, maxTextLength } : Props) => {
    const navigate = useNavigate()

    const [isMouseEntered, setMouseEntered] = useState(false)


    const maxNameLength = 50
    const resultMaxTextLength = maxTextLength ?? 500

    return (
        <Stack
            component='div'
            onClick={() => navigate('/tasks/' + id)}
            spacing='15px'
            padding='20px'
            onMouseEnter={() => setMouseEntered(true)}
            onMouseLeave={() => setMouseEntered(false)}
            sx={{ 
                alignSelf : 'center',
                width : '75vw',
                border : 'solid', 
                borderWidth : '3px', 
                borderRadius : '12px', 
                borderColor : colors.grey[500], 
                transform: isMouseEntered ? 'scale(1.02)' : 'scale(1)',
            }}
        >
            <Typography
                variant="h3"
                fontWeight='bold'
                fontSize='25px'
                textAlign='center'
                alignSelf='center'
            >
                { name.length <= maxNameLength ? name : name.slice(0, maxNameLength - 1) + '...' }
            </Typography>

            <Typography
                variant='h5'
                fontSize='22px'
                textAlign='justify'
                alignSelf='center'
                style={{ whiteSpace : 'pre-line' }}
            >
                { text.length <= resultMaxTextLength ? text : text.slice(0, resultMaxTextLength - 1) + '...' }
            </Typography>
        </Stack>
    )
}