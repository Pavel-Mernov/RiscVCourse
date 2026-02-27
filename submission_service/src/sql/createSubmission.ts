import { Client, Pool } from "pg";
import type { Submission } from "../controllers/submissionController";
import { sqlPool } from "./sqlPool";

export async function createSubmission(submission : Submission, connection : Pool | Client = sqlPool) {
    
    const { submission_id, task_id, student_id, timestamp, text, verdict } = submission

    const query = `
        INSERT INTO submissions(submission_id, task_id, student_id, timestamp, text, verdict)
        VALUES ($1, $2, $3, $4, $5, $6);
    `

    await connection.query(query, [submission_id, task_id, student_id, timestamp, text, verdict])
}