import logger from "../logger/logger";
import { runCode } from "./runCode";

type CodeRequest = {
    body : {
        code : string,
        input ?: string,
        filename ?: string,
        timeout ?: string
        // type ?: 'stdin' | 'file' | 'both',
    }
}

type Response = {
    status : (code : number) => Response
    json : (data : any) => Response
}



// Handler for POST: /compile endpoint
export async function compile(req : CodeRequest, res : Response) {

    const { 
        code, 
        input, 
        filename, 
        timeout
        // type 
    } = req.body;
    
    const requestMessage = `POST /api/compile. Code: ${code}. Input: ${input}. Filename: ${filename}. Timeout: ${timeout}`

    logger.info(requestMessage)

    // console.log(`Query: ${req.query}. `)

    if (!code) {
        const error = 'Нет кода в теле запроса'

        logger.error(error)
        return res.status(400).json({ error });
    }

    if ((filename) && !input) {
        const error = 'Нет входных данных для имени файла в теле запроса'

        logger.error(error)
        return res.status(400).json({ error });
    }

    // if code size > 10 KBytes
    if (Buffer.byteLength(code, 'utf-8') > 10 * 1024) {
        const error = 'Превышен максимальный размер кода: 10 Кбайт'

        logger.error(error)
        return res.status(400).json({ error })
    }

    if (timeout && !(Array.from(timeout).every(c => '0123456789'.includes(c)))) {
        const error = 'Значение timeout не является целым неотрицательным числом'

        logger.error(error)
        return res.status(400).json({ error });        
    }

    const timeoutNumber = timeout ? parseInt(timeout) : undefined

    return await runCode(res, code, input, filename, timeoutNumber)
}