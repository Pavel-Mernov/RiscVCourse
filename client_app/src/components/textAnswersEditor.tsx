import { Box, TextField, IconButton, Button, colors } from "@mui/material";
import type { TextAnswer } from "../pages/CreateTaskPage";
import CloseIcon from "@mui/icons-material/Close"

interface Props {
  answers: TextAnswer;
  enableSetPointsAndAttempts : boolean;
  setAnswers: (answers: TextAnswer) => void;
}

type ArrayTuple = [string, ...string[]]

const TextAnswersEditor: React.FC<Props> = ({ answers, enableSetPointsAndAttempts, setAnswers }) => {
  

    const handleAnswerChange = (index: number, value: string) => {
        const updated = [...answers.correct_answers];
        updated[index] = value;

        const updatedWith0 = updated.length != 0 ? updated as ArrayTuple : [''] as ArrayTuple

        setAnswers({ ...answers, correct_answers: updatedWith0 });
    };

    const handleDelete = (index: number) => {
        const updated = answers.correct_answers.filter((_, i) => i !== index);

        const updatedWithFirstElement = updated.length != 0 ? [updated[0], ...updated ] : ([{ answer: '', is_correct : false }])

        setAnswers({ ...answers, correct_answers: updatedWithFirstElement as any });
    };

  const addAnswer = () => {
    const updated = [
      ...answers.correct_answers,
      ''
    ] as ArrayTuple

    setAnswers({ ...answers, correct_answers: updated });
  };

  const handlePositiveInt = (field: "points" | "attempts", value: string) => {
    const num = value.replace(/[^0-9]/g, "");
    setAnswers({ ...answers, [field]: num ? Number(num) : undefined });
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      {answers.correct_answers.map((item, index) => (
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
            <TextField
              fullWidth
              label="Введите ответ"
              value={item}
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
        value={answers.points ?? ""}
        onChange={(e) => handlePositiveInt("points", e.target.value)}
        inputProps={{ inputMode: "numeric" }}
      />
    }

    { enableSetPointsAndAttempts &&
      <TextField
        label="Количество попыток"
        value={answers.attempts ?? ""}
        onChange={(e) => handlePositiveInt("attempts", e.target.value)}
        inputProps={{ inputMode: "numeric" }}
      />
    }
    </Box>
  );
};

export default TextAnswersEditor;