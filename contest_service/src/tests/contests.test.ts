
import request from 'supertest'
import express from 'express'
import router from '../routes/contests'
import { getContests } from '../sql/scripts/contests/getContests'
import { createContest } from '../sql/scripts/contests/createContest'
import { updateContest } from '../sql/scripts/contests/updateContest'
import { deleteContest } from '../sql/scripts/contests/deleteContest'
import { authenticateTeacher } from '../routes/authenticate'

import { getTasks } from '../sql/scripts/tasks/getTasks'

import { getTests } from '../sql/scripts/tests/getTests'
import { deleteTask } from '../sql/scripts/tasks/deleteTask'
import { deleteTest } from '../sql/scripts/tests/deleteTest'
import { createTask } from '../sql/scripts/tasks/createTask'

import logger from '../logger/logger'

import { updateTask } from '../sql/scripts/tasks/updateTask'
import { createTest } from '../sql/scripts/tests/createTest'

jest.mock('../sql/scripts/contests/getContests')
jest.mock('../sql/scripts/contests/createContest')
jest.mock('../sql/scripts/contests/updateContest')
jest.mock('../sql/scripts/contests/deleteContest')

jest.mock('../sql/scripts/tasks/getTasks')
jest.mock('../sql/scripts/tasks/createTask')
jest.mock('../sql/scripts/tasks/updateTask')
jest.mock('../sql/scripts/tasks/deleteTask')

jest.mock('../sql/scripts/tests/getTests')
jest.mock('../sql/scripts/tests/updateTest')
jest.mock('../sql/scripts/tests/createTest')
jest.mock('../sql/scripts/tests/deleteTest')

jest.spyOn(logger, 'info').mockImplementation(undefined)
jest.spyOn(logger, 'error').mockImplementation(undefined)

jest.mock('../routes/authenticate', () => ({
  authenticateTeacher: (req : any, res : any, next : any) => next()
}))

const mockedGetContests = getContests as jest.MockedFunction<typeof getContests>
const mockedCreateContest = createContest as jest.MockedFunction<typeof createContest>
const mockedUpdateContest = updateContest as jest.MockedFunction<typeof updateContest>
const mockedDeleteContest = deleteContest as jest.MockedFunction<typeof deleteContest>

const mockedGetTasks = getTasks as jest.MockedFunction<typeof getTasks>
const mockedCreateTask = createTask as jest.MockedFunction<typeof createTask>
const mockedUpdateTask = updateTask as jest.MockedFunction<typeof updateTask>
const mockedDeleteTask = deleteTask as jest.MockedFunction<typeof deleteTask>

const mockedGetTests = getTests as jest.MockedFunction<typeof getTests>
const mockedCreateTest = createTest as jest.MockedFunction<typeof createTest>
const mockedDeleteTest = deleteTest as jest.MockedFunction<typeof deleteTest>



const app = express()
app.use(express.json())
app.use(router)

