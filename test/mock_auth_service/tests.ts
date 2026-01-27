import { sendRequest } from "../sendRequest";

type LoginRequestBody = {
    login : string,
    password : string,
}

const tests : LoginRequestBody[] = [
    {
        login : 'pavelmernov',
        password : '12121212',
    },
    {
        login : "",
        password : '',
    },
    {
        login : 'pavelmernov',
        password : '6780',
    },
    {
        login : 'kirill',
        password : 'incorrect'
    }
]

tests.forEach(async (test) => {
    const serverIp = '130.49.150.32'
    const res = await sendRequest('http://' + serverIp + ':3001/login', test, 'POST')

    // console.log(res)

    return null
});