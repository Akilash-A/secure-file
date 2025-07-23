// Polyfill for React Native's legacySendAccessibilityEvent on web
export default function legacySendAccessibilityEvent(reactTag, eventType, eventData) {
  // On web, we can use standard accessibility APIs
  if (typeof document !== 'undefined') {
    const element = document.querySelector(`[data-react-tag="${reactTag}"]`);
    if (element) {
      // Dispatch a custom accessibility event
      const event = new CustomEvent('accessibilityEvent', {
        detail: { eventType, eventData }
      });
      element.dispatchEvent(event);
    }
  }
}
