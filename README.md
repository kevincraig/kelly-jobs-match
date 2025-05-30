# Kelly Jobs Match

Kelly Jobs Match is an intelligent job matching system that helps job seekers find their perfect match by analyzing their skills, experience, and preferences. The system provides personalized job recommendations and allows users to search for jobs based on various criteria.

## Features

- User authentication and profile management
- Skill-based job matching
- Advanced job search with filters
- Job recommendations based on user profile
- Responsive and modern UI
- Real-time job matching scores
- Job detail views
- Save and manage favorite jobs

## Tech Stack

### Frontend
- React 18
- React Router v7
- TailwindCSS
- Lucide React (Icons)
- Axios for API calls

### Backend
- Node.js
- Express.js
- PostgreSQL
- Redis (for caching)

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v16 or higher)
- npm (v7 or higher)
- Docker and Docker Compose
- Git

### Windows-Specific Requirements
- Docker Desktop for Windows
- PowerShell 5.1 or higher
- Windows Terminal (recommended)
- WSL2 (Windows Subsystem for Linux) - recommended for better Docker performance

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/kelly-jobs-match.git
cd kelly-jobs-match
```

2. Run the setup script:

For Unix-based systems (macOS/Linux):
```bash
chmod +x setup.sh
./setup.sh
```

For Windows:
```powershell
# Open PowerShell as Administrator and run:
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
.\setup.ps1
```

This script will:
- Start PostgreSQL and Redis using Docker Compose
- Install frontend dependencies
- Install backend dependencies
- Set up environment variables

The following services will be available:
- PostgreSQL: localhost:5432
- Redis: localhost:6379

### Windows-Specific Setup Notes
1. Make sure Docker Desktop is running before executing the setup script
2. If you encounter permission issues:
   - Run PowerShell as Administrator
   - Execute `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser`
3. If you experience slow Docker performance:
   - Enable WSL2 backend in Docker Desktop settings
   - Allocate more resources to Docker Desktop in its settings

3. Configure environment variables:
   - Copy `.env.example` to `.env` in the backend directory
   - Update the environment variables as needed
   - Make sure to set the Redis connection URL (default: redis://localhost:6379)

4. Start the development servers:

In one terminal:
```bash
cd backend
npm run dev
```

In another terminal:
```bash
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Project Structure

```
kelly-jobs-match/
├── frontend/           # React frontend application
├── backend/           # Node.js backend server
├── shared/           # Shared utilities and types
├── docker-compose.yml # Docker configuration
├── setup.sh          # Setup script for Unix-based systems
└── setup.ps1         # Setup script for Windows
```

## Development

### Frontend Development
- The frontend is built with React and uses TailwindCSS for styling
- Main components are located in `frontend/src/components/`
- API services are in `frontend/src/services/`
- Custom hooks are in `frontend/src/hooks/`

### Backend Development
- The backend is a Node.js/Express application
- API routes are defined in `backend/src/routes/`
- Database models are in `backend/src/models/`
- Controllers are in `backend/src/controllers/`
- Redis is used for caching job search results and user sessions

## Testing

To run tests:

Frontend:
```bash
cd frontend
npm test
```

Backend:
```bash
cd backend
npm test
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository or contact the development team. 