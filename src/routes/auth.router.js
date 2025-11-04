import express from "express";
import { allProfiles, login, profile, signup, refresh, logout } from '../controllers/auth.controller.js'
import { authenticate, authorize } from '../middleware/jwt.middleware.js'

const router = express.Router()

router.post('/signup', signup)
router.post('/login', login)

router.post('/refresh', refresh)
router.post('/logout', logout)

router.get('/profile', authenticate, profile)
router.get('/admin/allprofiles', authenticate, authorize(['admin']), allProfiles)



export default router