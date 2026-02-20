
import { runCode } from '../../app';
import fs from 'fs/promises';
import { exec as execOriginal } from 'child_process';

jest.mock('child_process', () => ({
  exec: jest.fn((cmd, opts, cb) => cb(null, 'RESULT', ''))
}));

jest.mock('fs/promises');

describe('runCode', () => {
  let res: any;

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  test('возвращает 400 если передан inputFilename без input', async () => {
    await runCode(res, 'addi...', undefined, 'input.txt');
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('успешное выполнение', async () => {
    (fs.writeFile as any).mockResolvedValue(undefined);
    (fs.rm as any).mockResolvedValue(undefined);

    await runCode(res, 'addi $v0,$0,1', 'test');

    expect(res.json).toHaveBeenCalledWith({ output: 'RESULT', error: '' });
  });

  test('ошибка exec вызывает 500', async () => {
    const mockExec = require('child_process').exec;
    mockExec.mockImplementation((cmd: any, opts: any, cb: any) =>
      cb(new Error('fail'), '', '')
    );

    await runCode(res, 'addi...', 'input');

    expect(res.status).toHaveBeenCalledWith(500);
  });

  /*
    test('возвращает 500 при ошибке внутри runCode', async () => {
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        // Мокаем зависимость — чтобы код упал в catch
        jest.spyOn(null, 'runCode').mockImplementation(() => {
            throw new Error('boom');
        });

        await runCode(res, 'code');

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'boom' });
    });
    */
});
