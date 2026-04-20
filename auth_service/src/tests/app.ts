import express from 'express';
import cookieParser from 'cookie-parser';
import controller from '../controllers/controller';
import userController from '../controllers/userController';

const { login, logout, refresh } = controller
const { getStudents, getUserByEmail } = userController

export const createApp = () => {

    
  const app = express();
  app.use(express.json());
  app.use(cookieParser());

  app.post('/api/login', login);
  app.post('/api/refresh', refresh);
  app.post('/api/logout', logout);
  app.get('/api/students', getStudents);
  app.get('/api/users/:email', getUserByEmail);

  return app;
};
