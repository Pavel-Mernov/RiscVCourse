import type { Client, Pool } from "pg";
import type { Contest } from "../../../models/contest";
import { sqlPool } from "../../../index.js";

const script = `

INSERT INTO contests (id, deadline, title, description)
VALUES ($1, $2, $3, $4);

`

export async function createContest(connection : Client | Pool = sqlPool, contest : Contest) {
    const { id, deadline, title, description } = contest

    await connection.query(script, [id, deadline, title, description])
}