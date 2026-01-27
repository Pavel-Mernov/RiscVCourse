import { Button, Checkbox, colors, Stack, TextField, Typography } from "@mui/material"
import { useState } from "react"
import Navbar from "../components/navbar"
import { useAuth } from "../context/AuthContext"
import { Navigate, useNavigate } from "react-router-dom"

const isValidDate = (dateStr: string) => {
    // Регулярное выражение для двух форматов: с временем и без
    const regex = /^(\d{2})\.(\d{2})\.(\d{4})(?: (\d{2}):(\d{2}))?$/;
    const match = dateStr.match(regex);
    if (!match) return false;

    const day = Number(match[1]);
    const month = Number(match[2]);
    const year = Number(match[3]);

    const hour = match[4] !== undefined ? Number(match[4]) : 0;
    const minute = match[5] !== undefined ? Number(match[5]) : 0;

    
    // Проверка диапазонов
    if (
        month < 1 || month > 12 ||
        day < 1 || day > 31 ||
        year < 2000 || year > 2099 ||
        hour < 0 || hour > 23 ||
        minute < 0 || minute > 59
    ) return false;

    // Проверяем, что дата корректная с учётом месяца и високосных лет
    const date = new Date(year, month - 1, day, hour, minute);
    if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day ||
        date.getHours() !== hour ||
        date.getMinutes() !== minute
    ) return false;

    return true;
}

function toTimestampTz(dateStr: string): string | null {
    if (!isValidDate(dateStr)) return null;

    const regex = /^(\d{2})\.(\d{2})\.(\d{4})(?: (\d{2}):(\d{2}))?$/;
    const match = dateStr.match(regex)!;

    const day = Number(match[1]);
    const month = Number(match[2]);
    const year = Number(match[3]);
    const hour = match[4] !== undefined ? Number(match[4]) : 0;
    const minute = match[5] !== undefined ? Number(match[5]) : 0;

    // Создаём объект Date в локальном времени
    const date = new Date(year, month - 1, day, hour, minute);

    // Преобразуем в ISO строку в UTC (формат timestamptz)
    return date.toISOString();
}

export default () => {
    const { isTokenValid, isUserValidTeacher } = useAuth()

    const [title, setTitle] = useState('')
    const [titleError, setTitleError] = useState(false)

    const [description, setDescription] = useState<string | undefined>(undefined)
    const [authorized_only, setAuthorizedOnly] = useState<boolean>(false)

    const [deadline, setDeadline] = useState<string>('')
    const [deadLineError, setDeadlineError] = useState('')

    const { accessToken } = useAuth()

    const navigate = useNavigate()

    const formatDateTime = (value : string) => {
        const digits = value.replace(/\D/g, '').slice(0, 12); // только цифры, максимум 12 (ДДММГГГГччмм)
        let formatted = '';

        if (digits.length <= 2) {
            formatted = digits;
        } else if (digits.length <= 4) {
            formatted = digits.slice(0, 2) + '.' + digits.slice(2);
        } else if (digits.length <= 8) {
            formatted = digits.slice(0, 2) + '.' + digits.slice(2, 4) + '.' + digits.slice(4, 8);
        } else if (digits.length <= 10) {
            formatted = digits.slice(0, 2) + '.' + digits.slice(2, 4) + '.' + digits.slice(4, 8) + ' ' + digits.slice(8, 10);
        } else {
            formatted = digits.slice(0, 2) + '.' + digits.slice(2, 4) + '.' + digits.slice(4, 8) + ' ' + digits.slice(8, 10) + ':' + digits.slice(10, 12);
        }

        return formatted;
    };

    const handleChange = (e : { target : { value : string } }) => {
        const rawValue = e.target.value;
        // Извлекаем только цифры из ввода (ДДММГГГГччмм)
        const digitsOnly = rawValue.replace(/\D/g, '').slice(0, 12);
        
        
        
        // Максимум 8 цифр для даты + максимум 4 цифр для времени (ччмм)
        const formattedDate = formatDateTime(digitsOnly)

        setDeadlineError('')
        setDeadline(formattedDate); 
    };

    const isValid = () => {
        if (!title) {
            setTitleError(true)
            return false;
        }

        if (deadline) {
            if (deadline.length != 10 && deadline.length != 16) {
                
                setDeadlineError('Введите дату в формате ДД.ММ.ГГГГ или ДД.ММ.ГГГГ чч:мм')
                return false
            }

            if (!isValidDate(deadline)) {
                setDeadlineError('Некорректный формат даты. Введите дату в формате ДД.ММ.ГГГГ или ДД.ММ.ГГГГ чч:мм')
                return false
            }
        }

        return true;
    } 

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

    const fetchAddContest = async () => {
                        if (!isValid() ) {
                            return
                        }

                        const deadlineTimestampTz = toTimestampTz(deadline)

                        console.log(deadlineTimestampTz)

                        const newContest = {
                            title,
                            description,
                            authorized_only,
                            deadline : deadlineTimestampTz
                        }

                        const PORT = 3002
                        const serverIp = '130.49.150.32'
                        const url = `http://${serverIp}:${PORT}/api/contests`

                        const response = await fetch(url, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer: ${accessToken}`,
                            },
                            body: JSON.stringify(newContest),
                            
                        })  
                        
                        console.log(JSON.stringify(response))

                        navigate(-1)
                    }

    return (
        <Stack
            spacing='150px'>

            <Navbar />

            <Stack
                spacing='40px'
                alignSelf='center'
                width='75%'>

                <Button
                    variant="outlined"
                    
                    sx={{ maxWidth : '300px', fontWeight : 'bold', fontSize : '18px' }}
                    onClick={() => { navigate(-1) }}
                >
                    Назад
                </Button>

                <TextField 
                    sx={{marginTop: '50px', background : 'white'}} 
                    variant="filled" 
                    value={title} 
                    onChange={(e) => { 
                        setTitleError(false)
                        setTitle(e.target.value) 
                    }} 
                    label="Введите название контеста" 
                    helperText={ titleError ? "Название контеста не может быть пустым" : "" }
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

                <Stack
                    direction='row'
                    alignItems='center'
                    spacing='15px'
                >
                    <Typography
                        fontSize='24px'
                    >
                        Только для авторизованных пользователей:
                    </Typography>
                    <Checkbox
                        checked={authorized_only}
                        onChange={(e) => { setAuthorizedOnly(e.target.checked) }}
                    />
                </Stack>

                <TextField
                    label="Введите дедлайн"
                    value={deadline}
                    onChange={handleChange}
                    variant="outlined"
                    error={!!deadLineError}
                    placeholder="ДД.ММ.ГГГГ чч:мм"
                    helperText={deadLineError}
                    inputProps={{ maxLength: 17 }} // учтем 8 (дата) + 4 (время) + 2 точки
                />

                <Button 
                    sx={{ background : colors.green[500], fontSize : '24px', fontWeight : 'bold' }}
                    variant="contained"
                    onClick={fetchAddContest}
                >
                    Добавить контест
                </Button>
            </Stack>
        </Stack>
    )
}