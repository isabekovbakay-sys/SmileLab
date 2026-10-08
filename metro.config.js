// Metro: стандартная конфигурация Expo + заглушка @expo/ui для Android (см. shims/expo-ui-stub.js).
const path = require('node:path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
const expoUiStub = path.resolve(__dirname, 'shims/expo-ui-stub.js');

const defaultResolve = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'android' && (moduleName === '@expo/ui' || moduleName.startsWith('@expo/ui/'))) {
    return { type: 'sourceFile', filePath: expoUiStub };
  }
  return (defaultResolve ?? context.resolveRequest)(context, moduleName, platform);
};

module.exports = config;
