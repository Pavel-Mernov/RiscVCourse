import { Client, Pool } from 'pg'

const script = `
    CREATE TABLE IF NOT EXISTS submissions (
    submission_id    VARCHAR(255) PRIMARY KEY,
    task_id          VARCHAR(255) NOT NULL,
    student_id       VARCHAR(255) NOT NULL,
    timestamp        TIMESTAMP    NOT NULL,
    text             JSONB        NOT NULL,
    verdict          VARCHAR(2),
    CONSTRAINT verdict_check CHECK (verdict IN ('OK', 'WA', 'RE', 'TL', 'IG') OR verdict IS NULL)
    );
`

export async function initDB(connection : Pool | Client) {
    await connection.query(script)
}