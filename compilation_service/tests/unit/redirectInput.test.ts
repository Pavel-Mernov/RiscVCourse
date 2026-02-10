
import { redirectInput } from '../../src/app.ts';
import fs from 'fs/promises';

test('redirectInput записывает данные в файл', async () => {
  const filename = './test_input.txt';
  await redirectInput(filename, 'hello');
  const data = await fs.readFile(filename, 'utf8');
  expect(data).toBe('hello');
  await fs.rm(filename);
});
