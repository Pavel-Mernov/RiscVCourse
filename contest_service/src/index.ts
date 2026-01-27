import dotenv from 'dotenv'


import express from 'express'
import contestsRouter from './routes/contests.js'
import { Client, Pool } from 'pg'
import { initDB } from './sql/scripts/initdb.js'
import cors from 'cors'

dotenv.config()
export const JWT_SECRET = process.env.JWT_SECRET ?? 'jwt-secret'

const app = express()

const allowedOrigins = [
  'http://localhost:5173',
  'https://riscvcouse.ru',
  'http://riscvcouse.ru'  // если доступен и по HTTP
];

const orginFunction = (origin : any, callback : any) => {
    // Если origin не пришел (например, Postman или same-origin), разрешаем запрос
    if (!origin) return callback(null, true); 
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true); // разрешаем
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }

app.use(cors({
  origin: orginFunction, // динамическое определение
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // необходимые методы
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json())
app.use('/api', contestsRouter)

// console.log(`JWT Secret: ${JWT_SECRET}`)

async function connectWithRetry(pool : Pool | Client, retries : number = 10, delay : number = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      await pool.connect()
      return
    } catch (err) {
      console.log(`Не удалось подключиться к БД, попытка ${i+1}/${retries}`)
      await new Promise(res => setTimeout(res, delay))
    }
  }
  throw new Error('Не удалось подключиться к базе после нескольких попыток')
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
        app.listen(port, () => console.log(`Contest Service running on port ${port}`))
    })
    .catch(console.error)



process.on('SIGINT', async () => {
    await sqlPool.end()
    process.exit(0)
})
