import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { darkColors, lightColors } from '../theme/colors';
import { getRoleConfig } from '../utils/roles';
import tw from '../utils/tw';

export default function AppInfoScreen({ onNavigate }) {
  const mode = useSelector((state) => state.theme.mode);
  const user = useSelector((state) => state.auth.user);
  const isDark = mode === 'dark';
  const colors = isDark ? darkColors : lightColors;
  const roleConfig = getRoleConfig(user?.role || 'admin');

  return (
    <View style={[tw('flex-1'), { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={tw('p-4 pb-16')} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={tw('flex-row items-center gap-2.5 mb-5')}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => onNavigate && onNavigate('More')}
            style={[
              tw('w-9 h-9 rounded-xl items-center justify-center border'),
              { borderColor: colors.border, backgroundColor: colors.surfaceElevated },
            ]}
          >
            <MaterialCommunityIcons name="arrow-left" size={20} color={colors.text} />
          </TouchableOpacity>
          <View>
            <Text style={[tw('text-lg font-black'), { color: colors.text }]}>
              App Information
            </Text>
            <Text style={[tw('text-xs'), { color: colors.textSecondary }]}>
              Software build, architecture, terms & system status
            </Text>
          </View>
        </View>

        {/* Hero Branding Card */}
        <View
          style={[
            tw('p-5 rounded-3xl border mb-5 items-center justify-center shadow-sm'),
            { backgroundColor: isDark ? '#1E293B' : '#FFFFFF', borderColor: colors.border },
          ]}
        >
          <View
            style={[
              tw('w-16 h-16 rounded-2xl items-center justify-center mb-3 shadow-md'),
              { backgroundColor: roleConfig.color },
            ]}
          >
            <MaterialCommunityIcons name="hexagon-slice-6" size={36} color="#FFFFFF" />
          </View>

          <Text style={[tw('text-xl font-black tracking-wider'), { color: colors.text }]}>
            NEXUS SUITE
          </Text>
          <Text style={[tw('text-xs font-semibold mt-0.5'), { color: roleConfig.color }]}>
            Enterprise Multi-Tenant E-Commerce
          </Text>

          <View style={[tw('px-3 py-1 rounded-full mt-3'), { backgroundColor: isDark ? '#0F172A' : '#F1F5F9' }]}>
            <Text style={[tw('text-xs font-mono font-bold'), { color: colors.textMuted }]}>
              Version 1.0.0 • Build 57.0.30
            </Text>
          </View>
        </View>

        {/* Architecture & Environment */}
        <View
          style={[
            tw('p-4 rounded-3xl border mb-5 shadow-sm'),
            { backgroundColor: isDark ? '#1E293B' : '#FFFFFF', borderColor: colors.border },
          ]}
        >
          <Text style={[tw('text-xs font-bold uppercase mb-3'), { color: roleConfig.color }]}>
            TECHNICAL SPECIFICATIONS
          </Text>

          <View style={tw('gap-2.5')}>
            <View style={tw('flex-row justify-between py-1 border-b border-slate-100')}>
              <Text style={[tw('text-xs'), { color: colors.textSecondary }]}>Framework Runtime</Text>
              <Text style={[tw('text-xs font-bold'), { color: colors.text }]}>Expo SDK 57 (Universal)</Text>
            </View>
            <View style={tw('flex-row justify-between py-1 border-b border-slate-100')}>
              <Text style={[tw('text-xs'), { color: colors.textSecondary }]}>Core Engine</Text>
              <Text style={[tw('text-xs font-bold'), { color: colors.text }]}>React Native 0.86 & React 19</Text>
            </View>
            <View style={tw('flex-row justify-between py-1 border-b border-slate-100')}>
              <Text style={[tw('text-xs'), { color: colors.textSecondary }]}>State Management</Text>
              <Text style={[tw('text-xs font-bold'), { color: colors.text }]}>Redux Toolkit (RTK)</Text>
            </View>
            <View style={tw('flex-row justify-between py-1 border-b border-slate-100')}>
              <Text style={[tw('text-xs'), { color: colors.textSecondary }]}>Local Persistence</Text>
              <Text style={[tw('text-xs font-bold'), { color: colors.text }]}>AsyncStorage with Memory Fallback</Text>
            </View>
            <View style={tw('flex-row justify-between py-1')}>
              <Text style={[tw('text-xs'), { color: colors.textSecondary }]}>Operating System</Text>
              <Text style={[tw('text-xs font-bold'), { color: colors.text }]}>{Platform.OS.toUpperCase()}</Text>
            </View>
          </View>
        </View>

        {/* Legal & Support Links */}
        <View
          style={[
            tw('p-4 rounded-3xl border mb-5 shadow-sm gap-2'),
            { backgroundColor: isDark ? '#1E293B' : '#FFFFFF', borderColor: colors.border },
          ]}
        >
          <Text style={[tw('text-xs font-bold uppercase mb-1'), { color: roleConfig.color }]}>
            LEGAL & SUPPORT
          </Text>

          {[
            { label: 'Privacy Policy', icon: 'shield-lock-outline' },
            { label: 'Terms of Service', icon: 'file-certificate-outline' },
            { label: 'Customer Support Desk', icon: 'headset' },
            { label: 'Check for Updates', icon: 'cloud-download-outline' },
          ].map((item) => (
            <TouchableOpacity
              key={item.label}
              activeOpacity={0.7}
              onPress={() => Alert.alert(item.label, `${item.label} document is up to date.`)}
              style={tw('flex-row items-center justify-between py-2')}
            >
              <View style={tw('flex-row items-center gap-2.5')}>
                <MaterialCommunityIcons name={item.icon} size={18} color={colors.textSecondary} />
                <Text style={[tw('text-xs font-semibold'), { color: colors.text }]}>
                  {item.label}
                </Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* System Health */}
        <View
          style={[
            tw('p-3.5 rounded-2xl border flex-row items-center justify-between shadow-sm'),
            { backgroundColor: isDark ? '#1E293B' : '#ECFDF5', borderColor: '#10B981' },
          ]}
        >
          <View style={tw('flex-row items-center gap-2.5')}>
            <View style={tw('w-2.5 h-2.5 rounded-full bg-emerald-500')} />
            <Text style={[tw('text-xs font-bold'), { color: colors.text }]}>
              All Cloud Services Operational
            </Text>
          </View>
          <Text style={[tw('text-xs font-semibold text-emerald-600')]}>99.99% Uptime</Text>
        </View>
      </ScrollView>
    </View>
  );
}
