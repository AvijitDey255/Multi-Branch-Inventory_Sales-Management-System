import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { toggleTheme } from '../store/themeSlice';
import { darkColors, lightColors } from '../theme/colors';
import { getRoleConfig, getRoleTabs } from '../utils/roles';

const { width } = Dimensions.get('window');

export default function Sidebar({ visible, onClose, activeScreen, onSelectScreen }) {
  const dispatch = useDispatch();
  const mode = useSelector((state) => state.theme.mode);
  const user = useSelector((state) => state.auth.user);
  const isDark = mode === 'dark';
  const colors = isDark ? darkColors : lightColors;

  const currentRole = user?.role || 'admin';
  const roleConfig = getRoleConfig(currentRole);

  const handleLogout = () => {
    onClose();
    dispatch(logout());
  };

  const navItems = [
    ...getRoleTabs(currentRole),
    { key: 'Users', label: 'User Accounts', icon: 'account-group-outline', activeIcon: 'account-group' },
    { key: 'Branches', label: 'Company Branches', icon: 'office-building-marker-outline', activeIcon: 'office-building-marker' },
    { key: 'Cart', label: 'Order Cart', icon: 'cart-outline', activeIcon: 'cart' },
    { key: 'Profile', label: 'My Profile & Account', icon: 'account-outline', activeIcon: 'account' },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalRoot}>
        {/* Backdrop */}
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={[styles.backdrop, { backgroundColor: colors.drawerOverlay }]} />
        </TouchableWithoutFeedback>

        {/* Drawer Content */}
        <View
          style={[
            styles.drawer,
            {
              backgroundColor: colors.surface,
              borderRightColor: colors.border,
            },
          ]}
        >
          {/* Header with Close */}
          <View style={[styles.headerRow, { borderBottomColor: colors.border }]}>
            <View style={styles.brandRow}>
              <MaterialCommunityIcons name="hexagon-slice-6" size={24} color="#6366F1" />
              <Text style={[styles.brandTitle, { color: colors.text }]}>NEXUS APP</Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: colors.surfaceElevated }]}
            >
              <MaterialCommunityIcons name="close" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {/* User Profile Card */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                onClose();
                onSelectScreen('Profile');
              }}
              style={[
                styles.userCard,
                {
                  backgroundColor: colors.surfaceElevated,
                  borderColor: colors.border,
                },
              ]}
            >
              <Image
                source={{
                  uri:
                    user?.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      user?.name || user?.fullName || user?.username || 'User'
                    )}&background=6366F1&color=fff&bold=true`,
                }}
                style={styles.userAvatar}
              />
              <View style={styles.userInfo}>
                <View style={styles.nameRow}>
                  <Text style={[styles.userName, { color: colors.text }]} numberOfLines={1}>
                    {user?.name || user?.fullName || 'User'}
                  </Text>
                  <MaterialCommunityIcons name="check-decagram" size={16} color="#3B82F6" />
                </View>
                <Text style={[styles.userHandle, { color: colors.primary }]}>
                  @{user?.username || 'user'}
                </Text>
                <Text style={[styles.userEmail, { color: colors.textMuted }]} numberOfLines={1}>
                  {user?.email || ''}
                </Text>

                <View style={styles.badgeRow}>
                  <View style={[styles.tierBadge, { backgroundColor: `${roleConfig.color}25` }]}>
                    <Text style={[styles.tierText, { color: roleConfig.color, fontWeight: '800' }]}>
                      {roleConfig.badge}
                    </Text>
                  </View>
                  <View style={[styles.roleBadge, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
                    <Text style={[styles.roleText, { color: colors.textSecondary }]}>
                      {roleConfig.label}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>

            {/* Navigation Menu */}
            <View style={styles.menuGroup}>
              <Text style={[styles.sectionHeading, { color: colors.textMuted }]}>MAIN NAVIGATION</Text>
              {navItems.map((item) => {
                const isActive = activeScreen === item.key;
                return (
                  <TouchableOpacity
                    key={item.key}
                    activeOpacity={0.7}
                    onPress={() => {
                      onClose();
                      onSelectScreen(item.key);
                    }}
                    style={[
                      styles.navButton,
                      isActive && {
                        backgroundColor: colors.primaryLight,
                        borderColor: colors.primary,
                      },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={isActive ? item.activeIcon : item.icon}
                      size={22}
                      color={isActive ? colors.primary : colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.navLabel,
                        {
                          color: isActive ? colors.primary : colors.text,
                          fontWeight: isActive ? '700' : '500',
                        },
                      ]}
                    >
                      {item.label}
                    </Text>
                    {isActive && (
                      <View style={[styles.activeDot, { backgroundColor: colors.primary }]} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Quick Settings / Preferences */}
            <View style={styles.menuGroup}>
              <Text style={[styles.sectionHeading, { color: colors.textMuted }]}>PREFERENCES</Text>

              {/* Theme Toggle in Sidebar */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => dispatch(toggleTheme())}
                style={[styles.prefRow, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
              >
                <View style={styles.prefLeft}>
                  <MaterialCommunityIcons
                    name={isDark ? 'weather-night' : 'white-balance-sunny'}
                    size={22}
                    color={isDark ? '#818CF8' : '#F59E0B'}
                  />
                  <Text style={[styles.prefText, { color: colors.text }]}>Appearance</Text>
                </View>
                <View style={[styles.modePill, { backgroundColor: isDark ? '#334155' : '#E2E8F0' }]}>
                  <Text style={[styles.modePillText, { color: colors.text }]}>
                    {isDark ? 'Dark' : 'Light'}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Footer with Logout and Version */}
          <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.surface }]}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleLogout}
              style={[styles.logoutBtn, { backgroundColor: colors.dangerLight, borderColor: colors.danger }]}
            >
              <MaterialCommunityIcons name="logout-variant" size={20} color={colors.danger} />
              <Text style={[styles.logoutText, { color: colors.danger }]}>Sign Out</Text>
            </TouchableOpacity>

            <Text style={[styles.versionText, { color: colors.textMuted }]}>
              Nexus Mobile • Expo SDK 57.0
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  drawer: {
    width: Math.min(width * 0.82, 340),
    height: '100%',
    borderRightWidth: 1,
    zIndex: 100,
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    display: 'flex',
    flexDirection: 'column',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 45,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollArea: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  userCard: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 14,
  },
  userAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
  },
  userHandle: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 1,
  },
  userEmail: {
    fontSize: 11,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  tierBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tierText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#818CF8',
  },
  roleBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '600',
  },
  statsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  statCol: {
    alignItems: 'center',
  },
  statNum: {
    fontSize: 14,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
  },
  menuGroup: {
    marginBottom: 22,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    marginBottom: 6,
  },
  navLabel: {
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  prefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  prefLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  prefText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  modePillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '700',
  },
  versionText: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 10,
  },
});
