# Authentication Backend Service

This is the backend service for the authentication system with multi-factor authentication support, including biometric authentication capabilities.

## Prerequisites

- Node.js (v20+ or higher)
- MySQL (v8.0 or higher)
- npm or yarn package manager

## Setup Instructions

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd authbackend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory with the following variables:

   ```
   PORT=5000
   ```

   {
   "development": {
   "username": "<username/>",
   "password": "<dbpassword/>",
   "database": "Auth_Service",
   "host": "127.0.0.1",
   "dialect": "mysql"
   }
   }

4. **Database Setup**
   ```bash
   # Navigate to the project directory (if needed)
   cd src
   ```

# Initialize Sequelize (creates config, models, migrations, seeders folders)

npx sequelize-cli init ( not needed, bcz migration file is alredy their )

# Create the database

npx sequelize-cli db:create

# Run all pending migrations

npx sequelize-cli db:migrate

````

5. **Start the Server**
```bash
# Development mode
npm run dev

# Production mode
npm start
````

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-otp` - Verify OTP
- `POST /api/auth/verify-biometric` - Verify biometric authentication

### User Management

- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `DELETE /api/users/profile` - Delete user account

## Security Features

- JWT-based authentication
- Password hashing using bcrypt
- Multi-factor authentication support
- Biometric authentication integration
- CORS protection
- Environment variable configuration

## Dependencies

- Express.js - Web framework
- Sequelize - ORM for database operations
- MySQL2 - MySQL client
- JWT - JSON Web Tokens
- bcryptjs - Password hashing
- cors - Cross-Origin Resource Sharing
- dotenv - Environment variable management

## Development

To run the server in development mode with hot-reload:

```bash
npm run dev
```

## Production Deployment

1. Set up environment variables in production
2. Build and optimize the application
3. Use a process manager like PM2
4. Set up proper security measures (HTTPS, rate limiting, etc.)

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## Package used for security purposes

1. bcrypt
2. crypto ( algo used inside this :- MD5, SHA, RIPEMD-160, HMAC, PBKDF2 for multiple purposes)

## Database lavel preview

1. mysql -u root/<user_name/> -p
2. password
3. show databases;
4. user <desired database />;
5. show tables;
6. desc <table_name /> ( to view the schema of database )
7. SELECT * FROM <table_name/> ( to see the data of desired table )