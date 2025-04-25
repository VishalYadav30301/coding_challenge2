# Leave Management System

A robust and scalable Leave Management System built with NestJS, MongoDB, and AWS S3. This system provides a complete solution for managing employee leave requests, approvals, and notifications.

## Features

- 🔐 **Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control
  - Secure password management
  - Email verification
  - OTP-based password reset

- 👤 **User Management**
  - User registration and profile management
  - Profile picture upload to AWS S3
  - User roles and permissions

- 📝 **Leave Management**
  - Leave request submission
  - Leave approval workflow
  - Leave balance tracking
  - Leave history

- 📧 **Notification System**
  - Email notifications
  - Real-time updates
  - Custom notification templates

- 🗄️ **Data Storage**
  - MongoDB for data persistence
  - Redis for caching
  - AWS S3 for file storage

## Tech Stack

- **Backend Framework:** NestJS
- **Database:** MongoDB with Mongoose
- **Cache:** Redis
- **File Storage:** AWS S3
- **Authentication:** JWT, Passport
- **Email Service:** Nodemailer
- **Logging:** Winston
- **Testing:** Jest
- **Documentation:** Swagger

## Prerequisites

- Node.js (v16 or higher)
- MongoDB
- Redis
- AWS Account (for S3)
- npm or yarn

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Application
PORT=3000
NODE_ENV=development

# MongoDB
MONGODB_URI=your_mongodb_uri

# JWT
JWT_SECRET=your_jwt_secret

# AWS
AWS.AWS_REGION=your_aws_region
AWS.AWS_ACCESS_KEY_ID=your_aws_access_key
AWS.AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS.AWS_S3_BUCKET_NAME=your_s3_bucket_name

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Email
SMTP_HOST=your_smtp_host
SMTP_PORT=your_smtp_port
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
```

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd leave-management-system
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start the development server:
```bash
npm run start:dev
```

## API Documentation

The API documentation is available at `/api` when the server is running. It provides detailed information about all available endpoints, request/response formats, and authentication requirements.

## Available Scripts

- `npm run build` - Build the application
- `npm run start` - Start the application
- `npm run start:dev` - Start the application in development mode
- `npm run start:debug` - Start the application in debug mode
- `npm run start:prod` - Start the application in production mode
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:cov` - Run tests with coverage
- `npm run test:e2e` - Run end-to-end tests

## Project Structure

```
src/
├── auth/           # Authentication module
├── users/          # User management module
├── leave/          # Leave management module
├── notification/   # Notification module
├── common/         # Common utilities and services
├── s3_bucket/      # AWS S3 integration
├── redis/          # Redis cache integration
└── main.ts         # Application entry point
```

## API Endpoints

### Authentication
- `POST /users/api/v1/signup` - Register a new user
- `POST /users/api/v1/login` - User login
- `POST /users/api/v1/forget-password` - Request password reset
- `POST /users/api/v1/update-password` - Update password
- `POST /users/api/v1/send-otp` - Send OTP
- `POST /users/api/v1/verify-otp` - Verify OTP

### User Management
- `GET /users/api/v1/profile` - Get user profile
- `PATCH /users/api/v1/profile` - Update user profile
- `POST /users/api/v1/upload-url` - Get pre-signed URL for profile picture upload

### Leave Management
- `POST /leave/api/v1/request` - Submit leave request
- `GET /leave/api/v1/history` - Get leave history
- `PATCH /leave/api/v1/approve/:id` - Approve leave request
- `PATCH /leave/api/v1/reject/:id` - Reject leave request

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email [your-email@example.com] or create an issue in the repository.
