import { sendRequest } from "../sendRequest.ts"
import { authorizeMock } from "../authorize.ts"

async function testCaseGetContests() {
    const PORT = 3002

    const url = `http://localhost:${PORT}/api/contests`

    await sendRequest(url, undefined, 'GET')
}

async function testCaseAddNullContest() {
    const PORT = 3002

    const url = `http://localhost:${PORT}/api/contests`



    await sendRequest(url, {}, 'POST')
}

async function testCaseAddContest(token : string | undefined, title = 'test contest 1', description ?: string) {
    const PORT = 3002

    const url = `http://localhost:${PORT}/api/contests`

    const body = {
        title : title,
        description : description,
    }

    await sendRequest(url, body, 'POST', token)
}

async function testCaseAddContest2(token ?: string) {
    const PORT = 3002

    const url = `http://localhost:${PORT}/api/contests`

    const body = {
        title : "test contest 2",
        description : "test contest 2 description"
    }

    await sendRequest(url, body, 'POST', token)
}

async function testCaseGetContestById(id = '') {
    const PORT = 3002

    

    const url = `http://localhost:${PORT}/api/contests/${id}`
    
    await sendRequest(url, undefined, 'GET')
}

async function testCaseUpdateContestById(token = '', id = '', description = 'description updated') {
    const PORT = 3002

    

    const url = `http://localhost:${PORT}/api/contests/${id}`
    
    const body = {
        description
    }

    await sendRequest(url, body, 'PUT', token)
}

async function testCaseDeleteContest(token = '', id = '') {
    const PORT = 3002

    const url = `http://localhost:${PORT}/api/contests/${id}`
    

    await sendRequest(url, undefined, 'DELETE', token)
}

async function testCaseGetTasks(contestId : string) {
    const PORT = 3002

    const url = `http://localhost:${PORT}/api/contests/${contestId}/tasks`

    await sendRequest(url, undefined, 'GET')
}

async function testCaseCreateTask(token : string, contestId : string) {
    const PORT = 3002

    const body = {
        name : 'Task 1',
        text : 'Test task 1',
        answer_type : 'theory',
    }

    const url = `http://localhost:${PORT}/api/contests/${contestId}/tasks`

    await sendRequest(url, body, 'POST', token)
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

async function testCaseCreateTask3(token : string, contestId : string) {
    const PORT = 3002

    const body = {
        name : 'Task 3',
        text : 'Test task 3',
        answerType : 'choice',
    }

    const url = `http://localhost:${PORT}/api/contests/${contestId}/tasks`

    await sendRequest(url, body, 'POST', token)
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

async function testCaseCreateTest(taskId : string) {
    const PORT = 3002

    const url = `http://localhost:${PORT}/api/tasks/${taskId}/tests`
    
    const body = {
        input : 'test input 1',
        expected_output : 'test 1 expected output'
    }

    await sendRequest(url, body, 'POST')
}

async function testCaseCreateTest2(taskId : string) {
    const PORT = 3002

    const url = `http://localhost:${PORT}/api/tasks/${taskId}/tests`
    
    const body = {
        input : 'test input 2',
        expected_output : 'test 2 expected output'
    }

    await sendRequest(url, body, 'POST')
}

async function testCaseGetTestsByTask(taskId : string) {
    const PORT = 3002

    const url = `http://localhost:${PORT}/api/tasks/${taskId}/tests`

    await sendRequest(url, undefined, 'GET')
}

async function testCaseGetTestById(testId : string) {
    const PORT = 3002

    const url = `http://localhost:${PORT}/api/tests/${testId}`

    await sendRequest(url, undefined, 'GET')
}

async function testCaseUpdateTestById(testId : string) {
    const PORT = 3002

    const url = `http://localhost:${PORT}/api/tests/${testId}`

    const body = {
        expected_output : 'New changed test output'
    }

    await sendRequest(url, body, 'PUT')
}

async function testCaseDeleteTestById(testId : string) {
    const PORT = 3002

    const url = `http://localhost:${PORT}/api/tests/${testId}`

    await sendRequest(url, undefined, 'DELETE')
}

const testToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2dpbiI6InBhdmVsbWVybm92IiwiaWF0IjoxNzY0MDgwMDQxLCJleHAiOjE3NjQwODM2NDF9.FA2SbYkWBFo5ift_n4Gym9hBADbQTjDE9vBFZUKrJ9c"

const testRefreshToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2dpbiI6InBhdmVsbWVybm92IiwiaWF0IjoxNzY0MDgwMDQxLCJleHAiOjE3NjQ2ODQ4NDF9.96g5BLziAwj8Xh_fTntRGnWqUxALdKusTxX-R1Tgi3Q"



// await authorize()

const testCase1 = async () => { 
    await testCaseAddContest(testToken, 'test contest 3', 'contest description 3')
    await testCaseGetContests()
}

const testCase2 = async () => {
    await testCaseGetContestById("04222305-9092-4ecb-8ba6-5f72382b88b9")

    await testCaseGetContestById("990622e7-2495-4964-a6f8-d8c669ec9350")

    await testCaseGetContestById("21d1907f-c3b5-4108-a0cc-1192ed2052e4")
}

const testCase3 = async () => {
    await testCaseUpdateContestById(testToken, "21d1907f-c3b5-4108-a0cc-1192ed2052e4", "contest 3 updated description")

    await testCaseGetContestById("21d1907f-c3b5-4108-a0cc-1192ed2052e4")
}

const testCase4 = async () => {
    await testCaseDeleteContest(testToken, "990622e7-2495-4964-a6f8-d8c669ec9350")

    await testCaseGetContests()
}

const testCase5 = async () => {
    await testCaseCreateTask(testToken, '04222305-9092-4ecb-8ba6-5f72382b88b9')
    await testCaseGetTasks('04222305-9092-4ecb-8ba6-5f72382b88b9')
}

await testCase5()

// await testCaseUpdateTaskById('fd83996d-d1bb-4b35-99e5-842eefa55e8e')

// await testCaseCreateTask3('04222305-9092-4ecb-8ba6-5f72382b88b9')



// await testCaseDeleteTaskById('fd83996d-d1bb-4b35-99e5-842eefa55e8e')

// await testCaseGetTasks('04222305-9092-4ecb-8ba6-5f72382b88b9')

// await testCaseGetTaskById('5aae5e94-c41d-4fba-9a39-dd4f5da3ee9e')

// await testCaseGetTaskById('fd83996d')

// await testCase1()

// await testCase6()

// await testCaseCreateTest('5aae5e94-c41d-4fba-9a39-dd4f5da3ee9e')

// await testCaseCreateTest2('5aae5e94-c41d-4fba-9a39-dd4f5da3ee9e')

// await testCaseGetTestsByTask('5aae5e94-c41d-4fba-9a39-dd4f5da3ee9e')

// await testCaseUpdateTestById('7bab0e89-9c11-4d94-981c-e7114233ade0')

//await testCaseGetTestById('7bab0e89-9c11-4d94-981c-e7114233ade0')

// await testCaseDeleteTestById('7bab0e89-9c11-4d94-981c-e7114233ade0')

// await testCaseGetTestsByTask('5aae5e94-c41d-4fba-9a39-dd4f5da3ee9e')

