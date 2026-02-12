import type { Client, Pool } from "pg";
import { sqlPool } from "../../sqlPool";
import type { Task } from "../../../models/task";

const query = `

INSERT INTO tasks (
    id, contest_id, name, number_in_contest, text, answer_type, task_data
) VALUES (
    $1, $2, $3, $4, $5, $6, $7
);

`

export async function createTask(task : Task, connection : Pool | Client = sqlPool) {

    const { id, contest_id, name, number_in_contest, text, answer_type, task_data } = task

    const values = 
        // Object.values(task)
        [id, contest_id, name, number_in_contest, text, answer_type, task_data]

    await connection.query(query, values)
}