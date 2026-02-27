import type { Client, Pool } from "pg";
import type { Verdict } from "../controllers/submissionController";

const query = `
    UPDATE submissions SET verdict = $1 WHERE submission_id = $2;
`

export async function updateVerdict(id : string, verdict : Verdict | undefined, connection : Pool | Client) {
    
    const result = await connection.query(query, [verdict, id])

    return result.rowCount
}