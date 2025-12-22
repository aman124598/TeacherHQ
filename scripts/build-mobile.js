/**
 * Build script for Capacitor mobile app
 * 
 * This script:
 * 1. Temporarily moves the API folder (API routes are not compatible with static export)
 * 2. Temporarily moves the middleware file
 * 3. Builds the Next.js app with static export
 * 4. Restores the API folder and middleware
 * 5. Syncs the build with Capacitor
 * 
 * Usage: node scripts/build-mobile.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const appDir = path.join(__dirname, '..');
const apiDir = path.join(appDir, 'app', 'api');
const apiBackupDir = path.join(appDir, '_api_backup_temp');
const middlewareFile = path.join(appDir, 'middleware.ts');
const middlewareBackup = path.join(appDir, '_middleware.ts.backup');

// Dynamic route folders that need to be backed up (incompatible with static export)
const dynamicRoutes = [
  { src: path.join(appDir, 'app', 'admin', 'schedule', '[userId]'), backup: path.join(appDir, '_backup_admin_schedule_userId') },
  { src: path.join(appDir, 'app', 'join', '[code]'), backup: path.join(appDir, '_backup_join_code') },
];

function log(message) {
  console.log(`[build-mobile] ${message}`);
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function deleteDir(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function backupDir(src, dest, name) {
  if (fs.existsSync(src)) {
    log(`Backing up ${name}...`);
    deleteDir(dest);
    copyDir(src, dest);
    // Try to delete the original, retry a few times if it fails
    let retries = 3;
    while (retries > 0) {
      try {
        deleteDir(src);
        break;
      } catch (e) {
        retries--;
        if (retries === 0) throw e;
        log('Retrying delete...');
        // Sleep briefly
        execSync('timeout /t 1 /nobreak >nul 2>&1', { shell: true });
      }
    }
  }
}

function restoreDir(src, dest, name) {
  if (fs.existsSync(src)) {
    log(`Restoring ${name}...`);
    if (!fs.existsSync(dest)) {
      copyDir(src, dest);
    }
    deleteDir(src);
  }
}

function backup() {
  // Backup API folder
  backupDir(apiDir, apiBackupDir, 'API folder');
  
  // Backup dynamic route folders
  for (const route of dynamicRoutes) {
    backupDir(route.src, route.backup, path.basename(route.src));
  }
  
  // Backup middleware
  if (fs.existsSync(middlewareFile)) {
    log('Backing up middleware...');
    fs.copyFileSync(middlewareFile, middlewareBackup);
    fs.unlinkSync(middlewareFile);
  }
}

function restore() {
  // Restore API folder
  restoreDir(apiBackupDir, apiDir, 'API folder');
  
  // Restore dynamic route folders
  for (const route of dynamicRoutes) {
    restoreDir(route.backup, route.src, path.basename(route.src));
  }
  
  // Restore middleware
  if (fs.existsSync(middlewareBackup)) {
    log('Restoring middleware...');
    if (!fs.existsSync(middlewareFile)) {
      fs.copyFileSync(middlewareBackup, middlewareFile);
    }
    fs.unlinkSync(middlewareBackup);
  }
}

async function main() {
  log('Starting Capacitor build...');
  log('');
  log('NOTE: For the mobile app to work, you need to:');
  log('1. Deploy your web app to Vercel first');
  log('2. Set NEXT_PUBLIC_API_URL in your mobile build to point to your Vercel deployment');
  log('');
  
  try {
    // Step 1: Backup files that are incompatible with static export
    backup();
    
    // Step 2: Set environment and build
    log('Building Next.js with static export...');
    execSync('npx next build', { 
      cwd: appDir, 
      stdio: 'inherit',
      env: { ...process.env, CAPACITOR_BUILD: 'true' }
    });
    
    // Step 3: Sync with Capacitor
    log('Syncing with Capacitor...');
    execSync('npx cap sync', { cwd: appDir, stdio: 'inherit' });
    
    log('');
    log('✅ Capacitor build complete!');
    log('');
    log('Next steps:');
    log('  - Run "npm run cap:open:android" to open Android Studio');
    log('  - Run "npm run cap:open:ios" to open Xcode (macOS only)');
    
  } catch (error) {
    console.error('Build failed:', error.message);
    process.exit(1);
  } finally {
    // Always restore files
    restore();
  }
}

main();

