import { Client } from 'pg'

const script = `
CREATE TABLE IF NOT EXISTS contests (
  id           TEXT PRIMARY KEY,
  deadline     TIMESTAMPTZ,
  title        TEXT NOT NULL,
  description  TEXT
);


CREATE TABLE IF NOT EXISTS tasks (
  id               TEXT PRIMARY KEY,
  contest_id       TEXT NOT NULL REFERENCES contests(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  number_in_contest INTEGER,
  text             TEXT NOT NULL,
  answer_type      TEXT NOT NULL CHECK (answer_type IN ('theory', 'choice', 'text', 'code')),
  time_limit_ms    INTEGER,
  memory_limit_kb  INTEGER,
  points           INTEGER,
  attempts         INTEGER
);


CREATE TABLE IF NOT EXISTS tests (
  id              TEXT PRIMARY KEY,
  task_id         TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  input           TEXT NOT NULL,
  expected_output TEXT NOT NULL
);
` 


export async function initDB(client : Client) {


    await client.connect()
    await client.query(script)
    await client.end()
}