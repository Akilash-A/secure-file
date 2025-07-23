// Polyfill for React Native's BlobManager on web
export default {
  isAvailable: typeof Blob !== 'undefined',
  
  addWebSocketHandler: (socketId) => {
    // No-op on web
  },
  
  removeWebSocketHandler: (socketId) => {
    // No-op on web
  },
  
  sendOverSocket: (blob, socketId) => {
    // On web, WebSocket can handle Blob directly
    console.warn('BlobManager.sendOverSocket not fully implemented on web');
  },
  
  createFromOptions: (options) => {
    if (typeof Blob !== 'undefined') {
      return new Blob([options.data], { type: options.type });
    }
    return null;
  }
};
