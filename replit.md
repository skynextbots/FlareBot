# Overview

This is a Roblox bot verification and configuration system that allows users to verify their Roblox accounts and configure automated bot behaviors for various Roblox games. The application features a multi-step user flow (verification → code verification → bot configuration) and includes an admin dashboard for monitoring submissions and managing the system.

The system is built as a full-stack web application with a React frontend and Express.js backend, utilizing PostgreSQL for data persistence and Drizzle ORM for database operations.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Framework**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS styling
- **State Management**: TanStack Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod schema validation for type-safe form handling

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API endpoints with JSON request/response format
- **Middleware**: Custom logging middleware for API request tracking
- **Error Handling**: Centralized error handling middleware with status code mapping

## Data Storage Solutions
- **Database**: PostgreSQL with connection via Neon Database serverless driver
- **ORM**: Drizzle ORM for type-safe database operations and migrations
- **Schema Management**: Shared TypeScript schema definitions with Zod validation
- **Session Storage**: In-memory storage implementation with interface for future database persistence

## Database Schema Design
The system uses four main entities:
- **Users**: Admin user accounts with username/password authentication
- **Verification Sessions**: Temporary sessions for Roblox username verification with expiration
- **Bot Configurations**: User-selected game modes and settings linked to verification sessions
- **Admin Sessions**: Active admin login sessions for dashboard access

## Authentication and Authorization
- **User Verification**: Roblox API integration to validate username existence
- **Admin Authentication**: Session-based authentication with in-memory session storage
- **Session Management**: Time-based session expiration for both verification and admin sessions

## External Dependencies
- **Roblox API**: Integration for username validation via public Roblox user endpoints
- **Neon Database**: Serverless PostgreSQL hosting for production data storage
- **Replit Platform**: Development environment integration with custom plugins and error handling
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Radix UI**: Headless component library for accessible UI primitives

## Key Architectural Decisions

### Multi-Step User Flow
The application implements a guided three-step process: username verification, code verification, and bot configuration. This approach ensures user authenticity while collecting necessary configuration data progressively.

### Shared Schema Approach
Database schemas and validation logic are centralized in a shared directory, enabling type safety across both frontend and backend while maintaining consistency in data validation.

### Memory-Based Storage with Database Interface
The current implementation uses in-memory storage with a well-defined interface, allowing for easy migration to persistent database storage without changing the business logic.

### Component-Based UI Architecture
The frontend leverages a comprehensive design system with reusable components, ensuring consistency and maintainability across the application.