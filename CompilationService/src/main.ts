
import express from 'express';
import { exec } from 'child_process';
import path from 'path';
import { dirname } from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const app = express();


const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Путь к rars jar, поместите свой rars.jar в нужную папку
const RARS_JAR_PATH = path.resolve(__dirname, '../rars.jar');

app.post('/run', async (req, res) => {
  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ error: 'Нет кода в теле запроса' });
  }

  try {
    // Запишем код во временный файл
    const tempPath = path.resolve(__dirname, 'temp.s');
    await fs.writeFile(tempPath, code, { encoding: 'utf-8' });

    // Запуск rars в режиме компиляции или исполнения
    
    
    // Например, запускаем программу с выводом в консоль:
    // Параметры rars: 
    //  единичная команда запуска (simulate, assemble, jar и др.) — уточните для вашей задачи
    const cmd = `java -jar "${RARS_JAR_PATH}" nc "q run ${tempPath}"`;

    exec(cmd, { timeout: 5000 }, (error, stdout, stderr) => {
      if (error) {
        return res.status(500).json({ error: error.message, stderr });
      }

      res.json({ output: stdout.trim(), error: stderr.trim() });
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});
