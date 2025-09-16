# TechHire Analytics Backend

A comprehensive backend API for the TechHire Analytics hiring assessment platform, built with Node.js, Express, TypeScript, and PostgreSQL.

## 🚀 Features

### 🔐 Authentication & Authorization
- JWT-based authentication with refresh tokens
- Role-based access control (Candidate, Recruiter, Admin)
- Email verification and password reset
- Secure password hashing with bcrypt
- Rate limiting and security headers

### 📊 Assessment System
- **DSA Assessments**: Secure code execution in sandboxed environments
- **Aptitude Tests**: Timed multiple-choice questions with scoring
- **Interview Rounds**: Voice recording with transcript generation
- Real-time progress tracking and analytics

### 🛡️ Security Features
- Docker-based code execution sandbox
- Input validation and sanitization
- SQL injection prevention with Prisma ORM
- CORS protection and helmet security headers
- Comprehensive audit logging

### 📈 Analytics & Reporting
- Performance analytics and insights
- Weakness identification and recommendations
- Progress tracking and historical data
- Recruiter dashboard with candidate analytics

### 🔧 Technical Features
- TypeScript for type safety
- Prisma ORM with PostgreSQL
- Redis for caching and session management
- Socket.IO for real-time updates
- Comprehensive test coverage
- CI/CD pipeline with GitHub Actions

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Runtime** | Node.js 18+ |
| **Framework** | Express.js |
| **Language** | TypeScript |
| **Database** | PostgreSQL with Prisma ORM |
| **Cache** | Redis |
| **Authentication** | JWT |
| **File Storage** | AWS S3 (configurable) |
| **Email** | Nodemailer |
| **Testing** | Jest + Supertest |
| **Code Execution** | Docker + VM2 |
| **Logging** | Winston |
| **Validation** | Joi + express-validator |

## 📁 Project Structure

```
BACKEND/
├── src/
│   ├── config/          # Database, Redis, and other configs
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Custom middleware
│   ├── routes/          # API routes
│   ├── services/        # Business logic services
│   ├── utils/           # Utility functions
│   ├── types/           # TypeScript type definitions
│   ├── scripts/         # Database seeds and utilities
│   └── __tests__/       # Test files
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── migrations/      # Database migrations
├── logs/                # Application logs
├── docker-compose.yml   # Docker services
├── Dockerfile          # Production container
└── package.json        # Dependencies and scripts
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- Docker (optional, for code execution)

### 1. Clone and Install
```bash
git clone <repository-url>
cd BACKEND
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database
npm run db:seed
```

### 4. Start Development Server
```bash
npm run dev
```

The API will be available at `http://localhost:5000`

## 📚 API Documentation

### Authentication Endpoints
```
POST /api/v1/auth/register     # User registration
POST /api/v1/auth/login        # User login
POST /api/v1/auth/refresh-token # Refresh access token
POST /api/v1/auth/forgot-password # Request password reset
POST /api/v1/auth/reset-password # Reset password
GET  /api/v1/auth/verify-email/:token # Verify email
```

### User Management
```
GET  /api/v1/users/profile     # Get user profile
PUT  /api/v1/users/profile     # Update profile
POST /api/v1/users/change-password # Change password
POST /api/v1/users/avatar      # Upload avatar
DELETE /api/v1/users/account   # Delete account
```

### Assessment System
```
GET  /api/v1/assessments       # List assessments
POST /api/v1/assessments       # Create assessment (Recruiter+)
GET  /api/v1/assessments/:id   # Get assessment details
POST /api/v1/assessments/:id/start # Start assessment
PUT  /api/v1/assessments/:id/submit # Submit assessment
```

### Code Execution
```
POST /api/v1/submissions/execute # Execute code
GET  /api/v1/submissions/:id     # Get submission details
```

### Analytics
```
GET  /api/v1/analytics/dashboard # User dashboard data
GET  /api/v1/analytics/performance # Performance analytics
GET  /api/v1/analytics/candidates # Candidate analytics (Recruiter+)
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🐳 Docker Deployment

### Development
```bash
docker-compose up -d
```

### Production
```bash
# Build image
docker build -t techhire-backend .

# Run container
docker run -p 5000:5000 --env-file .env techhire-backend
```

## 🔒 Security Considerations

### Code Execution Security
- **Sandboxed Execution**: All code runs in isolated Docker containers
- **Resource Limits**: CPU and memory constraints prevent abuse
- **Network Isolation**: No network access during code execution
- **Timeout Protection**: Execution time limits prevent infinite loops

### Data Protection
- **Encryption**: Passwords hashed with bcrypt (12 rounds)
- **JWT Security**: Short-lived access tokens with refresh rotation
- **Input Validation**: All inputs validated and sanitized
- **SQL Injection**: Prevented through Prisma ORM
- **Rate Limiting**: API endpoints protected against abuse

### Privacy & Compliance
- **Audit Logging**: All user actions logged for compliance
- **Data Retention**: Configurable data retention policies
- **GDPR Compliance**: User data export and deletion capabilities
- **Secure File Storage**: Audio recordings stored securely in S3

## 📊 Monitoring & Logging

### Application Logs
- **Winston Logger**: Structured logging with multiple transports
- **Log Levels**: Error, warn, info, debug levels
- **Log Rotation**: Automatic log file rotation
- **Error Tracking**: Comprehensive error logging and tracking

### Health Monitoring
```bash
GET /health  # Application health check
```

### Metrics
- Response times and throughput
- Database query performance
- Cache hit rates
- Error rates and types

## 🚀 Deployment

### Environment Variables
Key environment variables for production:

```bash
NODE_ENV=production
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=your-secret-key
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
SMTP_HOST=...
SMTP_USER=...
SMTP_PASS=...
```

### CI/CD Pipeline
The project includes GitHub Actions workflows for:
- **Testing**: Automated test runs on PR/push
- **Security**: Dependency vulnerability scanning
- **Building**: Docker image creation
- **Deployment**: Automated deployment to staging/production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write tests for new features
- Update documentation
- Follow conventional commit messages
- Ensure all tests pass before submitting PR

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review existing issues and discussions

---

Built with ❤️ by the TechHire Analytics Team