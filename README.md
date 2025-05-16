# Investment Game

A web-based investment game built with TypeScript, featuring a plain JavaScript frontend and Express backend with SQLite database.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

1. **Node.js and npm** (Node Package Manager)
   - Download and install from [nodejs.org](https://nodejs.org/)
   - Recommended version: 18.x or later
   - Verify installation by running:
     ```bash
     node --version
     npm --version
     ```

2. **Git** (optional, for version control)
   - Download and install from [git-scm.com](https://git-scm.com/)

## Project Setup

1. **Install Dependencies**
   ```bash
   npm run install
   ```
   This will install dependencies for the root project, frontend, and backend.

2. **Development Mode**
   ```bash
   npm run dev
   ```
   This will start both frontend and backend in development mode:
   - Frontend will be available at: http://localhost:3000
   - Backend API will be available at: http://localhost:4000

3. **Running Frontend or Backend Separately**
   - For frontend only:
     ```bash
     npm run start:frontend
     ```
   - For backend only:
     ```bash
     npm run start:backend
     ```

4. **Building for Production**
   ```bash
   npm run build
   ```

## Project Structure

```
investment-game/
├── frontend/          # Frontend application
│   ├── src/          # Source files
│   └── public/       # Static files
├── backend/          # Backend application
│   ├── src/          # Source files
│   └── db/           # Database files
└── package.json      # Root package.json for project scripts
```

## Development Notes

- Frontend runs on port 3000
- Backend API runs on port 4000
- SQLite database file is stored in `backend/db/`
- Both frontend and backend use TypeScript for better type safety
- Hot-reloading is enabled for both frontend and backend in development mode
