# BRILink Management System

A premium, state-of-the-art management system for BRILink agents to track transactions, calculate tiered fees, and manage daily investments.

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.x or higher
- **Docker**: Required for running the PostgreSQL database
- **npm** or **yarn**

### 1. Environment Setup
Create a `.env` file in the root directory and configure your database connection and NextAuth secret:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/brilink?schema=public"
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

### 2. Database Setup (Docker)
If you are using the included `docker-compose.yml`:
```bash
docker-compose up -d
```

### 3. Initialize Database & Client
Run these commands to sync your database with the Prisma schema and generate the client:
```bash
npx prisma generate
npx prisma db push
```

### 4. Seeding the Data
To populate the database with categories, tiered fee rules, and sample transactions:
```bash
npx prisma db seed
```
*Note: If you ever change the schema significantly, use `npx prisma db push --force-reset` before seeding.*

### 5. Running the App
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Default Credentials

| Username | Password | Role | Access |
| :--- | :--- | :--- | :--- |
| **admin** | **admin123** | Super Admin | Full System Access |
| **staff** | **staff123** | Admin | Dashboard & Today's Transactions |

---

## ✨ Key Features

### 📊 Tiered Fee Rule Engine
Configure complex fee structures for any transaction category:
- **Multiple Tiers**: Define different fees for different amount ranges (e.g., 0-100k, 100k-1M).
- **Dynamic Formulas**: Support for Fixed values, Percentages, and complex math expressions (e.g., `customer_fee - bri_fee`).
- **One Rule Per Category**: Enforced at the database level for data integrity.

### 🔐 Role-Based Access (RBAC)
- **Super Admin**: Can manage Fee Rules, View All-Time History, and Manage Investments.
- **Admin (Staff)**: Limited to today's transaction list and adding new transactions. Restricted from viewing configuration pages.

### 📝 Smart Transactions
- **Auto-calculation**: Select a category and enter an amount; the system automatically finds the correct tier and calculates all fees instantly.
- **Live Breakdown**: View exactly how the profit is split before saving.

---

## 🛠 Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS + Shadcn UI
- **State Management**: React Hook Form + Zod
- **Icons**: Lucide React
