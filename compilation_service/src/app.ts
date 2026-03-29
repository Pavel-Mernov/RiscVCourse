import express from 'express';

import * as path from 'path';

import multer, { memoryStorage } from 'multer';
import logger from './logger/logger';
import client from 'prom-client'
import { type Response } from './types'
import cors from 'cors'
import { runCode } from './compile/runCode';
import { compile } from './compile/compile';

export const _dirname = process.cwd()



export const app = express();
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



// app.use(bodyParser.text({ type: '*/*' }));
app.use(express.json());

// Маршрут для отдачи метрик в Prometheus-формате
app.get('/metrics', async (_, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

// app.post('/api/compile/file', upload.single('file'), compileFile);

app.post('/api/compile', compile);