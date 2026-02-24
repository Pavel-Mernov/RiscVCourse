import express from 'express'

jest.mock('../sql/getSubmissions', () => ({
  getSubmissions: jest.fn()
}))

jest.mock('../sql/deleteSubmission', () => ({
  deleteSubmission: jest.fn()
}))

jest.mock('uuid', () => ({
    v4 : jest.fn(),
}))

import request from 'supertest'

import { getSubmissions } from '../sql/getSubmissions'
import { deleteSubmission } from '../sql/deleteSubmission'
import { deleteSubmissionHandler } from '../controllers/submissionController'

describe('DELETE /api/submissions/:id', () => {

    let app : any

    beforeEach(() => {
        jest.clearAllMocks()

        app = express()
        app.use(express.json())
        app.delete('/api/submissions/:id', deleteSubmissionHandler)
    })

  test('Возвращает 404 если submission не найден', async () => {
    (getSubmissions as jest.Mock).mockResolvedValue([])

    const res = await request(app).delete('/api/submissions/123')

    expect(res.status).toBe(404)
    expect(res.body.error).toBe('Submission not found. id: 123')
    expect(deleteSubmission).not.toHaveBeenCalled()
  })

  test('Возвращает 204 при успешном удалении', async () => {
    (getSubmissions as jest.Mock).mockResolvedValue([
      { submission_id: '123' }
    ])

    ;(deleteSubmission as jest.Mock).mockResolvedValue(undefined)

    const res = await request(app).delete('/api/submissions/123')

    expect(res.status).toBe(204)
    expect(deleteSubmission).toHaveBeenCalledWith('123', expect.anything())
  })

  test('Возвращает 500 если deleteSubmission выбросил ошибку', async () => {
    (getSubmissions as jest.Mock).mockResolvedValue([
      { submission_id: '123' }
    ])

    ;(deleteSubmission as jest.Mock).mockRejectedValue(
      new Error('DB error')
    )

    const res = await request(app).delete('/api/submissions/123')

    expect(res.status).toBe(500)
    expect(res.body.error).toBe('DB error')
  })
})
