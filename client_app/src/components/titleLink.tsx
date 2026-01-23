import { colors, Stack, Typography } from "@mui/material"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

type Props = {
    key ?: string | number,
    link ?: string,
    title : string,
    marginTop ?: string | number,
}

export default (props : Props) => {
    const { link, title, marginTop } = props

    const [isMouseEntered, setMouseEntered] = useState(false)

    const navigate = useNavigate()

    const maxLength = 69

    return (
        <Stack
            onMouseEnter={() => setMouseEntered(true)}
            onMouseLeave={() => setMouseEntered(false)} 
            onClick={() => { 
                if (link) {
                    navigate(link)
                } 
            }} 
            sx={{
                width : '100%',
                border : '2px solid',
                padding : '10px',
                marginTop : marginTop,
                borderColor : isMouseEntered ? colors.lightBlue[400] : colors.grey[500]
            }}
            
        >
            <Typography
                color={ isMouseEntered ? colors.lightBlue[400] : colors.grey[500] }
                variant="h4"
                sx={{
                    
                }}
            >
                { title.length <= maxLength ? title : title.slice(0, maxLength - 1) + '...' }
            </Typography>

        </Stack>
    )
}