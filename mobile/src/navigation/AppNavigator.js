import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector, useDispatch } from 'react-redux';
import { restoreSession } from '../redux/slices/authSlice';
import { loadSavedTheme } from '../redux/slices/uiSlice';
import { colors } from '../constants/colors';

import LoginScreen from '../screens/auth/LoginScreen';
import RoleTabNavigator from './RoleTabNavigator';
import ProfileScreen from '../screens/shared/ProfileScreen';
import CategoryScreen from '../screens/admin/CategoryScreen';
import VariantsScreen from '../screens/admin/VariantsScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, isRestoringToken } = useSelector((state) => state.auth);

  useEffect(() => {
    // Attempt session restoration and saved theme restoration from AsyncStorage
    dispatch(restoreSession());
    dispatch(loadSavedTheme());
  }, [dispatch]);

  // Loading Splash Screen while checking local JWT token
  if (isRestoringToken) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Initializing Session...</Text>
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
      {!isAuthenticated ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        <>
          <Stack.Screen name="MainApp" component={RoleTabNavigator} />
          <Stack.Screen
            name="Profile"
            component={ProfileScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="Category"
            component={CategoryScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="Variants"
            component={VariantsScreen}
            options={{ animation: 'slide_from_right' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
  },
});

export default AppNavigator;
