import request from "supertest";
import axios from "axios";
import { createApp } from "../app";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

const app = createApp();

describe("getStudents (functional)", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("GET /students returns 401 without authorization header", async () => {
    const res = await request(app).get("/api/students");

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "Authorization header is required" });
  });

  it("GET /students returns only students with @edu.hse.ru email", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: [
        { id: "1", email: "student1@edu.hse.ru" },
        { id: "2", email: "teacher@hse.ru" },
      ],
    });

    const res = await request(app)
      .get("/api/students")
      .set("Authorization", "Bearer token");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id: "1", email: "student1@edu.hse.ru" }]);
  });
});
