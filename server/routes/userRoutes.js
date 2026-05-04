import express from 'express'
import {
    addUserRating, getCertificate, getUserCourseProgress, getUserData, purchaseCourse, updateUserCourseProgress,
    userEnrolledCourses
} from '../controllers/userController.js'

const userRouter = express.Router()

userRouter.get('/data', getUserData)
userRouter.get('/enrolled-courses', userEnrolledCourses)
userRouter.post('/purchase', purchaseCourse)

userRouter.post('/update-course-progress', updateUserCourseProgress)
userRouter.post('/get-course-progress', getUserCourseProgress)
userRouter.post('/add-rating', addUserRating)
userRouter.get('/certificate/:courseId', getCertificate)

export default userRouter;