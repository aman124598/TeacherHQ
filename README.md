# 🎓 Teacher Attendance System

A modern, location-based attendance management system built with Next.js 14 and Firebase, designed for educational institutions. Features multi-organization support, GPS-verified attendance, AI-powered notes generation, and a beautiful modern UI.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## ✨ Features

### 🏢 **Multi-Organization Support**

- **Create Organizations**: Set up your educational institution with custom settings
- **Invite Teachers**: Share unique 8-character invite codes for easy onboarding
- **Role-Based Access**: Organization admins vs teachers with different permissions
- **Data Isolation**: Complete separation of data between organizations

### 📍 **Location-Based Attendance**

- GPS-based verification using the Haversine formula
- Configurable radius validation (default: 700 meters)
- Real-time location tracking and distance calculation
- Organization-specific location settings

### 🔐 **Authentication & Security**

- **Firebase Authentication**: Email/password and Google sign-in
- **Secure Sessions**: Managed through Firebase Auth
- **Organization Scoping**: All data queries scoped to user's organization
- **Activity Logging**: Track all user actions for audit purposes

### 🎯 **Core Functionality**

- **Digital Attendance Marking**: Secure attendance recording with GPS verification
- **Schedule Management**: View and manage daily/weekly class schedules
- **Statistics Dashboard**: Comprehensive attendance analytics and reports
- **Todo List**: Personal task management for teachers
- **Important Dates**: Interactive event calendar for academic milestones
- **Admin Panel**: Manage users, schedules, and tasks (for admins)

### 📚 **AI-Powered Notes Generation**

- **PDF Text Extraction**: Upload PDFs and extract text using OCR.Space API
- **Smart Summarization**: Generate concise notes using Google Gemini AI
- **Document Repository**: Store and manage teaching materials
- **Formatted Output**: Well-structured notes with bullet points

### 🎨 **Modern UI/UX**

- **Dark/Light Theme**: Beautiful theme switcher with smooth transitions
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Component Library**: Built with shadcn/ui components
- **Smooth Animations**: Engaging user experience with custom animations
- **Glassmorphism & Gradients**: Modern, premium design aesthetic

### 📊 **Analytics & Monitoring**

- **Vercel Analytics**: Page view tracking and user analytics
- **Speed Insights**: Web Vitals monitoring (LCP, FID, CLS)
- **Activity Logs**: Comprehensive user action tracking

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have:

- **Node.js** (v18.0.0 or higher)
- **npm** or **pnpm** (package manager)
- **Git** (for version control)
- **Firebase Project** (for authentication and database)

### 📦 Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Stranger1298/teacher-attendance-system--1-.git
   cd teacher-attendance-system--1-
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

4. **Configure Firebase** (see Environment Configuration below)

5. **Run the development server**

   ```bash
   npm run dev
   ```

