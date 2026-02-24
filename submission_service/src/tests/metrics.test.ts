import { jest } from '@jest/globals';

const incMock = jest.fn();

jest.mock('prom-client', () => ({
  Counter: jest.fn(() => ({ inc: incMock })),
  register: {
    contentType: 'text/plain',
    metrics: (jest.fn() as MockedFunction<(arg ?: any) => any>).mockResolvedValue('metric-data'),
  },
}));

import promClient from 'prom-client';
import { getMetrics, metricsMiddleware } from '../controllers/metrics';
import type { MockedFunction } from 'jest-mock';

describe('requestCounterFunction', () => {
  let res : any;
  let next : any;

  beforeEach(() => {
    jest.clearAllMocks();

    next = jest.fn();

    res = {
      statusCode: 200,
      on: jest.fn((event, handler) => {
        if (event === 'finish') res._finish = handler;
      }),
    };
  });

  test('использует req.route.path если он есть', () => {
    const req = {
      method: 'GET',
      route: { path: '/metrics' },
      path: '/ignored',
    };

    metricsMiddleware(req, res, next);
    res._finish();

    expect(incMock).toHaveBeenCalledWith({
      method: 'GET',
      route: '/metrics',
      status_code: 200,
    });
  });

  test('использует req.path если req.route нет', () => {
    const req = {
      method: 'POST',
      path: '/plain-path',
      route: undefined,
    };

    metricsMiddleware(req, res, next);
    res._finish();

    expect(incMock).toHaveBeenCalledWith({
      method: 'POST',
      route: '/plain-path',
      status_code: 200,
    });
  });
});

describe('getMetrics', () => {
  test('возвращает metrics и выставляет заголовок', async () => {
    const res = {
      set: jest.fn(),
      end: jest.fn(),
    };

    await getMetrics({}, res);

    expect(res.set).toHaveBeenCalledWith('Content-Type', 'text/plain');
    expect(res.end).toHaveBeenCalledWith('metric-data');
  });
});