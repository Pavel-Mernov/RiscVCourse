import request from "supertest";
import { app } from "../../app";

describe("E2E: compilation-service → rars-sandbox", () => {
  let server: any;

  beforeAll(() => {
    server = app.listen(4000);
    process.env.SANDBOX_URL = "http://localhost:3006";
  });

  afterAll(() => {
    server.close();
  });

  it("должно вернуть 14", async () => {
    const code = `
      .data
      prompt: .asciz ""

      .text
      .globl main
    main:
      li a7, 5
      ecall
      slli a0, a0, 1
      li a7, 1
      ecall
      li a7, 10
      ecall
    `;

    const res = await request(app)
      .post("/api/compile")
      .send({
        code,
        input: "7",
        timeout: 5000
      });

    expect(res.status).toBe(200);
    expect(res.body.output.trim()).toBe("14");
  });
});