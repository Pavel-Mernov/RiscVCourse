
import { Router } from 'express'
import { v4 as uuid } from 'uuid'
import type { Contest, ContestCreate } from '../models/contest'
import type { Task, TaskCreate } from '../models/task'
import type { Test } from '../models/test'
import { getContests } from '../sql/scripts/contests/getContests'
import { sqlPool } from '..'
import { createContest } from '../sql/scripts/contests/createContest'
import { deleleContest } from '../sql/scripts/contests/deleteContest'
import { updateContest } from '../sql/scripts/contests/updateContest'
import { getTasks } from '../sql/scripts/tasks/getTasks'
import { createTask } from '../sql/scripts/tasks/createTask'
import { updateTask } from '../sql/scripts/tasks/updateTask'
import { deleteTask } from '../sql/scripts/tasks/deleteTask'
import { getTests } from '../sql/scripts/tests/getTests'
import { updateTest } from '../sql/scripts/tests/updateTest'
import { deleteTest } from '../sql/scripts/tests/deleteTest'

const router = Router()

// const contests: Contest[] = []
// const tasks: Task[] = []
// const tests: Test[] = []

// ------------------------- //
//     Contest Endpoints     //
// ------------------------- //

router.get('/contests', async (_, res) => { 
  const contests = await getContests()

  res.status(200).json(contests) 
})

router.post('/contests', async (req, res) => {
  //const contests = await getContests(sqlPool)

  const body: ContestCreate = req.body
  const contest: Contest = { id: uuid(), ...body }
  
  //contests.push(contest)
  await createContest(sqlPool, contest)

  res.status(201).json(contest)
})

router.get('/contests/:contestId', async (req, res) => {
  const { contestId } = req.params

  const contests = await getContests()

  const contest = contests.find(c => c.id === contestId)
  if (!contest) return res.status(404).send('Contest not found')
  res.status(200).json(contest)
})

// Обновить контест по ID
router.put('/contests/:contestId', async (req, res) => {
  const { contestId } = req.params
  const updatedData = req.body

  const contests = await getContests()

  const index = contests.findIndex(c => c.id === contestId)
  if (index === -1) return res.status(404).send('Contest not found')

  const updatedContest = { ...contests[index], ...updatedData }
  
  await updateContest(updatedContest as Contest)
  
  res.status(200).json(updatedContest)
})

// Удалить контест по ID
router.delete('/contests/:contestId', async (req, res) => {
  const { contestId } = req.params

  const contests = await getContests()

  const index = contests.findIndex(c => c.id === contestId)
  if (index === -1) return res.status(404).send('Contest not found')

  await deleleContest(contestId)
  res.status(204).send()
})

router.get('/contests/:contestId/tasks', async (req, res) => {
  const { contestId } = req.params

  const contests = await getContests()
  const contest = contests.find(c => c.id === contestId)
  if (!contest) return res.status(404).send('Contest not found')

  const tasks = await getTasks()

  const list = tasks.filter(t => t.contestId === req.params.contestId)
  res.status(200).json(list)
})

router.post('/contests/:contestId/tasks', async (req, res) => {
  const { contestId } = req.params

  const contests = await getContests()
  const contest = contests.find(c => c.id === contestId)
  if (!contest) return res.status(404).send('Contest not found')

  const body: TaskCreate = req.body
  const task: Task = { id: uuid(), contestId, ...body }
  
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
  if (!task) return res.status(404).send('Task not found')
  res.status(200).json(task)
})

// Обновить задачу
router.put('/tasks/:taskId', async (req, res) => {
  const tasks = await getTasks()

  const task = tasks.find(t => t.id === req.params.taskId)
  if (!task) return res.status(404).send('Task not found')

  Object.assign(task, req.body)

  await updateTask(task)

  res.status(200).json(task)
})

// Удалить задачу
router.delete('/tasks/:taskId', async (req, res) => {
  const { taskId } = req.params

  const tasks = await getTasks()

  const index = tasks.findIndex(t => t.id === taskId)
  if (index === -1) return res.status(404).send('Task not found')

  // tasks.splice(index, 1)
  await deleteTask(taskId)

  res.status(204).send()
})

// Получить тесты задачи
router.get('/tasks/:taskId/tests', async (req, res) => {

  const tasks = await getTasks()
  const task = tasks.find(t => t.id === req.params.taskId)
  if (!task) return res.status(404).send('Task not found')

  const tests = await getTests()
  const list = tests.filter(t => t.taskId === task.id)
  res.status(200).json(list)
})

// ------------------------- //
//       Test Endpoints      //
// ------------------------- //

router.post('/api/tasks/:taskId/tests', (req, res) => {
  const { taskId } = req.params;
  const testData = req.body;

  // Пример логики добавления теста
  const newTest = {
    idTest: uuid(),
    taskId,
    ...testData,
  };

  res.status(201).json(newTest);
});

// Получить тест по id
router.get('/tests/:idTest', async (req, res) => {
  const { idTest } = req.params;

  const tests = await getTests()
  const test = tests.filter(t => t.id === idTest)

  if (!test) {
    return res.status(404).send('Объект не найден');
  }

  res.status(200).json(test);
});

// Обновить тест по id
router.put('/tests/:idTest', async (req, res) => {
  const { idTest } = req.params;
  const updatedData = req.body;

  const tests = await getTests()
  const test = tests.filter(t => t.id === idTest)

  if (!test) {
    return res.status(404).send('Объект не найден');
  }
  
  // Пример обновления
  const updatedTest = {
    idTest,
    ...updatedData,
  };

  await updateTest(updatedTest)

  res.status(200).json(updatedTest);
});

// Удалить тест по id
router.delete('/tests/:idTest', async (req, res) => {
  const { idTest } = req.params;

  const tests = await getTests()
  // Пример удаления
  const deletedObject = tests.find(t => t.id === idTest)

  if (!deletedObject) {
    return res.status(404).send('Объект не найден');
  }

  await deleteTest(idTest)

  res.status(204).send();
});

export default router