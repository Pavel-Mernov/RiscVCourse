import express from 'express'
import contestsRouter from './routes/contests.js'
import { Pool } from 'pg'
import { initDB } from './sql/scripts/initdb.js'

const app = express()
app.use(express.json())
app.use('/api', contestsRouter)

export const sqlPool = new Pool({
    user : 'pavel_mernov',
    password : '0867',
    database : 'contest_database',
    host : 'localhost',
    port : 5432
})

await
    sqlPool.connect()
    .then(() => initDB(sqlPool))
    .then(() => {
        const port = process.env.PORT || 3002
        app.listen(port, () => console.log(`Contest Service running on port ${port}`))
    })
    .catch(console.error)

process.on('SIGINT', async () => {
    await sqlPool.end()
    process.exit(0)
})
