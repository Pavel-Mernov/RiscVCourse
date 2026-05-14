import { Typography } from "@mui/material"


type Props = {
    key ?: string | number
    inline ?: boolean
    children : string
}

export default ({ children, inline } : Props) => {

    return (
        <Typography
            component='code'
            fontSize='20px'
            marginInlineEnd={ inline ? '5px' : undefined }
            padding={ inline ? '5px' : '10px' }
            style={{ whiteSpace : 'pre-line' }}
            sx={{
                border : 'solid',
                borderWidth : '1px',
                borderColor : 'black',
                background : '#dfdfdf',
            }}
        >
            { children }
        </Typography>
    )
}