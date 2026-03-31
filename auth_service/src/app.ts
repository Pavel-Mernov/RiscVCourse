import { config } from "dotenv";

config()

import express from 'express';
import cookieParser from 'cookie-parser';
import router from './routes/router';

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use('/api', router)

export default app