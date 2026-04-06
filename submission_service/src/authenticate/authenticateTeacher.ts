import logger from "../logger/logger"
import { verifyToken } from "./verifyToken"

export async function authenticateTeacher(req : any, res : any, next : any) {
  const header = req.headers.authorization
  if (!header) return res.status(401).json({ error: 'No token' })

  const [, token] = header.split(' ')
  try {
    const payload = await verifyToken(token)
    
    logger.info('Authenticate teacher. payload retrieved. Payload = ' + JSON.stringify(payload))

    const login = payload.email as string

    console.log('Login: ' + login)

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