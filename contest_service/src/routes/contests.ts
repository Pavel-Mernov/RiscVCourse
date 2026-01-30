
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


  try {
    const contests = await getContests()

    logger.info('GET /contests Successful')
    res.status(200).json(contests)
  }
  catch (err : any) {
    const error = (err as Error).message

    logger.error('GET /contests' + error)
    res.status(500).json({ error })
  } 
})

router.post('/contests', authenticateTeacher, async (req, res) => {
  //const contests = await getContests(sqlPool)

  const body: ContestCreate = req.body

  const requestString = 'POST /contests'

  logger.info(requestString + '. Body: ' + JSON.stringify(body))

  // Проверка обязательных полей
  if (!body.title || body.title.trim() === '') {
    const error = 'Contest title is required and cannot be blank'

    logger.error(requestString + '. ' + error)
    return res.status(400).json({ error })
  }

  const contest: Contest = { id: uuid(), ...body }


  //contests.push(contest)

  try {
    await createContest(sqlPool, contest)

    logger.info(requestString + '. Contest created: ' + JSON.stringify(contest))
    res.status(201).json(contest)
  }
  catch (err : any) {
    const error = (err as Error).message

    logger.error(requestString + '. ' + error)
    res.status(500).json({ error })
  }
})

router.get('/contests/:contestId', async (req, res) => {
  const { contestId } = req.params

  const requestString = '/contests/' + contestId
  logger.info(requestString)

  try {
    const contests = await getContests()

    const contest = contests.find(c => c.id == contestId)

    if (!contest) {
      const error = 'Contest not found'
      
      logger.error(requestString + '. ' + error)
      return res.status(404).json({ error })
    }

    logger.info(requestString + '. Get Contest Sucessful: ' + JSON.stringify(contest))
    res.status(200).json(contest)
  }
  catch (err : any) {
    const error = (err as Error).message

    logger.error(requestString + '. ' + error)
    res.status(500).json({ error })
  }
})

// Обновить контест по ID
router.put('/contests/:contestId', authenticateTeacher, async (req, res) => {
  const { contestId } = req.params
  const updatedData = req.body

  const requestString = 'PUT /contests/' + contestId
  logger.info(requestString + '. Body: ' + JSON.stringify(updatedData))

  const contests = await getContests()

  const index = contests.findIndex(c => c.id === contestId)
  if (index === -1) { 
    const error = 'Contest not found'
    
    logger.error(requestString + '. ' + error)
    return res.status(404).json({ error }) 
  }

  try {
    const updatedContest = { ...contests[index], ...updatedData }
  
    await updateContest(updatedContest as Contest)
  
    logger.info(requestString + '. Update Successful. ' + JSON.stringify(updateContest))
    res.status(200).json(updatedContest)
  }
  catch (err : any) {
    const error = (err as Error).message

    logger.error(requestString + '. ' + error)
    res.status(500).json({ error })
  }
})

// Удалить контест по ID
router.delete('/contests/:contestId', authenticateTeacher, async (req, res) => {
  const { contestId } = req.params

  const requestString = 'DELETE /contests/' + contestId
  logger.info(requestString)

  const contests = await getContests()
  const found = contests.find(c => c.id === contestId)
  
  if (!found) {
    const error = 'Contest not found'

    logger.error(requestString + '. ' + error)
    return res.status(404).json({ error : 'Contest not found' })
  } 

  try {
    // Удаляем все задачи контеста
    const tasks = await getTasks()
    .then(tasks => tasks.filter(t => t.contest_id == contestId))
    
    tasks.forEach(async t => {
      await deleteTask(t.id)
    })

    await deleleContest(contestId)

    logger.info('Deletion successful')
    res.status(204).send()
  } catch (err : any) {
    const error = (err as Error).message

    logger.error(requestString + '. ' + error)
    res.status(500).json({ error })
  }
})

