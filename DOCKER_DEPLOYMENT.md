# Docker Deployment for Frontend

This guide explains how to deploy the frontend application using Docker and Portainer on port 7002.

## Files Created

- `Dockerfile` - Multi-stage Docker build configuration
- `.dockerignore` - Files to exclude from Docker build
- `docker-compose.yml` - Docker Compose configuration for easy deployment
- `DOCKER_DEPLOYMENT.md` - This deployment guide

## Prerequisites

- Docker installed and running
- Portainer installed and accessible
- Backend server running (default on port 3001)

## Deployment Options

### Option 1: Using Docker Compose (Recommended)

1. **Build and run locally:**
   ```bash
   cd frontend
   docker-compose up -d --build
   ```

2. **Access the application:**
   - Frontend: http://localhost:7002
   - Backend: http://localhost:3001 (should be running separately)

### Option 2: Using Portainer

1. **Open Portainer** in your browser

2. **Go to Stacks** in the left menu

3. **Add a new stack:**
   - Click "Add stack"
   - Name: `mac-uploader-frontend`
   - Build method: Git Repository or Web Editor

4. **Using Web Editor:**
   - Copy the content from `docker-compose.yml`
   - Paste it into the web editor
   - Click "Deploy the stack"

5. **Using Git Repository:**
   - Repository URL: Your Git repository URL
   - Path: `frontend/` (if docker-compose.yml is in the frontend folder)
   - Click "Deploy the stack"

6. **Verify deployment:**
   - Go to Containers in Portainer
   - Check if `mac-uploader-frontend` container is running
   - Access: http://your-server-ip:7002

## Configuration

### Environment Variables

The following environment variables can be configured in `docker-compose.yml`:

- `NODE_ENV`: Set to `production` for production deployment
- `PORT`: Container port (default: 7002)
- `HOSTNAME`: Set to `0.0.0.0` to expose externally
- `NEXT_PUBLIC_API_BASE_URL`: Backend API URL (update this for production)
- `NEXT_PUBLIC_STORAGE_MODE`: Storage mode (local/s3)

### For Production Deployment

Update the `NEXT_PUBLIC_API_BASE_URL` in `docker-compose.yml` to point to your production backend:

```yaml
environment:
  - NEXT_PUBLIC_API_BASE_URL=https://your-backend-domain.com
```

## Troubleshooting

### Container won't start

1. Check logs in Portainer:
   - Go to Containers → mac-uploader-frontend → Logs
   - Look for error messages

2. Common issues:
   - Port 7002 already in use
   - Backend API not accessible
   - Build failures due to missing dependencies

### Backend connection issues

1. Verify the backend is running and accessible
2. Check the `NEXT_PUBLIC_API_BASE_URL` environment variable
3. Ensure proper network connectivity between containers

### Performance optimization

1. The Dockerfile uses multi-stage builds for optimal image size
2. Static files are served efficiently by Next.js
3. Consider using a reverse proxy (nginx) for production

## Network Configuration

The application uses a custom Docker network `mac-uploader-network`. If you're also deploying the backend with Docker, ensure both containers use the same network for proper communication.

## Updates

To update the application:

1. **Using Docker Compose:**
   ```bash
   cd frontend
   docker-compose down
   docker-compose up -d --build
   ```

2. **Using Portainer:**
   - Go to Stacks
   - Select `mac-uploader-frontend`
   - Click "Update" and then "Pull and redeploy"