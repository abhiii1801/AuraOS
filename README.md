# AuraOS

AuraOS is a dynamic, multi-agent AI operating system designed to manage your life with premium aesthetics, smart automation, and real-time insights.

This repository contains both the frontend dashboard and the automated agentic backend that powers AuraOS.

## Project Structure

This project is a monorepo that houses two main components:

- **`aura-os-backend/`**: A Python-based agentic backend handling AI logic, data routing, scheduled tasks (e.g., Telegram bots, Google Calendar integration, Notion synchronization), and API endpoints via FastAPI/Uvicorn.
- **`aura-os-frontend/`**: A modern Next.js React frontend built with TailwindCSS, Shadcn UI, and Recharts. It features a deep-dark mode interface, premium blur-fade transitions, and dynamic, responsive layouts.

## Getting Started

### Backend Setup
1. Navigate to the backend directory: `cd aura-os-backend`
2. Create and activate a virtual environment:
   - Windows: `python -m venv venv` and `venv\Scripts\activate`
   - Mac/Linux: `python3 -m venv venv` and `source venv/bin/activate`
3. Ensure required packages are installed (`pip install -r requirements.txt` if available).
4. Make sure `.env` contains your API Keys.
5. Run the backend server: `python main.py` or use `uvicorn main:app --reload`

### Frontend Setup
1. Navigate to the frontend directory: `cd aura-os-frontend`
2. Install dependencies: `npm install`
3. Ensure `aura-os-frontend/.env.local` or `.env` has appropriate configurations (like pointing to the backend API).
4. Run the development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Architecture & Design
AuraOS is designed with aesthetics and functionality as equal priorities. The UI components are fully modular, ensuring clear separation of concerns, and feature real-time syncing mechanisms driven by intelligent backend sub-agents (e.g., Health, Second Brain, Finance, Calendar).

## Deployment
Both frontend and backend are maintained within this single repository to simplify deployment (such as linking a Vercel frontend to a deployed Render/Railway backend).
