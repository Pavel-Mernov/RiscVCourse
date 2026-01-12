import { Client, Pool } from 'pg'

const script = `
CREATE TABLE IF NOT EXISTS contests (
  id                TEXT PRIMARY KEY,
  deadline          TIMESTAMPTZ,
  title             TEXT NOT NULL,
  description       TEXT,
  authorized_only   BOOLEAN
);


CREATE TABLE tasks (
    id TEXT PRIMARY KEY,
    contest_id TEXT NOT NULL,
    name TEXT NOT NULL,
    number_in_contest INTEGER,
    text TEXT NOT NULL,
    answer_type TEXT NOT NULL CHECK (answer_type IN ('theory', 'choice', 'multichoice', 'text', 'code')),
    task_data JSONB
);


CREATE TABLE IF NOT EXISTS tests (
  id              TEXT PRIMARY KEY,
  task_id         TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  input           TEXT NOT NULL,
  expected_output TEXT NOT NULL
);
` 


export async function initDB(connection : Client | Pool) {


    
    await connection.query(script)
    
}