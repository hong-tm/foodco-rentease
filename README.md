# FoodCo RentEase

<div align="center">
  <p>
    <a href="#features"><img src="https://img.shields.io/badge/FoodCo-RentEase-orange" alt="FoodCo RentEase" /></a>
    <a href="#license"><img src="https://img.shields.io/badge/License-MIT-green" alt="License" /></a>
    <a href="#tech-stack"><img src="https://img.shields.io/badge/TypeScript-5.5-3178C6" alt="TypeScript" /></a>
    <a href="#tech-stack"><img src="https://img.shields.io/badge/React-18.3-61DAFB" alt="React" /></a>
  </p>

![foodco-banner](https://github.com/user-attachments/assets/2c235832-f074-44b6-9c96-a78618a6ef9f)

  <h3>A streamlined rental management platform for food courts</h3>
</div>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#️-tech-stack">Tech Stack</a> •
  <a href="#-installation">Installation</a> •
  <a href="#-user-roles">User Roles</a> •
  <a href="#-star-history">Star History</a> •
  <a href="#-license">License</a>
</p>

---

## ✨ Welcome to FoodCo RentEase

**FoodCo RentEase** streamlines stall management, tenant relations, payment processing, and feedback collection through an intuitive interface. Built with modern technologies and designed with user experience in mind, this platform helps food court owners efficiently manage all aspects of their business.

**Feel free to distribute** this solution for food court rental management. We've designed it to be easily deployable, customizable, and scalable to meet the needs of various food court operations.

<details>
<summary><b>🔍 Key Benefits</b></summary>
<br>

- **Centralized Management** for all rental operations
- **Data-Driven Insights** for optimizing occupancy and revenue
- **Improved Tenant Relations** with streamlined communication
- **Secure Payment Processing** with Stripe integration

</details>

## 📚 Features

| Feature                 | Description                                |
| ----------------------- | ------------------------------------------ |
| **Owner Dashboard**     | Real-time metrics, analytics, and alerts   |
| **Stall Management**    | Visual grid layout with status tracking    |
| **Tenant System**       | Digital profiles and automated agreements  |
| **Payment Processing**  | Stripe integration with invoice automation |
| **Feedback System**     | Rating system with sentiment analysis      |
| **Notification Center** | Multi-channel communication hub            |

## 🛠️ Tech Stack

<details open>
<summary><b>Frontend</b></summary>
<br>

| Category             | Technologies                                      |
| -------------------- | ------------------------------------------------- |
| **Framework**        | React 18, TypeScript                              |
| **UI Components**    | shadcn/ui, Framer Motion, Aceternity UI, Hyper UI |
| **Styling**          | Tailwind CSS                                      |
| **State Management** | Tanstack Query                                    |
| **Routing**          | React Router DOM                                  |
| **Forms**            | React Hook Form, Zod                              |

</details>

<details open>
<summary><b>Backend</b></summary>
<br>

| Category               | Technologies              |
| ---------------------- | ------------------------- |
| **Framework**          | Hono.js, TypeScript       |
| **Database**           | PostgreSQL, Sequelize ORM |
| **Authentication**     | Better-auth, Google OAuth |
| **Payment Processing** | Stripe                    |
| **Security**           | Cloudflare Turnstile      |
| **Email Services**     | Resend                    |

</details>

## 🚀 Installation

<details>
<summary><b>Prerequisites</b></summary>
<br>

- Node.js (v18+)
- PostgreSQL (v14+)
- Stripe account
- Resend API key

</details>

### Quick Start

```bash
# Clone the repository
git clone https://github.com/hong-tm/foodco-rentease.git
cd foodco-rentease

# Install dependencies
cd fc-back && npm install
cd ../fc-front && npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your credentials

# Start development servers
cd fc-back && npm run dev

# In a new terminal
cd fc-front && npm run dev
```

## 👥 User Roles

| Role         | Capabilities                                            |
| ------------ | ------------------------------------------------------- |
| **Admin**    | Manage stalls, tenants, finances, analytics             |
| **Rental**   | Payment management, contract access, profile updates    |
| **User**     | Browse stalls, apply for lease, process initial payment |
| **Customer** | Submit feedback (no login required)                     |

## 📊 Star History

<a href="https://www.star-history.com/#hong-tm/foodco-rentease&Date">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=hong-tm/foodco-rentease&type=Date&theme=dark" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=hong-tm/foodco-rentease&type=Date" />
   <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=hong-tm/foodco-rentease&type=Date" />
 </picture>
</a>

## 📋 License

MIT License © [Hong TM](https://github.com/hong-tm)
