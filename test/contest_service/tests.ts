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

async function testCaseGetTasks(contestId : string) {
    const PORT = 3002

    const url = `http://localhost:${PORT}/api/contests/${contestId}/tasks`

    await sendRequest(url, undefined, 'GET')
}

async function testCaseCreateTask(contestId : string) {
    const PORT = 3002

    const body = {
        name : 'Task 1',
        text : 'Test task 1',
        answerType : 'theory',
    }

    const url = `http://localhost:${PORT}/api/contests/${contestId}/tasks`

    await sendRequest(url, body, 'POST')
}

async function testCaseCreateTask2(contestId : string) {
    const PORT = 3002

    const body = {
        name : 'Task 2',
        text : 'Test task 2',
        answerType : 'cho',
    }

    const url = `http://localhost:${PORT}/api/contests/${contestId}/tasks`

    await sendRequest(url, body, 'POST')
}

async function testCaseCreateTask3(contestId : string) {
    const PORT = 3002

    const body = {
        name : 'Task 3',
        text : 'Test task 3',
        answerType : 'choice',
    }

    const url = `http://localhost:${PORT}/api/contests/${contestId}/tasks`

    await sendRequest(url, body, 'POST')
}

async function testCaseGetTaskById(taskId : string) {
    const PORT = 3002

    const url = `http://localhost:${PORT}/api/tasks/${taskId}`

    await sendRequest(url, undefined, 'GET')
}

async function testCaseUpdateTaskById(taskId : string) {
    const PORT = 3002

    const url = `http://localhost:${PORT}/api/tasks/${taskId}`

    const body = {
        points : 3
    }

    await sendRequest(url, body, 'PUT')
}

async function testCaseDeleteTaskById(taskId : string) {
    const PORT = 3002

    const url = `http://localhost:${PORT}/api/tasks/${taskId}`

    await sendRequest(url, undefined, 'DELETE')
}

// await testCase3()

// await testCaseCreateTask('04222305-9092-4ecb-8ba6-5f72382b88b9')

// await testCaseUpdateTaskById('fd83996d-d1bb-4b35-99e5-842eefa55e8e')

// await testCaseCreateTask3('04222305-9092-4ecb-8ba6-5f72382b88b9')

// await testCaseGetTasks('04222305-9092-4ecb-8ba6-5f72382b88b9')

// await testCaseDeleteTaskById('fd83996d-d1bb-4b35-99e5-842eefa55e8e')

await testCaseGetTasks('04222305-9092-4ecb-8ba6-5f72382b88b9')

await testCaseGetTaskById('5aae5e94-c41d-4fba-9a39-dd4f5da3ee9e')

// await testCaseGetTaskById('fd83996d')

// await testCase1()

// await testCase6()