
import { Router } from 'express'
import { v4 as uuid } from 'uuid'
import type { Contest, ContestCreate } from '../models/contest'
import type { Task, TaskCreate } from '../models/task'
import type { Test } from '../models/test'

const router = Router()

const contests: Contest[] = []
const tasks: Task[] = []
const tests: Test[] = []

// ------------------------- //
//     Contest Endpoints     //
// ------------------------- //

router.get('/contests', (_, res) => res.status(200).json(contests))

router.post('/contests', (req, res) => {
  const body: ContestCreate = req.body
  const contest: Contest = { id: uuid(), ...body }
  contests.push(contest)
  res.status(201).json(contest)
})

router.get('/contests/:contestId', (req, res) => {
  const { contestId } = req.params
  const contest = contests.find(c => c.id === contestId)
  if (!contest) return res.status(404).send('Contest not found')
  res.status(200).json(contest)
})

// Обновить контест по ID
router.put('/contests/:contestId', (req, res) => {
  const { contestId } = req.params
  const updatedData = req.body
  const index = contests.findIndex(c => c.id === contestId)
  if (index === -1) return res.status(404).send('Contest not found')

  contests[index] = { ...contests[index], ...updatedData }
  res.status(200).json(contests[index])
})

// Удалить контест по ID
router.delete('/contests/:contestId', (req, res) => {
  const { contestId } = req.params
  const index = contests.findIndex(c => c.id === contestId)
  if (index === -1) return res.status(404).send('Contest not found')

  contests.splice(index, 1)
  res.status(204).send()
})

router.get('/contests/:contestId/tasks', (req, res) => {
  const list = tasks.filter(t => t.contestId === req.params.contestId)
  res.status(200).json(list)
})

router.post('/contests/:contestId/tasks', (req, res) => {
  const { contestId } = req.params
  const contest = contests.find(c => c.id === contestId)
  if (!contest) return res.status(404).send('Contest not found')

  const body: TaskCreate = req.body
  const task: Task = { id: uuid(), contestId, ...body }
  tasks.push(task)
  res.status(201).json(task)
})

// ------------------------- //
//       Task Endpoints      //
// ------------------------- //

// Получить задачу по ID
router.get('/tasks/:taskId', (req, res) => {
  const task = tasks.find(t => t.id === req.params.taskId)
  if (!task) return res.status(404).send('Task not found')
  res.status(200).json(task)
})

// Обновить задачу
router.put('/tasks/:taskId', (req, res) => {
  const task = tasks.find(t => t.id === req.params.taskId)
  if (!task) return res.status(404).send('Task not found')

  Object.assign(task, req.body)
  res.status(200).json(task)
})

// Удалить задачу
router.delete('/tasks/:taskId', (req, res) => {
  const index = tasks.findIndex(t => t.id === req.params.taskId)
  if (index === -1) return res.status(404).send('Task not found')

  tasks.splice(index, 1)
  res.status(204).send()
})

// Получить тесты задачи
router.get('/tasks/:taskId/tests', (req, res) => {
  const task = tasks.find(t => t.id === req.params.taskId)
  if (!task) return res.status(404).send('Task not found')

  const list = tests.filter(t => t.taskId === task.id)
  res.status(200).json(list)
})

export default router