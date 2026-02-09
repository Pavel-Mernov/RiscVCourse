import express from 'express';

import * as path from 'path';

import { mkdtemp } from "fs"
import * as fs from 'fs/promises';
import { exec } from 'child_process';
import multer, { memoryStorage } from 'multer';
import logger from './logger/logger.js';
import client from 'prom-client'

import cors from 'cors'

const _dirname = process.cwd()

// Путь к rars jar, поместите свой rars.jar в нужную папку
const RARS_JAR_PATH = path.resolve(_dirname, './rars/rars1_6.jar');



type CodeRequest = {
    body : {
        code : string,
        input ?: string,
        filename ?: string,
        timeout ?: string
        // type ?: 'stdin' | 'file' | 'both',
    }
}

type RunFileRequest = {

    body : {
        
        input ?: string,
        inputFilename ?: string,
        timeout ?: string
        // type ?: 'stdin' | 'file' | 'both',
    }
    [key : string] : any
}

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

/*
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
    */


async function redirectInput(filename : string, inputData : string) {
  await fs.writeFile(filename, inputData, 'utf8');
  
}

async function runCode(res : Response, code : string, input ?: string, inputFilename ?: string, timeout ?: number) {
    let tempDir = ''

    if ((inputFilename) && !input) {
        const error = 'Нет входных данных для имени файла в теле запроса'

        logger.error(error)
        return res.status(400).json({ error });
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


        
        const cmd = `java -Djava.util.prefs.userRoot=/tmp -jar "${RARS_JAR_PATH}" "${tempPath}" nc ${redirectString}`;

        logger.info(`Procceeding command: ${cmd}`)

        // console.log(cmd)

        // const currentDirectory = await readCurrentDir()

        exec(cmd, { timeout: timeout ?? 1000 }, async (error, stdout, stderr) => {
            logger.info("Stdout : " + stdout)

            if (error) {
                logger.error(error.message)

                await fs.rm(tempDir, { recursive : true });
                return res.status(500).json({ error: `${error.message}`, stderr });
            }

            await fs.rm(tempDir, { recursive : true });

            logger.info("Stdin: " + input + ". Stdout: " + stdout.trim() + ". Stderr: " + stderr.trim())
            res.json({ output: stdout.trim(), error: stderr.trim() });
            
        });
        

        
    } catch (err) {
        const error = (err as Error).message

        logger.error(error)
        res.status(500).json({ error });
    } 

    
}

// Handler for POST: /compile endpoint
async function compile(req : CodeRequest, res : Response) {

    const { 
        code, 
        input, 
        filename, 
        timeout
        // type 
    } = req.body;
    
    const requestMessage = `POST /api/compile. Code: ${code}. Input: ${input}. Filename: ${filename}. Timeout: ${timeout}`

    logger.info(requestMessage)

    // console.log(`Query: ${req.query}. `)

    if (!code) {
        const error = 'Нет кода в теле запроса'

        logger.error(error)
        return res.status(400).json({ error });
    }

    if (timeout && !(Array.from(timeout).every(c => '0123456789'.includes(c)))) {
        const error = 'Значение timeout не является целым неотрицательным числом'

        logger.error(error)
        return res.status(400).json({ error });        
    }

    const timeoutNumber = timeout ? parseInt(timeout) : undefined

    return await runCode(res, code, input, filename, timeoutNumber)
}

// Настройка хранения файлов
const storage = memoryStorage()

// Инициализируем multer
const upload = multer({ storage });

// Handler for POST: api/compile/file endpoint
async function compileFile(req : RunFileRequest, res : Response) {
    const { file,
    body:  {
        input,
        inputFilename,
        timeout
    }} = req

    const requestMessage = `POST /api/compile/file. File name: ${inputFilename}. Input: ${input}.`
    logger.info(requestMessage)

    if (!file) {
        const error = 'Файл не загружен'

        logger.error(error)
        return res.status(400).json({ error })
    }

    if (timeout && !(Array.from(timeout).every(c => '0123456789'.includes(c)))) {
        const error = 'Значение timeout не является целым неотрицательным числом'

        logger.error(error)
        return res.status(400).json({ error });        
    }

    const timeoutNumber = timeout ? parseInt(timeout) : undefined

    const code = file.buffer.toString('utf-8')


    return await runCode(res, code, input, inputFilename, timeoutNumber)
}

const app = express();
const collectDefaultMetrics = client.collectDefaultMetrics;

// Запускаем сбор стандартных метрик Node.js (CPU, память и т.д.)
collectDefaultMetrics(); 

// Создаём счётчик для запросов
const httpRequestsCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

const allowedOrigins = [
  'http://localhost:5173',
  'https://riscvcourse.ru',
  'http://riscvcourse.ru'  
];

const originFunction = (origin : any, callback : any) => {
    // Если origin не пришел (например, Postman или same-origin), разрешаем запрос
    if (!origin) return callback(null, true); 
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true); // разрешаем
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }

app.use(cors({
  origin: originFunction, // динамическое определение
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // необходимые методы
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use((req, res, next) => {
  res.on('finish', () => {
    httpRequestsCounter.inc({
      method: req.method,
      route: req.route ? req.route.path : req.path,
      status_code: res.statusCode.toString(),
    });
  });
  next();
});

const PORT = 3000;

// app.use(bodyParser.text({ type: '*/*' }));
app.use(express.json());

// Маршрут для отдачи метрик в Prometheus-формате
app.get('/metrics', async (_, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

app.post('/api/compile/file', upload.single('file'), compileFile);

app.post('/api/compile', compile);

app.listen(PORT, () => {
  logger.info(`Server started on PORT ${PORT}`);
});

