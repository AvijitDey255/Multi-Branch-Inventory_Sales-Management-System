import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Platform,
  useColorScheme,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Provider, useSelector, useDispatch } from 'react-redux';
import store from './src/store/store';
import { setTheme } from './src/store/themeSlice';
import { setCredentials, logout } from './src/store/authSlice';
import { getItem, StorageKeys, getCookie } from './src/utils/storage';
import { darkColors, lightColors } from './src/theme/colors';
import { getRoleTabs } from './src/utils/roles';
import { API_ROUTES } from './src/config/constants';

// Components
import Navbar from './src/components/Navbar';
import Sidebar from './src/components/Sidebar';
import BottomNav from './src/components/BottomNav';
import { Toaster } from './src/components/Toast';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import InvoicesScreen from './src/screens/InvoicesScreen';
import ProductsScreen from './src/screens/ProductsScreen';
import OrdersScreen from './src/screens/OrdersScreen';
import BillsScreen from './src/screens/BillsScreen';
import MyOrdersScreen from './src/screens/MyOrdersScreen';
import CustomersScreen from './src/screens/CustomersScreen';
import MoreScreen from './src/screens/MoreScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import CategoriesScreen from './src/screens/CategoriesScreen';
import VariantsScreen from './src/screens/VariantsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import BusinessScreen from './src/screens/BusinessScreen';
import BranchesScreen from './src/screens/BranchesScreen';
import SetTargetsScreen from './src/screens/SetTargetsScreen';
import SalesmenScreen from './src/screens/SalesmenScreen';
import TargetsAchievementScreen from './src/screens/TargetsAchievementScreen';
import SpecialOffersScreen from './src/screens/SpecialOffersScreen';
import AppInfoScreen from './src/screens/AppInfoScreen';
import CartScreen from './src/screens/CartScreen';
import UsersScreen from './src/screens/UsersScreen';

