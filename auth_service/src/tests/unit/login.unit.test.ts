import controller from '../../controllers/controller';
import axios from 'axios';

const { login } = controller;

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn();
  return res;
};

describe('login (unit)', () => {

  it('should return 400 if login is empty', async () => {
    const req: any = { body: { login: '', password: '123' } };
    const res = mockResponse();

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should return 400 if password is empty', async () => {
    const req: any = { body: { login: 'user', password: '' } };
    const res = mockResponse();

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should return accessToken on success', async () => {
    mockedAxios.post.mockResolvedValue({
      data: {
        access_token: 'access',
        refresh_token: 'refresh'
      }
    });

    const req: any = { body: { login: 'user', password: '123' } };
    const res = mockResponse();

    await login(req, res);

    expect(res.cookie).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ accessToken: 'access' });
  });

  it('should return 401 on axios error', async () => {
    mockedAxios.post.mockRejectedValue(new Error());

    const req: any = { body: { login: 'user', password: '123' } };
    const res = mockResponse();

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });
});