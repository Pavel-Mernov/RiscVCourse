import dotenv from 'dotenv'


import express from 'express'
import contestsRouter from './routes/contests.js'
import { Client, Pool } from 'pg'
import { initDB } from './sql/scripts/initdb.js'
import cors from 'cors'
import logger from './logger/logger.js'
import promClient from 'prom-client'

dotenv.config()
export const JWT_SECRET = process.env.JWT_SECRET ?? 'jwt-secret'

const app = express()

const { collectDefaultMetrics } = promClient

const allowedOrigins = [
  'http://localhost:5173',
  'https://riscvcourse.ru',
  'http://riscvcourse.ru'  
];

collectDefaultMetrics(); 

const originFunction = (origin : any, callback : any) => {
    // Если origin не пришел (например, Postman или same-origin), разрешаем запрос
    if (!origin) return callback(null, true); 
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true); // разрешаем
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }

const httpRequestsCounter = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

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

app.use(express.json())
app.use('/api', contestsRouter)

// Маршрут для отдачи метрик в Prometheus-формате
app.get('/metrics', async (_, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
});

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

export const sqlPool = new Pool({
    user : 'pavel_mernov',
    password : '0867',
    database : 'contest_database',
    host : 'contest-db',
    port : 5432
})

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
