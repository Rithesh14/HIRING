import { Express } from 'express';
import authRoutes from './auth';
import userRoutes from './users';
import assessmentRoutes from './assessments';
import questionRoutes from './questions';
import submissionRoutes from './submissions';
import analyticsRoutes from './analytics';
import adminRoutes from './admin';

export function setupRoutes(app: Express) {
  const API_PREFIX = `/api/${process.env.API_VERSION || 'v1'}`;

  // Public routes
  app.use(`${API_PREFIX}/auth`, authRoutes);
  
  // Protected routes
  app.use(`${API_PREFIX}/users`, userRoutes);
  app.use(`${API_PREFIX}/assessments`, assessmentRoutes);
  app.use(`${API_PREFIX}/questions`, questionRoutes);
  app.use(`${API_PREFIX}/submissions`, submissionRoutes);
  app.use(`${API_PREFIX}/analytics`, analyticsRoutes);
  app.use(`${API_PREFIX}/admin`, adminRoutes);
}