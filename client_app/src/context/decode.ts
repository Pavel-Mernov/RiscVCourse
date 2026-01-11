
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  exp: number;       // время истечения в секундах с 1970
  iat?: number;      // время выдачи
  sub?: string;      // идентификатор пользователя или другой профиль
  // добавьте другие поля вашего payload, если нужно
}

export function decodeToken(token: string): JwtPayload | null {
  try {
    return jwtDecode(token);
  } catch (e) {
    console.error('Invalid token', e);
    return null;
  }
}

export function getLoginFromToken(token: string) {
  const decoded = decodeToken(token);
  return decoded?.sub || undefined; // либо другое поле с данными пользователя
}


