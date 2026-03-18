import type { Client, Pool } from "pg";
import type { Verdict } from "../controllers/submissionController";

const query = `
    UPDATE submissions SET verdict = $1, points = $2 WHERE submission_id = $3;
`

export async function updateVerdict(id : string, verdict : Verdict | undefined, points : number | undefined, connection : Pool | Client) {
    
    const result = await connection.query(query, [verdict, points, id])

    return result.rowCount
}