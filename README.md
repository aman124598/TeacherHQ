# 🎓 Teacher Attendance System

A modern, location-based attendance management system built with Next.js, designed specifically for educational institutions. This system allows teachers to mark their attendance digitally when they're within the college premises, ensuring accurate and secure attendance tracking.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## ✨ Features

### 📍 **Location-Based Attendance**
- GPS-based verification using the Haversine formula
- 500-meter radius validation from college premises
- Real-time location tracking and distance calculation

### 🎯 **Core Functionality**
- **Digital Attendance Marking**: Secure attendance recording with timestamp
- **Schedule Management**: View daily and weekly class schedules
- **Statistics Dashboard**: Comprehensive attendance analytics and reports
- **Todo List**: Personal task management for teachers
- **Important Dates**: Event calendar for academic milestones

### 📚 **AI-Powered Notes Generation**
- **PDF Text Extraction**: Upload PDFs and extract text using OCR.Space API
- **Smart Summarization**: Generate concise notes using Google Gemini AI
- **Document Repository**: Store and manage teaching materials
- **Formatted Output**: Well-structured notes with bullet points and formatting

### 🎨 **Modern UI/UX**
- **Dark/Light Theme**: Beautiful theme switcher with smooth transitions
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Component Library**: Built with shadcn/ui components
- **Smooth Animations**: Engaging user experience with custom animations

### 🔐 **Security Features**
- **Environment-based Configuration**: All API keys secured in environment variables
- **Authentication Middleware**: Session-based access control
- **Server-side API Processing**: Secure handling of sensitive operations

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18.0.0 or higher)
- **npm** or **pnpm** (package manager)
- **Git** (for version control)

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

## ⚙️ Environment Configuration

Create a `.env.local` file in the root directory and configure the following variables:

### 🗄️ **Database Configuration**
```bash
# MongoDB Atlas Connection String
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/teacher_database?retryWrites=true&w=majority
```

