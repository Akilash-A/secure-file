// Polyfill for React Native's LayoutAnimation on web
export default {
  configureNext: (config, onAnimationDidEnd) => {
    // On web, we can use CSS transitions for layout animations
    if (typeof onAnimationDidEnd === 'function') {
      setTimeout(onAnimationDidEnd, config.duration || 300);
    }
  },
  
  create: (duration, type, creationProp) => ({
    duration: duration || 300,
    create: {
      type: type || 'easeInEaseOut',
      property: creationProp || 'opacity'
    }
  }),
  
  Types: {
    spring: 'spring',
    linear: 'linear',
    easeInEaseOut: 'ease-in-out',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    keyboard: 'ease-out'
  },
  
  Properties: {
    opacity: 'opacity',
    scaleX: 'scaleX',
    scaleY: 'scaleY',
    scaleXY: 'scale'
  },
  
  checkConfig: () => {},
  
  Presets: {
    easeInEaseOut: {
      duration: 300,
      create: { type: 'easeInEaseOut', property: 'opacity' },
      update: { type: 'easeInEaseOut' }
    },
    linear: {
      duration: 500,
      create: { type: 'linear', property: 'opacity' },
      update: { type: 'linear' }
    },
    spring: {
      duration: 700,
      create: { type: 'spring', property: 'opacity' },
      update: { type: 'spring' }
    }
  }
};