describe('Contest API', () => {
  
  // ------------------------------
  // GET /contests
  // ------------------------------
  test('GET /contests returns list of contests', async () => {

    

    mockedGetContests.mockResolvedValue([{ id: '1', title: 'Test' }])

    const res = await request(app).get('/contests')

    expect(res.status).toBe(200)
    expect(res.body).toEqual([{ id: '1', title: 'Test' }])
  })

  test('GET /contests handles server error', async () => {
    mockedGetContests.mockRejectedValue(new Error('DB error'))

    const res = await request(app).get('/contests')

    expect(res.status).toBe(500)
    expect(res.body.error).toBe('DB error')
  })

  // ------------------------------
  // POST /contests
  // ------------------------------
  test('POST /contests creates contest', async () => {
    mockedCreateContest.mockResolvedValue()

    const res = await request(app)
      .post('/contests')
      .send({ title: 'New Contest' })

    expect(res.status).toBe(201)
    expect(res.body.title).toBe('New Contest')
    expect(res.body.id).toBeDefined()
  })

  test('POST /contests rejects blank title', async () => {
    const res = await request(app)
      .post('/contests')
      .send({ title: '' })

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Contest title is required and cannot be blank')
  })

  test('POST /contests handles DB error', async () => {
    mockedCreateContest.mockRejectedValue(new Error('DB error'))

    const res = await request(app)
      .post('/contests')
      .send({ title: 'Valid Title' })

    expect(res.status).toBe(500)
    expect(res.body.error).toBe('DB error')
  })

  // ------------------------------
  // GET /contests/:id
  // ------------------------------
  test('GET /contests/:id returns a contest', async () => {
    mockedGetContests.mockResolvedValue([{ id: '123', title: 'Contest' }])

    const res = await request(app).get('/contests/123')

    expect(res.status).toBe(200)
    expect(res.body.title).toBe('Contest')
  })

  test('GET /contests/:id returns 404 if not found', async () => {
    mockedGetContests.mockResolvedValue([])

    const res = await request(app).get('/contests/999')

    expect(res.status).toBe(404)
    expect(res.body.error).toBe('Contest not found')
  })

  test('GET /contests/:id handles DB error', async () => {
    mockedGetContests.mockRejectedValue(new Error('DB error'))

    const res = await request(app).get('/contests/123')

    expect(res.status).toBe(500)
    expect(res.body.error).toBe('DB error')
  })

  // ------------------------------
  // PUT /contests/:id
  // ------------------------------
  test('PUT /contests/:id updates contest', async () => {
    mockedGetContests.mockResolvedValue([{ id: '1', title: 'Old' }])
    mockedUpdateContest.mockResolvedValue(undefined)

    const res = await request(app)
      .put('/contests/1')
      .send({ title: 'New Title' })

    expect(res.status).toBe(200)
    expect(res.body.title).toBe('New Title')
  })

  test('PUT /contests/:id returns 404 for nonexistent contest', async () => {
    mockedGetContests.mockResolvedValue([])

    const res = await request(app)
      .put('/contests/1')
      .send({ title: 'Anything' })

    expect(res.status).toBe(404)
    expect(res.body.error).toBe('Contest not found')
  })

  test('PUT /contests/:id handles DB error', async () => {
    mockedGetContests.mockResolvedValue([{ id: '1', title: 'Old' }])
    mockedUpdateContest.mockRejectedValue(new Error('DB error'))

    const res = await request(app)
      .put('/contests/1')
      .send({ title: 'New' })

    expect(res.status).toBe(500)
    expect(res.body.error).toBe('DB error')
  })

  test('DELETE contests/:id Возвращает 404 если контест не найден', async () => {
    mockedGetContests.mockResolvedValue([])
    
    const res = await request(app).delete('/contests/100')

    expect(res.status).toBe(404)
    expect(res.body).toEqual({ error: 'Contest not found' })
  })

describe('DELETE /contests/:contestId', () => {

  test('Возвращает 404 если контест не найден', async () => {
    mockedGetContests.mockResolvedValue([])

    const res = await request(app).delete('/contests/abc')

    expect(res.status).toBe(404)
    expect(res.body).toEqual({ error: 'Contest not found' })
  })

  test('Успешное удаление контеста вместе с задачами и тестами', async () => {
    mockedGetContests.mockResolvedValue([
      { id: '10', title: 'Contest' }
    ])

    mockedGetTasks.mockResolvedValue([
      {
        id: 't1', 
        contest_id: '10',
        name: '',
        text: '',
        answer_type: 'theory'
      },
      {
        id: 't2',
        contest_id: '10',
        name: '',
        text: '',
        answer_type: 'theory'
      },
      {
        id: 't3',
        contest_id: '999',
        name: '',
        text: '',
        answer_type: 'theory'
      } // не из этого контеста
    ])

    mockedGetTests.mockResolvedValue([
      {
        id: 'x1', 
        task_id: 't1',
        input: '',
        expected_output: ''
      },
      {
        id: 'x2', 
        task_id: 't2',
        input: '',
        expected_output: ''
      },
      {
        id: 'x3', 
        task_id: 'zzz',
        input: '',
        expected_output: ''
      }
    ])

    mockedDeleteTask.mockResolvedValue(undefined)
    mockedDeleteTest.mockResolvedValue(undefined)
    mockedDeleteContest.mockResolvedValue(undefined)

    const res = await request(app).delete('/contests/10')

    expect(res.status).toBe(204)

    expect(mockedDeleteTest).toHaveBeenCalledTimes(2)
    expect(mockedDeleteTest).toHaveBeenCalledWith('x1')
    expect(mockedDeleteTest).toHaveBeenCalledWith('x2')

    expect(mockedDeleteTask).toHaveBeenCalledTimes(2)
    expect(mockedDeleteTask).toHaveBeenCalledWith('t1')
    expect(mockedDeleteTask).toHaveBeenCalledWith('t2')

    expect(mockedDeleteContest).toHaveBeenCalledWith('10')
  })

  test('Возвращает 500 при ошибке удаления контеста', async () => {
    mockedGetContests.mockResolvedValue([{
      id: '10',
      title: ''
    }])

    mockedGetTasks.mockResolvedValue([])
    mockedGetTests.mockResolvedValue([])

    mockedDeleteContest.mockRejectedValue(new Error('DB failure'))

    const res = await request(app).delete('/contests/10')

    expect(res.status).toBe(500)
    expect(res.body).toEqual({ error: 'DB failure' })
  })
  })

  describe('GET contests/:id/tasks', () => {


  test('GET /contests/:contestId/tasks возвращает список задач контеста', async () => {
    mockedGetContests.mockResolvedValue([
      { id: '10', title: 'Contest 10' }
    ])

    const tasks = [
      {
        id: 't1', 
        contest_id: '10',
        name: '',
        text: '',
        answer_type: 'theory' as const
      },
      {
        id: 't2', contest_id: '10',
        name: '',
        text: '',
        answer_type: 'theory' as const
      },
      /*
      {
        id: 't3', contest_id: '20',
        name: '',
        text: '',
        answer_type: 'theory' as const
      }
        */
    ]

    mockedGetTasks.mockResolvedValue(tasks)

    const res = await request(app).get('/contests/10/tasks')

    expect(res.status).toBe(200)
    expect(res.body).toEqual(tasks)
  })

  test('GET /contests/:contestId/tasks возвращает 404 если контест не найден', async () => {
    mockedGetContests.mockResolvedValue([
      { id: '1', title: 'Other contest' }
    ])

    const res = await request(app).get('/contests/10/tasks')

    expect(res.status).toBe(404)
    expect(res.body.error).toBe('Contest not found')
  })

  test('GET /contests/:contestId/tasks возвращает 500 если getContests выбросил ошибку', async () => {
    mockedGetContests.mockRejectedValue(new Error('DB error in getContests'))

    const res = await request(app).get('/contests/10/tasks')

    expect(res.status).toBe(500)
    expect(res.body.error).toBe('DB error in getContests')
  })

  test('GET /contests/:contestId/tasks возвращает 500 если getTasks выбросил ошибку', async () => {
    mockedGetContests.mockResolvedValue([
      { id: '10', title: 'Contest 10' }
    ])

    mockedGetTasks.mockRejectedValue(new Error('DB error in getTasks'))

    const res = await request(app).get('/contests/10/tasks')

    expect(res.status).toBe(500)
    expect(res.body.error).toBe('DB error in getTasks')
  })


  })

describe('POST contests/:id/tasks', () => {

  test('Should create task successfully', async () => {
    mockedGetContests.mockResolvedValue([{
      id: '1',
      title: ''
    }])
    mockedCreateTask.mockResolvedValue()

    jest.mock('uuid', () => ({ v4: () => 'test123' }))

    const res = await request(app)
      .post('/contests/1/tasks')
      .send({
        name: 'Task A',
        text: 'Read this',
        answer_type: 'theory'
      })

    expect(res.status).toBe(201)

    expect(res.body.id).toBeDefined()

    const { id, ...rest } = res.body

    expect(rest).toEqual({
      contest_id: '1',
      name: 'Task A',
      text: 'Read this',
      answer_type: 'theory'
    })
  })


  test('should return 404 if contest does not exist', async () => {
    mockedGetContests.mockResolvedValue([])

    const res = await request(app)
      .post('/contests/1/tasks')
      .send({})

    expect(res.status).toBe(404)
    expect(res.body.error).toBe('Contest not found')
  })


  test('should return 400 when name is missing', async () => {
    mockedGetContests.mockResolvedValue([{
      id: '1',
      title: ''
    }])

    const res = await request(app)
      .post('/contests/1/tasks')
      .send({
        text: 'Some text',
        answer_type: 'code'
      })

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Task name cannot be empty')
  })


  test('should return 400 when name is empty string', async () => {
    mockedGetContests.mockResolvedValue([{
      id: '1',
      title: ''
    }])

    const res = await request(app)
      .post('/contests/1/tasks')
      .send({
        name: '   ',
        text: 'Some text',
        answer_type: 'code'
      })

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Task name cannot be empty')
  })


  test('should return 400 when text is missing', async () => {
    mockedGetContests.mockResolvedValue([{
      id: '1',
      title: ''
    }])

    const res = await request(app)
      .post('/contests/1/tasks')
      .send({
        name: 'Task',
        answer_type: 'code'
      })

    expect(res.status).toBe(400)
    expect(res.body.error)
      .toBe('Task text is required. Task text cannot be empty')
  })


  test('should return 400 when answer_type is missing', async () => {
    mockedGetContests.mockResolvedValue([{
      id: '1',
      title: ''
    }])

    const res = await request(app)
      .post('/contests/1/tasks')
    .send({
      name: 'Task',
      text: 'Text'
    })

    expect(res.status).toBe(400)
    expect(res.body.error)
      .toBe('Task answer type is required. Answer type should be equal to either: \'code\', \'theory\', \'text\', \'choice\' or \'multichoice\'')
  })


  test('should return 400 when answer_type is empty', async () => {
    mockedGetContests.mockResolvedValue([{
      id: '1',
      title: ''
    }])

    const res = await request(app)
      .post('/contests/1/tasks')
      .send({
        name: 'Task',
        text: 'Text',
        answer_type: '  '
      })

    expect(res.status).toBe(400)
  })


  test('should return 400 for invalid answer_type', async () => {
    mockedGetContests.mockResolvedValue([{
      id: '1',
      title: ''
    }])

    const res = await request(app)
      .post('/contests/1/tasks')
      .send({
        name: 'Task',
        text: 'Text',
        answer_type: 'wrong'
      })

    expect(res.status).toBe(400)
  })


  })

  describe('GET /tasks/:taskId', () => {

    
  beforeEach(() => {
    jest.clearAllMocks()
    console.log('Before test calls:', mockedGetTasks.mock.calls.length)
  })


    afterEach(() => {
      jest.clearAllMocks()
    })

    test('должен вернуть задачу по id', async () => {

    mockedGetContests.mockResolvedValue([{
      id: '1',
      title: ''
    }]) 

      const mockTasks = [
        { id: '1', contest_id : '1', name: 'A', text: 'T', answer_type: 'theory' as const },
        { id: '2', contest_id : '1', name: 'B', text: 'U', answer_type: 'choice' as const }
      ]
      
      mockedGetTasks.mockResolvedValue(mockTasks)

      const res = await request(app).get('/tasks/1')

      expect(res.status).toBe(200)
      expect(res.body).toEqual(mockTasks[0])

      
      console.log('After test calls:', mockedGetTasks.mock.calls.length)


      expect(mockedGetTasks).toHaveBeenCalledTimes(1)
      expect(logger.info).toHaveBeenCalled()
    })

    test('должен вернуть 404 если задачи нет', async () => {
      mockedGetTasks.mockResolvedValue([])

      const res = await request(app).get('/tasks/10')

      expect(res.status).toBe(404)
      expect(res.body).toEqual({ error: 'Task not found' })

      expect(logger.error).toHaveBeenCalled()
    })

    test('должен вернуть 404 при ошибке getTasks', async () => {
      mockedGetTasks.mockRejectedValue(new Error('DB error'))

      const res = await request(app).get('/tasks/5')

      expect(res.status).toBe(404)
      expect(res.body).toEqual({ error: 'DB error' })

      expect(logger.error).toHaveBeenCalled()
    })
  })

describe('PUT /tasks/:taskId', () => {

  beforeEach(() => {
    jest.clearAllMocks()
    console.log('Before test calls:', mockedGetTasks.mock.calls.length)
  })


  afterEach(() => {
    jest.clearAllMocks()
  })

  test('должен обновить задачу и вернуть 200', async () => {
    const existingTask = { id: '1', name: 'Old', contest_id: '1', text: '', answer_type: 'theory' as const }

    mockedGetTasks.mockResolvedValue([existingTask])
    mockedUpdateTask.mockResolvedValue()

    const newData = { name: 'New' }

    const res = await request(app)
      .put('/tasks/1')
      .send(newData)

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ ...existingTask, ...newData })

    expect(mockedGetTasks).toHaveBeenCalledTimes(1)
    expect(mockedUpdateTask).toHaveBeenCalledTimes(1)
    expect(logger.info).toHaveBeenCalled()
  })

  test('должен вернуть 404 если задача не найдена', async () => {
    mockedGetTasks.mockResolvedValue([])

    const res = await request(app)
      .put('/tasks/1')
      .send({ name: 'X' })

    expect(res.status).toBe(404)
    expect(res.body).toEqual({ error: 'Task not found' })

    expect(mockedUpdateTask).not.toHaveBeenCalled()
    expect(logger.error).toHaveBeenCalled()
  })

  test('должен вернуть 500 если updateTask бросает ошибку', async () => {
    const existingTask = { id: '1', name: 'Old', contest_id: '1', text: '', answer_type: 'theory' as const }
    
    mockedGetTasks.mockResolvedValue([existingTask])
    mockedUpdateTask.mockRejectedValue(new Error('Update failed'))

    const res = await request(app)
      .put('/tasks/1')
      .send({ name: 'B' })

    expect(res.status).toBe(500)
    expect(res.body).toEqual({ error: 'Update failed' })

    expect(mockedGetTasks).toHaveBeenCalledTimes(1)
    expect(mockedUpdateTask).toHaveBeenCalledTimes(1)
    expect(logger.error).toHaveBeenCalled()
  })
})