router.get('/contests/:contestId/tasks', async (req, res) => {
  const { contestId } = req.params

  const requestString = `GET /contests/${contestId}/tasks`

  try {

  const contests = await getContests()
  const contest = contests.find(c => c.id === contestId)
  
  if (!contest) { 
    const error = 'Contest not found'

    logger.error(requestString + '. ' + error)
    return res.status(404).json({ error }) 
  }

  const tasks = await getTasks()

  const list = tasks
    .filter(t => t.contest_id == contestId)

  logger.info(requestString + '. OK')
  res.status(200).json(list)
  }
  catch (err : any) {
    const error = (err as Error).message

    logger.error(requestString + '. ' + error)
    res.status(500).json({ error })
  }
})

router.post('/contests/:contestId/tasks', authenticateTeacher, async (req, res) => {
  const { contestId } = req.params

  const requestString = `POST /contests/${contestId}/tasks`
  logger.info(requestString)

  const contests = await getContests()
  const contest = contests.find(c => c.id === contestId)

  if (!contest) { 
    const error = 'Contest not found'

    logger.error(`${requestString}. ${error}`)
    return res.status(404).json({ error })
  }

  const body: TaskCreate = req.body
  
  const requestWithBody = requestString + '. Body: ' + JSON.stringify(body)

  logger.info(requestWithBody)

  if (!body.name || body.name.trim() == '') {
    const error = 'Task name cannot be empty'

    logger.error(`${requestString}. ${error}`)
    return res.status(400).json({ error })
  }

  if (!body.text || body.text.trim() == '') {
    const error = 'Task text is required. Task text cannot be empty'

    logger.error(`${requestString}. ${error}`)
    return res.status(400).json({ error })
  }

  if (!body.answer_type || body.answer_type.trim() == '' || 
      !['code', 'theory', 'choice', 'multichoice', 'text'].includes(body.answer_type)) {
        const error = 'Task answer type is required. Answer type should be equal to either: \'code\', \'theory\', \'text\', \'choice\' or \'multichoice\''

        logger.error(requestString + '. Answer type: ' + body.answer_type + '. ' + error)
        return res.status(400).json({ error })
  }

  const task: Task = { id: uuid(), contest_id : contestId, ...body }
  
  await createTask(task)
  
  logger.info(requestWithBody + '. Addition successful')
  res.status(201).json(task)
})

// ------------------------- //
//       Task Endpoints      //
// ------------------------- //

// Получить задачу по ID
router.get('/tasks/:taskId', async (req, res) => {
  const { taskId } = req.params

  const queryString = `GET /tasks/${taskId}`
  logger.info(queryString)

  try {
    const tasks = await getTasks()
    
    const task = tasks.find(t => t.id === taskId)
    if (!task) { 
      const error = 'Task not found'

      logger.error(`${queryString}. ${error}`)
      return res.status(404).json({ error }) 
    }


    res.status(200).json(task)
  }
  catch (err : any) {
    const error = (err as Error).message

    logger.error(`${queryString}. ${error}`)
    return res.status(404).json({ error })
  }
})

// Обновить задачу
router.put('/tasks/:taskId', authenticateTeacher, async (req, res) => {
  const { taskId } = req.params

  const requestString = `PUT /tasks/${taskId}`
  logger.info(requestString)

  const tasks = await getTasks()

  const task = tasks.find(t => t.id === taskId)
  if (!task) { 
    const error = 'Task not found'
    
    logger.error(requestString + '. ' + error)
    return res.status(404).json({ error })
  }

  Object.assign(task, req.body)

  try {
    await updateTask(task)

    res.status(200).json(task)
    }
  catch (err : any) {
    const error = (err as Error).message
    const errorString = `${error}. updated task:${JSON.stringify(task)}`

    logger.error(`${requestString}. ${errorString}`)
    res.status(500).json({ error });
  }
})

// Удалить задачу
router.delete('/tasks/:taskId', authenticateTeacher, async (req, res) => {
  const { taskId } = req.params

  const requestString = `DELETE /tasks/${taskId}`
  logger.info(requestString)
  const tasks = await getTasks()

  const index = tasks.findIndex(t => t.id === taskId)
  if (index === -1) { 
    const error = 'Task not found'

    logger.error(`${requestString}. ${error}`)
    return res.status(404).json({ error })
  }

  try {
    await deleteTask(taskId)
    
    logger.info(`${requestString}. Deletion successful`)
    res.status(204).send()
  }
  catch (err : any) {
    const error = (err as Error).message

    logger.error(`${requestString}. ${error}`)
    res.status(500).json({ error })
  }
})

