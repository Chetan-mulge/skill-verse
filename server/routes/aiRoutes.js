import express from 'express';
import { getLectureSummary } from '../controllers/aiController.js';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';

const aiRouter = express.Router();

// Protected route - requires authentication
aiRouter.post('/lecture-summary', ClerkExpressRequireAuth(), getLectureSummary);

export default aiRouter;
