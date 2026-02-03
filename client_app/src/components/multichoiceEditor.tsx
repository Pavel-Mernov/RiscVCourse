import { Box, Checkbox, TextField, IconButton, Button, colors, Typography } from "@mui/material";
import type { MultichoiceAnswer, MultichoiceAnswers } from "../pages/CreateTaskPage";
import CloseIcon from "@mui/icons-material/Close";

interface Props {
  multichoiceAnswers: MultichoiceAnswers;
  enableSetPointsAndAttempts : boolean;
  setAnswers: (answers: MultichoiceAnswers) => void;
}

const MultichoiceEditor: React.FC<Props> = ({ multichoiceAnswers, enableSetPointsAndAttempts, setAnswers }) => {
  
    type ArrayTuple = [MultichoiceAnswer, ...MultichoiceAnswer[]]

    const handleAnswerChange = (index: number, value: string) => {
    const updated = [...multichoiceAnswers.answers];
    updated[index].answer = value;

    const updatedWith0 = updated.length != 0 ? updated as ArrayTuple : [{ answer : '', is_correct : false }] as ArrayTuple

    setAnswers({ ...multichoiceAnswers, answers: updatedWith0 });
  };

  const handleCorrectChange = (index: number) => {
    const updated = [...multichoiceAnswers.answers].map((a, i) => ({
      ...a,
      is_correct: i === index ? !a.is_correct : a.is_correct
    })) as ArrayTuple;

    setAnswers({ ...multichoiceAnswers, answers: updated });
  };

  const handleDelete = (index: number) => {
    const updated = multichoiceAnswers.answers.filter((_, i) => i !== index);

    const updatedWithFirstElement = updated.length != 0 ? [updated[0], ...updated ] : ([{ answer: '', is_correct : false }])

    setAnswers({ ...multichoiceAnswers, answers: updatedWithFirstElement as any });
  };

  const addAnswer = () => {
    const updated = [
      ...multichoiceAnswers.answers,
      { answer: "", is_correct: false }
    ] as ArrayTuple

    setAnswers({ ...multichoiceAnswers, answers: updated });
  };

  const handlePositiveInt = (field: "points" | "attempts", value: string) => {
    const num = value.replace(/[^0-9]/g, "");
    setAnswers({ ...multichoiceAnswers, [field]: num ? Number(num) : undefined });
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      {multichoiceAnswers.answers.map((item, index) => (
        <Box
          key={index}
          display="flex"
          flexDirection="column"
          border="1px solid #ccc"
          padding={1}
          borderRadius={1}
          gap={1}
        >
          <Box display="flex" alignItems="center">
            <Checkbox
              checked={!!item.is_correct}
              onChange={() => handleCorrectChange(index)}
            />
            <Typography
                variant="body2"
                fontSize='18px'
            >
                Сделать правильным
            </Typography>
          </Box>

          <Box display="flex" alignItems="center">
            <TextField
              fullWidth
              label="Введите ответ"
              value={item.answer}
              onChange={(e) => handleAnswerChange(index, e.target.value)}
            />
            <IconButton onClick={() => handleDelete(index)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      ))}

      <Button 
        variant="contained" 

        onClick={addAnswer}
        sx={{
                    maxWidth : '30%',
                    
                    paddingTop : '10px',
                    paddingBottom : '10px',
                    paddingLeft : '25px',
                    paddingRight : '25px',
                    borderRadius : '10px',
                    background : colors.green[400],
                    fontSize : '18px',
                    fontWeight : 'semiBold'
                }}
        >
        Добавить ответ
      </Button>

    { enableSetPointsAndAttempts &&
      <TextField
        label="Количество баллов"
        value={multichoiceAnswers.points ?? ""}
        onChange={(e) => handlePositiveInt("points", e.target.value)}
        inputProps={{ inputMode: "numeric" }}
      />
    }

    { enableSetPointsAndAttempts &&
      <TextField
        label="Количество попыток"
        value={multichoiceAnswers.attempts ?? ""}
        onChange={(e) => handlePositiveInt("attempts", e.target.value)}
        inputProps={{ inputMode: "numeric" }}
      />
    }
    </Box>
  );
};

export default MultichoiceEditor;