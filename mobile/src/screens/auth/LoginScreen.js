import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { loginUser, loginCustomerOtp, clearError } from '../../redux/slices/authSlice';
import { toggleTheme } from '../../redux/slices/uiSlice';
import authApi from '../../api/authApi';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import { getThemeColors } from '../../constants/colors';

const LoginScreen = () => {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);
  const { theme } = useSelector((state) => state.ui);

  const isDark = theme === 'dark';
  const colors = getThemeColors(theme);

  // Staff / Admin Login States
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  // Customer Login States
  const [isCustomerMode, setIsCustomerMode] = useState(false);
  const [customerContact, setCustomerContact] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const [validationError, setValidationError] = useState('');

  // Handle Staff / Admin Login
  const handleStaffLogin = async () => {
    setValidationError('');
    dispatch(clearError());

    if (!identifier.trim()) {
      setValidationError('Please enter username or email.');
      return;
    }
    if (!password.trim()) {
      setValidationError('Please enter password.');
      return;
    }

    const resultAction = await dispatch(
      loginUser({ identifier: identifier.trim(), password })
    );

    if (loginUser.rejected.match(resultAction)) {
      Alert.alert('Login Failed', resultAction.payload || 'Invalid credentials.');
    }
  };

  // Handle Customer: Send OTP
  const handleSendOtp = async () => {
    setValidationError('');
    if (!customerContact.trim()) {
      setValidationError('Please enter email or mobile number.');
      return;
    }

    setIsSendingOtp(true);
    try {
      await authApi.sendCustomerOtp(customerContact.trim());
      setOtpSent(true);
      Alert.alert('OTP Sent', `Verification code sent to ${customerContact.trim()}`);
    } catch {
      Alert.alert('Error', 'Unable to send OTP. Please try again.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Handle Customer: Verify OTP & Login
  const handleVerifyOtp = async () => {
    setValidationError('');
    if (!otp.trim()) {
      setValidationError('Please enter the OTP.');
      return;
    }

    const resultAction = await dispatch(
      loginCustomerOtp({
        contact: customerContact.trim(),
        otp: otp.trim(),
      })
    );

    if (loginCustomerOtp.rejected.match(resultAction)) {
      Alert.alert('Verification Failed', resultAction.payload || 'Invalid OTP.');
    }
  };

  const handleSwitchMode = (toCustomer) => {
    setIsCustomerMode(toCustomer);
    setValidationError('');
    dispatch(clearError());
    setOtpSent(false);
    setOtp('');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: isDark ? colors.background : '#0F172A' }]}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Top Bar with Brand & Theme Toggle */}
          <View style={styles.topRow}>
            <View style={{ width: 40 }} />
            <View style={styles.brandContainer}>
              <View style={[styles.logoWrap, { backgroundColor: colors.surface }]}>
                <Ionicons name="cube" size={32} color={colors.primary} />
              </View>
              <Text style={[styles.brandTitle, { color: isDark ? colors.textPrimary : '#FFFFFF' }]}>
                Enterprise POS
              </Text>
            </View>

            {/* Theme Toggle Button (Saves to local storage) */}
            <TouchableOpacity
              style={[
                styles.themeToggleBtn,
                {
                  backgroundColor: isDark ? '#1E293B' : 'rgba(255, 255, 255, 0.15)',
                  borderColor: isDark ? '#334155' : 'rgba(255, 255, 255, 0.25)',
                },
              ]}
              onPress={() => dispatch(toggleTheme())}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityLabel="Toggle Theme Mode"
            >
              <Ionicons
                name={isDark ? 'sunny' : 'moon'}
                size={18}
                color={isDark ? '#FBBF24' : '#FFFFFF'}
              />
            </TouchableOpacity>
          </View>

          {/* Login Card */}
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            {/* Error Message */}
            {(validationError || error) ? (
              <View style={[styles.errorBox, { backgroundColor: colors.dangerLight }]}>
                <Ionicons name="alert-circle" size={18} color={colors.danger} />
                <Text style={[styles.errorText, { color: colors.danger }]}>{validationError || error}</Text>
              </View>
            ) : null}

            {!isCustomerMode ? (
              /* ================= MODE 1: STAFF / ADMIN LOGIN ================= */
              <>
                <CustomInput
                  label="Username or Email"
                  placeholder="Enter username or email"
                  value={identifier}
                  onChangeText={(text) => {
                    setIdentifier(text);
                    if (validationError) setValidationError('');
                  }}
                  iconName="person-outline"
                  autoCapitalize="none"
                />

                <CustomInput
                  label="Password"
                  placeholder="Enter password"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (validationError) setValidationError('');
                  }}
                  iconName="lock-closed-outline"
                  secureTextEntry
                />

                <CustomButton
                  title="Sign In"
                  onPress={handleStaffLogin}
                  loading={isLoading}
                  style={styles.actionBtn}
                />

                {/* Or Login as Customer Button */}
                <View style={styles.dividerRow}>
                  <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                  <Text style={[styles.dividerText, { color: colors.textMuted }]}>OR</Text>
                  <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                </View>

                <TouchableOpacity
                  style={[
                    styles.customerSwitchBtn,
                    {
                      borderColor: colors.primary,
                      backgroundColor: isDark ? colors.surfaceAlt : colors.primaryMuted,
                    },
                  ]}
                  onPress={() => handleSwitchMode(true)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="people-outline" size={18} color={colors.primary} />
                  <Text style={[styles.customerSwitchText, { color: colors.primary }]}>Login as a Customer</Text>
                </TouchableOpacity>
              </>
            ) : (
              /* ================= MODE 2: CUSTOMER OTP LOGIN ================= */
              <>
                <CustomInput
                  label="Email or Mobile Number"
                  placeholder="Enter email or mobile number"
                  value={customerContact}
                  onChangeText={(text) => {
                    setCustomerContact(text);
                    if (validationError) setValidationError('');
                  }}
                  iconName="mail-outline"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!otpSent}
                />

                {/* If OTP not sent yet: Show Send OTP Button */}
                {!otpSent ? (
                  <CustomButton
                    title="Send OTP"
                    onPress={handleSendOtp}
                    loading={isSendingOtp}
                    iconName="paper-plane-outline"
                    style={styles.actionBtn}
                  />
                ) : (
                  /* Once OTP is sent: Show OTP input box directly under */
                  <View style={styles.otpSection}>
                    <CustomInput
                      label="Verification Code"
                      placeholder="Enter OTP"
                      value={otp}
                      onChangeText={(text) => {
                        setOtp(text);
                        if (validationError) setValidationError('');
                      }}
                      iconName="key-outline"
                      keyboardType="number-pad"
                    />

                    <CustomButton
                      title="Verify & Login"
                      onPress={handleVerifyOtp}
                      loading={isLoading}
                      style={styles.actionBtn}
                    />

                    <TouchableOpacity
                      onPress={handleSendOtp}
                      disabled={isSendingOtp}
                      style={styles.resendBtn}
                    >
                      <Text style={[styles.resendText, { color: colors.primary }]}>Resend OTP</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Back to Staff Login */}
                <TouchableOpacity
                  style={styles.backBtn}
                  onPress={() => handleSwitchMode(false)}
                >
                  <Ionicons name="arrow-back" size={16} color={colors.textSecondary} />
                  <Text style={[styles.backBtnText, { color: colors.textSecondary }]}>Back to Staff Login</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  brandContainer: {
    alignItems: 'center',
  },
  logoWrap: {
    width: 60,
    height: 60,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  themeToggleBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 8,
  },
  actionBtn: {
    marginTop: 6,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 12,
    fontWeight: '700',
  },
  customerSwitchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  customerSwitchText: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
  },
  otpSection: {
    marginTop: 4,
  },
  resendBtn: {
    alignItems: 'center',
    marginTop: 12,
  },
  resendText: {
    fontSize: 13,
    fontWeight: '600',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    paddingVertical: 8,
  },
  backBtnText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
});

export default LoginScreen;
