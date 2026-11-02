/**
 * Role Definitions & Configurations
 */

export const ROLES = {
  ADMIN: 'ADMIN',
  BRANCH_MANAGER: 'BRANCH_MANAGER',
  SALESMAN: 'SALESMAN',
  CUSTOMER: 'CUSTOMER',
};

export const ROLE_CONFIG = {
  [ROLES.ADMIN]: {
    label: 'System Administrator',
    badgeText: 'ADMIN',
    color: '#6366F1',
    bgColor: '#EEF2FF',
    description: 'Full system control, multi-branch oversight, master product catalog, analytics.',
  },
  [ROLES.BRANCH_MANAGER]: {
    label: 'Branch Manager',
    badgeText: 'BRANCH MANAGER',
    color: '#0D9488',
    bgColor: '#F0FDFA',
    description: 'Branch stock allocation, purchase orders, branch sales, and staff management.',
  },
  [ROLES.SALESMAN]: {
    label: 'Sales Representative',
    badgeText: 'SALESMAN',
    color: '#EA580C',
    bgColor: '#FFF7ED',
    description: 'POS retail checkout, customer profiles, order entry, and daily targets.',
  },
  [ROLES.CUSTOMER]: {
    label: 'Valued Customer',
    badgeText: 'CUSTOMER',
    color: '#0284C7',
    bgColor: '#F0F9FF',
    description: 'Branch product catalog, order history, and account settings.',
  },
};
