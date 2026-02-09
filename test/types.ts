export type QueryBody = {
    code : string,
    input ?: string,
    filename ?: string,
    timeout ?: string | number
}

export type Test = {
    body : QueryBody,
    result : string | number,
}