
import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT || 3005
const CLIENT_SECRET = process.env.CLIENT_SECRET;

const app = express();
app.use(express.json());

// ---- НАСТРОЙКИ KEYCLOAK ----
const KEYCLOAK_URL = 'https://your-keycloak/auth/realms/myrealm/protocol/openid-connect/token';
const CLIENT_ID = 'riscvcourse_auth_service';          

// Если client public — CLIENT_SECRET не нужен

// ---- /login ----
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password)
        return res.status(400).json({ error: 'username and password required' });

    try {
        const params = new URLSearchParams();
        params.append('grant_type', 'password');
        params.append('client_id', CLIENT_ID);
        params.append('username', username);
        params.append('password', password);

        if (CLIENT_SECRET)
            params.append('client_secret', CLIENT_SECRET);

        const response = await axios.post(KEYCLOAK_URL, params);

        return res.json({
            accessToken: response.data.access_token,
            refreshToken: response.data.refresh_token,
            expiresIn: response.data.expires_in
        });
    } catch (err) {
        return res.status(401).json({ error: 'invalid credentials' });
    }
});

// ---- /refresh ----
app.post('/api/refresh', async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken)
        return res.status(400).json({ error: 'refreshToken required' });

    try {
        const params = new URLSearchParams();
        params.append('grant_type', 'refresh_token');
        params.append('client_id', CLIENT_ID);
        params.append('refresh_token', refreshToken);

        if (CLIENT_SECRET)
            params.append('client_secret', CLIENT_SECRET);

        const response = await axios.post(KEYCLOAK_URL, params);

        return res.json({
            accessToken: response.data.access_token,
            refreshToken: response.data.refresh_token,
            expiresIn: response.data.expires_in
        });
    } catch (err) {
        return res.status(401).json({ error: 'invalid refresh token' });
    }
});

// ---- Запуск ----



app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});

