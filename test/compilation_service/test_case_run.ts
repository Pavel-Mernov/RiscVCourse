import { codeHelloWorld } from "./scripts/helloworld.ts"
import { readFromFileAndSum } from "./scripts/readFromFileAndSum.ts"
import { runTest } from "./runTest.ts"
import { sumFromConsole } from "./scripts/sumFromConsole.ts"
import type { Test } from "../types.ts"
import { strToInt } from "./scripts/strToInt.ts"
import { twoIntsFromStr } from "./scripts/twoIntsFromStr.ts"
import { readStrFromFile } from "./scripts/readStrFromFile.ts"


const testCases : Test[] = [
    
    
    {
        body : {
            code : codeHelloWorld,
        },
        result : 'Hello, World!'
    },
    
    {
        body : {
            code : sumFromConsole,
            input : `12
            9`,
        },
        result : '21'
    },  
    {
        body : {
            code : sumFromConsole,
            input : `-78
            9`,
        },
        result : '-69'
    },
    
/*
    {
        body : {
            code : readFromFileAndSum,
            filename : 'numbers.txt',
            input : `5 -12`,
        },
        result : '-7'
    },
*/
/*
    {
        body : {
            code : readFromFileAndSum,
            filename : 'numbers.txt',
            input : 
`5
12`,
        },
        result : '19'
    },
*/
/*    
    {
        body: {
            code: readStrFromFile,
            input: "129",
            filename: "string.txt",
        },
        result: "129"
    },
*/    
/*
   {
       body: {
           code: strToInt,
           input: "123",
       },
       result: 123,
   }, 
   {
       body: {
           code: strToInt,
           input: "0",
       },
       result: 0,
   },
   {
       body: {
           code: strToInt,
           input: "-1625",
       },
       result: -1625,
   },
*/   
/*
  {
      body: {
          code: twoIntsFromStr,
          input: 
`12
3`,
      },
      result: "15"
  },
  {
      body: {
          code: twoIntsFromStr,
          input: 
`15
2`,
      },
      result: "17"
  },
*/       
]

const newTestCases : Test[] = Array(5).map(
    (_, idx) => {
        return {
            body : {
                code : strToInt,
                input: `${idx}`
            },
            result : idx + 1
        }
    })

const PORT = 3000

const serverIp = 
            'localhost' 
            // '130.49.150.32'

const url = `http://${serverIp}:${PORT}/api/compile`

const runTestCases = () => {
    testCases.forEach(test => runTest(test, url))
}

runTestCases()