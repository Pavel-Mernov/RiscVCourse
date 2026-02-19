import dotenv from 'dotenv'

export function configDotenv() {
    dotenv.config()
}

export const JWT_SECRET = process.env.JWT_SECRET ?? 'jwt-secret'
export const PORT = process.env.PORT ?? '3003'