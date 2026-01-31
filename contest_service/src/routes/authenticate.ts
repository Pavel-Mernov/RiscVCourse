
import jwt, { type JwtPayload } from 'jsonwebtoken'
import { JWT_SECRET } from '../index.js'
import logger from '../logger/logger.js'



export function authenticate(req : any, res : any, next : any) {
  const header = req.headers.authorization
  if (!header) { 
    const error = 'No token'

    logger.error('Authenticate. ' + error)
    return res.status(401).json({ error }) 
  }

  const [, token] = header.split(' ')
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    req.user = payload
    next()
  } catch {
    const error = `Invalid or expired token.`

    logger.error('Authenticate. ' + error)
    return res.status(403).json({ error })
  }
}

export function authenticateTeacher(req : any, res : any, next : any) {
  const header = req.headers.authorization
  if (!header) return res.status(401).json({ error: 'No token' })

  const [, token] = header.split(' ')
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload
    
    const login = payload.login as string

    // console.log('Login: ' + login)

    if (!login.endsWith('@hse.ru')) {
      const error = `Access Denied. Invalid login. JWT_secret = ${JWT_SECRET}. login: ${login}`

      logger.error('Authenticate teacher. ' + error)
      return res.status(403).json({ error })
    }

    next()
  } catch {
    const error = `Invalid or expired token. JWT secret = ${JWT_SECRET}`

    logger.error('Authenticate teacher. ' + error)

    return res.status(403).json({ error })
  }
}
