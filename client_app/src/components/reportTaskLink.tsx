import { colors, Stack, Typography } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface Props {
    taskId : string
    title : string
    points : number | undefined
}

export default function ReportTaskLink({ taskId, title, points }: Props) {
    const [isMouseEntered, setMouseEntered] = useState(false)

    const navigate = useNavigate()
    const hasPoints = points !== undefined
    const isZeroPoints = points === 0
    const pointsColor = isZeroPoints ? colors.red[500] : colors.green[500]

    return (
        <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            onMouseEnter={() => setMouseEntered(true)}
            onMouseLeave={() => setMouseEntered(false)}
            onClick={() => navigate("/tasks/" + taskId)}
            sx={{
                border: "2px solid",
                borderColor: isMouseEntered ? colors.lightBlue[400] : colors.grey[500],
                color: isMouseEntered ? colors.lightBlue[400] : colors.grey[500],
                cursor: "pointer",
                padding: "10px",
                transform: isMouseEntered ? "scale(1.01)" : "scale(1)",
                transition: "transform 0.15s ease, border-color 0.15s ease, color 0.15s ease",
            }}
        >
            <Typography color="inherit" variant="h5">
                {title}
            </Typography>

            {
                hasPoints ? (
                    <Stack
                        alignItems="center"
                        justifyContent="center"
                        sx={{
                            minWidth: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            border: "2px solid",
                            borderColor: pointsColor,
                            color: pointsColor,
                            flexShrink: 0,
                            padding: "5px",
                        }}
                    >
                        <Typography color="inherit" variant="h6" fontWeight='bold'>
                            {points}
                        </Typography>
                    </Stack>
                ) : (
                    <Typography color="inherit" variant="h5">
                        {""}
                    </Typography>
                )
            }
        </Stack>
    )
}
