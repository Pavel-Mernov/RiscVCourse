import { error } from 'console';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { JWT_SECRET } from '../index';


export async function verifyToken(token: string): Promise<JwtPayload | null> {
    try {

        // temporary
        console.log('JWT SECRET KEY: ' + JWT_SECRET)

        const payload = jwt.verify(token, JWT_SECRET);

        if (typeof payload === "string") {
            return null;
        }

        return payload;
    } catch {
        return null;
    }
}