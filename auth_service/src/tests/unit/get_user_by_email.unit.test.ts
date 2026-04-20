import userController from "../../controllers/userController";
import axios from "axios";

const { getUserByEmail } = userController;

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("getUserByEmail (unit)", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("should return 401 if authorization header is missing", async () => {
    const req: any = {
      params: { email: "student@edu.hse.ru" },
      headers: {},
    };
    const res = mockResponse();

    await getUserByEmail(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Authorization header is required" });
  });

  it("should return user by email", async () => {
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

    const req: any = {
      params: { email: "student@edu.hse.ru" },
      headers: { authorization: "Bearer token" },
    };
    const res = mockResponse();

    await getUserByEmail(req, res, jest.fn());

    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.stringContaining("/admin/realms/"),
      expect.objectContaining({
        headers: {
          Authorization: "Bearer service-token",
        },
        params: {
          email: "student@edu.hse.ru",
        },
      })
    );
    expect(res.json).toHaveBeenCalledWith({
      id: "1",
      email: "student@edu.hse.ru",
      username: "student",
    });
  });

  it("should return 404 if user is not found", async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        access_token: "service-token",
      },
    });

    mockedAxios.get.mockResolvedValueOnce({
      data: [],
    });

    const req: any = {
      params: { email: "missing@edu.hse.ru" },
      headers: { authorization: "Bearer token" },
    };
    const res = mockResponse();

    await getUserByEmail(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "User not found" });
  });

  it("should return 500 if keycloak request fails", async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        access_token: "service-token",
      },
    });

    mockedAxios.get.mockRejectedValueOnce(new Error("boom"));

    const req: any = {
      params: { email: "student@edu.hse.ru" },
      headers: { authorization: "Bearer token" },
    };
    const res = mockResponse();

    await getUserByEmail(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: "Failed to load user from Keycloak",
      })
    );
  });
});
