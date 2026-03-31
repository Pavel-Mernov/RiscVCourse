import express from 'express';
import cookieParser from 'cookie-parser';
import controller from '../controllers/controller';

const { login, logout, refresh } = controller

export const createApp = () => {

    
  const app = express();
  app.use(express.json());
  app.use(cookieParser());

  app.post('/api/login', login);
  app.post('/api/refresh', refresh);
  app.post('/api/logout', logout);

  return app;
};