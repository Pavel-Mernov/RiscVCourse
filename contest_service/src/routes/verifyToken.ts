import { error } from 'console';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

const client = jwksClient({
  jwksUri: 'https://api.riscvcourse.ru/realms/pavel_mernov_realm/protocol/openid-connect/certs'
});

function getKey(header : any, callback : any) {
  client.getSigningKey(header.kid, (_, key) => {
    const signingKey = key?.getPublicKey() || null;
    callback(null, signingKey);
  });
}

export function verifyToken(token: string) : Promise<jwt.JwtPayload | string | undefined> {
  return new Promise((resolve, reject) => {
    jwt.verify(token, getKey, {
      issuer: 'http://localhost:8080/realms/pavel_mernov_realm', 
      audience: 'pavel_mernov'
    }, (err, decoded) => {
      if (err) {
        console.log('Error:\n' + JSON.stringify(err))
        reject(err);
      } 
      else {
        console.log(JSON.stringify(decoded)) 
        resolve(decoded); 
      }
    });
  });
}