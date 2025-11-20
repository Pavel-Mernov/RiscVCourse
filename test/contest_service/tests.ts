import { sendRequest } from "../sendRequest.ts"

async function testCase1() {
    const PORT = 3002

    const url = `http://localhost:${PORT}/api/contests`

    await sendRequest(url, undefined, 'GET')
}

async function testCase2() {
    const PORT = 3002

    const url = `http://localhost:${PORT}/api/contests`



    await sendRequest(url, {}, 'POST')
}

async function testCase3() {
    const PORT = 3002

    const url = `http://localhost:${PORT}/api/contests`

    const body = {
        title : "test contest 1"
    }

    await sendRequest(url, body, 'POST')
}

async function testCase4() {
    const PORT = 3002

    const id = '97e8cc17-91bc-41b3-aff0-554da163ebeb'

    const url = `http://localhost:${PORT}/api/contests/${id}`
    
    await sendRequest(url, undefined, 'GET')
}

async function testCase5() {
    const PORT = 3002

    const id = '97e8cc17-91bc-41b3-aff0-554da163ebeb'

    const url = `http://localhost:${PORT}/api/contests/${id}`
    
    const body = {
        description : 'first test contest to add'
    }

    await sendRequest(url, body, 'PUT')
}

async function testCase6() {
    const PORT = 3002

    const id = '97e8cc17-91bc-41b3-aff0-554da163ebeb'

    const url = `http://localhost:${PORT}/api/contests/${id}`
    

    await sendRequest(url, undefined, 'DELETE')
}

await testCase1()

await testCase6()