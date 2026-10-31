import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { darkColors, lightColors } from '../theme/colors';
import { logout, updateProfile } from '../store/authSlice';
import { toggleTheme } from '../store/themeSlice';

export default function ProfileScreen({ onNavigate }) {
  const dispatch = useDispatch();
  const mode = useSelector((state) => state.theme.mode);
  const user = useSelector((state) => state.auth.user);
  const isDark = mode === 'dark';
  const colors = isDark ? darkColors : lightColors;

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name || user?.fullName || '');
  const [usernameInput, setUsernameInput] = useState(user?.username || '');
  const [emailInput, setEmailInput] = useState(user?.email || '');
  const [phoneInput, setPhoneInput] = useState(user?.mobile || user?.phone || '');
  const [roleInput, setRoleInput] = useState(user?.role || '');

  const avatarUri =
    user?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      user?.name || user?.fullName || user?.username || 'User'
    )}&background=6366F1&color=fff&bold=true`;

  const handleSaveProfile = () => {
    dispatch(
      updateProfile({
        name: nameInput,
        fullName: nameInput,
        username: usernameInput,
        email: emailInput,
        mobile: phoneInput,
        phone: phoneInput,
        role: roleInput,
      })
    );
    setEditModalVisible(false);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile Header Card */}
      <View
        style={[
          styles.profileCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.avatarRow}>
          <View style={[styles.avatarWrap, { borderColor: colors.primary }]}>
            <Image source={{ uri: avatarUri }} style={styles.avatarImg} />
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setEditModalVisible(true)}
              style={[styles.editBadge, { backgroundColor: colors.primary }]}
            >
              <MaterialCommunityIcons name="pencil" size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.userHeadInfo}>
            <View style={styles.nameHeader}>
              <Text style={[styles.fullName, { color: colors.text }]} numberOfLines={1}>
                {user?.name || user?.fullName || 'User'}
              </Text>
              <MaterialCommunityIcons name="check-decagram" size={18} color="#3B82F6" />
            </View>
            <Text style={[styles.usernameText, { color: colors.primary }]}>
              @{user?.username || 'user'}
            </Text>
            <Text style={[styles.roleText, { color: colors.textSecondary }]}>
              {user?.role?.toUpperCase() || 'USER'}
            </Text>
            <View style={[styles.vipPill, { backgroundColor: isDark ? '#312E81' : '#EEF2FF' }]}>
              <MaterialCommunityIcons name="shield-star" size={14} color="#818CF8" />
              <Text style={styles.vipPillText}>{user?.role?.toUpperCase() || 'ACCOUNT'}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            setNameInput(user?.name || user?.fullName || '');
            setUsernameInput(user?.username || '');
            setEmailInput(user?.email || '');
            setPhoneInput(user?.mobile || user?.phone || '');
            setRoleInput(user?.role || '');
            setEditModalVisible(true);
          }}
          style={[styles.editProfileBtn, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
        >
          <MaterialCommunityIcons name="account-edit-outline" size={18} color={colors.text} />
          <Text style={[styles.editBtnText, { color: colors.text }]}>Edit Profile Details</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Summary */}
      <View style={styles.statsRow}>
        <View style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.statNum, { color: colors.primary }]}>{user?.stats?.totalBookings || '28'}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Bookings</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.statNum, { color: '#10B981' }]}>{user?.stats?.credits || '$2,850'}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Credits</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.statNum, { color: '#F59E0B' }]}>{user?.stats?.rating || '4.95'}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>VIP Rating</Text>
        </View>
      </View>

      {/* Redux State Live Inspector */}
      <View style={[styles.reduxCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.reduxHeader}>
          <View style={styles.reduxHeaderLeft}>
            <MaterialCommunityIcons name="database-sync" size={20} color="#8B5CF6" />
            <Text style={[styles.reduxTitle, { color: colors.text }]}>Live Redux Toolkit State</Text>
          </View>
          <View style={[styles.reduxPill, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
            <Text style={styles.reduxPillText}>STORE SYNCED</Text>
          </View>
        </View>

        <Text style={[styles.reduxDesc, { color: colors.textSecondary }]}>
          This data is saved in Redux Toolkit and reflects user input from login / signup or updates:
        </Text>

        <View style={[styles.codeBox, { backgroundColor: isDark ? '#0F1626' : '#F1F5F9', borderColor: colors.border }]}>
          <Text style={[styles.codeKey, { color: colors.primary }]}>fullName: <Text style={{ color: colors.text }}>"{user?.fullName}"</Text></Text>
          <Text style={[styles.codeKey, { color: colors.primary }]}>username: <Text style={{ color: colors.text }}>"@{user?.username}"</Text></Text>
          <Text style={[styles.codeKey, { color: colors.primary }]}>email: <Text style={{ color: colors.text }}>"{user?.email}"</Text></Text>
          <Text style={[styles.codeKey, { color: colors.primary }]}>role: <Text style={{ color: colors.text }}>"{user?.role}"</Text></Text>
          <Text style={[styles.codeKey, { color: colors.primary }]}>phone: <Text style={{ color: colors.text }}>"{user?.phone}"</Text></Text>
          <Text style={[styles.codeKey, { color: colors.primary }]}>location: <Text style={{ color: colors.text }}>"{user?.location}"</Text></Text>
          <Text style={[styles.codeKey, { color: colors.primary }]}>themeMode: <Text style={{ color: '#10B981' }}>"{mode}"</Text></Text>
        </View>
      </View>

      {/* Account Info Details */}
      <View style={[styles.detailsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Account Information</Text>

        <View style={styles.infoRow}>
          <View style={styles.infoLeft}>
            <MaterialCommunityIcons name="email-outline" size={18} color={colors.textMuted} />
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Email Address</Text>
          </View>
          <Text style={[styles.infoValue, { color: colors.text }]}>{user?.email || 'alex.morgan@nexus.io'}</Text>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoLeft}>
            <MaterialCommunityIcons name="phone-outline" size={18} color={colors.textMuted} />
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Phone Number</Text>
          </View>
          <Text style={[styles.infoValue, { color: colors.text }]}>{user?.phone || '+1 (555) 729-4081'}</Text>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoLeft}>
            <MaterialCommunityIcons name="map-marker-outline" size={18} color={colors.textMuted} />
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Location</Text>
          </View>
          <Text style={[styles.infoValue, { color: colors.text }]}>{user?.location || 'San Francisco, CA'}</Text>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoLeft}>
            <MaterialCommunityIcons name="calendar-month-outline" size={18} color={colors.textMuted} />
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Member Since</Text>
          </View>
          <Text style={[styles.infoValue, { color: colors.text }]}>{user?.joinedDate || 'March 2024'}</Text>
        </View>
      </View>

      {/* Preferences & Settings */}
      <View style={[styles.detailsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>System Preferences</Text>

        {/* Theme Toggle in Settings */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => dispatch(toggleTheme())}
          style={styles.settingRow}
        >
          <View style={styles.settingLeft}>
            <MaterialCommunityIcons
              name={isDark ? 'weather-night' : 'white-balance-sunny'}
              size={20}
              color={isDark ? '#818CF8' : '#F59E0B'}
            />
            <View>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Appearance Mode</Text>
              <Text style={[styles.settingSub, { color: colors.textMuted }]}>
                Saved locally via AsyncStorage ({isDark ? 'Dark Theme' : 'Light Theme'})
              </Text>
            </View>
          </View>
          <View style={[styles.pillBadge, { backgroundColor: colors.surfaceElevated }]}>
            <Text style={[styles.pillBadgeText, { color: colors.text }]}>Switch</Text>
          </View>
        </TouchableOpacity>

        {/* Security / Biometrics */}
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <MaterialCommunityIcons name="fingerprint" size={20} color="#10B981" />
            <View>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Biometric Authentication</Text>
              <Text style={[styles.settingSub, { color: colors.textMuted }]}>FaceID / Fingerprint active</Text>
            </View>
          </View>
          <MaterialCommunityIcons name="toggle-switch" size={32} color="#10B981" />
        </View>
      </View>

      {/* Logout Action */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => dispatch(logout())}
        style={[styles.logoutBtn, { backgroundColor: colors.dangerLight, borderColor: colors.danger }]}
      >
        <MaterialCommunityIcons name="logout-variant" size={20} color={colors.danger} />
        <Text style={[styles.logoutText, { color: colors.danger }]}>Sign Out of Nexus</Text>
      </TouchableOpacity>

      {/* Modal: Edit Profile */}
      <Modal visible={editModalVisible} transparent animationType="slide">
        <View style={[styles.modalBackdrop, { backgroundColor: colors.drawerOverlay }]}>
          <View style={[styles.modalBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.modalHead, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalHeadTitle, { color: colors.text }]}>Update Redux Profile</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.inputItem}>
                <Text style={[styles.inputLbl, { color: colors.text }]}>Full Name</Text>
                <TextInput
                  value={nameInput}
                  onChangeText={setNameInput}
                  style={[styles.textInp, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceElevated }]}
                />
              </View>

              <View style={styles.inputItem}>
                <Text style={[styles.inputLbl, { color: colors.text }]}>Username</Text>
                <TextInput
                  value={usernameInput}
                  onChangeText={setUsernameInput}
                  style={[styles.textInp, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceElevated }]}
                />
              </View>

              <View style={styles.inputItem}>
                <Text style={[styles.inputLbl, { color: colors.text }]}>Email</Text>
                <TextInput
                  value={emailInput}
                  onChangeText={setEmailInput}
                  style={[styles.textInp, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceElevated }]}
                />
              </View>

              <View style={styles.inputItem}>
                <Text style={[styles.inputLbl, { color: colors.text }]}>Role / Position</Text>
                <TextInput
                  value={roleInput}
                  onChangeText={setRoleInput}
                  style={[styles.textInp, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceElevated }]}
                />
              </View>

              <View style={styles.inputItem}>
                <Text style={[styles.inputLbl, { color: colors.text }]}>Phone</Text>
                <TextInput
                  value={phoneInput}
                  onChangeText={setPhoneInput}
                  style={[styles.textInp, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceElevated }]}
                />
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleSaveProfile}
                style={[styles.saveBtn, { backgroundColor: colors.primary }]}
              >
                <MaterialCommunityIcons name="content-save-outline" size={18} color="#FFFFFF" />
                <Text style={styles.saveBtnText}>Save to Redux & Storage</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  profileCard: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 14,
  },
  avatarWrap: {
    position: 'relative',
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2.5,
    padding: 2,
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: 38,
  },
  editBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userHeadInfo: {
    flex: 1,
  },
  nameHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  fullName: {
    fontSize: 18,
    fontWeight: '800',
  },
  usernameText: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 1,
  },
  roleText: {
    fontSize: 12,
    marginTop: 2,
  },
  vipPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 6,
  },
  vipPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#818CF8',
  },
  bioText: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  editBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  statNum: {
    fontSize: 18,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 3,
  },
  reduxCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  reduxHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reduxHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reduxTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  reduxPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  reduxPillText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#8B5CF6',
    letterSpacing: 0.5,
  },
  reduxDesc: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 10,
  },
  codeBox: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 4,
  },
  codeKey: {
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  detailsCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.1)',
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    fontSize: 13,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  settingLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  settingSub: {
    fontSize: 11,
    marginTop: 2,
  },
  pillBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  pillBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
    marginTop: 4,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '800',
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    maxHeight: '85%',
  },
  modalHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  modalHeadTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  modalScroll: {
    marginTop: 14,
  },
  inputItem: {
    marginBottom: 12,
    gap: 6,
  },
  inputLbl: {
    fontSize: 13,
    fontWeight: '600',
  },
  textInp: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 13,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 12,
    gap: 8,
    marginTop: 10,
    marginBottom: 12,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
