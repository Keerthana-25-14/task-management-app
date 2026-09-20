# Task Management App

A full-stack Task Management application that allows users to register, log in securely, create and manage tasks, and organize tasks using a calendar.

## 🚀 Live Demo

[Open Task Management App](https://glistening-nourishment-production-a42a.up.railway.app/)

## ✨ Features

- User registration and login
- Secure password hashing with bcrypt
- JWT-based authentication
- Create tasks
- Edit tasks
- Mark tasks as completed
- Delete tasks
- Calendar view
- Task count and indicators on due dates
- View tasks for a selected date
- Persistent task storage using MySQL
- Responsive frontend interface

## 🛠️ Technologies Used

### Frontend
- HTML
- CSS
- JavaScript

### Backend
- Node.js
- Express.js
- JWT
- bcryptjs

### Database
- MySQL

### Deployment
- Railway

## 📁 Project Structure

```text
task-management-app/
│
├── backend/
│   ├── auth.js
│   ├── db.js
│   ├── middleware.js
│   ├── package.json
│   ├── server.js
│   └── tasks.js
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   └── package.json
│
├── .gitignore
└── README.md
