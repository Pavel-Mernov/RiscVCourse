import { Client, Pool } from "pg";
import type { Submission } from "../index.js";

const script = `
    SELECT * FROM submissions;
`

export async function getSubmissions(connection : Pool | Client) {
    const result = await connection.query(script)

    const submissions = result.rows.map(r => r as Submission)

    return submissions
}