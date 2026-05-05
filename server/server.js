import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './configs/mongodb.js'
import { clerkWebhooks, stripeWebhooks } from './controllers/webhooks.js'
import educatorRouter from './routes/educatorRoutes.js'
import { clerkMiddleware } from '@clerk/express'
import connectCloudinary from './configs/cloudinary.js'
import courseRouter from './routes/courseRoute.js'
import userRouter from './routes/userRoutes.js'
import aiRouter from './routes/aiRoutes.js'

// Initialize Express
const app = express()

// Connect DB & Cloudinary
await connectDB()
await connectCloudinary()

//  CORS FIX (IMPORTANT)
app.use(cors({
  origin: true,
  credentials: true
}))

// Middlewares
app.use(express.json())
app.use(clerkMiddleware())

// Routes
app.get('/', (req, res) => res.send("API Working"))

app.post('/clerk', express.json(), clerkWebhooks)

app.use('/api/educator', educatorRouter)
app.use('/api/course', courseRouter)
app.use('/api/user', userRouter)
app.use('/api/ai', aiRouter)

// Stripe webhook (raw body required)
app.post('/stripe', express.raw({ type: 'application/json' }), stripeWebhooks)

// Port
const PORT = process.env.PORT || 5001

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})