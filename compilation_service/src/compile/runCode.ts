import { _dirname } from "../app";
import logger from "../logger/logger";
import { type Response } from "../types";

export async function runCode(
  res: Response,
  code: string,
  input?: string,
  filename?: string,
  timeout: number = 10000
) {

  if (filename && !input) {
    const error = "Нет входных данных для имени файла в теле запроса";
    logger.error(error);
    return res.status(400).json({ error });
  }

  try {

    const SANDBOX_URL =
      process.env.SANDBOX_URL || "http://localhost:3006";

    const response = await fetch(`${SANDBOX_URL}/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        input,
        filename,
        timeout
      })
    });

    const result = await response.json();
    return res.json(result);

  } catch (err) {
    const error = (err as Error).message;
    logger.error(error);

    res.status(500).json({ error });
  } finally {

  }
}