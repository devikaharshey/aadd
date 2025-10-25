# Appwrite AI Duplicates Detector (AADD) ✨

A full-stack web application designed to detect, visualize, and manage duplicates within your Appwrite projects' databases and storage buckets using AI-powered algorithms and perceptual hashing, featuring a gamified user experience.

<img width="1917" height="857" alt="Screenshot 2025-10-24 215057" src="https://github.com/user-attachments/assets/dac96831-47be-4d7e-ac9d-a6ea5a442700" />

---

## Overview 🚀

Managing data effectively often involves dealing with duplicate entries or files, which can consume storage space and complicate data processing. AADD provides an intelligent solution specifically tailored for Appwrite users. Connect your Appwrite projects securely, let the AI scan for textual and file duplicates (images, videos, audio, documents, etc.), and manage them through an intuitive interface. Enhance your data hygiene with features like scheduled scans and track your progress with the engaging "AI Garden" gamification system.

---

## Key Features 🌟

* **🤖 AI-Powered Detection:**
    * **Text Duplicates:** Utilizes Sentence Transformers (`all-MiniLM-L6-v2`) to find similar documents within Appwrite Database collections based on semantic meaning.
    * **File Duplicates:** Detects duplicates and near-duplicates for various file types in Appwrite Storage:
        * **Images:** Perceptual hashing (pHash, aHash, dHash) and color histograms via `ImageHash`.
        * **Videos:** Feature extraction (ORB descriptors) from sampled frames using `OpenCV`.
        * **Audio:** Mel-frequency cepstral coefficients (MFCC) analysis via `Librosa`.
        * **PDFs:** Text extraction and embedding comparison using `PyPDF2` and Sentence Transformers.
        * **Documents (.doc, .docx, .txt):** Text embedding comparison.
        * **Tables (.csv, .xlsx):** Content extraction and embedding comparison using `pandas`.
        * **Presentations (.pptx):** Text and image content extraction and hashing using `python-pptx`.
    * **Exact Duplicates:** Fallback to MD5 hashing for unsupported types or error cases.
* **🔗 Multi-Project Connectivity:** Securely connect and manage multiple Appwrite projects from a single dashboard.
* **🛡️ Secure Credential Handling:** User-provided Appwrite API keys are encrypted using Fernet symmetric encryption before being stored.
* **👤 User Authentication:** Full auth flow including signup, login, email verification, and profile management (name, email, profile picture upload) powered by Appwrite Auth.
* **📊 Visualization & Management:**
    * Intuitive dashboard to view connected projects and initiate scans.
    * Detailed duplicate results page with filtering, sorting, and similarity scores.
    * Visualizations (like Circle Packing) to understand duplicate distribution (via `@nivo`).
    * Bulk selection and deletion capabilities.
    * **Option to delete duplicates directly from the source Appwrite project.**
* **📜 Activity Logging:** Tracks user actions like project connections, scans, and deletions.
* **⏰ Scheduled Reminders:** Configure automated scans (hourly, daily, weekly, etc.) for specific projects/services, with email notifications upon completion.
* **🌱 AI Garden Gamification:**
    * Visual representation of data health based on scanning and cleaning activity.
    * Dynamic plant visualization (SVG animations) reflecting garden 'health'.
    * Chat with an AI Gardener (powered by Google Gemini API) for tips and encouragement.
* **🗑️ Account Deletion:** Comprehensive cleanup routine to remove user data from AADD upon account deletion.
* **🎨 Modern UI/UX:** Built with Next.js, Tailwind CSS, shadcn/ui, and Framer Motion for a smooth, animated, and responsive experience.

---

## Tech Stack 🛠️

### Frontend

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

* **State Management:** React Context API (`useAuth`)

### Backend

![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Appwrite SDK](https://img.shields.io/badge/Appwrite_SDK-F02E65?style=for-the-badge&logo=appwrite&logoColor=white)
![Cryptography](https://img.shields.io/badge/Cryptography-pyca-blue?style=for-the-badge)
![python-dotenv](https://img.shields.io/badge/python--dotenv-grey?style=for-the-badge)

* **Duplicate Detection Libraries:**
    * Text: `sentence-transformers`
    * Images: `Pillow`, `imagehash`
    * Video: `opencv-python`
    * Audio: `librosa`
    * PDF: `PyPDF2`
    * Tables: `pandas`, `openpyxl`
    * Presentations: `python-pptx`
* **Email:** `smtplib` (Standard Library)

### Core Service

![Appwrite](https://img.shields.io/badge/Appwrite-F02E65?style=for-the-badge&logo=appwrite&logoColor=white)

* Authentication
* Database
* Storage

### AI Services

![Google Gemini](https://img.shields.io/badge/Google_Gemini-8E77F0?style=for-the-badge&logo=googlegemini&logoColor=white)

---

## Usage Guide 📖

1.  **Sign Up / Login:** Create an account or log in using your email and password. Verify your email if it's your first time.
2.  **Connect Project:** Navigate to the "Connect Project" page (or via the Dashboard) and enter the Project ID, API Endpoint, and an API Key for the Appwrite project you want to scan.
3.  **Dashboard:** View your connected projects, see quick stats, manage automated scan reminders, and access recent activities.
4.  **Select Project for Scan:** From the Dashboard, click "Duplicates" on a project card, or navigate directly via the URL structure. This takes you to the project overview.
5.  **Choose Scan Target:** On the project overview page (`/duplicates/<projectId>`), select whether to scan "Storage" (all buckets) or input a "Database ID". If scanning a database, you can optionally load its collections and choose to scan a specific collection or the entire database.
6.  **Scan & View Results:** Clicking a "Scan" button (for storage, a database, or a collection) navigates you to the results page (`/duplicates/<projectId>/<service>`) and automatically triggers a scan via the backend. The page will show a loading state while scanning and then display the detected duplicates.
7.  **Manage Duplicates:**
    * Use the search bar and sort options to filter results.
    * Select duplicates using the checkboxes.
    * Use "Select All" / "Deselect All" for bulk actions.
    * Click "Delete Selected". Choose whether to **"Delete from source"** (removes the actual file/document from *your* Appwrite project) or just remove the entry from the AADD list. Confirm the deletion.
8.  **AI Garden:** Visit the "AI Garden" page to see your data health visualization, check stats, and chat with the AI Gardener for motivation.
9.  **Profile:** Manage your account name, email, and delete your account if needed.
10. **Activity:** Review a detailed log of your actions within the AADD application.

---
