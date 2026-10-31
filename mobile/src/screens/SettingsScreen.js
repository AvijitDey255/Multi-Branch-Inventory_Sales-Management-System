import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme } from '../store/themeSlice';
import { darkColors, lightColors } from '../theme/colors';
import { getRoleConfig } from '../utils/roles';
import tw from '../utils/tw';

export default function SettingsScreen({ onNavigate }) {
  const dispatch = useDispatch();
  const mode = useSelector((state) => state.theme.mode);
  const user = useSelector((state) => state.auth.user);
  const isDark = mode === 'dark';
  const colors = isDark ? darkColors : lightColors;
  const roleConfig = getRoleConfig(user?.role || 'admin');

  // Toggle states
  const [pushNotifs, setPushNotifs] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [biometrics, setBiometrics] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('USD ($)');

  const currencies = ['USD ($)', 'EUR (€)', 'GBP (£)', 'INR (₹)'];

  return (
    <View style={[tw('flex-1'), { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={tw('p-4 pb-16')} showsVerticalScrollIndicator={false}>
        {/* Top Header */}
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
              App Settings
            </Text>
            <Text style={[tw('text-xs'), { color: colors.textSecondary }]}>
              Configure theme, notifications, security & preferences
            </Text>
          </View>
        </View>

        {/* Section: Appearance */}
        <View
          style={[
            tw('p-4 rounded-3xl border mb-4 shadow-sm'),
            { backgroundColor: isDark ? '#1E293B' : '#FFFFFF', borderColor: colors.border },
          ]}
        >
          <Text style={[tw('text-xs font-bold uppercase mb-3'), { color: roleConfig.color }]}>
            APPEARANCE & THEME
          </Text>

          <View style={tw('flex-row items-center justify-between py-1.5')}>
            <View style={tw('flex-row items-center gap-3')}>
              <MaterialCommunityIcons
                name={isDark ? 'weather-night' : 'white-balance-sunny'}
                size={22}
                color={isDark ? '#818CF8' : '#F59E0B'}
              />
              <View>
                <Text style={[tw('text-sm font-bold'), { color: colors.text }]}>Dark Mode</Text>
                <Text style={[tw('text-xs'), { color: colors.textMuted }]}>
                  {isDark ? 'Sleek dark theme active' : 'Bright light theme active'}
                </Text>
              </View>
            </View>
            <Switch
              value={isDark}
              onValueChange={() => dispatch(toggleTheme())}
              trackColor={{ false: '#CBD5E1', true: roleConfig.color }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Section: Notifications */}
        <View
          style={[
            tw('p-4 rounded-3xl border mb-4 shadow-sm'),
            { backgroundColor: isDark ? '#1E293B' : '#FFFFFF', borderColor: colors.border },
          ]}
        >
          <Text style={[tw('text-xs font-bold uppercase mb-3'), { color: roleConfig.color }]}>
            NOTIFICATIONS & ALERTS
          </Text>

          <View style={tw('gap-3.5')}>
            <View style={tw('flex-row items-center justify-between')}>
              <View>
                <Text style={[tw('text-sm font-bold'), { color: colors.text }]}>Push Notifications</Text>
                <Text style={[tw('text-xs'), { color: colors.textMuted }]}>Instant status and deal notices</Text>
              </View>
              <Switch
                value={pushNotifs}
                onValueChange={setPushNotifs}
                trackColor={{ false: '#CBD5E1', true: roleConfig.color }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={tw('flex-row items-center justify-between')}>
              <View>
                <Text style={[tw('text-sm font-bold'), { color: colors.text }]}>Email Statements</Text>
                <Text style={[tw('text-xs'), { color: colors.textMuted }]}>PDF invoices and monthly summaries</Text>
              </View>
              <Switch
                value={emailAlerts}
                onValueChange={setEmailAlerts}
                trackColor={{ false: '#CBD5E1', true: roleConfig.color }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={tw('flex-row items-center justify-between')}>
              <View>
                <Text style={[tw('text-sm font-bold'), { color: colors.text }]}>Live Order Tracking SMS</Text>
                <Text style={[tw('text-xs'), { color: colors.textMuted }]}>Courier and dispatch milestones</Text>
              </View>
              <Switch
                value={orderUpdates}
                onValueChange={setOrderUpdates}
                trackColor={{ false: '#CBD5E1', true: roleConfig.color }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {/* Section: Currency & Localization */}
        <View
          style={[
            tw('p-4 rounded-3xl border mb-4 shadow-sm'),
            { backgroundColor: isDark ? '#1E293B' : '#FFFFFF', borderColor: colors.border },
          ]}
        >
          <Text style={[tw('text-xs font-bold uppercase mb-3'), { color: roleConfig.color }]}>
            PREFERRED CURRENCY
          </Text>

          <View style={tw('flex-row gap-2')}>
            {currencies.map((curr) => {
              const isSel = selectedCurrency === curr;
              return (
                <TouchableOpacity
                  key={curr}
                  onPress={() => setSelectedCurrency(curr)}
                  activeOpacity={0.7}
                  style={[
                    tw('flex-1 py-2 rounded-xl items-center justify-center border'),
                    {
                      backgroundColor: isSel ? roleConfig.color : isDark ? '#0F172A' : colors.surfaceElevated,
                      borderColor: isSel ? roleConfig.color : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      tw('text-xs font-bold'),
                      { color: isSel ? '#FFFFFF' : colors.text },
                    ]}
                  >
                    {curr}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Section: Security */}
        <View
          style={[
            tw('p-4 rounded-3xl border mb-4 shadow-sm'),
            { backgroundColor: isDark ? '#1E293B' : '#FFFFFF', borderColor: colors.border },
          ]}
        >
          <Text style={[tw('text-xs font-bold uppercase mb-3'), { color: roleConfig.color }]}>
            SECURITY & PRIVACY
          </Text>

          <View style={tw('flex-row items-center justify-between py-1.5')}>
            <View style={tw('flex-row items-center gap-3')}>
              <MaterialCommunityIcons name="fingerprint" size={22} color="#10B981" />
              <View>
                <Text style={[tw('text-sm font-bold'), { color: colors.text }]}>Biometric Lock</Text>
                <Text style={[tw('text-xs'), { color: colors.textMuted }]}>
                  Require FaceID or fingerprint on launch
                </Text>
              </View>
            </View>
            <Switch
              value={biometrics}
              onValueChange={setBiometrics}
              trackColor={{ false: '#CBD5E1', true: '#10B981' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Cache and Reset */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => Alert.alert('Cache Cleared', 'Application cache and temporary assets cleaned.')}
          style={[
            tw('p-3.5 rounded-2xl border flex-row items-center justify-between'),
            { borderColor: colors.border, backgroundColor: colors.surfaceElevated },
          ]}
        >
          <View style={tw('flex-row items-center gap-2.5')}>
            <MaterialCommunityIcons name="broom" size={18} color={colors.textSecondary} />
            <Text style={[tw('text-xs font-bold'), { color: colors.text }]}>
              Clear Cache & Temporary Files
            </Text>
          </View>
          <Text style={[tw('text-xs font-semibold'), { color: colors.textMuted }]}>4.2 MB</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
