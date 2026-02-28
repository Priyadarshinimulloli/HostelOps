# HostelOps

A full-stack hostel complaint management system with role-based access for students and administrators.

🏠 HostelOps – Dockerized & Cloud-Deployed Hostel Complaint Management System

- User authentication (students and admins)
- Submit and track maintenance complaints
- Real-time status updates (Pending → In Progress → Resolved)
- Admin dashboard for managing all complaints
- Filter and search functionality
- Image attachments for complaints

## Tech Stack

**Backend:** Node.js, Express.js, Sequelize, SQLite, JWT, bcryptjs, Multer  
**Frontend:** React 18, React Router, Axios, Context API  
**DevOps:** Docker, Docker Compose, Nginx

## Installation

### Prerequisites
- Node.js (v14+)
- npm

### Setup

1. Clone the repository
2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```
3. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

### Run the Application

**Backend:**
```bash
cd backend
npm start
```
Server runs on `http://localhost:5000`

**Frontend:**
```bash
cd frontend
npm start
```
App runs on `http://localhost:3000`

### Docker

```bash
docker-compose up
```

## Usage

### Students
1. Register with student role
2. Login to access dashboard
3. Submit complaints with category, priority, and description
4. Optionally attach images (max 5MB)
5. Track complaint status

### Admins
1. Register with admin role
2. View all complaints
3. Filter by status or category
4. Update complaint status

## API Endpoints

### Authentication
- `POST /api/register` - Register user
- `POST /api/login` - Login user

### Complaints
- `POST /api/complaints` - Create complaint (student)
- `GET /api/complaints/my` - Get user's complaints (student)
- `GET /api/complaints` - Get all complaints (admin)
- `PUT /api/complaints/:id` - Update status (admin)

## Database Schema

**Users:** id, name, email, password, role (student/admin)  
**Complaints:** id, userId, category, description, priority, status, imageUrl
