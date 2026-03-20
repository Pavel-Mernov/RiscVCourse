import type { Client, Pool } from "pg";
import type { Contest } from "../../../models/contest";
import { sqlPool } from "../../sqlPool";

const script = `

INSERT INTO contests (id, deadline, title, description, authorized_only, is_active)
VALUES ($1, $2, $3, $4, $5, $6);

`

export async function createContest(connection : Client | Pool = sqlPool, contest : Contest) {
    const { id, deadline, title, description, authorized_only, is_active } = contest

    

    await connection.query(script, [id, deadline, title, description, authorized_only, is_active])
}