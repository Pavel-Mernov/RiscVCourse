import { Client, Pool } from "pg";
import type { Submission } from "../index.js";

export async function createSubmission(submission : Submission, connection : Pool | Client) {
    
    const { submission_id, task_id, student_id, timestamp, text, verdict } = submission

    const query = `
    INSERT INTO submissions (submission_id, task_id, student_id, timestamp, text, verdict)
    VALUES (
    ${ submission_id },         -- submission_id (string)
    ${ task_id },               -- task_id
    ${ student_id },            -- student_id
    ${ timestamp },             -- timestamp в ISO формате (будет сохранён в TIMESTAMP)
    ${ text },                  -- text
    ${ verdict ?? 'null' }      -- verdict (может быть NULL)
    );
    `

    await connection.query(query)
}