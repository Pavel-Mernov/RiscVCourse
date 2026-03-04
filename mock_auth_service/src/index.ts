import express from 'express'

import cookieParser from 'cookie-parser'

import cors from 'cors'
import logger from './logger'

import authController from './controllers/authController'
import { configDotenv, PORT } from './dotenv'
import { getMetrics, metricsMiddleware } from './metrics'



/*
const redis = new Redis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: 6379
})
*/



configDotenv() 



const app = express()


app.use(metricsMiddleware);

const allowedOrigins = [
  'http://localhost:5173',
  'https://riscvcourse.ru',
  'https://www.riscvcourse.ru',
  'http://riscvcourse.ru'  
];

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'OPTIONS'], // необходимые методы
  allowedHeaders: ['Content-Type'],
  credentials : true,
}));

app.use(express.json());
app.use(cookieParser());

app.post('/api/login', authController.login)
// app.post('/api/refresh', authController.refresh)
// app.post('/api/logout', authController.logout)

app.get('/metrics', getMetrics)

app.listen(PORT, () => {
  logger.info(`Server started on PORT: ${PORT}`);
});