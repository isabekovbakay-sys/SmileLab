import { Platform } from 'react-native';

/** Нативный драйвер анимаций на Android/iOS. В web его нет — там анимации идут в JS без предупреждений. */
export const useNativeDriver = Platform.OS !== 'web';
