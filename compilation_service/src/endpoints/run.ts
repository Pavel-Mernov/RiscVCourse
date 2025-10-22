import path from 'path';
import { dirname } from 'path';

import fs, { rm } from 'fs/promises';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { makeTempDir } from '../makeTempDir.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Путь к rars jar, поместите свой rars.jar в нужную папку
const RARS_JAR_PATH = path.resolve(__dirname, '../../rars.jar');

type Request = {
    body : {
        code : string,
        input ?: string,
        filename ?: string,
        // type ?: 'stdin' | 'file' | 'both',
    }
}

type Response = {
    status : (status : number) => Response,
    json : (obj : object) => Response,
}

// Handler for POST: /compile endpoint
export async function compile(req : Request, res : Response) {

    let tempDir = ''

    const { 
        code, 
        input, 
        filename, 
        // type 
    } = req.body;
    


    // console.log(`Query: ${req.query}. `)

    if (!code) {
        return res.status(400).json({ error: 'Нет кода в теле запроса' });
    }

    
    if ((filename) && !input) {
        return res.status(400).json({ error: 'Нет входных данных для имени файла в теле запроса' });
    }

    /*
    if ((type == 'file' || type == 'both') && !filename) {
        return res.status(400).json({ error: 'Нет имени фала с входными данными в теле запроса' });
    }
        */

    try {
        // Запишем код во временный файл
        
        tempDir = (await makeTempDir(__dirname, 'temp-', '..'))
        
        console.log(tempDir)

        const tempPath = path.resolve(tempDir, 'temp.s');

        await fs.writeFile(tempPath, code, { encoding: 'utf-8' });

        if (filename && input) {
            const tempInputPath = path.resolve(tempDir, filename);
            await fs.writeFile(tempInputPath, input, { encoding: 'utf-8' });
        }

        

        // Запуск rars в режиме компиляции или исполнения
        
        
        // Например, запускаем программу с выводом в консоль:
        // Параметры rars: 
        const cmd = `java -jar "${RARS_JAR_PATH}" nc q run "${tempPath}" ${input ?? ''}`;

        exec(cmd, { timeout: 5000 }, (error, stdout, stderr) => {
        if (error) {
            return res.status(500).json({ error: error.message, stderr });
        }

        res.json({ output: stdout.trim(), error: stderr.trim() });
        });
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }    
    finally {
        // Очистка после использования
        await rm(tempDir, { recursive: true, force: true });
    }
}