import { colors, Stack, Typography } from "@mui/material"
import type { Contest } from "../pages/ContestsPage"
import { useState } from "react"

type Props = {
    key ?: string | number,
    contest : Contest
}

export default (props : Props) => {
    const { title } = props.contest

    const [isMouseEntered, setMouseEntered] = useState(false)

    return (
        <Stack
            onMouseEnter={() => setMouseEntered(true)}
            onMouseLeave={() => setMouseEntered(false)} 
            sx={{
                width : '100%',
                border : '2px solid',
                padding : '10px',
                borderColor : isMouseEntered ? colors.lightBlue[400] : colors.grey[500]
            }}
            
        >
            <Typography
                color={ isMouseEntered ? colors.lightBlue[400] : colors.grey[500] }
                variant="h4"
                sx={{
                    
                }}
            >
                { title }
            </Typography>

        </Stack>
    )
}