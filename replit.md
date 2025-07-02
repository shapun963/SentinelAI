# Sentinel AI - Prompt Security Analysis Platform

## Overview

Sentinel AI is a comprehensive web application designed to analyze AI prompts for security vulnerabilities, including prompt injection attacks, personally identifiable information (PII) detection, and bias analysis. The application provides real-time analysis with detailed scoring, visual highlighting, and comprehensive reporting capabilities.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **Build Tool**: Vite for development and production builds
- **UI Components**: Radix UI primitives with custom styling

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Session Management**: PostgreSQL-backed sessions with connect-pg-simple
- **Development**: Hot module replacement with Vite integration

### Key Design Decisions

**Monorepo Structure**: The application uses a unified monorepo with shared schemas between client and server, promoting type safety and reducing code duplication.

**Type-Safe Database Operations**: Drizzle ORM with PostgreSQL provides type-safe database operations while maintaining flexibility for complex queries.

**Component-First UI**: Built with Radix UI primitives and shadcn/ui for accessible, customizable components with consistent design patterns.

**Real-time Analysis**: Simulated analysis pipeline with progress tracking to provide immediate user feedback during processing.

## Key Components

### Database Schema
- **Users Table**: Stores user credentials and authentication data
- **Analyses Table**: Persists analysis results with JSON-based flexible schema for various analysis types

### Analysis Engine
The core analysis functionality simulates advanced AI security analysis including:
- **Prompt Injection Detection**: Identifies potential injection attacks with severity scoring
- **PII Detection**: Scans for sensitive personal information with categorization
- **Bias Analysis**: Evaluates content for various bias types (racial, gender, age, religious)
- **Overall Risk Scoring**: Comprehensive security assessment with actionable insights

### UI Components
- **Dashboard**: Main interface for prompt analysis and results visualization
- **Analysis Results**: Interactive text highlighting with detailed annotations
- **Score Dashboard**: Real-time animated scoring with progress indicators
- **Summary Panel**: Comprehensive analysis summary with actionable recommendations

## Data Flow

1. **User Input**: Users submit prompts through the main input interface
2. **Analysis Request**: Frontend sends analysis request to backend API
3. **Processing Simulation**: Backend simulates comprehensive security analysis
4. **Result Storage**: Analysis results are stored in PostgreSQL database
5. **Response Delivery**: Results are returned to frontend with detailed scoring
6. **Visual Presentation**: Frontend renders highlighted text, scores, and recommendations

## External Dependencies

### Database & Infrastructure
- **Neon Database**: Serverless PostgreSQL hosting
- **Drizzle Kit**: Database migration and schema management

### Frontend Libraries
- **React Ecosystem**: React 18, React DOM, React Query
- **UI Framework**: Radix UI components, Tailwind CSS
- **Development Tools**: Vite, TypeScript, PostCSS

### Backend Libraries
- **Express.js**: Web application framework
- **Database**: Drizzle ORM, PostgreSQL client
- **Validation**: Zod for schema validation
- **Session Management**: Express sessions with PostgreSQL store

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with hot reload
- **Database**: Neon Database connection via environment variables
- **Build Process**: TypeScript compilation with Vite optimization

### Production Deployment
- **Build Process**: `npm run build` creates optimized client and server bundles
- **Server Bundle**: ESBuild creates Node.js compatible server bundle
- **Static Assets**: Client assets served from Express with production optimization
- **Environment Configuration**: Database connection and other secrets via environment variables

### Database Management
- **Schema Evolution**: Drizzle migrations for database schema changes
- **Connection Pooling**: Neon serverless handles connection management
- **Development Workflow**: `npm run db:push` for schema synchronization

## Changelog
- July 02, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.