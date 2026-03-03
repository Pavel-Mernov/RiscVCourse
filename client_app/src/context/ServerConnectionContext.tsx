import {  createContext, useContext, type ReactNode } from "react"

interface ServerContextType {
    serverIp : string
    compilationPort : number
    contestPort : number
    mockAuthPort : number
    submissionPort : number
}

const serverIp = '130.49.150.32'

const serverContext : ServerContextType = {
    serverIp,
    compilationPort : 3000,
    contestPort : 3002,
    mockAuthPort : 3003,
    submissionPort : 3004,
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