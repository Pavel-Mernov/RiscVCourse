import express from 'express'
import bcrypt from "bcryptjs"
import jwt from 'jsonwebtoken'

type LoginRequest = {
    body : {
        login ?: string,
        password ?: string
    }
}

const accounts = // это заглушка специально для дисциплины ПИПО. В ВКР будет
[
    {
        login : 'pavelmernov',
        password : await bcrypt.hash('12121212', 10),
    },
]

const JWT_SECRET = 'ghkuifgo8yfo8f.?bjip?hupHOhio?:jkph0gh8b80-JHhipnldcrtiOPghifyuoH'

const loginHandler = async (req : LoginRequest, res : any) => {

    const {
        login,
        password
    } = req.body

  if (!login || !password) {
    return res.status(400).json({ error: 'Login and password are required' });
  }

  
  const match = accounts.find(acc => {


    return ( login == acc.login && bcrypt.compareSync(password, acc.password) )
  } );

  if (!match) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ login }, JWT_SECRET, { expiresIn: '1h' });
  const refreshToken = jwt.sign({ login }, JWT_SECRET, { expiresIn: '7d' });

  res.json({ token, refreshToken });
}


const app = express()

app.use(express.json());

const PORT = 3001

app.post('/login', loginHandler)

app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});