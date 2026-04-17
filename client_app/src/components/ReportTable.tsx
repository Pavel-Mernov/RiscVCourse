import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Accordion, AccordionDetails, AccordionSummary, Box, colors, Stack, Typography } from "@mui/material";
import { type TaskDict } from "../pages/ReportPage";
import ReportTaskLink from "./reportTaskLink";

interface Props {
    pointsForAllTasks : TaskDict
}

export default function ReportTable({ pointsForAllTasks }: Props) {
    const contestEntries = Object.entries(pointsForAllTasks)

    return (
        <Stack
            spacing={2}
            sx={{
                alignSelf : 'center',
                width: "75vw",
                maxWidth: "75vw",
            }}
        >
            {contestEntries.map(([contestId, contestData]) => (
                <Accordion
                    key={contestId}
                    disableGutters
                    elevation={0}
                    sx={{
                        border: "none",
                        "&::before": {
                            display: "none",
                        },
                    }}
                >
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon sx={{ color: colors.grey[500] }} />}
                        sx={{
                            padding: 0,
                            minHeight: "unset",
                            "& .MuiAccordionSummary-content": {
                                margin: 0,
                            },
                        }}
                    >
                        <Box
                            
                            sx={{
                                width: "100%",
                                border: "2px solid",
                                borderColor: colors.grey[500],
                                padding: "10px",
                            }}
                        >
                            <Typography 
                                color={colors.grey[500]} 
                                variant="h4"
                                
                                >
                                {contestData.title}
                            </Typography>
                        </Box>
                    </AccordionSummary>

                    <AccordionDetails sx={{ padding: "12px 0 0" }}>
                        <Stack 
                            spacing={1.5} 
                            padding='20px'
                            sx={{
                                border : 'solid',
                                borderColor : colors.grey[500],
                                borderWidth : '2px'
                            }}
                            >
                            {Object.entries(contestData.tasks).map(([taskId, taskData]) => (
                                <ReportTaskLink
                                    key={taskId}
                                    taskId={taskId}
                                    title={taskData.name}
                                    points={taskData.points}
                                />
                            ))}
                        </Stack>
                    </AccordionDetails>
                </Accordion>
            ))}
        </Stack>
    );
}
