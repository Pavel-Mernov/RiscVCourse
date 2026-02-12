import type { Client, Pool } from "pg";
import type { Contest } from "../../../models/contest";
import { sqlPool } from "../../sqlPool";

const script = `

SELECT id, deadline, title, description, authorized_only
FROM contests;

`

export async function getContests(connection : Client | Pool = sqlPool) {
    const result = await connection.query(script)

    const rows = result.rows

    const contests = rows.map(row => row as Contest)

    return contests
}