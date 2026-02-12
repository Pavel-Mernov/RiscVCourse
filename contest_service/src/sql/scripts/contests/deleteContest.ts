import type { Client, Pool } from "pg";
import { sqlPool } from "../../sqlPool";

const query = `

DELETE FROM contests
WHERE id = $1;

`

export async function deleteContest(id : string, connection : Client | Pool = sqlPool) {
    await connection.query(query, [id])
}