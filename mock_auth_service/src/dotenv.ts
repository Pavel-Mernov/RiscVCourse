import dotenv from 'dotenv'

dotenv.config()


export const JWT_SECRET = process.env.JWT_SECRET ?? 'jwt-secret'
export const PORT = process.env.PORT ?? '3003'
export const PWD1 = process.env.PWD1 ?? '00000000'
export const PWD_ADMIN = process.env.PWD_ADMIN ?? 'admin1111'