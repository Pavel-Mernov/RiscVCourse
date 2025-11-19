import { sendRequest } from "../sendRequest.ts"

async function testCase1() {
    const PORT = 3002

    const url = `http://localhost:${PORT}/api/contests`

    await sendRequest(url, undefined, 'GET')
}

await testCase1()