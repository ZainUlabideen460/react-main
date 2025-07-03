# 📚 Smart Course Planner

> A Final Year Project (FYP) developed at University Institute of Information Technology, Pir Mehr Ali Shah Arid Agriculture University, Rawalpindi.

The Smart Course Planner is a web and mobile application designed to automate and streamline the creation and management of university course timetables. It offers both manual and automated timetable generation with real-time notifications, course uploads, classroom management, and support for multiple user roles (Admin, Teacher, Student).

---

## 👨‍💻 Project Members

| Sr. | Registration No. | Name                        | Role              |
|-----|------------------|-----------------------------|-------------------|
| 1   | 21-Arid-483      | Muhammad Zain ul Abideen   | Team Leader / Backend |
| 2   | 21-Arid-496      | Saad Ahmad                 | Frontend Developer |
| 3   | 21-Arid-517      | Syed Muhammad Fasih Shah  | Mobile Developer / UI |

---

## 🧩 Key Features

- 🔐 Multi-user authentication (JWT)
- 📅 Manual & auto timetable generation
- 🏫 Classroom & infrastructure management
- ⏰ Real-time schedule notifications (Socket.IO)
- ⬆️ Bulk course upload (CSV/Excel)
- 👨‍🏫 Class status updates (Held, Cancelled, Rescheduled)
- 📱 Mobile app (React Native)
- 📊 User activity tracking and logging
- 🛟 Help center with support resources

---

## 🛠️ Technologies Used

### Frontend
- React.js
- Chakra UI

### Backend
- Node.js
- Express.js
- Prisma ORM
- MySQL
- Multer (file upload)
- JWT (authentication)
- Socket.IO (real-time alerts)
- NodeMailer (email notifications)

### Mobile
- React Native (Android & iOS)

---

## 📂 Folder Structure


---

## ⚙️ Installation & Setup
 ## Front end run
 cd course-alotment-FE-main
 npm start
 ## backend run
 cd course-alotment-server
 node --watch index.js
 ## mobile app run
 cd fypapp
 npx expo start
### Prerequisites

- Node.js v16+ (install from [nodejs.org](https://nodejs.org/))
- Git
- Access to the backend APIs (running separately)

### Steps

1. **Clone the repo**

   ```bash
   git clone https://github.com/ZainUlabideen460/react-main.git
   cd react-main
