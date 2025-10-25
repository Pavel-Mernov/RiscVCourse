import express from 'express';

import * as path from 'path';

import fileSystem, { mkdtemp } from "fs"
import * as fs from 'fs/promises';
import { exec } from 'child_process';
import multer, { diskStorage, memoryStorage } from 'multer';


const _dirname = process.cwd()

// Путь к rars jar, поместите свой rars.jar в нужную папку
const RARS_JAR_PATH = path.resolve(_dirname, './rars/rars1_6.jar');



type CodeRequest = {
    body : {
        code : string,
        input ?: string,
        filename ?: string,
        // type ?: 'stdin' | 'file' | 'both',
    }
}

type RunFileRequest = {
    
    body : {
        
        input ?: string,
        inputFilename ?: string,
        // type ?: 'stdin' | 'file' | 'both',
    }
} & any

type Response = {
    status : (status : number) => Response,
    json : (obj : object) => Response,
}

async function makeTempDir(dirname : string, suffix : string, relpath ?: string,) : Promise<string> {
    const baseDir = (!relpath) ? dirname : path.resolve(dirname, relpath)

    const tempDirName = path.join(baseDir, suffix)

    return new Promise(async (resolve, reject) => {
        mkdtemp(tempDirName, (err, directory) => {
            if (err) return reject(err);
            resolve(directory);
        });
    });
}

const readCurrentDir = async () => {
    try {
        const currentDirectory = process.cwd();
        const files = await fs.readdir(currentDirectory);
        const resultString = files.join(', ');
        
        return resultString
    } catch (err) {
        const errorString = 'Ошибка при чтении каталога: ' + err

        console.error(errorString);

        return errorString
    }
  
}


async function redirectInput(filename : string, inputData : string) {
  
  
  // создаем поток записи в файл
  const output = fileSystem.createWriteStream(filename);

  // записываем входные данные в поток
  output.write(inputData, (error) => {
    if (error) {
      throw { error }
    }
  })

  output.end()

  // throw { error : `wrote successfully to file: ${filename}` }

  // перенаправляем ввод из консоли в файл
  process.stdin.pipe(output);
  
}

async function runCode(res : Response, code : string, input ?: string, inputFilename ?: string) {
    let tempDir = ''

    if ((inputFilename) && !input) {
        return res.status(400).json({ error: 'Нет входных данных для имени файла в теле запроса' });
    }

    /*
    if ((type == 'file' || type == 'both') && !filename) {
        return res.status(400).json({ error: 'Нет имени фала с входными данными в теле запроса' });
    }
        */

    try {
        // Запишем код во временный файл
        
        if (typeof code == 'string') {
            tempDir = (await makeTempDir(_dirname, 'temp-', "."))
        }

        const tempPath = path.resolve(tempDir, 'temp.s');

        if (typeof code == 'string') {
            await fs.writeFile(tempPath, code, { encoding: 'utf-8' });
        }

        if (inputFilename && input) {
            const tempInputPath = path.resolve(tempDir, inputFilename);
            await fs.writeFile(tempInputPath, input, { encoding: 'utf-8' });
        }

        const redirectString = !(!inputFilename && input) ? '' : await (async () => { 
            const suffix = 'input.txt'

            const filename = path.join(tempDir, suffix)

            await redirectInput(filename, input)

            return `< ${filename}`
        })()


        
        const cmd = `java -jar "${RARS_JAR_PATH}" "${tempPath}" nc ${redirectString}`;

        // console.log(cmd)

        const currentDirectory = await readCurrentDir()

        exec(cmd, { timeout: 5000 }, async (error, stdout, stderr) => {
            console.log("Stdout : " + stdout)

            if (error) {
                console.log(error.message)

                await fs.rm(tempDir, { recursive : true });
                return res.status(500).json({ error: `${error.message} \nCurrentDirectory: ${currentDirectory}`, stderr });
            }

            await fs.rm(tempDir, { recursive : true });
            res.json({ output: stdout.trim(), error: stderr.trim() });
            });
        

        
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }    
    finally {
    }

    
}

// Handler for POST: /compile endpoint
async function compile(req : CodeRequest, res : Response) {

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

    return await runCode(res, code, input, filename)
}

// Настройка хранения файлов
const storage = memoryStorage()

// Инициализируем multer
const upload = multer({ storage });

// Handler for POST: /compile/file endpoint
async function compileFile(req : RunFileRequest, res : Response) {
    const { file,
    body:  {
        input,
        inputFilename
    }} = req

    if (!file) {
        return res.status(400).json({ error : 'Файл не загружен' })
    }

    const code = file.buffer.toString('utf-8')

    return runCode(res, code, input, inputFilename)
}

const app = express();


const PORT = 3000;

// app.use(bodyParser.text({ type: '*/*' }));
app.use(express.json());

app.post('/api/compile/file', upload.single('file'), compileFile);

app.post('/api/compile', compile);

app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});

