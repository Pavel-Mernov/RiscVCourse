
import request from 'supertest';
import { app } from '../../app';

// afterAll(() => {
//  server.close();
// });

let server : any;

beforeAll(() => {
  server = app.listen(3001);
});

afterAll(() => {
  server.close();
});

describe('POST /compile', () => {
    test('должно вернуть 200 при корректных данных', async () => {
        const res = await request(app)
            .post('/api/compile')
            .send({
                code: `
                    .data
                    .text
                    main:
                      li a0, 5
                      li a7, 1
                      ecall
                `,
                input: "",
                filename: "",
                timeout: "3000"
            })

        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty('output')
    })

    test('должно вернуть 200 при корректных данных и при данных в файле', async () => {
        const res = await request(app)
            .post('/api/compile')
            .send({
                code: `
                    .data
                    .text
                    main:
                      li a0, 5
                      li a7, 1
                      ecall
                `,
                input: "hello",
                filename: "in.txt",
                timeout: "3000"
            })

        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty('output')
    })

    test('должно вернуть 400 если есть inputFilename но нет input', async () => {
        const res = await request(app)
            .post('/api/compile')
            .send({
                code: "main: li a0, 1",
                filename: "in.txt"
            })

        expect(res.status).toBe(400)
        expect(res.body.error).toBe('Нет входных данных для имени файла в теле запроса')
    })

    test('должно вернуть 400 если нет кода в теле запроса', async () => {
        const res = await request(app)
            .post('/api/compile')
            .send({})

        expect(res.status).toBe(400)
        expect(res.body.error).toBe('Нет кода в теле запроса')
    })

    test('должно вернуть 400 при некорректном timeout в теле запроса', async () => {
        const res = await request(app)
            .post('/api/compile')
            .send({ code : 'no code', timeout : '22no444' })

        expect(res.status).toBe(400)
        expect(res.body.error).toBe('Значение timeout не является целым неотрицательным числом')
    })

    test('должно вернуть 200 при ошибке выполнения RARS', async () => {
        const res = await request(app)
            .post('/api/compile')
            .send({
                code: "this is not RISC-V code",
                
            })

        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty('error')
    })

    test('должно вернуть 200 при ошибке выполнения RARS с входными данными', async () => {
        const res = await request(app)
            .post('/api/compile')
            .send({
                code: "this is not RISC-V code",
                input: "hi"
            })

        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty('error')
    })
});
