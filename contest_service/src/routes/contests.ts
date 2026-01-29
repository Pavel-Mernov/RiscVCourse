
import { Router } from 'express'
import { v4 as uuid } from 'uuid'
import type { Contest, ContestCreate } from '../models/contest'
import type { Task, TaskCreate } from '../models/task.js'
import type { Test } from '../models/test'
import { getContests } from '../sql/scripts/contests/getContests.js'
import { sqlPool } from '../index.js'
import { createContest } from '../sql/scripts/contests/createContest.js'
import { deleleContest } from '../sql/scripts/contests/deleteContest.js'
import { updateContest } from '../sql/scripts/contests/updateContest.js'
import { getTasks } from '../sql/scripts/tasks/getTasks.js'
import { createTask } from '../sql/scripts/tasks/createTask.js'
import { updateTask } from '../sql/scripts/tasks/updateTask.js'
import { deleteTask } from '../sql/scripts/tasks/deleteTask.js'
import { getTests } from '../sql/scripts/tests/getTests.js'
import { updateTest } from '../sql/scripts/tests/updateTest.js'
import { deleteTest } from '../sql/scripts/tests/deleteTest.js'
import { createTest } from '../sql/scripts/tests/createTest.js'
import { authenticate, authenticateTeacher } from './authenticate.js'
import logger from '../logger/logger.js'

const router = Router()

// const contests: Contest[] = []
// const tasks: Task[] = []
// const tests: Test[] = []

// ------------------------- //
//     Contest Endpoints     //
// ------------------------- //

router.get('/contests', async (_, res) => { 

  logger.info('GET /contests')

  const contests = await getContests()

  res.status(200).json(contests) 
})

router.post('/contests', authenticateTeacher, async (req, res) => {
  //const contests = await getContests(sqlPool)

  const body: ContestCreate = req.body

  logger.info('POST /contests. Body: ' + JSON.stringify(body))

  // Проверка обязательных полей
  if (!body.title || body.title.trim() === '') {
    const error = 'Contest title is required and cannot be blank'

    logger.error(error)
    return res.status(400).json({ error })
  }

  const contest: Contest = { id: uuid(), ...body }


  //contests.push(contest)

  try {
    await createContest(sqlPool, contest)

    logger.info('Contest created: ' + JSON.stringify(contest))
    res.status(201).json(contest)
  }
  catch (err : any) {
    const error = (err as Error).message

    logger.error(error)
    res.status(500).json({ error })
  }
})

router.get('/contests/:contestId', async (req, res) => {
  const { contestId } = req.params

  logger.info('/contests/' + contestId)

  const contests = await getContests()

  const contest = contests.find(c => c.id == contestId)

  if (!contest) {
    const error = 'Contest not found'
    
    logger.error(error)
    return res.status(404).json({ error })
  }

  logger.info('Create Contest Sucessful: ' + JSON.stringify(contest))
  res.status(200).json(contest)
})

// Обновить контест по ID
router.put('/contests/:contestId', authenticateTeacher, async (req, res) => {
  const { contestId } = req.params
  const updatedData = req.body

  logger.info('PUT /contests/' + contestId + '. Body: ' + JSON.stringify(updatedData))

  const contests = await getContests()

  const index = contests.findIndex(c => c.id === contestId)
  if (index === -1) { 
    const error = 'Contest not found'
    
    logger.error(error)
    return res.status(404).json({ error }) 
  }

  try {
    const updatedContest = { ...contests[index], ...updatedData }
  
    await updateContest(updatedContest as Contest)
  
    logger.info('Update Successful. ' + JSON.stringify(updateContest))
    res.status(200).json(updatedContest)
  }
  catch (err : any) {
    const error = (err as Error).message

    logger.error(error)
    res.status(500).json({ error })
  }
})

// Удалить контест по ID
router.delete('/contests/:contestId', authenticateTeacher, async (req, res) => {
  const { contestId } = req.params

  logger.info('DELETE /contests/' + contestId)

  const contests = await getContests()

  const found = contests.find(c => c.id === contestId)
  if (!found) {
    const error = 'Contest not found'

    logger.error(error)
    return res.status(404).json({ error : 'Contest not found' })
  } 

  // Удаляем все задачи контеста
  const tasks = await getTasks()
  .then(tasks => tasks.filter(t => t.contest_id == contestId))
  
  tasks.forEach(async t => {
    await deleteTask(t.id)
  })

  await deleleContest(contestId)
  res.status(204).send()
})

router.get('/contests/:contestId/tasks', async (req, res) => {
  const { contestId } = req.params

  const contests = await getContests()
  const contest = contests.find(c => c.id === contestId)
  if (!contest) return res.status(404).json({ error : 'Contest not found' })

  const tasks = await getTasks()

  const list = tasks
    .filter(t => t.contest_id == contestId)
  res.status(200).json(list)
})

