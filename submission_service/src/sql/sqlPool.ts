import { Pool } from "pg";

export const sqlPool = new Pool({
    user : 'pavel_mernov',
    password : '0867',
    database: 'submission_database',
    host : 'submission-db',
    port : 5432
})