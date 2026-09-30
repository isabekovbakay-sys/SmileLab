import { router, useNavigation } from 'expo-router';
import { useCallback } from 'react';

/** Навигация внутри потока записи (свой Stack): закрыть весь поток целиком. */
export function useBookingNavigation() {
  const navigation = useNavigation();

  const closeFlow = useCallback(() => {
    const parent = navigation.getParent();
    if (parent?.canGoBack()) parent.goBack();
    else router.replace('/');
  }, [navigation]);

  return { closeFlow };
}
