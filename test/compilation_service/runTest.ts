import { sendRequest } from "../sendRequest"
import { Test } from "../types"

export async function runTest(testCase : Test, url : string) {
    
    const resp = await sendRequest(url, testCase.body, 'POST')
    if ('output' in resp && (!('error' in resp) || !(resp.error))) {
        
        if (resp.output == testCase.result) {
            // console.log('Req.Body: ' + JSON.stringify(testCase.body))

            console.log('OK. Output: ' + resp.output)
        }
        else {
            console.error(`Output: ${resp.output}. Expected output: ${testCase.result}`)
        }
        
    }
    else {
        console.error(resp.error)
    }

    return null
}