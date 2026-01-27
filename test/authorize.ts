import { sendRequest } from "./sendRequest.ts"

interface Credentials {
    login : string,
    password : string,
}

const defaultCredentials = {
        login : 'pkmernov@edu.hse.ru',
        password : '12121212',
    }

export async function authorizeMock(credentials : Credentials = defaultCredentials) {
    const serverIp = '130.49.150.32'
    const res = await sendRequest(`http://${serverIp}:3003/api/login`, credentials, 'POST')

    return res
}