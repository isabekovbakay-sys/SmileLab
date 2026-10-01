import type { Language } from '../types/domain';
import { ky } from './ky';
import { ru, type Strings } from './ru';

export const dictionaries: Record<Language, Strings> = { ru, ky };

export type { Strings };
