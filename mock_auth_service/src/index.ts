import express from 'express'
import bcrypt from "bcryptjs"
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'

import cors from 'cors'
import logger from './logger.js'

import client from 'prom-client'

type LoginRequest = {
    body : {
        login ?: string,
        password ?: string
    }
}

/*
const redis = new Redis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: 6379
})
*/

const accounts = // это заглушка специально для дисциплины ПИПО. В ВКР будет
[
    {
        login : 'pkmernov@edu.hse.ru',
        password : await bcrypt.hash('12121212', 10),
    },
    {
        login : 'kpashigorev@hse.ru',
        password : await bcrypt.hash('06010601', 10),
    },
]

dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET ?? 'jwt-secret'
const PORT = process.env.PORT ?? '3003' 



// Проверка и валидация refresh токена из Redis
async function verifyRefreshToken(req : any) {
  try {

    

    const refreshToken = req.cookies?.refreshToken

    // Проверяем подпись JWT
    const payload = jwt.verify(refreshToken, JWT_SECRET) as jwt.JwtPayload;

    // Проверяем наличие токена в куках
    if (!payload) {
      logger.error('Token not found!')
      throw new Error('Token Not Found');
    } 

    return payload;
  } catch (err) {

    logger.error('Invalid or Expired Token')
    throw new Error('Invalid or Expired Token');
  }
}

const loginHandler = async (req : LoginRequest, res : any) => {
  

  const {
    login,
    password
  } = req.body

  logger.info('POST /api/login ' + (login ?? ''))

  if (!login || !password) {
    const error = 'Login and password are required'

    logger.error(error)
    return res.status(400).json({ error });
  }

  
  const match = accounts.find(acc => {


    return ( login == acc.login && bcrypt.compareSync(password, acc.password) )
  } );

  if (!match) {
    const error = 'Invalid credentials'

    logger.error(error)
    return res.status(401).json({ error });
  }

  const accessToken = jwt.sign({ login }, JWT_SECRET, { expiresIn: '1h' });
  const refreshToken = jwt.sign({ login }, JWT_SECRET, { expiresIn: '7d' });

  // Сохраняем refreshToken в Cookie с TTL равным 7 дням

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: false, // process.env.NODE_ENV === 'production', // для https в проде
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 дней
  });

  logger.info('Login successful. Login:' + login + 'JWT secret: ' + JWT_SECRET)
  res.json({ accessToken });
}

const refreshHandler = async (req: any, res: any) => {
  const { refreshToken } = req.cookies;

  logger.info('POST /api/refresh. ')

  if (!refreshToken) {
    const error = 'Refresh Token Required'

    logger.error(error)

    return res.status(400).json({ error });
  } 

  try {
    const payload = await verifyRefreshToken(refreshToken);

    // Создаем новый access токен
    const newAccessToken = jwt.sign({ login: payload.login }, JWT_SECRET, { expiresIn: '1h' });
    
    logger.info('Refresh OK. ')
    res.json({ accessToken: newAccessToken });
  } catch (err) {
    const error = (err as Error).message
    logger.error(error)

    res.status(403).json({ error });
  }
};

const logoutHandler = async (req: any, res: any) => {
  const { refreshToken } = req.cookies;

  logger.info('POST /api/logout. ')

  if (!refreshToken) { 
    const error = 'No Refresh Token'

    logger.error(error)

    return res.status(400).json({ error }); 
  }

  try {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: false, // process.env.NODE_ENV === 'production',
    sameSite: 'lax' // 'strict'
  });


  res.sendStatus(204);
} catch (err) {
  const error = (err as Error).message

  logger.error(error)

  res.status(403).json({ error });
}
};

const app = express()
const collectDefaultMetrics = client.collectDefaultMetrics;

// Запускаем сбор стандартных метрик Node.js (CPU, память и т.д.)
collectDefaultMetrics(); 

// Создаём счётчик для запросов
const httpRequestsCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

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

app.use(cors({
  origin: ['http://localhost:5173', 'http://riscvcourse.ru'], // адрес React (vite) приложения и адрес сайта
  methods: ['GET', 'POST', 'OPTIONS'], // необходимые методы
  allowedHeaders: ['Content-Type'],
  credentials : true,
}));

app.use(express.json());
app.use(cookieParser());

app.post('/api/login', loginHandler)
app.post('/api/refresh', refreshHandler)
app.post('/api/logout', logoutHandler)





app.listen(PORT, () => {
  logger.info(`Server started on PORT: ${PORT}`);
});