import { createContext, use, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

import { deleteSecure, getSecureJSON, secureKeys, setSecureJSON } from '../services/secureStorage';
import { getJSON, removeKeys, storageKeys } from '../services/storage';
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

/**
 * Профиль загружается из SecureStore. Версия 1.0.0 хранила его в AsyncStorage:
 * при первом запуске переносим и удаляем старый ключ.
 */
async function loadProfile(): Promise<PatientProfile> {
  const secure = await getSecureJSON<Partial<PatientProfile> | null>(secureKeys.profile, null);
  if (secure) return sanitize(secure);
  const legacy = await getJSON<Partial<PatientProfile> | null>(storageKeys.profile, null);
  if (!legacy) return EMPTY;
  const profile = sanitize(legacy);
  if (await setSecureJSON(secureKeys.profile, profile)) await removeKeys([storageKeys.profile]);
  return profile;
}

/** Имя, телефон и e-mail пациента. Хранятся только на устройстве, в защищённом хранилище. */
export function ProfileProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState({ ready: false, profile: EMPTY });

  useEffect(() => {
    let active = true;
    loadProfile().then((profile) => {
      if (active) setState({ ready: true, profile });
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
      setSecureJSON(secureKeys.profile, profile);
    },
    [currentProfile],
  );

  const clearProfile = useCallback(async () => {
    setState((prev) => ({ ...prev, profile: EMPTY }));
    await deleteSecure([secureKeys.profile]);
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
