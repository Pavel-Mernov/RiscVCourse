
import jwt, { type JwtPayload } from 'jsonwebtoken'
import { JWT_SECRET } from '../index.js'



export function authenticate(req : any, res : any, next : any) {
  const header = req.headers.authorization
  if (!header) return res.status(401).json({ error: 'No token' })

  const [, token] = header.split(' ')
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    req.user = payload
    next()
  } catch {
    return res.status(403).json({ error: `Invalid or expired token.` })
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
      return res.status(403).json({ error: `Access Denied. Invalid login` })
    }

    next()
  } catch {
    return res.status(403).json({ error: `Invalid or expired token.` })
  }
}
