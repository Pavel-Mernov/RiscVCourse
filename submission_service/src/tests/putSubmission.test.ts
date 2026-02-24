import express from 'express'
import { putSubmission } from '../controllers/submissionController'
import request from 'supertest'
import { updateVerdict } from '../sql/updateVerdict'
import { getSubmissions } from '../sql/getSubmissions'

jest.mock('uuid', () => ({
    v4 : jest.fn(),
}))

jest.mock('../sql/updateVerdict', () => ({
    updateVerdict: jest.fn()
}))

jest.mock('../sql/getSubmissions', () => ({
    getSubmissions: jest.fn()
}))

describe('PUT /api/submissions/:id/verdict', () => {

    let app : any

    beforeEach(() => {
        jest.clearAllMocks()

        app = express()
        app.use(express.json())
        app.put('/api/submissions/:id/verdict', putSubmission)
    })

    test('Возвращает 400 если поле verdict отсутствует', async () => {

        (updateVerdict as jest.MockedFunction<typeof updateVerdict>).mockResolvedValue(1)

        ;(getSubmissions as jest.Mock).mockResolvedValue([{ 
            submission_id : '123',
            task_id : '123',
            student_id : '456',
            text: 'submission text',
            timestamp: new Date(Date.now()).toISOString(),
            verdict : null,
         }])

        const res = await request(app)
        .put('/api/submissions/123/verdict')
        .send({})

        expect(res.status).toBe(400)
        expect(res.body.error).toBe('Поле verdict обязательно')
    })

    test('Возвращает 400 если verdict недопустим', async () => {

        (getSubmissions as jest.Mock).mockResolvedValue([{ 
            submission_id : '123',
            task_id : '123',
            student_id : '456',
            text: 'submission text',
            timestamp: new Date(Date.now()).toISOString(),
            verdict : null,
         }])

        const res = await request(app)
            .put('/api/submissions/123/verdict')
            .send({ verdict: 'BAD_VALUE' })

        expect(res.status).toBe(400)
        expect(res.body.error).toBe('Недопустимое значение verdict')
    })

    test('Возвращает 404 если submission не найден', async () => {
        (updateVerdict as jest.Mock).mockResolvedValueOnce(0)

        const res = await request(app)
        .put('/api/submissions/111/verdict')
        .send({ verdict: 'OK' })

        expect(res.status).toBe(404)
        expect(res.body.error).toBe('Submission не найден')
    })

    test('Возвращает 200 и сообщение при успешном обновлении', async () => {
        (updateVerdict as jest.Mock).mockResolvedValueOnce(1)

        const res = await request(app)
        .put('/api/submissions/222/verdict')
        .send({ verdict: 'WA' })

        expect(res.status).toBe(200)
        expect(res.body.message).toContain('Вердикт обновлен')
    })

    test('Возвращает 500 при ошибке сервера', async () => {
        (updateVerdict as jest.Mock).mockRejectedValueOnce(new Error('DB error'))

        const res = await request(app)
        .put('/api/submissions/333/verdict')
        .send({ verdict: 'OK' })

        expect(res.status).toBe(500)
        expect(res.body.error).toBe('Внутренняя ошибка сервера: DB error')
    })
})
