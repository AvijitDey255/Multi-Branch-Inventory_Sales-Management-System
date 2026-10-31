import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { darkColors, lightColors } from '../theme/colors';
import { getRoleConfig } from '../utils/roles';
import tw from '../utils/tw';

export default function MoreScreen({ onNavigate }) {
  const dispatch = useDispatch();
  const mode = useSelector((state) => state.theme.mode);
  const user = useSelector((state) => state.auth.user);
  const isDark = mode === 'dark';
  const colors = isDark ? darkColors : lightColors;

  const currentRole = user?.role || 'admin';
  const roleConfig = getRoleConfig(currentRole);

  /**
   * Return the exact list of buttons required for the active user role:
   *
   * Admin:
   *   home, invoice, products, varients, setting, business, orders, branchs, profile, special offers, app info
   *
   * Branch / Manager:
   *   home, invoice, products, setting, orders, set targets, salesman, customers, profile, special offers, app info
   *
   * Salesman:
   *   home, products, setting, orders, see targets and achivement, customers, profile, app info
   *
   * Customer:
   *   home, setting, my orders, billes, profile, app info
   */
  const getRoleButtons = () => {
    switch (currentRole) {
      case 'admin':
        return [
          { key: 'Home', label: 'Home', sub: 'Executive overview & metrics', icon: 'home-variant-outline', color: '#6366F1' },
          { key: 'Invoices', label: 'Invoice', sub: 'Manage & track all company invoices', icon: 'file-document-outline', color: '#0EA5E9' },
          { key: 'Products', label: 'Products', sub: 'Catalogue inventory & stock management', icon: 'cube-outline', color: '#10B981' },
          { key: 'Categories', label: 'Categories', sub: 'Catalog departments, taxonomy & groupings', icon: 'shape-plus', color: '#F59E0B' },
          { key: 'Variants', label: 'Varients', sub: 'SKU attributes, colors & price rules', icon: 'shape-outline', color: '#8B5CF6' },
          { key: 'Settings', label: 'Setting', sub: 'Appearance, push notifications & security', icon: 'cog-outline', color: '#64748B' },
          { key: 'Business', label: 'Business', sub: 'Legal entity, tax IDs & invoicing setup', icon: 'domain', color: '#F59E0B' },
          { key: 'Orders', label: 'Orders', sub: 'All client orders, delivery & dispatch', icon: 'receipt-text-outline', color: '#0EA5E9' },
          { key: 'Branches', label: 'Branchs', sub: 'Outlets, regional hubs & managers', icon: 'storefront-outline', color: '#10B981' },
          { key: 'Users', label: 'Users', sub: 'All registered users, roles & accounts', icon: 'account-group-outline', color: '#6366F1' },
          { key: 'Profile', label: 'Profile', sub: 'Account credentials & contact info', icon: 'account-outline', color: '#6366F1' },
          { key: 'SpecialOffers', label: 'Special Offers', sub: 'Vouchers, discounts & promotional codes', icon: 'tag-multiple-outline', color: '#EC4899' },
          { key: 'AppInfo', label: 'App Info', sub: 'System build, licenses & specifications', icon: 'information-outline', color: '#64748B' },
        ];

      case 'manager':
        return [
          { key: 'Home', label: 'Home', sub: 'Branch dashboard & performance', icon: 'home-variant-outline', color: '#0EA5E9' },
          { key: 'Invoices', label: 'Invoice', sub: 'Review receivables & settled invoices', icon: 'file-document-outline', color: '#6366F1' },
          { key: 'Products', label: 'Products', sub: 'Warehouse inventory & stock count', icon: 'cube-outline', color: '#10B981' },
          { key: 'Settings', label: 'Setting', sub: 'Branch preferences & notification options', icon: 'cog-outline', color: '#64748B' },
          { key: 'Orders', label: 'Orders', sub: 'Fulfillment orders & package delivery', icon: 'receipt-text-outline', color: '#0EA5E9' },
          { key: 'SetTargets', label: 'Set Targets', sub: 'Define monthly sales quotas & incentives', icon: 'target', color: '#EF4444' },
          { key: 'Salesmen', label: 'Salesman', sub: 'Sales force roster & individual metrics', icon: 'account-group-outline', color: '#10B981' },
          { key: 'Customers', label: 'Customers', sub: 'Branch client directory & accounts', icon: 'account-multiple-check-outline', color: '#F59E0B' },
          { key: 'Users', label: 'Users', sub: 'All registered users, roles & accounts', icon: 'account-group-outline', color: '#6366F1' },
          { key: 'Profile', label: 'Profile', sub: 'Manager profile & login settings', icon: 'account-outline', color: '#6366F1' },
          { key: 'Branches', label: 'Branchs', sub: 'Outlets, regional hubs & managers', icon: 'storefront-outline', color: '#10B981' },
          { key: 'SpecialOffers', label: 'Special Offers', sub: 'Store promotional vouchers & discounts', icon: 'tag-multiple-outline', color: '#EC4899' },
          { key: 'AppInfo', label: 'App Info', sub: 'System diagnostics & software build', icon: 'information-outline', color: '#64748B' },
        ];

      case 'salesman':
        return [
          { key: 'Home', label: 'Home', sub: 'Daily pipeline & sales targets', icon: 'home-variant-outline', color: '#10B981' },
          { key: 'Products', label: 'Products', sub: 'Browse products catalog for deals', icon: 'cube-outline', color: '#6366F1' },
          { key: 'Settings', label: 'Setting', sub: 'Alerts, theme & preferences', icon: 'cog-outline', color: '#64748B' },
          { key: 'Orders', label: 'Orders', sub: 'Placed deals & customer deliveries', icon: 'cart-outline', color: '#0EA5E9' },
          { key: 'TargetsAchievement', label: 'See Targets and Achivement', sub: 'Monthly quota gauge & commission tracker', icon: 'trophy-award', color: '#F59E0B' },
          { key: 'Customers', label: 'Customers', sub: 'My assigned client leads & contacts', icon: 'account-group-outline', color: '#10B981' },
          { key: 'Profile', label: 'Profile', sub: 'My representative credentials', icon: 'account-outline', color: '#6366F1' },
          { key: 'AppInfo', label: 'App Info', sub: 'Application version & terms', icon: 'information-outline', color: '#64748B' },
        ];

      case 'customer':
      default:
        return [
          { key: 'Home', label: 'Home', sub: 'Catalog feed & featured tech items', icon: 'home-variant-outline', color: '#F59E0B' },
          { key: 'Settings', label: 'Setting', sub: 'Theme mode, currency & notifications', icon: 'cog-outline', color: '#64748B' },
          { key: 'My Orders', label: 'My Orders', sub: 'Active delivery tracking & past purchases', icon: 'package-variant-closed', color: '#10B981' },
          { key: 'Bills', label: 'Billes', sub: 'Outstanding statements & payment receipts', icon: 'receipt-outline', color: '#EF4444' },
          { key: 'Profile', label: 'Profile', sub: 'Delivery address & membership tier', icon: 'account-outline', color: '#6366F1' },
          { key: 'AppInfo', label: 'App Info', sub: 'Nexus platform details & support desk', icon: 'information-outline', color: '#64748B' },
        ];
    }
  };

  const buttonList = getRoleButtons();

  return (
    <View style={[tw('flex-1'), { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={tw('p-4 pb-20')} showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <View
          style={[
            tw('p-4 rounded-3xl border mb-4 shadow-sm'),
            {
              backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
              borderColor: colors.border,
            },
          ]}
        >
          <View style={tw('flex-row items-center gap-3.5')}>
            <Image
              source={{
                uri:
                  user?.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    user?.name || user?.fullName || user?.username || 'User'
                  )}&background=6366F1&color=fff&bold=true`,
              }}
              style={[
                tw('w-13 h-13 rounded-full border-2'),
                { borderColor: roleConfig.color },
              ]}
            />
            <View style={tw('flex-1')}>
              <View style={tw('flex-row items-center gap-2')}>
                <Text style={[tw('text-base font-bold'), { color: colors.text }]}>
                  {user?.name || user?.fullName || 'User'}
                </Text>
                <View
                  style={[
                    tw('px-2 py-0.5 rounded-md'),
                    { backgroundColor: `${roleConfig.color}20` },
                  ]}
                >
                  <Text style={[tw('text-xs font-black'), { color: roleConfig.color, fontSize: 10 }]}>
                    {roleConfig.badge}
                  </Text>
                </View>
              </View>
              <Text style={[tw('text-xs mt-0.5'), { color: colors.textSecondary }]}>
                {user?.email || `@${user?.username || ''}`}
              </Text>
              <Text style={[tw('text-xs mt-0.5'), { color: colors.textMuted }]}>
                {roleConfig.label} Access Tier
              </Text>
            </View>
          </View>
        </View>

        {/* Navigation Button List Header */}
        <View style={tw('flex-row items-center justify-between mb-2.5 px-1')}>
          <Text style={[tw('text-xs font-bold uppercase tracking-wider'), { color: roleConfig.color }]}>
            {roleConfig.label.toUpperCase()} MENU OPTIONS ({buttonList.length})
          </Text>
          <Text style={[tw('text-xs font-semibold'), { color: colors.textMuted }]}>
            Tap to open
          </Text>
        </View>

        {/* List of Buttons for Active Role */}
        <View style={tw('gap-2.5 mb-5')}>
          {buttonList.map((item) => (
            <TouchableOpacity
              key={item.label}
              activeOpacity={0.75}
              onPress={() => onNavigate && onNavigate(item.key)}
              style={[
                tw('p-3.5 rounded-2xl border flex-row items-center justify-between shadow-sm'),
                {
                  backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={tw('flex-row items-center gap-3 flex-1')}>
                <View
                  style={[
                    tw('w-10 h-10 rounded-xl items-center justify-center'),
                    { backgroundColor: `${item.color}15` },
                  ]}
                >
                  <MaterialCommunityIcons name={item.icon} size={22} color={item.color} />
                </View>
                <View style={tw('flex-1')}>
                  <Text style={[tw('text-sm font-bold'), { color: colors.text }]}>
                    {item.label}
                  </Text>
                  <Text style={[tw('text-xs mt-0.5'), { color: colors.textSecondary }]} numberOfLines={1}>
                    {item.sub}
                  </Text>
                </View>
              </View>

              <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => dispatch(logout())}
          style={[
            tw('h-12 rounded-2xl flex-row items-center justify-center gap-2 border shadow-sm'),
            {
              backgroundColor: isDark ? '#2D1515' : '#FEF2F2',
              borderColor: '#EF4444',
            },
          ]}
        >
          <MaterialCommunityIcons name="logout" size={18} color="#EF4444" />
          <Text style={[tw('text-xs font-bold'), { color: '#EF4444' }]}>
            Sign Out of Nexus
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
