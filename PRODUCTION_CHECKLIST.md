# Production Deployment Checklist

This checklist ensures the Teacher Attendance System is ready for production deployment.

## ✅ Pre-Deployment Checklist

### 1. Environment Variables

- [ ] Set `NEXT_PUBLIC_FIREBASE_API_KEY` in Vercel
- [ ] Set `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` in Vercel
- [ ] Set `NEXT_PUBLIC_FIREBASE_PROJECT_ID` in Vercel
- [ ] Set `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` in Vercel
- [ ] Set `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` in Vercel
- [ ] Set `NEXT_PUBLIC_FIREBASE_APP_ID` in Vercel
- [ ] Set `GEMINI_API_KEY` in Vercel
- [ ] Set `OCR_API_KEY` in Vercel

### 2. Firebase Console Setup

- [ ] Enable Email/Password authentication
- [ ] Enable Google authentication
- [ ] Add production domain to authorized domains (Firebase Console > Authentication > Settings > Authorized domains)
- [ ] Deploy Firestore Security Rules (see below)
- [ ] Create Firestore indexes if needed

### 3. Firestore Security Rules

Deploy these rules in Firebase Console > Firestore > Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }

    // Helper function to check if user owns the document
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // Helper function to get user's organization
    function getUserOrg() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.organizationId;
    }

    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isOwner(userId);
    }

    // Organizations collection
    match /organizations/{orgId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update, delete: if isAuthenticated() &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.organizationRole == 'admin' &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.organizationId == orgId;
    }

    // Attendance collection
    match /attendance/{docId} {
      allow read, write: if isAuthenticated() &&
        (resource == null || resource.data.userId == request.auth.uid || request.resource.data.userId == request.auth.uid);
    }

    // Schedules collection
    match /schedules/{userId} {
      allow read: if isAuthenticated();
      allow write: if isOwner(userId) ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.organizationRole == 'admin';
    }

    // Events collection
    match /events/{eventId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update, delete: if isAuthenticated() && resource.data.userId == request.auth.uid;
    }

    // Todos collection
    match /todos/{todoId} {
      allow read, write: if isAuthenticated() &&
        (resource == null || resource.data.userId == request.auth.uid || request.resource.data.userId == request.auth.uid);
    }

    // Tasks collection
    match /tasks/{taskId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.organizationRole == 'admin';
    }

    // Activity logs collection
    match /activity_logs/{logId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update, delete: if false; // Logs should not be modified
    }
  }
}
```

### 4. Vercel Configuration

- [ ] Connect GitHub repository to Vercel
- [ ] Set environment variables in Vercel dashboard
- [ ] Enable Vercel Analytics
- [ ] Enable Vercel Speed Insights
- [ ] Set up custom domain (optional)

### 5. Testing Before Launch

- [ ] Test login with email/password
- [ ] Test login with Google
- [ ] Test organization creation
- [ ] Test organization joining with invite code
- [ ] Test attendance marking with location
- [ ] Test schedule viewing/editing
- [ ] Test todo list functionality
- [ ] Test important dates calendar
- [ ] Test on mobile devices
- [ ] Test dark/light theme switching

## 📊 Scaling Considerations

### Current Capacity (100-200 users)

The application is designed to handle 100-200 concurrent users with:

- **Firebase Auth**: Handles millions of authentications
- **Firestore**: 1GB free, then $0.18/GB - easily handles this scale
- **Vercel**: Handles traffic spikes automatically
- **No additional configuration needed** for this user count

### If You Need 500+ Users

Consider:

- [ ] Enable Firestore automatic indexes
- [ ] Implement pagination for large lists
- [ ] Add caching with React Query or SWR
- [ ] Consider Firebase Blaze plan for higher quotas

### If You Need 1000+ Users

Consider:

- [ ] Implement server-side caching (Redis)
- [ ] Add CDN for static assets
- [ ] Optimize database queries with composite indexes
- [ ] Consider connection pooling

## 🔒 Security Recommendations

1. **Remove console.log statements** before production build
2. **Validate all inputs** on both client and server
3. **Use HTTPS** (automatic on Vercel)
4. **Regular security audits** of Firebase rules
5. **Monitor Firebase usage** in console

## 📈 Monitoring

After deployment, monitor:

- Vercel Analytics dashboard
- Firebase Console > Usage
- Firebase Console > Authentication
- Error logs in Vercel

## 🚀 Deployment Command

```bash
# Push to GitHub (triggers Vercel deployment)
git add .
git commit -m "Production ready deployment"
git push origin main
```

Vercel will automatically:

1. Build the application
2. Deploy to edge network
3. Enable analytics
4. Provide production URL

---

**Estimated Time to Complete Checklist: 30-45 minutes**
