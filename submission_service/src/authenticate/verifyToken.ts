import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

const client = jwksClient({
  jwksUri: 'http://keycloak:8080/realms/pavel_mernov_realm/protocol/openid-connect/certs'
});

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

export function verifyToken(token: string) : Promise<any> {
    
        return new Promise((resolve, reject) => {
            try {
                jwt.verify(token, getKey, {
                    issuer: 'http://localhost:8080/realms/pavel_mernov_realm', 
                    // audience: 'pavel_mernov'
                    }, 
                    (err, decoded) => {
                        if (err) {
                            console.log('Error:\n' + JSON.stringify(err))
                            reject(err);
                        } 
                        else {
                            // console.log(JSON.stringify(decoded)) 
                            resolve(decoded); 
                        }
                });
            }
            catch (err : any) {
                console.log(JSON.stringify(err))
                reject(err)
            }
        });
}