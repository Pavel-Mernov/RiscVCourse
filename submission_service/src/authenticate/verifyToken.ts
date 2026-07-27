import jwt, { type JwtPayload } from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { JWT_SECRET } from '../index';

/*
const client = jwksClient({
  jwksUri: 'http://keycloak:8080/realms/pavel_mernov_realm/protocol/openid-connect/certs'
});
*/

/*
function getKey(header: any, callback: any) {
  console.log('KID:', header.kid);

  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      console.log('JWKS error:', err);
      return callback(err, null);
    }

    if (!key) {
      return callback(new Error('No signing key found'), null);
    }

    console.log('Key found:', !!key);

    const signingKey = key?.getPublicKey();

    callback(null, signingKey);
  });
}
  */

export async function verifyToken(token: string): Promise<JwtPayload | null> {
    try {
        const payload = jwt.verify(token, JWT_SECRET);

        if (typeof payload === "string") {
            return null;
        }

        return payload;
    } catch {
        return null;
    }
}