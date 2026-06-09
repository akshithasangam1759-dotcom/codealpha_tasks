# 🤖 WorkNest — AI-Powered Project Management Platform

A full-stack project management platform built with React, Node.js, MySQL, Socket.io, and Nesty AI.

---

## 🚀 Quick Start (Local Setup)

### Prerequisites

Make sure you have installed:
- **Node.js** v18+ → https://nodejs.org
- **MySQL** v8+ → https://dev.mysql.com/downloads/
- **Git** → https://git-scm.com

---

## 📦 Step 1: Install Dependencies

Open terminal in the root `worknest/` folder and run:

```bash
npm run install:all
```

This installs packages for root, frontend, and backend.

---

## 🗄️ Step 2: Set Up MySQL Database

1. Open MySQL Workbench or your terminal and log in:
   ```bash
   mysql -u root -p
   ```

2. Create the database and run the schema:
   ```bash
   mysql -u root -p < backend/src/config/schema.sql
   ```

   Or manually in MySQL:
   ```sql
   CREATE DATABASE worknest;
   USE worknest;
   SOURCE backend/src/config/schema.sql;
   ```

---

## ⚙️ Step 3: Configure Environment Variables

1. Copy the example env file:
   ```bash
   cp backend/.env.example backend/.env
   ```

2. Edit `backend/.env` with your values:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password_here
   DB_NAME=worknest
   JWT_SECRET=any_random_long_string_here
   FRONTEND_URL=http://localhost:3000
   ```

---

## ▶️ Step 4: Run the Application

From the root folder, run both frontend and backend together:

```bash
npm run dev
```

Or run them separately:

```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev:frontend
```

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Health check:** http://localhost:5000/health

---

## 🌟 Features

### Core
- ✅ User Authentication (Register/Login with JWT)
- ✅ Workspaces → Projects → Boards → Tasks hierarchy
- ✅ Kanban Board with Drag & Drop
- ✅ Real-time updates via Socket.io

### AI
- 🤖 **Nesty AI Assistant** — powered by Claude API
- 🤖 Auto-generates tasks from project name
- 🤖 Project planning, roadmaps, sprint planning
- 🤖 Documentation generation

### Collaboration
- 👥 Team management with custom roles
- 💬 Comments on tasks
- 🔔 Real-time notifications
- 📊 Analytics dashboard

### Gamification
- ⚡ XP points for completing tasks
- 🏆 Level system
- 🔥 Productivity streaks
- 🏅 Achievement badges

### UI/UX
- 🌙 Dark/Light theme toggle
- 🎨 Glassmorphism design
- 📱 Fully responsive
- ✨ Smooth animations

---

## 📁 Project Structure

```
worknest/
├── frontend/                 # React + TypeScript + Tailwind
│   └── src/
│       ├── components/       # Reusable UI components
│       │   ├── layout/       # Sidebar, Navbar, MainLayout
│       │   ├── ai/           # Nesty AI Assistant
│       │   └── modals/       # Create Project Modal, etc.
│       ├── pages/            # Route pages
│       ├── context/          # Auth, Theme, Socket contexts
│       ├── types/            # TypeScript types
│       └── utils/            # API helper
│
├── backend/                  # Node.js + Express
│   └── src/
│       ├── config/           # Database + Schema
│       ├── controllers/      # Business logic
│       ├── middleware/        # Auth middleware
│       ├── routes/           # API routes
│       └── socket/           # Socket.io handler
│
└── package.json              # Root scripts
```

---

## 🔧 Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | React 18, TypeScript, Tailwind CSS  |
| State       | React Context + Zustand             |
| Animations  | Framer Motion                       |
| Drag & Drop | @dnd-kit                            |
| Charts      | Recharts                            |
| Backend     | Node.js, Express.js                 |
| Database    | MySQL 8                             |
| Auth        | JWT (jsonwebtoken + bcryptjs)       |
| Realtime    | Socket.io                           |
| AI          | Anthropic Claude API                |

---

## 🎨 Adding Nesty AI (Claude API)

Nesty uses the Claude API directly from the frontend. To enable it:

1. Get your API key from https://console.anthropic.com
2. The frontend calls `https://api.anthropic.com/v1/messages` directly

> ⚠️ For production, proxy the API call through your backend to keep the key secure.

---

## 📝 Adding More Features

The codebase is structured to easily extend:

- **New pages:** Add to `frontend/src/pages/` and register in `App.tsx`
- **New API routes:** Add to `backend/src/routes/index.js`
- **New socket events:** Add to `backend/src/socket/index.js`
- **New DB tables:** Add to `backend/src/config/schema.sql`

---

## 🚀 Deployment

### Frontend (Vercel)
```bash
cd frontend && npm run build
# Deploy the `dist/` folder to Vercel
```

### Backend (Railway / Render)
```bash
# Set environment variables on your platform
# Point start command to: node backend/src/index.js
```

---

Built with ❤️ and 🤖 by WorkNest
