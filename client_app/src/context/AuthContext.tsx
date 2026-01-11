import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { decodeToken, getLoginFromToken } from "./decode";


// 1. Типы для контекста
interface AuthContextType {
  accessToken ?: string;
  isTokenValid : () => boolean,
  isUserValidTeacher : () => boolean,
  setAccessToken: (token ?: string) => void;
}

// 2. Создаём контекст с дефолтным значением
const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// 3. Провайдер контекста
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [accessToken, setAccessToken] = useState<string | undefined>(() => {
    
    return localStorage.getItem('accessToken') || undefined
  });

  function isUserValidTeacher() {
    if (!accessToken || !isTokenValid()) {
      return false
    }

    const login = getLoginFromToken(accessToken)

    if (!login) {
        return false
    }

    return login.endsWith('@hse.ru')
  }

  function isTokenValid(): boolean {
    if (!accessToken) {
      return false
    }

    const decoded = decodeToken(accessToken);
    if (!decoded || !decoded.exp) return false; // нет данных
  
    const now = Date.now() / 1000; // текущее время в секундах
    return decoded.exp >= now;
  }
  
  // При изменении токена сохраняем его в localStorage
  useEffect(() => {
    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
    } else {
      localStorage.removeItem('accessToken');
    }
  }, [accessToken]);

  return (
    <AuthContext.Provider value={{ accessToken, setAccessToken, isUserValidTeacher, isTokenValid }}>
      {children}
    </AuthContext.Provider>
  );
};

// 4. Кастомный хук для удобного доступа к контексту
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
};
