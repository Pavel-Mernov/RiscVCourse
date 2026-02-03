import { Box, Button, colors, FormControlLabel, IconButton, Radio, RadioGroup, TextField } from "@mui/material"
import type { ChoiceAnswers } from "../pages/CreateTaskPage"
import CloseIcon from "@mui/icons-material/Close"


interface Props {
  choiceAnswers: ChoiceAnswers;
  enableSetPointsAndAttempts : boolean;
  setChoiceAnswers: (answers: ChoiceAnswers) => void;
}

export default function ChoiceAnswersEditor({ choiceAnswers, enableSetPointsAndAttempts, setChoiceAnswers }: Props) {

  

  const updateAnswer = (index: number, value: string) => {
    const updated = [...choiceAnswers.answers];
    updated[index] = value;
    setChoiceAnswers({ ...choiceAnswers, answers: updated as [string, ...string[]] });
  };

  const addAnswer = () => {
    const updated = [...choiceAnswers.answers, ""];
    setChoiceAnswers({
      ...choiceAnswers,
      answers: updated as [string, ...string[]]
    });
  };

  const removeAnswer = (index: number) => {
    if (choiceAnswers.answers.length <= 1) return;

    const updated = choiceAnswers.answers.filter((_, i) => i !== index);

    let correct = choiceAnswers.correct_answer;
    if (correct === index) correct = 0;
    else if (correct > index) correct -= 1;

    setChoiceAnswers({
      ...choiceAnswers,
      answers: updated as [string, ...string[]],
      correct_answer: correct
    });
  };

  const updatePositiveInt = (field: "points" | "attempts", value: string) => {
    if (/^\d*$/.test(value)) {
      setChoiceAnswers({
        ...choiceAnswers,
        [field]: value === "" ? undefined : Number(value)
      });
    }
  };

  return (
    <Box>

      <RadioGroup
        value={choiceAnswers.correct_answer}
        onChange={e =>
          setChoiceAnswers({ ...choiceAnswers, correct_answer: Number(e.target.value) })
        }
      >
        {choiceAnswers.answers.map((answer, index) => (
          <Box
            key={index}
            sx={{
              border: "1px solid #ccc",
              borderRadius: 2,
              padding: 2,
              marginBottom: 2
            }}
          >
            <FormControlLabel
              value={index}
              control={<Radio />}
              label="Сделать правильным"
            />

            <Box sx={{ display: "flex", alignItems: "center" }}>
              <TextField
                fullWidth
                label="Введите ответ"
                value={answer}
                onChange={e => updateAnswer(index, e.target.value)}
              />

              <IconButton onClick={() => removeAnswer(index)}>
                <CloseIcon/>
              </IconButton>
            </Box>
          </Box>
        ))}
      </RadioGroup>

      <Button 
        variant="contained" 
        onClick={addAnswer}
        sx={{
            paddingTop : '10px',
            paddingBottom : '10px',
            paddingLeft : '25px',
            paddingRight : '25px',
            borderRadius : '10px',
            background : colors.green[400],
            fontSize : '18px',
            fontWeight : 'semiBold'
        }}>
        Добавить ответ
      </Button>

    { enableSetPointsAndAttempts &&
      <Box sx={{ marginTop: '40px' }}>
        <TextField
          label="Баллы"
          fullWidth
          value={choiceAnswers.points ?? ""}
          onChange={e => updatePositiveInt("points", e.target.value)}
          sx={{ marginBottom: 2 }}
        />

        <TextField
          label="Попытки"
          fullWidth
          value={choiceAnswers.attempts ?? ""}
          onChange={e => updatePositiveInt("attempts", e.target.value)}
        />
      </Box>
    }

    </Box>
  );
}