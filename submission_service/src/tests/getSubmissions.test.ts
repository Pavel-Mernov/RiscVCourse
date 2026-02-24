
import express from 'express'
import request from 'supertest'

jest.mock('uuid', () => ({
    validate : jest.fn(),
}))

import { validate as mockValidate } from 'uuid'

jest.mock('../sql/getSubmissions')
jest.mock('../logger/logger', () => ({
  info: jest.fn(),
  error: jest.fn()
}))

import { getSubmissionHandler } from '../controllers/submissionController'
import { getSubmissions } from '../sql/getSubmissions'

describe('GET /api/submissions', () => {

  // Локальное приложение Express прямо в тесте
  const createApp = () => {
    const app = express()
    app.get('/api/submissions', getSubmissionHandler)
    return app
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('возвращает submissions данного пользователя к данной задаче при корректных параметрах', async () => {
    const app = createApp()
    const taskId = '11111111-1111-1111-1111-111111111111'
    const userId = 'user-123'

    ;(mockValidate as jest.Mock).mockReturnValue(true);

    ;(getSubmissions as jest.Mock).mockResolvedValue([
      { task_id: taskId, student_id: userId, content: 'good' },
      { task_id: taskId, student_id: 'another', content: 'skip' }
    ])

    const res = await request(app)
      .get('/api/submissions')
      .query({ taskId, userId })

    expect(res.status).toBe(200)
    expect(res.body).toEqual([
      { task_id: taskId, student_id: userId, content: 'good' }
    ])
  })

  test('ошибка 400 при отсутствии taskId', async () => {
    const app = createApp()


    ;(getSubmissions as jest.Mock).mockResolvedValue([])

    const res = await request(app)
      .get('/api/submissions')
      

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Invalid or missing taskId')
  })

  test('ошибка 400 при отсутствии userId', async () => {
    const app = createApp()
    const taskId = '11111111-1111-1111-1111-111111111111'


    ;(getSubmissions as jest.Mock).mockResolvedValue([
      { task_id: taskId, student_id: 'undefined', content: 'undefined' },
    ])

    const res = await request(app)
      .get('/api/submissions')
      .query({ taskId })

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Invalid or missing userId')
  })


})
