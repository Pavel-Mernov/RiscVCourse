import bcrypt from "bcryptjs"
import logger from "../logger"
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from "../dotenv"

export const accounts = // это заглушка специально для дисциплины ПИПО. В ВКР будет
[
    {
        login : 'pkmernov@edu.hse.ru',
        password : bcrypt.hashSync('12121212', 10),
    },
    {
        login : 'kpashigorev@hse.ru',
        password : bcrypt.hashSync('06010601', 10),
    },
]

type LoginRequest = {
    body : {
        login ?: string,
        password ?: string
    }
}

// POST /api/login
const login = async (req : LoginRequest, res : any) => {
  

  const {
    login,
    password
  } = req.body

  logger.info('POST /api/login ' + (login ?? ''))

  if (!login || !password) {
    const error = 'Login and password are required'

    logger.error(error)
    return res.status(400).json({ error });
  }

  
  const match = accounts.find(acc => {


    return ( login == acc.login && bcrypt.compareSync(password, acc.password) )
  } );

  if (!match) {
    const error = 'Invalid credentials'

    logger.error(error)
    return res.status(401).json({ error });
  }

  const accessToken = jwt.sign({ login }, JWT_SECRET, { expiresIn: '1h' });
  const refreshToken = jwt.sign({ login }, JWT_SECRET, { expiresIn: '7d' });

  // Сохраняем refreshToken в Cookie с TTL равным 7 дням

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: false, // process.env.NODE_ENV === 'production', // для https в проде
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 дней
  });

  logger.info('Login successful. Login:' + login)
  res.json({ accessToken });
}

/*
// POST /api/refresh
const refresh = async (req: any, res: any) => {
  const { refreshToken } = req.cookies;

  logger.info('POST /api/refresh. ')

  
  if (!refreshToken) {
    const error = 'Refresh Token Required'

    logger.error(error)

    return res.status(400).json({ error });
  } 
    

  try {
    const payload = verifyRefreshToken(refreshToken);

    // Создаем новый access токен
    const newAccessToken = jwt.sign({ login: payload.login }, JWT_SECRET, { expiresIn: '1h' });
    
    logger.info('Refresh OK. ')
    res.json({ accessToken: newAccessToken });
  } catch (err) {
    const error = (err as Error).message
    logger.error(error)

    res.status(403).json({ error });
  }
};

// POST /api/logout
const logout = async (req: any, res: any) => {
  const { refreshToken } = req.cookies;

  logger.info('POST /api/logout. ')

  if (!refreshToken) { 
    const error = 'No Refresh Token'

    logger.error(error)

    return res.status(400).json({ error }); 
  }

  try {
  
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: false, // process.env.NODE_ENV === 'production',
    sameSite: 'lax' // 'strict'
  });
    

  res.sendStatus(204);
} catch (err) {
  const error = (err as Error).message

  logger.error(error)

  res.status(403).json({ error });
}
};
*/


export default {
    login,
    // refresh, 
    // logout
}
