import { setStatusBarStyle } from 'expo-status-bar';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

type Style = 'light' | 'dark';

/** Стиль статус-бара текущего экрана: меню восстанавливает его после закрытия. */
let screenStyle: Style = 'dark';

/** Светлые значки статус-бара на фирменном фоне, тёмные — на светлых экранах. */
export function useStatusBarStyle(style: Style) {
  useFocusEffect(
    useCallback(() => {
      screenStyle = style;
      setStatusBarStyle(style, true);
      return () => {
        screenStyle = 'dark';
        setStatusBarStyle('dark', true);
      };
    }, [style]),
  );
}

export function restoreStatusBar() {
  setStatusBarStyle(screenStyle, true);
}
