import Docker from "dockerode";
import { runCode } from "../../runCode";

jest.mock("dockerode", () => {
  return jest.fn().mockImplementation(() => ({
    createContainer: jest.fn().mockResolvedValue({
      start: jest.fn().mockResolvedValue(undefined),
      attach: jest.fn().mockResolvedValue({
        on: (event: string, cb: any) => {
          if (event === "data") {
            cb(Buffer.from("Hello world\n"));
          }
        },
        write: jest.fn()
      }),
      wait: jest.fn().mockResolvedValue({ StatusCode: 0 }),
      kill: jest.fn().mockResolvedValue(undefined)
    })
  }));
});

describe("runCode", () => {
  let res: any;

  beforeEach(() => {
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
  });

  test("возвращает 400 если передан inputFilename без input", async () => {
    await runCode(res, "addi...", undefined, "input.txt");
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("успешное выполнение", async () => {
    await runCode(res, "code", "input");

    expect(res.json).toHaveBeenCalledWith({
      output: "Hello world",
      error: ""
    });
  });
});