# Inv_TimeSheetMgmt Frontend

A modern React-based timesheet management application for BPO operations, designed to be embedded into EGIS Dynamics CRM systems.

## Features

- **User Authentication**: Secure JWT-based authentication
- **Role-Based Access**: Team members, campaign leads, and administrators
- **Timesheet Management**: Clock in/out, break tracking, approval workflow
- **Campaign Management**: Organize work by campaigns and schedules
- **Reporting & Analytics**: Comprehensive reporting with export capabilities
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Updates**: Live data synchronization with backend API

## Technology Stack

- **Frontend**: React 19, Vite, Tailwind CSS
- **UI Components**: Radix UI, shadcn/ui
- **Routing**: React Router DOM
- **State Management**: React Context API
- **Charts**: Recharts
- **Icons**: Lucide React
- **Backend API**: Flask (deployed on Railway)
- **Database**: Supabase (PostgreSQL)

## Architecture

```
Frontend (Vercel) ↔ Backend API (Railway) ↔ Database (Supabase)
```

## API Integration

The frontend connects to the backend API at:
- **Production**: https://web-production-c2743.up.railway.app/api
- **Development**: http://localhost:5000/api

## Deployment

This application is configured for deployment on Vercel with automatic environment detection.

### Build Commands
- **Install**: `npm install` or `pnpm install`
- **Build**: `npm run build` or `pnpm build`
- **Preview**: `npm run preview` or `pnpm preview`

### Environment Variables
The application automatically detects the environment and uses the appropriate API endpoint.

## CRM Integration

This application is designed to be embedded into EGIS Dynamics CRM systems via GHL custom menu links. The responsive design ensures compatibility across different embedding contexts.

## Security Features

- JWT token-based authentication
- Role-based access control
- Secure API communication
- Input validation and sanitization
- CORS configuration for cross-origin requests

## Support

For technical support or questions about CRM integration, please contact the development team.

---

**Inv_TimeSheetMgmt** © 2025 - Built for Invictus BPO Operations

