import dotenv from 'dotenv'


import express from 'express'
import contestsRouter from './routes/contests'
import { Client, Pool } from 'pg'
import { initDB } from './sql/scripts/initdb'
import cors from 'cors'
import logger from './logger/logger'

import { sqlPool } from './sql/sqlPool'
import { getMetrics, requestCounterFunction } from './routes/metrics'

dotenv.config()
export const JWT_SECRET = process.env.JWT_SECRET ?? 'jwt-secret'

const app = express()

const allowedOrigins = [
  'http://localhost:5173',
  'https://riscvcourse.ru',
  'https://www.riscvcourse.ru',
  'http://riscvcourse.ru'  
];

const originFunction = (origin : any, callback : any) => {

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }

}

const corsOptions = {
  origin: originFunction,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // необходимые методы
  allowedHeaders: ['Content-Type', 'Authorization'],
}

app.use(cors(corsOptions));

app.options('*', cors(corsOptions));

app.use(requestCounterFunction);

app.use(express.json())
app.use('/api', contestsRouter)

// Маршрут для отдачи метрик в Prometheus-формате
app.get('/metrics', getMetrics);

// console.log(`JWT Secret: ${JWT_SECRET}`)

async function connectWithRetry(pool : Pool | Client, retries : number = 15, delay : number = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      await pool.connect()
      return
    } catch (err) {
      logger.error(`Не удалось подключиться к БД, попытка ${i+1}/${retries}`)
      await new Promise(res => setTimeout(res, delay))
    }
  }

  const error = 'Не удалось подключиться к базе после нескольких попыток'

  logger.error(error)
  throw new Error(error)
}



await connectWithRetry(sqlPool)
    .then(() => initDB(sqlPool))
    .then(() => {
        const port = process.env.PORT || 3002
        app.listen(port, () => logger.info(`Contest Service running on port ${port}`))
    })
    .catch(console.error)



process.on('SIGINT', async () => {
    await sqlPool.end()
    process.exit(0)
})
