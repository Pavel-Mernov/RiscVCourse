import { Client, Pool } from "pg";
import type { Submission } from "../controllers/submissionController";
import { sqlPool } from "./sqlPool";

const script = `
    SELECT * FROM submissions;
`

export async function getSubmissions(connection : Pool | Client = sqlPool) {
    const result = await connection.query(script)

    const submissions = result.rows.map(r => r as Submission)

    return submissions
}