router.post('/contests/:contestId/tasks', authenticateTeacher, async (req, res) => {
  const { contestId } = req.params

  const contests = await getContests()
  const contest = contests.find(c => c.id === contestId)
  if (!contest) return res.status(404).json({ error : 'Contest not found' })

  const body: TaskCreate = req.body

  if (!body.name || body.name.trim() == '') {
    return res.status(400).json({ error: 'Task name cannot be empty' })
  }

  if (!body.text || body.text.trim() == '') {
    return res.status(400).json({ error: 'Task text is required. Task text cannot be empty' })
  }

  if (!body.answer_type || body.answer_type.trim() == '' || 
    (body.answer_type != 'code' && body.answer_type != 'choice' && body.answer_type != 'text' && body.answer_type != 'theory')) {
    
      return res.status(400).json({ error: 'Task answer type is required. Answer type should be equal to either: \'code\', \'theory\', \'text\' or \'choice\'' })
  }

  const task: Task = { id: uuid(), contest_id : contestId, ...body }
  
  await createTask(task)
  
  res.status(201).json(task)
})

// ------------------------- //
//       Task Endpoints      //
// ------------------------- //

// Получить задачу по ID
router.get('/tasks/:taskId', async (req, res) => {
  const tasks = await getTasks()
  
  const task = tasks.find(t => t.id === req.params.taskId)
  if (!task) return res.status(404).json({ error : 'Task not found' })
  res.status(200).json(task)
})

// Обновить задачу
router.put('/tasks/:taskId', authenticateTeacher, async (req, res) => {
  const tasks = await getTasks()

  const task = tasks.find(t => t.id === req.params.taskId)
  if (!task) return res.status(404).json({ error : 'Task not found' })

  Object.assign(task, req.body)

  try {
    await updateTask(task)

    res.status(200).json(task)
    }
  catch (error) {
    res.status(500).json({ error : `${error}. updated task:${JSON.stringify(task)}` });
  }
})

// Удалить задачу
router.delete('/tasks/:taskId', authenticateTeacher, async (req, res) => {
  const { taskId } = req.params

  const tasks = await getTasks()

  const index = tasks.findIndex(t => t.id === taskId)
  if (index === -1) return res.status(404).json({ error : 'Task not found' })

  // tasks.splice(index, 1)
  await deleteTask(taskId)

  res.status(204).send()
})

// Получить тесты задачи
router.get('/tasks/:taskId/tests', authenticateTeacher, async (req, res) => {

  const tasks = await getTasks()
  const task = tasks.find(t => t.id === req.params.taskId)
  if (!task) return res.status(404).json({ error : 'Task not found' })

  const tests = await getTests()
  const list = tests.filter(t => t.task_id === task.id)
  res.status(200).json(list)
})

// ------------------------- //
//       Test Endpoints      //
// ------------------------- //

router.post('/tasks/:taskId/tests', authenticateTeacher, async (req, res) => {
  try {
    const { taskId } = req.params;
    const body : Omit<Test, 'id' | 'task_id'> = req.body;

    const tasks = await getTasks()
    const task = tasks.find(t => t.id === req.params.taskId)
    if (!task) return res.status(404).json({ error : 'Task not found' })

    // Пример логики добавления теста
    const newTest : Test = {
      id: uuid(),
      task_id : taskId,
      ...body,
    };



    await createTest(newTest)

    res.status(201).json(newTest);
  }
  catch (error) {
    res.status(500).json({ error })
  }
});

// Получить тест по id
router.get('/tests/:idTest', authenticateTeacher, async (req, res) => {
  const { idTest } = req.params;

  const tests = await getTests()
  const test = tests.filter(t => t.id === idTest)

  if (!test) {
    return res.status(404).json({ error : 'Test not found' })
  }

  res.status(200).json(test);
});

// Обновить тест по id
router.put('/tests/:idTest', authenticateTeacher, async (req, res) => {
  
  const { idTest } = req.params;
  // const updatedData = req.body;

  const tests = await getTests()
  const test = tests.find(t => t.id === idTest)

  if (!test) {
    return res.status(404).json({ error : 'Test not found' })
  }
  
  Object.assign(test, req.body)

  try {

  await updateTest(test)

  res.status(200).json(test);
  }
  catch (error : any) {
    res.status(500).json({ error : `${error}. updated test:${test}` });
  }
});

// Удалить тест по id
router.delete('/tests/:idTest', authenticateTeacher, async (req, res) => {
  const { idTest } = req.params;

  const tests = await getTests()
  // Пример удаления
  const deletedObject = tests.find(t => t.id === idTest)

  if (!deletedObject) {
    return res.status(404).json({ error : 'Test not found' })
  }

  await deleteTest(idTest)

  res.status(204).send('Deletion successful');
});

export default router