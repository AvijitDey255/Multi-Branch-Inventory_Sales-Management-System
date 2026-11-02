import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { openSidebar, toggleTheme } from '../redux/slices/uiSlice';
import { getThemeColors } from '../constants/colors';

const Header = ({ title = 'Dashboard' }) => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { user } = useSelector((state) => state.auth);
  const { theme } = useSelector((state) => state.ui);

  const isDark = theme === 'dark';
  const colors = getThemeColors(theme);

  const handleOpenMenu = () => {
    dispatch(openSidebar());
  };

  const handleToggleTheme = () => {
    dispatch(toggleTheme());
  };

  const handleOpenProfile = () => {
    navigation.navigate('Profile');
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: colors.surface }]}>
      <View
        style={[
          styles.headerContainer,
          {
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View style={styles.contentRow}>
          {/* 1. Left: Three Line Hamburger Menu Button */}
          <TouchableOpacity
            onPress={handleOpenMenu}
            style={[
              styles.menuButton,
              { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
            ]}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityLabel="Open Navigation Menu"
          >
            <View style={styles.hamburgerIcon} pointerEvents="none">
              <View style={[styles.hamburgerLine, { backgroundColor: colors.textPrimary }]} />
              <View
                style={[
                  styles.hamburgerLine,
                  { width: 17, backgroundColor: colors.textPrimary },
                ]}
              />
              <View style={[styles.hamburgerLine, { backgroundColor: colors.textPrimary }]} />
            </View>
          </TouchableOpacity>

          {/* Center: Title */}
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>
              {title}
            </Text>
          </View>

          {/* Right Side: Exactly Two Interactive Items (Theme Toggle + Profile Icon) */}
          <View style={styles.rightActions}>
            {/* 2. Theme Toggle Button */}
            <TouchableOpacity
              style={[
                styles.iconBtn,
                {
                  backgroundColor: isDark ? '#1E293B' : colors.surfaceAlt,
                  borderColor: isDark ? '#334155' : colors.border,
                },
              ]}
              onPress={handleToggleTheme}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel="Toggle Theme Mode"
            >
              <Ionicons
                name={isDark ? 'sunny' : 'moon'}
                size={18}
                color={isDark ? '#FBBF24' : colors.primary}
              />
            </TouchableOpacity>

            {/* 3. Profile Icon (When clicked shows Profile Screen) */}
            <TouchableOpacity
              style={[
                styles.profileIconBtn,
                {
                  backgroundColor: colors.primary,
                  borderColor: isDark ? '#334155' : colors.border,
                },
              ]}
              onPress={handleOpenProfile}
              activeOpacity={0.8}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel="Open Profile Screen"
            >
              <Text style={styles.profileInitials}>
                {user?.fullname
                  ? user.fullname.substring(0, 2).toUpperCase()
                  : user?.username
                  ? user.username.substring(0, 2).toUpperCase()
                  : 'U'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    // Dynamic background set inline
  },
  headerContainer: {
    paddingTop: 8,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  hamburgerIcon: {
    width: 20,
    height: 15,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  hamburgerLine: {
    width: 20,
    height: 2.5,
    borderRadius: 2,
  },
  titleContainer: {
    flex: 1,
    marginHorizontal: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 11,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  profileInitials: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

export default Header;
