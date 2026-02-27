# HostelOps - Hostel Complaint Management System

A full-stack web application for managing hostel maintenance complaints with role-based access control for students and administrators.

## Features

### Student Features
- User registration and login
- Submit maintenance complaints with category, description, and priority
- View personal complaints with status tracking
- Real-time status updates (Pending → In Progress → Resolved)

### Admin Features
- Admin login
- View all complaints from all students
- Filter complaints by category and status
- Update complaint status
- View student information for each complaint
- Dashboard with complaint statistics

## Technology Stack

### Backend
- **Node.js** with Express.js
- **Sequelize ORM** with SQLite database
- **JWT** for authentication
- **bcryptjs** for password hashing
- **CORS** enabled for cross-origin requests

### Frontend
- **React** 18.x
- **React Router** for navigation
- **Axios** for API calls
- **Context API** for state management
- Responsive CSS design

## Project Structure

```
Hostelops/
├── backend/
│   ├── config/
│   │   └── database.js          # Database configuration
│   ├── models/
│   │   ├── User.js              # User model with password hashing
│   │   └── Complaint.js         # Complaint model
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   └── complaints.js        # Complaint CRUD routes
│   ├── middleware/
│   │   └── auth.js              # JWT authentication middleware
│   ├── server.js                # Express server entry point
│   ├── package.json
│   └── .env                     # Environment variables
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── pages/
    │   │   ├── Register.js      # Registration page
    │   │   ├── Login.js         # Login page
    │   │   ├── StudentDashboard.js
    │   │   └── AdminDashboard.js
    │   ├── App.js               # Main app with routing
    │   ├── index.js             # React entry point
    │   ├── api.js               # API client configuration
    │   ├── AuthContext.js       # Authentication context
    │   └── index.css            # Global styles
    └── package.json
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. The `.env` file is already configured with default values:
```env
PORT=5000
JWT_SECRET=your_jwt_secret_key_change_in_production
NODE_ENV=development
```

4. Start the backend server:
```bash
npm start
```

The backend will run on `http://localhost:5000`

For development with auto-reload:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the React development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000` and automatically proxy API requests to the backend.

## API Endpoints

### Authentication
- `POST /api/register` - Register a new user
- `POST /api/login` - Login user

### Complaints (Student)
- `POST /api/complaints` - Submit a new complaint (requires authentication)
- `GET /api/complaints/my` - Get logged-in student's complaints

### Complaints (Admin)
- `GET /api/complaints` - Get all complaints (admin only)
- `GET /api/complaints?status=Pending` - Filter by status
- `GET /api/complaints?category=Electrical` - Filter by category
- `PUT /api/complaints/:id` - Update complaint status (admin only)

## Database Schema

### Users Table
- `id` - Primary key
- `name` - User's full name
- `email` - Unique email address
- `password` - Hashed password
- `role` - Either 'student' or 'admin'
- `createdAt` - Timestamp
- `updatedAt` - Timestamp

### Complaints Table
- `id` - Primary key
- `userId` - Foreign key to Users
- `category` - One of: Electrical, Plumbing, Cleaning, Other
- `description` - Text description (10-1000 chars)
- `priority` - One of: Low, Medium, High
- `status` - One of: Pending, In Progress, Resolved (default: Pending)
- `createdAt` - Timestamp
- `updatedAt` - Timestamp

## Usage Guide

### For Students

1. **Register**: Create an account by selecting "Student" role
2. **Login**: Use your credentials to access the student dashboard
3. **Submit Complaint**: Fill out the form with:
   - Category (Electrical, Plumbing, Cleaning, Other)
   - Priority (Low, Medium, High)
   - Description (minimum 10 characters)
4. **Track Status**: View all your complaints with current status

### For Administrators

1. **Register/Login**: Create account with "Admin" role or login
2. **View All Complaints**: See complaints from all students
3. **Filter**: Use filters to view complaints by:
   - Status (Pending, In Progress, Resolved)
   - Category (Electrical, Plumbing, Cleaning, Other)
4. **Update Status**: Click action buttons to change complaint status
5. **View Statistics**: Dashboard shows total and category-wise counts

## Security Features

- **Password Hashing**: All passwords are hashed using bcryptjs
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Separate access for students and admins
- **Input Validation**: Server-side validation for all inputs
- **Protected Routes**: Frontend routes protected by authentication

## Status Workflow

```
Pending → In Progress → Resolved
   ↑          ↓            ↓
   ←──────────←────────────←
```

Admins can move complaints between any status as needed.

## Testing the Application

### Test User Accounts

After starting the application, register test accounts:

**Student Account:**
- Name: John Doe
- Email: student@test.com
- Password: student123
- Role: Student

**Admin Account:**
- Name: Admin User
- Email: admin@test.com
- Password: admin123
- Role: Admin

### Test Scenarios

1. Register as a student and submit multiple complaints
2. Login as admin and view all complaints
3. Filter complaints by status and category
4. Update complaint status and verify changes
5. Login back as student to see updated status

## Development Notes

- Database is SQLite (file: `backend/database.sqlite`)
- Database is automatically created on first run
- Frontend proxy is configured in `package.json` to avoid CORS issues
- JWT tokens expire after 7 days
- All API responses follow consistent JSON format

## Production Deployment Checklist

- [ ] Change `JWT_SECRET` in `.env` to a strong random string
- [ ] Switch from SQLite to PostgreSQL/MySQL
- [ ] Add rate limiting to prevent abuse
- [ ] Enable HTTPS
- [ ] Add email verification
- [ ] Implement password reset functionality
- [ ] Add comprehensive error logging
- [ ] Create database backups

## Troubleshooting

### Backend won't start
- Check if port 5000 is available
- Ensure all dependencies are installed
- Verify `.env` file exists

### Frontend won't connect to backend
- Ensure backend is running on port 5000
- Check proxy configuration in `frontend/package.json`
- Clear browser cache

### Database errors
- Delete `database.sqlite` and restart backend to recreate
- Check file permissions

## License

This project is created for educational purposes.

## Support

For issues or questions, please check the code comments or create an issue in the repository.
