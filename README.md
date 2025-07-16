# Mesh Editor Application

## Overview

This is a full-stack web application for 3D mesh editing built with React on the frontend and Express.js on the backend. The application allows users to upload, view, edit, and manage 3D mesh files (OBJ, STL, PLY formats) with real-time 3D visualization using Three.js. It includes a chat system for user interaction and supports creating basic geometric shapes.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **3D Rendering**: Three.js with React Three Fiber for 3D mesh visualization
- **UI Components**: Radix UI with shadcn/ui component library
- **Styling**: Tailwind CSS with custom design tokens
- **State Management**: React hooks with TanStack Query for server state
- **Routing**: Wouter for client-side routing
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Cloud Database**: Neon serverless PostgreSQL
- **File Upload**: Multer for handling mesh file uploads
- **Session Management**: Express sessions with PostgreSQL store
- **Development**: Hot reloading with Vite integration

## Key Components

### Database Schema
Three main entities defined in `shared/schema.ts`:

1. **Meshes Table**
   - Stores 3D mesh metadata and base64-encoded file data
   - Supports OBJ, STL, and PLY file formats
   - Tracks vertex count, face count, and file size

2. **Chat Messages Table**
   - Stores user and bot messages
   - Includes timestamps and message type flags

3. **Macros Table**
   - Stores reusable command sequences
   - Uses JSON field for flexible command storage

### Frontend Components
- **MeshEditor**: Main application interface with panels and viewport
- **MeshViewport**: 3D rendering canvas using Three.js
- **MeshTools**: Toolbar for creating and manipulating meshes
- **FileBrowser**: File management interface
- **ChatPanel**: Real-time chat interface
- **TopMenu**: Application menu with file operations

### Backend Routes
- **Mesh API**: CRUD operations for mesh files (`/api/meshes`)
- **Chat API**: Message handling (`/api/chat/messages`)
- **Macro API**: Command sequence management (`/api/macros`)

## Data Flow

1. **File Upload**: Users upload mesh files through the frontend, which are processed by Multer and stored as base64 in PostgreSQL
2. **3D Rendering**: Mesh data is parsed and converted to Three.js geometry for real-time visualization
3. **Real-time Updates**: TanStack Query handles caching and synchronization of mesh and chat data
4. **Chat System**: Messages are stored in the database and polled for real-time updates

## External Dependencies

### Core Libraries
- **@neondatabase/serverless**: Neon PostgreSQL connection
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management
- **@react-three/fiber**: React wrapper for Three.js
- **zod**: Schema validation
- **multer**: File upload handling

### UI Framework
- **@radix-ui/***: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **class-variance-authority**: CSS utility management

### Development Tools
- **tsx**: TypeScript execution
- **esbuild**: Fast JavaScript bundler
- **vite**: Frontend build tool

## Deployment Strategy

### Development
- **Frontend**: Vite dev server with hot module replacement
- **Backend**: tsx with auto-restart on file changes
- **Database**: Neon PostgreSQL with connection pooling

### Production Build
- **Frontend**: Vite production build to `dist/public`
- **Backend**: esbuild bundle to `dist/index.js`
- **Database**: Drizzle migrations applied via `db:push` script

### Key Configuration
- **Database URL**: Required environment variable for PostgreSQL connection
- **File Storage**: Base64 encoding for mesh data storage in database
- **Session Storage**: PostgreSQL-backed session store using connect-pg-simple
