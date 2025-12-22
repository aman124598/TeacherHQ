# Capacitor Mobile App Setup

This project has been configured to build as a native mobile app using [Capacitor](https://capacitorjs.com/).

## Prerequisites

### For Android Development:

- [Android Studio](https://developer.android.com/studio) installed
- Android SDK configured
- Java JDK 17+ installed

### For iOS Development (macOS only):

- [Xcode](https://developer.apple.com/xcode/) installed
- CocoaPods installed (`sudo gem install cocoapods`)

## Important Notes

⚠️ **API Configuration**: The mobile app uses static export, which means API routes don't run on the device. You need to:

1. **Deploy your web app to Vercel** (or another hosting service)
2. **Set the API URL** in your environment before building:
   - Add `NEXT_PUBLIC_API_URL=https://your-vercel-app.vercel.app` to your `.env.local`
   - This tells the mobile app to call your hosted API

## Available Scripts

### Build the Mobile App

```bash
npm run mobile:build
```

This command:

1. Temporarily backs up API routes and dynamic routes (incompatible with static export)
2. Builds the Next.js app as static HTML/CSS/JS
3. Syncs the build with Capacitor native projects
4. Restores all backed up files

### Open in Android Studio

```bash
npm run cap:open:android
```

Then in Android Studio:

1. Wait for Gradle sync to complete
2. Connect a device or start an emulator
3. Click the "Run" button (▶️)

### Open in Xcode (macOS only)

```bash
npm run cap:open:ios
```

Then in Xcode:

1. Select your target device/simulator
2. Click the "Run" button (▶️)

### Sync After Web Changes

```bash
npm run cap:sync
```

Use this after making changes to your web app to update the native projects.

## Project Structure

```
├── android/          # Android native project
├── ios/              # iOS native project
├── out/              # Static export output (generated)
├── capacitor.config.ts  # Capacitor configuration
└── scripts/
    └── build-mobile.js  # Mobile build script
```

## Capacitor Configuration

Edit `capacitor.config.ts` to customize:

- **appId**: Your app's unique identifier (e.g., `com.yourcompany.app`)
- **appName**: Display name of your app
- **plugins**: Configure native plugins (splash screen, etc.)

## Live Reload (Development)

For faster development, you can enable live reload:

1. Find your computer's local IP address
2. Edit `capacitor.config.ts` and uncomment the `server` block:
   ```typescript
   server: {
     url: 'http://YOUR_LOCAL_IP:3000',
     cleartext: true
   }
   ```
3. Run `npm run dev` on your computer
4. Run the app on your device/emulator

⚠️ Remember to comment out the `server` block before building for production!

## Building for Release

### Android APK/AAB

1. Open Android Studio: `npm run cap:open:android`
2. Go to **Build > Generate Signed Bundle/APK**
3. Follow the wizard to create a release build

### iOS IPA

1. Open Xcode: `npm run cap:open:ios`
2. Select **Generic iOS Device** as the target
3. Go to **Product > Archive**
4. Follow the wizard to upload to App Store Connect

## Troubleshooting

### Build fails with "EPERM" or permission errors

- Close any editors or programs that might be using the files
- Try running the command again

### App shows blank screen

- Check that `NEXT_PUBLIC_API_URL` is set correctly
- Ensure your API is accessible from the device
- Check the browser console in Android Studio/Xcode for errors

### API calls fail

- Make sure your Vercel deployment is live
- Check CORS settings on your API
- Verify the `NEXT_PUBLIC_API_URL` environment variable
