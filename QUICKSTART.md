# HostelOps - Quick Start Guide

## Installation Complete! ✅

Both backend and frontend are now set up and ready to use.

## Starting the Application

### Option 1: Running Both Servers Simultaneously

Open **two separate terminals**:

**Terminal 1 - Backend:**
```bash
cd d:\Hostelops\backend
npm start
```
Backend will run on: http://localhost:5000

**Terminal 2 - Frontend:**
```bash
cd d:\Hostelops\frontend
npm start
```
Frontend will run on: http://localhost:3000 and should open automatically in your browser.

### Option 2: Using PowerShell (Current Setup)

The servers are already running in the background!
- Backend: http://localhost:5000
- Frontend: http://localhost:3000

Just open your browser to http://localhost:3000

## First Steps

### 1. Register a Student Account
- Go to http://localhost:3000
- Click "Register here"
- Fill in details:
  - Name: Test Student
  - Email: student@test.com
  - Password: student123
  - Role: Student
- Click "Register"

### 2. Submit a Test Complaint
- You'll be redirected to the Student Dashboard
- Fill out the complaint form:
  - Category: Choose any (Electrical, Plumbing, Cleaning, Other)
  - Priority: Choose any (Low, Medium, High)
  - Description: Type at least 10 characters
- Click "Submit Complaint"
- Your complaint will appear below with "Pending" status

### 3. Register an Admin Account
- Logout (click the Logout button)
- Go to Registration page
- Fill in details:
  - Name: Test Admin
  - Email: admin@test.com
  - Password: admin123
  - Role: Admin
- Click "Register"

### 4. Manage Complaints as Admin
- You'll see the Admin Dashboard
- View all complaints from all students
- Use filters to see specific complaints by:
  - Status (Pending, In Progress, Resolved)
  - Category (Electrical, Plumbing, Cleaning, Other)
- Click "Mark as In Progress" or "Mark as Resolved" to update status

### 5. Check Status Updates as Student
- Logout from admin account
- Login as student (student@test.com / student123)
- Your complaint will now show the updated status!

## Testing the Complete Flow

1. **Student submits complaint** → Status: Pending
2. **Admin views and updates** → Status: In Progress
3. **Admin resolves** → Status: Resolved
4. **Student checks** → Sees "Resolved" status

## API Testing (Optional)

You can also test the API directly using tools like Postman or curl:

### Register
```bash
curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"test123","role":"student"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

## Available Features

### ✅ Student Features
- Registration and login
- Submit complaints with category, description, priority
- View personal complaints
- Track complaint status in real-time

### ✅ Admin Features  
- Admin login
- View all complaints from all students
- Filter by status (Pending, In Progress, Resolved)
- Filter by category (Electrical, Plumbing, Cleaning, Other)
- Update complaint status
- View statistics dashboard

## Troubleshooting

### If Frontend Won't Start
```bash
cd d:\Hostelops\frontend
npm install
npm start
```

### If Backend Won't Start
```bash
cd d:\Hostelops\backend
npm install
npm start
```

### If Database Has Issues
Delete the database file and restart:
```bash
cd d:\Hostelops\backend
Remove-Item database.sqlite
npm start
```

### Port Already in Use
If ports 3000 or 5000 are busy:
- Backend: Change PORT in `backend/.env`
- Frontend: Set REACT_APP_API_URL environment variable

## Project Structure Overview

```
Hostelops/
├── backend/                    # Express.js API
│   ├── config/database.js     # SQLite configuration
│   ├── models/                # Sequelize models
│   ├── routes/                # API endpoints
│   ├── middleware/            # JWT authentication
│   └── server.js              # Entry point
│
└── frontend/                   # React application
    ├── src/
    │   ├── pages/             # All page components
    │   ├── App.js             # Router configuration
    │   ├── api.js             # API client
    │   └── AuthContext.js     # Authentication state
    └── public/
```

## Next Steps

- Add more students and test multiple complaints
- Test all filter combinations in admin panel
- Try updating complaint status through different workflows
- Check the responsive design on mobile

## Support

For full documentation, see [README.md](README.md)

Enjoy using HostelOps! 🎉
