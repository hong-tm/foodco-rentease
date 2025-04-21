# 🏢 Ming Ming Food Court RentEase

A streamlined rental management platform for food courts, designed to efficiently manage stalls, tenants, finances, and feedback.

---

## 🖥️ System Overview

### **Core Features**

- **Role-Based Access Control**: Differentiated access for **admin**, **renral**, and **user** (Potential Tenants).
- **Responsive Design**: Mobile-friendly, bento-style layout for seamless navigation.
- **Comprehensive Modules**: Dashboard, Stall, Tenant, Finance, Feedback, and Analytics.

### **Tech Stack**

#### Frontend:

- **UI Components**: shadcn/ui, Framer Motion, Aceternity UI, Hyper UI
- **Styling**: Tailwind CSS
- **Notifications**: Sonner toast system
- **State Management**: Tanstack Query
- **Responsive Magic UI**: Designed for optimal user experience.

#### Backend:

- **Framework**: Hono.js with TypeScript
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: Better-auth with Custom role-based system, Google OAuth, and email verification.
- **Payment Processing**: Stripe for secure payments.
- **Security**: Cloudflare Turnstile.
- **Deployment**: Nginx with aaPanel for server management.
- **Email Services**: Resend API for notifications and alerts.

---

## 🌟 Detailed Features

### 📊 Owner Dashboard

- **Key Metrics Overview**: Rent reports, income/expenses, vacancy rates, tenant performance.
- **Real-Time Notifications**: Lease renewals and rent due reminders.
- **Data Insights**: Occupancy trends, rental seasonality, payment history.

### 🏠 Stall Management

- **Interactive Visual Grid**: Real-time status of stalls (vacant/rented).
- **Management Tools**: Edit stall details, upload images, view rent history.
- **Pricing Tiers**: Low, Medium, High.

### 👥 Tenant System

- **Comprehensive Profiles**: Track lease agreements and contact details.
- **Ban Management**: Handle tenant violations.
- **Tenant Insights**: Analyze performance metrics.

### 💸 Financial Management

- **Integrated Stripe Payments**: Secure payment processing and late fee handling.
- **Automated Invoicing**: Generate and track payment history.
- **Detailed Reports**: Revenue tracking and exportable financial data.

### 📝 Feedback System

- **Happiness Ratings**: 1-4 scale for tenant feedback.
- **Detailed Reviews**: Stall-specific feedback and responses.
- **Accessible Submission**: Only non-logged-in users can submit feedback.

### 🔔 Notification Center

- **Appointment Scheduling**: Manage tenant interactions.
- **Alerts**: Email and real-time notifications for key updates.
- **Read/Unread Status**: Track communication effectively.

### 📄 Reporting & Analytics

- **Custom Reports**: Financials, maintenance logs, and tenant history.
- **Performance Metrics**: Stall occupancy and tenant reviews.

---

## 👥 User Roles

### **Rentals**

- **Features**: Manage rent payments, view/download contracts, and update profiles.
- **Convenience**: Real-time access to stall details and notifications.

### **Users**

- **Access**: Browse available stalls and apply for leases.
- **Make Payments**: Process payments to apply new leases.

### **Customer**

- **Feedback**: Submit feedback without account requirements.

---

## ⚙️ Development Setup

### Prerequisites:

- Node.js
- PostgreSQL
- Environment variables configuration

### Installation:

1. Clone the repository.
2. Install dependencies using `npm install`.
3. Configure `.env` file with required environment variables.
4. .env.example file is provided for reference.
5. Start the development server using `npm run dev`.

---

## Star History

<a href="https://www.star-history.com/#hong-tm/foodco-rentease&Date">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=hong-tm/foodco-rentease&type=Date&theme=dark" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=hong-tm/foodco-rentease&type=Date" />
   <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=hong-tm/foodco-rentease&type=Date" />
 </picture>
</a>
