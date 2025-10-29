import { en } from './en';
import { pa } from './pa';

export const dictionaries = {
  en,
  pa,
};

export type SupportedLocale = keyof typeof dictionaries;

