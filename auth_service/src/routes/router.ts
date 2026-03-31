import { Router } from "express";

import controller from '../controllers/controller'

const router = Router()

router.post('/login', controller.login)
router.post('/logout', controller.logout)
router.post('/refresh', controller.refresh)

export default router