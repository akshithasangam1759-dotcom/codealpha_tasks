# ◈ IvoryFits — Luxury Fashion E-Commerce

A full-stack luxury fashion e-commerce website with an elegant, premium design.

---

## 🚀 Quick Start

### Option A: Open frontend directly (no backend needed)
1. Open `frontend/index.html` in your browser
2. Everything works — products, cart, auth, admin, chatbot all run locally

### Option B: Full Stack with Node.js + MySQL

#### Prerequisites
- Node.js 18+
- MySQL (optional — falls back to in-memory if unavailable)

#### Setup

```bash
# 1. Install backend dependencies
cd backend
npm install

# 2. (Optional) Set up MySQL
# Create database: CREATE DATABASE ivoryfits;
# Tables are auto-created on first run

# 3. Configure environment (optional)
# Create backend/.env:
DB_HOST=localhost
DB_USER=root
DB_PASS=yourpassword
DB_NAME=ivoryfits
JWT_SECRET=your_secret_key
PORT=3000

# 4. Start the server
npm start
# or for development:
npm run dev

# 5. Open browser: http://localhost:3000
```

---

## 📁 Project Structure

```
ivoryfits/
├── frontend/
│   ├── index.html          # Main HTML (all pages in one SPA)
│   ├── css/
│   │   └── style.css       # All styles — luxury design system
│   └── js/
│       └── app.js          # All frontend logic
├── backend/
│   ├── server.js           # Express server + all API routes
│   └── package.json
└── README.md
```

---

## 🔑 Features

### User Features
- **Authentication** — Sign up / Login with JWT tokens
- **Product Browsing** — Filter by category, price, sort options
- **Search** — Real-time product search overlay
- **Product Detail** — Quick view modal with size selection
- **Shopping Cart** — Add/remove/update quantities, persisted in localStorage
- **Checkout** — Multi-step with shipping details + order confirmation
- **AI Chatbot** — Personal stylist with smart fashion responses

### Admin Features
- Login with: `admin@ivoryfits.com` / `admin123`
- Add / Edit / Delete products
- View and manage orders
- Mark orders as shipped

### Design Features
- Light / Dark mode toggle
- Fully responsive (mobile, tablet, desktop)
- Smooth animations and micro-interactions
- Luxury color palette (black, ivory, gold)
- CSS silhouette art for fashion visuals

---

## 🗄 Database Schema

### users
| Column | Type |
|--------|------|
| id | INT AUTO_INCREMENT |
| name | VARCHAR(100) |
| email | VARCHAR(150) UNIQUE |
| password | VARCHAR(255) |
| is_admin | BOOLEAN |
| created_at | TIMESTAMP |

### products
| Column | Type |
|--------|------|
| id | INT AUTO_INCREMENT |
| name | VARCHAR(200) |
| category | VARCHAR(50) |
| price | DECIMAL(10,2) |
| description | TEXT |
| image | VARCHAR(500) |
| stock | INT |
| sizes | VARCHAR(200) |
| badge | VARCHAR(50) |
| color | VARCHAR(20) |

### orders
| Column | Type |
|--------|------|
| id | VARCHAR(50) PRIMARY KEY |
| user_email | VARCHAR(150) |
| items | JSON |
| total | DECIMAL(10,2) |
| shipping | JSON |
| status | VARCHAR(50) |
| created_at | TIMESTAMP |

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login user |
| GET | /api/products | List all products |
| GET | /api/products/:id | Get single product |
| POST | /api/products | Add product |
| PUT | /api/products/:id | Update product |
| DELETE | /api/products/:id | Delete product |
| POST | /api/orders | Place order |
| GET | /api/orders | List orders |
| POST | /api/chat | AI chatbot message |

---

## 🎨 Design System

- **Fonts**: Cormorant Garamond (display) + Montserrat (body)
- **Colors**: `#0a0a0a` bg · `#f5f0e8` ivory · `#c9a96e` gold
- **Theme**: CSS custom properties — seamless light/dark switching
- **Animations**: CSS keyframes + IntersectionObserver reveals
