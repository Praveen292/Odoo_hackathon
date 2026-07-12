import type { RoleName } from '../types';

export const ALL_ROLES: RoleName[] = ['Fleet Manager', 'Driver', 'Safety Officer', 'Financial Analyst'];

export type ModuleKey =
  | 'dashboard'
  | 'vehicles'
  | 'drivers'
  | 'trips'
  | 'maintenance'
  | 'fuel'
  | 'expenses'
  | 'reports'
  | 'documents';

const ACCESS: Record<ModuleKey, RoleName[]> = {
  dashboard: ['Fleet Manager', 'Driver', 'Safety Officer', 'Financial Analyst'],
  vehicles: ['Fleet Manager', 'Safety Officer'],
  drivers: ['Fleet Manager', 'Safety Officer'],
  trips: ['Fleet Manager', 'Driver', 'Safety Officer'],
  maintenance: ['Fleet Manager', 'Safety Officer'],
  fuel: ['Fleet Manager', 'Financial Analyst'],
  expenses: ['Fleet Manager', 'Financial Analyst'],
  reports: ['Fleet Manager', 'Financial Analyst', 'Safety Officer'],
  documents: ['Fleet Manager', 'Safety Officer'],
};

export function canAccess(module: ModuleKey, role: RoleName | null): boolean {
  if (!role) return false;
  return ACCESS[module].includes(role);
}

export function getAccessibleModules(role: RoleName | null): ModuleKey[] {
  if (!role) return [];
  return (Object.keys(ACCESS) as ModuleKey[]).filter((m) => ACCESS[m].includes(role));
}
