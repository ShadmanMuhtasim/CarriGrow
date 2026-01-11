Project Title : Smart Hospital Solutions – A Hospital Management System

---

## Team Members

1. Muskikim Musa
   - Role: Team Lead  
   - Email: mustakim.official.0101@gmail.com  
   - ID: 20230104122  

2. Shadman Muhtasim  
   - Role: Back-end Developer  
   - Email: nksoag2006@gmail.com  
   - ID: 20230104110  

3. Ahbab Hassan 
   - **Role:** Front-end Developer  
   - **Email:** hasan100.official@gmail.com  
   - **ID:** 20230104119  

4. Eastiak Ahmed
   - Role: Front-end Developer  
   - Email: easteak.cse.20230104123@aust.edu  
   - ID: 20230104123  

---

## Project Overview

### Objective
Smart Hospital Solutions is a complete hospital management web application designed to digitalize core hospital services such as user role management, staff onboarding, appointment booking, department-based doctor browsing, hospital bed availability tracking, and admission requests. The system ensures a smooth workflow between patients and hospital staff with role-based dashboards and approval-based employee onboarding.

### Target Audience
- Hospital patients  
- Doctors, nurses, and hospital employees  
- Hospital administrative staff  
- Hospital IT staff / system operators  

---

## Tech Stack

### Backend
- Laravel (REST API)

### Database
- MySQL database

### Frontend
- React.js  
- Tailwind CSS / Bootstrap  

### Rendering Method
- Client-Side Rendering (CSR)

---

## UI Design
- Mock UI is designed using **Figma** to visualize the overall layout and user flow  
- **Figma Link:** *(Not added yet )*  

---

## Project Features

### Core Features
- Multi-role authentication system (**Patient, Doctor, Nurse, IT Staff, Admin**)  
- JWT-based login & registration  
- Email verification using OTP  
- Password reset using OTP (sent to email)  
- Staff onboarding workflow:
  - Doctor/Nurse/IT can register but their job status stays **Pending**
  - Admin reviews and approves job requests
  - After approval, status becomes **Accepted** and they become employees

### Appointment Management
- Patients can apply for booking an appointment  
- Appointment is finalized only after the **doctor accepts** the request  
- Appointment request workflow :
  - Requested → Accepted / Rejected → Completed

### Department & Doctor Discovery
- Hospital has multiple departments  
- Doctors are listed under departments  
- Patients can:
  - Filter doctors by department  
  - Search doctors by name  

### Bed Availability & Admission Booking
- System displays available beds in real-time by category:
  - Normal  
  - VIP  
  - VVIP  
  - ICU  
  - NICU  
- Patients can request admission/booking based on available bed types  

### Medical Vlogs
- Doctors can post medical vlogs for patient awareness and education  
- Patients can browse/view medical vlogs *(as per implementation)*  

---

## CRUD Operations
- Users (Patients + Staff + Admin)  
- Departments  
- Doctor Profiles (under departments)  
- Appointments  
- Beds / Ward Types (Normal, VIP, VVIP, ICU, NICU)  
- Admission Requests  
- Medical Vlogs  

---

## API Endpoints (Approximate)

### Auth
- `POST /auth/register`  
- `POST /auth/login`  
- `POST /auth/verify-email` *(OTP verification)*  
- `POST /auth/request-password-reset` *(send OTP)*  
- `POST /auth/reset-password` *(verify OTP + reset)*  

### Staff Job Requests (Admin Approval)
- `POST /staff/register` *(Doctor/Nurse/IT → Pending)*  
- `GET /admin/staff/pending`  
- `PUT /admin/staff/{id}/approve`  
- `PUT /admin/staff/{id}/reject`  

### Departments & Doctors
- `GET /departments`  
- `GET /doctors` *(filter by department, search by name)*  
- `GET /doctors/{id}`  

### Appointments
- `POST /appointments` *(patient applies)*  
- `GET /appointments` *(role-based list)*  
- `PUT /appointments/{id}/accept` *(doctor accepts)*  
- `PUT /appointments/{id}/reject` *(doctor rejects)*  

### Beds & Admissions
- `GET /beds/availability`  
- `POST /admissions` *(patient requests admission)*  

### Medical Vlogs
- `GET /vlogs`  
- `POST /vlogs` *(doctor creates)*  
- `PUT /vlogs/{id}`  
- `DELETE /vlogs/{id}`  

---


## Milestones

### Milestone 1: Core Foundation & Authentication

* Setup monorepo (Laravel backend + React frontend)
* Implement JWT-based authentication for all roles
* Implement email OTP verification
* Create basic UI layout (Navbar, Sidebar, Role-based dashboards)
* Implement staff job request system (Pending/Accepted workflow)

### Milestone 2: Hospital Operations & Management

* Departments CRUD
* Doctor listing under departments
* Patient doctor filtering + searching
* Appointment booking + doctor acceptance flow
* Show bed availability (Normal/VIP/VVIP/ICU/NICU)
* Admission request feature for patients

### Milestone 3: Content & Finalization

* Medical vlog posting module for doctors
* OTP-based password reset system
* Performance optimization
* Final testing, bug fixing, and deployment






