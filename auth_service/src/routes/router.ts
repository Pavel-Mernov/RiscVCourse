import { Router } from "express";

import controller from '../controllers/controller'
import userController from "../controllers/userController";

const router = Router()

router.post('/login', controller.login)
router.post('/logout', controller.logout)
router.post('/refresh', controller.refresh)

router.get('/students', userController.getStudents)
router.get('/users/:email', userController.getUserByEmail)

export default router
