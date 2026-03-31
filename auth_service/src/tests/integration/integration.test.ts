import request from 'supertest';
import { createApp } from '../app';

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
});