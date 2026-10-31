import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { darkColors, lightColors } from '../theme/colors';
import { fetchUsers, setRoleFilter, setSearchQuery } from '../store/usersSlice';
import AddUserModal from '../components/AddUserModal';

const ROLE_THEMES = {
  admin: {
    label: 'ADMIN',
    icon: 'shield-crown',
    color: '#6366F1',
    bg: 'rgba(99, 102, 241, 0.12)',
  },
  manager: {
    label: 'MANAGER',
    icon: 'store',
    color: '#0EA5E9',
    bg: 'rgba(14, 165, 233, 0.12)',
  },
  salesman: {
    label: 'SALESMAN',
    icon: 'briefcase-account',
    color: '#10B981',
    bg: 'rgba(16, 185, 129, 0.12)',
  },
  customer: {
    label: 'CUSTOMER',
    icon: 'account',
    color: '#F59E0B',
    bg: 'rgba(245, 158, 11, 0.12)',
  },
};

export default function UsersScreen({ onNavigate }) {
  const dispatch = useDispatch();
  const mode = useSelector((state) => state.theme?.mode || 'dark');
  const isDark = mode === 'dark';
  const colors = isDark ? darkColors : lightColors;

  const { items: users, loading, refreshing, error, roleFilter, searchQuery } = useSelector(
    (state) => state.users
  );

  const [localSearch, setLocalSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const onRefresh = () => {
    dispatch(fetchUsers());
  };

  const handleSearchChange = (text) => {
    setLocalSearch(text);
    dispatch(setSearchQuery(text));
  };

  // Helper to extract branch name from any populated or nested field
  const getBranchName = (user) => {
    if (user.branch && typeof user.branch === 'object' && user.branch.name) {
      return user.branch.name;
    }
    if (user.branch_id && typeof user.branch_id === 'object' && user.branch_id.name) {
      return user.branch_id.name;
    }
    if (typeof user.branch === 'string' && user.branch) {
      return user.branch;
    }
    if (user.branchName) {
      return user.branchName;
    }
    return null;
  };

  // Statistics counts
  const stats = useMemo(() => {
    const total = users.length;
    const admins = users.filter((u) => u.role === 'admin').length;
    const managers = users.filter((u) => u.role === 'manager').length;
    const salesmen = users.filter((u) => u.role === 'salesman').length;
    const customers = users.filter((u) => u.role === 'customer').length;
    return { total, admins, managers, salesmen, customers };
  }, [users]);

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = localSearch.toLowerCase().trim();
      const branchName = getBranchName(u);

      const matchesSearch =
        !q ||
        u.name?.toLowerCase().includes(q) ||
        u.username?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.mobile?.toLowerCase().includes(q) ||
        u.phone?.toLowerCase().includes(q) ||
        u.role?.toLowerCase().includes(q) ||
        (branchName && branchName.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      if (roleFilter !== 'All' && u.role !== roleFilter) {
        return false;
      }

      return true;
    });
  }, [users, localSearch, roleFilter]);

  const filterTabs = [
    { key: 'All', label: 'All Users', count: stats.total, icon: 'account-group' },
    { key: 'admin', label: 'Admins', count: stats.admins, icon: 'shield-crown' },
    { key: 'manager', label: 'Managers', count: stats.managers, icon: 'store' },
    { key: 'salesman', label: 'Salesmen', count: stats.salesmen, icon: 'briefcase-account' },
    { key: 'customer', label: 'Customers', count: stats.customers, icon: 'account' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Header / Stats Section */}
      <View style={[styles.headerSection, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.headerTopRow}>
          <View>
            <View style={styles.titleWithBadge}>
              <Text style={[styles.screenTitle, { color: colors.text }]}>System Users</Text>
              <View style={[styles.countBadge, { backgroundColor: isDark ? '#1E293B' : '#EEF2FF' }]}>
                <View style={[styles.pulseDot, { backgroundColor: colors.primary }]} />
                <Text style={[styles.countBadgeText, { color: colors.primary }]}>
                  {stats.total} Registered
                </Text>
              </View>
            </View>
            <Text style={[styles.screenSub, { color: colors.textSecondary }]}>
              GET /api/users • User roles & permissions
            </Text>
          </View>

          <View style={styles.headerRightActions}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setIsAddModalOpen(true)}
              style={[styles.addUserHeaderBtn, { backgroundColor: colors.primary }]}
            >
              <MaterialCommunityIcons name="account-plus" size={16} color="#FFFFFF" />
              <Text style={styles.addUserHeaderBtnText}>Add User</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onRefresh}
              style={[styles.refreshIconBtn, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
            >
              <MaterialCommunityIcons name="refresh" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 4 Metric Cards */}
        <View style={styles.metricsRow}>
          <View style={[styles.metricCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
            <View style={[styles.metricIconWrap, { backgroundColor: 'rgba(99, 102, 241, 0.12)' }]}>
              <MaterialCommunityIcons name="shield-crown" size={16} color="#6366F1" />
            </View>
            <Text style={[styles.metricValue, { color: '#6366F1' }]}>{stats.admins}</Text>
            <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Admins</Text>
          </View>

          <View style={[styles.metricCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
            <View style={[styles.metricIconWrap, { backgroundColor: 'rgba(14, 165, 233, 0.12)' }]}>
              <MaterialCommunityIcons name="store" size={16} color="#0EA5E9" />
            </View>
            <Text style={[styles.metricValue, { color: '#0EA5E9' }]}>{stats.managers}</Text>
            <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Managers</Text>
          </View>

          <View style={[styles.metricCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
            <View style={[styles.metricIconWrap, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
              <MaterialCommunityIcons name="briefcase-account" size={16} color="#10B981" />
            </View>
            <Text style={[styles.metricValue, { color: '#10B981' }]}>{stats.salesmen}</Text>
            <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Salesmen</Text>
          </View>

          <View style={[styles.metricCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
            <View style={[styles.metricIconWrap, { backgroundColor: 'rgba(245, 158, 11, 0.12)' }]}>
              <MaterialCommunityIcons name="account" size={16} color="#F59E0B" />
            </View>
            <Text style={[styles.metricValue, { color: '#F59E0B' }]}>{stats.customers}</Text>
            <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Customers</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder }]}>
          <MaterialCommunityIcons name="magnify" size={20} color={colors.textMuted} />
          <TextInput
            value={localSearch}
            onChangeText={handleSearchChange}
            placeholder="Search by name, email, username, role, branch..."
            placeholderTextColor={colors.textMuted}
            style={[styles.searchInput, { color: colors.text }]}
          />
          {localSearch.length > 0 && (
            <TouchableOpacity onPress={() => handleSearchChange('')}>
              <MaterialCommunityIcons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Switcher Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterTabsWrap}>
          {filterTabs.map((tab) => {
            const isSelected = roleFilter === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                activeOpacity={0.7}
                onPress={() => dispatch(setRoleFilter(tab.key))}
                style={[
                  styles.filterTabPill,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.surfaceElevated,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name={tab.icon}
                  size={14}
                  color={isSelected ? '#FFFFFF' : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.filterTabLabel,
                    {
                      color: isSelected ? '#FFFFFF' : colors.textSecondary,
                      fontWeight: isSelected ? '700' : '600',
                    },
                  ]}
                >
                  {tab.label}
                </Text>
                <View
                  style={[
                    styles.tabCountBadge,
                    { backgroundColor: isSelected ? 'rgba(255,255,255,0.25)' : colors.badgeBg },
                  ]}
                >
                  <Text
                    style={[
                      styles.tabCountText,
                      { color: isSelected ? '#FFFFFF' : colors.textMuted },
                    ]}
                  >
                    {tab.count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Main Users List */}
      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading || refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        {loading && users.length === 0 ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading users from /api/users...</Text>
          </View>
        ) : error && users.length === 0 ? (
          <View style={[styles.emptyBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <MaterialCommunityIcons name="alert-circle-outline" size={48} color={colors.danger} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Failed to load users</Text>
            <Text style={[styles.emptySub, { color: colors.textSecondary }]}>{error}</Text>
            <TouchableOpacity onPress={onRefresh} style={[styles.resetBtn, { backgroundColor: colors.primary }]}>
              <Text style={styles.resetBtnText}>Retry Connection</Text>
            </TouchableOpacity>
          </View>
        ) : filteredUsers.length === 0 ? (
          <View style={[styles.emptyBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <MaterialCommunityIcons name="account-search-outline" size={48} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No users found</Text>
            <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
              {localSearch
                ? `No user matches "${localSearch}" in category "${roleFilter}".`
                : 'No users have been registered yet.'}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setLocalSearch('');
                dispatch(setRoleFilter('All'));
                dispatch(fetchUsers());
              }}
              style={[styles.resetBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.resetBtnText}>Reset Filter</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredUsers.map((item) => {
            const roleKey = item.role || 'customer';
            const roleMeta = ROLE_THEMES[roleKey] || ROLE_THEMES.customer;
            const branchName = getBranchName(item);
            const userPhone = item.mobile || item.phone;

            return (
              <View
                key={item._id || item.username || item.email}
                style={[
                  styles.userCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                {/* User Card Top Row */}
                <View style={styles.userCardHeader}>
                  <View style={styles.userCardHeaderLeft}>
                    {/* User Initials Avatar */}
                    <View
                      style={[
                        styles.userAvatar,
                        {
                          backgroundColor: roleMeta.bg,
                          borderColor: roleMeta.color,
                        },
                      ]}
                    >
                      <Text style={[styles.userAvatarText, { color: roleMeta.color }]}>
                        {(item.name || item.username || 'U')
                          .split(' ')
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join('')
                          .toUpperCase()}
                      </Text>
                    </View>

                    {/* Name & Username */}
                    <View style={styles.userNameBlock}>
                      <View style={styles.nameRow}>
                        <Text style={[styles.userName, { color: colors.text }]} numberOfLines={1}>
                          {item.name || 'Unnamed User'}
                        </Text>
                        {item.isActive !== false && (
                          <View style={styles.activeDot} />
                        )}
                      </View>
                      <Text style={[styles.userHandle, { color: colors.textSecondary }]}>
                        @{item.username || 'nousername'}
                      </Text>
                    </View>
                  </View>

                  {/* Role Badge */}
                  <View
                    style={[
                      styles.roleBadge,
                      {
                        backgroundColor: roleMeta.bg,
                        borderColor: roleMeta.color,
                      },
                    ]}
                  >
                    <MaterialCommunityIcons name={roleMeta.icon} size={13} color={roleMeta.color} />
                    <Text style={[styles.roleBadgeText, { color: roleMeta.color }]}>
                      {roleMeta.label}
                    </Text>
                  </View>
                </View>

                {/* Details Section */}
                <View style={[styles.detailsSection, { borderTopColor: colors.borderLight }]}>
                  {/* Email Row */}
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => item.email && Linking.openURL(`mailto:${item.email}`)}
                    style={styles.detailRow}
                  >
                    <MaterialCommunityIcons name="email-outline" size={16} color={colors.textMuted} />
                    <Text style={[styles.detailText, { color: colors.text }]} numberOfLines={1}>
                      {item.email || 'No email registered'}
                    </Text>
                  </TouchableOpacity>

                  {/* Branch Name Row */}
                  <View style={styles.detailRow}>
                    <MaterialCommunityIcons
                      name="storefront-outline"
                      size={16}
                      color={branchName ? '#10B981' : colors.textMuted}
                    />
                    <Text
                      style={[
                        styles.detailText,
                        { color: branchName ? colors.text : colors.textMuted },
                      ]}
                      numberOfLines={1}
                    >
                      {branchName ? `Branch: ${branchName}` : 'Branch: Corporate / Unassigned'}
                    </Text>
                  </View>

                  {/* Phone Row (if available) */}
                  {userPhone ? (
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => Linking.openURL(`tel:${userPhone}`)}
                      style={styles.detailRow}
                    >
                      <MaterialCommunityIcons name="phone-outline" size={16} color="#0EA5E9" />
                      <Text style={[styles.detailText, { color: colors.text }]}>
                        {userPhone}
                      </Text>
                    </TouchableOpacity>
                  ) : null}
                </View>

                {/* Card Quick Action Bar */}
                <View style={[styles.cardActionBar, { borderTopColor: colors.borderLight }]}>
                  {item.email ? (
                    <TouchableOpacity
                      onPress={() => Linking.openURL(`mailto:${item.email}`)}
                      style={[styles.actionBtn, { backgroundColor: colors.surfaceElevated }]}
                    >
                      <MaterialCommunityIcons name="email" size={14} color={colors.primary} />
                      <Text style={[styles.actionBtnText, { color: colors.primary }]}>Send Email</Text>
                    </TouchableOpacity>
                  ) : null}

                  {userPhone ? (
                    <TouchableOpacity
                      onPress={() => Linking.openURL(`tel:${userPhone}`)}
                      style={[styles.actionBtn, { backgroundColor: colors.surfaceElevated }]}
                    >
                      <MaterialCommunityIcons name="phone" size={14} color="#10B981" />
                      <Text style={[styles.actionBtnText, { color: '#10B981' }]}>Call</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Floating Action Button (FAB) for Add User */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => setIsAddModalOpen(true)}
        style={[styles.fabBtn, { backgroundColor: colors.primary }]}
      >
        <MaterialCommunityIcons name="account-plus" size={22} color="#FFFFFF" />
        <Text style={styles.fabBtnText}>Add User</Text>
      </TouchableOpacity>

      {/* Slide Bottom-to-Up Add User Modal */}
      <AddUserModal
        visible={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  titleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  countBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  countBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  screenSub: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addUserHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  addUserHeaderBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  refreshIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  metricCard: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  metricIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    marginBottom: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 0,
  },
  filterTabsWrap: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 4,
  },
  filterTabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterTabLabel: {
    fontSize: 12,
  },
  tabCountBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  tabCountText: {
    fontSize: 11,
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
    gap: 12,
  },
  loadingBox: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '500',
  },
  emptyBox: {
    padding: 30,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
  },
  emptySub: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
    lineHeight: 18,
  },
  resetBtn: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
  },
  resetBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  userCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  userCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userCardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    fontSize: 16,
    fontWeight: '800',
  },
  userNameBlock: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  userHandle: {
    fontSize: 12,
    marginTop: 1,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  detailsSection: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 10,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 13,
    flex: 1,
  },
  cardActionBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 10,
    marginTop: 8,
    gap: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '600',
  },
  fabBtn: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 28,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    zIndex: 99,
  },
  fabBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
