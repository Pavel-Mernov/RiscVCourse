import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useServerConnection } from "./ServerConnectionContext";
import { decodeToken, getLogin } from "./decode";

interface AuthContextType {
  accessToken?: string;
  isTokenValid: () => boolean,
  getLogin: () => string | undefined,
  isUserValidTeacher: () => boolean,
  setAccessToken: (token?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [accessToken, setAccessToken] = useState<string | undefined>(() => {
    return localStorage.getItem('accessToken') || undefined
  });
  const { serverIp, auth } = useServerConnection()

  function isUserValidTeacher() {
    if (!accessToken || !isTokenValid()) {
      return false
    }

    const login = getLogin(accessToken)

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
    if (!decoded || !decoded.exp) return false;

    const now = Date.now() / 1000;
    return decoded.exp >= now;
  }

  useEffect(() => {
    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
    } else {
      localStorage.removeItem('accessToken');
    }
  }, [accessToken]);

  useEffect(() => {
    const fetchRefresh = async () => {
      if (!accessToken || isTokenValid()) {
        return
      }

      try {
        const url = `https://${serverIp}/${auth}/api/refresh`
        const response = await fetch(url, {
          method: 'POST',
          credentials: 'include',
        })

        if (!response.ok) {
          if (response.status === 401) {
            setAccessToken(undefined)
          }

          return
        }

        const result = await response.json()

        if ('accessToken' in result) {
          setAccessToken(result.accessToken)
        }
      }
      catch {}
    }

    fetchRefresh();
  }, [])

  const context: AuthContextType = {
    accessToken,
    setAccessToken,
    getLogin: () => getLogin(accessToken),
    isUserValidTeacher,
    isTokenValid
  }

  return (
    <AuthContext.Provider value={context}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
};
