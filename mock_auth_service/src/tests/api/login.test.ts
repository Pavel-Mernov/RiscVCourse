import request from 'supertest'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import authController, { accounts } from '../../controllers/authController' // массив аккаунтов

import express from "express"
import cookieParser from 'cookie-parser'
import { JWT_SECRET } from '../../dotenv'


jest.mock('jsonwebtoken')
jest.mock('bcryptjs')

const app = express()

app.use(express.json())
app.use(cookieParser())

app.post('/api/login', authController.login)
// app.post('/api/refresh', authController.refresh)

describe('POST /api/login', () => {


  const validUser = {
    login: 'testuser',
    password: 'hashedPassword'
  }

  beforeAll(() => {
    // Мокаем аккаунты
    accounts.length = 0
    accounts.push(validUser)
  })

  test('должно вернуть 400 если login или password отсутствуют', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({})

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Login and password are required')
  })

  test('должно вернуть 401 при неправильных учетных данных', async () => {
    ;(bcrypt.compareSync as jest.Mock).mockReturnValue(false)

    const res = await request(app)
      .post('/api/login')
      .send({ login: 'testuser', password: 'wrong' })

    expect(res.status).toBe(401)
    expect(res.body.error).toBe('Invalid credentials')
  })

  test('должно вернуть accessToken и установить refreshToken cookie при успешном входе', async () => {
    ;(bcrypt.compareSync as jest.Mock).mockReturnValue(true)

    ;(jwt.sign as jest.Mock)
      .mockReturnValueOnce('ACCESS_TOKEN')
      .mockReturnValueOnce('REFRESH_TOKEN')

    const res = await request(app)
      .post('/api/login')
      .send({ login: 'testuser', password: '123456' })

    expect(res.status).toBe(200)
    expect(res.body.accessToken).toBe('ACCESS_TOKEN')

    const cookies = res.headers['set-cookie']
    expect(cookies).toBeDefined()
    expect((cookies as string)[0]).toContain('refreshToken=REFRESH_TOKEN')
    expect((cookies as string)[0]).toContain('HttpOnly')
  })

})

/*
describe('POST /api/refresh', () => {
  test('Ошибка если токена нет', async () => {
    const res = await request(app)
      .post('/api/refresh')
      .send()

    expect(res.status).toBe(400)
    expect(res.body).toEqual({ error: 'Refresh Token Required' })
  })

  test('Успешное обновление токена', async () => {
    ;(verifyRefreshToken as jest.Mock).mockResolvedValue({ login: 'john' })
    ;(jwt.sign as jest.Mock).mockReturnValue('newAccessToken123')

    const res = await request(app)
      .post('/api/refresh')
      .set('Cookie', 'refreshToken=validToken123')

    expect(verifyRefreshToken).toHaveBeenCalledWith('validToken123')
    expect(jwt.sign).toHaveBeenCalled()
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ accessToken: 'newAccessToken123' })
  })

  test('Ошибка если токен невалиден', async () => {
    ;(verifyRefreshToken as jest.Mock).mockRejectedValue(new Error('Invalid refresh token'))

    const res = await request(app)
      .post('/api/refresh')
      .set('Cookie', 'refreshToken=badToken')

    expect(res.status).toBe(403)
    expect(res.body).toEqual({ error: 'Invalid refresh token' })
  })
})
  */
