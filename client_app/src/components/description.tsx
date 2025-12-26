import { Stack, Typography } from "@mui/material"

export const Description = () => {

    return (
        <Stack
            spacing='30px'
            marginTop='150px'
            alignSelf='center'>

                <Typography
                    variant="h2"
                    fontWeight='bold'
                    alignSelf='center'
                    >
                        RISC-V Course
                </Typography>

                <Typography 
                    whiteSpace='10px'
                    maxWidth='75vw'
                    textAlign='justify'
                    >
                    <Typography
                        variant="h5"
                        component='span'
                        fontSize='26px'
                        fontWeight='bold'
                        >
                            RISC-V Course -   
                    </Typography>
                    <Typography
                        marginInline='5px'
                        variant="h5"
                        
                        component='span'
                        fontSize='26px'
                        >
                            система для решения задач по архитектуре RISC-V и программированию на языке ассемблера RISC-V.
                    </Typography>
                    <Typography
                        component='br' 
                    />
                    <Typography
                        component='br' 
                    />
                    <Typography
                        variant="h5"
                        
                        component='span'
                        fontSize='26px'
                        >
                            Система содержит болки с теорией и теоретические вопросы по архитектуре Risc-V, а также задачи по программированию на языке Ассемблера RISC-V
                    </Typography>
                    <Typography
                        component='br' 
                    />
                    <Typography
                        component='br' 
                    />
                    <Typography
                        variant="h5"
                        
                        component='span'
                        fontSize='26px'
                        >
                            Изучайте архитектуру и решайте задачи по RISC-V!
                    </Typography>
                </Typography>

            </Stack>
    )
}