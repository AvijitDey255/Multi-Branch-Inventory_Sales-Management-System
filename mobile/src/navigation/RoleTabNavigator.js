import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { ROLES } from '../constants/roles';
import { getThemeColors } from '../constants/colors';

// Screens
import AdminHomeScreen from '../screens/admin/AdminHomeScreen';
import AdminProductsScreen from '../screens/admin/AdminProductsScreen';
import BranchHomeScreen from '../screens/branch/BranchHomeScreen';
import BranchProductsScreen from '../screens/branch/BranchProductsScreen';
import BranchOrdersScreen from '../screens/branch/BranchOrdersScreen';
import SalesmanHomeScreen from '../screens/salesman/SalesmanHomeScreen';
import CustomersScreen from '../screens/salesman/CustomersScreen';
import SalesmanOrdersScreen from '../screens/salesman/SalesmanOrdersScreen';
import MoreScreen from '../screens/shared/MoreScreen';

// Custom Animated Left-to-Right Sidebar
import CustomSidebar from '../components/CustomSidebar';

const Tab = createBottomTabNavigator();

const RoleTabNavigator = ({ navigation }) => {
  const { user } = useSelector((state) => state.auth);
  const { theme } = useSelector((state) => state.ui);
  const role = (user?.role || ROLES.ADMIN).toUpperCase();
  const colors = getThemeColors(theme);

  const getScreenOptions = ({ route }) => ({
    headerShown: false,
    tabBarActiveTintColor: colors.primary,
    tabBarInactiveTintColor: colors.textMuted,
    tabBarStyle: {
      backgroundColor: colors.surface,
      borderTopColor: colors.border,
      borderTopWidth: 1,
      height: 62,
      paddingBottom: 8,
      paddingTop: 8,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 6,
    },
    tabBarLabelStyle: {
      fontSize: 11,
      fontWeight: '700',
    },
    tabBarIcon: ({ focused, color, size }) => {
      let iconName;

      switch (route.name) {
        case 'Home':
          iconName = focused ? 'home' : 'home-outline';
          break;
        case 'Products':
          iconName = focused ? 'cube' : 'cube-outline';
          break;
        case 'Customer':
          iconName = focused ? 'people' : 'people-outline';
          break;
        case 'Order':
          iconName = focused ? 'receipt' : 'receipt-outline';
          break;
        case 'More':
          iconName = focused ? 'grid' : 'grid-outline';
          break;
        default:
          iconName = 'ellipse-outline';
      }

      return <Ionicons name={iconName} size={22} color={color} />;
    },
  });

  return (
    <View style={styles.container}>
      {/* Dynamic Role-Based Bottom Navigation */}
      <Tab.Navigator screenOptions={getScreenOptions}>
        {/* ROLE 1: ADMIN -> Home, Products, More */}
        {role === ROLES.ADMIN && (
          <>
            <Tab.Screen
              name="Home"
              component={AdminHomeScreen}
              options={{ tabBarLabel: 'Home' }}
            />
            <Tab.Screen
              name="Products"
              component={AdminProductsScreen}
              options={{ tabBarLabel: 'Products' }}
            />
            <Tab.Screen
              name="More"
              component={MoreScreen}
              options={{ tabBarLabel: 'More' }}
            />
          </>
        )}

        {/* ROLE 2: BRANCH_MANAGER -> Home, Products, Order, More */}
        {role === ROLES.BRANCH_MANAGER && (
          <>
            <Tab.Screen
              name="Home"
              component={BranchHomeScreen}
              options={{ tabBarLabel: 'Home' }}
            />
            <Tab.Screen
              name="Products"
              component={BranchProductsScreen}
              options={{ tabBarLabel: 'Products' }}
            />
            <Tab.Screen
              name="Order"
              component={BranchOrdersScreen}
              options={{ tabBarLabel: 'Order' }}
            />
            <Tab.Screen
              name="More"
              component={MoreScreen}
              options={{ tabBarLabel: 'More' }}
            />
          </>
        )}

        {/* ROLE 3: SALESMAN -> Home, Customer, Order, More */}
        {role === ROLES.SALESMAN && (
          <>
            <Tab.Screen
              name="Home"
              component={SalesmanHomeScreen}
              options={{ tabBarLabel: 'Home' }}
            />
            <Tab.Screen
              name="Customer"
              component={CustomersScreen}
              options={{ tabBarLabel: 'Customer' }}
            />
            <Tab.Screen
              name="Order"
              component={SalesmanOrdersScreen}
              options={{ tabBarLabel: 'Order' }}
            />
            <Tab.Screen
              name="More"
              component={MoreScreen}
              options={{ tabBarLabel: 'More' }}
            />
          </>
        )}

        {/* ROLE 4: CUSTOMER -> Home, Order, More */}
        {role === ROLES.CUSTOMER && (
          <>
            <Tab.Screen
              name="Home"
              component={AdminProductsScreen}
              options={{ tabBarLabel: 'Catalog' }}
            />
            <Tab.Screen
              name="Order"
              component={BranchOrdersScreen}
              options={{ tabBarLabel: 'My Orders' }}
            />
            <Tab.Screen
              name="More"
              component={MoreScreen}
              options={{ tabBarLabel: 'More' }}
            />
          </>
        )}
      </Tab.Navigator>

      {/* Global Animated Left-to-Right Sidebar Drawer */}
      <CustomSidebar navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
});

export default RoleTabNavigator;

