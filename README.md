# SecureFile Transfer

A cross-platform secure file encryption and sharing application built with React Native and Expo. Features military-grade AES-256 encryption, instant file sharing with auto-delete, and a beautiful glassmorphic UI.

## Features

- **AES-256 Encryption**: Military-grade encryption for your sensitive files
- **Instant File Sharing**: Share files securely using 5-character codes without encryption
- **Auto-Delete**: Files automatically expire after set time periods
- **Cross-Platform**: Works on Web, iOS, and Android
- **Dark/Light Mode**: Beautiful glassmorphic UI with theme switching
- **Zero Backend**: Client-side encryption and browser-based storage

## Tech Stack

- React Native 0.72
- Expo 49
- React Navigation
- React Native Paper
- Web Crypto API (AES-CBC/AES-GCM)
- Expo Crypto

## Installation

```bash
npm install
```

## Usage

### Encrypt Files
1. Navigate to the **Encrypt** tab
2. Select a file using the file picker or drag & drop (web)
3. File is encrypted using AES-256-CBC with randomly generated key and IV
4. Download the encrypted file and save the encryption key securely
5. Original file is never stored - encryption happens in-memory

### Decrypt Files
1. Go to the **Decrypt** tab
2. Select the encrypted `.enc` file
3. Enter the encryption key that was provided during encryption
4. File is decrypted in-memory and ready for download
5. No server communication - everything happens locally

### Share Files Instantly
1. Open the **Share** tab
2. Select any file to share (no encryption needed)
3. Choose expiry time: 1 hour, 24 hours, 7 days, or 30 days
4. Get a unique 5-character code (e.g., `A3X9K`)
5. Share the code with recipients

### Receive Shared Files
1. Navigate to **Receive** tab
2. Enter the 5-character share code
3. View file details (name, size, expiry)
4. Download before expiration - files auto-delete after expiry
5. Track download count and time remaining

## How It Works

### Encryption
1. Files are encrypted using AES-256-CBC with randomly generated keys and IVs
2. Keys are generated using `crypto.getRandomValues()` for cryptographic security
3. Encrypted data is stored in browser's sessionStorage with secure key derivation

### File Sharing
1. Files can be shared instantly using unique 5-character alphanumeric codes
2. Shared files are stored in localStorage with base64 encoding
3. Files auto-delete after expiry time (configurable)
4. Download tracking and automatic cleanup of expired files

### Security Features
- Client-side encryption (data never leaves your device unencrypted)
- Secure random key generation using Web Crypto API
- Session-based encrypted storage with AES-GCM
- PBKDF2 key derivation with 100,000 iterations
- Automatic cleanup of expired shared files

## Project Structure

```
src/
├── App.js                 # Main app with tab navigation
├── screens/               # Screen components
│   ├── HomeScreen.js      # Landing page with features
│   ├── EncryptScreen.js   # File encryption interface
│   ├── DecryptScreen.js   # File decryption interface
│   ├── ShareScreen.js     # Instant file sharing
│   ├── ReceiveScreen.js   # Receive shared files
│   └── SettingsScreen.js  # App settings
├── utils/                 # Core utilities
│   ├── encryption.js      # AES-256 encryption/decryption
│   ├── secureStorage.js   # Encrypted localStorage wrapper
│   └── sharedFileStorage.js # Shared file management
└── theme/                 # Theme configuration
    ├── theme.js           # Color schemes
    └── ThemeContext.js    # Theme provider
```

## Key Components

### Encryption Flow
- **Key Generation**: 256-bit keys using `crypto.getRandomValues()`
- **IV Generation**: 128-bit initialization vectors for each encryption
- **Algorithm**: AES-256-CBC for file encryption
- **Storage**: AES-256-GCM for secure storage with PBKDF2 key derivation
- **No Server**: All encryption/decryption happens client-side

### File Sharing System
- **Code Generation**: Cryptographically secure 5-character alphanumeric codes
- **Storage**: LocalStorage with base64 encoding for web compatibility
- **Expiry Management**: Automatic cleanup with hourly scheduled jobs
- **Download Tracking**: Monitor access count for each shared file
- **No Account Needed**: Fully anonymous sharing system

### UI/UX Features
- **Glassmorphic Design**: Modern blurred backgrounds with gradient overlays
- **Smooth Animations**: Powered by React Native Animated API
- **Responsive Layout**: Works on mobile, tablet, and desktop screens
- **Theme Switching**: Seamless dark/light mode transition
- **Progress Indicators**: Real-time feedback for encryption operations

## Security Considerations

⚠️ **Important Notes**:
- This app uses **client-side storage** (localStorage/sessionStorage)
- Shared files are stored in browser memory - clear browser data to remove
- Encryption keys are **never stored** - you must save them manually
- For production use, consider implementing a backend with proper key management
- Use HTTPS in production to prevent man-in-the-middle attacks
- Session storage is cleared when browser/tab closes

## Browser Support

- **Chrome/Edge**: Full support (recommended)
- **Firefox**: Full support
- **Safari**: Full support with WebCrypto API
- **Mobile Browsers**: Works on iOS Safari and Chrome Android
