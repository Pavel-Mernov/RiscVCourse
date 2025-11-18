import type { Client, Pool } from "pg";
import { sqlPool } from "../../..";
import type { Task } from "../../../models/task";

const query = `

SELECT *
FROM tasks;

`

export async function getTasks(connection : Client | Pool = sqlPool) {
    const result = await connection.query(query)
    const rows = result.rows

    const tasks = rows.map(r => r as Task)

    return tasks
}