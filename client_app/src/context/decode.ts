
// import { jwtDecode, type JwtPayload } from 'jwt-decode';

import * as jwtDecodeModule from 'jwt-decode';
const jwtDecode = (jwtDecodeModule as any).default || jwtDecodeModule.jwtDecode;

interface JwtPayload {
    login : string,
    iat : number,
    exp : number,
}

export function decodeToken(token: string) {
  try {
    
    const result = jwtDecode(token);

    

    return result as JwtPayload
  } catch (e) {
    console.error('Invalid token', e);
    return undefined;
  }
}

export function getLogin(token ?: string) {
  if (!token) return undefined
  
  const decoded = decodeToken(token);
  return decoded?.login || undefined; // либо другое поле с данными пользователя
}


