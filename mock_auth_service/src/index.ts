import express from 'express'
import bcrypt from "bcryptjs"
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'

import cors from 'cors'

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

const JWT_SECRET = process.env.JWT_SECRET ?? ''
const PORT = process.env.PORT ?? '' 



// Проверка и валидация refresh токена из Redis
async function verifyRefreshToken(req : any) {
  try {
    const refreshToken = req.cookies?.refreshToken

    // Проверяем подпись JWT
    const payload = jwt.verify(refreshToken, JWT_SECRET) as jwt.JwtPayload;

    // Проверяем наличие токена в куках
    if (!payload) throw new Error('Token Not Found');

    return payload;
  } catch (err) {
    throw new Error('Invalid or Expired Token');
  }
}

const loginHandler = async (req : LoginRequest, res : any) => {

    const {
        login,
        password
    } = req.body

  if (!login || !password) {
    return res.status(400).json({ error: 'Login and password are required' });
  }

  
  const match = accounts.find(acc => {


    return ( login == acc.login && bcrypt.compareSync(password, acc.password) )
  } );

  if (!match) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const accessToken = jwt.sign({ login }, JWT_SECRET, { expiresIn: '1h' });
  const refreshToken = jwt.sign({ login }, JWT_SECRET, { expiresIn: '7d' });

  // Сохраняем refreshToken в Cookie с TTL равным 7 дням

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // для https в проде
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // например, 7 дней
  });

  res.json({ accessToken });
}

const refreshHandler = async (req: any, res: any) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) return res.status(400).json({ error: 'Refresh Token Required' });

  try {
    const payload = await verifyRefreshToken(refreshToken);

    // Создаем новый access токен
    const newAccessToken = jwt.sign({ login: payload.login }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ accessToken: newAccessToken });
  } catch (err) {
    res.status(403).json({ error: (err as Error).message });
  }
};

const logoutHandler = async (req: any, res: any) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) return res.status(400).json({ error: 'No Refresh Token' });

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  res.sendStatus(204);
};

const app = express()

app.use(cors({
  origin: 'http://localhost:5173', // адрес React (vite) приложения
  methods: ['GET', 'POST', 'OPTIONS'], // необходимые методы
  allowedHeaders: ['Content-Type'],
}));

app.use(express.json());
app.use(cookieParser());

app.post('/api/login', loginHandler)
app.post('/api/refresh', refreshHandler)
app.post('/api/logout', logoutHandler)





app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});