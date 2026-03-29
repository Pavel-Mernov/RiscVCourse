import { runCode } from "../../compile/runCode";

describe("runCode (unit)", () => {
  let res: any;

  beforeEach(() => {
    jest.spyOn(global, "fetch").mockImplementation(jest.fn());

    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("400 если filename без input", async () => {
    await runCode(res, "code", undefined, "input.txt");

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("успешный ответ от sandbox", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      json: async () => ({
        output: "14",
        error: ""
      })
    });

    await runCode(res, "code", "7");

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3006/run",
      expect.objectContaining({
        method: "POST"
      })
    );

    expect(res.json).toHaveBeenCalledWith({
      output: "14",
      error: ""
    });
  });

  test("ошибка sandbox", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(
      new Error("sandbox down")
    );

    await runCode(res, "code", "7");

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "sandbox down"
    });
  });
});