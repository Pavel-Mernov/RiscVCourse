import request from 'supertest';
import { app } from '../../app';

describe('E2E: compile RISC-V code in Docker', () => {
  let server: any;

  beforeAll(() => {
    server = app.listen(4000);
  });

  afterAll(() => {
    server.close();
  });

  it('должно прочитать число и вывести удвоенное', async () => {
    const code = `
        .data
        prompt: .asciz ""

        .text
        .globl main
    main:
        li a7, 4
        la a0, prompt
        ecall
        li a7, 5
        ecall
        slli a0, a0, 1
        li a7, 1
        ecall
        li a7, 10
        ecall
    `;

    const res = await request(app)
      .post('/api/compile')
      .send({
        code,
        input: "7",       // вводим число 7
        timeout: "5000"
      })
      .timeout(10000);   // т.к. реально запускаем Docker

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('output');

    // удвоенное число 7 * 2 = 14
    expect(res.body.output.trim()).toBe("14");
  });
});