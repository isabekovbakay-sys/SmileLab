import { createContext, use, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

import { getJSON, removeKeys, setJSON, storageKeys } from '../services/storage';
import type { PatientProfile } from '../types/domain';

interface ProfileContextValue {
  ready: boolean;
  profile: PatientProfile;
  updateProfile: (patch: Partial<PatientProfile>) => void;
  clearProfile: () => Promise<void>;
}

const EMPTY: PatientProfile = { name: '', phone: '', email: '' };

const ProfileContext = createContext<ProfileContextValue | null>(null);

function sanitize(value: Partial<PatientProfile> | null): PatientProfile {
  return {
    name: typeof value?.name === 'string' ? value.name : '',
    phone: typeof value?.phone === 'string' ? value.phone : '',
    email: typeof value?.email === 'string' ? value.email : '',
  };
}

/** Имя, телефон и e-mail пациента. Хранятся только на устройстве. */
export function ProfileProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState({ ready: false, profile: EMPTY });

  useEffect(() => {
    let active = true;
    getJSON<Partial<PatientProfile> | null>(storageKeys.profile, null).then((saved) => {
      if (active) setState({ ready: true, profile: sanitize(saved) });
    });
    return () => {
      active = false;
    };
  }, []);

  const { profile: currentProfile } = state;

  const updateProfile = useCallback(
    (patch: Partial<PatientProfile>) => {
      const profile = { ...currentProfile, ...patch };
      setState((prev) => ({ ...prev, profile }));
      setJSON(storageKeys.profile, profile);
    },
    [currentProfile],
  );

  const clearProfile = useCallback(async () => {
    setState((prev) => ({ ...prev, profile: EMPTY }));
    await removeKeys([storageKeys.profile]);
  }, []);

  const value = useMemo(() => ({ ...state, updateProfile, clearProfile }), [state, updateProfile, clearProfile]);
  return <ProfileContext value={value}>{children}</ProfileContext>;
}

export function useProfile(): ProfileContextValue {
  const context = use(ProfileContext);
  if (!context) throw new Error('useProfile вне ProfileProvider');
  return context;
}
