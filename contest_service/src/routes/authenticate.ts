
import jwt, { type JwtPayload } from 'jsonwebtoken'
import { JWT_SECRET } from '../index.js'
import logger from '../logger/logger.js'
import { verifyToken } from './verifyToken.js'



export function authenticate(req : any, res : any, next : any) {
  const header = req.headers.authorization
  if (!header) { 
    const error = 'No token'

    logger.error('Authenticate. ' + error)
    return res.status(401).json({ error }) 
  }

  const [, token] = header.split(' ')
  try {
    const payload = verifyToken(token) as JwtPayload

    console.log(JSON.stringify(payload))

    const login = payload.email as string

    if (!(login.endsWith('@edu.hse.ru') || login.endsWith('@hse.ru'))) {
      throw new Error('Invalid login')
    }

    req.user = payload
    next()
  } catch (e : any) {
    const error = (e as Error).message || JSON.stringify(e)

    logger.error('Authenticate. ' + error)
    return res.status(403).json({ error })
  }
}

export function authenticateTeacher(req : any, res : any, next : any) {
  const header = req.headers.authorization
  if (!header) return res.status(401).json({ error: 'No token' })

  const [, token] = header.split(' ')
  try {
    const payload = verifyToken(token) as JwtPayload
    
    // logger.info('Authenticate teacher. payload retrieved. Payload = ' + JSON.stringify(payload))

    const login = payload.email as string

    // console.log('Login: ' + login)

    if (!login.endsWith('@hse.ru')) {
      const error = `Access Denied. Invalid login. login: ${login}`

      logger.error('Authenticate teacher. ' + error)
      return res.status(403).json({ error })
    }

    next()
  } catch (e : any) {
    const error = JSON.stringify(e)

    logger.error('Authenticate teacher. ' + error)

    return res.status(403).json({ error })
  }
}
