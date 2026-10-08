import { wipeLocalData } from '../services/dataWipe';
import { deleteSecure, secureKeys } from '../services/secureStorage';
import { listAppKeys, removeRawKeys } from '../services/storage';
import { useAppointments } from '../state/AppointmentsProvider';
import { useProfile } from '../state/ProfileProvider';
import { invalidateResources } from './useResource';

/** Полное удаление данных приложения с телефона + сброс состояния в памяти. */
export function useWipeLocalData() {
  const { clearProfile } = useProfile();
  const { clearAll } = useAppointments();

  return async () => {
    await wipeLocalData(
      { deleteSecure, listAppKeys, removeRawKeys, clearCaches: () => invalidateResources() },
      Object.values(secureKeys),
    );
    await Promise.all([clearProfile(), clearAll()]);
  };
}
