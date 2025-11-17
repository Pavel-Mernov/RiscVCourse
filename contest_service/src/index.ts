import express from 'express'
import contestsRouter from './routes/contests.js'

const app = express()
app.use(express.json())
app.use('/api', contestsRouter)

const port = process.env.PORT || 3002
app.listen(port, () => console.log(`Contest Service running on port ${port}`))
