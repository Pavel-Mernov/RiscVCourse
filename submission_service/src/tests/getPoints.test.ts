
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

import { getPointsHandler } from '../controllers/submissionController'
import { getSubmissions } from '../sql/getSubmissions'

describe('GET /api/points', () => {

  // Локальное приложение Express прямо в тесте
  const createApp = () => {
    const app = express()
    app.get('/api/points', getPointsHandler)
    return app
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('возвращает points данного пользователя к данной задаче при корректных параметрах', async () => {
    const app = createApp()
    const taskId = '11111111-1111-1111-1111-111111111111'
    const userId = 'user-123'

    ;(mockValidate as jest.Mock).mockReturnValue(true);

    ;(getSubmissions as jest.Mock).mockResolvedValue([
      { task_id: taskId, student_id: userId, content: 'good' },
      { task_id: taskId, student_id: userId, content: 'very good', points : 1 },
      { task_id: taskId, student_id: 'another', content: 'skip' }
    ])

    const res = await request(app)
      .get('/api/points')
      .query({ taskId, userId })

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ points: 1 })
  })

  test('возвращает undefined, если баллы не указаны', async () => {
    const app = createApp()
    const taskId = '11111111-1111-1111-1111-111111111111'
    const userId = 'user-123'

    ;(mockValidate as jest.Mock).mockReturnValue(true);

    ;(getSubmissions as jest.Mock).mockResolvedValue([
      { task_id: taskId, student_id: userId, content: 'good' },
      { task_id: taskId, student_id: userId, content: 'also good' },
      { task_id: taskId, student_id: 'another', content: 'skip' }
    ])

    const res = await request(app)
      .get('/api/points')
      .query({ taskId, userId })

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ points: undefined })
  })

  test('возвращает максимальный балл данного пользователя к данной задаче', async () => {
    const app = createApp()
    const taskId = '11111111-1111-1111-1111-111111111111'
    const userId = 'user-123'

    ;(mockValidate as jest.Mock).mockReturnValue(true);

    ;(getSubmissions as jest.Mock).mockResolvedValue([
      { task_id: taskId, student_id: userId, content: 'good' },
      { task_id: taskId, student_id: userId, content: 'not very good', points: 0 },
      { task_id: taskId, student_id: userId, content: 'also good', points: 2 },
      { task_id: taskId, student_id: userId, content: 'excellent', points: 5 },
      { task_id: taskId, student_id: 'another', content: 'skip' }
    ])

    const res = await request(app)
      .get('/api/points')
      .query({ taskId, userId })

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ points: 5 })
  })

  test('ошибка 400 при отсутствии taskId', async () => {
    const app = createApp()


    ;(getSubmissions as jest.Mock).mockResolvedValue([])

    const res = await request(app)
      .get('/api/points')
      

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
      .get('/api/points')
      .query({ taskId })

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Invalid or missing userId')
  })


})
