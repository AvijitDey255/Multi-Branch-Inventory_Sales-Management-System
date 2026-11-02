import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../../redux/slices/authSlice';
import { toggleTheme } from '../../redux/slices/uiSlice';
import { getThemeColors } from '../../constants/colors';
import { ROLE_CONFIG } from '../../constants/roles';

const ProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { activeBranch, theme } = useSelector((state) => state.ui);

  const isDark = theme === 'dark';
  const colors = getThemeColors(theme);

  const roleConfig = (user?.role && ROLE_CONFIG[user.role]) || {
    badgeText: user?.role || 'USER',
    color: colors.primary,
    bgColor: colors.primaryMuted,
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to log out of your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => dispatch(logoutUser()),
        },
      ]
    );
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Top Bar with Back Button */}
      <View style={[styles.topBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
        </TouchableOpacity>

        <Text style={[styles.screenTitle, { color: colors.textPrimary }]}>Profile</Text>

        <TouchableOpacity
          style={[styles.themeBtn, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
          onPress={() => dispatch(toggleTheme())}
        >
          <Ionicons
            name={isDark ? 'sunny' : 'moon'}
            size={18}
            color={isDark ? '#FBBF24' : colors.primary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Hero Card */}
        <View style={[styles.heroCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.avatarWrap, { backgroundColor: colors.primaryMuted, borderColor: roleConfig.color }]}>
            <Ionicons name="person" size={48} color={colors.primary} />
          </View>

          <Text style={[styles.fullname, { color: colors.textPrimary }]}>
            {user?.fullname || 'avijit dey'}
          </Text>

          <Text style={[styles.username, { color: colors.textSecondary }]}>
            @{user?.username || 'avijit255'}
          </Text>

          <View style={[styles.roleBadge, { backgroundColor: roleConfig.bgColor, borderColor: roleConfig.color }]}>
            <Ionicons name="shield-checkmark" size={14} color={roleConfig.color} />
            <Text style={[styles.roleText, { color: roleConfig.color }]}>
              {roleConfig.badgeText}
            </Text>
          </View>
        </View>

        {/* User Details Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: colors.textMuted }]}>ACCOUNT DETAILS</Text>

          <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.infoRow}>
              <View style={[styles.iconBox, { backgroundColor: colors.primaryMuted }]}>
                <Ionicons name="mail-outline" size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Email Address</Text>
                <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                  {user?.email || 'avijit25@gmail.com'}
                </Text>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.infoRow}>
              <View style={[styles.iconBox, { backgroundColor: colors.primaryMuted }]}>
                <Ionicons name="person-outline" size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Username</Text>
                <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                  {user?.username || 'avijit255'}
                </Text>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.infoRow}>
              <View style={[styles.iconBox, { backgroundColor: colors.primaryMuted }]}>
                <Ionicons name="business-outline" size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Assigned Branch</Text>
                <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                  {activeBranch}
                </Text>
              </View>
            </View>

            {user?.id ? (
              <>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <View style={styles.infoRow}>
                  <View style={[styles.iconBox, { backgroundColor: colors.primaryMuted }]}>
                    <Ionicons name="finger-print-outline" size={18} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.infoLabel, { color: colors.textMuted }]}>User ID</Text>
                    <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                      #{user.id}
                    </Text>
                  </View>
                </View>
              </>
            ) : null}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: colors.textMuted }]}>ACTIONS</Text>

          <TouchableOpacity
            style={[styles.actionRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => dispatch(toggleTheme())}
          >
            <View style={[styles.iconBox, { backgroundColor: isDark ? '#1E293B' : '#FEF3C7' }]}>
              <Ionicons
                name={isDark ? 'sunny' : 'moon'}
                size={18}
                color={isDark ? '#FBBF24' : '#D97706'}
              />
            </View>
            <Text style={[styles.actionText, { color: colors.textPrimary }]}>
              Switch to {isDark ? 'Light' : 'Dark'} Theme
            </Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => navigation.navigate('More')}
          >
            <View style={[styles.iconBox, { backgroundColor: colors.accentLight }]}>
              <Ionicons name="settings-outline" size={18} color={colors.accent} />
            </View>
            <Text style={[styles.actionText, { color: colors.textPrimary }]}>
              App Settings & Branch
            </Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </TouchableOpacity>

          {/* Logout Button */}
          <TouchableOpacity
            style={[styles.logoutBtn, { backgroundColor: colors.dangerLight, borderColor: '#FECACA' }]}
            onPress={handleSignOut}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={20} color={colors.danger} />
            <Text style={[styles.logoutText, { color: colors.danger }]}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  themeBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  heroCard: {
    alignItems: 'center',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  fullname: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  username: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginLeft: 6,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  infoCard: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginVertical: 4,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  actionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 12,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 10,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 8,
  },
});

export default ProfileScreen;

