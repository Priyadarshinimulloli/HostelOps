

🏠 HostelOps – Dockerized & Cloud-Deployed Hostel Complaint Management System

A full-stack, containerized web application for managing hostel maintenance complaints with secure role-based access control, deployed on an AWS EC2 cloud server.

🚀 Project Overview

HostelOps is a complaint management system designed to:

Digitize hostel maintenance workflows

Provide secure role-based access for Students and Admins

Ensure scalable deployment using Docker

Host the application on AWS EC2 for real-world cloud deployment

The system follows a layered and containerized architecture deployed on a cloud virtual server.

☁️ Cloud Deployment (AWS EC2)

The application is deployed on an EC2 (Elastic Compute Cloud) instance.

Why EC2?

Provides virtual server in the cloud

Scalable compute resources

Remote access via SSH

Suitable for hosting Dockerized applications

Pay-as-you-go infrastructure

Deployment Architecture

Client (Browser)
↓
Public IP of EC2 Instance
↓
Nginx (Docker Container)
↓
Backend API (Docker Container)
↓
SQLite Database (inside container with volume)

🐳 Docker Architecture

The application is containerized into separate services:

frontend container (React)

backend container (Node + Express)

nginx container (Reverse proxy & static serving)

database (SQLite with persistent volume)

Docker Compose is used to manage multi-container setup.

Benefits:

Environment consistency

Easy deployment on EC2

Isolation of services

Simplified scaling

🛠 Technology Stack
Backend

Node.js

Express.js

SQLite

JWT Authentication

Frontend

React 18

React Router

Axios

Context API

Deployment

Docker

Docker Compose

Nginx

AWS EC2 (Linux server)

🔐 Security Features

Password hashing using bcrypt

JWT-based authentication

Role-Based Access Control (RBAC)

Admin-only protected routes

Server-side validation

CORS configuration

📁 Project Structure
Hostelops/
├── backend/
├── frontend/
├── docker-compose.yml
└── README.md
🗄 Database Design

Users Table

id

name

email (unique)

password (hashed)

role (student/admin)

Complaints Table

id

userId (foreign key)

category

description

priority

status

timestamps

Relationship:
One User → Many Complaints

🔄 Complaint Workflow

Pending → In Progress → Resolved

Admins can update complaint status as needed.

🧪 Testing & Deployment Flow

Build Docker images

Push project to EC2

SSH into EC2

Run docker-compose up -d

Access application via EC2 public IP

⚙ Production Improvements (Future Scope)
Switch SQLite to PostgreSQL

Enable HTTPS using SSL

Add rate limiting

Add monitoring & logging

Implement auto-scaling

🎯 Learning Outcomes

Full-stack development

REST API design

Authentication & authorization

Docker containerization

Cloud deployment using AWS EC2

Reverse proxy configuration

Secure complaint workflow management
