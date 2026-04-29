<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Razorpay-Payments-0C2451?style=for-the-badge&logo=razorpay&logoColor=white" />
  <img src="https://img.shields.io/badge/Google-OAuth-4285F4?style=for-the-badge&logo=google&logoColor=white" />
</p>

<h1 align="center">🌾 Oatbites by SEJ</h1>

<p align="center">
  <strong>A premium, full-stack e-commerce storefront for artisan oat-based products.</strong><br/>
  Built with Next.js 16, MongoDB Atlas, Razorpay Payments & Google OAuth.
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-project-structure">Structure</a> •
  <a href="#-admin-panel">Admin Panel</a> •
  <a href="#-deployment">Deployment</a>
</p>

---

## ✨ Features

### 🛍️ Customer Experience
- **Beautiful Glassmorphic UI** — Premium, modern design with smooth animations and micro-interactions
- **Product Catalog** — Browse 6+ handcrafted oat products with detailed descriptions and imagery
- **Smart Cart** — Persistent cart with background price synchronization to prevent stale pricing
- **Secure Checkout** — Full shipping address form with Razorpay payment gateway integration
- **Order Tracking** — Real-time order status updates visible on the user dashboard
- **Google Sign-In** — One-click authentication via Google OAuth 2.0

### 👑 Admin Dashboard
- **Analytics Overview** — Live stats for total orders, revenue, users, and products
- **Product Management** — Full CRUD operations with stock tracking (add, edit, delete products)
- **Order Management** — View all orders, update statuses (Pending → Processing → Shipped → Delivered)
- **User Management** — View all registered users with profile pictures, roles, and join dates
- **Role-Based Access** — Admin-only routes protected by email-based authorization

### ⚡ Technical Highlights
- **Server-Side Rendering** — Next.js 16 App Router with Turbopack for blazing-fast builds
- **Cloud Database** — MongoDB Atlas with connection pooling optimized for serverless
- **Payment Security** — Razorpay signature verification using HMAC SHA-256
- **Responsive Design** — Fully optimized for desktop, tablet, and mobile (down to 320px)
- **Live Price Sync** — Background reconciliation ensures cart prices always match the database

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router + Turbopack) |
| **Frontend** | React 19, Vanilla CSS (Glassmorphism) |
| **Authentication** | NextAuth.js v5 (Google OAuth + Credentials) |
| **Database** | MongoDB Atlas (Cloud NoSQL) |
| **Payments** | Razorpay (INR Gateway) |
| **Typography** | Google Fonts (Outfit) |
| **Deployment** | Vercel (Serverless) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster (free tier works)
- [Google Cloud Console](https://console.cloud.google.com) OAuth credentials
- [Razorpay](https://razorpay.com) account (test mode for development)

### Installation

```bash
# Clone the repository
git clone https://github.com/sumeetgwork-stack/oatbites.git
cd oatbites

# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
# Google OAuth 2.0
AUTH_GOOGLE_ID=your_google_client_id
AUTH_GOOGLE_SECRET=your_google_client_secret

# NextAuth Secret
AUTH_SECRET=your_random_secret_string

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx

# Admin Email (this email gets admin access)
ADMIN_EMAIL=your_admin_email@gmail.com

# MongoDB Atlas
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/oatbites
```

### Run Locally

```bash
# Start the development server
npm run dev

# Open http://localhost:3000
```

### Migrate Seed Data (Optional)

```bash
# Upload sample products, users & orders to MongoDB
node migrate.js
```

---

## 📁 Project Structure

```
oatbites/
├── public/
│   └── images/products/        # Product photography
├── src/
│   ├── app/
│   │   ├── admin/              # 👑 Admin dashboard, products, orders, users
│   │   ├── api/                # 🔌 REST API routes
│   │   │   ├── admin/          #    Admin-only endpoints
│   │   │   ├── auth/           #    NextAuth + registration
│   │   │   └── orders/         #    Order creation & verification
│   │   ├── checkout/           # 💳 Shipping & payment flow
│   │   ├── dashboard/          # 📊 User order history
│   │   ├── login/              # 🔐 Authentication page
│   │   ├── products/           # 🛍️ Product catalog & detail pages
│   │   ├── globals.css         # 🎨 Complete design system
│   │   ├── layout.js           # Root layout with providers
│   │   └── page.js             # Homepage with hero & featured products
│   ├── components/             # Reusable UI components
│   ├── context/                # React Context (Auth + Cart)
│   ├── data/                   # JSON seed data (pre-migration)
│   └── lib/                    # Database & auth utilities
│       ├── db.js               # MongoDB CRUD operations
│       └── mongodb.js          # Connection pooling
├── migrate.js                  # One-time data migration script
└── .env                        # Environment variables (not committed)
```

---

## 👑 Admin Panel

Access the admin dashboard by logging in with the email specified in `ADMIN_EMAIL`.

| Feature | Route | Description |
|---|---|---|
| **Dashboard** | `/admin` | Overview stats + quick navigation |
| **Products** | `/admin/products` | Add, edit, delete products with stock tracking |
| **Orders** | `/admin/orders` | View & update order statuses |
| **Users** | `/admin/users` | View all registered users |

---

## 💳 Payment Flow

```
Customer adds items to cart
        ↓
Fills shipping address at /checkout
        ↓
Backend creates Razorpay order (server-side)
        ↓
Razorpay checkout popup opens (client-side)
        ↓
Customer completes payment
        ↓
Backend verifies signature (HMAC SHA-256)
        ↓
Order status updated to "Paid" in MongoDB
        ↓
Customer redirected to confirmation page
```

---

## 🌐 Deployment

This project is optimized for **Vercel**:

1. Push code to GitHub
2. Import the repo on [vercel.com](https://vercel.com)
3. Add all environment variables
4. Deploy — done!

> **Important:** After deploying, add your Vercel URL to Google Cloud Console → OAuth → Authorized redirect URIs:
> `https://your-app.vercel.app/api/auth/callback/google`

---

## 📄 License

This project is built for **Oatbites by SEJ**. All rights reserved.

---

<p align="center">
  <strong>Built with ❤️ by Sumeet Gupta</strong><br/>
  <sub>Powered by Next.js • MongoDB • Razorpay</sub>
</p>
