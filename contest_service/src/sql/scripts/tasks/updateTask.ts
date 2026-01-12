import type { Client, Pool } from "pg";
import type { Task } from "../../../models/task";
import { sqlPool } from "../../../index.js";

const query = `

UPDATE tasks 
SET
    contest_id = $2,
    name = $3,
    number_in_contest = $4,
    text = $5,
    answer_type = $6,
    task_data = $7
WHERE id = $1;
`

export async function updateTask(task : Task, connection : Pool | Client = sqlPool) {

    const values = 
        Object.values(task)
        // [id, contestId, name, numberInContest, text, answerType, timeLimitMs, memoryLimitKb, points, attempts]

    await connection.query(query, values)    
}