# Sentinel AI Frontend

This is the frontend application for Sentinel AI - a comprehensive prompt security analysis platform.

## Project Structure

```
frontend/
├── src/
│   ├── components/         # Reusable UI components
│   ├── pages/             # Application pages/routes
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility libraries and API clients
│   ├── App.tsx            # Main application component
│   ├── main.tsx           # Application entry point
│   └── index.css          # Global styles and animations
├── index.html             # HTML template
├── package.json           # Frontend dependencies and scripts
├── vite.config.ts         # Vite build configuration
├── tailwind.config.ts     # Tailwind CSS configuration
├── postcss.config.js      # PostCSS configuration
└── components.json        # shadcn/ui components configuration
```

## Features

- **Modern React Interface**: Built with React 18 and TypeScript
- **Real-time Analysis**: Interactive prompt security analysis with live highlighting
- **PII Masking**: Individual control over personally identifiable information visibility
- **Animated UI**: Glass-morphism design with smooth transitions and neon effects
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dark Theme**: Custom dark theme with gradient effects

## Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The development server will start on `http://localhost:3000` and proxy API requests to the backend server.

### Building

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Technology Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling framework
- **shadcn/ui** - Component library
- **Wouter** - Client-side routing
- **TanStack Query** - Server state management
- **Framer Motion** - Animations
- **Lucide React** - Icons

## API Integration

The frontend communicates with the backend API through:
- REST endpoints for analysis requests
- Real-time updates during analysis processing
- Session management for user authentication

## Components

### Core Components
- `PromptInput` - Main input interface with animated hero design
- `AnalysisResults` - Text highlighting with PII masking controls
- `ScoreDashboard` - Real-time security scoring visualization
- `SummaryPanel` - Analysis summary and recommendations

### UI Components
All UI components are built with shadcn/ui and customized with the Sentinel AI theme:
- Forms, buttons, cards, dialogs
- Progress indicators and loading states
- Tooltips, badges, and navigation elements