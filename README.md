# CodeForge | Elite DSA & System Design Coding Platform

CodeForge is a professional, production-ready coding preparation and competitive programming platform inspired by VS Code and LeetCode. Built using a modern MERN stack (React, Redux, Node, Express, MongoDB) with TypeScript, it includes a Monaco editor workspace, multi-language compiler testing, WebSocket multiplayer sharing, resume scans, roadmaps, and discussion forums.

Designed to display premium software engineering practices for developer portfolios.

## 🔗 Live Deployments
- **Frontend Site (Vercel):** [https://codeforge-two-coral.vercel.app](https://codeforge-two-coral.vercel.app)
- **Backend Server (Render):** [https://codeforge-backend-1eg8.onrender.com](https://codeforge-backend-1eg8.onrender.com)

## Developer Credentials
- **Name:** PODUGU MUKESH
- **Email:** [mukeshpodugu123@gmail.com](mailto:mukeshpodugu123@gmail.com)
- **Phone:** 8143999463
- **LinkedIn:** [LinkedIn Profile](https://www.linkedin.com/in/podugu-mukesh-1575a32b4/)
- **GitHub:** [GitHub Repositories](https://github.com/mukeshpodugu)

---

## 🚀 Key Features

1. **Integrated VS Code-like Workspace**: Side-by-side split screen housing markdown descriptions, public example test inputs, a Monaco code editor with brace matching/tabs, language pickers, and run/submit output consoles.
2. **Dynamic Live Sync Rooms**: Share coding tasks in real-time. Join a session using a WebSocket channel (`Socket.IO`) to synchronize code lines and active users list immediately.
3. **Advanced AI Auditor**: Generates automatic code reviews post-submission detailing time and space complexity evaluations (Big O notation), syntax analyses, potential bug spots, and performance optimization pointers.
4. **Mock ATS Resume Scorer**: paste skills inventory and job experience terms to calculate ATS match percentages, identify missing tech skills, and suggest formatting optimizations.
5. **Interactive Interview Simulator**: Engage in live technical, algorithms, and HR behavioral mock interview dynamic chat sessions, receiving confidence scores.
6. **Timeline Roadmap Compiler**: Charts personalized phase-by-phase learning paths based on skills tier, weak topic list, and candidate target career goals.
7. **Social Discussion Boards & Contests**: Upvote and comment on developer posts, or register for weekly scoring contests with live leaderboards.

---

## 🛠️ Technology Stack & Architectures

- **Frontend client**: Vite React 18, TypeScript, Tailwind CSS, Redux Toolkit, Monaco Editor API, Socket.IO Client.
- **Backend service**: Node.js, Express.js, TypeScript, Mongoose ORM, Socket.IO Server.
- **Database model**: MongoDB (Atlas or Local Server).
- **Graceful DB Failover**: Connects to MongoDB if a URI is provided. If MongoDB is offline, it degrades gracefully to a persistent, file-based JSON repository (`db.json`) enabling immediate operation without installing databases!

---

## ⚙️ Environment Configurations

Create a `.env` file under the `/backend` folder:
```env
PORT=5000
JWT_SECRET=your_jwt_secret_here
MONGODB_URI=your_mongodb_uri_here
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=development
```

---

## 🔌 API Route Mappings

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| **POST** | `/api/auth/register` | Register new profile account | No |
| **POST** | `/api/auth/login` | Secure password login (jwt token issue) | No |
| **GET** | `/api/auth/profile` | Query statistics, solved lists, calendar | Yes |
| **GET** | `/api/problems` | List problems matching filter query | Yes |
| **GET** | `/api/problems/:slug` | Query specific templates and examples | Yes |
| **POST** | `/api/problems/run` | Execute custom compiler code input | Yes |
| **POST** | `/api/problems/submit` | Submit code to verify test suites & run AI review | Yes |
| **GET** | `/api/contests` | List active competitive events | Yes |
| **POST** | `/api/contests/:id/join` | Enroll participant in contest | Yes |
| **GET** | `/api/discussions` | Query discussion forum threads list | Yes |
| **POST** | `/api/discussions/:id/vote` | Toggle upvote/downvote ranking | Yes |
| **POST** | `/api/ai/analyze-resume` | Parse resume and generate ATS scoring report | Yes |
| **POST** | `/api/ai/interview/chat` | Dynamically exchange interview messages | Yes |
| **POST** | `/api/ai/roadmap` | Create customized study path | Yes |
| **GET** | `/api/portfolio/info` | Fetch static portfolio details of Mukesh | No |
| **POST** | `/api/portfolio/contact` | Submit hiring query to contacts log | No |

---

## 💻 Running Locally

### 1. Start Backend Server
```bash
cd backend
npm install
npm run dev
```
*Console logs will confirm port 5000 is open, and if MongoDB is Connected or falling back to local JSON.*

### 2. Start Frontend App
```bash
cd ../frontend
npm install
npm run dev
```
*Vite will compile and launch the dashboard portal on `http://localhost:3000`.*