6. **Open [http://localhost:3000](http://localhost:3000)** in your browser

## ⚙️ Environment Configuration

Create a `.env.local` file in the root directory:

### 🔥 **Firebase Configuration**

```bash
# Firebase Config (get from Firebase Console > Project Settings)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 🤖 **API Keys**

```bash
# Google Gemini AI (for notes generation)
GEMINI_API_KEY=your_gemini_api_key

# OCR.Space API (for PDF text extraction)
OCR_API_KEY=your_ocr_api_key
```

### 📍 **Location Configuration**

```bash
# Default College Location (can be overridden per organization)
COLLEGE_LATITUDE=13.072204074042398
COLLEGE_LONGITUDE=77.50754474895987
```

## 🗃️ Firebase Setup

### Firestore Collections Structure

The application uses the following Firestore collections:

#### 1. **users** Collection

```javascript
{
  uid: "user_id",
  email: "teacher@school.com",
  displayName: "John Doe",
  photoURL: "https://...",
  role: "teacher",
  organizationId: "org_id",
  organizationRole: "admin" | "teacher",
  organizationName: "Springfield School",
  createdAt: Timestamp,
  lastLoginAt: Timestamp
}
```

#### 2. **organizations** Collection

```javascript
{
  id: "org_id",
  name: "Springfield School",
  slug: "springfield-school-a1b2",
  address: "123 Main St",
  city: "Springfield",
  state: "IL",
  country: "USA",
  inviteCode: "ABC12345",
  adminId: "user_id",
  adminEmail: "admin@school.com",
  memberCount: 25,
  locationRadius: 700,
  settings: {
    attendanceEnabled: true,
    locationVerification: true,
    workingHours: { start: "09:00", end: "17:00" }
  },
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### 3. **attendance** Collection

```javascript
{
  userId: "user_id",
  organizationId: "org_id",
  records: [{
    date: "2024-01-15",
    timeIn: "9:00:00 AM",
    status: "present",
    location: { latitude: 13.07, longitude: 77.50, distance: 150 }
  }],
  presentDays: 20,
  absentDays: 2,
  totalDays: 22,
  lastMarked: Timestamp
}
```

#### 4. **activity_logs** Collection

```javascript
{
  userId: "user_id",
  organizationId: "org_id",
  action: "attendance_marked",
  details: { date: "2024-01-15", time: "9:00 AM" },
  timestamp: Timestamp,
  date: "2024-01-15"
}
```

### Firebase Security Rules

Add these rules to your Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Organization members can read org data
    match /organizations/{orgId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.organizationRole == 'admin';
    }

    // Attendance scoped to user
    match /attendance/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 📁 Project Structure

```
teacher-attendance-system/
├── app/                          # Next.js 14 App Directory
│   ├── api/                      # API Routes
│   │   ├── attendance/mark/      # Attendance marking (Firebase)
│   │   ├── config/location/      # College location config
│   │   └── notes/                # Notes processing APIs
│   ├── admin/                    # Admin panel pages
│   │   ├── users/                # User management
│   │   ├── schedule/[userId]/    # Schedule editor
│   │   └── tasks/                # Task management
│   ├── dashboard/                # Main dashboard
│   ├── onboarding/               # Organization onboarding
│   ├── org/                      # Organization management
│   │   ├── settings/             # Org settings (admin)
│   │   └── members/              # Member management (admin)
│   ├── join/[code]/              # Join organization via invite
│   ├── important-dates/          # Events calendar
│   ├── notes/                    # AI notes generation
│   ├── schedule/                 # Schedule view
│   ├── statistics/               # Attendance stats
│   └── page.tsx                  # Login page
├── components/                   # Reusable React components
│   ├── ui/                       # shadcn/ui components
│   ├── header.tsx                # Navigation header
│   ├── admin-sidebar.tsx         # Admin navigation
│   ├── important-dates-calendar.tsx
│   └── todo-list.tsx
├── lib/                          # Utility functions
│   ├── firebase/                 # Firebase modules
│   │   ├── config.ts             # Firebase configuration
│   │   ├── auth.ts               # Authentication functions
│   │   ├── AuthContext.tsx       # Auth context provider
│   │   ├── firestore.ts          # Firestore CRUD operations
│   │   └── organizations.ts      # Organization management
│   ├── distance-calculator.ts    # Haversine formula
│   └── utils.ts                  # General utilities
├── .env.local                    # Environment variables
├── middleware.ts                 # Next.js middleware
└── package.json                  # Dependencies
```

## 🎯 Usage Guide

### 👨‍🏫 **For New Users**

1. **Sign Up / Login**

   - Use email/password or Google sign-in
   - First-time users are redirected to onboarding

2. **Create or Join Organization**

   - **Create**: Set up your school/college as admin
   - **Join**: Enter invite code from your admin

3. **Mark Attendance**

   - Click "Verify My Location" on dashboard
   - Must be within organization's defined radius
   - Click "Mark Attendance" when verified

4. **Explore Features**
   - View your schedule
   - Check attendance statistics
   - Generate AI-powered notes from PDFs
   - Manage important dates and todos

### 👨‍💼 **For Organization Admins**

1. **Access Organization Settings**

   - Click "Organization" in header menu
   - Manage settings, invite code, and members

2. **Invite Teachers**

   - Copy your organization's invite code
   - Share with teachers to join
   - Regenerate code if needed for security

3. **Manage Members**

   - View all organization members
   - Promote teachers to admin
   - Remove members if needed

4. **Configure Attendance**
   - Set location radius for verification
   - Configure working hours
   - Enable/disable location verification

### 🔧 **Admin Panel** (Global Admins)

1. **User Management**: View and manage all users
2. **Schedule Editor**: Assign/modify teacher schedules
3. **Task Management**: Create tasks and notices
4. **Statistics**: View organization-wide stats

## 🛠️ API Documentation

### Authentication

- Handled entirely by Firebase Auth
- Supports email/password and Google OAuth
- Session managed via Firebase tokens

### Attendance

```typescript
POST /api/attendance/mark
{
  userId: string,
  timestamp: string,
  location: { latitude, longitude, distance },
  organizationId: string
}
// Saves to Firebase Firestore with activity logging
```

### Notes Processing

```typescript
POST / api / notes / ocr; // Extract text from PDF
POST / api / notes / generate; // Generate notes with Gemini AI
```

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect Repository**

   - Import project to Vercel
   - Connect your GitHub repository

2. **Configure Environment Variables**

   - Add all `.env.local` variables to Vercel dashboard

3. **Deploy**
   - Automatic deployment on push to main branch

### Analytics

The app includes built-in Vercel Analytics and Speed Insights:

- Page view tracking
- Web Vitals monitoring
- Works automatically when deployed to Vercel

## 🔧 Troubleshooting

### Common Issues

| Issue                     | Solution                                        |
| ------------------------- | ----------------------------------------------- |
| Firebase auth not working | Check Firebase config in `.env.local`           |
| Location not verifying    | Ensure HTTPS and location permissions           |
| Organization not loading  | Check Firestore rules and user's organizationId |
| Build errors              | Run `npm install` and check TypeScript errors   |

### Debug Mode

The app includes console logging for development:

- Auth state changes
- Organization loading
- API responses

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Aman Raj**

- GitHub: [@Stranger1298](https://github.com/Stranger1298)
- Project: [Teacher Attendance System](https://github.com/Stranger1298/teacher-attendance-system--1-)

## 🙏 Acknowledgments

- **Next.js** - React framework
- **Firebase** - Authentication & database
- **shadcn/ui** - Component library
- **Tailwind CSS** - Styling
- **Google Gemini AI** - Notes generation
- **OCR.Space** - PDF text extraction
- **Vercel** - Hosting & analytics

---

**Made with ❤️ for Education**

_Modernizing attendance tracking in educational institutions with security, multi-tenancy, and ease of use._
