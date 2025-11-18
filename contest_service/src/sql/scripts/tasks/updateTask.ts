import type { Client, Pool } from "pg";
import type { Task } from "../../../models/task";
import { sqlPool } from "../../..";

const query = `

UPDATE tasks
SET
  contest_id = $2,
  name = $3,
  number_in_contest = $4,
  text = $5,
  answer_type = $6,
  time_limit_ms = $7,
  memory_limit_kb = $8,
  points = $9,
  attempts = $10
WHERE id = $1;

`

export async function updateTask(task : Task, connection : Pool | Client = sqlPool) {
    const { id, contestId, name, numberInContest, text, answerType, timeLimitMs, memoryLimitKb, points, attempts } = task

    const values = 
        // Object.values(task)
        [id, contestId, name, numberInContest, text, answerType, timeLimitMs, memoryLimitKb, points, attempts]

    await connection.query(query, values)    
}