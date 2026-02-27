import logger from "../logger/logger";
import { getSubmissions } from "../sql/getSubmissions";

import { v4 as uuidv4 } from 'uuid';
import { sqlPool } from "../sql/sqlPool";
import { createSubmission } from "../sql/createSubmission";
import { updateVerdict } from "../sql/updateVerdict";
import { response } from "express";
import { deleteSubmission } from "../sql/deleteSubmission";

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

interface Response {
    status : (code : number) => Response 
    json : (obj : any) => Response
}



// GET /api/submissions?taskId=&userId=
export const getSubmissionHandler = async (req : any, res : any) => {

  const { taskId, userId } = req.query;
  
  const logMessage = 'GET /api/submissions. Task id: ' + taskId + ' user Id: ' + userId
  logger.info(logMessage)

  if (typeof taskId !== 'string') {
    const error = 'Invalid or missing taskId'

    logger.error(error)
    return res.status(400).json({ error });
  }
  
  if (typeof userId !== 'string') {
    const error = 'Invalid or missing userId'

    return res.status(400).json({ error });
  }

  const submissions = await getSubmissions()

  // Фильтрация по task_id и student_id (userId)
  const result = submissions.filter(
    (s) => s.task_id === taskId && s.student_id === userId
  );

  logger.info(logMessage + '. Status: OK')
  res.json(result);
}

// POST /api/submissions
export const PostSubmissionHandler = async (req : any, res : any) => {

  try {
      const body: SubmissionCreate = req.body;
      const { task_id, student_id, text, verdict } = body;

      const queryMessage = 'POST /api/submission. Body: ' + JSON.stringify(body)
      logger.info(queryMessage)

      if (
        typeof task_id !== 'string' ||
        typeof student_id !== 'string' ||
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
  }
  catch (err : any) {
    res.status(500).json({ error : (err as Error).message })
  }
}

// PUT /api/submission/{id}/verdict
export const putSubmission = async (req: any, res: Response) => {
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
}

// GET /api/submission/{id}
export const getSubmissionById = async (req : any, res : any) => {
  const id = req.params.id;

  const requestMessage = 'GET /submission/' + id
  logger.info(requestMessage)

  const submissions = await getSubmissions(sqlPool)

  const submission = submissions.find((s) => s.submission_id === id);
  if (!submission) {
    const error = 'Submission not found'

    logger.error(error)
    return res.status(404).json({ error });
  }

  logger.info(requestMessage + '. Status: OK')
  res.json(submission);
}

// DELETE /api/submissions/{id}
export const deleteSubmissionHandler = async (req : any, res : any) => {
  const id = req.params.id;
  
  const requestMessage = 'DELETE /submissions/' + id
  logger.info(requestMessage)


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
}