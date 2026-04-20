import { config } from "dotenv";

config()

import express, { type NextFunction, type Request, type Response } from 'express';
import cookieParser from 'cookie-parser';
import router from './routes/router';

const app = express();
const allowedOrigins = new Set([
  'https://www.riscvcourse.ru',
  'https://riscvcourse.ru',
  'http://localhost:5173',
]);

app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;

  if (origin && allowedOrigins.has(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Vary', 'Origin');
  }

  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api', router)

export default app
