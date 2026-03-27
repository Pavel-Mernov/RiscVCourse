
import { runCode } from '../../runCode';
import fs from 'fs/promises';
import { exec as execOriginal, spawn } from 'child_process';
import EventEmitter from 'events';

jest.mock('child_process', () => ({
  exec: jest.fn((cmd, opts, cb) => cb(null, 'RESULT', '')),
  spawn: jest.fn()
}));

jest.mock('fs/promises');

function createMockProcess(stdoutData: string, stderrData = "", code = 0) {
  const process = new EventEmitter() as any;

  process.stdout = new EventEmitter();
  process.stderr = new EventEmitter();

  process.kill = jest.fn();

  // эмулируем асинхронное выполнение
  setTimeout(() => {
    process.stdout.emit("data", stdoutData);
    process.stderr.emit("data", stderrData);
    process.emit("close", code);
  }, 10);

  return process;
}

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

    (spawn as jest.Mock).mockReturnValue(
      createMockProcess("Hello world\n")
    );

    await runCode(res, 'addi $v0,$0,1', 'test');

    expect(spawn).toHaveBeenCalled();

    expect(res.json).toHaveBeenCalledWith({
      output: "Hello world",
      error: ""
    });
    
  });

  test('ошибка exec вызывает 500', async () => {
    (spawn as jest.Mock).mockImplementation(() => {
      throw new Error("spawn failed");
    });

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
