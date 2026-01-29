import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import express, { type Response, type NextFunction } from 'express';
import { v4 as uuidv4, validate as uuidValidate } from 'uuid';
import { getSubmissions } from './sql/getSubmissions.js';
import { Client, Pool } from 'pg';
import { createSubmission } from './sql/createSubmission.js';
import { deleteSubmission } from './sql/deleteSubmission.js';
import { initDB } from './sql/initdb.js';
import { updateVerdict } from './sql/updateVerdict.js';
import logger from './logger/logger.js';

dotenv.config()
export const JWT_SECRET = process.env.JWT_SECRET ?? 'jwt-secret'

const app = express();
app.use(express.json());

export const sqlPool = new Pool({
    user : 'pavel_mernov',
    password : '0867',
    database: 'submission_database',
    host : 'submission-db',
    port : 5432
})

async function connectWithRetry(pool : Pool | Client, retries : number = 10, delay : number = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      await pool.connect()
      return
    } catch (err : any) {
      const message = `Не удалось подключиться к БД, попытка ${i+1}/${retries}. ${err.toString()}`

      logger.info(message)
      await new Promise(res => setTimeout(res, delay))
    }
  }

  const error = 'Не удалось подключиться к базе после нескольких попыток'
  throw new Error(error)
}


// Типы
export type Verdict = 'OK' | 'WA' | 'RE' | 'TL' | 'IG' | 'PS';

export interface Submission {
  submission_id: string;
  task_id: string;
  student_id: string;
  timestamp: string; // ISO string
  text: string | string[];
  verdict?: Verdict | undefined;
}

type SubmissionCreate = Omit<Submission, 'submission_id' | 'timestamp'>



// Middleware для имитации авторизации
function middleware(req: any, res: Response, next: NextFunction) {
  
  const header = req.headers.authorization

  if (!header) {

    const message = 'Unauthorized'

    logger.info(message)
    return res.status(401).json({ message });
  }
  const [, token] = header.split(' ')
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    req.user = payload
    next()
  } catch {
    const error = `Invalid or expired token.`

    logger.error(error)
    return res.status(403).json({ error })
  }
  next();
}

// Валидация UUID
function isUUID(value: string): boolean {
  return uuidValidate(value);
}

// GET /api/submissions?taskId=&userId=
app.get('/api/submissions', async (req : any, res : any) => {

  const { taskId, userId } = req.query;
  
  const logMessage = 'GET /api/submissions. Task id: ' + taskId + ' user Id: ' + userId
  logger.info(logMessage)

  if (typeof taskId !== 'string' || !isUUID(taskId)) {
    const error = 'Invalid or missing taskId'

    logger.error(error)
    return res.status(400).json({ error });
  }
  
  if (typeof userId !== 'string') {
    const error = 'Invalid or missing userId'

    return res.status(400).json({ error });
  }

  const submissions = await getSubmissions(sqlPool)

  // Фильтрация по task_id и student_id (userId)
  const result = submissions.filter(
    (s) => s.task_id === taskId && s.student_id === userId
  );

  logger.info(logMessage + '. Status: OK')
  res.json(result);
});

// POST /api/submission
app.post('/api/submission', async (req : any, res : any) => {
  const body: SubmissionCreate = req.body;
  const { task_id, student_id, text, verdict } = body;

  const queryMessage = 'POST /api/submission. Body: ' + JSON.stringify(body)
  logger.info(queryMessage)

  if (
    typeof task_id !== 'string' ||
    !isUUID(task_id) ||
    typeof student_id !== 'string' ||
    !isUUID(student_id) ||
    typeof text !== 'string' ||
    text.trim() === ''
  ) {
    const error = 'Invalid input data'

    logger.error(error)
    return res.status(400).json({ error });
  }

  const validVerdicts: Verdict[] = ['OK', 'WA', 'RE', 'TL', 'IG'];
  if (verdict && !validVerdicts.includes(verdict)) {

    const error = 'Invalid verdict value: ' + verdict

    logger.error(error)
    return res.status(400).json({ error });
  }

  const newSubmission: Submission = {
    submission_id: uuidv4(),
    task_id,
    student_id,
    text: text.trim(),
    timestamp: new Date().toISOString(),
    verdict,
  };

  await createSubmission(newSubmission, sqlPool);

  logger.info(queryMessage + '. Status: OK')
  res.status(201).json(newSubmission);
});

// GET /submission/{id}
app.get('/submission/:id', async (req : any, res : any) => {
  const id = req.params.id;

  const requestMessage = 'GET /submissions/' + id
  logger.info(requestMessage)

  if (!isUUID(id)) {
    const error = 'Invalid id: ' + id

    logger.info(error)
    return res.status(400).json({ error });
  }

  const submissions = await getSubmissions(sqlPool)

  const submission = submissions.find((s) => s.submission_id === id);
  if (!submission) {
    const error = 'Submission not found'

    logger.error(error)
    return res.status(404).json({ error });
  }

  logger.info(requestMessage + '. Status: OK')
  res.json(submission);
});

app.put('/submissions/:id/verdict', async (req: any, res: Response) => {
  const submission_id = req.params.id;
  const { verdict } = req.body as { verdict?: Verdict };

  const requestMessage = 'PUT /submissions/' + submission_id + '/verdict. Verdict: ' + verdict
  logger.info(requestMessage)

  if (!verdict) {
    const error = 'Поле verdict обязательно'

    logger.error(error)
    return res.status(400).json({ error });
  }
  if (!['OK', 'WA', 'RE', 'TL', 'IG', 'PS'].includes(verdict)) {
    const error = 'Недопустимое значение verdict'

    logger.error(error)
    return res.status(400).json({ error });
  }

  try {
    const result = await updateVerdict(submission_id, verdict, sqlPool);

    if (result === 0) {
      const error = 'Submission не найден'

      logger.error(error)
      return res.status(404).json({ error });
    }

    const finalMessage = requestMessage + '. Вердикт обновлен'
    
    logger.info(finalMessage)
    res.json({ message: finalMessage });

  } catch (err) {

    const error = 'Внутренняя ошибка сервера: ' + (err as Error).message

    logger.error(error);
    res.status(500).json({ error });
  }
});

// DELETE /submissions/{id}
app.delete('/submissions/:id', middleware, async (req : any, res : any) => {
  const id = req.params.id;
  
  const requestMessage = 'DELETE /submissions/' + id
  logger.info(requestMessage)

  if (!isUUID(id)) {
    const error = 'Invalid id: ' + id

    logger.error(error)
    return res.status(400).json({ error });
  }

  const submissions = await getSubmissions(sqlPool)

  const index = submissions.findIndex((s) => s.submission_id === id);
  if (index === -1) {
    const error = 'Submission not found. id: ' + id

    logger.error(error)
    return res.status(404).json({ error });
  }

  try {
    await deleteSubmission(id, sqlPool)

    const message = requestMessage + '. Deletion sucessful'
    logger.info(message)
    res.status(204).json({ message });
  } catch (err : any) {
    const error = err.message
    
    logger.error(error)
    res.status(500).json({ error })
  }
});



// Запуск сервера (примерно, можно настроить по необходимости)
await 
    connectWithRetry(sqlPool, 15)
    // (async () => { })() // do nothing
    .then(() => {
      try {
        initDB(sqlPool)
      }
      catch {
        logger.error('Failed to create submission database')
      }
      
    })
    .then(() => {
        const port = process.env.PORT || 3004
        app.listen(port, () => logger.info(`Submission Service running on port ${port}`))
    })
    .catch(console.error)



process.on('SIGINT', async () => {
    await sqlPool.end()
    process.exit(0)
})
