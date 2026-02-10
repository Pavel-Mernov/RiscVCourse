import CloseIcon from "@mui/icons-material/Close"
import { Box, TextField, IconButton, Button, colors, Stack } from "@mui/material";
import type { CodeData, Test } from "../pages/CreateTaskPage";


interface Props {
  taskData: CodeData;
  enableSetPointsAndAttempts : boolean;
  setData: (data: CodeData) => void;
  tests : Test[];
  setTests : (tests : Test[]) => void;
  deleteTest ?: (test : Test) => void;
}

const CodeTaskEditor: React.FC<Props> = ({ taskData, setData, enableSetPointsAndAttempts, tests, setTests, deleteTest }) => {
  

    const handleTestChange = (index: number, output : string, input ?: string) => {
        const updated = [...tests];
        updated[index] = { input, expected_output : output };

        setTests(updated);
    };

    const handleDelete = (index: number) => {
        const testToDelete = tests[index]

        if (testToDelete.id && deleteTest) {
            deleteTest(testToDelete)
        }

        const updated = tests.filter((_, i) => i !== index);

        setTests(updated);
    };

  const addTest = () => {
    const updated : Test[] = [
      ...tests,
      {
        input : '',
        expected_output: ""
      }
    ]

    setTests(updated)
  };

  const handlePositiveInt = (field: keyof CodeData, value: string) => {
    const num = value.replace(/[^0-9]/g, "");

    if (num) {
        setData({ ...taskData, [field]: num ? Number(num) : undefined });
    }
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>

    
    
      <TextField
        label="Ограничение по времени исполнения, мс"
        value={taskData.time_limit_ms ?? ""}
        onChange={(e) => handlePositiveInt('time_limit_ms', e.target.value)}
        inputProps={{ inputMode: "numeric" }}
      />

      <TextField
        label="Ограничение по памяти, кБ"
        value={taskData.memory_limit_kb ?? ""}
        onChange={(e) => handlePositiveInt('memory_limit_kb', e.target.value)}
        inputProps={{ inputMode: "numeric" }}
      />

      <TextField
        label="Формат входных данных"
        value={taskData.input_data_format ?? ""}
        multiline
        minRows={5}
        maxRows={8}
        onChange={(e) => setData({...taskData, input_data_format : e.target.value })}
        
      />

      <TextField
        label="Формат выходных данных"
        value={taskData.output_data_format ?? ""}
        multiline
        minRows={3}
        maxRows={5}
        onChange={(e) => setData({...taskData, output_data_format : e.target.value })}
        
      />

      {tests.map(({ input, expected_output }, index) => (
        <Box
          key={index}
          display="flex"
          flexDirection="column"
          border="1px solid #ccc"
          padding='20px'
          
          borderRadius={1}
          gap={1}
          width='60%'
        >

          <Box 
            display="flex" 
            alignItems="center"
            width='100%'
            >
            
            <Stack spacing='10px' width='100%'>
                <TextField
                    fullWidth
                    multiline
                    minRows={2}
                    label="Введите входные данные"
                    value={input ?? ''}
                    onChange={(e) => handleTestChange(index, expected_output,  e.target.value)}
                />   
                <TextField
                    fullWidth
                    multiline
                    minRows={2}
                    label="Введите правильный ответ"
                    value={expected_output}
                    onChange={(e) => handleTestChange(index, e.target.value, input)}
                />                
            </Stack>

            <IconButton onClick={() => handleDelete(index)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      ))}

      <Button 
        variant="contained" 

        onClick={addTest}
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
        Добавить тест
      </Button>

    
    <TextField
        label="Показывать тестов"
        value={taskData.tests_shown ?? ""}
        onChange={(e) => handlePositiveInt('tests_shown', e.target.value)}
        inputProps={{ inputMode: "numeric" }}
    />
    

    { enableSetPointsAndAttempts &&
      <TextField
        label="Количество баллов"
        value={taskData.points ?? ""}
        onChange={(e) => handlePositiveInt("points", e.target.value)}
        inputProps={{ inputMode: "numeric" }}
      />
    }

    { enableSetPointsAndAttempts &&
      <TextField
        label="Количество попыток"
        value={taskData.attempts ?? ""}
        onChange={(e) => handlePositiveInt("attempts", e.target.value)}
        inputProps={{ inputMode: "numeric" }}
      />
    }
    </Box>
  );
};

export default CodeTaskEditor;