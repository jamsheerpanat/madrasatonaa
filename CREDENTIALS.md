
# 🔐 Madrasatonaa App Credentials

This document contains the default login credentials for the development environment.

## 🏢 Staff Portal
Access at: [http://localhost:3000/login](http://localhost:3000/login)

| Role | Email | Password |
|------|-------|----------|
| **Principal** | `principal@madrasatonaa.com` | `password` |
| **Teacher** | `teacher@madrasatonaa.com` | `password` |
| **Admin** | *(Same as Principal)* | `password` |

---

## 👨‍👩‍👧‍👦 Parent & Student Portal
Access at: [http://localhost:3000/parent-login](http://localhost:3000/parent-login)

Parents log in using their phone number and a One-Time Password (OTP). In the development environment, the OTP is returned in the API response or displayed in an alert.

| User | Phone Number | Default OTP |
|------|--------------|-------------|
| **Parent** | `33333333` | Check browser alert |
| **Student** | `44444444` | Check browser alert |

> **Note:** The "OTP" is intercepted by the frontend in debug mode and shown as a browser alert for easy testing.

---

## 🛠️ Technical Details
- **Backend API**: [http://localhost:8000/api/v1](http://localhost:8000/api/v1)
- **Database**: SQLite (`services/api/database/database.sqlite`)
- **Seeder**: `DemoDataSeeder.php`

---
*Created on: 2026-02-07*
