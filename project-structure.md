# DevConnect Project Structure

## Overview
This document outlines the directory structure and initial files for the DevConnect platform. The project follows a monorepo structure with separate backend and frontend directories.

## Root Directory Structure
```
devconnect/
├── backend/                 # Node.js/Express backend
├── frontend/                # React frontend
├── docs/                    # Documentation
├── docker/                  # Docker configurations
├── .gitignore
├── README.md
├── package.json             # Root package.json for monorepo management
└── docker-compose.yml
```

## Backend Directory Structure
```
backend/
├── src/
│   ├── config/              # Configuration files
│   │   ├── database.js
│   │   ├── auth.js
│   │   └── index.js
│   ├── models/              # Mongoose models
│   │   ├── User.js
│   │   ├── Project.js
│   │   ├── Issue.js
│   │   ├── Message.js
│   │   ├── Repository.js
│   │   ├── ChatRoom.js
│   │   ├── ProjectBoard.js
│   │   └── BoardCard.js
│   ├── graphql/
│   │   ├── schema.js        # GraphQL schema definition
│   │   ├── resolvers/       # GraphQL resolvers
│   │   │   ├── user.js
│   │   │   ├── project.js
│   │   │   ├── issue.js
│   │   │   ├── message.js
│   │   │   ├── repository.js
│   │   │   ├── chatRoom.js
│   │   │   ├── projectBoard.js
│   │   │   └── index.js
│   │   └── types/           # GraphQL type definitions
│   ├── middleware/          # Express middleware
│   │   ├── auth.js
│   │   ├── cors.js
│   │   ├── rateLimit.js
│   │   └── validation.js
│   ├── routes/              # REST API routes (if needed)
│   ├── services/            # Business logic services
│   │   ├── authService.js
│   │   ├── userService.js
│   │   ├── projectService.js
│   │   ├── issueService.js
│   │   ├── messageService.js
│   │   ├── repositoryService.js
│   │   ├── chatRoomService.js
│   │   ├── projectBoardService.js
│   │   └── socketService.js
│   ├── utils/               # Utility functions
│   │   ├── logger.js
│   │   ├── validators.js
│   │   └── helpers.js
│   ├── socket/              # Socket.io handlers
│   │   ├── index.js
│   │   ├── chat.js
│   │   ├── codeEditing.js
│   │   └── notifications.js
│   └── app.js               # Express app setup
├── tests/                   # Test files
│   ├── unit/
│   ├── integration/
│   └── fixtures/
├── scripts/                 # Utility scripts
├── .env.example
├── package.json
├── server.js                # Server entry point
└── README.md
```

## Frontend Directory Structure
```
frontend/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── assets/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── common/          # Generic components
│   │   │   ├── Button/
│   │   │   ├── Input/
│   │   │   ├── Modal/
│   │   │   └── Avatar/
│   │   ├── layout/          # Layout components
│   │   │   ├── Header/
│   │   │   ├── Sidebar/
│   │   │   ├── Footer/
│   │   │   └── Navigation/
│   │   ├── projects/        # Project-related components
│   │   ├── issues/          # Issue tracking components
│   │   ├── chat/            # Chat components
│   │   ├── boards/          # Kanban board components
│   │   ├── repositories/    # Repository components
│   │   └── profile/         # User profile components
│   ├── pages/               # Page components
│   │   ├── Dashboard/
│   │   ├── ProjectDetails/
│   │   ├── IssueDetails/
│   │   ├── ChatRoom/
│   │   ├── Profile/
│   │   ├── Settings/
│   │   └── Login/
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.js
│   │   ├── useSocket.js
│   │   ├── useProjects.js
│   │   └── useIssues.js
│   ├── context/             # React context providers
│   │   ├── AuthContext.js
│   │   ├── SocketContext.js
│   │   └── ThemeContext.js
│   ├── services/            # API service functions
│   │   ├── api.js           # GraphQL client setup
│   │   ├── auth.js
│   │   ├── projects.js
│   │   ├── issues.js
│   │   ├── messages.js
│   │   ├── repositories.js
│   │   └── boards.js
│   ├── utils/               # Utility functions
│   │   ├── constants.js
│   │   ├── helpers.js
│   │   └── validators.js
│   ├── styles/              # Global styles and themes
│   │   ├── theme.js
│   │   ├── global.css
│   │   └── variables.css
│   ├── assets/              # Static assets
│   │   ├── images/
│   │   ├── icons/
│   │   └── fonts/
│   ├── App.js               # Main App component
│   ├── index.js             # React entry point
│   └── setupTests.js
├── tests/                   # Test files
│   ├── components/
│   ├── hooks/
│   ├── services/
│   └── utils/
├── .env.example
├── package.json
├── tailwind.config.js       # If using Tailwind CSS
├── craco.config.js          # If using Create React App with custom config
└── README.md
```

## Documentation Directory
```
docs/
├── api/                     # API documentation
├── architecture/            # Architecture documentation
├── deployment/              # Deployment guides
├── user-guide/              # User documentation
└── development/             # Development guidelines
```

## Docker Directory
```
docker/
├── backend/
│   ├── Dockerfile
│   └── nginx.conf
├── frontend/
│   ├── Dockerfile
│   └── nginx.conf
└── docker-compose.yml
```

## Initial Files to Create

### Root Level
1. `package.json` - Monorepo configuration with workspaces
2. `.gitignore` - Git ignore rules for Node.js, React, and common files
3. `README.md` - Project overview and setup instructions
4. `docker-compose.yml` - Development environment setup

### Backend Initial Files
1. `package.json` - Dependencies and scripts
2. `server.js` - Server entry point
3. `src/app.js` - Express app configuration
4. `src/config/index.js` - Configuration setup
5. `src/models/index.js` - Model exports
6. `.env.example` - Environment variables template

### Frontend Initial Files
1. `package.json` - Dependencies and scripts
2. `src/index.js` - React app entry point
3. `src/App.js` - Main App component
4. `src/services/api.js` - GraphQL client setup
5. `.env.example` - Environment variables template

## Development Workflow
- Use `npm run dev` in backend directory for development server
- Use `npm start` in frontend directory for React development server
- Use `docker-compose up` for full development environment
- Run tests with `npm test` in respective directories

This structure provides a scalable foundation for the DevConnect platform, separating concerns and following best practices for modern web development.