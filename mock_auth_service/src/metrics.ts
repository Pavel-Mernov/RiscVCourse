import client from "prom-client"

const collectDefaultMetrics = client.collectDefaultMetrics ?? (() => { });

// Запускаем сбор стандартных метрик Node.js (CPU, память и т.д.)

collectDefaultMetrics(); 

// Создаём счётчик для запросов
export const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

export const metricsMiddleware = (req : any, res : any, next : any) => {
  const start = Date.now();

  res.on('finish', () => {
    const route = req.route?.path || req.path;
    httpRequestCounter.inc({
      method: req.method,
      route,
      status_code: res.statusCode
    });
  });

  next();
};

// API GET /metrics handler
export const getMetrics = async (_ : any, res : any) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
}