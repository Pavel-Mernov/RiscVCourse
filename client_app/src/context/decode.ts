
// import { jwtDecode, type JwtPayload } from 'jwt-decode';

import * as jwtDecodeModule from 'jwt-decode';
const jwtDecode = (jwtDecodeModule as any).default;

interface JwtPayload {
    login : string,
    iat : number,
    exp : number,
}

export function decodeToken(token: string) {
  try {
    const result = jwtDecode(token);

    console.log(result)

    return result as JwtPayload
  } catch (e) {
    console.error('Invalid token', e);
    return undefined;
  }
}

export function getLoginFromToken(token: string) {
  const decoded = decodeToken(token);
  return decoded?.login || undefined; // либо другое поле с данными пользователя
}


