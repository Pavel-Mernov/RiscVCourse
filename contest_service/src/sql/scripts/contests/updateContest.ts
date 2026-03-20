import type { Client, Pool } from "pg";
import type { Contest } from "../../../models/contest";
import { sqlPool } from "../../sqlPool";

const query = `

UPDATE contests
SET
  deadline = $2,
  title = $3,
  description = $4,
  authorized_only = $5,
  is_active = $6
WHERE id = $1
RETURNING *;

`

export async function updateContest(contest : Contest, connection : Client | Pool = sqlPool,) {
    const { id, deadline, title, description, authorized_only, is_active } = contest

    await connection.query(query, [id, deadline, title, description, authorized_only, is_active])
}