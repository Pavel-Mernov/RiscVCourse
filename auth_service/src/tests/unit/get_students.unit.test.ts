import userController from "../../controllers/userController";
import axios from "axios";

const { getStudents } = userController;

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("getStudents (unit)", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("should return 401 if authorization header is missing", async () => {
    const req: any = { headers: {} };
    const res = mockResponse();

    await getStudents(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Authorization header is required" });
  });

  it("should return only users with @edu.hse.ru email", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: [
        { id: "1", email: "student1@edu.hse.ru" },
        { id: "2", email: "teacher@hse.ru" },
        { id: "3", email: "student2@edu.hse.ru" },
      ],
    });

    const req: any = { headers: { authorization: "Bearer token" } };
    const res = mockResponse();

    await getStudents(req, res, jest.fn());

    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith([
      { id: "1", email: "student1@edu.hse.ru" },
      { id: "3", email: "student2@edu.hse.ru" },
    ]);
  });

  it("should return 500 if keycloak request fails", async () => {
    mockedAxios.get.mockRejectedValue(new Error("boom"));

    const req: any = { headers: { authorization: "Bearer token" } };
    const res = mockResponse();

    await getStudents(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: "Failed to load students from Keycloak",
      })
    );
  });
});
