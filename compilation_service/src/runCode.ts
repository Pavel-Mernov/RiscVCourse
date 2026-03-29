import path from "path";
import * as fs from "fs/promises";
import { mkdtemp } from "fs";
import { _dirname } from "./app";
import logger from "./logger/logger";
import { type Response } from "./types";
import Docker from "dockerode";
import os from "os";

const docker = new Docker({ socketPath: "/var/run/docker.sock" });

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

  if (filename && !input) {
    const error = "Нет входных данных для имени файла в теле запроса";
    logger.error(error);
    return res.status(400).json({ error });
  }

  try {
    // 1. temp dir
    tempDir = await makeTempDir(_dirname, "temp-");

    // 2. write assembly file
    const hostFilePath = path.join(tempDir, "temp.s");
    await fs.writeFile(hostFilePath, code, "utf-8");

    // 3. optional input
    if (typeof input !== "undefined") {
      const inputPath = path.join(tempDir, filename || "input.txt");
      await fs.writeFile(inputPath, input + "\n");
    }

    const containerWorkDir = "/work";

    // 4. create container
    const container = await docker.createContainer({
      Image: "rars-image",
      Cmd: ["nc", "temp.s"],
      Tty: false,
      AttachStdout: true,
      AttachStderr: true,
      OpenStdin: true,
      StdinOnce: true,
      WorkingDir: containerWorkDir,
      HostConfig: {
        Binds: [`${tempDir}:${containerWorkDir}`],
        Memory: 64 * 1024 * 1024, // 64MB
        CpuShares: 512,
        NetworkMode: "none",
        AutoRemove: true
      }
    });

    // 5. start container
    await container.start();

    // 6. attach streams
    const stream = await container.attach({
      stream: true,
      stdin: true,
      stdout: true,
      stderr: true
    });

    let stdout = "";
    let stderr = "";

    stream.on("data", (chunk: Buffer) => {
      stdout += chunk.toString();
    });

    stream.on("error", (err) => {
      stderr += err.message;
    });

    // 7. send input if exists
    if (input) {
      stream.write(input + "\n");
    }

    // 8. timeout handling
    const timer = setTimeout(async () => {
      try {
        await container.kill();
        stderr += "\nExecution timed out";
      } catch {}
    }, timeout);

    // 9. wait for container to finish
    await container.wait();

    clearTimeout(timer);

    const output = stdout.trim();

    logger.info(`OUTPUT: ${output}`);
    logger.info(`STDERR: ${stderr}`);

    // 10. cleanup temp dir
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
  } finally {
    if (tempDir) {
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  }
}