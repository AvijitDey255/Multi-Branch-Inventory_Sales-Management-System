import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableWithoutFeedback,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { closeSidebar, toggleTheme } from '../redux/slices/uiSlice';
import { logoutUser } from '../redux/slices/authSlice';
import { getThemeColors } from '../constants/colors';
import { ROLE_CONFIG } from '../constants/roles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SIDEBAR_WIDTH = Math.min(SCREEN_WIDTH * 0.82, 340);

const CustomSidebar = ({ navigation: propNavigation }) => {
  const dispatch = useDispatch();
  const rootNavigation = useNavigation();
  const nav = propNavigation || rootNavigation;

  const { isSidebarOpen, activeBranch, theme } = useSelector((state) => state.ui);
  const { user } = useSelector((state) => state.auth);

  const isDark = theme === 'dark';
  const colors = getThemeColors(theme);

  // Local state to keep modal mounted during slide-out animation
  const [modalVisible, setModalVisible] = useState(false);

  // Slide animation value: starts at -SIDEBAR_WIDTH (hidden to the left)
  const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  // Fade animation for backdrop
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isSidebarOpen) {
      setModalVisible(true);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -SIDEBAR_WIDTH,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setModalVisible(false);
      });
    }
  }, [isSidebarOpen, slideAnim, fadeAnim]);

  const roleConfig = (user?.role && ROLE_CONFIG[user.role]) || {
    label: user?.role || 'Staff Member',
    badgeText: user?.role || 'USER',
    color: colors.primary,
    bgColor: colors.primaryMuted,
  };

  const handleClose = () => {
    dispatch(closeSidebar());
  };

  const handleLogout = () => {
    Alert.alert(
      'Confirm Sign Out',
      'Are you sure you want to end your current active session?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            dispatch(closeSidebar());
            dispatch(logoutUser());
          },
        },
      ]
    );
  };

  const navigateTo = (screenName) => {
    dispatch(closeSidebar());
    if (nav) {
      nav.navigate(screenName);
    }
  };

  if (!modalVisible && !isSidebarOpen) {
    return null;
  }

  return (
    <Modal
      transparent
      visible={modalVisible}
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View style={styles.modalRoot}>
        {/* Darkened Backdrop Overlay */}
        <TouchableWithoutFeedback onPress={handleClose}>
          <Animated.View
            style={[
              styles.backdrop,
              {
                opacity: fadeAnim,
                backgroundColor: colors.overlay,
              },
            ]}
          />
        </TouchableWithoutFeedback>

        {/* Sidebar Panel sliding from Left to Right */}
        <Animated.View
          style={[
            styles.sidebarContainer,
            {
              transform: [{ translateX: slideAnim }],
              width: SIDEBAR_WIDTH,
              backgroundColor: colors.surface,
            },
          ]}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Top Profile Card: User Details (Name, Email, Username, Role) */}
            <View style={[styles.profileSection, { backgroundColor: colors.surfaceAlt, borderBottomColor: colors.border }]}>
              <View style={styles.topHeaderActions}>
                <View style={[styles.brandBadge, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Ionicons name="cube-outline" size={14} color={colors.primary} />
                  <Text style={[styles.brandBadgeText, { color: colors.primary }]}>Enterprise POS</Text>
                </View>
                <TouchableOpacity
                  onPress={handleClose}
                  style={[styles.closeButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* User Icon Avatar */}
              <View style={styles.avatarContainer}>
                <View style={[styles.avatarCircle, { backgroundColor: colors.primaryMuted, borderColor: roleConfig.color }]}>
                  <Ionicons name="person" size={38} color={colors.primary} />
                </View>
                <View style={[styles.statusDot, { backgroundColor: colors.success, borderColor: colors.surface }]} />
              </View>

              {/* 1. Name */}
              <Text style={[styles.userName, { color: colors.textPrimary }]} numberOfLines={1}>
                {user?.fullname || 'avijit dey'}
              </Text>

              {/* 2. Username */}
              <Text style={[styles.userHandle, { color: colors.textSecondary }]} numberOfLines={1}>
                @{user?.username || 'avijit255'}
              </Text>

              {/* 3. Email */}
              <View style={styles.infoRow}>
                <Ionicons name="mail-outline" size={13} color={colors.textSecondary} />
                <Text style={[styles.userEmail, { color: colors.textSecondary }]} numberOfLines={1}>
                  {user?.email || 'avijit25@gmail.com'}
                </Text>
              </View>

              {/* 4. Role Badge */}
              <View
                style={[
                  styles.roleBadgeContainer,
                  { backgroundColor: roleConfig.bgColor, borderColor: roleConfig.color },
                ]}
              >
                <Ionicons name="shield-checkmark" size={14} color={roleConfig.color} />
                <Text style={[styles.roleBadgeText, { color: roleConfig.color }]}>
                  {roleConfig.badgeText}
                </Text>
              </View>
            </View>

            {/* Shortcut Buttons */}
            <View style={styles.menuGroup}>
              <Text style={[styles.sectionHeader, { color: colors.textMuted }]}>SHORTCUTS</Text>

              {/* My Profile Shortcut */}
              <TouchableOpacity
                style={[styles.menuItem, { backgroundColor: colors.surface }]}
                onPress={() => navigateTo('Profile')}
              >
                <View style={[styles.menuIconWrap, { backgroundColor: colors.primaryMuted }]}>
                  <Ionicons name="person-circle-outline" size={20} color={colors.primary} />
                </View>
                <Text style={[styles.menuItemText, { color: colors.textPrimary }]}>My Profile</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
              </TouchableOpacity>

              {/* Dashboard Overview */}
              <TouchableOpacity
                style={[styles.menuItem, { backgroundColor: colors.surface }]}
                onPress={() => navigateTo('Home')}
              >
                <View style={[styles.menuIconWrap, { backgroundColor: colors.primaryMuted }]}>
                  <Ionicons name="grid-outline" size={18} color={colors.primary} />
                </View>
                <Text style={[styles.menuItemText, { color: colors.textPrimary }]}>Dashboard Overview</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
              </TouchableOpacity>

              {/* Product Categories Shortcut (Admin) */}
              {((user?.role || 'ADMIN').toUpperCase() === 'ADMIN') && (
                <>
                  <TouchableOpacity
                    style={[styles.menuItem, { backgroundColor: colors.surface }]}
                    onPress={() => navigateTo('Products')}
                  >
                    <View style={[styles.menuIconWrap, { backgroundColor: isDark ? '#1E293B' : '#EFF6FF' }]}>
                      <Ionicons name="cube-outline" size={18} color="#2563EB" />
                    </View>
                    <Text style={[styles.menuItemText, { color: colors.textPrimary }]}>Master Products</Text>
                    <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.menuItem, { backgroundColor: colors.surface }]}
                    onPress={() => navigateTo('Category')}
                  >
                    <View style={[styles.menuIconWrap, { backgroundColor: isDark ? '#2E1065' : '#F5F3FF' }]}>
                      <Ionicons name="folder-outline" size={18} color="#8B5CF6" />
                    </View>
                    <Text style={[styles.menuItemText, { color: colors.textPrimary }]}>Product Categories</Text>
                    <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.menuItem, { backgroundColor: colors.surface }]}
                    onPress={() => navigateTo('Variants')}
                  >
                    <View style={[styles.menuIconWrap, { backgroundColor: isDark ? '#431407' : '#FFF7ED' }]}>
                      <Ionicons name="options-outline" size={18} color="#EA580C" />
                    </View>
                    <Text style={[styles.menuItemText, { color: colors.textPrimary }]}>Product Variants</Text>
                    <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                  </TouchableOpacity>
                </>
              )}

              {/* System Settings */}
              <TouchableOpacity
                style={[styles.menuItem, { backgroundColor: colors.surface }]}
                onPress={() => navigateTo('More')}
              >
                <View style={[styles.menuIconWrap, { backgroundColor: colors.accentLight }]}>
                  <Ionicons name="settings-outline" size={18} color={colors.accent} />
                </View>
                <Text style={[styles.menuItemText, { color: colors.textPrimary }]}>Settings & Branch</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
              </TouchableOpacity>

              {/* Appearance Theme Toggle */}
              <TouchableOpacity
                style={[styles.menuItem, { backgroundColor: colors.surface }]}
                onPress={() => dispatch(toggleTheme())}
              >
                <View style={[styles.menuIconWrap, { backgroundColor: isDark ? '#1E293B' : '#FEF3C7' }]}>
                  <Ionicons
                    name={isDark ? 'sunny' : 'moon'}
                    size={18}
                    color={isDark ? '#FBBF24' : '#D97706'}
                  />
                </View>
                <Text style={[styles.menuItemText, { color: colors.textPrimary }]}>
                  {isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
                </Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Bottom Action: Prominent Logout Button */}
          <View style={[styles.bottomSection, { borderTopColor: colors.border, backgroundColor: colors.surface }]}>
            <TouchableOpacity
              style={[styles.logoutButton, { backgroundColor: colors.dangerLight, borderColor: colors.danger }]}
              onPress={handleLogout}
              activeOpacity={0.8}
            >
              <Ionicons name="log-out-outline" size={20} color={colors.danger} />
              <Text style={[styles.logoutText, { color: colors.danger }]}>Sign Out</Text>
            </TouchableOpacity>

            <Text style={[styles.versionText, { color: colors.textMuted }]}>
              Multi-Branch Inventory & POS v1.0.0
            </Text>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    position: 'relative',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sidebarContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    height: '100%',
    elevation: 24,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    zIndex: 9999,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  profileSection: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  topHeaderActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  brandBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 5,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  avatarContainer: {
    position: 'relative',
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  avatarCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
  },
  statusDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
  },
  userName: {
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 2,
  },
  userHandle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userEmail: {
    fontSize: 12,
    marginLeft: 6,
  },
  roleBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    marginLeft: 6,
    letterSpacing: 0.6,
  },
  menuGroup: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 10,
    marginLeft: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 6,
  },
  menuIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  bottomSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 28,
    borderTopWidth: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 6,
    borderWidth: 1,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
  },
  versionText: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 10,
  },
});

export default CustomSidebar;
