/**
 * Убирает из AndroidManifest метаданные expo.modules.updates.*.
 * Prebuild добавляет их всегда, даже без пакета expo-updates; в этом приложении OTA-обновлений нет,
 * поэтому в манифесте им не место.
 */
const { withAndroidManifest } = require('expo/config-plugins');

module.exports = function withoutUpdatesMetadata(config) {
  return withAndroidManifest(config, (config) => {
    for (const application of config.modResults.manifest.application ?? []) {
      if (!application['meta-data']) continue;
      application['meta-data'] = application['meta-data'].filter(
        (item) => !item.$['android:name'].startsWith('expo.modules.updates.'),
      );
    }
    return config;
  });
};
