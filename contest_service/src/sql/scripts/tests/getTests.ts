import type { Client, Pool } from "pg";
import { sqlPool } from "../../sqlPool";
import type { Test } from "../../../models/test_model";

const query = `

SELECT * FROM tests;

`

export async function getTests(connection : Pool | Client = sqlPool) {
    const { rows } = await connection.query(query)

    const tests = rows.map(t => t as Test)

    return tests
}