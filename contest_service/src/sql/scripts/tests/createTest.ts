import type { Client, Pool } from "pg";
import type { Test } from "../../../models/test";
import { sqlPool } from "../../..";

const query = `

INSERT INTO tests (
  id, task_id, input, expected_output
) VALUES (
  $1, $2, $3, $4
);

`

export async function createTest(test : Test, connection : Pool | Client = sqlPool) {
    const { id, taskId, input, expectedOutput } = test

    await connection.query(query, [id, taskId, input, expectedOutput])
}