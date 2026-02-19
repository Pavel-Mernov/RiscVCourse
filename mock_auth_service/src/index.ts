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

app.use(cors({
  origin: ['http://localhost:5173', 'http://riscvcourse.ru'], // адрес React (vite) приложения и адрес сайта
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