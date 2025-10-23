export type QueryBody = {
    code : string,
    input ?: string,
    filename ?: string,
}

export type Test = {
    body : QueryBody,
    result : string | number,
}