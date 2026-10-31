import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { darkColors, lightColors } from '../theme/colors';
import { getRoleConfig } from '../utils/roles';
import tw from '../utils/tw';

export default function HomeScreen({ onNavigate }) {
  const mode = useSelector((state) => state.theme.mode);
  const user = useSelector((state) => state.auth.user);
  const products = useSelector((state) => state.ecom.products);
  const invoices = useSelector((state) => state.ecom.invoices);
  const orders = useSelector((state) => state.ecom.orders);
  const bills = useSelector((state) => state.ecom.bills);
  const isDark = mode === 'dark';
  const colors = isDark ? darkColors : lightColors;

  const currentRole = user?.role || 'admin';
  const roleConfig = getRoleConfig(currentRole);

  const renderRoleKPIs = () => {
    switch (currentRole) {
      case 'admin':
        return [
          { label: 'Total Revenue', value: '$128,450', sub: '+14% this month', icon: 'currency-usd', color: '#6366F1' },
          { label: 'Active Invoices', value: invoices.length, sub: '2 pending payments', icon: 'file-document-outline', color: '#0EA5E9' },
          { label: 'Products Stock', value: products.length, sub: 'In enterprise store', icon: 'cube-outline', color: '#10B981' },
          { label: 'System Orders', value: orders.length, sub: 'Fulfillment on time', icon: 'cart-outline', color: '#F59E0B' },
        ];
      case 'manager':
        return [
          { label: 'Store Revenue', value: '$64,200', sub: '98% target achieved', icon: 'trending-up', color: '#0EA5E9' },
          { label: 'Store Invoices', value: invoices.length, sub: 'Review & approved', icon: 'file-document-outline', color: '#6366F1' },
          { label: 'Warehouse Units', value: products.reduce((acc, p) => acc + p.stock, 0), sub: 'Across all models', icon: 'cube-outline', color: '#10B981' },
          { label: 'Fulfillment Rate', value: '99.2%', sub: 'Zero backlogs', icon: 'check-decagram', color: '#10B981' },
        ];
      case 'salesman':
        return [
          { label: "Today's Sales", value: '$4,850', sub: '+18% above target', icon: 'cash-multiple', color: '#10B981' },
          { label: 'My Commission', value: '$485', sub: '10% instant bonus', icon: 'wallet-giftcard', color: '#6366F1' },
          { label: 'Client Accounts', value: '36', sub: '4 active deals today', icon: 'account-group-outline', color: '#0EA5E9' },
          { label: 'Orders Dispatched', value: orders.length, sub: 'Sales pipeline green', icon: 'cart-check', color: '#F59E0B' },
        ];
      case 'customer':
      default:
        return [
          { label: 'Reward Credits', value: '$350', sub: 'Redeemable on tech', icon: 'gift-outline', color: '#F59E0B' },
          { label: 'My Active Orders', value: orders.filter((o) => o.status !== 'Delivered').length, sub: 'In express transit', icon: 'package-variant-closed', color: '#10B981' },
          { label: 'Unpaid Bills', value: `$${bills.filter((b) => b.status === 'Due').reduce((a, b) => a + b.amount, 0).toFixed(2)}`, sub: 'Due by month end', icon: 'credit-card-outline', color: '#EF4444' },
          { label: 'Loyalty Tier', value: 'Gold VIP', sub: '5% off all orders', icon: 'shield-star-outline', color: '#6366F1' },
        ];
    }
  };

  const renderQuickActions = () => {
    switch (currentRole) {
      case 'admin':
        return [
          { label: '+ Add Product', icon: 'plus-circle', target: 'Products', bg: roleConfig.color, textLight: true },
          { label: 'Branches', icon: 'office-building-marker-outline', target: 'Branches' },
          { label: 'Invoices', icon: 'file-document-outline', target: 'Invoices' },
          { label: 'Orders Queue', icon: 'receipt-text-outline', target: 'Orders' },
        ];
      case 'manager':
        return [
          { label: 'Review Invoices', icon: 'file-document-outline', target: 'Invoices', bg: roleConfig.color, textLight: true },
          { label: 'Branches', icon: 'office-building-marker-outline', target: 'Branches' },
          { label: 'Inspect Stock', icon: 'cube-outline', target: 'Products' },
        ];
      case 'salesman':
        return [
          { label: '+ New Order', icon: 'cart-plus', target: 'Orders', bg: roleConfig.color, textLight: true },
          { label: 'Catalog', icon: 'cube-outline', target: 'Products' },
          { label: 'Directory', icon: 'account-group-outline', target: 'Customers' },
        ];
      case 'customer':
      default:
        return [
          { label: 'Pay Bills', icon: 'credit-card-outline', target: 'Bills', bg: roleConfig.color, textLight: true },
          { label: 'Track Orders', icon: 'package-variant-closed', target: 'My Orders' },
          { label: 'Account', icon: 'account-cog-outline', target: 'More' },
        ];
    }
  };

  const kpis = renderRoleKPIs();
  const actions = renderQuickActions();

  return (
    <View style={[tw('flex-1'), { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={tw('p-4 pb-16')} showsVerticalScrollIndicator={false}>
        {/* Welcome Role Header Banner */}
        <View
          style={[
            tw('p-4 rounded-3xl border mb-4 shadow-sm'),
            {
              backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
              borderColor: colors.border,
            },
          ]}
        >
          <View style={tw('flex-row items-center justify-between mb-2.5')}>
            <View style={tw('flex-row items-center gap-2')}>
              <View
                style={[
                  tw('px-2.5 py-0.5 rounded-md'),
                  { backgroundColor: `${roleConfig.color}20` },
                ]}
              >
                <Text style={[tw('text-xs font-black'), { color: roleConfig.color, fontSize: 10 }]}>
                  {roleConfig.badge}
                </Text>
              </View>
              <Text style={[tw('text-xs font-semibold'), { color: colors.textSecondary }]}>
                {roleConfig.label}
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => onNavigate && onNavigate('More')}
              style={[
                tw('px-2.5 py-1 rounded-lg border flex-row items-center gap-1'),
                { borderColor: colors.border, backgroundColor: colors.surfaceElevated },
              ]}
            >
              <MaterialCommunityIcons name="swap-horizontal" size={14} color={roleConfig.color} />
              <Text style={[tw('text-xs font-bold'), { color: roleConfig.color, fontSize: 10.5 }]}>
                Switch Role
              </Text>
            </TouchableOpacity>
          </View>

          <View style={tw('flex-row items-center gap-3')}>
            <Image
              source={{
                uri:
                  user?.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    user?.name || user?.fullName || user?.username || 'User'
                  )}&background=6366F1&color=fff&bold=true`,
              }}
              style={[
                tw('w-12 h-12 rounded-full border-2'),
                { borderColor: roleConfig.color },
              ]}
            />
            <View style={tw('flex-1')}>
              <Text style={[tw('text-lg font-black'), { color: colors.text }]}>
                Welcome, {user?.name || user?.fullName || 'User'}!
              </Text>
              <Text style={[tw('text-xs mt-0.5'), { color: colors.textSecondary }]} numberOfLines={1}>
                {roleConfig.description}
              </Text>
            </View>
          </View>

          {/* Quick Actions Shortcuts */}
          <View style={tw('flex-row gap-2 mt-4 pt-3 border-t border-slate-100')}>
            {actions.map((act) => (
              <TouchableOpacity
                key={act.label}
                activeOpacity={0.8}
                onPress={() => onNavigate && onNavigate(act.target)}
                style={[
                  tw('flex-1 py-2 px-1.5 rounded-xl flex-row items-center justify-center gap-1.5 border'),
                  {
                    backgroundColor: act.bg || (isDark ? '#0F172A' : colors.surfaceElevated),
                    borderColor: act.bg ? act.bg : colors.border,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name={act.icon}
                  size={15}
                  color={act.textLight ? '#FFFFFF' : colors.text}
                />
                <Text
                  style={[
                    tw('text-xs font-bold'),
                    { color: act.textLight ? '#FFFFFF' : colors.text, fontSize: 11 },
                  ]}
                  numberOfLines={1}
                >
                  {act.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 4 Role-Based Metrics Cards */}
        <View style={tw('flex-row flex-wrap gap-2.5 mb-5')}>
          {kpis.map((kpi) => (
            <View
              key={kpi.label}
              style={[
                tw('p-3.5 rounded-2xl border shadow-sm'),
                {
                  width: '48%',
                  backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={tw('flex-row items-center justify-between')}>
                <Text style={[tw('text-xs font-semibold'), { color: colors.textSecondary }]}>
                  {kpi.label}
                </Text>
                <View
                  style={[
                    tw('w-7 h-7 rounded-lg items-center justify-center'),
                    { backgroundColor: `${kpi.color}15` },
                  ]}
                >
                  <MaterialCommunityIcons name={kpi.icon} size={15} color={kpi.color} />
                </View>
              </View>
              <Text style={[tw('text-lg font-black mt-1.5'), { color: colors.text }]}>
                {kpi.value}
              </Text>
              <Text style={[tw('text-xs mt-0.5'), { color: kpi.color, fontSize: 10.5 }]}>
                {kpi.sub}
              </Text>
            </View>
          ))}
        </View>

        {/* Recent Section tailored to Role */}
        <View style={tw('mb-4')}>
          <View style={tw('flex-row items-center justify-between mb-3')}>
            <Text style={[tw('text-sm font-bold'), { color: colors.text }]}>
              {currentRole === 'customer'
                ? 'Featured Catalog Deals'
                : currentRole === 'salesman'
                ? 'High-Demand Products'
                : 'Recent Activity Feed'}
            </Text>
            <TouchableOpacity
              onPress={() => {
                if (onNavigate) {
                  if (currentRole === 'customer') onNavigate('My Orders');
                  else if (currentRole === 'salesman') onNavigate('Products');
                  else onNavigate('Invoices');
                }
              }}
            >
              <Text style={[tw('text-xs font-bold'), { color: roleConfig.color }]}>
                View All
              </Text>
            </TouchableOpacity>
          </View>

          {/* Cards */}
          <View style={tw('gap-3')}>
            {products.slice(0, 3).map((prod) => (
              <View
                key={prod.id}
                style={[
                  tw('p-3 rounded-2xl border flex-row items-center gap-3 shadow-sm'),
                  {
                    backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                    borderColor: colors.border,
                  },
                ]}
              >
                <Image
                  source={{ uri: prod.image }}
                  style={tw('w-14 h-14 rounded-xl bg-slate-200')}
                />
                <View style={tw('flex-1')}>
                  <Text style={[tw('text-xs font-bold'), { color: colors.text }]} numberOfLines={1}>
                    {prod.name}
                  </Text>
                  <Text style={[tw('text-xs'), { color: colors.textMuted }]}>
                    {prod.category} • {prod.stock} in stock
                  </Text>
                  <Text style={[tw('text-sm font-black mt-0.5'), { color: roleConfig.color }]}>
                    ${prod.price}
                  </Text>
                </View>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    if (onNavigate) {
                      if (currentRole === 'customer') onNavigate('Bills');
                      else if (currentRole === 'salesman') onNavigate('Orders');
                      else onNavigate('Products');
                    }
                  }}
                  style={[
                    tw('px-3 py-1.5 rounded-xl border'),
                    { borderColor: colors.border, backgroundColor: colors.surfaceElevated },
                  ]}
                >
                  <Text style={[tw('text-xs font-bold'), { color: colors.text }]}>
                    {currentRole === 'customer' ? 'Buy' : currentRole === 'salesman' ? 'Sell' : 'Inspect'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
