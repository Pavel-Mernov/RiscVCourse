import path from 'path';
import { dirname } from 'path';

import fileSystem from "fs"
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { exec, spawn } from 'child_process';
import { makeTempDir } from '../makeTempDir.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Путь к rars jar, поместите свой rars.jar в нужную папку
const RARS_JAR_PATH = path.resolve(__dirname, '../../rars/rars1_6.jar');

const consoleLogFunc = console.log

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

function redirectInput(filename : string, inputData : string) {
    // создаем поток записи в файл
    const output = fileSystem.createWriteStream(filename);

    // записываем входные данные в поток
    output.write(inputData)

    output.end(() => {})

    // перенаправляем ввод из консоли в файл
    process.stdin.pipe(output);
}

// Handler for POST: /compile endpoint
export async function compile(req : Request, res : Response) {

    let tempDir = ''

    // console.log(JSON.stringify(req.body))

    // console.log(req.body.code)

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
        
        // console.log(tempDir)

        const tempPath = path.resolve(tempDir, 'temp.s');

        fs.writeFile(tempPath, code, { encoding: 'utf-8' });

        if (filename && input) {
            const tempInputPath = path.resolve(tempDir, filename);
            fs.writeFile(tempInputPath, input, { encoding: 'utf-8' });
        }

        const redirectString = !(!filename && input) ? '' : (() => { 
            const suffix = 'input.txt'

            const filename = path.join(tempDir, suffix)

            redirectInput(filename, input)

            return `< ${filename}`
        })()

        
        const cmd = `java -jar "${RARS_JAR_PATH}" "${tempPath}" nc ${redirectString}`;

        // console.log(cmd)

        exec(cmd, { timeout: 5000 }, (error, stdout, stderr) => {
            console.log("Stdout : " + stdout)

            if (error) {
                console.log(error.message)

                return res.status(500).json({ error: error.message, stderr });
            }

            fs.rm(tempDir, { recursive : true });
            res.json({ output: stdout.trim(), error: stderr.trim() });
            });
        

        
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }    
    finally {
    }

    
}