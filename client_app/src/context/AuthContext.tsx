import { createContext, useContext, useState, type ReactNode } from "react";


// 1. Типы для контекста
interface AuthContextType {
  accessToken ?: string;
  setAccessToken: (token ?: string) => void;
}

// 2. Создаём контекст с дефолтным значением
const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// 3. Провайдер контекста
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [accessToken, setAccessToken] = useState<string | undefined>(undefined);

  return (
    <AuthContext.Provider value={{ accessToken, setAccessToken }}>
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
