import { authorizeMock } from "../authorize.ts"
import { sendRequest } from "../sendRequest.ts"


async function authorizeForAddTasks() {
    const credentials = {
        login : 'kpashigorev@hse.ru',
        password : '06010601'
    }

    const res = await authorizeMock(credentials)

    if (typeof res == 'object' && 'error' in res) {
        return res
    }

    const data = JSON.parse(res)

    if ('accessToken' in data) {
        console.log('Access token: ' + data.accessToken)

        return data.accessToken as string
    }
}

async function addContest(token : string, title : string, description ?: string) {
    const PORT = 3002
    
    const url = `http://localhost:${PORT}/api/contests`
    
    const body = {
        title,
        description,
    }
    
    const res = await sendRequest(url, body, 'POST', token)

    if (typeof res === 'object' && 'error' in res) {
        return res
    }

    const resBody = JSON.parse(res)

    const id = resBody.id as string

    return id
}

// const authResult = await authorizeForAddTasks()

// console.log(authResult)

async function addContest12(token : string | { error : any } = '') {
    

    if (typeof token != 'string') {
        console.log('error: ' + token.error)
        return
    }

    const addResult1 = await addContest(token, 'Знакомство с RISC-V', 'Сейчас ты познакомишься с архитектурой RISC-V')

    if (typeof addResult1 == 'object') {
        console.log('error: ' + addResult1.error)
        return
    }

    console.log('id1: ' + addResult1)

    const addResult2 = await addContest(token, 'Простые задачи по RISC-V', 'Сейчас ты будешь решать задачи по ассемблеру RISC-V')

    if (typeof addResult2 == 'object') {
        console.log('error: ' + addResult2.error)
        return
    }

    console.log('id2: ' + addResult2)
}

async function addTask(token : string, contestId : string, name : string, text : string, answer_type : string = 'theory') {
    const PORT = 3002

    const body = {
        name,
        text,
        answer_type,
    }

    const url = `http://localhost:${PORT}/api/contests/${contestId}/tasks`

    await sendRequest(url, body, 'POST', token)

}

const accessToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2dpbiI6ImtwYXNoaWdvcmV2QGhzZS5ydSIsImlhdCI6MTc2Nzg3MTkyMywiZXhwIjoxNzY3ODc1NTIzfQ.OWwBBKQ0ZGOPNlQnsmcLBhurO3DOxUNsmCsbkDmMCtk`

async function addTask1(token : string) {
    const name = 'История RISC-V'

    const text = `
Идея проектирования открытой и расширяемой системы команд для процессоров с применением RISC подхода появилась в 2010 году как продолжение исследований по изучению вычислительных систем в Калифорнийском университете Беркли в США, при непосредственном участии профессора Дэвида Паттерсона — обладателя премии Тьюринга и одного из авторов концепций RISC. Именование новой системы команд следует исторической линейке проектов — RISC-I/RISC-II (1981), RISC-III/SOAR (1984) и RISC-IV/SPUR (1988).[4]

Руководителем группы разработчиков RISC-V был профессор Крсте Асанович, нынешние участники процесса развития RISC-V являются добровольцами из многих научных организаций, университетов и коммерческих компаний разных стран мира. В отличие от других академических проектов, сосредоточенных на образовательных целях, RISC-V изначально проектируется для широкого круга компьютерных применений.    
    `

    const answer_type = 'theory'

    const contestId = `0b16b3bd-08d0-4479-a0d8-86510af15cb5`

    await addTask(token, contestId, name, text)
}

async function addTask2(token : string) {
    const name = 'Основные команды RISC-V'

    const text = `
Спецификация стандарта[24] определяет 32 базовых регистра и 40 кодов машинных инструкций в RV32I или 52 кода в RV64I. Аббревиатура RV32I расшифровывается как RV — RISC-V, 32-разрядная (в RV64I — 64-разрядная), I (от Integer) — кодирование команд с целочисленной арифметикой. Длина машинных инструкций фиксированная — 32 бита.

Основные расширения для дополнения базовых наборов команд:

M — целочисленное умножение и деление.
A — атомарные операции с памятью.
F и D — дополнительные 32 регистра и инструкции для операций с плавающей точкой одинарной (Float) и двойной (Double) точности.
C — сжатый формат команд длиной 16 бит, кодирование инструкций реализовано как подмножество RV32I/RV64I и предназначено для удвоения плотности упаковки в машинном слове наиболее востребованных стандартных инструкций.    
    `

    const answer_type = 'theory'

    const contestId = `0b16b3bd-08d0-4479-a0d8-86510af15cb5`

    await addTask(token, contestId, name, text)
}

await addTask2(accessToken)
// await addContest12()

