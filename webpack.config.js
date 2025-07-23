const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync({
    ...env,
    babel: {
      dangerouslyAddModulePathsToTranspile: [
        'react-native-vector-icons',
        'react-native-paper',
        'react-native-animatable',
      ]
    }
  }, argv);
  
  // Add aliases for React Native modules that don't exist on web
  config.resolve.alias = {
    ...config.resolve.alias,
    'react-native$': 'react-native-web',
    'react-native-vector-icons/MaterialIcons': path.resolve(__dirname, 'src/components/WebIcon.js'),
    // Add Platform aliases to fix module resolution issues
    'react-native/Libraries/Utilities/Platform$': 'react-native-web/dist/exports/Platform',
    'react-native/Libraries/Image/Image$': 'react-native-web/dist/exports/Image',
    'react-native/Libraries/Components/View/View$': 'react-native-web/dist/exports/View',
    'react-native/Libraries/Text/Text$': 'react-native-web/dist/exports/Text',
    'react-native/Libraries/StyleSheet/StyleSheet$': 'react-native-web/dist/exports/StyleSheet',
  };

  // Ignore problematic modules
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "crypto": false,
    "stream": false,
    "buffer": false,
    "util": false,
    "url": false,
    "querystring": false,
    "path": false,
    "fs": false,
    // Add fallbacks for React Native specific modules
    "react-native/Libraries/Utilities/Platform": require.resolve('react-native-web/dist/exports/Platform'),
    "react-native/Libraries/Image/Image": require.resolve('react-native-web/dist/exports/Image'),
  };

  // Add ignore plugin for modules that cause issues
  const webpack = require('webpack');
  config.plugins.push(
    new webpack.IgnorePlugin({
      resourceRegExp: /^\.\/locale$/,
      contextRegExp: /moment$/,
    }),
    // Provide polyfills for React Native modules
    new webpack.ProvidePlugin({
      Platform: ['react-native-web/dist/exports/Platform', 'default'],
    }),
    // Replace problematic modules with web-compatible versions
    new webpack.NormalModuleReplacementPlugin(
      /.*\/Utilities\/Platform$/,
      'react-native-web/dist/exports/Platform'
    ),
    new webpack.NormalModuleReplacementPlugin(
      /.*\/Image\/Image$/,
      'react-native-web/dist/exports/Image'
    ),
    new webpack.NormalModuleReplacementPlugin(
      /.*\/View\/View$/,
      'react-native-web/dist/exports/View'
    ),
    new webpack.NormalModuleReplacementPlugin(
      /.*\/Text\/Text$/,
      'react-native-web/dist/exports/Text'
    ),
    new webpack.NormalModuleReplacementPlugin(
      /.*\/StyleSheet\/StyleSheet$/,
      'react-native-web/dist/exports/StyleSheet'
    )
  );

  return config;
};
