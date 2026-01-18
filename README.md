# SAKSHAM – Intelligent Career Intelligence Platform

SAKSHAM is an AI-powered career intelligence platform that connects **verified skills** with **real job opportunities**.  
It bridges the gap between applicants and hirers using AI-based skill verification, matching, and career guidance.

---

## 🚀 Features

### 👤 Applicant
- Profile creation & management
- Resume upload (PDF parsing + CGPA extraction)
- Certificate-based skill derivation (AI-evaluated)
- GitHub integration for skill verification
- AI-generated skill tests
- Job matching with confidence scores
- Career guidance via Goal Advisor
- Skill Twin (AI chatbot)

### 🏢 Hirer
- Company profile setup
- Job posting with required skills
- Skill weighting
- AI-ranked applicant matching
- Verified skill confidence view

### 🔐 Security
- JWT-based authentication
- Role-based access control (Applicant / Hirer)
- Password hashing using bcrypt
- Protected API routes with middleware
- Input validation on all endpoints

---

## 🧠 Tech Stack

### Frontend
- React 18
- Vite
- TypeScript
- Tailwind CSS
- Framer Motion
- Recharts
- shadcn/ui

### Backend
- Node.js
- Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication
- bcrypt (password hashing)

### AI Services
- Python + Flask (Skill Twin, TechStack Analysis)
- OpenRouter API (Goal Advisor, Certificate Evaluation)

---

## 📁 Project Structure

```

SAKSHAM/
├── prof-leap-main/        # Frontend (React)
├── TEAM-CHAIGPT-main/    # Backend (Node.js)
├── skill-twin/           # AI Chatbot (Python)
├── progress-tracker/    # TechStack Analysis (Python)

````

---

## ⚙️ Setup & Run Locally

### 1️⃣ Clone the repo
```bash
git clone https://github.com/your-username/saksham.git
cd saksham
````

---

### 2️⃣ Frontend setup

```bash
cd prof-leap-main
npm install
npm run dev
```

Frontend runs at:
👉 `http://localhost:5173`

---

### 3️⃣ Backend setup

```bash
cd ../TEAM-CHAIGPT-main
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

Backend runs at:
👉 `http://localhost:5000`

---

### 4️⃣ AI services (optional but recommended)

```bash
cd skill-twin
pip install -r requirements.txt
python app.py
```

---

## 🔑 Environment Variables

### Backend (`.env`)

```env
DATABASE_URL="postgresql://user:password@localhost:5432/saksham"
JWT_SECRET="your_jwt_secret_here"
PORT=5000
```

### AI Services

```env
OPENROUTER_API_KEY="your_openrouter_api_key"
```

⚠️ **Never commit `.env` files**

---

## 🧪 Test Login Credentials (Optional)

If seed data is enabled:

```txt
Applicant:
Email: testuser@applicant.com
Password: Test@1234

Hirer:
Email: testuser@hirer.com
Password: Test@1234
```

(Otherwise, register normally.)

---

## ❗ Basic Error Handling

* Invalid credentials → `401 Unauthorized`
* Missing token → `403 Forbidden`
* Invalid input → `400 Bad Request`
* Server issues → `500 Internal Server Error`

Errors are returned in JSON:

```json
{
  "error": "Meaningful error message"
}
```

---

## 🔒 Security Confirmation

✅ No secrets or API keys are committed
✅ `.env` files are gitignored
✅ Passwords are never stored in plain text
✅ bcrypt is used for irreversible password hashing
✅ JWT tokens secure authenticated routes

---

## 📌 Status

This project is under active development and intended for **educational + production-ready demonstration** purposes.

---

## 👨‍💻 Team

**SAKSHAM – Intelligent Career Intelligence Platform**
Built with ❤️ for scalable, secure, AI-driven hiring.

```

---

If you want:
- a **shorter GitHub-style README**
- badges (build, license, tech)
- or separate frontend/backend READMEs  

say it — I’ll tighten it further.
```
