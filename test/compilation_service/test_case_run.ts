import { codeHelloWorld } from "./scripts/helloworld"
import { readFromFileAndSum } from "./scripts/readFromFileAndSum"
import { runTest } from "./runTest"
import { sumFromConsole } from "./scripts/sumFromConsole"
import { Test } from "../types"
import { strToInt } from "./scripts/strToInt"
import { twoIntsFromStr } from "./scripts/twoIntsFromStr"
import { readStrFromFile } from "./scripts/readStrFromFile"


const testCases : Test[] = [
    
    {
        body : {
            code : codeHelloWorld,
        },
        result : 'Hello, World!'
    },
    /*
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

const PORT = 8080

const url = `http://localhost:${PORT}/compile`

const runTestCases = () => {
    testCases.forEach(test => runTest(test, url))
}

runTestCases()