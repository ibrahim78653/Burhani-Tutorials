# BURHANI TUTORIALS — STUDENT BOARD FORM & DOCUMENT SUBMISSION PORTAL

> **30+ Years of Excellence in Teaching** | **5000+ Students Successfully Passed Out**

A production-ready full-stack web application for **Burhani Tutorials**, designed mobile-first for students and parents to submit board forms and upload required documents for **Classes 9th, 10th, 11th, and 12th**, with an Administrative Portal for record management, document verification, and individual/bulk PDF generation.

---

## 🌟 Key Features

### 1. Public Student Portal (Mobile-First)
* **Branded Landing Page**: Premium educational design with 30+ years legacy showcase, live statistics, class cards, and why choose us section.
* **Class Selection**: Dedicated entry points for Classes 9th, 10th, 11th, and 12th with dynamic document checklists.
* **Structured Multi-Step Board Form**:
  - **Section 1 — Personal Details**: Student name (as per Aadhar), Father's name, Mother's name, Date of Birth (calendar + words), Medium (Hindi, English, Urdu), Gender, 10-digit Indian Mobile Number, SSMID (Samagra ID) Number (Mandatory for all classes), MP Residence indicator.
  - **Section 2 — Address Details**: House No, Street, City/Town, District, State, 6-digit PIN Code.
  - **Section 3 — Languages & Subjects**: 
    - Classes 9 & 10: 1st, 2nd, 3rd Languages.
    - Classes 11 & 12: 1st & 2nd Languages, 3 Mandatory Subjects + 1 Optional Subject, MP Board status.
  - **Section 4 — Previous Academic Details**: Board Name, Roll Number, and Percentage for Class 8 (Classes 9-11), Class 9 (Class 10), and Class 10 (Classes 11 & 12).
  - **Section 5 — Bank Details (Classes 10 & 12)**: Bank Account Number and IFSC Code validation.
  - **Section 6 — Secure Document Uploads**:
    - **Class 9**: Photo, Aadhar, Samagra, Signature, Transfer Certificate (TC) [Mandatory]
    - **Class 10**: Photo, Aadhar, Samagra, Signature, Transfer Certificate (TC) [Mandatory]
    - **Class 11**: Photo, Aadhar, Samagra, Signature, Class 10 Marksheet, Transfer Certificate (TC), Migration Certificate [Mandatory]
    - **Class 12**: Photo, Aadhar, Samagra, Signature, Class 10 Marksheet, Class 11 Marksheet, Transfer Certificate (TC), Migration Certificate [Mandatory]
  - **Section 7 — Student Signature**: Dedicated upload with instant signature preview.
  - **Section 8 — Review & Confirmation**: Full summary check with document badges before final submission.
* **Success Confirmation**: Unique Application ID generation (`BT-2026-XXXXXX`) with immediate guidance.

### 2. Secure Admin Management Portal
* **Authentication**: JWT token-based auth with protected routes.
* **Initial Admin Credentials**:
  - **Username**: `yusufali`
  - **Password**: `yusufali@4486`
* **Real-Time Analytics Dashboard**:
  - Total student count and class-wise breakdowns (9th, 10th, 11th, 12th).
  - Visual enrolment progress indicators.
  - Recent submissions table with quick PDF downloads.
* **Student Record Management**:
  - Server-side text search (Student Name, Father's Name, Phone, Application ID).
  - Server-side filtering by Class, Medium, Gender, MP Residence, and Date Range.
  - Server-side sorting (Date, Name, Application ID).
  - Server-side pagination for handling high volumes of student applications.
  - Bulk select with checkboxes for batch operations.
* **Student Profile View**:
  - Prominently placed student photograph and signature preview.
  - Tabbed interface (Personal, Address, Academic, Languages/Subjects, Bank Details, Documents).
  - Masked bank account numbers for data privacy (`****1234`).
  - Document viewer with full-resolution image preview modal and **"Download to Device"** feature.
  - Status updates (`Submitted`, `Under Review`, `Approved`, `Rejected`).
  - Soft-archive functionality.

### 3. Server-Side PDF Generation (PDFKit)
* **Individual Board Form PDF**:
  - Official Burhani Tutorials header and branding.
  - Application ID, Class, and submission timestamp.
  - Structured personal (including SSMID), address, academic, bank details (Classes 10 & 12), and document checklist sections.
  - **Photograph placed at the bottom-right corner**.
  - **Signature placed directly below the photograph**.
* **Bulk PDF Generation**:
  - Generates a consolidated document for all or filtered students.
  - **Each student starts on a dedicated page** formatted with their respective photo and signature.
  - Direct download to device.

---

## 🏗️ Architecture & Technology Stack

```
Burhani Tutorials/
├── START_PORTAL.bat            # Windows 1-click launcher
├── server/                     # Backend API (Express.js + MongoDB)
│   ├── index.js                # Server entry point
│   ├── models/                 # Mongoose schemas (Student, Admin)
│   ├── routes/                 # Express routes (auth, students, admin)
│   ├── middleware/             # Auth, upload, and error middleware
│   ├── services/               # PDFKit PDF generation service
│   ├── uploads/                # Secured file storage (randomized UUIDs)
│   └── package.json
└── client/                     # Frontend (React 18 + Vite)
    ├── src/
    │   ├── components/         # Navbar, DocumentUploader, AdminLayout
    │   ├── context/            # AuthContext (JWT session state)
    │   ├── pages/              # Landing, ClassSelection, AdmissionForm, SuccessPage
    │   │   └── admin/          # AdminLogin, AdminDashboard, AdminStudents, StudentProfile
    │   ├── utils/              # Axios API client
    │   ├── index.css           # Vanilla CSS Design System (Mobile-First)
    │   └── App.jsx             # React Router v6 setup
    └── package.json
```

---

## 🚀 How to Run Locally

### Option 1: Quick Launch (Windows)
Double-click `START_PORTAL.bat` in the root folder.

### Option 2: Manual Launch

#### 1. Start MongoDB
Ensure MongoDB is running on `mongodb://127.0.0.1:27017` (default).

#### 2. Start Backend Server
```bash
cd server
npm start
```
* Backend runs on **`http://localhost:5000`**
* Seeded admin user `yusufali` will be created automatically on first run.

#### 3. Start Frontend Client
```bash
cd client
npm run dev
```
* Frontend runs on **`http://localhost:5173`**

---

## 🔒 Security & Privacy Practices
* **Document Isolation**: Uploaded files are renamed with UUIDs and stored outside the public document root. Files are served through protected admin endpoints only.
* **Bank Account Masking**: Bank details are never shown unmasked in the UI.
* **Input Validation**: Both frontend (React Hook Form) and backend validations ensure clean data persistence.
* **Clean IDs**: Application IDs (`BT-2026-000001`) abstract internal database object IDs.
