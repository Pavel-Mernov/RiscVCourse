import express from 'express'
import request from 'supertest'

jest.mock('uuid', () => ({
  validate: jest.fn()
}));
jest.mock('../sql/getSubmissions', () => ({
  getSubmissions: jest.fn()
}));
jest.mock('../logger/logger', () => ({
  info: jest.fn(),
  error: jest.fn()
}));

import { validate as isUUID } from 'uuid';
import { getSubmissionById } from '../controllers/submissionController';
import { error } from 'node:console';
import { getSubmissions } from '../sql/getSubmissions';

const mockReq = (id : string) => ({ params: { id } });
const mockRes = () => {
  const res : any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('GET /api/submission/id', () => {
    let app : any

    beforeEach(() => {
        jest.clearAllMocks()

        app = express()
        app.use(express.json())
        app.get('/api/submission/:id', getSubmissionById)
    })

    test('Возвращает 404, если submission не найден', async () => {
        const nonExistingId = '11111111-1111-1111-1111-111111111111'
        
        ;(getSubmissions as jest.Mock).mockResolvedValue([])

        const res = await request(app).get('/api/submission/' + nonExistingId)
        expect(res.status).toBe(404)
        expect(res.body).toEqual({ error : `Submission not found` })
    })

    test('Возвращает 200 и объект submission при корректном запросе', async () => {
        // создаём тестовый submission в БД
        const submission_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'

        const submission = { 
            submission_id,
            task_id : '123',
            student_id : '456',
            text: 'submission text',
            timestamp: new Date(Date.now()).toISOString(),
            verdict : null,
         }

        ;(getSubmissions as jest.Mock).mockResolvedValue([submission])

        const res = await request(app).get('/api/submission/' + submission_id)
        expect(res.status).toBe(200)
        expect(res.body).toEqual(submission)
    })

})

