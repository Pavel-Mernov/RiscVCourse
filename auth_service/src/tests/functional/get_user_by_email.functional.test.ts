import request from "supertest";
import axios from "axios";
import { createApp } from "../app";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

const app = createApp();

describe("getUserByEmail (functional)", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("GET /users/:email returns 401 without authorization header", async () => {
    const res = await request(app).get("/api/users/student%40edu.hse.ru");

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "Authorization header is required" });
  });

  it("GET /users/:email returns user by email", async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        access_token: "service-token",
      },
    });

    mockedAxios.get.mockResolvedValueOnce({
      data: [
        { id: "1", email: "student@edu.hse.ru", username: "student" },
      ],
    });

    const res = await request(app)
      .get("/api/users/student%40edu.hse.ru")
      .set("Authorization", "Bearer token");

    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      id: "1",
      email: "student@edu.hse.ru",
      username: "student",
    });
  });

  it("GET /users/:email returns 404 when user is not found", async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        access_token: "service-token",
      },
    });

    mockedAxios.get.mockResolvedValueOnce({
      data: [],
    });

    const res = await request(app)
      .get("/api/users/missing%40edu.hse.ru")
      .set("Authorization", "Bearer token");

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "User not found" });
  });

  it("GET /users/:email returns 500 when keycloak request fails", async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        access_token: "service-token",
      },
    });

    mockedAxios.get.mockRejectedValueOnce(new Error("boom"));

    const res = await request(app)
      .get("/api/users/student%40edu.hse.ru")
      .set("Authorization", "Bearer token");

    expect(res.status).toBe(500);
    expect(res.body).toEqual(
      expect.objectContaining({
        error: "Failed to load user from Keycloak",
      })
    );
  });
});
