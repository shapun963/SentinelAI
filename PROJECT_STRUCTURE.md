# Sentinel AI - Project Structure

## Overview
The Sentinel AI project has been reorganized with a clear separation between frontend and backend code, while maintaining compatibility with the existing build system.

## Directory Structure

```
sentinel-ai/
├── frontend/                    # Standalone frontend application
│   ├── src/                    # React application source code
│   │   ├── components/         # UI components and analysis widgets
│   │   ├── pages/             # Application routes/pages
│   │   ├── hooks/             # Custom React hooks
│   │   ├── lib/               # Utilities and API client
│   │   ├── App.tsx            # Main app component
│   │   ├── main.tsx           # Entry point
│   │   └── index.css          # Global styles and animations
│   ├── index.html             # HTML template
│   ├── package.json           # Frontend dependencies
│   ├── vite.config.ts         # Frontend-specific Vite config
│   ├── tailwind.config.ts     # Tailwind CSS configuration
│   ├── tsconfig.json          # TypeScript configuration
│   ├── components.json        # shadcn/ui configuration
│   ├── README.md              # Frontend documentation
│   └── start.sh               # Development helper script
│
├── client/                     # Original client folder (for compatibility)
│   ├── src/                   # Symlinked to maintain compatibility
│   └── index.html             # Main HTML template
│
├── server/                     # Backend Express.js application
│   ├── index.ts               # Server entry point
│   ├── routes.ts              # API routes and analysis logic
│   ├── storage.ts             # Data storage interface
│   └── vite.ts                # Vite integration (unchanged)
│
├── shared/                     # Shared TypeScript schemas
│   └── schema.ts              # Database and API type definitions
│
├── attached_assets/            # User-uploaded assets
├── package.json               # Main project dependencies
├── vite.config.ts             # Main Vite configuration (unchanged)
├── tsconfig.json              # Root TypeScript config
└── replit.md                  # Project documentation and preferences
```

## Frontend Features

### ✅ Completed Features
- **Hero-style Prompt Input**: Animated interface with floating effects and background animations
- **Real-time Analysis**: Progressive analysis with animated progress indicators
- **Text Highlighting**: Visual highlighting for prompt injection, PII, and bias detection
- **Individual PII Masking**: Granular control over PII visibility with animated masking effects
- **Score Dashboard**: Real-time animated scoring visualization
- **Summary Panel**: Comprehensive analysis results with recommendations
- **Glass-morphism Design**: Modern dark theme with neon effects and smooth transitions
- **Responsive Layout**: Mobile-first design with proper breakpoints

### 🎨 Design System
- **Dark Theme**: Custom color palette with blue/purple gradients
- **Animations**: CSS keyframes for floating, glowing, and fade effects
- **Typography**: Inter font with monospace for code display
- **Components**: shadcn/ui components with custom Sentinel AI styling

## Development Workflow

### Running the Application
```bash
# Start the full-stack application (recommended)
npm run dev

# Or run frontend and backend separately
npm run dev                    # Backend on port 5000
cd frontend && npm run dev     # Frontend on port 3000
```

### Frontend-Only Development
```bash
cd frontend
./start.sh                     # Installs deps and starts dev server
```

### Building for Production
```bash
npm run build                  # Builds both frontend and backend
cd frontend && npm run build   # Frontend only
```

## Architecture Benefits

1. **Clear Separation**: Frontend and backend code are cleanly separated
2. **Independent Development**: Frontend can be developed and built independently
3. **Backward Compatibility**: Original client folder maintained for existing build system
4. **Modern Tooling**: Frontend uses latest Vite, TypeScript, and React configurations
5. **Professional Structure**: Follows modern full-stack project organization patterns

## Technology Stack

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS + shadcn/ui
- TanStack Query (server state)
- Wouter (routing)
- Framer Motion (animations)

### Backend
- Node.js + Express.js
- TypeScript + ESM
- Drizzle ORM + PostgreSQL
- Session management
- Simulated AI analysis pipeline

### Shared
- TypeScript schemas
- Zod validation
- Type-safe API contracts