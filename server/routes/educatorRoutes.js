import express from 'express'
import {
    addCourse, educatorDashboardData, getEducatorCourses, getEnrolledStudentsData,
    updateRoleEducator
} from '../controllers/educatorController.js'
import upload from '../configs/multer.js'
import { protectEducator } from '../middlewares/authMiddleware.js'

const educatorRouter = express.Router()

// Add Educator Role
educatorRouter.get('/update-role', express.json(), updateRoleEducator)
educatorRouter.post('/add-course', upload.single('image'), protectEducator, addCourse)
educatorRouter.get('/courses', express.json(), protectEducator, getEducatorCourses)
educatorRouter.get('/dashboard', express.json(), protectEducator, educatorDashboardData)
educatorRouter.get('/enrolled-students', express.json(), protectEducator, getEnrolledStudentsData)

export default educatorRouter;