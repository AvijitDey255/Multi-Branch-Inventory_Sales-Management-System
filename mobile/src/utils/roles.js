/**
 * Role-Based Access Control (RBAC) Definitions & Demo Profiles
 * Roles: 'admin' | 'manager' | 'salesman' | 'customer'
 */

export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  SALESMAN: 'salesman',
  CUSTOMER: 'customer',
};

export const ROLE_CONFIG = {
  admin: {
    label: 'Administrator',
    badge: 'SUPER ADMIN',
    color: '#6366F1', // Indigo
    lightBg: '#EEF2FF',
    icon: 'shield-crown',
    description: 'Full permissions to manage all invoices, add products (+), view all orders and settings.',
    permissions: [
      { key: 'invoices', label: 'Invoices Management', allowed: true },
      { key: 'products_add', label: 'Add & Edit Products (+)', allowed: true },
      { key: 'orders_all', label: 'All Orders Oversight', allowed: true },
      { key: 'analytics', label: 'Revenue Analytics', allowed: true },
      { key: 'users', label: 'User & Staff Control', allowed: true },
      { key: 'bills', label: 'Customer Bills', allowed: false },
    ],
    // Tabs: Home, Invoice, Products [+ symbol], Order, More
    tabs: [
      { key: 'Home', label: 'Home', icon: 'home-variant-outline', activeIcon: 'home-variant' },
      { key: 'Invoices', label: 'Invoices', icon: 'file-document-outline', activeIcon: 'file-document' },
      {
        key: 'Products',
        label: 'Products',
        icon: 'cube-outline',
        activeIcon: 'cube',
        isSpecial: true, // Shows prominent with + symbol
        specialBadge: '+',
      },
      { key: 'Orders', label: 'Orders', icon: 'receipt-text-outline', activeIcon: 'receipt-text' },
      { key: 'More', label: 'More', icon: 'dots-horizontal', activeIcon: 'dots-horizontal-circle' },
    ],
  },

  manager: {
    label: 'Store Manager',
    badge: 'OPERATIONS',
    color: '#0EA5E9', // Sky blue
    lightBg: '#F0F9FF',
    icon: 'store-outline',
    description: 'Manage store invoices, inspect products catalogue, and track operations.',
    permissions: [
      { key: 'invoices', label: 'Invoices Management', allowed: true },
      { key: 'products_view', label: 'Product Inventory & Stock', allowed: true },
      { key: 'products_add', label: 'Add New Products', allowed: false },
      { key: 'orders_view', label: 'Fulfillment Tracking', allowed: true },
      { key: 'analytics', label: 'Store Performance Metrics', allowed: true },
      { key: 'bills', label: 'Customer Bills', allowed: false },
    ],
    // Tabs: Home, Invoice, Products, More
    tabs: [
      { key: 'Home', label: 'Home', icon: 'home-variant-outline', activeIcon: 'home-variant' },
      { key: 'Invoices', label: 'Invoices', icon: 'file-document-outline', activeIcon: 'file-document' },
      { key: 'Products', label: 'Products', icon: 'cube-outline', activeIcon: 'cube' },
      { key: 'More', label: 'More', icon: 'dots-horizontal', activeIcon: 'dots-horizontal-circle' },
    ],
  },

  salesman: {
    label: 'Sales Representative',
    badge: 'SALES FORCE',
    color: '#10B981', // Emerald
    lightBg: '#ECFDF5',
    icon: 'briefcase-account-outline',
    description: 'Browse products, place direct customer orders (+), and manage client accounts.',
    permissions: [
      { key: 'products_view', label: 'Product Catalog Browsing', allowed: true },
      { key: 'orders_create', label: 'Place New Orders (+)', allowed: true },
      { key: 'customers_manage', label: 'Customer Directory & Contacts', allowed: true },
      { key: 'sales_targets', label: 'Commission & Sales Quota', allowed: true },
      { key: 'invoices', label: 'Company Invoices', allowed: false },
      { key: 'bills', label: 'Customer Bills', allowed: false },
    ],
    // Tabs: Home, Products, Orders [+ symbol], Customers, More
    tabs: [
      { key: 'Home', label: 'Home', icon: 'home-variant-outline', activeIcon: 'home-variant' },
      { key: 'Products', label: 'Products', icon: 'cube-outline', activeIcon: 'cube' },
      {
        key: 'Orders',
        label: 'Orders',
        icon: 'cart-outline',
        activeIcon: 'cart',
        isSpecial: true, // Shows prominent with + symbol
        specialBadge: '+',
      },
      { key: 'Customers', label: 'Customers', icon: 'account-group-outline', activeIcon: 'account-group' },
      { key: 'More', label: 'More', icon: 'dots-horizontal', activeIcon: 'dots-horizontal-circle' },
    ],
  },

  customer: {
    label: 'Customer',
    badge: 'SHOPPER',
    color: '#F59E0B', // Amber
    lightBg: '#FFFBEB',
    icon: 'account-heart-outline',
    description: 'Browse personal catalog, pay bills, and track active delivery orders.',
    permissions: [
      { key: 'browse_catalog', label: 'Explore Products & Deals', allowed: true },
      { key: 'bills_view', label: 'View & Pay Bills', allowed: true },
      { key: 'my_orders', label: 'My Order History & Live Tracking', allowed: true },
      { key: 'support', label: 'Customer Care & Rewards', allowed: true },
      { key: 'invoices', label: 'Corporate Invoices', allowed: false },
      { key: 'customers_manage', label: 'Customer Database', allowed: false },
    ],
    // Tabs: Home, Bills, My Orders, More
    tabs: [
      { key: 'Home', label: 'Home', icon: 'home-variant-outline', activeIcon: 'home-variant' },
      { key: 'Bills', label: 'Bills', icon: 'receipt-outline', activeIcon: 'receipt' },
      { key: 'My Orders', label: 'My Orders', icon: 'package-variant-closed', activeIcon: 'package-variant' },
      { key: 'More', label: 'More', icon: 'dots-horizontal', activeIcon: 'dots-horizontal-circle' },
    ],
  },
};

export const getRoleConfig = (role) => {
  return ROLE_CONFIG[role] || ROLE_CONFIG.admin;
};

export const getRoleTabs = (role) => {
  const config = getRoleConfig(role);
  return config.tabs;
};
