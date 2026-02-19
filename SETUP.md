# Lock In Love - Complete Setup Guide

This guide will walk you through setting up the Lock In Love app from scratch, including Firebase configuration and deployment.

## Prerequisites

- Node.js 18+ installed on your machine
- A Google account (for Firebase)
- Git installed
- Visual Studio Code (or your preferred code editor)

---

## Part 1: Firebase Setup

### Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter a project name (e.g., "lock-in-love")
4. Disable Google Analytics (optional, not required for this app)
5. Click **"Create project"** and wait for it to initialize

### Step 2: Register Your Web App

1. In your Firebase project dashboard, click the **web icon** (`</>`) to add a web app
2. Enter an app nickname (e.g., "Lock In Love Web")
3. **Do NOT** check "Set up Firebase Hosting" (we'll use Vercel)
4. Click **"Register app"**
5. You'll see your Firebase configuration object - **keep this page open**, you'll need these values soon

### Step 3: Enable Firestore Database

1. In the Firebase Console left sidebar, click **"Firestore Database"**
2. Click **"Create database"**
3. Select **"Start in production mode"** (we'll add custom rules later)
4. Choose a Firestore location (pick the closest to your users)
5. Click **"Enable"**

### Step 4: Enable Anonymous Authentication

1. In the Firebase Console left sidebar, click **"Authentication"**
2. Click **"Get started"**
3. Go to the **"Sign-in method"** tab
4. Find **"Anonymous"** in the list and click on it
5. Toggle the **"Enable"** switch to ON
6. Click **"Save"**

### Step 5: Deploy Firestore Security Rules

1. In the Firebase Console, go to **"Firestore Database"**
2. Click on the **"Rules"** tab
3. Replace the default rules with the contents of the `firestore.rules` file from this project:

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Room documents
    match /rooms/{roomId} {
      // Allow read if user is in the room's users array
      allow read: if request.auth != null && 
                     request.auth.uid in resource.data.users;
      
      // Allow create for any authenticated user
      allow create: if request.auth != null;
      
      // Allow update if user is in the room's users array
      // and the room doesn't exceed 2 users
      allow update: if request.auth != null && 
                       request.auth.uid in resource.data.users &&
                       request.resource.data.users.size() <= 2;
      
      // User documents within rooms
      match /users/{userId} {
        // Allow read if the requester is in the parent room's users array
        allow read: if request.auth != null && 
                       request.auth.uid in get(/databases/$(database)/documents/rooms/$(roomId)).data.users;
        
        // Allow create for any authenticated user
        allow create: if request.auth != null;
        
        // Allow update/delete only for the user's own document
        allow update, delete: if request.auth != null && 
                                  request.auth.uid == userId;
      }
    }
  }
}
```

4. Click **"Publish"**

---

## Part 2: Local Development Setup

### Step 1: Install Dependencies

Open your terminal in the project directory and run:

```bash
cd nextjs_space
npm install
# or
yarn install
```

### Step 2: Configure Environment Variables

1. In the `nextjs_space` directory, create a file named `.env.local`
2. Copy the contents from `.env.local.example`
3. Fill in your Firebase configuration values from **Part 1, Step 2**:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Where to find these values:**
- Go to Firebase Console → Project Settings (gear icon) → General tab
- Scroll down to "Your apps" section
- Click on your web app
- You'll see "SDK setup and configuration"
- Copy the `firebaseConfig` object values

### Step 3: Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. You should see the Lock In Love homepage!

### Step 4: Test the Application

1. Enter a display name
2. Click "Create New Room"
3. You'll be redirected to the room page
4. Copy the room ID
5. Open a new incognito/private window
6. Enter a different display name
7. Paste the room ID and click "Join Existing Room"
8. Both windows should now show both users' timers in real-time!

---

## Part 3: Deployment to Vercel

### Step 1: Install Vercel CLI (Optional)

```bash
npm install -g vercel
```

### Step 2: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click **"Add New..."** → **"Project"**
3. Import your Git repository (GitHub, GitLab, or Bitbucket)
4. Vercel will auto-detect Next.js settings
5. **Important**: Set the **Root Directory** to `nextjs_space`
6. Add your environment variables:
   - Go to **"Environment Variables"** section
   - Add all variables from your `.env.local` file
   - Make sure to update `NEXT_PUBLIC_SITE_URL` to your Vercel deployment URL
7. Click **"Deploy"**

### Step 3: Update Firebase Auth Domain (After First Deploy)

1. After your first deployment, copy your Vercel URL (e.g., `your-app.vercel.app`)
2. Go to Firebase Console → Authentication → Settings → Authorized domains
3. Click **"Add domain"**
4. Add your Vercel domain: `your-app.vercel.app`
5. Click **"Add"**

### Step 4: Update Environment Variable

1. Go to your Vercel project dashboard
2. Go to **Settings** → **Environment Variables**
3. Update `NEXT_PUBLIC_SITE_URL` to your actual Vercel URL
4. Redeploy the app

---

## Troubleshooting

### "Firebase not configured" error
- Make sure all environment variables in `.env.local` are filled correctly
- Restart the development server after adding environment variables
- Check for typos in variable names (they must match exactly)

### "Permission denied" errors in Firestore
- Verify that you've deployed the Firestore security rules correctly
- Make sure Anonymous Authentication is enabled
- Check the Firebase Console → Firestore → Rules tab

### Room not found or can't join
- Make sure Firestore is enabled and initialized
- Check Firebase Console → Firestore Database to verify data is being written
- Check browser console for error messages

### Timers not syncing
- Check your internet connection
- Verify Firestore real-time listeners are working (check browser console)
- Make sure both users are in the same room (same room ID)

### Deployment issues on Vercel
- Verify the Root Directory is set to `nextjs_space`
- Check that all environment variables are added in Vercel dashboard
- Review the build logs in Vercel for specific error messages

---

## Additional Configuration

### Custom Domain (Optional)

1. In Vercel, go to your project → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed by Vercel
4. Add the custom domain to Firebase Auth authorized domains
5. Update `NEXT_PUBLIC_SITE_URL` environment variable

### Analytics (Optional)

If you want to add Firebase Analytics:

1. In Firebase Console, go to Project Settings
2. Scroll down and click "Add Firebase to your web app"
3. Enable Google Analytics
4. Add the measurement ID to your environment variables

---

## Security Best Practices

✅ **Do:**
- Keep your `.env.local` file private (never commit it to Git)
- Use Firebase security rules to protect your data
- Regularly review Firebase Console for suspicious activity
- Use Vercel's environment variable management

❌ **Don't:**
- Expose your Firebase config in public repositories
- Modify Firestore security rules without understanding the implications
- Allow unlimited users per room (keep the 2-user limit)

---

## Support

If you encounter issues not covered in this guide:

1. Check the browser console for error messages
2. Review Firebase Console logs
3. Check Vercel deployment logs
4. Verify all configuration steps were completed

---

## Next Steps

Now that your app is set up:

1. ✅ Test creating and joining rooms
2. ✅ Test timer functionality with a friend
3. ✅ Watch your shared heart grow as you study!
4. ✅ Maintain your streak by studying daily

Happy studying! 📚❤️