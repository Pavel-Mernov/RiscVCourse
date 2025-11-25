
import jwt from 'jsonwebtoken'
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
    return res.status(403).json({ error: `Invalid or expired token. JWT_SECRET: ${JWT_SECRET}` })
  }
}
