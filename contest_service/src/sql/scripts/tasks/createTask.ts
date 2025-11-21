import type { Client, Pool } from "pg";
import { sqlPool } from "../../../index.js";
import type { Task } from "../../../models/task.js";

const query = `

INSERT INTO tasks (
  id, contest_id, name, number_in_contest, text,
  answer_type, time_limit_ms, memory_limit_kb, points, attempts
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
);

`

export async function createTask(task : Task, connection : Pool | Client = sqlPool) {

    const { id, contest_id, name, number_in_contest, text, answer_type, time_limit_ms, memory_limit_kb, points, attempts } = task

    const values = 
        // Object.values(task)
        [id, contest_id, name, number_in_contest, text, answer_type, time_limit_ms, memory_limit_kb, points, attempts]

    await connection.query(query, values)
}