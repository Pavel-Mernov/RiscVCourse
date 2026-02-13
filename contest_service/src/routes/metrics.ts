import promClient from 'prom-client'

const { collectDefaultMetrics } = promClient

if (collectDefaultMetrics) {
    collectDefaultMetrics();
}

const httpRequestsCounter = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

export const requestCounterFunction = (req : any, res : any, next : () => any) => {
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
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
}