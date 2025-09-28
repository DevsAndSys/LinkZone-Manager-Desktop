# Changelog - Link Zone Manager

## v1.2.2 (2025-09-28)

### 🔧 Bug Fixes
- **Tray Icon**: Fixed system tray icon not displaying correctly in production builds
- **Version Numbers**: Fixed executable filename showing incorrect version (1.0.0)
- **Build System**: Corrected file paths for packaged application resources

### 🎯 Improvements  
- **SMS Conversation**: Enhanced message display with timestamps and scrollable interface
- **UI/UX**: Fixed modal sizing for better message viewing experience
- **System Integration**: Improved minimize-to-tray functionality with proper notifications

### 🚀 Technical Changes
- Updated electron-builder configuration for proper resource bundling
- Fixed tray icon resource paths for production environment
- Corrected package.json version to match release tags

---

## v1.2.1 (Previous Release)

### ✨ New Features
- **Minimize to Tray**: Added system tray functionality for background operation
- **SMS Management**: Complete SMS system with conversation view and message deletion
- **Scheduler**: Hybrid scheduling system for automatic device control
- **Build Automation**: Added GitHub Actions for Windows and macOS builds

### 🔧 Bug Fixes
- Fixed Node.js v22 compatibility issues
- Resolved CORS/network access problems
- Fixed external links opening in system browser

### 🏗️ Infrastructure
- Integrated node-cron for scheduled tasks
- Added IPC communication for secure API calls
- Implemented electron-store for persistent configuration