import { Client, Pool } from "pg";
import type { Submission } from "../index.js";

export async function createSubmission(submission : Submission, connection : Pool | Client) {
    
    // const { submission_id, task_id, student_id, timestamp, text, verdict } = submission

    const query = `
        INSERT INTO Submission(submission_id, task_id, student_id, timestamp, text, verdict)
        VALUES ($1, $2, $3, $4, $5, $6);
    `

    await connection.query(query, Object.values(submission))
}