# 💸 Dange - Subscription & Recurring Expense Manager

Dange is a modern, full-stack recurring expense and subscription tracking application built with a decoupled architecture. It helps users monitor active recurring costs, keep track of upcoming renewals with automated countdowns, and gain insights into their spending habits broken down by categories.

---

## 🚀 Key Features

- **Full Subscription Lifecycle (CRUD):** Create, view, update, and delete subscription records with instant UI feedback.
- **Smart Renewal Tracking:** Real-time countdown to the next payment date with automatic overdue detection badges.
- **Instant Status Toggle:** One-click active/paused state toggling that recalculates monthly budgets on the fly.
- **Category Expense Breakdown:** Visual normalized monthly expense distribution with dynamic progress bars.
- **Live Search & Filter:** Instant client-side search by service name and dynamic category pill filtering.
- **Modern Dark UI:** Responsive and accessible dark-themed interface built with Tailwind CSS and Lucide icons.
- **Self-Documenting API:** Interactive OpenAPI and Swagger documentation powered by FastAPI.

---

## 🛠️ Tech Stack & Architecture

### Backend
- **Framework:** FastAPI (Python 3.10+)
- **ORM & Database:** SQLAlchemy with SQLite
- **Data Validation & Serialization:** Pydantic v2
- **CORS Handling:** FastAPI CORSMiddleware
- **API Spec:** OpenAPI / Swagger UI

### Frontend
- **Framework:** Next.js (App Router, Turbopack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **HTTP Client:** Native Fetch API with typed service layer

---

## 📁 Project Structure
```text
dange-app/
├── app/                      # Backend API (FastAPI)
│   ├── database.py           # SQLite connection & session management
│   ├── models.py             # SQLAlchemy ORM models
│   ├── schemas.py            # Pydantic schemas for request/response validation
│   ├── crud.py               # Database queries and business logic
│   └── main.py               # API route definitions and CORS setup
├── frontend/                 # Frontend client (Next.js & TypeScript)
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx    # Root layout
│   │   │   └── page.tsx      # Main single-page interactive dashboard
│   │   └── services/
│   │       └── api.ts        # Typed API integration client
│   ├── package.json
│   └── tailwind.config.ts
├── requirements.txt          # Python backend dependencies
└── README.md                 # Project documentation