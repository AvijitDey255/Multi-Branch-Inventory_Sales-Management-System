import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { darkColors, lightColors } from '../theme/colors';
import { getRoleTabs, getRoleConfig } from '../utils/roles';
import tw from '../utils/tw';

export default function BottomNav({ activeTab, onTabPress }) {
  const mode = useSelector((state) => state.theme.mode);
  const user = useSelector((state) => state.auth.user);
  const isDark = mode === 'dark';
  const colors = isDark ? darkColors : lightColors;

  const currentRole = user?.role || 'admin';
  const roleConfig = getRoleConfig(currentRole);
  const tabs = getRoleTabs(currentRole);

  return (
    <View
      style={[
        styles.navContainer,
        {
          backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
          borderTopColor: isDark ? '#1E293B' : '#E2E8F0',
        },
      ]}
    >
      <View style={styles.tabBarInner}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const isSpecial = tab.isSpecial;

          if (isSpecial) {
            // Prominent button that shows different from other buttons with a '+' symbol
            return (
              <TouchableOpacity
                key={tab.key}
                activeOpacity={0.85}
                onPress={() => onTabPress(tab.key)}
                style={styles.specialTabWrapper}
              >
                <View
                  style={[
                    styles.specialButton,
                    {
                      backgroundColor: roleConfig.color,
                      shadowColor: roleConfig.color,
                    },
                  ]}
                >
                  <View style={styles.specialIconContainer}>
                    <MaterialCommunityIcons
                      name={isActive ? tab.activeIcon : tab.icon}
                      size={22}
                      color="#FFFFFF"
                    />
                    <View style={styles.plusBadge}>
                      <MaterialCommunityIcons name="plus" size={12} color="#FFFFFF" />
                    </View>
                  </View>
                </View>
                <Text
                  style={[
                    styles.specialLabel,
                    {
                      color: isActive ? roleConfig.color : colors.textSecondary,
                      fontWeight: isActive ? '800' : '600',
                    },
                  ]}
                  numberOfLines={1}
                >
                  + {tab.label}
                </Text>
              </TouchableOpacity>
            );
          }

          // Standard Nav Tab
          return (
            <TouchableOpacity
              key={tab.key}
              activeOpacity={0.7}
              onPress={() => onTabPress(tab.key)}
              style={styles.tabItem}
            >
              <View
                style={[
                  styles.iconPill,
                  isActive && {
                    backgroundColor: `${roleConfig.color}15`,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name={isActive ? tab.activeIcon : tab.icon}
                  size={22}
                  color={isActive ? roleConfig.color : colors.inactiveTab}
                />
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: isActive ? roleConfig.color : colors.inactiveTab,
                    fontWeight: isActive ? '700' : '500',
                  },
                ]}
                numberOfLines={1}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navContainer: {
    borderTopWidth: 1,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    paddingTop: 8,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  tabBarInner: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 2,
  },
  iconPill: {
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 10.5,
    marginTop: 2,
    letterSpacing: 0.2,
  },
  specialTabWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1.1,
    marginTop: -16,
  },
  specialButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  specialIconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusBadge: {
    position: 'absolute',
    top: -5,
    right: -7,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 7,
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  specialLabel: {
    fontSize: 10,
    marginTop: 3,
    letterSpacing: 0.2,
  },
});
