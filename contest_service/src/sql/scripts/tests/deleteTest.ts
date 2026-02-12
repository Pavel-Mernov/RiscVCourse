import type { Client, Pool } from "pg";
import { sqlPool } from "../../sqlPool";

const query = `

DELETE FROM tests
WHERE id = $1;

`

export async function deleteTest(testId : string, connection : Pool | Client = sqlPool) {
    
    await connection.query(query, [testId])
}