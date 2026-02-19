import client from "prom-client"

const collectDefaultMetrics = client.collectDefaultMetrics;

// Запускаем сбор стандартных метрик Node.js (CPU, память и т.д.)
collectDefaultMetrics(); 

// Создаём счётчик для запросов
const httpRequestsCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

export const metricsMiddleware = (req : any, res : any, next : () => any) => {
  res.on('finish', () => {
    httpRequestsCounter.inc({
      method: req.method,
      route: req.route ? req.route.path : req.path,
      status_code: res.statusCode.toString(),
    });
  });
  next();
}

// API GET /metrics handler
export const getMetrics = async (_ : any, res : any) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
}