import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { darkColors, lightColors } from '../theme/colors';
import { getRoleConfig } from '../utils/roles';
import ThemeToggle from './ThemeToggle';

export default function Navbar({ onOpenSidebar, onNavigateToProfile, onNavigateToCart }) {
  const mode = useSelector((state) => state.theme.mode);
  const user = useSelector((state) => state.auth.user);
  const cart = useSelector((state) => state.ecom?.cart || []);
  const isDark = mode === 'dark';
  const colors = isDark ? darkColors : lightColors;

  const currentRole = user?.role || 'admin';
  const roleConfig = getRoleConfig(currentRole);
  const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
        },
      ]}
    >
      {/* Left: Three lines Hamburger Menu */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onOpenSidebar}
        style={[
          styles.iconButton,
          {
            backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
            borderColor: colors.border,
          },
        ]}
        accessibilityLabel="Open Menu"
      >
        <MaterialCommunityIcons name="menu" size={24} color={colors.text} />
      </TouchableOpacity>

      {/* Center: Clickable Logo with Role Badge */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onNavigateToProfile}
        style={styles.logoContainer}
        accessibilityLabel="Go to Profile"
      >
        <View style={styles.logoBadge}>
          <MaterialCommunityIcons name="hexagon-slice-6" size={24} color={roleConfig.color} />
        </View>
        <View style={styles.logoTextGroup}>
          <Text style={[styles.logoTitle, { color: colors.text }]}>NEXUS</Text>
          <View style={[styles.roleBadge, { backgroundColor: `${roleConfig.color}20` }]}>
            <Text style={[styles.roleBadgeText, { color: roleConfig.color }]}>
              {roleConfig.badge}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Right: Cart, Theme Toggle & User Mini Avatar */}
      <View style={styles.rightGroup}>
        {/* Cart Icon Button with dynamic badge */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onNavigateToCart}
          style={[
            styles.iconButton,
            {
              backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
              borderColor: colors.border,
              position: 'relative',
            },
          ]}
          accessibilityLabel="Open Cart"
        >
          <MaterialCommunityIcons name="cart-outline" size={21} color={colors.text} />
          {cartCount > 0 && (
            <View
              style={{
                position: 'absolute',
                top: -3,
                right: -3,
                minWidth: 17,
                height: 17,
                borderRadius: 8.5,
                backgroundColor: roleConfig.color,
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: 3,
              }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 9.5, fontWeight: '900' }}>
                {cartCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <ThemeToggle compact />

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onNavigateToProfile}
          style={[styles.avatarButton, { borderColor: roleConfig.color }]}
        >
          <Image
            source={{
              uri:
                user?.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  user?.name || user?.fullName || user?.username || 'User'
                )}&background=6366F1&color=fff&bold=true`,
            }}
            style={styles.avatarImage}
          />
          <View style={styles.onlineBadge} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: Platform.OS === 'ios' ? 70 : 64,
    paddingTop: Platform.OS === 'ios' ? 10 : 4,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    zIndex: 50,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  logoBadge: {
    marginRight: 6,
  },
  logoTextGroup: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  logoTitle: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  logoSub: {
    fontSize: 10,
    fontWeight: '900',
    marginLeft: 3,
    letterSpacing: 0.5,
  },
  roleBadge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  roleBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 19,
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#10B981',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
});
