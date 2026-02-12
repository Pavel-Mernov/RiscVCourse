import type { Client, Pool } from "pg";
import type { Test } from "../../../models/test_model";
import { sqlPool } from "../../sqlPool";

const query = `

INSERT INTO tests (
  id, task_id, input, expected_output
) VALUES (
  $1, $2, $3, $4
);

`

export async function createTest(test : Test, connection : Pool | Client = sqlPool) {
    const { id, task_id, input, expected_output } = test

    await connection.query(query, [id, task_id, input, expected_output])
}