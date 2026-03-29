import express from "express";
import { spawn } from "child_process";
import fs from "fs/promises";
import path from "path";
import { runProcess } from "./runProcess";

const app = express();
app.use(express.json());



app.post("/run", async (req, res) => {
  const { code, input, filename, timeout = 10000 } = req.body;

  if (!code) {
    return res.status(400).json({ error: "Нет кода в теле запроса" });
  }

  if (filename && !input) {
    return res.status(400).json({ error: "Нет входных данных для имени файла" });
  }

  let dir = "";

  try {
    dir = await fs.mkdtemp("/tmp/rars-");
    const file = path.join(dir, "prog.s");

    await fs.writeFile(file, code);

    const result = await runProcess(dir, input, timeout);

    // console.log(`Result received. output: ${result.output}. error: ${result.error}`)

    await fs.rm(dir, { recursive: true, force: true });

    return res.json(result);

  } catch (err: any) {
    if (dir) {
      await fs.rm(dir, { recursive: true, force: true });
    }

    return res.status(500).json({ error: err.message });
  }
});

export default app