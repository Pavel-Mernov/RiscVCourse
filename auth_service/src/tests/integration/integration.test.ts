import request from 'supertest';
import { createApp } from '../app';
import { jwtDecode, type JwtPayload } from 'jwt-decode';

interface UserPayload {
  preferred_username ?: string
  email ?: string
}

const app = createApp();



describe('auth (integration)', () => {

  it('should login real user', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({
        login: 'pkmernov@edu.hse.ru',
        password: '12121212'
      });

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('decoded jwt should contain username', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({
        login: 'pkmernov@edu.hse.ru',
        password: '12121212'
      });

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    expect(res.headers['set-cookie']).toBeDefined();

    const decoded = jwtDecode(res.body.accessToken) as JwtPayload & UserPayload

    console.log(JSON.stringify(decoded))

    expect(decoded.preferred_username).toBe('pkmernov@edu.hse.ru')

    expect(decoded.email).toBe('pkmernov@edu.hse.ru')
  });  
  
  it('should refresh token', async () => {
    const loginRes = await request(app)
      .post('/api/login')
      .send({
        login: 'pkmernov@edu.hse.ru',
        password: '12121212'
      });

    const cookies = loginRes.headers['set-cookie'];

    const res = await request(app)
      .post('/api/refresh')
      .set('Cookie', cookies!);

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
  });


  it('should logout', async () => {
    const loginRes = await request(app)
      .post('/api/login')
      .send({
        login: 'pkmernov@edu.hse.ru',
        password: '12121212'
      });

    const cookies = loginRes.headers['set-cookie'];

    const res = await request(app)
      .post('/api/logout')
      .set('Cookie', cookies!);

    expect(res.status).toBe(204);
  });

  it('should return only HSE students from /students', async () => {
    const loginRes = await request(app)
      .post('/api/login')
      .send({
        login: 'pkmernov@edu.hse.ru',
        password: '12121212'
      });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.accessToken).toBeDefined();

    const res = await request(app)
      .get('/api/students')
      .set('Authorization', `Bearer ${loginRes.body.accessToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);

    for (const user of res.body) {
      expect(typeof user.email).toBe('string');
      expect(user.email.toLowerCase().endsWith('@edu.hse.ru')).toBe(true);
    }
  });
});
