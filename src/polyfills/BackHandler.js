// Polyfill for React Native's BackHandler on web
export default {
  addEventListener: (eventName, handler) => {
    if (eventName === 'hardwareBackPress') {
      // On web, we can listen to the browser's back button
      const handlePopState = (event) => {
        const result = handler();
        if (result === true) {
          // Prevent default browser back action
          event.preventDefault();
          window.history.pushState(null, '', window.location.href);
        }
      };
      
      window.addEventListener('popstate', handlePopState);
      return {
        remove: () => window.removeEventListener('popstate', handlePopState)
      };
    }
    return { remove: () => {} };
  },
  
  removeEventListener: (eventName, handler) => {
    // Handled by the subscription object
  },
  
  exitApp: () => {
    // On web, we can't actually exit the app, but we can close the tab
    if (window.confirm('Are you sure you want to close this app?')) {
      window.close();
    }
  }
};
