# FoodCo RentEase

A comprehensive food court management system built as a monorepo.

## Repository Structure

```plaintext
foodco-rentease/
├── fc-back/           # Backend service
├── fc-front/          # Frontend application
└── README.md
```

## Backend Service (fc-back)

### Core Technologies

- **Framework**: Hono.js
- **Database**: PostgreSQL with Sequelize ORM
- **Language**: TypeScript
- **Key Services**:
  - Authentication via better-auth
  - Email services (Resend)
  - Payment processing (Stripe)
  - Turnstile verification

### Project Structure

```plaintext
fc-back/
├── db/
│   ├── initDB.ts
│   └── userModel.ts
├── lib/
│   ├── auth.js
│   ├── sharedType.ts
│   └── verifyuser.ts
├── routes/
│   ├── expensesRoute.ts
│   ├── feedbacksRoute.ts
│   ├── stallsRoute.ts
│   └── [other routes]
├── webpage/
│   ├── assets/
│   └── index.html
├── index.ts
├── env.ts
├── package.json
└── tsconfig.json
```

### Database Models

- User
- Account
- Stall
- Feedback
- Payment
- Utilities
- Notification
- StallTier

### API Routes

- `/api/expenses`
- `/api/feedbacks`
- `/api/users`
- `/api/stalls`
- `/api/notifications`
- `/api/payments`
- `/api/auth/*`

## Frontend Application (fc-front)

### Core Technologies

- **Framework**: React 18.3.1
- **Build Tool**: Vite
- **Styling**: TailwindCSS with Shadcn UI components
- **State Management**: React Query
- **Routing**: React Router
- **Validation**: Zod
- **Payment**: Stripe integration

### Project Structure

```plaintext
fc-front/
├── dist/               # Build output
├── public/             # Static assets
├── src/
│   ├── api/           # API integration layer
│   ├── components/    # React components
│   │   ├── animated/  # Animated components
│   │   ├── ui/        # UI components
│   │   └── blocks/    # Larger component blocks
│   ├── lib/           # Utility functions
│   ├── hooks/         # Custom React hooks
│   ├── pages/         # Page components
│   └── styles/        # Global styles
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## Core Functionalities

### User Management

- Authentication and authorization
- Role-based access control
- Profile management
- Session handling

### Stall Management

- Stall listing and details
- Rental status tracking
- Tier-based pricing
- Stall oversight

### Payment System

- Stripe integration
- Payment records
- Transaction history
- Utility payments

### Feedback System

- User feedback collection
- Happiness rating
- Stall-specific feedback
- Performance metrics

### Notification System

- User notifications
- Real-time updates
- Email notifications
- Appointment management
- Read status tracking

## Development Guidelines

### Code Quality

- TypeScript for type safety
- ESLint configuration for code consistency
- Component-based architecture
- Proper error handling

### Environment Configuration

- Authentication secrets
- Database credentials
- API keys (Stripe, Turnstile)
- Service URLs
- CORS settings

### API Integration

- Modular API structure
- Zod schema validation
- React Query for data fetching
- Comprehensive error handling

Would you like me to add or modify any specific sections of this documentation?
