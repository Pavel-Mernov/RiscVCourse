import { Button, Checkbox, colors, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/navbar";
import { useAuth } from "../context/AuthContext";
import DeletionDialog from "../components/deletionDialog";

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

function toInputDate(dateStr : string) {
    if (!dateStr) {
        return ''
    }

    try {
        const options: Intl.DateTimeFormatOptions = {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            // timeZone: 'Europe/Moscow', // или другая нужная зона

        };

        const date = new Date(dateStr).toLocaleString(undefined, options).replace(',', '')

        // console.log(date)

        return date
    }
    catch {
        return ''
    }
}

export default () => {
    const { id } = useParams()

    const { isTokenValid, isUserValidTeacher, accessToken } = useAuth()

    const [title, setTitle] = useState('')
    const [titleError, setTitleError] = useState(false)

    const [description, setDescription] = useState<string>('')
    const [authorized_only, setAuthorizedOnly] = useState<boolean>(false)

    const [deadline, setDeadline] = useState<string>('')
    const [deadLineError, setDeadlineError] = useState('')

    const [isDeletionDialogOpen, setDeletionDialogOpen] = useState(false)

    const navigate = useNavigate()

    useEffect(() => { 
        const fetchContest = async () => {
            const PORT = 3002
            const serverIp = '130.49.150.32'
            const url = `http://${serverIp}:${PORT}/api/contests/${id}`

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer: ${accessToken}`,
                },
                
            })
            .then(resp => resp.json())
            
            if (typeof response == 'object' && 'error' in response) {
                console.error('Error fetch: ' + response.error)
                return
            }

            // console.log(id, JSON.stringify(response))

            // setDeadline(response.deadline || '')

            setTitle(response.title)
            setDescription(response.description || '')
            setAuthorizedOnly(response.authorized_only)
            setDeadline(toInputDate(response.deadline))
        }

        fetchContest()
    }, [])

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

    const fetchUpdateContest = async () => {
                        if (!isValid() ) {
                            return
                        }

                        const deadlineTimestampTz = toTimestampTz(deadline)

                        const newContest = {
                            id,
                            title,
                            description,
                            authorized_only,
                            deadline : deadlineTimestampTz
                        }

                        const PORT = 3002
                        const serverIp = '130.49.150.32'
                        const url = `http://${serverIp}:${PORT}/api/contests/${id}`

                        // const response = 
                        await fetch(url, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer: ${accessToken}`,
                            },
                            body: JSON.stringify(newContest),
                            
                        }) 
                        .then(resp => resp.json()) 

                        navigate(-1)
                    }

    const fetchDeleteContest = async () => {

                    try {
                        const PORT = 3002
                        const serverIp = '130.49.150.32'
                        const url = `http://${serverIp}:${PORT}/api/contests/${id}`

                        // const response = 
                        await fetch(url, {
                            method: 'DELETE',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer: ${accessToken}`,
                            }
                            
                        }) 
                        // .then(resp => resp.json()) 

                        navigate('/contests')
                    }
                    catch {
                    }
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
                    onClick={fetchUpdateContest}
                >
                    Изменить контест
                </Button>

                <Button 
                    sx={{ borderColor : colors.red[500], borderWidth : '1px', fontSize : '20px', color : colors.red[500] }}
                    variant="outlined"
                    onClick={() => setDeletionDialogOpen(true)}
                >
                    Удалить контест
                </Button>
            </Stack>

            {
                isDeletionDialogOpen && <DeletionDialog 
                    onClose={() => setDeletionDialogOpen(false)} 
                    onDelete={async () => {
                        await fetchDeleteContest()
                        setDeletionDialogOpen(false)
                    }} 
                    title='Подтверждение удаления контеста' 
                    content='Вы действительно хотите удалить контест?' 
                />
            }
        </Stack>
    )
}