# 💼 Job Portal Web Application

![MERN](https://img.shields.io/badge/MERN-Stack-green)
![Node](https://img.shields.io/badge/Backend-Node.js-brightgreen)
![React](https://img.shields.io/badge/Frontend-React-blue)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-darkgreen)
![JWT](https://img.shields.io/badge/Auth-JWT-orange)
![License](https://img.shields.io/badge/License-MIT-yellow)

A full-stack Job Portal web application built using the MERN Stack (MongoDB, Express.js, React.js, Node.js).  
This platform allows recruiters to post jobs and candidates to apply for jobs seamlessly.

---

## 🌐 Live Demo
https://careerhive-portal.vercel.app/

---

## 🚀 Features

### 👩‍💼 For Recruiters
- Register & Login (JWT Authentication)
- Post new job listings
- Edit/Delete job posts
- View applicants for posted jobs

### 👨‍💻 For Candidates
- Register & Login
- Browse available jobs
- Apply for jobs
- View applied jobs

---

## 🛠️ Tech Stack

### Frontend
- React.js (Vite / CRA)
- Tailwind CSS
- Axios
- React Router DOM

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcrypt.js

---

## 🔐 Authentication & Security
- Password hashing using bcrypt
- JWT-based authentication
- Protected routes
- Role-based authorization (Recruiter / Candidate)

---

## 📂 Project Structure
job-portal/
│
├── client/ # React Frontend
├── server/ # Node.js Backend
│ ├── models/
│ ├── routes/
│ ├── controllers/
│ ├── middleware/
│
├── .env
└── README.md

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository
git clone https://github.com/rosymohanty/Job-Portal.git
cd job-portal

---

### 2️⃣ Backend Setup
cd server
npm install

Create a `.env` file inside server folder:
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key

Run backend:
npm start

---

### 3️⃣ Frontend Setup
cd client
npm install
npm run dev

---

## 🌍 Deployment

- Backend: Render / Railway
- Frontend: Vercel / Netlify
- Database: MongoDB Atlas

---

## 📈 Future Improvements
- Resume upload feature
- Email notifications
- Admin dashboard
- Advanced job filtering
- Pagination

---

## 👩‍💻 Author

**Rojalin Mohanty**  
MCA Student | MERN Stack Developer  
Passionate about building scalable backend systems and solving real-world problems.

---

## ⭐ If you like this project
Give it a star on GitHub!
