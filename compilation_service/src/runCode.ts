import { spawn } from "child_process";
import path from "path";
import * as fs from "fs/promises";
import { mkdtemp } from "fs";
import { _dirname } from "./app";
import logger from "./logger/logger";
import { type Response } from "./types";

export async function makeTempDir(dirname: string, suffix: string): Promise<string> {
  const tempDirName = path.join(dirname, suffix);

  return new Promise((resolve, reject) => {
    mkdtemp(tempDirName, (err, directory) => {
      if (err) return reject(err);
      resolve(directory);
    });
  });
}

export async function runCode(
  res: Response,
  code: string,
  input?: string,
  filename?: string,
  timeout: number = 5000
) {
  let tempDir = "";

    if ((filename) && !input) {
        const error = 'Нет входных данных для имени файла в теле запроса'

        logger.error(error)
        return res.status(400).json({ error });
    }

  try {
    // 1. создаём временную папку
    tempDir = await makeTempDir(_dirname, "temp-");

    // 2. создаём файл temp.s (на ХОСТЕ)
    const hostFilePath = path.join(tempDir, "temp.s");
    await fs.writeFile(hostFilePath, code, "utf-8");

    const containerWorkDir = "/work";

    /*
    // создаём input.txt
    let inputFile = "";
    if (typeof input !== "undefined") {
        inputFile = path.join(tempDir, filename || "input.txt");
        await fs.writeFile(inputFile, input + "\n");
    }

    const command =
    `docker run --rm ` +
    `-i ` +
    `--memory=64m ` +
    `--cpus=0.5 ` +
    '--network=none ' +
    `-v "${tempDir.replace(/\\/g, "/")}:${containerWorkDir}" ` +
    `-w ${containerWorkDir} ` +
    `rars nc temp.s`;

    const run = spawn(command, { shell: true, cwd : tempDir });

    if (input && run.stdin) {
     run.stdin.write(input + "\n");
    }
    if (run.stdin) {
        run.stdin.end();
    }

    let stdout = "";
    let stderr = "";

    // таймаут
    const timer = setTimeout(() => {
      run.kill("SIGKILL");
      stderr += "\nExecution timed out";
    }, timeout);

    // ждём завершения
    await new Promise<void>((resolve) => {
      run.stdout.on("data", (d) => (stdout += d.toString()));
      run.stderr.on("data", (d) => (stderr += d.toString()));

      run.on("close", () => resolve());
    });

    clearTimeout(timer);

    */

    const stdout = 'Compiled'
    const stderr = ''

    const output = stdout.trim()

    logger.info(`OUTPUT: ${output}`);
    logger.info(`STDERR: ${stderr}`);

    // удаляем временную папку
    await fs.rm(tempDir, { recursive: true, force: true });

    res.json({
      output,
      error: stderr.trim()
    });
  } catch (err) {
    const error = (err as Error).message;

    logger.error(error);

    if (tempDir) {
      await fs.rm(tempDir, { recursive: true, force: true });
    }

    res.status(500).json({ error });
  }
  finally {
    if (tempDir) {
      await fs.rm(tempDir, { recursive: true, force: true });
    }    
  }
}