describe('DELETE /tasks/:taskId', () => {

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Удаляет задачу и возвращает 204', async () => {
    const tasks = [{ id: '1', name: 'A', text: '', contest_id : '1', answer_type : 'choice' as const }]

    const tests = [
        { 
          id : '1',
          task_id : '1',
          input : '',
          expected_output : 'hello world!'
         },
        { 
          id : '2',
          task_id : '1',
          input : 'some input',
          expected_output : 'nothing'
        },
    ]

    mockedGetTasks.mockResolvedValue(tasks)
    mockedDeleteTask.mockResolvedValue()

    mockedGetTests.mockResolvedValue(tests)
    mockedDeleteTest.mockResolvedValue()

    const res = await request(app)
      .delete('/tasks/1')

    expect(res.status).toBe(204)
    expect(res.text).toBe('')

    expect(mockedGetTasks).toHaveBeenCalledTimes(1)
    expect(mockedGetTasks).toHaveBeenCalledWith()

    expect(mockedDeleteTask).toHaveBeenCalledTimes(1)
    expect(mockedDeleteTask).toHaveBeenCalledWith('1')
    
    expect(mockedDeleteTest).toHaveBeenCalledTimes(2)
    expect(logger.info).toHaveBeenCalled()
  })

  test('Возвращает 404 если задача не найдена', async () => {
    mockedGetTasks.mockResolvedValue([])

    const res = await request(app)
      .delete('/tasks/1')

    expect(res.status).toBe(404)
    expect(res.body).toEqual({ error: 'Task not found' })

    expect(mockedDeleteTask).not.toHaveBeenCalled()
    expect(logger.error).toHaveBeenCalled()
  })

  test('Возвращает 500 если deleteTask выбрасывает ошибку', async () => {
    const tasks = [{ id: '1', name: 'A', text: '', contest_id : '1', answer_type : 'choice' as const }]
    mockedGetTasks.mockResolvedValue(tasks)
    mockedDeleteTask.mockRejectedValue(new Error('Deletion failed'))

    const res = await request(app)
      .delete('/tasks/1')

    expect(res.status).toBe(500)
    expect(res.body).toEqual({ error: 'Deletion failed' })

    expect(mockedGetTasks).toHaveBeenCalledTimes(1)
    expect(mockedDeleteTask).toHaveBeenCalledTimes(1)
    expect(logger.error).toHaveBeenCalled()
  })
})

