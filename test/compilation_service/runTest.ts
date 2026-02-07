import { sendRequest } from "../sendRequest.ts"
import type { Test } from "../types.ts"

export async function runTest(testCase : Test, url : string) {
    
    const resp = await sendRequest(url, testCase.body, 'POST')
    console.log(resp)

    return null
}