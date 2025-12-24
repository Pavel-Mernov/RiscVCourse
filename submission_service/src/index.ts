import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import express, { type Response, type NextFunction } from 'express';
import { v4 as uuidv4, validate as uuidValidate } from 'uuid';
import { getSubmissions } from './sql/getSubmissions.js';
import { Client, Pool } from 'pg';
import { createSubmission } from './sql/createSubmission.js';
import { deleteSubmission } from './sql/deleteSubmission.js';
import { initDB } from './sql/initdb.js';

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
      console.log(`Не удалось подключиться к БД, попытка ${i+1}/${retries}. ${err.toString()}`)
      await new Promise(res => setTimeout(res, delay))
    }
  }
  throw new Error('Не удалось подключиться к базе после нескольких попыток')
}


// Типы
type Verdict = 'OK' | 'WA' | 'RE' | 'TL' | 'IG';

export interface Submission {
  submission_id: string;
  task_id: string;
  student_id: string;
  timestamp: string; // ISO string
  text: string;
  verdict?: Verdict | undefined;
}

interface SubmissionCreate {
  task_id: string;
  student_id: string;
  text: string;
  verdict?: Verdict;
}



// Middleware для имитации авторизации
function middleware(req: any, res: Response, next: NextFunction) {
  // Простая заглушка: если в заголовках есть Authorization, пропускаем
  
  const header = req.headers.authorization

  if (!header) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const [, token] = header.split(' ')
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    req.user = payload
    next()
  } catch {
    return res.status(403).json({ error: `Invalid or expired token. JWT_SECRET: ${JWT_SECRET}` })
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
  if (typeof taskId !== 'string' || !isUUID(taskId)) {
    return res.status(400).json({ message: 'Invalid or missing taskId' });
  }
  if (typeof userId !== 'string') {
    return res.status(400).json({ message: 'Invalid or missing userId' });
  }

  const submissions = await getSubmissions(sqlPool)

  // Фильтрация по task_id и student_id (userId)
  const result = submissions.filter(
    (s) => s.task_id === taskId && s.student_id === userId
  );

  res.json(result);
});

// POST /api/submission
app.post('/api/submission', middleware, async (req : any, res : any) => {
  const body: SubmissionCreate = req.body;
  const { task_id, student_id, text, verdict } = body;

  if (
    typeof task_id !== 'string' ||
    !isUUID(task_id) ||
    typeof student_id !== 'string' ||
    !isUUID(student_id) ||
    typeof text !== 'string' ||
    text.trim() === ''
  ) {
    return res.status(400).json({ message: 'Invalid input data' });
  }

  const validVerdicts: Verdict[] = ['OK', 'WA', 'RE', 'TL', 'IG'];
  if (verdict && !validVerdicts.includes(verdict)) {
    return res.status(400).json({ message: 'Invalid verdict value' });
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

  res.status(201).json(newSubmission);
});

// GET /submission/{id}
app.get('/submission/:id', middleware, async (req : any, res : any) => {
  const id = req.params.id;
  if (!isUUID(id)) {
    return res.status(400).json({ message: 'Invalid id' });
  }

  const submissions = await getSubmissions(sqlPool)

  const submission = submissions.find((s) => s.submission_id === id);
  if (!submission) {
    return res.status(404).json({ message: 'Submission not found' });
  }

  res.json(submission);
});

// DELETE /submission/{id}
app.delete('/submission/:id', middleware, async (req : any, res : any) => {
  const id = req.params.id;
  if (!isUUID(id)) {
    return res.status(400).json({ message: 'Invalid id' });
  }

  const submissions = await getSubmissions(sqlPool)

  const index = submissions.findIndex((s) => s.submission_id === id);
  if (index === -1) {
    return res.status(404).json({ message: 'Submission not found' });
  }

  await deleteSubmission(id, sqlPool)
  res.status(204).send();
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
        console.log('Failed to create submission database')
      }
      
    })
    .then(() => {
        const port = process.env.PORT || 3004
        app.listen(port, () => console.log(`Submission Service running on port ${port}`))
    })
    .catch(console.error)



process.on('SIGINT', async () => {
    await sqlPool.end()
    process.exit(0)
})
