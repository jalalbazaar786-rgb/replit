# BuildBidz - Construction Procurement Platform

## Overview

BuildBidz is a SaaS marketplace designed to streamline construction procurement. The platform connects construction companies, suppliers/contractors, and NGOs to facilitate competitive bidding, project management, and document handling. The application serves as a comprehensive solution for construction project procurement with role-based access control and real-time communication capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React + TypeScript**: Modern frontend framework using TypeScript for type safety
- **Vite**: Fast build tool and development server with hot module replacement
- **TailwindCSS**: Utility-first CSS framework for responsive design
- **Shadcn/UI**: Component library built on Radix UI primitives providing accessible UI components
- **Wouter**: Lightweight client-side routing library
- **React Query (TanStack Query)**: Server state management and data fetching with caching
- **React Hook Form**: Form state management and validation

### Backend Architecture
- **Express.js**: Node.js web application framework handling HTTP requests and middleware
- **TypeScript**: Full-stack TypeScript implementation for consistency
- **WebSocket Integration**: Real-time bidirectional communication using native WebSocket API
- **Session-based Authentication**: Express sessions with Passport.js local strategy
- **RESTful API Design**: Standard HTTP methods for CRUD operations

### Database & ORM
- **PostgreSQL**: Relational database chosen for complex relationships and ACID compliance
- **Drizzle ORM**: Type-safe ORM with excellent TypeScript integration
- **Neon Database**: Serverless PostgreSQL provider for scalable cloud deployment
- **Schema-first Design**: Centralized schema definitions in `/shared/schema.ts`

### Authentication & Security
- **Passport.js**: Authentication middleware with local strategy
- **bcrypt**: Password hashing for secure credential storage
- **Role-based Access Control**: Four distinct user roles (company, supplier, ngo, admin)
- **Session Management**: Express sessions for maintaining authentication state

### Real-time Communication
- **WebSocket Server**: Native WebSocket implementation for instant messaging
- **Event-driven Architecture**: Real-time notifications for bid updates and messages
- **Connection Management**: Automatic reconnection handling on the client side

### File Structure & Organization
- **Monorepo Structure**: Client, server, and shared code in a single repository
- **Shared Schema**: Common TypeScript types and database schemas
- **Component-based UI**: Reusable React components with consistent design patterns
- **Custom Hooks**: Encapsulated logic for authentication, WebSocket, and data fetching

### State Management
- **React Query**: Server state caching and synchronization
- **React Context**: Limited use for authentication state
- **Local State**: Component-level state management with React hooks
- **Form State**: React Hook Form for complex form interactions

### Build & Deployment
- **Development**: Vite dev server with Express API proxy
- **Production Build**: Vite for frontend bundling, esbuild for backend compilation
- **Static Asset Serving**: Express serves built frontend assets in production
- **Environment Configuration**: Environment-based configuration for database and external services

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting with automatic scaling
- **Drizzle Kit**: Database migration and schema management tools

### UI & Design System
- **Radix UI**: Headless UI component primitives for accessibility
- **Lucide React**: Icon library providing consistent iconography
- **TailwindCSS**: Utility-first styling with custom design tokens

### Development Tools
- **TypeScript**: Static type checking across the entire application
- **Vite**: Frontend build tool with fast hot module replacement
- **esbuild**: Fast JavaScript bundler for production builds
- **Replit Integration**: Development environment plugins for enhanced debugging

### Authentication & Security
- **bcrypt**: Cryptographic hashing library for password security
- **connect-pg-simple**: PostgreSQL session store for Express sessions

### Payment Processing (Razorpay Integration)
- **Razorpay**: Payment processing infrastructure for escrow and transactions
- **Razorpay Web SDK**: JavaScript SDK for payment UI integration

### Additional Libraries
- **date-fns**: Date manipulation and formatting utilities
- **zod**: Schema validation library for runtime type checking
- **class-variance-authority**: Utility for creating type-safe component variants