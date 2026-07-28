import { error } from 'console';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { JWT_SECRET } from '../index';
import logger from '../logger/logger';


export async function verifyToken(token: string): Promise<JwtPayload | null> {
    try {

        // temporary
        logger.info('JWT SECRET KEY: ' + JWT_SECRET)

        const payload = jwt.verify(token, JWT_SECRET);

        if (typeof payload === "string") {
            return null;
        }

        return payload;
    } catch {
        return null;
    }
}