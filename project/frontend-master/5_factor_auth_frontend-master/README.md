# Authentication Frontend Service

This is the frontend service for the authentication system that provides a modern, responsive user interface for authentication operations including biometric authentication.

## Prerequisites

- Node.js (v18.18 or higher)
- npm or yarn package manager
- Modern web browser with biometric authentication support

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Authservice
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory with the following variables:
   ```
   VITE_API_URL=http://localhost:3000
   VITE_APP_NAME=AuthService
   ```

4. **Start the Development Server**
   ```bash
   npm run dev
   ```

## Features

- User Registration
- Login with Email/Password
- Biometric Authentication
- Multi-factor Authentication
- Profile Management
- Responsive Design
- Modern UI/UX

## Project Structure

```
Authservice/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Page components
│   ├── services/      # API services
│   ├── utils/         # Utility functions
│   ├── hooks/         # Custom React hooks
│   └── context/       # React context providers
├── public/            # Static assets
└── utils/            # Utility functions
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Dependencies

- React - UI library
- Vite - Build tool
- Axios - HTTP client
- React Router - Routing
- TailwindCSS - Styling
- ESLint - Linting
- Prettier - Code formatting

## Biometric Authentication

The application supports biometric authentication using the Web Authentication API. See `README-BIOMETRIC.md` for detailed information about biometric authentication implementation.

## Development Guidelines

1. Follow the established code style
2. Write meaningful commit messages
3. Create feature branches for new functionality
4. Update documentation as needed
5. Test thoroughly before submitting PRs

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License.
