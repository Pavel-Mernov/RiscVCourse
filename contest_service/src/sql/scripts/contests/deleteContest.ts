import type { Client, Pool } from "pg";
import { sqlPool } from "../../../index.js";

const query = `

DELETE FROM contests
WHERE id = $1;

`

export async function deleleContest(id : string, connection : Client | Pool = sqlPool) {
    await connection.query(query, [id])
}