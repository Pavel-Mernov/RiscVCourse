import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import express from 'express';
import { Client, Pool } from 'pg';
import { initDB } from './sql/initdb';
import logger from './logger/logger';
import cors from 'cors'
import { sqlPool } from './sql/sqlPool';
import { deleteSubmissionHandler, getPointsHandler, getSubmissionById, getSubmissionHandler, PostSubmissionHandler, putSubmission } from './controllers/submissionController.js';
import { getMetrics, metricsMiddleware } from './controllers/metrics';
import { authenticateTeacher } from './authenticate/authenticateTeacher';

dotenv.config()
export const JWT_SECRET = process.env.JWT_SECRET ?? 'jwt-secret'

const allowedOrigins = [
  'http://localhost:5173',
  'https://riscvcourse.ru',
  'https://www.riscvcourse.ru',
  'http://riscvcourse.ru'  
];

const app = express();

app.use(cors({
  origin: allowedOrigins,
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



// GET /api/submissions?taskId=&userId=
app.get('/api/submissions', getSubmissionHandler);

// GET /api/points?taskId=&userId=
app.get('/api/points', getPointsHandler);

// POST /api/submissions
app.post('/api/submissions', PostSubmissionHandler);

// GET /api/submissions/{id}
app.get('/api/submissions/:id', getSubmissionById);

// PUT /api/submissions/{id}/verdict
app.put('/api/submissions/:id/verdict',  putSubmission);

// DELETE /api/submissions/{id}
app.delete('/api/submissions/:id', authenticateTeacher, deleteSubmissionHandler);

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
