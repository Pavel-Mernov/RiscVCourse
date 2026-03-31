import request from 'supertest';
import axios from 'axios';
import { createApp } from '../app';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const app = createApp();

describe('auth (functional)', () => {

  it('POST /login success', async () => {
    mockedAxios.post.mockResolvedValue({
      data: {
        access_token: 'access',
        refresh_token: 'refresh'
      }
    });

    const res = await request(app)
      .post('/api/login')
      .send({ login: 'user', password: '123' });

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBe('access');
  });

  
  it('POST /refresh without cookie', async () => {
    const res = await request(app)
      .post('/api/refresh');

    expect(res.status).toBe(401);
  });

  it('POST /logout always returns 204', async () => {
    const res = await request(app)
      .post('/api/logout');

    expect(res.status).toBe(204);
  });

});