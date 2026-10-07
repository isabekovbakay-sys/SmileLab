import { startActivityAsync } from 'expo-intent-launcher';
import { Platform } from 'react-native';

import type { CalendarEvent } from './calendarEvent';

/** Добавление в календарь — только Android: системный экран нового события, разрешения не нужны. */
export const calendarSupported = Platform.OS === 'android';

/** Открывает календарь с заполненным событием. false — календаря на телефоне нет. */
export async function openCalendarInsert(event: CalendarEvent): Promise<boolean> {
  if (!calendarSupported) return false;
  try {
    await startActivityAsync('android.intent.action.INSERT', {
      data: 'content://com.android.calendar/events',
      extra: {
        title: event.title,
        beginTime: event.beginTime,
        endTime: event.endTime,
        eventLocation: event.eventLocation,
        description: event.description,
      },
    });
    return true;
  } catch {
    return false;
  }
}
