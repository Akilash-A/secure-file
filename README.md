# Secure File Transfer App

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

## Tech Stack

- **React Native**: Cross-platform mobile development
- **Expo**: Development platform and tools
- **React Native Paper**: Material Design components
- **WebCrypto API**: Browser-based cryptographic operations
- **React Navigation**: Navigation library
- **Expo Crypto**: Cryptographic utilities

## Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd secure-file-transfer-app
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
6. **Share the encrypted file** and password separately

### Decrypting Files

1. **Navigate to Decrypt tab**
2. **Select encrypted file** (.secure extension)
3. **Enter the correct password**
4. **Tap "Decrypt File"**
5. **Access your original file**

### Managing Files

1. **View History tab** for all encrypted files
2. **Filter files** by status (active, expired, auto-delete)
3. **Search files** by name
4. **Share or delete** files as needed

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
├── screens/            # Main app screens
├── utils/              # Utility functions
│   ├── encryption.js   # Encryption/decryption logic
│   └── fileManager.js  # File operations
└── theme/              # App theme configuration
```

### Key Files
- `src/utils/encryption.js`: Core encryption functionality
- `src/utils/fileManager.js`: File storage and management
- `src/screens/EncryptScreen.js`: File encryption interface
- `src/screens/DecryptScreen.js`: File decryption interface
- `src/screens/HistoryScreen.js`: File history management

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

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository or contact the development team.

---

**⚠️ Security Warning**: This app provides strong encryption, but security also depends on how you handle passwords and share files. Always use secure channels for password sharing and keep your device protected.
