import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { darkColors, lightColors } from '../theme/colors';
import { registerUser, fetchUsers } from '../store/usersSlice';
import { toast } from './Toast';

const ROLE_OPTIONS = [
  {
    key: 'admin',
    label: 'Admin',
    sub: 'Full system privileges & management',
    icon: 'shield-crown-outline',
    color: '#6366F1',
    lightBg: 'rgba(99, 102, 241, 0.12)',
  },
  {
    key: 'manager',
    label: 'Manager',
    sub: 'Branch operations & sales staff supervisor',
    icon: 'store-outline',
    color: '#0EA5E9',
    lightBg: 'rgba(14, 165, 233, 0.12)',
  },
  {
    key: 'salesman',
    label: 'Salesman',
    sub: 'Catalog orders & sales targets',
    icon: 'briefcase-account-outline',
    color: '#10B981',
    lightBg: 'rgba(16, 185, 129, 0.12)',
  },
  {
    key: 'customer',
    label: 'Customer',
    sub: 'Store consumer & order tracking',
    icon: 'account-outline',
    color: '#F59E0B',
    lightBg: 'rgba(245, 158, 11, 0.12)',
  },
];

export default function AddUserModal({ visible, onClose }) {
  const dispatch = useDispatch();
  const mode = useSelector((state) => state.theme?.mode || 'dark');
  const isDark = mode === 'dark';
  const colors = isDark ? darkColors : lightColors;

  const { registerLoading } = useSelector((state) => state.users);

  // Form Fields State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mobile, setMobile] = useState('');
  const [role, setRole] = useState('customer');

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (visible) {
      setName('');
      setEmail('');
      setUsername('');
      setPassword('');
      setMobile('');
      setRole('customer');
      setShowPassword(false);
      setErrors({});
    }
  }, [visible]);

  const validate = () => {
    const errs = {};
    if (!name.trim()) {
      errs.name = 'Full name is required';
    }
    if (!email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      errs.email = 'Enter a valid email address';
    }
    if (!username.trim()) {
      errs.username = 'Username is required';
    } else if (username.trim().length < 3) {
      errs.username = 'Username must be at least 3 characters';
    }
    if (!password) {
      errs.password = 'Password is required';
    } else if (password.length < 4) {
      errs.password = 'Password must be at least 4 characters';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      const payload = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        username: username.trim(),
        password,
        mobile: mobile.trim(),
        role,
      };

      const resultAction = await dispatch(registerUser(payload));

      if (registerUser.fulfilled.match(resultAction)) {
        const payloadData = resultAction.payload;
        toast.success(
          payloadData?.message || 'User registered successfully!',
          'Success'
        );
        dispatch(fetchUsers());
        onClose();
      } else {
        toast.error(resultAction.payload || 'Failed to register user', 'Error');
      }
    } catch (err) {
      toast.error(err.message || 'Error registering user', 'Error');
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalBackdrop}
      >
        {/* Backdrop tap to dismiss */}
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={[styles.backdropTouchArea, { backgroundColor: colors.drawerOverlay }]} />
        </TouchableWithoutFeedback>

        {/* Bottom Sheet Card */}
        <View style={[styles.sheetContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* Sheet Handle */}
          <View style={styles.sheetHandleWrap}>
            <View style={[styles.sheetHandle, { backgroundColor: colors.textMuted }]} />
          </View>

          {/* Sheet Header */}
          <View style={[styles.sheetHeader, { borderBottomColor: colors.border }]}>
            <View style={styles.headerTitleWrap}>
              <View style={[styles.headerIconBox, { backgroundColor: 'rgba(99, 102, 241, 0.15)' }]}>
                <MaterialCommunityIcons name="account-plus" size={22} color="#6366F1" />
              </View>
              <View>
                <Text style={[styles.sheetTitle, { color: colors.text }]}>Add New User</Text>
                <Text style={[styles.sheetSubtitle, { color: colors.textSecondary }]}>
                  Registers account via POST /api/auth/register
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: colors.surfaceElevated }]}
            >
              <MaterialCommunityIcons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Scrollable Form Content */}
          <ScrollView
            style={styles.formScroll}
            contentContainerStyle={styles.formScrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Full Name */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                Full Name <Text style={{ color: colors.danger }}>*</Text>
              </Text>
              <View
                style={[
                  styles.inputWrap,
                  {
                    backgroundColor: colors.inputBackground,
                    borderColor: errors.name ? colors.danger : colors.inputBorder,
                  },
                ]}
              >
                <MaterialCommunityIcons name="account-outline" size={20} color={colors.textMuted} style={styles.fieldIcon} />
                <TextInput
                  value={name}
                  onChangeText={(val) => {
                    setName(val);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
                  }}
                  placeholder="e.g. Avijit Hazra"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.textInput, { color: colors.text }]}
                />
              </View>
              {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
            </View>

            {/* Email & Username Row */}
            <View style={styles.rowTwoCol}>
              {/* Email */}
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  Email <Text style={{ color: colors.danger }}>*</Text>
                </Text>
                <View
                  style={[
                    styles.inputWrap,
                    {
                      backgroundColor: colors.inputBackground,
                      borderColor: errors.email ? colors.danger : colors.inputBorder,
                    },
                  ]}
                >
                  <MaterialCommunityIcons name="email-outline" size={18} color={colors.textMuted} style={styles.fieldIcon} />
                  <TextInput
                    value={email}
                    onChangeText={(val) => {
                      setEmail(val);
                      if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
                    }}
                    placeholder="user@example.com"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={[styles.textInput, { color: colors.text }]}
                  />
                </View>
                {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
              </View>

              {/* Username */}
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  Username <Text style={{ color: colors.danger }}>*</Text>
                </Text>
                <View
                  style={[
                    styles.inputWrap,
                    {
                      backgroundColor: colors.inputBackground,
                      borderColor: errors.username ? colors.danger : colors.inputBorder,
                    },
                  ]}
                >
                  <MaterialCommunityIcons name="at" size={18} color={colors.textMuted} style={styles.fieldIcon} />
                  <TextInput
                    value={username}
                    onChangeText={(val) => {
                      setUsername(val);
                      if (errors.username) setErrors((prev) => ({ ...prev, username: null }));
                    }}
                    placeholder="avijit25"
                    placeholderTextColor={colors.textMuted}
                    autoCapitalize="none"
                    style={[styles.textInput, { color: colors.text }]}
                  />
                </View>
                {errors.username ? <Text style={styles.errorText}>{errors.username}</Text> : null}
              </View>
            </View>

            {/* Password & Mobile Row */}
            <View style={styles.rowTwoCol}>
              {/* Password */}
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  Password <Text style={{ color: colors.danger }}>*</Text>
                </Text>
                <View
                  style={[
                    styles.inputWrap,
                    {
                      backgroundColor: colors.inputBackground,
                      borderColor: errors.password ? colors.danger : colors.inputBorder,
                    },
                  ]}
                >
                  <MaterialCommunityIcons name="lock-outline" size={18} color={colors.textMuted} style={styles.fieldIcon} />
                  <TextInput
                    value={password}
                    onChangeText={(val) => {
                      setPassword(val);
                      if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
                    }}
                    placeholder="Min 4 chars"
                    placeholderTextColor={colors.textMuted}
                    secureTextEntry={!showPassword}
                    style={[styles.textInput, { color: colors.text }]}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <MaterialCommunityIcons
                      name={showPassword ? 'eye-off' : 'eye'}
                      size={18}
                      color={colors.textMuted}
                    />
                  </TouchableOpacity>
                </View>
                {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
              </View>

              {/* Mobile Phone */}
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Mobile Phone</Text>
                <View
                  style={[
                    styles.inputWrap,
                    {
                      backgroundColor: colors.inputBackground,
                      borderColor: colors.inputBorder,
                    },
                  ]}
                >
                  <MaterialCommunityIcons name="phone-outline" size={18} color={colors.textMuted} style={styles.fieldIcon} />
                  <TextInput
                    value={mobile}
                    onChangeText={setMobile}
                    placeholder="9876543210"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="phone-pad"
                    style={[styles.textInput, { color: colors.text }]}
                  />
                </View>
              </View>
            </View>

            {/* Role Selector */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                User Role <Text style={{ color: colors.danger }}>*</Text>
              </Text>
              <Text style={[styles.fieldHint, { color: colors.textMuted }]}>
                Determines access permissions, screens, and features
              </Text>

              <View style={styles.roleGrid}>
                {ROLE_OPTIONS.map((opt) => {
                  const isSelected = role === opt.key;
                  return (
                    <TouchableOpacity
                      key={opt.key}
                      activeOpacity={0.8}
                      onPress={() => setRole(opt.key)}
                      style={[
                        styles.roleCard,
                        {
                          backgroundColor: isSelected ? opt.lightBg : colors.surfaceElevated,
                          borderColor: isSelected ? opt.color : colors.border,
                        },
                      ]}
                    >
                      <View style={styles.roleCardTop}>
                        <View style={[styles.roleIconWrap, { backgroundColor: isSelected ? opt.color : colors.badgeBg }]}>
                          <MaterialCommunityIcons
                            name={opt.icon}
                            size={16}
                            color={isSelected ? '#FFFFFF' : opt.color}
                          />
                        </View>
                        {isSelected && (
                          <MaterialCommunityIcons name="check-circle" size={16} color={opt.color} />
                        )}
                      </View>

                      <Text
                        style={[
                          styles.roleLabel,
                          {
                            color: isSelected ? opt.color : colors.text,
                            fontWeight: isSelected ? '700' : '600',
                          },
                        ]}
                      >
                        {opt.label}
                      </Text>
                      <Text
                        numberOfLines={2}
                        style={[
                          styles.roleSub,
                          { color: colors.textMuted },
                        ]}
                      >
                        {opt.sub}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* API Info Banner */}
            <View style={[styles.endpointBadgeBox, { backgroundColor: isDark ? '#1E293B' : '#EEF2FF' }]}>
              <MaterialCommunityIcons name="api" size={16} color="#6366F1" />
              <Text style={[styles.endpointBadgeText, { color: '#6366F1' }]}>
                Calls POST /api/auth/register with selected role: {role}
              </Text>
            </View>
          </ScrollView>

          {/* Footer Action Buttons */}
          <View style={[styles.sheetFooter, { borderTopColor: colors.border, backgroundColor: colors.surface }]}>
            <TouchableOpacity
              onPress={onClose}
              disabled={registerLoading}
              style={[
                styles.cancelBtn,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.surfaceElevated,
                },
              ]}
            >
              <Text style={[styles.cancelBtnText, { color: colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={registerLoading}
              style={[
                styles.submitBtn,
                {
                  backgroundColor: colors.primary,
                  opacity: registerLoading ? 0.7 : 1,
                },
              ]}
            >
              {registerLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <MaterialCommunityIcons name="account-check" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.submitBtnText}>Register User</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdropTouchArea: {
    ...StyleSheet.absoluteFillObject,
  },
  sheetContainer: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    maxHeight: '90%',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  sheetHandleWrap: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  sheetHandle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    opacity: 0.4,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  headerIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  sheetSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formScroll: {
    paddingHorizontal: 20,
  },
  formScrollContent: {
    paddingVertical: 16,
    paddingBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  fieldHint: {
    fontSize: 11,
    marginTop: -3,
    marginBottom: 8,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 48,
  },
  fieldIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
  rowTwoCol: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  errorText: {
    fontSize: 11,
    color: '#EF4444',
    marginTop: 4,
    fontWeight: '500',
  },
  roleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  roleCard: {
    width: '48%',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  roleCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  roleIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleLabel: {
    fontSize: 14,
    marginBottom: 3,
  },
  roleSub: {
    fontSize: 11,
    lineHeight: 14,
  },
  endpointBadgeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 4,
    marginBottom: 8,
  },
  endpointBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  sheetFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  submitBtn: {
    flex: 2,
    height: 46,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
