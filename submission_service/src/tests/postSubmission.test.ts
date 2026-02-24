
jest.mock('uuid', () => ({
  v4: jest.fn(),
  validate: jest.fn()
}));

jest.mock('../sql/createSubmission', () => ({
  createSubmission: jest.fn()
}));

jest.mock('../logger/logger', () => ({
  info: jest.fn(),
  error: jest.fn()
}));

import { v4 as uuidv4 } from 'uuid';
import { createSubmission } from '../sql/createSubmission';
import { PostSubmissionHandler } from '../controllers/submissionController';

const mockReq = (body : any) => ({ body });
const mockRes = () => {
  const res : any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('POST /api/submission', () => {

    test('возвращает 400 если text пустой', async () => {

        const req = mockReq({
            task_id: 'uuid1',
            student_id: 'uuid2',
            text: '   '
        });
        const res = mockRes();

        await PostSubmissionHandler(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Invalid input data' });
    });


    test('возвращает 400 если verdict некорректный', async () => {

        const req = mockReq({
            task_id: 'uuid1',
            student_id: 'uuid2',
            text: 'answer',
            verdict: 'BAD'
        });
        const res = mockRes();

        await PostSubmissionHandler(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Invalid verdict value: BAD' });
    });

    
    test('создаёт submission и возвращает 201', async () => {
        (uuidv4 as jest.Mock).mockReturnValue('new-submission-id');

        const req = mockReq({
            task_id: 'uuid1',
            student_id: 'uuid2',
            text: 'hello world',
            verdict: 'OK'
        });
        const res = mockRes();

        await PostSubmissionHandler(req, res);

        expect(createSubmission).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(201);

        const sent = res.json.mock.calls[0][0];
        expect(sent.task_id).toBe('uuid1');
        expect(sent.student_id).toBe('uuid2');
        expect(sent.verdict).toBe('OK');
        expect(sent.text).toBe('hello world');
        expect(sent.submission_id).toBe('new-submission-id');
    });

    
    test('валидно если verdict не передан', async () => {
        (uuidv4 as jest.Mock).mockReturnValue('id123');
        // createSubmission.mockResolvedValue();

        const req = mockReq({
            task_id: 'uuid1',
            student_id: 'uuid2',
            text: 'solution'
        });
        const res = mockRes();

        await PostSubmissionHandler(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        const result = res.json.mock.calls[0][0];
        expect(result.verdict).toBeUndefined();
    });


})