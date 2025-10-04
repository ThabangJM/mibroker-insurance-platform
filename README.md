# MiBroker - Insurance Automation Platform

A comprehensive insurance broker automation platform built with React (frontend) and Node.js/Express (backend). The platform enables users to compare insurance quotes, manage policies, and provides analytics for brokers.

## 🚀 Features

### Frontend (React + TypeScript)
- **Quote Generation**: Multi-step form for different insurance types
- **Quote Comparison**: Side-by-side comparison of insurance providers
- **Policy Management**: Complete policy lifecycle management
- **User Authentication**: Secure login and registration
- **Analytics Dashboard**: Comprehensive business insights
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Type Safety**: Full TypeScript implementation

### Backend (Node.js + Express)
- **RESTful API**: Complete API for all platform functionality
- **JWT Authentication**: Secure user authentication and authorization
- **Rate Limiting**: Protection against abuse and DoS attacks
- **Mock Data**: Development-ready with realistic mock data
- **Comprehensive Endpoints**: Support for all frontend features
- **Error Handling**: Robust error handling and logging

## 📦 Project Structure

```
project/
├── src/                    # Frontend React application
│   ├── components/         # React components
│   ├── services/          # API services
│   └── types/             # TypeScript type definitions
├── server/                # Backend Express application
│   ├── routes/            # API route handlers
│   ├── server.js          # Main server file
│   ├── package.json       # Backend dependencies
│   └── README.md          # Backend documentation
├── supabase/              # Database functions
├── package.json           # Frontend dependencies
└── README.md              # This file
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Frontend Setup
1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

### Backend Setup
1. Navigate to server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment variables:
```bash
# Copy .env and update values as needed
cp .env.example .env
```

4. Start development server:
```bash
npm run dev
```

5. Start production server:
```bash
npm start
```

## 🌐 API Endpoints

The backend provides comprehensive REST API endpoints:

### Core Services
- **Authentication**: User registration, login, profile management
- **Quotes**: Generate, compare, and manage insurance quotes
- **Policies**: Policy lifecycle management and documentation
- **Analytics**: Business intelligence and reporting
- **Providers**: Insurance provider information and comparison

### Base URLs
- Frontend: `http://localhost:5174` (development)
- Backend API: `http://localhost:3001/api` (development)

For detailed API documentation, see [server/README.md](./server/README.md)

## 🔧 Configuration

### Frontend Configuration
- **Vite**: Modern build tool with HMR
- **Tailwind CSS**: Utility-first CSS framework
- **TypeScript**: Type safety and better developer experience
- **ESLint**: Code linting and style consistency

### Backend Configuration
- **Express.js**: Web application framework
- **JWT**: Authentication and authorization
- **bcryptjs**: Password hashing
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Request throttling
- **Morgan**: HTTP request logging

## 🚀 Deployment

### Frontend Deployment
```bash
# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

### Backend Deployment
```bash
# In server directory
npm start
```

## 🧪 Testing

### Frontend Testing
```bash
# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Backend Testing
```bash
# In server directory
npm test
```

## 📋 Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:3001/api
```

### Backend (.env)
```
NODE_ENV=development
PORT=3001
API_VERSION=v1
FRONTEND_URL=http://localhost:5174
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

## 🎯 Insurance Types Supported

- **Commercial Property Insurance**
- **Auto Insurance**  
- **Home Insurance**
- **Life Insurance**
- **Business Insurance**
- **Public Liability Insurance**
- **Engineering & Construction Insurance**

## 📊 Key Features in Detail

### Quote Generation System
- Multi-step forms with validation
- Real-time quote calculations
- Provider comparison matrix
- Save and resume functionality
- Email quote summaries

### Policy Management
- Policy creation from accepted quotes
- Document management and storage
- Renewal notifications and processing
- Cancellation handling
- Claims tracking integration

### Analytics Dashboard
- Revenue tracking and projections
- Quote conversion funnel analysis
- Provider performance metrics
- User behavior analytics
- Custom date range filtering

### User Experience
- Responsive design for all devices
- Progressive web app capabilities
- Accessibility compliance (WCAG 2.1)
- Multi-language support ready
- Dark/light mode toggle

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting and DoS protection
- CORS configuration
- Input validation and sanitization
- SQL injection prevention
- XSS protection headers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎉 Acknowledgments

- Built with modern React and Node.js best practices
- Inspired by leading insurance technology platforms
- Designed with South African insurance market requirements
- Compliant with FAIS (Financial Advisory and Intermediary Services) regulations

## 📞 Support

For support and questions:
- Create an issue in the repository
- Review the API documentation in `/server/README.md`
- Check the frontend component documentation

---

**MiBroker** - Simplifying insurance broker operations through technology.