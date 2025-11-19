import type { Client, Pool } from "pg";
import { sqlPool } from "../../../index.js";

const query = `

DELETE FROM tasks WHERE id = $1;

`

export async function deleteTask(taskId : string, connection : Client | Pool = sqlPool) {
    await connection.query(query, [taskId])
}