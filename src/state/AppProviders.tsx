import type { ReactNode } from 'react';

import { AppointmentsProvider } from './AppointmentsProvider';
import { BookingProvider } from './BookingProvider';
import { MenuProvider } from './MenuProvider';
import { ProfileProvider } from './ProfileProvider';
import { SettingsProvider } from './SettingsProvider';
import { ToastProvider } from './ToastProvider';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <SettingsProvider>
      <ProfileProvider>
        <AppointmentsProvider>
          <BookingProvider>
            <MenuProvider>
              <ToastProvider>{children}</ToastProvider>
            </MenuProvider>
          </BookingProvider>
        </AppointmentsProvider>
      </ProfileProvider>
    </SettingsProvider>
  );
}
