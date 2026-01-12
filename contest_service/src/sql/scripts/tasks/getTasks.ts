import type { Client, Pool } from "pg";
import { sqlPool } from "../../../index.js";
import type { Task } from "../../../models/task.js";

const query = `

SELECT 
    id, contest_id, name, number_in_contest, text, answer_type, task_data
FROM tasks;

`

export async function getTasks(connection : Client | Pool = sqlPool) {
    const result = await connection.query(query)
    const rows = result.rows

    const tasks = rows.map(r => r as Task)

    return tasks
}