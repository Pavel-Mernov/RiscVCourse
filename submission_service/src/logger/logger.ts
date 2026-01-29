import { createLogger, format, transports } from 'winston';

const logger = createLogger({
  level: 'info', // уровень логирования: error, warn, info, verbose, debug, silly
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  transports: [
    new transports.Console({
        format : format.printf(info => info.level + ': ' + info.message + '. ' + new Date(info.timestamp as any).toLocaleString())
    }), // лог в консоль
    new transports.File({ filename: 'logs/error.log', level: 'error' }), 
    new transports.File({ filename: 'logs/combined.log' }),
  ],
});

export default logger;