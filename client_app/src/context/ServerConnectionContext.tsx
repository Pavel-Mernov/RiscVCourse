import {  createContext, useContext, type ReactNode } from "react"

interface ServerContextType {
    serverIp : string
    compilation : string
    contest : string
    auth : string
    mockAuth : string
    submission : string
}

const serverIp = 'api.riscvcourse.ru'

const serverContext : ServerContextType = {
    serverIp,
    auth : 'auth',
    compilation : 'compilation',
    contest : 'contest',
    mockAuth : 'mockauth',
    submission : 'submission',
}

const ServerConnectionContext = createContext(serverContext)

interface ProviderProps {
    children : ReactNode
}

export const ServerConnectionProvider = ({ children } : ProviderProps) => (
    <ServerConnectionContext.Provider value={serverContext}>
        { children }
    </ServerConnectionContext.Provider>
)


// Custom hook
export function useServerConnection() : ServerContextType  {
    const context = useContext(ServerConnectionContext)

    if (!context) {
        throw new Error('Server Connection context must be inside Server Connection Provider')
    }

    return context
}