describe('GET /tasks/:taskId/tests', () => {

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Возвращает 200 и список тестов для задачи', async () => {
    const task = { id: '1', name: 'A', text : '', answer_type : 'text' as const, contest_id : '1' }
    const tasks = [task]
    const tests = [
      { id: 't1', task_id: '1', input: '1', expected_output: '2' },
      { id: 't2', task_id: '2', input: '3', expected_output: '4' }
    ]

    mockedGetTasks.mockResolvedValue(tasks)
    mockedGetTests.mockResolvedValue(tests)

    const res = await request(app)
      .get('/tasks/1/tests')

    expect(res.status).toBe(200)
    expect(res.body).toEqual([
      { id: 't1', task_id: '1', input: '1', expected_output: '2' }
    ])

    expect(mockedGetTasks).toHaveBeenCalledTimes(1)
    expect(mockedGetTests).toHaveBeenCalledTimes(1)
    expect(logger.info).toHaveBeenCalled()
  })

  test('Возвращает 404 если задача не найдена', async () => {
    mockedGetTasks.mockResolvedValue([])

    const res = await request(app)
      .get('/tasks/123/tests')

    expect(res.status).toBe(404)
    expect(res.body).toEqual({ error: 'Task not found' })

    expect(mockedGetTests).not.toHaveBeenCalled()
    expect(logger.error).toHaveBeenCalled()
  })

  test('Возвращает 200 если тестов нет (пустой список)', async () => {
    const task = { id: '1', name: 'A', text : '', contest_id : '1', answer_type : 'theory' as const }
    mockedGetTasks.mockResolvedValue([task])
    mockedGetTests.mockResolvedValue([])

    const res = await request(app)
      .get('/tasks/1/tests')

    expect(res.status).toBe(200)
    expect(res.body).toEqual([])

    expect(mockedGetTasks).toHaveBeenCalled()
    expect(mockedGetTests).toHaveBeenCalled()
    expect(logger.info).toHaveBeenCalled()
  })
})

