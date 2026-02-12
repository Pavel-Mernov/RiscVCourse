import { Pool } from "pg";

export const sqlPool = new Pool({
    user : 'pavel_mernov',
    password : '0867',
    database : 'contest_database',
    host : 'contest-db',
    port : 5432
})