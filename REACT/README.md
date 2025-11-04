# Anantara Design System - React Frontend

A modern, professional React application for project requirements visualization and design canvas management, integrated with the MCP server backend.

## Features

### Core Features

- **Real-time WebSocket Integration**: Connects to MCP server backend on `ws://localhost:8080`
- **Four View Modes**:
  - **Requirements View**: Display project requirements, features, user journeys, and project summary
  - **DDD View**: Domain-Driven Design architecture with bounded contexts, entities, aggregates, services, and repositories
  - **Technical Architecture View**: System design, technology stack, API design, security, deployment, and scalability
  - **Design Canvas**: Visual canvas for viewing and managing UI components with zoom and grid controls
- **Responsive UI**: Modern, clean interface with gradient accents and smooth animations
- **Auto-reconnect**: Automatic WebSocket reconnection with exponential backoff
- **State Management**: Context API for global state with optimized re-renders

### UI Components

- **Common Components**: Button, Input, Card with multiple variants
- **Layout Components**: Header with connection status and 4-mode navigation, MainLayout
- **Feature Components**: LoadingSpinner, Toolbar
- **Pages**: Requirements View, DDD View, Technical Architecture View, Design Canvas
- **Styling**: CSS Modules with a comprehensive design system

## Tech Stack

- **Framework**: React 18.2.0
- **Build Tool**: Vite 6.0
- **Routing**: React Router DOM 7.1.1
- **Styling**: CSS Modules with custom design system
- **WebSocket**: Native WebSocket API
- **State Management**: React Context API

## Design System

### Color Palette

- **Primary**: `#667eea` (Purple-blue)
- **Secondary**: `#764ba2` (Violet)
- **Success**: `#28a745`
- **Warning**: `#ffc107`
- **Danger**: `#dc3545`
- **Info**: `#17a2b8`

### Spacing Scale

- XS: 4px
- SM: 8px
- MD: 16px
- LG: 24px
- XL: 32px

### Component Variants

#### Button
- Variants: `primary`, `secondary`, `success`, `danger`, `ghost`
- Sizes: `small`, `medium`, `large`
- Supports icons and full-width mode

#### Input
- Label and error message support
- Icon support
- Full-width mode
- Validation states

#### Card
- Padding variants: `small`, `medium`, `large`, `none`
- Optional shadow and hover effects
- Title and subtitle support

## Project Structure

```
src/
├── components/
│   ├── common/              # Reusable UI components
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   └── Card.jsx
│   ├── layout/              # Layout components
│   │   ├── Header.jsx
│   │   └── MainLayout.jsx
│   ├── LoadingSpinner/      # Loading state component
│   └── Toolbar/             # Canvas toolbar
├── contexts/
│   └── AppContext.jsx       # Global state management
├── hooks/
│   └── useWebSocket.js      # WebSocket custom hook
├── pages/
│   ├── RequirementsView.jsx       # Requirements display page
│   ├── DomainDrivenDesign.jsx     # DDD architecture page
│   ├── TechnicalArchitecture.jsx  # Technical architecture page
│   └── DesignCanvas.jsx           # Design canvas page
├── App.jsx                  # Main application component
├── main.jsx                 # Application entry point
└── index.css                # Global styles
```

## Getting Started

### Prerequisites

- Node.js 14+
- npm 6+
- MCP Server running on `ws://localhost:8080`

### Installation

1. Navigate to the project directory:
```bash
cd c:\pranav_colligence\Anantara\27-10-2025\REACT
```

2. Install dependencies:
```bash
npm install
```

### Running the Application

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173` (Vite default port).

### Building for Production

```bash
npm run build
```

The production-ready files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## WebSocket Integration

### Connection

The application automatically connects to the MCP server WebSocket at `ws://localhost:8080` on startup.

### Message Types (Client to Server)

- `client_ready`: Initial connection handshake
- `request_files`: Refresh project data
- `request_canvas_mode`: Switch to canvas mode and load pages

### Message Types (Server to Client)

- `project_initialized`: New project created
- `project_switched`: Project changed
- `files_updated`: Project files updated
- `canvas_mode_ready`: Canvas data loaded
- `page_added`: New page created
- `page_deleted`: Page removed
- `page_renamed`: Page renamed
- `page_duplicated`: Page duplicated
- `canvas_updated`: Canvas component modified
- `project_deleted`: Project deleted

## Features in Detail

### Requirements View

Displays comprehensive project information:

- **Project Summary**: Markdown-formatted project overview
- **Features**: Grid of feature cards with icons, names, descriptions, and priorities
- **User Journey**: Step-by-step user flow with components and descriptions
- **Empty State**: User-friendly message when no data is available

### DDD (Domain-Driven Design) View

Comprehensive DDD architecture visualization:

- **Bounded Contexts**: Define explicit domain boundaries with descriptions
- **Entities**: Domain objects with distinct identity, attributes, and descriptions
- **Value Objects**: Characteristic objects without identity
- **Aggregates**: Clusters of domain objects with aggregate roots
- **Domain Services**: Operations that don't fit within entities or value objects
- **Repositories**: Data access abstraction layer
- **Domain Events**: Important domain occurrences
- **Beautiful Icons**: Each element type has unique visual representation

### Technical Architecture View

Detailed system architecture and infrastructure:

- **Architecture Patterns**: Design patterns and architectural approaches
- **Technology Stack**:
  - Frontend technologies with badges
  - Backend frameworks and tools
  - Database systems
  - Infrastructure and DevOps tools
- **System Components**: Microservices, modules, and their responsibilities
- **API Design**:
  - REST endpoints with HTTP methods
  - GraphQL schemas
  - WebSocket events
- **Security**: Authentication, authorization, and encryption strategies
- **Deployment**: Environments, CI/CD pipelines, monitoring tools
- **Scalability**: Caching, load balancing, and database optimization

### Design Canvas

Interactive canvas for viewing UI components:

- **Page Selection**: Dropdown to switch between pages
- **Zoom Controls**: 50% to 200% zoom with reset
- **Grid Toggle**: Show/hide background grid
- **Component Rendering**: Visual representation of components (buttons, inputs, text, images, containers)
- **Info Panel**: Real-time stats (page name, route, component count, zoom level)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development

### Adding New Components

1. Create component in `src/components/[category]/`
2. Create accompanying CSS module
3. Export from component file
4. Import and use in parent components

### Modifying Design System

Update CSS variables in `src/index.css` under the `:root` selector.

### State Management

Use the `useApp()` hook to access global state:

```jsx
import { useApp } from './contexts/AppContext';

const MyComponent = () => {
  const { currentMode, setCurrentMode, projectName } = useApp();
  // ...
};
```

## Performance Optimizations

- CSS Modules for scoped styling and zero runtime cost
- Context API with selective re-renders
- Lazy loading of components (can be added)
- Optimized WebSocket message handling
- Debounced state updates

## Future Enhancements

- Drag-and-drop component manipulation
- Component property editing
- Page creation/deletion from UI
- Interaction editor
- Export functionality
- Undo/redo system
- Component templates library
- Dark mode support
- Mobile responsive design

## License

Proprietary - Anantara Project

## Author

Created as part of the Anantara Design System project
