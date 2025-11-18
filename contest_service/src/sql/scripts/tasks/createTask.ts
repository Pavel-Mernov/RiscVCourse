import type { Client, Pool } from "pg";
import { sqlPool } from "../../..";
import type { Task } from "../../../models/task";

const query = `

INSERT INTO tasks (
  id, contest_id, name, number_in_contest, text,
  answer_type, time_limit_ms, memory_limit_kb, points, attempts
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
);

`

export async function createTask(task : Task, connection : Pool | Client = sqlPool) {

    const { id, contestId, name, numberInContest, text, answerType, timeLimitMs, memoryLimitKb, points, attempts } = task

    const values = 
        // Object.values(task)
        [id, contestId, name, numberInContest, text, answerType, timeLimitMs, memoryLimitKb, points, attempts]

    await connection.query(query, values)
}