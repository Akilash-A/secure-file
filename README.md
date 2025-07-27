# 🔐 Secure File Transfer App

[![GitHub Repository](https://img.shields.io/badge/GitHub-secure--file-blue?style=flat-square&logo=github)](https://github.com/Akilash-A/secure-file.git)
[![React Native](https://img.shields.io/badge/React%20Native-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-000020?style=flat-square&logo=expo&logoColor=white)](https://expo.dev/)

A React Native application for encrypted file sharing using military-grade AES-256 encryption with auto-delete functionality.

## Features

### 🔒 Security
- **AES-256 Encryption**: Military-grade encryption using WebCrypto API
- **Secure Password Generation**: Auto-generated strong passwords
- **Zero-Knowledge Architecture**: Passwords are never stored on servers

### 📱 User Experience
- **Modern Material Design**: Beautiful and intuitive interface
- **Cross-Platform**: Works on iOS, Android, and Web
- **Responsive Design**: Optimized for all screen sizes
- **Smooth Animations**: Engaging user interactions

### ⏰ Auto-Delete
- **Configurable Expiration**: Set custom deletion times
- **Automatic Cleanup**: Files deleted after expiration
- **Secure Deletion**: Complete removal from device storage

### 📊 File Management
- **History Tracking**: View all encrypted files
- **File Status**: Monitor active, expired, and auto-delete files
- **Search & Filter**: Easy file discovery
- **Sharing Options**: Share encrypted files securely
- **Share Codes**: Generate unique 5-character codes for secure file sharing
- **Download/Share**: Multiple options for accessing encrypted files

## Tech Stack

- **React Native**: Cross-platform mobile development
- **Expo**: Development platform and tools
- **React Native Paper**: Material Design components
- **WebCrypto API**: Browser-based cryptographic operations
- **React Navigation**: Navigation library
- **Expo Crypto**: Cryptographic utilities

## 🚀 Quick Start

### Get Started in 2 Minutes

1. **Clone and Install**
   ```bash
   git clone https://github.com/Akilash-A/secure-file.git
   cd secure-file
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run web
   ```

3. **Run on Device**
   - Download [Expo Go](https://expo.dev/client) on your phone
   - Scan the QR code from terminal
   - Start encrypting files!

### Alternative Running Methods
- **Android Emulator**: `npm run android`
- **iOS Simulator**: `npm run ios`
- **Web Browser**: `npm run web`

## Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/Akilash-A/secure-file.git
   cd secure-file
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on your device**
   - Install Expo Go app on your mobile device
   - Scan the QR code from the terminal
   - Or run on emulator: `npm run android` or `npm run ios`

## Usage

### Encrypting Files

1. **Navigate to Encrypt tab**
2. **Select a file** from your device
3. **Choose password options**:
   - Auto-generate secure password (recommended)
   - Or enter custom password
4. **Configure auto-delete** (optional):
   - Enable auto-delete
   - Set deletion time in minutes
5. **Tap "Encrypt File"**
6. **Choose sharing method**:
   - **Download**: Save encrypted file locally
   - **Share File**: Share via system sharing options
   - **Generate Share Code**: Create a 5-character code for secure sharing

### Decrypting Files

1. **Navigate to Decrypt tab**
2. **Choose decryption method**:
   - **File + Password**: Select encrypted file and enter password
   - **Share Code**: Enter 5-character share code
3. **Tap "Decrypt File" or "Decrypt with Code"**
4. **Access your original file**

### Receiving Shared Files

1. **Navigate to Receive tab**
2. **Enter the 5-character share code** you received
3. **Tap "Receive File"**
4. **File will be automatically decrypted and available**

### Managing Files and Share Codes

1. **View History tab** for all encrypted files and active share codes
2. **Toggle between Files and Share Codes** views
3. **Filter files** by status (active, expired, auto-delete)
4. **Search files** by name
5. **Manage share codes**: View remaining time and downloads
6. **Delete expired or unused share codes**

## 🔒 Security Features

### 🛡️ Enterprise-Grade Encryption
- **AES-256-GCM**: Military-grade encryption standard
- **PBKDF2 Key Derivation**: Secure password-based key generation
- **Crypto.getRandomValues()**: Cryptographically secure random generation
- **Zero-Knowledge Architecture**: No sensitive data stored unencrypted

### 🔐 Advanced Security Implementations
- **Secure Authentication**: PBKDF2 hashing with salt
- **Input Validation**: Comprehensive XSS and injection protection
- **Rate Limiting**: Protection against brute force attacks
- **Content Security Policy**: Web-based attack prevention
- **Secure Storage**: AES-GCM encrypted client-side storage

### 🛠️ Security Utilities
- **SecureAuth**: Password hashing and verification
- **SecureStorage**: Encrypted localStorage replacement
- **Validation**: Input sanitization and validation
- **Security Headers**: CSP and security configuration

## Security Features

### Encryption Details
- **Algorithm**: AES-256-CBC
- **Key Size**: 256 bits (32 bytes)
- **IV Size**: 128 bits (16 bytes)
- **Random Generation**: Cryptographically secure random bytes

### Password Security
- **Length**: 16 characters (configurable)
- **Character Set**: Uppercase, lowercase, numbers, symbols
- **Entropy**: ~95 bits of entropy
- **No Storage**: Passwords never stored in app

### File Security
- **Local Storage**: Files stored in app's private directory
- **Metadata Protection**: File info encrypted with content
- **Secure Deletion**: Complete file removal on expiration
- **No Cloud Storage**: All operations happen locally

## Auto-Delete System

### How It Works
1. **Timer Setup**: Deletion timer starts when file is encrypted
2. **Background Processing**: App checks for expired files periodically
3. **Secure Removal**: Files completely deleted from device storage
4. **History Cleanup**: File records removed from history

### Configuration Options
- **Custom Duration**: Set deletion time in minutes
- **Immediate Cleanup**: Manual cleanup of expired files
- **Status Monitoring**: Track time remaining before deletion

## File Formats Supported

The app can encrypt any file type:
- **Documents**: PDF, DOC, TXT, etc.
- **Images**: JPG, PNG, GIF, etc.
- **Videos**: MP4, AVI, MOV, etc.
- **Audio**: MP3, WAV, FLAC, etc.
- **Archives**: ZIP, RAR, 7Z, etc.
- **Any other file format**

## Development

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── StatusCards.js   # File status display components
│   └── WebIcon.js       # Cross-platform icon component
├── screens/            # Main app screens
│   ├── EncryptScreen.js    # File encryption interface
│   ├── DecryptScreen.js    # File decryption interface
│   ├── HistoryScreen.js    # File history management
│   ├── ReceiveScreen.js    # Share code receiving
│   └── SettingsScreen.js   # App configuration
├── utils/              # Utility functions and security
│   ├── encryption.js       # Core encryption functionality
│   ├── fileManager.js      # File operations
│   ├── secureAuth.js       # Secure authentication utilities
│   ├── secureStorage.js    # Encrypted storage utilities
│   ├── validation.js       # Input validation and sanitization
│   └── security.js         # Security configuration and CSP
├── theme/              # App theme configuration
│   ├── theme.js            # Material Design theme
│   └── ThemeContext.js     # Theme context provider
└── polyfills/          # Cross-platform compatibility
    └── *.js                # React Native Web polyfills
```

### 🔧 Key Security Files
- `src/utils/secureAuth.js`: PBKDF2 authentication and password security
- `src/utils/secureStorage.js`: AES-GCM encrypted storage implementation
- `src/utils/validation.js`: Input validation and XSS protection
- `src/utils/security.js`: Content Security Policy and headers
- `src/utils/encryption.js`: Core AES-256 encryption with secure random generation

### Adding Features

1. **New Encryption Algorithms**:
   - Modify `src/utils/encryption.js`
   - Update UI to show algorithm options

2. **Cloud Storage Integration**:
   - Add cloud storage utilities
   - Implement secure upload/download

3. **User Authentication**:
   - Add biometric authentication
   - Implement app-level security

## Security Considerations

### Best Practices
- **Password Sharing**: Share passwords through separate, secure channels
- **Device Security**: Keep your device secure with lock screen
- **App Updates**: Keep the app updated for security patches
- **File Cleanup**: Regularly clean up old encrypted files

### Limitations
- **Password Recovery**: Lost passwords cannot be recovered
- **Device Access**: Anyone with device access can use the app
- **Network Security**: File sharing depends on chosen sharing method

## Troubleshooting

### Common Issues

**Encryption Failed**
- Check file permissions
- Ensure sufficient storage space
- Try with smaller files first

**Decryption Failed**
- Verify password is correct
- Check if file is corrupted
- Ensure file is properly encrypted

**App Crashes**
- Clear app cache and data
- Restart the app
- Check device storage

### Performance Tips
- **Large Files**: Encrypt smaller files for better performance
- **Multiple Files**: Process files one at a time
- **Storage**: Regularly clean up old files

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### Development Setup
1. **Fork the repository** on [GitHub](https://github.com/Akilash-A/secure-file.git)
2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/secure-file.git
   cd secure-file
   ```
3. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
4. **Install dependencies**
   ```bash
   npm install
   ```
5. **Start development server**
   ```bash
   npm start
   ```

### Making Changes
1. Make your changes following the coding standards
2. Test your changes thoroughly
3. Add tests if applicable
4. Ensure security best practices are followed
5. Update documentation if needed

### Submitting Changes
1. **Commit your changes**
   ```bash
   git commit -m "feat: add amazing feature"
   ```
2. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```
3. **Create a Pull Request** on GitHub

### Contribution Guidelines
- Follow existing code style and patterns
- Maintain security standards and practices
- Add appropriate tests for new features
- Update documentation for user-facing changes
- Ensure cross-platform compatibility

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 📞 Support & Contact

- **GitHub Issues**: [Report bugs or request features](https://github.com/Akilash-A/secure-file/issues)
- **GitHub Repository**: [https://github.com/Akilash-A/secure-file.git](https://github.com/Akilash-A/secure-file.git)
- **Discussions**: [GitHub Discussions](https://github.com/Akilash-A/secure-file/discussions)

### Getting Help
1. **Check existing issues** on GitHub
2. **Search documentation** in this README
3. **Create a new issue** with detailed information
4. **Join discussions** for general questions

---

## ⚠️ Important Security Notes

### Production Deployment
- **HTTPS Only**: Always use HTTPS in production
- **Server Implementation**: Consider server-side encryption for enhanced security
- **Regular Updates**: Keep dependencies updated
- **Security Audits**: Conduct regular security reviews

### User Responsibilities
- **Strong Passwords**: Use secure passwords for encryption
- **Secure Sharing**: Share passwords through secure channels
- **Device Security**: Keep your device locked and secure
- **Regular Cleanup**: Remove old encrypted files when no longer needed

**🔐 Remember**: This app provides strong encryption, but security also depends on how you handle passwords and share files. Always use secure channels for password sharing and keep your device protected.
