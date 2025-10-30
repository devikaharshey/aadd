# Appwrite AI Duplicates Detector (AADD) ✨

A full-stack web application designed to detect, visualize, and manage duplicates within your Appwrite projects' databases and storage buckets using AI-powered algorithms and perceptual hashing, featuring a gamified user experience.

<img width="1917" height="857" alt="Screenshot 2025-10-24 215057" src="https://github.com/user-attachments/assets/dac96831-47be-4d7e-ac9d-a6ea5a442700" />

### Live App Link - [https://appwrite-ai-duplicates-detector-aadd.appwrite.network/](https://appwrite-ai-duplicates-detector-aadd.appwrite.network/)

### Live Demo Link - [https://youtu.be/VjmDfk_CCQ8](https://youtu.be/VjmDfk_CCQ8)

---

## 📑 Table of Contents

- [Overview](#overview-)
- [Key Features](#key-features-)
- [Tech Stack](#tech-stack-)
- [Usage Guide](#usage-guide-)
- [Architecture](#architecture-)
- [Acknowledgments](#acknowledgments-)

---

## Overview 🚀

Managing data effectively often involves dealing with duplicate entries or files, which can consume storage space and complicate data processing. **AADD** provides an intelligent solution specifically tailored for Appwrite users. 

Connect your Appwrite projects securely, let the AI scan for textual and file duplicates (images, videos, audio, documents, etc.), and manage them through an intuitive interface. Enhance your data hygiene with features like scheduled scans and track your progress with the engaging "AI Garden" gamification system.

---

## Key Features 🌟

### 🤖 AI-Powered Detection

#### Text Duplicates
Utilizes **Sentence Transformers** (`all-MiniLM-L6-v2`) to find similar documents within Appwrite Database collections based on semantic meaning.

#### File Duplicates
Detects duplicates and near-duplicates for various file types in Appwrite Storage:

| File Type | Detection Method |
|-----------|-----------------|
| **Images** | Perceptual hashing (pHash, aHash, dHash) and color histograms via `ImageHash` |
| **Videos** | Feature extraction (ORB descriptors) from sampled frames using `OpenCV` |
| **Audio** | Mel-frequency cepstral coefficients (MFCC) analysis via `Librosa` |
| **PDFs** | Text extraction and embedding comparison using `PyPDF2` and Sentence Transformers |
| **Documents** (.doc, .docx, .txt) | Text embedding comparison |
| **Tables** (.csv, .xlsx) | Content extraction and embedding comparison using `pandas` |
| **Presentations** (.pptx) | Text and image content extraction and hashing using `python-pptx` |

**Exact Duplicates:** Fallback to MD5 hashing for unsupported types or error cases.

### 🔐 Security & Authentication

- **Multi-Project Connectivity:** Securely connect and manage multiple Appwrite projects from a single dashboard
- **Secure Credential Handling:** User-provided Appwrite API keys are encrypted using Fernet symmetric encryption before being stored
- **User Authentication:** Full auth flow including signup, login, email verification, and profile management powered by Appwrite Auth
- **Profile Management:** Update name, email, and upload profile picture

### 📊 Visualization & Management

- **Intuitive Dashboard:** View connected projects and initiate scans
- **Detailed Results Page:** Filtering, sorting, and similarity scores
- **Data Visualizations:** Circle Packing charts to understand duplicate distribution (via `@nivo`)
- **Bulk Operations:** Select and delete multiple duplicates at once
- **Source Deletion:** Option to delete duplicates directly from your Appwrite project
- **Activity Logging:** Tracks user actions like project connections, scans, and deletions

### ⏰ Automation & Scheduling

- **Scheduled Reminders:** Configure automated scans (hourly, daily, weekly, etc.)
- **Email Notifications:** Receive alerts upon scan completion
- **Project-Specific Scheduling:** Set different schedules for different projects/services

### 🌱 AI Garden Gamification

- **Visual Health Representation:** See your data health through dynamic plant visualizations
- **SVG Animations:** Engaging, animated garden that reflects your scanning and cleaning activity
- **AI Gardener Chat:** Powered by Google Gemini API for tips and encouragement
- **Progress Tracking:** Monitor your data hygiene improvements over time

### 🎨 Modern UI/UX

- **Responsive Design:** Works seamlessly on desktop, tablet, and mobile
- **Smooth Animations:** Built with Framer Motion for delightful interactions
- **Modern Components:** Utilizing shadcn/ui and Tailwind CSS
- **Dark Mode Optimized:** Beautiful dark theme for comfortable viewing

---

## Tech Stack 🛠️

### Frontend

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![shadcn/ui](https://img.shields.io/badge/shadcn/ui-000000?style=for-the-badge&logo=shadcnui&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge)
![Sonner](https://img.shields.io/badge/Sonner-000000?style=for-the-badge)
![Nivo](https://img.shields.io/badge/Nivo-FF7337?style=for-the-badge&logo=nivo&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-8884d8?style=for-the-badge&logo=recharts&logoColor=white)

</div>

**Additional Tools:**
- State Management: React Context API (`useAuth`)

### Backend

<div align="center">

![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Appwrite SDK](https://img.shields.io/badge/Appwrite_SDK-F02E65?style=for-the-badge&logo=appwrite&logoColor=white)
![Cryptography](https://img.shields.io/badge/Cryptography-pyca-blue?style=for-the-badge)
![python-dotenv](https://img.shields.io/badge/python--dotenv-grey?style=for-the-badge)

</div>

**Duplicate Detection Libraries:**

| Category | Libraries |
|----------|-----------|
| Text | `sentence-transformers` |
| Images | `Pillow`, `imagehash` |
| Video | `opencv-python` |
| Audio | `librosa` |
| PDF | `PyPDF2` |
| Tables | `pandas`, `openpyxl` |
| Presentations | `python-pptx` |
| Email | `smtplib` (Standard Library) |

### Core Service

<div align="center">

![Appwrite](https://img.shields.io/badge/Appwrite-F02E65?style=for-the-badge&logo=appwrite&logoColor=white)

</div>

**Services Used:**
- Authentication
- Database
- Storage

### AI Services

<div align="center">

![Google Gemini](https://img.shields.io/badge/Google_Gemini-8E77F0?style=for-the-badge&logo=googlegemini&logoColor=white)

</div>

---

## Usage Guide 📖

### 1. Sign Up / Login

Create an account or log in using your email and password. Verify your email if it's your first time signing up.

### 2. Connect Project

Navigate to the **"Connect Project"** page and enter:
- Project ID
- API Endpoint
- API Key for the Appwrite project you want to scan

### 3. Dashboard

View your connected projects with quick stats, manage automated scan reminders, and access recent activities.<br/><br/>
<b>𝗡𝗢𝗧𝗘𝗦:</b> 
- The emails may land in SPAM, so keep checking for it there.
- You can only create upto 5 reminders to keep it optimized and avoid overloading the system.

### 4. Select Project for Scan

From the Dashboard, click **"Duplicates"** on a project card to navigate to the project overview page.

### 5. Choose Scan Target

On the project overview page (`/duplicates/<projectId>`), select:
- **Storage:** Scan all buckets
- **Database ID:** Input a database ID to scan
  - Optionally load collections and scan specific collections or entire database

### 6. Scan & View Results

Click a **"Scan"** button to navigate to the results page (`/duplicates/<projectId>/<service>`). The scan will automatically trigger and display:
- Loading state during scan
- Detected duplicates with similarity scores
- Visual representations of duplicate distribution
- View in Console/Open in Appwrite button to view the files in Appwrite Console

### 7. Manage Duplicates

**Filter & Sort:**
- Use the search bar to find specific duplicates
- Sort by similarity, date, or file size

**Bulk Operations:**
- Select duplicates using checkboxes
- Use "Select All" / "Deselect All" for bulk actions

**Delete Duplicates:**
- Click **"Delete Selected"**
- Choose deletion mode:
  - **Delete from source:** Removes actual files/documents from your Appwrite project
  - **Remove from list:** Only removes from AADD tracking
- Confirm the deletion

### 8. AI Garden

Visit the **"AI Garden"** page to:
- View your data health visualization
- Check cleaning statistics
- Chat with the AI Gardener for motivation and tips

### 9. Profile Management

Manage your account:
- Update name and email
- Upload profile picture
- Delete account (with comprehensive cleanup)

### 10. Activity Log

Review a detailed log of all your actions within the AADD application, including:
- Project connections
- Scan operations
- Deletion activities
- Configuration changes

---

## Architecture 🏗️

### System Overview

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Next.js   │────────▶│   Flask     │────────▶│  Appwrite   │
│  Frontend   │   API   │   Backend   │   SDK   │   Service   │
└─────────────┘         └─────────────┘         └─────────────┘
                               │
                               ▼
                        ┌─────────────┐
                        │   AI/ML     │
                        │  Libraries  │
                        └─────────────┘
```

### Data Flow

1. **User Authentication:** Handled by Appwrite Auth
2. **Project Connection:** API keys encrypted and stored in Appwrite Database
3. **Scan Request:** Frontend triggers scan via Flask API
4. **Duplicate Detection:** Backend fetches data from user's Appwrite project and runs AI algorithms
5. **Results Storage:** Duplicates stored in AADD's Appwrite database
6. **Visualization:** Results fetched and displayed with interactive charts

### Security Measures

- **Encryption at Rest:** API keys encrypted using Fernet
- **Secure Communication:** HTTPS for all API calls
- **Token-based Auth:** JWT tokens for session management
- **Input Validation:** All user inputs sanitized
- **Rate Limiting:** Protection against abuse

---

## Acknowledgments 🙏

- **Appwrite Team** for the amazing backend platform
- **Google Gemini** for AI capabilities
- **Open Source Community** for the incredible libraries used in this project

---

<div align="center">

**Made with ❤️ by Devika Harshey**

⭐ Star on GitHub if you find this project useful!

</div>
