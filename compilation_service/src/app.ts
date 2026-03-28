import express from 'express';

import * as path from 'path';

import multer, { memoryStorage } from 'multer';
import logger from './logger/logger';
import client from 'prom-client'
import { type Response } from './types'
import cors from 'cors'
import { runCode } from './runCode';

export const _dirname = process.cwd()

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



// Handler for POST: /compile endpoint
export async function compile(req : CodeRequest, res : Response) {

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

    if ((filename) && !input) {
        const error = 'Нет входных данных для имени файла в теле запроса'

        logger.error(error)
        return res.status(400).json({ error });
    }

    // if code size > 10 KBytes
    if (Buffer.byteLength(code, 'utf-8') > 10 * 1024) {
        const error = 'Превышен максимальный размер кода: 10 Кбайт'

        logger.error(error)
        return res.status(400).json({ error })
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

/*
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
*/

export const app = express();
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
  'https://www.riscvcourse.ru',
  'http://riscvcourse.ru'  
];

const originFunction = (origin: any, callback: any) => {
    if (!origin) return callback(null, true)

    if (allowedOrigins.includes(origin)) {
        return callback(null, true)
    }
    return callback(new Error('Not allowed by CORS'))
}

app.use(cors({
  origin: // originFunction,
            true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // необходимые методы
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.options('*', cors())

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



// app.use(bodyParser.text({ type: '*/*' }));
app.use(express.json());

// Маршрут для отдачи метрик в Prometheus-формате
app.get('/metrics', async (_, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

// app.post('/api/compile/file', upload.single('file'), compileFile);

app.post('/api/compile', compile);