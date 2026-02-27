import { TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material"
import type { Submission } from "./codeTaskView"
import { blue, green, red } from "@mui/material/colors"

type Props = {
    taskName : string
    submissions : Submission[]
}

export default ({ taskName, submissions } : Props) => {

    return (
            <TableContainer
                component={Paper}
                sx={{ maxWidth: '60%', margin: 'auto', mt: 4, borderRadius: 2, overflow: 'hidden' }}
            >
            <Table>
                <TableHead>
                <TableRow
                    sx={{
                    backgroundColor: '#f5f5f5',
                    MozBorderRadiusTopright: '12px', // Работает для TableContainer, для TableRow нет
                    MozBorderRadiusTopleft: '12px', // Работает для TableContainer, для TableRow нет
                    }}
                >
                    <TableCell
                        sx={{
                            fontWeight: 'bold',
                            
                            borderTopLeftRadius: '12px',
                            borderBottomLeftRadius: '12px',
                            backgroundColor: '#e0e0e0',
                        }}
                    >
                        Задача
                    </TableCell>
                    <TableCell
                        sx={{
                            fontWeight: 'bold',
                            backgroundColor: '#e0e0e0',
                        }}
                    >
                        Дата отправки
                    </TableCell>
                    <TableCell
                        sx={{
                            fontWeight: 'bold',
                            borderTopRightRadius: '12px',
                            borderBottomRightRadius: '12px',
                            backgroundColor: '#e0e0e0',
                        }}
                    >
                        Вердикт
                    </TableCell>
                </TableRow>
                </TableHead>
                <TableBody>
                { submissions.map(({ timestamp, verdict }, index) => (
                    <TableRow
                    key={index}
                    sx={{
                        borderTop: index === 0 ? '1px solid #444' : undefined,
                        borderBottom: index === submissions.length - 1 ? '1px solid #444' : undefined,
                    }}
                    >
                    <TableCell sx={{ whiteSpace: 'pre-line', fontSize : '20px' }} >{taskName.length > 20 ? taskName.slice(0, 17) + '...' : taskName}</TableCell>
                    <TableCell sx={{ whiteSpace: 'pre-line', fontSize : '20px' }} >{new Intl.DateTimeFormat('ru-RU', {
                            timeZone: 'Europe/Moscow',
                            dateStyle: 'medium',
                            timeStyle: 'short'
                        }).format(new Date(timestamp))}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'pre-line', fontSize : '20px', color : (!verdict) ? blue[500] : (verdict == 'OK') ? green[500] : red[500] }} >
                        { verdict || 'Waiting' }
                    </TableCell>
                    
                </TableRow>

                ))}
                </TableBody>
            </Table>
            </TableContainer>
    )
}