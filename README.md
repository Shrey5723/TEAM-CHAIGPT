# Corporate Sector – Skill Intelligence Platform

A hackathon-ready **trust-first hiring and progress intelligence system** for the Corporate sector.  
The platform derives skills from **verifiable evidence** (GitHub activity, certifications, CGPA) instead of self-declared claims and matches applicants to jobs using weighted skill logic.

---

## 📌 Project Overview

This project focuses on the **Corporate sector** of a larger Skill Intelligence Platform.  
It enables applicants to build credible profiles using resumes, certifications, and GitHub data, while hirers can post jobs with weighted skill requirements and discover the most relevant candidates automatically.

The system is designed with **backend-driven intelligence** and a **modular architecture**, making it extensible to other sectors (e.g., Agriculture) in the future.

---

## ✨ Features

### Applicant
- Secure authentication
- Profile creation with personal details
- PDF-only resume upload
- Certificate upload for skill derivation
- GitHub integration to extract repositories, tech stack, and activity
- Automatically derived skills (no manual skill entry)
- Job recommendations based on weighted skill matching
- Real-time notifications for job matches

### Hirer
- Secure authentication
- Job posting with weighted skill requirements
- View recommended applicants per job
- Transparent match-score based shortlisting

### System
- Trust-based skill inference
- Weighted skill matching algorithm
- Event-driven notification system
- Modular, integration-ready backend architecture

---

## 🛠 Tech Stack

### Backend
- Node.js
- Express
- TypeScript
- PostgreSQL
- Prisma ORM
- JWT Authentication
- Multer (file uploads)

### Frontend
- React + Vite (temporary frontend for testing and validation)

---

## ⚙️ Setup Steps

### 1. Clone the Repository

	git clone <your-github-repo-link>
	cd au

### 2. Install Dependencies

### Backend
	npm install

### Frontend
	cd frontend
	npm install


⸻

## 🔐 Environment Variables (Example)

		Create a .env file in the root directory:
		
		DATABASE_URL="postgresql://user:password@localhost:5432/corporate_db"
		
		JWT_SECRET="your-jwt-secret"
		
		PORT=3000
		
		GITHUB_CLIENT_ID=your_github_client_id
		
		GITHUB_CLIENT_SECRET=your_github_client_secret
		
		GITHUB_OAUTH_CALLBACK_URL=http://localhost:3000/api/github/callback

⚠️ These values are examples only. Real secrets are never committed.

⸻

## ▶️ How to Run Locally

Database Setup

	npx prisma db push
	npm run db:seed

Start Servers

	### Backend
	npm run dev
	
	### Frontend (new terminal)
	cd frontend
	npm run dev

Access URLs
	•	Backend: http://localhost:3000
	•	Frontend: http://localhost:5173

⸻

## 🔑 Test Login Credentials

Role	Email	Password

APPLICANT	john.developer@example.com	password123

APPLICANT	priya.engineer@example.com	password123

HIRER	hr@techcorp.com	password123

HIRER	hiring@startup.io	password123


⸻

## 🔗 API Overview

# Authentication
	•	POST /api/auth/register
	•	POST /api/auth/login
	•	GET /api/auth/profile

# Applicant
	•	POST /api/applicant/profile
	•	GET /api/applicant/profile
	•	POST /api/applicant/resume (PDF only)
	•	POST /api/applicant/certificates
	•	GET /api/applicant/skills

# GitHub Integration
	•	GET /api/github/connect
	•	GET /api/github/repos

# Corporate / Jobs
	•	GET /api/corporate/jobs
	•	POST /api/corporate/jobs
	•	GET /api/corporate/my-jobs
	•	GET /api/corporate/jobs/recommended/me
	•	GET /api/corporate/applicants/recommended/:jobId

# Notifications
	•	GET /api/notifications
	•	PUT /api/notifications/:id/read
	•	PUT /api/notifications/read-all

⸻

## 🧠 Skill Matching Logic

match_score = Σ(matched_skill_weights) / Σ(total_skill_weights)

	•	Notifications are triggered when match_score > 0.7.

⸻


  ## 🧱 Project Structure

```text
/src
 ├── config/          # DB, env, upload config
 ├── middleware/      # Auth & error handling
 ├── modules/
 │    ├── auth/
 │    ├── applicant/
 │    ├── github/
 │    ├── corporate/
 │    └── notification/
 └── shared/          # Events, utils, types

/frontend
 └── src/
      ├── pages/
      └── api.js

```
⸻

## ⚠️ Basic Error Handling
	•	JWT validation for protected routes
	•	Role-based access control
	•	File type validation (PDF-only resumes)
	•	Graceful handling of invalid GitHub tokens
	•	Consistent API error responses

⸻

## 🔒 Security Confirmation
	•	No secrets, API keys, or credentials are committed to the repository
	•	All sensitive values are managed via environment variables
	•	GitHub OAuth is used instead of username/password collection

⸻

## 🚀 Future Scope
	•	Agriculture sector integration
	•	Advanced analytics dashboards
	•	ML-enhanced skill confidence scoring
	•	Organization-level hiring insights
