import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials, setAuthLoading, setAuthError } from '../store/authSlice';
import { darkColors, lightColors } from '../theme/colors';
import { API_ROUTES, BACKEND_API } from '../config/constants';
import { toast } from '../components/Toast';
import ThemeToggle from '../components/ThemeToggle';
import tw from '../utils/tw';

export default function LoginScreen() {
  const dispatch = useDispatch();
  const mode = useSelector((state) => state.theme.mode);
  const isDark = mode === 'dark';
  const colors = isDark ? darkColors : lightColors;

  // Active Tab: 'signin' | 'signup'
  const [authMode, setAuthMode] = useState('signin');

  // Sign In Form State - Default pre-filled with real seeded backend credentials
  const [username, setUsername] = useState('avijit25');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);

  // Sign Up Form State
  const [fullName, setFullName] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupRole, setSignupRole] = useState('admin');
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Sign In Validation
  const validateSignIn = () => {
    const newErrors = {};
    if (!username.trim()) {
      newErrors.username = 'Username or email is required';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 4) {
      newErrors.password = 'Password must be at least 4 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Real Backend Fetch: POST /api/auth/login
  const handleLogin = async () => {
    if (!validateSignIn()) return;

    setLoading(true);
    dispatch(setAuthLoading(true));
    dispatch(setAuthError(null));
    setErrors({});

    const trimmedUser = username.trim();

    try {
      const response = await fetch(API_ROUTES.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          username: trimmedUser,
          email: trimmedUser,
          identifier: trimmedUser,
          password: password,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.success && data.token) {
        toast.success(data.message || `Welcome back, ${data.user?.name || trimmedUser}!`);
        dispatch(
          setCredentials({
            user: data.user,
            token: data.token,
          })
        );
      } else {
        const errorMsg = data.message || 'Invalid username/email or password';
        setErrors({ general: errorMsg });
        toast.error(errorMsg);
        dispatch(setAuthError(errorMsg));
      }
    } catch (err) {
      const netMsg = `Cannot connect to backend server at ${API_ROUTES.LOGIN}. Please ensure backend is running.`;
      setErrors({ general: netMsg });
      toast.error(netMsg);
      dispatch(setAuthError(netMsg));
    } finally {
      setLoading(false);
      dispatch(setAuthLoading(false));
    }
  };

  // Sign Up Validation
  const validateSignUp = () => {
    const newErrors = {};
    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    if (!signupUsername.trim()) {
      newErrors.signupUsername = 'Username is required';
    } else if (signupUsername.trim().length < 3) {
      newErrors.signupUsername = 'Username must be at least 3 characters';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!signupEmail.trim()) {
      newErrors.signupEmail = 'Email is required';
    } else if (!emailRegex.test(signupEmail.trim())) {
      newErrors.signupEmail = 'Please enter a valid email address';
    }

    if (!signupPassword) {
      newErrors.signupPassword = 'Password is required';
    } else if (signupPassword.length < 4) {
      newErrors.signupPassword = 'Password must be at least 4 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Real Backend Fetch: POST /api/auth/register
  const handleSignUp = async () => {
    if (!validateSignUp()) return;

    setLoading(true);
    dispatch(setAuthLoading(true));
    dispatch(setAuthError(null));
    setErrors({});

    try {
      const response = await fetch(`${BACKEND_API}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          name: fullName.trim(),
          username: signupUsername.trim(),
          email: signupEmail.trim(),
          password: signupPassword,
          role: signupRole,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.success && data.token) {
        toast.success(data.message || 'Account created successfully!');
        dispatch(
          setCredentials({
            user: data.user,
            token: data.token,
          })
        );
      } else {
        const errorMsg = data.message || 'Registration failed. Check server requirements.';
        setErrors({ general: errorMsg });
        toast.error(errorMsg);
      }
    } catch (err) {
      const netMsg = `Cannot connect to backend server at ${BACKEND_API}/auth/register.`;
      setErrors({ general: netMsg });
      toast.error(netMsg);
    } finally {
      setLoading(false);
      dispatch(setAuthLoading(false));
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[tw('flex-1'), { backgroundColor: colors.background }]}
    >
      <ScrollView
        contentContainerStyle={[tw('px-6 py-8'), { flexGrow: 1, justifyContent: 'center' }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header Bar */}
        <View style={tw('flex-row items-center justify-between mb-6')}>
          <View style={tw('flex-row items-center gap-2.5')}>
            <View
              style={[
                tw('w-11 h-11 rounded-2xl items-center justify-center shadow-sm'),
                { backgroundColor: colors.primaryLight },
              ]}
            >
              <MaterialCommunityIcons name="hexagon-slice-6" size={26} color={colors.primary} />
            </View>
            <View>
              <Text style={[tw('text-2xl font-black'), { color: colors.text, letterSpacing: 1.5 }]}>
                NEXUS
              </Text>
              <Text style={[tw('text-xs font-bold tracking-widest'), { color: colors.primary }]}>
                E-COMMERCE & OPS
              </Text>
            </View>
          </View>
          <ThemeToggle />
        </View>

        {/* Tab Switcher: Sign In vs Sign Up */}
        <View
          style={[
            tw('flex-row p-1 rounded-2xl mb-6 border'),
            { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              setAuthMode('signin');
              setErrors({});
            }}
            style={[
              tw('flex-1 py-2.5 rounded-xl items-center flex-row justify-center gap-2'),
              authMode === 'signin'
                ? { backgroundColor: colors.primary }
                : {},
            ]}
          >
            <MaterialCommunityIcons
              name="login"
              size={18}
              color={authMode === 'signin' ? '#FFFFFF' : colors.textSecondary}
            />
            <Text
              style={[
                tw('text-sm font-bold'),
                { color: authMode === 'signin' ? '#FFFFFF' : colors.textSecondary },
              ]}
            >
              Sign In
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              setAuthMode('signup');
              setErrors({});
            }}
            style={[
              tw('flex-1 py-2.5 rounded-xl items-center flex-row justify-center gap-2'),
              authMode === 'signup'
                ? { backgroundColor: colors.primary }
                : {},
            ]}
          >
            <MaterialCommunityIcons
              name="account-plus-outline"
              size={18}
              color={authMode === 'signup' ? '#FFFFFF' : colors.textSecondary}
            />
            <Text
              style={[
                tw('text-sm font-bold'),
                { color: authMode === 'signup' ? '#FFFFFF' : colors.textSecondary },
              ]}
            >
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>

        {/* Welcome Section */}
        <View style={tw('mb-6')}>
          <Text style={[tw('text-2xl font-extrabold'), { color: colors.text }]}>
            {authMode === 'signin' ? 'Welcome Back' : 'Create New Account'}
          </Text>
          <Text style={[tw('text-xs mt-1 leading-5'), { color: colors.textSecondary }]}>
            {authMode === 'signin'
              ? 'Authenticating directly with backend /api/auth/login'
              : 'Register a new account on backend /api/auth/register'}
          </Text>
        </View>

        {/* General Error Banner */}
        {errors.general ? (
          <View
            style={[
              tw('p-3.5 rounded-xl border mb-5 flex-row items-center gap-2.5'),
              { backgroundColor: `${colors.danger}15`, borderColor: `${colors.danger}40` },
            ]}
          >
            <MaterialCommunityIcons name="alert-circle-outline" size={20} color={colors.danger} />
            <Text style={[tw('text-xs font-semibold flex-1'), { color: colors.danger }]}>
              {errors.general}
            </Text>
          </View>
        ) : null}

        {/* ================= SIGN IN TAB ================= */}
        {authMode === 'signin' ? (
          <View style={tw('gap-4 mb-6')}>
            {/* Username Field */}
            <View>
              <Text
                style={[
                  tw('text-xs font-bold uppercase mb-2 tracking-wider'),
                  { color: colors.textSecondary },
                ]}
              >
                Username or Email
              </Text>
              <View
                style={[
                  tw('flex-row items-center h-13 px-4 rounded-2xl border'),
                  {
                    backgroundColor: colors.inputBackground,
                    borderColor: errors.username ? colors.danger : colors.inputBorder,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="account-outline"
                  size={20}
                  color={errors.username ? colors.danger : colors.textMuted}
                  style={tw('mr-3')}
                />
                <TextInput
                  value={username}
                  onChangeText={(text) => {
                    setUsername(text);
                    if (errors.username || errors.general) {
                      setErrors((prev) => ({ ...prev, username: null, general: null }));
                    }
                  }}
                  placeholder="avijit25"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={[tw('flex-1 text-sm font-medium'), { color: colors.text }]}
                />
              </View>
              {errors.username ? (
                <Text style={[tw('text-xs mt-1.5 font-medium'), { color: colors.danger }]}>
                  {errors.username}
                </Text>
              ) : null}
            </View>

            {/* Password Field */}
            <View>
              <Text
                style={[
                  tw('text-xs font-bold uppercase mb-2 tracking-wider'),
                  { color: colors.textSecondary },
                ]}
              >
                Password
              </Text>
              <View
                style={[
                  tw('flex-row items-center h-13 px-4 rounded-2xl border'),
                  {
                    backgroundColor: colors.inputBackground,
                    borderColor: errors.password ? colors.danger : colors.inputBorder,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="lock-outline"
                  size={20}
                  color={errors.password ? colors.danger : colors.textMuted}
                  style={tw('mr-3')}
                />
                <TextInput
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errors.password || errors.general) {
                      setErrors((prev) => ({ ...prev, password: null, general: null }));
                    }
                  }}
                  placeholder="123456"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  style={[tw('flex-1 text-sm font-medium'), { color: colors.text }]}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <MaterialCommunityIcons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={colors.textMuted}
                  />
                </TouchableOpacity>
              </View>
              {errors.password ? (
                <Text style={[tw('text-xs mt-1.5 font-medium'), { color: colors.danger }]}>
                  {errors.password}
                </Text>
              ) : null}
            </View>

            {/* Backend Route Indicator */}
            <View style={tw('flex-row items-center gap-1.5 mt-1')}>
              <MaterialCommunityIcons name="server-network" size={15} color={colors.primary} />
              <Text style={[tw('text-2xs font-semibold'), { color: colors.textMuted }]}>
                Target: {API_ROUTES.LOGIN}
              </Text>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleLogin}
              disabled={loading}
              style={[
                tw('h-13 rounded-2xl flex-row items-center justify-center gap-2.5 mt-3 shadow-lg'),
                {
                  backgroundColor: colors.primary,
                  opacity: loading ? 0.75 : 1,
                },
              ]}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <MaterialCommunityIcons name="login-variant" size={20} color="#FFFFFF" />
                  <Text style={tw('text-base font-bold text-white tracking-wide')}>
                    Sign In
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* Switch to Sign Up */}
            <View style={tw('flex-row items-center justify-center gap-1.5 mt-2')}>
              <Text style={[tw('text-xs font-medium'), { color: colors.textSecondary }]}>
                Need a new account?
              </Text>
              <TouchableOpacity onPress={() => setAuthMode('signup')}>
                <Text style={[tw('text-xs font-bold'), { color: colors.primary }]}>
                  Sign Up Here
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* ================= SIGN UP TAB ================= */
          <View style={tw('gap-4 mb-6')}>
            {/* Full Name */}
            <View>
              <Text
                style={[
                  tw('text-xs font-bold uppercase mb-2 tracking-wider'),
                  { color: colors.textSecondary },
                ]}
              >
                Full Name
              </Text>
              <View
                style={[
                  tw('flex-row items-center h-13 px-4 rounded-2xl border'),
                  {
                    backgroundColor: colors.inputBackground,
                    borderColor: errors.fullName ? colors.danger : colors.inputBorder,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="badge-account-outline"
                  size={20}
                  color={errors.fullName ? colors.danger : colors.textMuted}
                  style={tw('mr-3')}
                />
                <TextInput
                  value={fullName}
                  onChangeText={(text) => {
                    setFullName(text);
                    if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: null }));
                  }}
                  placeholder="e.g. Avijit Mondal"
                  placeholderTextColor={colors.textMuted}
                  style={[tw('flex-1 text-sm font-medium'), { color: colors.text }]}
                />
              </View>
              {errors.fullName ? (
                <Text style={[tw('text-xs mt-1.5 font-medium'), { color: colors.danger }]}>
                  {errors.fullName}
                </Text>
              ) : null}
            </View>

            {/* Username */}
            <View>
              <Text
                style={[
                  tw('text-xs font-bold uppercase mb-2 tracking-wider'),
                  { color: colors.textSecondary },
                ]}
              >
                Username
              </Text>
              <View
                style={[
                  tw('flex-row items-center h-13 px-4 rounded-2xl border'),
                  {
                    backgroundColor: colors.inputBackground,
                    borderColor: errors.signupUsername ? colors.danger : colors.inputBorder,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="at"
                  size={20}
                  color={errors.signupUsername ? colors.danger : colors.textMuted}
                  style={tw('mr-3')}
                />
                <TextInput
                  value={signupUsername}
                  onChangeText={(text) => {
                    setSignupUsername(text);
                    if (errors.signupUsername) setErrors((prev) => ({ ...prev, signupUsername: null }));
                  }}
                  placeholder="e.g. avijit25"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={[tw('flex-1 text-sm font-medium'), { color: colors.text }]}
                />
              </View>
              {errors.signupUsername ? (
                <Text style={[tw('text-xs mt-1.5 font-medium'), { color: colors.danger }]}>
                  {errors.signupUsername}
                </Text>
              ) : null}
            </View>

            {/* Email */}
            <View>
              <Text
                style={[
                  tw('text-xs font-bold uppercase mb-2 tracking-wider'),
                  { color: colors.textSecondary },
                ]}
              >
                Email Address
              </Text>
              <View
                style={[
                  tw('flex-row items-center h-13 px-4 rounded-2xl border'),
                  {
                    backgroundColor: colors.inputBackground,
                    borderColor: errors.signupEmail ? colors.danger : colors.inputBorder,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="email-outline"
                  size={20}
                  color={errors.signupEmail ? colors.danger : colors.textMuted}
                  style={tw('mr-3')}
                />
                <TextInput
                  value={signupEmail}
                  onChangeText={(text) => {
                    setSignupEmail(text);
                    if (errors.signupEmail) setErrors((prev) => ({ ...prev, signupEmail: null }));
                  }}
                  placeholder="e.g. avijit@gmail.com"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={[tw('flex-1 text-sm font-medium'), { color: colors.text }]}
                />
              </View>
              {errors.signupEmail ? (
                <Text style={[tw('text-xs mt-1.5 font-medium'), { color: colors.danger }]}>
                  {errors.signupEmail}
                </Text>
              ) : null}
            </View>

            {/* Password */}
            <View>
              <Text
                style={[
                  tw('text-xs font-bold uppercase mb-2 tracking-wider'),
                  { color: colors.textSecondary },
                ]}
              >
                Password
              </Text>
              <View
                style={[
                  tw('flex-row items-center h-13 px-4 rounded-2xl border'),
                  {
                    backgroundColor: colors.inputBackground,
                    borderColor: errors.signupPassword ? colors.danger : colors.inputBorder,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="lock-outline"
                  size={20}
                  color={errors.signupPassword ? colors.danger : colors.textMuted}
                  style={tw('mr-3')}
                />
                <TextInput
                  value={signupPassword}
                  onChangeText={(text) => {
                    setSignupPassword(text);
                    if (errors.signupPassword) setErrors((prev) => ({ ...prev, signupPassword: null }));
                  }}
                  placeholder="Minimum 4 characters"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry={!showSignupPassword}
                  autoCapitalize="none"
                  style={[tw('flex-1 text-sm font-medium'), { color: colors.text }]}
                />
                <TouchableOpacity
                  onPress={() => setShowSignupPassword(!showSignupPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <MaterialCommunityIcons
                    name={showSignupPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={colors.textMuted}
                  />
                </TouchableOpacity>
              </View>
              {errors.signupPassword ? (
                <Text style={[tw('text-xs mt-1.5 font-medium'), { color: colors.danger }]}>
                  {errors.signupPassword}
                </Text>
              ) : null}
            </View>

            {/* Role Selection */}
            <View>
              <Text
                style={[
                  tw('text-xs font-bold uppercase mb-2 tracking-wider'),
                  { color: colors.textSecondary },
                ]}
              >
                Account Role
              </Text>
              <View style={tw('flex-row gap-2')}>
                {[
                  { role: 'admin', label: 'Admin', icon: 'shield-crown' },
                  { role: 'manager', label: 'Manager', icon: 'store-cog' },
                  { role: 'salesman', label: 'Sales', icon: 'point-of-sale' },
                  { role: 'customer', label: 'Customer', icon: 'account-heart' },
                ].map((item) => {
                  const isSelected = signupRole === item.role;
                  return (
                    <TouchableOpacity
                      key={item.role}
                      activeOpacity={0.8}
                      onPress={() => setSignupRole(item.role)}
                      style={[
                        tw('flex-1 py-2 px-1 rounded-xl border items-center justify-center gap-1'),
                        {
                          backgroundColor: isSelected ? `${colors.primary}20` : colors.surfaceElevated,
                          borderColor: isSelected ? colors.primary : colors.border,
                        },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={item.icon}
                        size={16}
                        color={isSelected ? colors.primary : colors.textMuted}
                      />
                      <Text
                        style={[
                          tw('text-2xs font-bold'),
                          { color: isSelected ? colors.primary : colors.textSecondary },
                        ]}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Sign Up Submit Button */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleSignUp}
              disabled={loading}
              style={[
                tw('h-13 rounded-2xl flex-row items-center justify-center gap-2.5 mt-3 shadow-lg'),
                {
                  backgroundColor: colors.primary,
                  opacity: loading ? 0.75 : 1,
                },
              ]}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <MaterialCommunityIcons name="account-check" size={20} color="#FFFFFF" />
                  <Text style={tw('text-base font-bold text-white tracking-wide')}>
                    Register Account
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* Switch to Sign In */}
            <View style={tw('flex-row items-center justify-center gap-1.5 mt-2')}>
              <Text style={[tw('text-xs font-medium'), { color: colors.textSecondary }]}>
                Already have an account?
              </Text>
              <TouchableOpacity onPress={() => setAuthMode('signin')}>
                <Text style={[tw('text-xs font-bold'), { color: colors.primary }]}>
                  Sign In Here
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Footer info */}
        <View style={tw('items-center mt-4')}>
          <Text style={[tw('text-xs font-medium text-center'), { color: colors.textMuted }]}>
            Connected directly to backend server • Port 5000
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
