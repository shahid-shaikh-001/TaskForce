# ⚡ TaskForge — Real-Time Task Management Platform

<div align="center">

![TaskForge](https://img.shields.io/badge/Productivity-Platform-blue?style=for-the-badge)
![React](https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge\&logo=react)
![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?style=for-the-badge\&logo=node.js)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791?style=for-the-badge\&logo=postgresql)
![Prisma](https://img.shields.io/badge/ORM-Prisma-2D3748?style=for-the-badge\&logo=prisma)
![Socket.IO](https://img.shields.io/badge/Realtime-Socket.IO-black?style=for-the-badge\&logo=socket.io)

### 🚀 Real-Time Task Management Platform for Modern Teams

TaskForge is a production-ready task management platform designed to help teams organize projects, manage workflows, track progress, and collaborate efficiently through real-time synchronization. The platform combines modern project management capabilities with instant updates, analytics, and team productivity tools to create a seamless collaborative experience.

</div>

---

# ✨ Features

## 📋 Task Management

* Create, update, and delete tasks
* Organize tasks across workflow stages
* Priority-based task management
* Task categorization system
* Detailed task descriptions
* Attachment support for tasks

## ⚡ Real-Time Collaboration

* Instant task synchronization
* Live updates using WebSockets
* Multi-user collaboration
* Automatic board refresh
* Real-time workflow tracking
* Shared workspace experience

## 📊 Productivity Analytics

* Task completion statistics
* Progress tracking dashboard
* Status-based insights
* Priority distribution analysis
* Category-wise task tracking
* Team productivity monitoring

## 🔎 Search & Filtering

* Search tasks instantly
* Filter by status
* Filter by priority
* Filter by category
* Fast task discovery
* Optimized user workflow

## 📁 File Management

* Upload task attachments
* Cloudinary integration
* Secure file storage
* Attachment management
* File persistence support

## 🎨 Modern User Experience

* Responsive design
* Drag-and-drop functionality
* Interactive Kanban board
* Clean UI architecture
* Mobile-friendly interface
* Fast and intuitive navigation

---

# 🛠️ Tech Stack

## Frontend

* React.js
* JavaScript
* Vite
* Axios
* CSS3

## Backend

* Node.js
* Express.js
* REST API Architecture

## Database

* PostgreSQL
* Prisma ORM
* Neon Database

## Real-Time Technologies

* Socket.IO
* WebSockets

## Cloud Services

* Cloudinary
* Render Deployment

---

# 📂 Project Structure

```bash
TaskForge/
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── services/
│   └── utils/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── socket/
│   │   └── services/
│   │
│   ├── prisma/
│   └── uploads/
│
└── README.md
```

---

# 🚀 Installation & Setup

## 1️⃣ Clone Repository

```bash
git clone https://github.com/shahid-shaikh-001/TaskForce.git

cd TaskForce
```

---

## 2️⃣ Backend Setup

```bash
cd backend

npm install
```

Create `.env` file:

```env
DATABASE_URL=
DIRECT_URL=

PORT=5000

CLIENT_URL=http://localhost:5173

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Run migrations:

```bash
npx prisma migrate dev
```

Generate Prisma Client:

```bash
npx prisma generate
```

Start backend:

```bash
npm run dev
```

---

## 3️⃣ Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Open:

```txt
http://localhost:5173
```

---

# 🌐 Live Demo

## 🚀 Live Website

https://task-force-nine.vercel.app

## 📦 GitHub Repository

https://github.com/shahid-shaikh-001/TaskForce

---

# 📊 Core Modules

## Task Engine

* Task creation
* Task updates
* Task deletion
* Workflow management
* Status tracking

## Real-Time Engine

* Socket.IO integration
* Live synchronization
* Event broadcasting
* Connected client updates

## Analytics Engine

* Task statistics
* Completion metrics
* Productivity tracking
* Workflow insights

## Attachment Engine

* Cloudinary uploads
* Secure storage
* File management
* Attachment persistence

---

# 📸 Screenshots

Add screenshots inside:

```txt
frontend/public/screenshots/
```

Example:

```md
<img src="https://raw.githubusercontent.com/shahid-shaikh-001/TaskForce/main/frontend/public/screenshots/dashboard.png" width="100%" />

<img src="https://raw.githubusercontent.com/shahid-shaikh-001/TaskForce/main/frontend/public/screenshots/board.png" width="100%" />

<img src="https://raw.githubusercontent.com/shahid-shaikh-001/TaskForce/main/frontend/public/screenshots/analytics.png" width="100%" />
```

---

# 📈 Project Highlights

✅ Real-Time Task Synchronization

✅ Drag-and-Drop Workflow Management

✅ PostgreSQL + Prisma Architecture

✅ Socket.IO WebSocket Integration

✅ Cloudinary File Uploads

✅ Analytics Dashboard

✅ Search & Filtering System

✅ Production-Ready Full Stack Architecture

---

# 🎯 Future Improvements

* Team Workspaces
* User Authentication
* Project Management Module
* Activity Timeline
* Notifications System
* Team Chat Integration
* AI Productivity Assistant
* Calendar Integration
* Email Notifications

---

# 👨‍💻 Author

## Shahid Shaikh

GitHub: https://github.com/shahid-shaikh-001

---

# ⭐ Support

If you found this project useful, give it a ⭐ and support its development.

---

# 📜 License

This project is licensed under the MIT License.
