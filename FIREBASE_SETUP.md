# Firebase Setup Instructions

## 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `ai-programming-mentor`
4. Enable Google Analytics (optional)
5. Create project

## 2. Enable Authentication

1. In Firebase Console, go to "Authentication"
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable:
   - Email/Password
   - Google (recommended)

## 3. Create Firestore Database

1. Go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select location closest to you

## 4. Get Firebase Configuration

1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click "Web" icon (</>) to add web app
4. Register app with name: `AI Programming Mentor`
5. Copy the configuration object

## 5. Update Firebase Config

Replace the config in `/frontend/src/firebase.js`:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-actual-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-actual-app-id"
};
```

## 6. Firestore Security Rules (Optional for Production)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Teams are readable by members, writable by members
    match /teams/{teamId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (request.auth.uid in resource.data.members[].uid || 
         request.auth.uid == resource.data.createdBy);
    }
  }
}
```

## 7. Test the Setup

1. Start your development server: `npm run dev`
2. You should see the sign-in page
3. Try creating an account or signing in with Google
4. Check Firestore for user data creation

## Features Included

✅ **Authentication System**
- Email/Password sign up and sign in
- Google OAuth integration
- User profile creation with progress starting from 0
- Automatic user data initialization

✅ **Enhanced Team Study**
- Create and join study teams
- Real-time team discovery
- Team progress tracking
- Member management with roles
- Team statistics and analytics

✅ **Progress Tracking**
- All user progress starts from 0
- Subject-wise progress tracking
- XP and level system
- Achievement system ready

## Next Steps

After Firebase setup:
1. Test authentication flow
2. Create a team and test team features
3. Customize team features as needed
4. Add real-time chat functionality (optional)

## Need Help?

If you need help with:
- Firebase API keys
- Google OAuth setup
- Firestore rules
- Any configuration issues

Just ask and I'll help you through it!