function MainApp() {
  const dispatch = useDispatch();
  const systemColorScheme = useColorScheme();
  const mode = useSelector((state) => state.theme.mode);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const user = useSelector((state) => state.auth.user);

  const [activeTab, setActiveTab] = useState('Home');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentRole = user?.role || 'admin';

  // Automatically reset to Home if the active tab is not valid for the switched role
  useEffect(() => {
    const validTabs = getRoleTabs(currentRole)
      .map((t) => t.key)
      .concat([
        'Profile',
        'Categories',
        'Variants',
        'Settings',
        'Business',
        'Branches',
        'SetTargets',
        'Salesmen',
        'TargetsAchievement',
        'SpecialOffers',
        'AppInfo',
        'Cart',
        'Users',
      ]);
    if (!validTabs.includes(activeTab)) {
      setActiveTab('Home');
    }
  }, [currentRole]);

  // Initialize theme from local storage (AsyncStorage)
  useEffect(() => {
    async function loadSavedTheme() {
      const savedTheme = await getItem(StorageKeys.THEME_MODE);
      if (savedTheme) {
        dispatch(setTheme(savedTheme));
      } else if (systemColorScheme) {
        dispatch(setTheme(systemColorScheme));
      }
    }
    loadSavedTheme();
  }, [dispatch, systemColorScheme]);

  // Restore authenticated session from cookie or storage using GET /api/auth/me
  useEffect(() => {
    async function restoreSession() {
      try {
        const tokenFromCookie = getCookie('token');
        const tokenFromStorage = await getItem(StorageKeys.AUTH_TOKEN);
        const token = tokenFromCookie || tokenFromStorage;

        if (!token) return;

        const response = await fetch(API_ROUTES.GET_ME, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
          credentials: 'include',
        });

        const data = await response.json().catch(() => ({}));

        if (response.ok && data.success && data.user) {
          dispatch(
            setCredentials({
              user: data.user,
              token: token,
            })
          );
        } else if (response.status === 401) {
          dispatch(logout());
        }
      } catch (err) {
        // Fallback to offline cached user if token exists
        const cachedUser = await getItem(StorageKeys.AUTH_USER, true);
        const token = (await getItem(StorageKeys.AUTH_TOKEN)) || getCookie('token');
        if (cachedUser && token) {
          dispatch(setCredentials({ user: cachedUser, token }));
        }
      }
    }

    restoreSession();
  }, [dispatch]);

  const isDark = mode === 'dark';
  const colors = isDark ? darkColors : lightColors;

  // Strict Unauthenticated Gate - cannot see internal app screens
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <Toaster />
        <View style={styles.webContainer}>
          <LoginScreen />
        </View>
      </SafeAreaView>
    );
  }

  // Render Authenticated Main App with Role-Specific Screens
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Toaster />

      <View style={styles.webContainer}>
        {/* Top Header Navbar */}
        <Navbar
          onOpenSidebar={() => setSidebarOpen(true)}
          onNavigateToProfile={() => setActiveTab('Profile')}
          onNavigateToCart={() => setActiveTab('Cart')}
        />

        {/* Sliding Sidebar Drawer */}
        <Sidebar
          visible={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeScreen={activeTab}
          onSelectScreen={(screen) => {
            setActiveTab(screen);
            setSidebarOpen(false);
          }}
        />

        {/* Dynamic Screen View according to activeTab */}
        <View style={styles.screenContainer}>
          {activeTab === 'Home' && <HomeScreen onNavigate={setActiveTab} />}
          {activeTab === 'Invoices' && <InvoicesScreen onNavigate={setActiveTab} />}
          {activeTab === 'Products' && <ProductsScreen onNavigate={setActiveTab} />}
          {activeTab === 'Orders' && <OrdersScreen onNavigate={setActiveTab} />}
          {activeTab === 'Bills' && <BillsScreen onNavigate={setActiveTab} />}
          {activeTab === 'My Orders' && <MyOrdersScreen onNavigate={setActiveTab} />}
          {activeTab === 'Customers' && <CustomersScreen onNavigate={setActiveTab} />}
          {activeTab === 'More' && <MoreScreen onNavigate={setActiveTab} />}
          {activeTab === 'Profile' && <ProfileScreen onNavigate={setActiveTab} />}
          {activeTab === 'Categories' && <CategoriesScreen onNavigate={setActiveTab} />}
          {activeTab === 'Variants' && <VariantsScreen onNavigate={setActiveTab} />}
          {activeTab === 'Settings' && <SettingsScreen onNavigate={setActiveTab} />}
          {activeTab === 'Business' && <BusinessScreen onNavigate={setActiveTab} />}
          {activeTab === 'Branches' && <BranchesScreen onNavigate={setActiveTab} />}
          {activeTab === 'SetTargets' && <SetTargetsScreen onNavigate={setActiveTab} />}
          {activeTab === 'Salesmen' && <SalesmenScreen onNavigate={setActiveTab} />}
          {activeTab === 'TargetsAchievement' && <TargetsAchievementScreen onNavigate={setActiveTab} />}
          {activeTab === 'SpecialOffers' && <SpecialOffersScreen onNavigate={setActiveTab} />}
          {activeTab === 'AppInfo' && <AppInfoScreen onNavigate={setActiveTab} />}
          {activeTab === 'Cart' && <CartScreen onNavigate={setActiveTab} />}
          {activeTab === 'Users' && <UsersScreen onNavigate={setActiveTab} />}
        </View>

        {/* Bottom Tab Navigation with Dynamic Role Permissions */}
        <BottomNav activeTab={activeTab} onTabPress={setActiveTab} />
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <MainApp />
      </SafeAreaProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  webContainer: {
    flex: 1,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 500 : undefined,
    alignSelf: 'center',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: Platform.OS === 'web' ? '0 10px 40px rgba(0,0,0,0.2)' : undefined,
  },
  screenContainer: {
    flex: 1,
  },
});
