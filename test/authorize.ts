import { sendRequest } from "./sendRequest.ts"

interface Credentials {
    login : string,
    password : string,
}

const defaultCredentials = {
        login : 'pavelmernov',
        password : '12121212',
    }

export async function authorizeMock(credentials : Credentials = defaultCredentials) {
    const res = await sendRequest('http://localhost:3003/api/login', credentials, 'POST')

    return res
}