**Setup Instructions:**
1. Create a [MongoDB Atlas](https://www.mongodb.com/atlas) account
2. Create a new cluster
3. Create a database user with read/write permissions
4. Get your connection string from Atlas dashboard
5. Replace the placeholder with your actual connection string

### 🤖 **API Keys Configuration**

#### Google Gemini AI API
```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

**Setup Instructions:**
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy and paste it in your `.env.local` file

#### OCR.Space API
```bash
OCR_API_KEY=your_ocr_space_api_key_here
```

**Setup Instructions:**
1. Visit [OCR.Space API](https://ocr.space/ocrapi)
2. Sign up for a free account
3. Get your API key from the dashboard
4. Add it to your environment file

### 📍 **Location Configuration**
```bash
# College Location Coordinates (for attendance verification)
COLLEGE_LATITUDE=13.072204074042398
COLLEGE_LONGITUDE=77.50754474895987
```

**Setup Instructions:**
1. Find your college coordinates using [Google Maps](https://maps.google.com)
2. Right-click on your college location
3. Copy the latitude and longitude values
4. Replace the default values in `.env.local`

### 🔐 **Security Configuration**
```bash
# Authentication Settings
JWT_SECRET=your_secure_jwt_secret_here
COOKIE_SECRET=your_secure_cookie_secret_here
NEXTAUTH_SECRET=your_nextauth_secret_here

# Application URL
NEXTAUTH_URL=http://localhost:3000
```

**Setup Instructions:**
1. Generate secure random strings for secrets (use online generators)
2. Use at least 32 characters for each secret
3. Never share these secrets publicly

## 🗃️ Database Setup

### MongoDB Collections Structure

Your MongoDB database should contain the following collections:

#### 1. **teacher_data** Collection
```json
{
  "_id": ObjectId,
  "Id": 1,
  "Name": "John Doe",
  "Password": 1234
}
```

#### 2. **teacher_id** Collection (Attendance Records)
```json
{
  "_id": ObjectId,
  "Id": 1,
  "Attendance": [
    {
      "Date": "2024-01-15",
      "Time_In": "09:00",
      "Present_Absent": "Present",
      "Time_Out": "17:00"
    }
  ]
}
```

### Sample Data Import

1. **Create sample teacher data:**
   ```javascript
   // In MongoDB Atlas or MongoDB Compass
   db.teacher_data.insertMany([
     { "Id": 1, "Name": "John Doe", "Password": 1234 },
     { "Id": 2, "Name": "Jane Smith", "Password": 5678 }
   ])
   ```

2. **Create attendance collection:**
   ```javascript
   db.teacher_id.insertMany([
     { "Id": 1, "Attendance": [] },
     { "Id": 2, "Attendance": [] }
   ])
   ```

## 🏃‍♂️ Running the Application

### Development Mode
```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build
```bash
npm run build
npm start
# or
pnpm build
pnpm start
```

## 📁 Project Structure

```
teacher-attendance-system/
├── app/                          # Next.js 14 App Directory
│   ├── api/                      # API Routes
│   │   ├── attendance/mark/      # Attendance marking endpoint
│   │   ├── config/location/      # College location config
│   │   ├── login/               # Authentication endpoint
│   │   └── notes/               # Notes processing APIs
│   ├── dashboard/               # Dashboard pages
│   ├── important-dates/         # Important dates module
│   ├── notes/                   # Notes generation module
│   ├── schedule/                # Schedule management
│   ├── statistics/              # Attendance statistics
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Login page
├── components/                   # Reusable React components
│   ├── ui/                      # shadcn/ui components
│   ├── header.tsx               # Navigation header
│   ├── theme-provider.tsx       # Theme management
│   ├── theme-toggle.tsx         # Dark mode toggle
│   └── todo-list.tsx            # Todo functionality
├── hooks/                       # Custom React hooks
├── lib/                         # Utility functions
│   ├── distance-calculator.ts   # Haversine formula implementation
│   ├── pdf-extractor.ts         # PDF processing utilities
│   └── utils.ts                 # General utilities
├── public/                      # Static assets
├── styles/                      # Additional stylesheets
├── .env.local                   # Environment variables (not in git)
├── .env.example                 # Environment template
├── middleware.ts                # Next.js middleware
├── next.config.mjs              # Next.js configuration
├── package.json                 # Dependencies and scripts
├── tailwind.config.ts           # Tailwind CSS configuration
└── tsconfig.json                # TypeScript configuration
```

## 🎯 Usage Guide

### 👨‍🏫 **For Teachers**

1. **Login**
   - Use your Teacher ID and Password
   - System validates credentials against MongoDB

2. **Mark Attendance**
   - Click "Verify My Location" on dashboard
   - Ensure you're within 500m of college
   - Click "Mark Attendance" when location is verified

3. **Generate Notes**
   - Navigate to "Short Notes" section
   - Upload a PDF document
   - System extracts text and generates concise notes using AI

4. **Manage Documents**
   - Upload teaching materials to document repository
   - Organize and categorize your files
   - Download or delete documents as needed

5. **View Statistics**
   - Check attendance percentage and records
   - View monthly attendance patterns
   - Track present/absent days

### 👨‍💼 **For Administrators**

1. **User Management**
   - Add new teachers to `teacher_data` collection
   - Set unique Teacher IDs and passwords
   - Initialize attendance records in `teacher_id` collection

2. **Location Configuration**
   - Update college coordinates in environment variables
   - Adjust attendance radius if needed (default: 500m)

## 🛠️ API Documentation

### Authentication Endpoints

#### POST `/api/login`
```javascript
// Request
{
  "teacherId": "1",
  "password": "1234"
}

// Response
{
  "success": true,
  "teacher": {
    "Id": 1,
    "Name": "John Doe"
  }
}
```

### Attendance Endpoints

#### POST `/api/attendance/mark`
```javascript
// Request
{
  "userId": 1,
  "timestamp": "2024-01-15T09:00:00.000Z",
  "location": {
    "latitude": 13.0722,
    "longitude": 77.5075,
    "distance": 250
  }
}

// Response
{
  "success": true,
  "message": "Attendance marked successfully"
}
```

### Notes Processing Endpoints

#### POST `/api/notes/ocr`
- **Purpose**: Extract text from PDF files
- **Input**: FormData with PDF file
- **Output**: Extracted text string

#### POST `/api/notes/generate`
- **Purpose**: Generate notes using Gemini AI
- **Input**: JSON with text content
- **Output**: Formatted notes

## 🎨 Customization

### Theme Customization

The application supports extensive theming through Tailwind CSS and CSS custom properties:

1. **Color Schemes**: Edit `app/globals.css` for custom color variables
2. **Component Styling**: Modify components in `components/ui/`
3. **Dark Mode**: Customize dark theme colors in CSS variables

### Feature Extensions

1. **Additional Modules**: Add new pages in `app/` directory
2. **Custom Components**: Create reusable components in `components/`
3. **API Extensions**: Add new endpoints in `app/api/`

## 🔧 Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
Error: MongoServerError: Authentication failed
```
**Solution**: Verify MongoDB credentials and connection string

#### API Key Issues
```bash
Error: 401 Unauthorized
```
**Solution**: Check API key validity and environment variable names

#### Location Services
```bash
Error: Geolocation not supported
```
**Solution**: Ensure HTTPS in production and location permissions

#### Build Issues
```bash
Error: Module not found
```
**Solution**: Run `npm install` and check import paths

### Performance Optimization

1. **Image Optimization**: Use Next.js Image component
2. **Bundle Analysis**: Run `npm run build` and analyze bundle size
3. **Database Indexing**: Add indexes on frequently queried fields
4. **API Caching**: Implement Redis for API response caching

## 🚀 Local Development & Setup

### Running the Application

1. **Install Dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

2. **Setup Environment Variables**
   - Copy `.env.example` to `.env.local`
   - Fill in your actual values for MongoDB, API keys, etc.

3. **Start Development Server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

4. **Access the Application**
   - Frontend: http://localhost:3000
   - API Routes: http://localhost:3000/api/*

### Production Build (Local)

```bash
# Build the application
npm run build

# Start production server
npm start
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Use meaningful commit messages
- Add proper error handling
- Update documentation for new features
- Test on multiple devices and browsers

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Aman Raj**
- GitHub: [@Stranger1298](https://github.com/Stranger1298)
- Project: [Teacher Attendance System](https://github.com/Stranger1298/teacher-attendance-system--1-)

## 🙏 Acknowledgments

- **Next.js Team** for the amazing framework
- **shadcn/ui** for beautiful component library
- **MongoDB** for robust database solutions
- **Google AI** for Gemini API
- **OCR.Space** for text extraction services

## 📞 Support

If you encounter any issues or have questions:

1. **Check Documentation**: Review this README and inline comments
2. **Search Issues**: Look through existing GitHub issues
3. **Create Issue**: Open a new issue with detailed description
4. **Discord/Email**: Contact maintainers directly

---

**Made with ❤️ for Education**

*This system is designed to modernize attendance tracking in educational institutions while maintaining security and ease of use.*
