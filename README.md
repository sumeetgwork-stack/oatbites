<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Razorpay-Payments-0C2451?style=for-the-badge&logo=razorpay&logoColor=white" />
  <img src="https://img.shields.io/badge/Google-OAuth-4285F4?style=for-the-badge&logo=google&logoColor=white" />
</p>

<h1 align="center">🌾 Oatbites by SEJ</h1>

<p align="center">
  <strong>A professional, high-performance e-commerce storefront for artisan oat-based products.</strong><br/>
  Featuring advanced UX patterns, multi-language support, and a robust admin infrastructure.
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-user-experience">UX Patterns</a> •
  <a href="#-admin-panel">Admin Panel</a> •
  <a href="#-deployment">Deployment</a>
</p>

---

## ✨ Features

### 🛍️ Customer Experience
- **Flipkart-Style Dashboard** — Complete user profile management with multiple shipping addresses, order tracking, and account security.
- **Amazon-Style Navigation** — Dynamic "Deliver to" dropdown in the header with recipient name detection and bottom-sheet interface on mobile.
- **Multi-Language Support** — Seamlessly switch between **English** and **Hindi** with persistent locale detection.
- **Smart Checkout** — Automatic shipping address detection based on navbar selection, integrated with Razorpay.
- **Premium UI** — Modern design system with smooth transitions, optimized for all screens from 320px to 4K.

### 👑 Admin Dashboard (Hardened)
- **Deep User Insights** — View detailed customer profiles including full address history and join metadata.
- **Enhanced Order Management** — Detailed shipping breakdowns for every order, including exact recipient and delivery location used.
- **Inventory Control** — Real-time stock tracking and product lifecycle management.
- **Role-Based Security** — Hardened admin routes protected by email-based server-side authorization.

### ⚡ Technical Excellence
- **Next.js 15 App Router** — Utilizing the latest React features and server-side optimizations.
- **Dynamic Address Sync** — Real-time state synchronization between user profile, navbar, and checkout flow.
- **Mobile First** — Ultra-optimized mobile navbar with single-row layout and bottom-sheet interactive elements.
- **Secure Payments** — Production-ready Razorpay integration with HMAC signature verification.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 15 (App Router) |
| **Frontend** | React 19, Vanilla CSS (Modern Design System) |
| **Authentication** | NextAuth.js v5 (Google OAuth + Credentials) |
| **Database** | MongoDB Atlas (Cloud NoSQL) |
| **Payments** | Razorpay (Production Integrated) |
| **Localization** | Custom i18n System (EN/HI) |
| **Deployment** | Vercel (Optimized CI/CD) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) Cluster
- [Google Cloud](https://console.cloud.google.com) OAuth Credentials
- [Razorpay](https://razorpay.com) API Keys

### Installation

```bash
# Clone and install
git clone https://github.com/sumeetgwork-stack/oatbites.git
cd oatbites
npm install

# Run development server
npm run dev
```

### Environment Configuration

```env
AUTH_GOOGLE_ID=xxx
AUTH_GOOGLE_SECRET=xxx
AUTH_SECRET=xxx
RAZORPAY_KEY_ID=xxx
RAZORPAY_KEY_SECRET=xxx
NEXT_PUBLIC_RAZORPAY_KEY_ID=xxx
ADMIN_EMAIL=your@email.com
MONGODB_URI=mongodb+srv://...
```

---

## 📁 Project Structure

- `src/app/dashboard` — 📋 Flipkart-style user account management.
- `src/app/admin` — 👑 Enhanced administrative oversight.
- `src/components/Header` — 📍 Advanced Amazon-style address navigation.
- `src/app/checkout` — 💳 Sync-aware shipping and payment logic.
- `src/app/api` — 🔌 Robust backend infrastructure.

---

## 🌐 Deployment

This project is fully optimized for **Vercel**. 

> **Tip:** Ensure your Vercel deployment URL is added to the Google OAuth Authorized Redirect URIs in your Cloud Console.

---

## 📄 License

Project developed for **Oatbites by SEJ**.

---

<p align="center">
  <strong>Crafted with ❤️ by Sumeet Gupta</strong><br/>
  <sub>Next.js • MongoDB • Razorpay • i18n</sub>
</p>
