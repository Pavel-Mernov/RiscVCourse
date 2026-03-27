export type Response = {
    status : (status : number) => Response,
    json : (obj : object) => Response,
}