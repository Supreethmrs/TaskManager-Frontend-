# ⚡ TaskForge HQ Pro

> **Ultra-Fast, Gamified Cyberpunk Productivity Suite for Gen-Z Developers & Power Users.**

Built with **React + TypeScript (Vite)**, **Express.js**, **Prisma 7 ORM**, and **PostgreSQL**.

---

## 🎨 4 Gen-Z Cyber Themes
- **🧪 Acid Glitch / Cyber Matrix**: Electric acid lime (`#ccff00`), electric cyan, dark slate void.
- **🌆 Neon Tokyo / Synthwave**: Hot magenta (`#ff007f`), cyber purple, deep obsidian.
- **🍏 Brat & Charcoal**: Minimalist brat green (`#8ace00`), pitch charcoal, chrome silver borders.
- **🌸 Y2K Dreamcore**: Soft pearl white, barbie pink (`#ff2a85`), pastel sky blue.

---

## 🚀 Key Features

1. **⌨️ Command Palette (`Ctrl + K` / `Cmd + K`)**: Instant keyboard search, theme switching, and quick task actions.
2. **📋 Drag-and-Drop Kanban Board**: 4 workflow stages (`To-Do`, `In Progress`, `In Review`, `Cleared`) with instant DB sync and XP gain.
3. **🤖 AI Quest Decomposer**: Click **⚡ AI Breakdown** to automatically split any big goal into actionable checklist steps.
4. **🎧 Cyber Focus Clock & Ambient Audio**: Generative Web Audio synthesizer with *Cyber Rain*, *Deep Space (432Hz)*, *Neo-Tokyo Cafe*, and *Synthwave Chill*.
5. **🔁 Smart Recurring Quests**: Repeat rules (`Daily`, `Weekdays`, `Weekly`, `Monthly`) that auto-spawn the next occurrence upon completion.
6. **🏆 Trophy Vault & Badges**: Unlockable milestone badges with progress tracking and player rankings.
7. **🎮 Bidirectional XP & Streak Engine**: Priority-tiered XP awards with instant reversal on unchecking and streak protection.
8. **⏱️ Chrono Capsule & Overdue Roasts**: Minute-level deadline precision with funny hover roast tooltips.
9. **📤 1-Click Export Suite**: Export to **CSV Spreadsheet**, **Markdown Report**, or **JSON Backup**.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React 18, TypeScript, Vite, Vanilla CSS Design System, Web Audio API.
- **Backend**: Node.js, Express.js, JWT Authentication, bcrypt.
- **Database & ORM**: PostgreSQL (Neon Serverless), Prisma 7 with `@prisma/adapter-pg`.

---

## 🏁 Getting Started

### 1. Clone & Install Dependencies

```bash
git clone <YOUR_REPO_URL>
cd PTM

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment

Create a `.env` file in `backend/`:
```env
DATABASE_URL="your-postgresql-connection-string"
JWT_SECRET="your-jwt-secret-key"
```

### 3. Sync Database

```bash
cd backend
npx prisma db push
npx prisma generate
```

### 4. Run Development Servers

**Backend:**
```bash
cd backend
node server.js
# Server running at http://localhost:3000
```

**Frontend:**
```bash
cd frontend
npm run dev
# Frontend running at http://localhost:5173
```
