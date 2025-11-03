# DevConnect Deployment Guide

This guide covers different deployment strategies for the DevConnect platform.

## Table of Contents

- [Local Development](#local-development)
- [Docker Deployment](#docker-deployment)
- [Cloud Deployment](#cloud-deployment)
- [Environment Configuration](#environment-configuration)
- [Monitoring and Maintenance](#monitoring-and-maintenance)

## Local Development

### Prerequisites

- Node.js 18+
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/marvellousabi/devconnect.git
   cd devconnect
   ```

2. **Install dependencies:**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables:**

   **Backend (.env):**
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env with your configuration
   ```

   **Frontend (.env):**
   ```bash
   cp frontend/.env.example frontend/.env
   # Edit frontend/.env with your configuration
   ```

4. **Start MongoDB:**
   ```bash
   # If using local MongoDB
   mongod
   ```

5. **Start the development servers:**
   ```bash
   npm run dev
   ```

   This will start both backend (port 4000) and frontend (port 3000).

## Docker Deployment

### Prerequisites

- Docker
- Docker Compose

### Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/devconnect.git
   cd devconnect
   ```

2. **Start all services:**
   ```bash
   docker-compose up -d
   ```

3. **Check service status:**
   ```bash
   docker-compose ps
   ```

4. **View logs:**
   ```bash
   docker-compose logs -f
   ```

### Services

- **MongoDB**: Database (port 27017)
- **Redis**: Caching and sessions (port 6379)
- **Backend**: API server (port 4000)
- **Frontend**: React app (port 3000)
- **Nginx**: Reverse proxy (port 80/443) - production only

### Docker Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Rebuild and restart
docker-compose up -d --build

# View logs
docker-compose logs -f [service-name]

# Scale services
docker-compose up -d --scale backend=3

# Clean up
docker-compose down -v --remove-orphans
```

## Cloud Deployment

### Heroku Deployment

1. **Create Heroku apps:**
   ```bash
   heroku create devconnect-backend
   heroku create devconnect-frontend
   ```

2. **Set environment variables:**
   ```bash
   heroku config:set NODE_ENV=production -a devconnect-backend
   heroku config:set MONGODB_URI=your-mongodb-atlas-uri -a devconnect-backend
   heroku config:set JWT_SECRET=your-jwt-secret -a devconnect-backend
   ```

3. **Deploy backend:**
   ```bash
   cd backend
   heroku git:remote -a devconnect-backend
   git push heroku main
   ```

4. **Deploy frontend:**
   ```bash
   cd ../frontend
   heroku git:remote -a devconnect-frontend
   git push heroku main
   ```

### AWS Deployment

1. **ECS with Fargate:**
   ```bash
   # Build and push images to ECR
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin your-account-id.dkr.ecr.us-east-1.amazonaws.com

   docker build -t devconnect-backend ./backend
   docker build -t devconnect-frontend ./frontend

   docker tag devconnect-backend:latest your-account-id.dkr.ecr.us-east-1.amazonaws.com/devconnect-backend:latest
   docker tag devconnect-frontend:latest your-account-id.dkr.ecr.us-east-1.amazonaws.com/devconnect-frontend:latest

   docker push your-account-id.dkr.ecr.us-east-1.amazonaws.com/devconnect-backend:latest
   docker push your-account-id.dkr.ecr.us-east-1.amazonaws.com/devconnect-frontend:latest
   ```

2. **Use CloudFormation or Terraform to provision infrastructure**

### DigitalOcean App Platform

1. **Create apps from source:**
   - Connect GitHub repository
   - Set build and run commands
   - Configure environment variables
   - Set up database cluster

## Environment Configuration

### Backend Environment Variables

```bash
# Server
NODE_ENV=production
PORT=4000
FRONTEND_URL=https://yourdomain.com

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/devconnect

# Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_EXPIRES_IN=30d
BCRYPT_ROUNDS=12

# Redis (optional)
REDIS_URL=redis://localhost:6379

# Email (optional)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# File Upload (optional)
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# GitHub Integration (optional)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

### Frontend Environment Variables

```bash
REACT_APP_GRAPHQL_URI=https://api.yourdomain.com/graphql
REACT_APP_SOCKET_URI=https://api.yourdomain.com
REACT_APP_API_URL=https://api.yourdomain.com
```

## Monitoring and Maintenance

### Health Checks

The application includes health check endpoints:

- **Backend**: `GET /health` - Returns server and database status
- **Frontend**: Served by nginx with health check configuration

### Logging

- **Backend**: Winston logger with configurable log levels
- **Frontend**: Console logging in development, external service in production
- **Database**: MongoDB logs available in Docker containers

### Backup Strategy

1. **Database Backups:**
   ```bash
   # MongoDB backup
   docker exec devconnect-mongodb mongodump --db devconnect --out /backup/$(date +%Y%m%d_%H%M%S)

   # Or use MongoDB Atlas automated backups
   ```

2. **File Backups:**
   - User uploads (if any)
   - Configuration files
   - SSL certificates

### Scaling

1. **Horizontal Scaling:**
   - Run multiple backend instances behind a load balancer
   - Use Redis for session storage and caching
   - Implement database read replicas

2. **Vertical Scaling:**
   - Increase container resources as needed
   - Monitor performance metrics

### Security Considerations

1. **SSL/TLS:**
   - Use HTTPS in production
   - Configure SSL certificates in nginx

2. **Environment Variables:**
   - Never commit secrets to version control
   - Use different secrets for each environment

3. **Network Security:**
   - Configure firewalls
   - Use VPC/security groups
   - Implement rate limiting

4. **Updates:**
   - Regularly update dependencies
   - Monitor security advisories
   - Test updates in staging environment first

## Troubleshooting

### Common Issues

1. **Database Connection Issues:**
   ```bash
   # Check MongoDB connection
   docker-compose exec mongodb mongo --eval "db.stats()"

   # Check connection string
   docker-compose logs backend
   ```

2. **Port Conflicts:**
   ```bash
   # Check what's using ports
   lsof -i :4000
   lsof -i :3000

   # Change ports in docker-compose.yml
   ```

3. **Memory Issues:**
   ```bash
   # Check container resource usage
   docker stats

   # Increase memory limits in docker-compose.yml
   ```

4. **Build Failures:**
   ```bash
   # Clear Docker cache
   docker system prune -a

   # Rebuild without cache
   docker-compose build --no-cache
   ```

### Performance Optimization

1. **Database:**
   - Add appropriate indexes
   - Monitor slow queries
   - Consider read replicas for high traffic

2. **Application:**
   - Implement caching (Redis)
   - Use CDN for static assets
   - Optimize bundle size

3. **Infrastructure:**
   - Use load balancers
   - Implement auto-scaling
   - Monitor resource usage

## Support

For deployment issues, check:

1. Docker logs: `docker-compose logs -f`
2. Application logs in containers
3. Health check endpoints
4. Network connectivity
5. Environment variable configuration

For production deployments, consider using:
- Docker Swarm or Kubernetes for orchestration
- Monitoring tools (Prometheus, Grafana)
- Log aggregation (ELK stack)
- CI/CD pipelines (GitHub Actions, Jenkins)