// Получить тесты задачи
router.get('/tasks/:taskId/tests', authenticateTeacher, async (req, res) => {
  const { taskId } = req.params

  const requestString = `GET /tasks/${taskId}/tests`
  logger.info(requestString)

  const tasks = await getTasks()
  const task = tasks.find(t => t.id === taskId)

  if (!task) { 
    const error = 'Task not found'

    logger.error(`${requestString}. ${error}`)
    return res.status(404).json({ error })
  }

  const tests = await getTests()
  const list = tests.filter(t => t.task_id === task.id)
  
  logger.info(`${requestString}. Successful.`)
  res.status(200).json(list)
})

// ------------------------- //
//       Test Endpoints      //
// ------------------------- //

router.post('/tasks/:taskId/tests', authenticateTeacher, async (req, res) => {

  const { taskId } = req.params;

    const requestString = `/tasks/${taskId}/tests`

  try {


    const body : Omit<Test, 'id' | 'task_id'> = req.body;

    logger.info(requestString + '. ' + JSON.stringify(body))

    const tasks = await getTasks()
    const task = tasks.find(t => t.id === req.params.taskId)
    
    if (!task) { 
      const error = 'Task not found'

      logger.error(requestString + '. ' + error)
      return res.status(404).json({ error })
    }

    // Пример логики добавления теста
    const newTest : Test = {
      id: uuid(),
      task_id : taskId,
      ...body,
    };



    await createTest(newTest)

    logger.info(requestString + '. Created Test: ' + JSON.stringify(newTest))
    res.status(201).json(newTest);
  }
  catch (err) {
    const error = (err as Error).message

    logger.error(requestString + '. ' + error)
    res.status(500).json({ error })
  }
});

// Получить тест по id
router.get('/tests/:idTest', authenticateTeacher, async (req, res) => {
  const { idTest } = req.params;

  const requestString = `GET /tests/${idTest}`
  logger.info(requestString)

  const tests = await getTests()
  const test = tests.filter(t => t.id === idTest)

  if (!test) {
    const error = 'Test not found'

    logger.error(requestString + '. ' + error)
    return res.status(404).json({ error })
  }

  logger.info(requestString + '. Get test successful. New test: ' + JSON.stringify(test))
  res.status(200).json(test);
});

// Обновить тест по id
router.put('/tests/:idTest', authenticateTeacher, async (req, res) => {
  const { idTest } = req.params;
  
  const requestString = `PUT /tests/${idTest}`
  logger.info(requestString)

  const tests = await getTests()
  const test = tests.find(t => t.id === idTest)

  if (!test) {
    const error = 'Test not found'

    logger.error(requestString + '. ' + error)
    return res.status(404).json({ error })
  }
  
  Object.assign(test, req.body)

  try {

    await updateTest(test)

    logger.info(requestString + '. Update successful' + JSON.stringify(test))
    res.status(200).json(test);
  }
  catch (err : any) {
    const error = (err as Error).message + 'Updated test: ' + JSON.stringify(test)

    logger.error(requestString + '. ' + error)
    res.status(500).json({ error });
  }
});

// Удалить тест по id
router.delete('/tests/:idTest', authenticateTeacher, async (req, res) => {
  const { idTest } = req.params;

  const requestString = `DELETE /tests/${idTest}`
  logger.info(requestString)


  const tests = await getTests()
  
  const deletedObject = tests.find(t => t.id === idTest)

  if (!deletedObject) {
    const error = 'Test not found'
    
    logger.error(requestString + '. ' + error)
    return res.status(404).json({ error })
  }

  try {
    await deleteTest(idTest)


    res.status(204).send('Deletion successful');
  }
  catch (err : any) {
    const error = (err as Error).message

    logger.error(requestString + '. ' + error)
    res.status(500).json({ error })
  }
});

export default router