describe('POST /tasks/:taskId/tests', () => {
  const url = (id : string) => `/tasks/${id}/tests`

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('успешное создание теста', async () => {
    const taskId = 'task1'
    const body = { input: '1 2', output: '3' }

    mockedGetTasks.mockResolvedValue([{
      id: taskId, 
      contest_id: '1',
      name: 'Task1',
      text: 'Task1 text1',
      answer_type: 'theory'
    }])
    mockedCreateTest.mockResolvedValue()

    const res = await request(app)
      .post(url(taskId))
      .send(body)

    expect(res.status).toBe(201)
    expect(res.body.task_id).toBe(taskId)
    expect(createTest).toHaveBeenCalledTimes(1)
  })

  test('задача не найдена', async () => {
    mockedGetTasks.mockResolvedValue([])

    const res = await request(app)
      .post(url('unknown'))
      .send({ input: '1', output: '1' })

    expect(res.status).toBe(404)
    expect(res.body.error).toBe('Task not found')
    expect(createTest).not.toHaveBeenCalled()
  })

  test('ошибка внутри try/catch', async () => {
    mockedGetTasks.mockRejectedValue(new Error('DB error'))

    const res = await request(app)
      .post(url('taskX'))
      .send({ input: 'a', output: 'b' })

    expect(res.status).toBe(500)
    expect(res.body.error).toBe('DB error')
  })
})

})
