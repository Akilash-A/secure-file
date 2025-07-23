// Polyfill for React Native's NativeEventEmitter on web
class NativeEventEmitter {
  constructor(nativeModule) {
    this.nativeModule = nativeModule;
    this.listeners = new Map();
  }

  addListener(eventType, listener, context) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    
    this.listeners.get(eventType).add(listener);
    
    return {
      remove: () => {
        const eventListeners = this.listeners.get(eventType);
        if (eventListeners) {
          eventListeners.delete(listener);
          if (eventListeners.size === 0) {
            this.listeners.delete(eventType);
          }
        }
      }
    };
  }

  removeListener(eventType, listener) {
    const eventListeners = this.listeners.get(eventType);
    if (eventListeners) {
      eventListeners.delete(listener);
      if (eventListeners.size === 0) {
        this.listeners.delete(eventType);
      }
    }
  }

  removeAllListeners(eventType) {
    if (eventType) {
      this.listeners.delete(eventType);
    } else {
      this.listeners.clear();
    }
  }

  emit(eventType, ...args) {
    const eventListeners = this.listeners.get(eventType);
    if (eventListeners) {
      eventListeners.forEach(listener => {
        try {
          listener(...args);
        } catch (error) {
          console.error('Error in event listener:', error);
        }
      });
    }
  }

  listenerCount(eventType) {
    const eventListeners = this.listeners.get(eventType);
    return eventListeners ? eventListeners.size : 0;
  }
}

export default NativeEventEmitter;
