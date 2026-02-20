import request from 'supertest';
import { app } from '../../app';          // где объявлен ваш app
import client from 'prom-client';

describe('GET /metrics', () => {
  it('should return prometheus metrics', async () => {
    const res = await request(app).get('/metrics');

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toBe(client.register.contentType);
    expect(res.text).toContain('#'); // простой признак текстового формата метрик
    expect(res.text.length).toBeGreaterThan(0);
  });
});