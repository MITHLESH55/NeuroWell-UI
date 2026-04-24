# 🚀 NeuroWell Backend Deployment Guide

## Prerequisites

- Node.js 16+
- MongoDB Atlas account (cloud database)
- Domain name (optional)
- SSL certificate (for HTTPS)

## 1. Database Setup (MongoDB Atlas)

### Create MongoDB Atlas Cluster

1. Go to [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create account and cluster
3. Set up database user with read/write permissions
4. Whitelist IP addresses (0.0.0.0/0 for development)
5. Get connection string

### Database Configuration

```javascript
// Connection string format
mongodb+srv://username:password@cluster.mongodb.net/neurowell_prod?retryWrites=true&w=majority
```

## 2. Environment Configuration

### Production Environment Variables

```bash
cp .env.production .env
# Edit .env with your actual values
```

Required variables:

- `MONGODB_URI`: Your MongoDB Atlas connection string
- `FRONTEND_URL`: Your frontend domain (https://yourdomain.com)
- `JWT_SECRET`: Strong random string for authentication
- `NODE_ENV`: Set to 'production'

## 3. Deployment Options

### Option A: Heroku (Recommended for beginners)

#### 1. Install Heroku CLI

```bash
# Download from https://devcenter.heroku.com/articles/heroku-cli
```

#### 2. Prepare for deployment

```bash
cd backend
heroku create your-neurowell-backend
```

#### 3. Set environment variables

```bash
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI="your_mongodb_atlas_uri"
heroku config:set FRONTEND_URL="https://your-frontend-domain.com"
heroku config:set JWT_SECRET="your_secure_secret"
```

#### 4. Deploy

```bash
git push heroku main
```

#### 5. Check deployment

```bash
heroku logs --tail
heroku open
```

### Option B: DigitalOcean App Platform

1. Connect GitHub repository
2. Set environment variables in dashboard
3. Configure resource limits
4. Deploy automatically

### Option C: AWS EC2 + PM2

#### 1. Launch EC2 instance

```bash
# Ubuntu 20.04 LTS, t2.micro (free tier)
```

#### 2. Install dependencies

```bash
sudo apt update
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo apt-get install -y build-essential
```

#### 3. Install PM2

```bash
sudo npm install -g pm2
```

#### 4. Deploy application

```bash
cd /var/www
git clone https://github.com/yourusername/neurowell-backend.git
cd neurowell-backend
npm install --production
cp .env.production .env
# Edit .env with production values
```

#### 5. Start with PM2

```bash
pm2 start server.js --name "neurowell-backend"
pm2 startup
pm2 save
```

## 4. Frontend Deployment

### Update Frontend API URLs

```javascript
// In js/api.js, update BASE_URL for production
const APIService = {
  BASE_URL:
    window.location.hostname === "localhost"
      ? "http://localhost:3000/api"
      : "https://your-backend-domain.com/api",
  // ... rest of the code
};
```

### Deploy Frontend

- **Netlify**: Connect GitHub repo, auto-deploy
- **Vercel**: Similar to Netlify
- **GitHub Pages**: For static hosting

## 5. Security Checklist

### Pre-deployment

- [ ] Remove all console.log statements
- [ ] Set NODE_ENV=production
- [ ] Use strong, unique secrets
- [ ] Enable HTTPS (SSL certificate)
- [ ] Configure proper CORS origins
- [ ] Set up rate limiting
- [ ] Enable compression

### Database Security

- [ ] Use MongoDB Atlas (not local MongoDB)
- [ ] Strong database password
- [ ] IP whitelisting
- [ ] Database user with minimal permissions
- [ ] Enable database encryption

### Monitoring

- [ ] Set up error logging (Winston, Papertrail)
- [ ] Configure health checks
- [ ] Set up uptime monitoring
- [ ] Enable PM2 monitoring

## 6. Performance Optimization

### Database

```javascript
// Add indexes for better performance
db.assessments.createIndex({ userId: 1 });
db.assessments.createIndex({ createdAt: -1 });
```

### Caching

```javascript
// Consider Redis for session storage
npm install redis connect-redis
```

### CDN

- Use CDN for static assets
- Enable gzip compression
- Set proper cache headers

## 7. Backup & Recovery

### Database Backups

- MongoDB Atlas: Automatic backups
- Manual exports: `mongodump`

### Application Backups

- PM2 logs rotation
- Regular code backups
- Environment variable backups

## 8. Scaling Considerations

### Horizontal Scaling

- Load balancer (nginx)
- Multiple app instances
- Redis for session sharing

### Database Scaling

- MongoDB Atlas auto-scaling
- Read replicas
- Sharding for large datasets

## 9. Monitoring & Maintenance

### Health Checks

```javascript
// GET /health endpoint for load balancers
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});
```

### Logs

```bash
# PM2 logs
pm2 logs neurowell-backend

# Application logs
tail -f logs/app.log
```

### Updates

```bash
# Zero-downtime deployments with PM2
pm2 reload ecosystem.config.js
```

## 10. Troubleshooting

### Common Issues

**Connection Refused:**

- Check MongoDB Atlas IP whitelist
- Verify connection string
- Test with MongoDB Compass

**CORS Errors:**

- Update FRONTEND_URL in .env
- Check HTTPS vs HTTP

**Memory Issues:**

- Monitor with `pm2 monit`
- Increase EC2 instance size
- Optimize database queries

**Rate Limiting:**

- Adjust RATE_LIMIT_MAX_REQUESTS
- Implement API keys for high-volume users

---

## 📞 Support

For deployment issues:

1. Check application logs
2. Verify environment variables
3. Test database connectivity
4. Check network/firewall settings

**Production Checklist:**

- [ ] Environment variables configured
- [ ] Database connection tested
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] Rate limiting active
- [ ] Monitoring set up
- [ ] Backups configured
- [ ] Security headers enabled
