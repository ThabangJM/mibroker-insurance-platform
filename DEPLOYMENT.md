# MiBroker Insurance Platform - Deployment Guide

## 🚀 Project Overview

MiBroker is a modern React TypeScript application for insurance quote comparisons and policy management. The platform provides users with personalized insurance quotes from South Africa's leading insurance providers.

## ✨ Features

- **Quote Generation**: Multi-step forms for various insurance types
- **Representative Assignment**: Automated assignment of insurance experts
- **Quote Comparison**: Advanced filtering and sorting of insurance quotes
- **Risk Assessment**: Comprehensive risk evaluation forms
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Professional UI**: Modern interface with loading states and animations

## 🛠 Technology Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Icons**: Lucide React
- **Backend**: Node.js + Express (server folder)
- **Database**: Supabase integration ready

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Git

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/mibroker-insurance-platform.git
cd mibroker-insurance-platform
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start development server
```bash
npm run dev
```

### 4. Build for production
```bash
npm run build
```

## 🌍 Deployment Options

### Option 1: Vercel (Recommended)
1. Push code to GitHub
2. Connect your GitHub repo to Vercel
3. Deploy automatically

### Option 2: Netlify
1. Build the project: `npm run build`
2. Upload the `dist` folder to Netlify
3. Configure redirects for SPA

### Option 3: GitHub Pages
1. Install gh-pages: `npm install --save-dev gh-pages`
2. Add deploy script to package.json
3. Run: `npm run deploy`

## 📁 Project Structure

```
mibroker-insurance-platform/
├── src/
│   ├── components/          # React components
│   ├── pages/              # Page components
│   ├── services/           # API and business logic
│   ├── types/              # TypeScript type definitions
│   └── App.tsx             # Main application component
├── server/                 # Backend server (Node.js)
├── supabase/              # Supabase functions
└── public/                # Static assets
```

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=your_api_url_here
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📄 License

This project is proprietary software owned by MiBroker SA (Pty) Ltd.

## 🤝 Contributing

This is a private project. For any questions or support, contact the development team.

## 📞 Support

For technical support, please contact:
- Email: thabang@dynamicljm.co.za
- Phone: 0860 642 765