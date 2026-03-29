import { spawn } from "child_process";

export function runProcess(
  dir: string,
  input?: string,
  timeout: number = 10000
): Promise<{ output: string; error: string }> {

  return new Promise((resolve) => {
    const jarPath = "/app/rars1_6.jar";

    const proc = spawn("java", ["-jar", jarPath, "nc", "prog.s"], {
      cwd: dir
    });

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", d => stdout += d.toString());
    proc.stderr.on("data", d => stderr += d.toString());

    if (input) {
      proc.stdin.write(input + "\n");
      proc.stdin.end();
    }

    const timer = setTimeout(() => {
      proc.kill("SIGKILL");
      stderr += "TIMEOUT";
    }, timeout);

    proc.on("close", () => {
      clearTimeout(timer);

      resolve({
        output: stdout.trim(),
        error: stderr.trim()
      });
    });
  });
}