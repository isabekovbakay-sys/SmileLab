import { repositories } from '../services';
import { useResource } from './useResource';

/** Данные клиники приходят только через репозитории (mock или сервер). */
export function useServices() {
  return useResource('services', () => repositories.clinic.listServices());
}

export function useService(id: string | undefined) {
  return useResource(id ? `service:${id}` : null, () => repositories.clinic.getService(id ?? ''));
}

export function useDoctors() {
  return useResource('doctors', () => repositories.clinic.listDoctors());
}

export function useDoctor(id: string | undefined) {
  return useResource(id ? `doctor:${id}` : null, () => repositories.clinic.getDoctor(id ?? ''));
}

export function useClinicContent() {
  return useResource('content', () => repositories.clinic.getContent());
}
