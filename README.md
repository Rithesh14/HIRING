# TechHire Analytics — Hiring Assessment Platform (React + TypeScript + Vite)

TechHire Analytics is a **modern hiring assessment platform** designed for evaluating candidates through **DSA coding challenges**, **aptitude tests**, and **interview simulations**. It provides **real-time analytics dashboards**, progress tracking, and a responsive UI for recruiters and candidates.

---

## ✨ Features

### 🧠 Assessment Modules
- **DSA Assessment**  
  - Monaco Editor (VS Code-like experience)  
  - Real-time code execution (mocked)  
  - Multi-language support: JavaScript, Python, Java, C++  
  - Progress tracking  

- **Aptitude Test**  
  - 25 quantitative, logical, and verbal reasoning questions  
  - Timer, navigation, and mark-for-review functionality  
  - Automatic scoring with penalties for incorrect answers  

- **Interview Round**  
  - Voice-recorded responses using the **Web Speech API**  
  - Transcript generation and playback  
  - Feedback on clarity, pace, and length of responses  

---

### 📊 Analytics Dashboard
- **Visualizations** (using Recharts) for:
  - DSA topic performance (bar chart)  
  - Aptitude category scores (radar chart)  
  - Accuracy trends (line chart)  
  - Difficulty-level breakdowns  
- Identifies **strengths and weaknesses** with personalized recommendations  

---

### 🔑 User Flow
- Mock **login/register** with Context API  
- **Protected routes** using React Router v6  
- **LocalStorage** persistence for user progress  

---

### 🎨 UI/UX
- **Tailwind CSS** for styling (responsive and modern design)  
- **Lucide React** icons for a professional look  
- Progress rings, interactive charts, and a clean layout  

---

## 🛠️ Tech Stack
| Category       | Technology                          |
|-----------------|-----------------------------------|
| **Frontend**    | React 18, TypeScript, Vite         |
| **Routing**     | React Router v6                    |
| **State**       | Context API                        |
| **Styling**     | Tailwind CSS, Lucide React Icons    |
| **Charts**      | Recharts                           |
| **Code Editor** | @monaco-editor/react                |
| **Speech**      | Web Speech API                      |
| **Linting**     | ESLint (flat config)                |

---

## 📁 Project Structure
developer1503-hiring/
└── FRONTEND/
├── public/ # Static assets
├── src/
│ ├── components/ # Reusable UI components
│ ├── contexts/ # Global state (AppContext)
│ ├── data/ # Mock data (questions, analytics)
│ ├── pages/ # Pages (Dashboard, Assessments, etc.)
│ ├── types/ # TypeScript interfaces
│ ├── utils/ # Helper utilities (localStorage sync)
│ ├── App.tsx # Router setup
│ ├── main.tsx # App entry point
│ └── index.css # Tailwind base styles
├── tailwind.config.js # Tailwind configuration
├── vite.config.ts # Vite configuration
├── package.json # Dependencies and scripts
└── eslint.config.js # ESLint configuration

---

## 🚀 Getting Started

### 1️⃣ Clone the repository  
```bash
git clone https://github.com/your-username/techhire-analytics.git
cd techhire-analytics/FRONTEND
2️⃣ Install dependencies
npm install

3️⃣ Start the development server
npm run dev
