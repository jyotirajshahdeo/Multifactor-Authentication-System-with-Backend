Authentication Backend Service
This is the backend service for the authentication system with multi-factor authentication support, including biometric authentication capabilities.

Prerequisites
Node.js (v20+ or higher)
MySQL (v8.0 or higher)
npm or yarn package manager
Setup Instructions
Clone the repository

git clone <repository-url>
cd authbackend
Install dependencies

npm install
Environment Setup Create a .env file in the root directory with the following variables:

PORT=5000
{ "development": { "username": "", "password": "", "database": "Auth_Service", "host": "127.0.0.1", "dialect": "mysql" } }

Database Setup

# Navigate to the project directory (if needed)
cd src
Initialize Sequelize (creates config, models, migrations, seeders folders)
npx sequelize-cli init ( not needed, bcz migration file is alredy their )

Create the database
npx sequelize-cli db:create

Run all pending migrations
npx sequelize-cli db:migrate


5. **Start the Server**
```bash
# Development mode
npm run dev

# Production mode
npm start
API Endpoints
Authentication
POST /api/auth/register - Register a new user
POST /api/auth/login - User login
POST /api/auth/verify-otp - Verify OTP
POST /api/auth/verify-biometric - Verify biometric authentication
User Management
GET /api/users/profile - Get user profile
PUT /api/users/profile - Update user profile
DELETE /api/users/profile - Delete user account
Security Features
JWT-based authentication
Password hashing using bcrypt
Multi-factor authentication support
Biometric authentication integration
CORS protection
Environment variable configuration
Dependencies
Express.js - Web framework
Sequelize - ORM for database operations
MySQL2 - MySQL client
JWT - JSON Web Tokens
bcryptjs - Password hashing
cors - Cross-Origin Resource Sharing
dotenv - Environment variable management
Development
To run the server in development mode with hot-reload:

npm run dev
Production Deployment
Set up environment variables in production
Build and optimize the application
Use a process manager like PM2
Set up proper security measures (HTTPS, rate limiting, etc.)
Contributing
Fork the repository
Create your feature branch
Commit your changes
Push to the branch
Create a new Pull Request
Package used for security purposes
bcrypt
crypto ( algo used inside this :- MD5, SHA, RIPEMD-160, HMAC, PBKDF2 for multiple purposes)
Database lavel preview
mysql -u root/<user_name/> -p
password
show databases;
user ;
show tables;
desc <table_name /> ( to view the schema of database )
SELECT * FROM <table_name/> ( to see the data of desired table )

Biometric Authentication Implementation
This document provides instructions for implementing biometric authentication in the application.

Overview
The biometric authentication system uses the WebAuthn API to provide secure, passwordless authentication using biometric devices (fingerprint, face recognition, etc.).

Frontend Implementation
The frontend implementation consists of:

BiometricLogin Component: A standalone component for biometric login
Dashboard Component: A simple dashboard that users are redirected to after successful login
Route Configuration: Routes for the biometric login and dashboard pages
Backend Requirements
The backend needs to implement the following endpoints:

Start Verification: /biometric/verify/start

Accepts: { email: string }
Returns: WebAuthn authentication options including challenge
Finish Verification: /biometric/verify/finish

Accepts: { email: string, assertionResponse: object }
Returns: Verification result
Implementation Steps
1. Install Required Packages
npm install base64url
2. Configure Environment Variables
Make sure your .env file includes:

VITE_API_BASE_URL=http://your-api-url
3. Backend Implementation
The backend should:

Generate authentication options with a challenge
Store the challenge for later verification
Verify the assertion response against the stored challenge
Update the user's authentication status
4. Testing
To test the biometric login:

Navigate to /biometric-login
Enter your email
Follow the browser's prompts to authenticate with your biometric device
Upon successful authentication, you'll be redirected to the dashboard
Troubleshooting
"Failed to resolve import 'base64url'": Make sure you've installed the package with npm install base64url
"API endpoint not found": Ensure your backend has implemented the required endpoints
"Device authentication failed": Check that your device supports WebAuthn and has biometric capabilities
Security Considerations
Always use HTTPS in production
Implement proper session management
Consider rate limiting for authentication attempts
Store credentials securely using appropriate encryption
