
import { makeTempDir } from '../../src/app.ts';
import fs from 'fs';




test('makeTempDir создаёт временную директорию', async () => {
  const dir = await makeTempDir(process.cwd(), 'temp-test-');
  expect(fs.existsSync(dir)).toBe(true);
  fs.rmdirSync(dir, { recursive: true });
});
