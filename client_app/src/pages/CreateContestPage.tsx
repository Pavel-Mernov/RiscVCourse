import { Checkbox, Stack, TextField, Typography } from "@mui/material"
import { useState } from "react"
import Navbar from "../components/navbar"
import { useAuth } from "../context/AuthContext"
import { Navigate } from "react-router-dom"

export default () => {
    const { isTokenValid, isUserValidTeacher } = useAuth()

    const [title, setTitle] = useState('')
    const [titleError, setTitleError] = useState(false)

    const [description, setDescription] = useState<string | undefined>(undefined)
    const [authorized_only, setAuthorizedOnly] = useState<boolean>(false)
    const [deadline, setDeadline] = useState<string>('')


    const formatDate = (value : string) => {
        const digits = value.replace(/\D/g, '').slice(0, 8); // только цифры, максимум 8 (ДДММГГГГ)
        let formatted = '';

        if (digits.length <= 2) {
        formatted = digits;
        } else if (digits.length <= 4) {
        formatted = digits.slice(0, 2) + '.' + digits.slice(2);
        } else {
        formatted = digits.slice(0, 2) + '.' + digits.slice(2, 4) + '.' + digits.slice(4, 8);
        }

        return formatted;
    };

    const handleChange = (e : { target : { value : string } }) => {
        const rawValue = e.target.value;
        // Извлекаем только цифры из ввода
        const digitsOnly = rawValue.replace(/\D/g, '').slice(0, 14); 
        // Максимум 8 цифр для даты + максимум 6 цифр для времени (ччммсс)
        setDeadline(formatDate(digitsOnly)); 
    };

    if (!isTokenValid()) {
        return <Navigate to='/login' />
    }

    if (!isUserValidTeacher()) {
        return (
            <Stack
                spacing='150px'
            >
                <Navbar />

                <Typography variant="h2" fontSize='30px' fontWeight='semiBold'>
                    403 Доступ Запрещён
                </Typography>
            </Stack>
        )
    }

    return (
        <Stack
            spacing='150px'>

            <Navbar />

            <Stack
                spacing='40px'
                alignSelf='center'
                width='75%'>

                <TextField 
                    sx={{marginTop: '20px', background : 'white'}} 
                    variant="filled" 
                    value={title} 
                    onChange={(e) => { 
                        setTitleError(false)
                        setTitle(e.target.value) 
                    }} 
                    label="Введите название контеста" 
                    error={titleError}    
                />

                <TextField 
                    sx={{marginTop: '20px', background : 'white'}} 
                    variant="filled" 
                    value={description} 
                    onChange={(e) => { 
                        setDescription(e.target.value) 
                    }} 
                    label="Введите описание"   
                />

                <Checkbox
                    checked={authorized_only}
                    onChange={(e) => { setAuthorizedOnly(e.target.checked) }}
                    inputProps={{ "aria-label" : 'Только' }}
                />

                <TextField
                label="Введите дедлайн"
                value={deadline}
                onChange={handleChange}
                variant="outlined"
                placeholder="Введите дедлайн"
                inputProps={{ maxLength: 17 }} // учтем 8 (дата) + 6 (время с секундами) + 2 точки
                />
            </Stack>
        </Stack>
    )
}