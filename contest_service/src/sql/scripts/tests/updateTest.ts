import type { Client, Pool } from "pg";
import type { Test } from "../../../models/test";
import { sqlPool } from "../../../index.js";

const query = `

UPDATE tests
SET
  task_id = $2,
  input = $3,
  expected_output = $4
WHERE id = $1;

`

export async function updateTest(test : Test, connection : Pool | Client = sqlPool) {
    const { id, taskId, input, expectedOutput } = test

    await connection.query(query, [id, taskId, input, expectedOutput])
}