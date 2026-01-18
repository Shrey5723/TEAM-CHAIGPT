import express from 'express';
import cors from 'cors';
import path from 'path';
import { config } from './config';
import { errorHandler, notFoundHandler } from './middleware';

// Import routes
import { authRoutes } from './modules/auth';
import { applicantRoutes } from './modules/applicant';
import { githubRoutes } from './modules/github';
import { corporateRoutes } from './modules/corporate';
import { notificationRoutes } from './modules/notification';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: config.nodeEnv,
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/applicant', applicantRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/corporate', corporateRoutes);
app.use('/api/notifications', notificationRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const PORT = config.port;

app.listen(PORT, () => {
    console.log(`
  🚀 Corporate Sector Server is running!
  
  📍 Local:      http://localhost:${PORT}
  📍 Health:     http://localhost:${PORT}/health
  
  📚 API Endpoints:
  ├── Auth:
  │   ├── POST /api/auth/register
  │   └── POST /api/auth/login
  │
  ├── Applicant (APPLICANT role):
  │   ├── POST /api/applicant/profile
  │   ├── GET  /api/applicant/profile
  │   ├── POST /api/applicant/resume (PDF only)
  │   ├── POST /api/applicant/certificates
  │   └── GET  /api/applicant/skills
  │
  ├── GitHub (APPLICANT role):
  │   ├── POST /api/github/connect
  │   └── GET  /api/github/repos
  │
  ├── Corporate:
  │   ├── GET  /api/corporate/jobs
  │   ├── POST /api/corporate/jobs (HIRER)
  │   ├── GET  /api/corporate/jobs/recommended/me (APPLICANT)
  │   └── GET  /api/corporate/applicants/recommended/:jobId (HIRER)
  │
  └── Notifications:
      └── GET  /api/notifications/:userId
  
  🌱 Environment: ${config.nodeEnv}
  `);
});

export default app;
