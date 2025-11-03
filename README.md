# DevConnect

A collaborative development platform that brings together developers, project management, issue tracking, real-time messaging, and code editing in one comprehensive tool.

## Features

- **Project Management**: Create and manage development projects with team collaboration
- **Issue Tracking**: Comprehensive issue management with labels, assignees, and priorities
- **Real-time Messaging**: Chat rooms for project communication and direct messaging
- **Code Editing**: Collaborative code editing with real-time synchronization
- **Repository Management**: Manage open-source projects and Git repositories
- **Kanban Boards**: Visual project boards for agile development
- **User Profiles**: Detailed user profiles with skills, experience, and social links

## Technology Stack

### Backend
- Node.js with Express.js
- MongoDB with Mongoose ODM
- GraphQL API with Apollo Server
- Socket.io for real-time features
- JWT authentication

### Frontend
- React 18 with hooks
- Apollo Client for GraphQL
- Socket.io client for real-time features
- Material-UI for components
- React Router for navigation

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/marvellousabi/devconnect.git
cd devconnect
```

2. Install dependencies:
```bash
npm run install:all
```

3. Set up environment variables:
```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your configuration

# Frontend
cp frontend/.env.example frontend/.env
# Edit frontend/.env with your configuration
```

4. Start MongoDB (if running locally):
```bash
mongod
```

5. Start the development servers:
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000/graphql

### Docker Development

```bash
# Start all services
npm run docker:dev

# Build images
npm run docker:build
```

## Project Structure

```
devconnect/
├── backend/          # Node.js/Express backend
├── frontend/         # React frontend
├── docs/            # Documentation
├── docker/          # Docker configurations
└── docs/            # Project documentation
```

## API Documentation

- GraphQL Playground: http://localhost:4000/graphql
- REST API docs: Available in `docs/api/`

## Testing

```bash
# Run all tests
npm test

# Run backend tests only
cd backend && npm test

# Run frontend tests only
cd frontend && npm test
```

## Deployment

See `docs/deployment/` for deployment guides.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For support, email support@devconnect.com or join our Discord community.