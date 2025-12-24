import { Client, Pool } from "pg";

export async function deleteSubmission(submission_id : string, connection : Pool | Client) {
    const query = `
    DELETE FROM submissions
    WHERE submission_id = '${submission_id}';    
    `

    await connection.query(query)
}