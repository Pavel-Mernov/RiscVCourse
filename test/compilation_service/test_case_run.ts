import { codeHelloWorld } from "./helloworld"
import { readFromFileAndSum } from "./readFromFileAndSum"
import { runTest } from "./runtest"
import { sumFromConsole } from "./sumFromConsole"
import { Test } from "../types"
import { strToInt } from "./strToInt"
import { twoIntsFromStr } from "./twoIntsFromStr"


const testCases : Test[] = [
    /*
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
    */
    {
        body : {
            code : readFromFileAndSum,
            filename : 'numbers.txt',
            input : `5 -12`,
        },
        result : '-7'
    },

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
]

const PORT = 3000

const url = `http://localhost:${PORT}/compile`

const runTestCases = () => {
    testCases.forEach(test => runTest(test, url))
}

runTestCases()