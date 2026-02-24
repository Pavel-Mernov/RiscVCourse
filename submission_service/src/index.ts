import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import express, { type Response, type NextFunction } from 'express';
import { Client, Pool } from 'pg';
import { initDB } from './sql/initdb';
import logger from './logger/logger';
import cors from 'cors'
import { sqlPool } from './sql/sqlPool';
import { deleteSubmissionHandler, getSubmissionById, getSubmissionHandler, PostSubmissionHandler, putSubmission } from './controllers/submissionController.js';
import { getMetrics, metricsMiddleware } from './controllers/metrics';

dotenv.config()
export const JWT_SECRET = process.env.JWT_SECRET ?? 'jwt-secret'

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

const app = express();

app.use(cors({
  origin: originFunction, // динамическое определение
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // необходимые методы
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());


app.use(metricsMiddleware);



async function connectWithRetry(pool : Pool | Client, retries : number = 10, delay : number = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      await pool.connect()
      return
    } catch (err : any) {
      const message = `Не удалось подключиться к БД, попытка ${i+1}/${retries}. ${err.toString()}`

      logger.info(message)
      await new Promise(res => setTimeout(res, delay))
    }
  }

  const error = 'Не удалось подключиться к базе после нескольких попыток'
  throw new Error(error)
}








// Middleware для авторизации
function middleware(req: any, res: Response, next: NextFunction) {
  
  const header = req.headers.authorization

  if (!header) {

    const message = 'Unauthorized'

    logger.info(message)
    return res.status(401).json({ message });
  }
  const [, token] = header.split(' ')
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    req.user = payload
    next()
  } catch {
    const error = `Invalid or expired token.`

    logger.error(error)
    return res.status(403).json({ error })
  }
  next();
}



// GET /api/submissions?taskId=&userId=
app.get('/api/submissions', getSubmissionHandler);

// POST /api/submissions
app.post('/api/submissions', PostSubmissionHandler);

// GET /api/submissions/{id}
app.get('/api/submissions/:id', getSubmissionById);

// PUT /api/submissions/{id}/verdict
app.put('/api/submissions/:id/verdict',  putSubmission);

// DELETE /api/submissions/{id}
app.delete('/api/submissions/:id', middleware, deleteSubmissionHandler);

app.get('/metrics', getMetrics)

// Запуск сервера (примерно, можно настроить по необходимости)
await 
    connectWithRetry(sqlPool, 15)
    // (async () => { })() // do nothing
    .then(() => {
      try {
        initDB(sqlPool)
      }
      catch {
        logger.error('Failed to create submission database')
      }
      
    })
    .then(() => {
        const port = process.env.PORT || 3004
        app.listen(port, () => logger.info(`Submission Service running on port ${port}`))
    })
    .catch(console.error)



process.on('SIGINT', async () => {
    await sqlPool.end()
    process.exit(0)
})
