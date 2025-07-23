// Polyfill for React Native's XMLHttpRequest on web
// On web, we can use the native XMLHttpRequest
export default global.XMLHttpRequest || window.XMLHttpRequest;
