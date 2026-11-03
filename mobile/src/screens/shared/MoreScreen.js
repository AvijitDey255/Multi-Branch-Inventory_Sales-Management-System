import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Header from '../../components/Header';
import { logoutUser } from '../../redux/slices/authSlice';
import { toggleTheme } from '../../redux/slices/uiSlice';
import { getThemeColors } from '../../constants/colors';
import { ROLES, ROLE_CONFIG } from '../../constants/roles';
import { BASE_URL } from '../../constants/config';

const MoreScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const { user } = useSelector((state) => state.auth);
  const { activeBranch, theme } = useSelector((state) => state.ui);

  const role = (user?.role || ROLES.ADMIN).toUpperCase();
  const isDark = theme === 'dark';
  const colors = getThemeColors(theme);

  // Active detail modal state
  const [activeModal, setActiveModal] = useState(null);

  const roleConfig = (user?.role && ROLE_CONFIG[user.role]) || {
    badgeText: user?.role || 'STAFF',
    color: colors.primary,
    bgColor: colors.primaryMuted,
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to end your current session?',
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

  // ================= ADMIN NAVIGATION ITEMS =================
  // manager, branch, products, category, variants, busness, setting, profile
  const ADMIN_SHORTCUTS = [
    {
      id: 'manager',
      label: 'Manager',
      icon: 'people',
      color: '#6366F1',
      bg: isDark ? '#1E1B4B' : '#EEF2FF',
      action: () => navigation.navigate('Manager'),
    },
    {
      id: 'branch',
      label: 'Branch',
      icon: 'business',
      color: '#0D9488',
      bg: isDark ? '#134E4A' : '#F0FDFA',
      action: () => navigation.navigate('Branch'),
    },
    {
      id: 'products',
      label: 'Products',
      icon: 'cube',
      color: '#2563EB',
      bg: isDark ? '#1E293B' : '#EFF6FF',
      action: () => navigation.navigate('Products'),
    },
    {
      id: 'category',
      label: 'Category',
      icon: 'grid',
      color: '#8B5CF6',
      bg: isDark ? '#2E1065' : '#F5F3FF',
      action: () => navigation.navigate('Category'),
    },
    {
      id: 'variants',
      label: 'Variants',
      icon: 'options',
      color: '#EA580C',
      bg: isDark ? '#431407' : '#FFF7ED',
      action: () => navigation.navigate('Variants'),
    },
    { id: 'business', label: 'Business', icon: 'storefront', color: '#D97706', bg: isDark ? '#451A03' : '#FEF3C7', action: () => setActiveModal('business') },
    { id: 'setting', label: 'Setting', icon: 'settings', color: '#475569', bg: isDark ? '#1E293B' : '#F1F5F9', action: () => setActiveModal('setting') },
    { id: 'profile', label: 'Profile', icon: 'person', color: colors.primary, bg: colors.primaryMuted, action: () => navigation.navigate('Profile') },
  ];

  // ================= BRANCH MANAGER NAVIGATION ITEMS =================
  // product, salesman, customer, order, invoice, salestarget
  const BRANCH_MANAGER_SHORTCUTS = [
    {
      id: 'product',
      label: 'Product',
      icon: 'cube',
      color: '#0D9488',
      bg: isDark ? '#134E4A' : '#F0FDFA',
      action: () => {
        try { navigation.navigate('Products'); } catch { setActiveModal('products'); }
      },
    },
    { id: 'salesman', label: 'Salesman', icon: 'people', color: '#EA580C', bg: isDark ? '#431407' : '#FFF7ED', action: () => setActiveModal('salesman') },
    { id: 'customer', label: 'Customer', icon: 'person-add', color: '#2563EB', bg: isDark ? '#1E293B' : '#EFF6FF', action: () => setActiveModal('customer') },
    {
      id: 'order',
      label: 'Order',
      icon: 'receipt',
      color: '#6366F1',
      bg: isDark ? '#1E1B4B' : '#EEF2FF',
      action: () => {
        try { navigation.navigate('Order'); } catch { setActiveModal('order'); }
      },
    },
    { id: 'invoice', label: 'Invoice', icon: 'document-text', color: '#10B981', bg: isDark ? '#064E3B' : '#ECFDF5', action: () => setActiveModal('invoice') },
    { id: 'salestarget', label: 'Sales Target', icon: 'trending-up', color: '#D97706', bg: isDark ? '#451A03' : '#FEF3C7', action: () => setActiveModal('salestarget') },
    { id: 'setting', label: 'Setting', icon: 'settings', color: '#475569', bg: isDark ? '#1E293B' : '#F1F5F9', action: () => setActiveModal('setting') },
    { id: 'profile', label: 'Profile', icon: 'person', color: colors.primary, bg: colors.primaryMuted, action: () => navigation.navigate('Profile') },
  ];

  // Pick active shortcuts depending on role
  const isBranchMgr = role === ROLES.BRANCH_MANAGER;
  const currentShortcuts = isBranchMgr ? BRANCH_MANAGER_SHORTCUTS : ADMIN_SHORTCUTS;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="More Menu" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* User Details Card (Confirmed OK) */}
        <TouchableOpacity
          style={[styles.profileCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => navigation.navigate('Profile')}
          activeOpacity={0.8}
        >
          <View style={styles.profileTop}>
            <View style={[styles.avatarCircle, { backgroundColor: colors.primaryMuted, borderColor: roleConfig.color }]}>
              <Ionicons name="person" size={32} color={colors.primary} />
            </View>
            <View style={styles.profileDetails}>
              <Text style={[styles.profileName, { color: colors.textPrimary }]}>
                {user?.fullname || 'avijit dey'}
              </Text>
              <Text style={[styles.profileUsername, { color: colors.textSecondary }]}>
                @{user?.username || 'avijit255'}
              </Text>
              <Text style={[styles.profileEmail, { color: colors.textMuted }]}>
                {user?.email || 'avijit25@gmail.com'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </View>

          <View style={styles.profileBottomRow}>
            <View
              style={[
                styles.roleTag,
                { backgroundColor: roleConfig.bgColor, borderColor: roleConfig.color },
              ]}
            >
              <Ionicons name="shield-checkmark" size={13} color={roleConfig.color} />
              <Text style={[styles.roleTagText, { color: roleConfig.color }]}>
                {roleConfig.badgeText}
              </Text>
            </View>

            <View style={styles.branchPill}>
              <Ionicons name="business-outline" size={12} color={colors.textSecondary} />
              <Text style={[styles.branchPillText, { color: colors.textSecondary }]} numberOfLines={1}>
                {activeBranch}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Quick Navigation Menu Grid (Role Based) */}
        <View style={styles.gridContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionHeader, { color: colors.textMuted }]}>
              {isBranchMgr ? 'BRANCH MANAGER OPERATIONS' : 'ADMINISTRATOR NAVIGATION'}
            </Text>
            <Text style={[styles.sectionSubtitle, { color: colors.primary }]}>
              {isBranchMgr ? 'Branch Portal' : 'Master Control'}
            </Text>
          </View>

          <View style={styles.shortcutsGrid}>
            {currentShortcuts.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.shortcutBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={item.action}
                activeOpacity={0.7}
              >
                <View style={[styles.shortcutIconWrap, { backgroundColor: item.bg }]}>
                  <Ionicons name={item.icon} size={22} color={item.color} />
                </View>
                <Text
                  style={[styles.shortcutLabel, { color: colors.textPrimary }]}
                  numberOfLines={1}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Detailed Item Rows */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: colors.textMuted }]}>DETAILED OPERATIONS</Text>
          <View style={[styles.cardGroup, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {currentShortcuts.map((item, idx) => (
              <View key={item.id}>
                <TouchableOpacity
                  style={styles.menuRow}
                  onPress={item.action}
                  activeOpacity={0.7}
                >
                  <View style={[styles.rowIcon, { backgroundColor: item.bg }]}>
                    <Ionicons name={item.icon} size={20} color={item.color} />
                  </View>
                  <View style={styles.rowMain}>
                    <Text style={[styles.rowTitle, { color: colors.textPrimary }]}>
                      {item.label}
                    </Text>
                    <Text style={[styles.rowSubtitle, { color: colors.textMuted }]}>
                      {isBranchMgr
                        ? `Manage branch ${item.label.toLowerCase()} records`
                        : `System master ${item.label.toLowerCase()} control`}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                </TouchableOpacity>
                {idx < currentShortcuts.length - 1 && (
                  <View style={[styles.innerDivider, { backgroundColor: colors.border }]} />
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Appearance Mode Toggle */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: colors.textMuted }]}>APPEARANCE</Text>
          <View style={[styles.themeCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.rowIcon, { backgroundColor: isDark ? '#1E293B' : '#FEF3C7' }]}>
              <Ionicons
                name={isDark ? 'sunny' : 'moon'}
                size={20}
                color={isDark ? '#FBBF24' : '#D97706'}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.rowTitle, { color: colors.textPrimary }]}>Dark Theme</Text>
              <Text style={[styles.rowSubtitle, { color: colors.textMuted }]}>
                {isDark ? 'Dark mode enabled' : 'Light mode enabled'}
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={() => dispatch(toggleTheme())}
              thumbColor={isDark ? colors.primary : '#FFFFFF'}
              trackColor={{ false: colors.border, true: colors.primaryMuted }}
            />
          </View>
        </View>

        {/* Sign Out Action */}
        <TouchableOpacity
          style={[styles.logoutRow, { backgroundColor: colors.dangerLight, borderColor: '#FECACA' }]}
          onPress={handleSignOut}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.danger} />
          <Text style={[styles.logoutRowText, { color: colors.danger }]}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={[styles.buildInfo, { color: colors.textMuted }]}>
          Multi-Branch Inventory & POS v1.0.0
        </Text>
      </ScrollView>

      {/* ================= DETAIL MODALS FOR ALL ACTIONS ================= */}

      {/* 1. Manager Modal (Admin) */}
      <Modal visible={activeModal === 'manager'} animationType="slide" transparent onRequestClose={() => setActiveModal(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Managers & Administrators</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {[
                { name: 'Robert Chen', role: 'Head Admin', branch: 'Main Central Hub', status: 'Active' },
                { name: 'Sarah Jenkins', role: 'Branch Manager', branch: 'North Metro Outlet', status: 'Active' },
                { name: 'Marcus Vance', role: 'Operations Lead', branch: 'East Bay Retail', status: 'Active' },
                { name: 'Emily Watson', role: 'Branch Manager', branch: 'South Suburban', status: 'Active' },
              ].map((m, i) => (
                <View key={i} style={[styles.modalItem, { borderColor: colors.border }]}>
                  <View style={[styles.itemAvatar, { backgroundColor: colors.primaryMuted }]}>
                    <Text style={{ fontWeight: '800', color: colors.primary }}>{m.name.substring(0, 2).toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={[styles.itemTitle, { color: colors.textPrimary }]}>{m.name}</Text>
                    <Text style={{ fontSize: 12, color: colors.textSecondary }}>{m.role} • {m.branch}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: colors.successLight }]}>
                    <Text style={{ fontSize: 10, fontWeight: '700', color: colors.success }}>{m.status}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 2. Branch Modal (Admin) */}
      <Modal visible={activeModal === 'branch'} animationType="slide" transparent onRequestClose={() => setActiveModal(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Branch Locations Network</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {[
                { name: 'Main Central Hub', location: '100 Industrial Blvd, Central', stock: '94% Stock', mgr: 'Robert Chen' },
                { name: 'North Metro Outlet', location: '42 Commercial Square, North', stock: '68% Stock', mgr: 'Sarah Jenkins' },
                { name: 'East Bay Retail', location: '88 Harborview Way, East Bay', stock: '88% Stock', mgr: 'Marcus Vance' },
                { name: 'South Suburban Branch', location: '15 Highline Road, South District', stock: '52% Stock', mgr: 'Emily Watson' },
              ].map((b, i) => (
                <View key={i} style={[styles.modalItem, { borderColor: colors.border }]}>
                  <Ionicons name="business" size={24} color={colors.accent} style={{ marginRight: 10 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.itemTitle, { color: colors.textPrimary }]}>{b.name}</Text>
                    <Text style={{ fontSize: 12, color: colors.textSecondary }}>{b.location}</Text>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: colors.primary, marginTop: 2 }}>{b.stock} • Mgr: {b.mgr}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 3. Category Modal (Admin) */}
      <Modal visible={activeModal === 'category'} animationType="slide" transparent onRequestClose={() => setActiveModal(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Product Categories</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {[
                { name: 'Hardware & Tools', items: '342 Items', icon: 'hammer-outline' },
                { name: 'Electronics & POS', items: '185 Items', icon: 'hardware-chip-outline' },
                { name: 'Retail Packaging & Rolls', items: '420 Items', icon: 'newspaper-outline' },
                { name: 'Barcode & RFID Scanners', items: '98 Items', icon: 'barcode-outline' },
                { name: 'Office Supplies & Paper', items: '375 Items', icon: 'document-text-outline' },
              ].map((c, i) => (
                <View key={i} style={[styles.modalItem, { borderColor: colors.border }]}>
                  <View style={[styles.itemAvatar, { backgroundColor: '#F5F3FF' }]}>
                    <Ionicons name={c.icon} size={20} color="#8B5CF6" />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.itemTitle, { color: colors.textPrimary }]}>{c.name}</Text>
                    <Text style={{ fontSize: 12, color: colors.textSecondary }}>{c.items}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 4. Variants Modal (Admin) */}
      <Modal visible={activeModal === 'variants'} animationType="slide" transparent onRequestClose={() => setActiveModal(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Product Variants & Attributes</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {[
                { name: 'Scanner Connectivity', options: 'USB Wired / Bluetooth Wireless 2.4G' },
                { name: 'Paper Roll Size', options: '80mm x 70m / 58mm x 40m' },
                { name: 'Cash Drawer Form Factor', options: '16-Inch Heavy / 13-Inch Compact' },
                { name: 'RFID Frequency', options: '860-960 MHz UHF / 13.56 MHz HF' },
              ].map((v, i) => (
                <View key={i} style={[styles.modalItem, { borderColor: colors.border }]}>
                  <Ionicons name="options-outline" size={22} color="#EA580C" style={{ marginRight: 10 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.itemTitle, { color: colors.textPrimary }]}>{v.name}</Text>
                    <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>{v.options}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 5. Business Modal (Admin) */}
      <Modal visible={activeModal === 'business'} animationType="slide" transparent onRequestClose={() => setActiveModal(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Business Profile</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={[styles.modalItem, { borderColor: colors.border }]}>
                <Ionicons name="storefront" size={22} color="#D97706" style={{ marginRight: 10 }} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.itemTitle, { color: colors.textPrimary }]}>Multi-Branch Retail Corp</Text>
                  <Text style={{ fontSize: 12, color: colors.textSecondary }}>GST/VAT: 29AABCU9603R1ZX</Text>
                  <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>Fiscal Year: 2026-2027 • USD ($)</Text>
                  <Text style={{ fontSize: 12, color: colors.primary, marginTop: 4 }}>Backend: {BASE_URL}</Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 6. Settings Modal */}
      <Modal visible={activeModal === 'setting'} animationType="slide" transparent onRequestClose={() => setActiveModal(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>System & POS Hardware</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {[
                { name: 'Thermal Bluetooth Printer', desc: '80mm ESC/POS Ready', status: 'Connected' },
                { name: 'Integrated Barcode Scanner', desc: '1D / 2D QR Code Decoder', status: 'Ready' },
                { name: 'Offline Storage Cache', desc: '1,420 items cached locally', status: 'Synced' },
              ].map((s, i) => (
                <View key={i} style={[styles.modalItem, { borderColor: colors.border }]}>
                  <Ionicons name="hardware-chip-outline" size={22} color={colors.primary} style={{ marginRight: 10 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.itemTitle, { color: colors.textPrimary }]}>{s.name}</Text>
                    <Text style={{ fontSize: 12, color: colors.textSecondary }}>{s.desc}</Text>
                  </View>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: colors.success }}>{s.status}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 7. Salesman Modal (Branch Manager) */}
      <Modal visible={activeModal === 'salesman'} animationType="slide" transparent onRequestClose={() => setActiveModal(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Branch Sales Representatives</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {[
                { name: 'Alex Rivera', id: 'SALES-01', salesToday: '$1,840.00', target: '74% Reached', status: 'Counter 1' },
                { name: 'David Miller', id: 'SALES-02', salesToday: '$1,420.50', target: '57% Reached', status: 'Counter 2' },
                { name: 'Sophia Chen', id: 'SALES-03', salesToday: '$1,950.00', target: '78% Reached', status: 'Floor' },
                { name: 'Lucas Scott', id: 'SALES-04', salesToday: '$980.00', target: '39% Reached', status: 'Field' },
              ].map((s, i) => (
                <View key={i} style={[styles.modalItem, { borderColor: colors.border }]}>
                  <View style={[styles.itemAvatar, { backgroundColor: '#FFF7ED' }]}>
                    <Text style={{ fontWeight: '800', color: '#EA580C' }}>{s.name.substring(0, 2).toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={[styles.itemTitle, { color: colors.textPrimary }]}>{s.name}</Text>
                    <Text style={{ fontSize: 12, color: colors.textSecondary }}>{s.id} • {s.status}</Text>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: colors.primary, marginTop: 2 }}>
                      Today: {s.salesToday} ({s.target})
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 8. Customer Modal (Branch Manager) */}
      <Modal visible={activeModal === 'customer'} animationType="slide" transparent onRequestClose={() => setActiveModal(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Branch Customers</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {[
                { name: 'Apex Logistics Inc.', contact: 'Michael Scott', phone: '+1 555-234-8900', total: '$8,450.00' },
                { name: 'Delta Retail Mart', contact: 'Dwight Schrute', phone: '+1 555-789-1234', total: '$4,120.00' },
                { name: 'Sunrise Grocers', contact: 'Pam Beesly', phone: '+1 555-345-6789', total: '$2,310.00' },
                { name: 'Metro Hardware Hub', contact: 'Jim Halpert', phone: '+1 555-901-2345', total: '$14,890.00' },
              ].map((c, i) => (
                <View key={i} style={[styles.modalItem, { borderColor: colors.border }]}>
                  <View style={[styles.itemAvatar, { backgroundColor: '#EFF6FF' }]}>
                    <Ionicons name="person" size={18} color="#2563EB" />
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={[styles.itemTitle, { color: colors.textPrimary }]}>{c.name}</Text>
                    <Text style={{ fontSize: 12, color: colors.textSecondary }}>Attn: {c.contact} • {c.phone}</Text>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: colors.primary, marginTop: 2 }}>Total Purchases: {c.total}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 9. Invoice Modal (Branch Manager) */}
      <Modal visible={activeModal === 'invoice'} animationType="slide" transparent onRequestClose={() => setActiveModal(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Branch Invoices & Billing</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {[
                { id: 'INV-4099', customer: 'Global Office Supplies', amount: '$420.00', method: 'Card', status: 'Paid' },
                { id: 'INV-4098', customer: 'Apex Logistics Inc.', amount: '$149.99', method: 'Cash', status: 'Paid' },
                { id: 'INV-4097', customer: 'Walk-in Retail Buyer', amount: '$89.50', method: 'UPI', status: 'Paid' },
                { id: 'INV-4096', customer: 'Metro Hardware Hub', amount: '$890.00', method: 'Credit', status: 'Pending' },
              ].map((inv, i) => (
                <View key={i} style={[styles.modalItem, { borderColor: colors.border }]}>
                  <Ionicons name="document-text-outline" size={22} color="#10B981" style={{ marginRight: 10 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.itemTitle, { color: colors.textPrimary }]}>{inv.id} • {inv.customer}</Text>
                    <Text style={{ fontSize: 12, color: colors.textSecondary }}>{inv.method} Payment</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 14, fontWeight: '800', color: colors.textPrimary }}>{inv.amount}</Text>
                    <Text style={{ fontSize: 10, fontWeight: '700', color: inv.status === 'Paid' ? colors.success : colors.warning }}>{inv.status}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 10. Sales Target Modal (Branch Manager) */}
      <Modal visible={activeModal === 'salestarget'} animationType="slide" transparent onRequestClose={() => setActiveModal(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Branch Sales Targets & Quotas</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={[styles.modalItem, { borderColor: colors.border, flexDirection: 'column', alignItems: 'stretch' }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Text style={[styles.itemTitle, { color: colors.textPrimary }]}>Monthly Branch Target</Text>
                  <Text style={{ fontSize: 14, fontWeight: '800', color: colors.primary }}>$50,000.00</Text>
                </View>
                <View style={{ height: 8, backgroundColor: colors.surfaceAlt, borderRadius: 4, overflow: 'hidden', marginVertical: 6 }}>
                  <View style={{ width: '74%', height: '100%', backgroundColor: colors.primary, borderRadius: 4 }} />
                </View>
                <Text style={{ fontSize: 12, color: colors.textSecondary }}>Current Sales: $37,190.50 (74.3% Achieved)</Text>
              </View>

              <View style={[styles.modalItem, { borderColor: colors.border, flexDirection: 'column', alignItems: 'stretch' }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Text style={[styles.itemTitle, { color: colors.textPrimary }]}>Today's Target</Text>
                  <Text style={{ fontSize: 14, fontWeight: '800', color: '#10B981' }}>$4,500.00</Text>
                </View>
                <View style={{ height: 8, backgroundColor: colors.surfaceAlt, borderRadius: 4, overflow: 'hidden', marginVertical: 6 }}>
                  <View style={{ width: '88%', height: '100%', backgroundColor: '#10B981', borderRadius: 4 }} />
                </View>
                <Text style={{ fontSize: 12, color: colors.textSecondary }}>Current: $3,960.00 (88% Achieved)</Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  profileCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  profileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    marginRight: 12,
  },
  profileDetails: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '800',
  },
  profileUsername: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 1,
  },
  profileEmail: {
    fontSize: 12,
    marginTop: 2,
  },
  profileBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(150, 150, 150, 0.2)',
  },
  roleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  roleTagText: {
    fontSize: 10,
    fontWeight: '800',
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  branchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '55%',
  },
  branchPillText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  gridContainer: {
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  sectionSubtitle: {
    fontSize: 11,
    fontWeight: '700',
  },
  shortcutsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  shortcutBtn: {
    width: '22.5%',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: 14,
    borderWidth: 1,
  },
  shortcutIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  shortcutLabel: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  section: {
    marginBottom: 18,
  },
  cardGroup: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  rowIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rowMain: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  rowSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  innerDivider: {
    height: 1,
    marginLeft: 64,
  },
  themeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 10,
  },
  logoutRowText: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
  },
  buildInfo: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '75%',
    paddingBottom: 36,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150,150,150,0.2)',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  itemAvatar: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
});

export default MoreScreen;
