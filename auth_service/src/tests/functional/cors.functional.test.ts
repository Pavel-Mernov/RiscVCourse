import request from 'supertest';
import axios from 'axios';
import app from '../../app';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('auth CORS (functional)', () => {
  beforeEach(() => {
    mockedAxios.post.mockReset();
  });

  it('should allow preflight for content-type from localhost frontend', async () => {
    const res = await request(app)
      .options('/api/login')
      .set('Origin', 'http://localhost:5173')
      .set('Access-Control-Request-Method', 'POST')
      .set('Access-Control-Request-Headers', 'content-type');

    expect(res.status).toBe(204);
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5173');
    expect(res.headers['access-control-allow-headers']).toContain('Content-Type');
    expect(res.headers['access-control-allow-credentials']).toBe('true');
  });

  it('should accept form-urlencoded login requests', async () => {
    mockedAxios.post.mockResolvedValue({
      data: {
        access_token: 'access',
        refresh_token: 'refresh'
      }
    });

    const res = await request(app)
      .post('/api/login')
      .type('form')
      .send({
        login: 'user',
        password: '123'
      });

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBe('access');
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('should mark refresh cookie as secure for https requests behind proxy', async () => {
    mockedAxios.post.mockResolvedValue({
      data: {
        access_token: 'access',
        refresh_token: 'refresh'
      }
    });

    const res = await request(app)
      .post('/api/login')
      .set('X-Forwarded-Proto', 'https')
      .type('form')
      .send({
        login: 'user',
        password: '123'
      });

    expect(res.status).toBe(200);
    expect((res.headers['set-cookie']!)[0]).toContain('Secure');
    expect((res.headers['set-cookie']!)[0]).toContain('SameSite=None');
  });
});
