import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Modal,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { darkColors, lightColors } from '../theme/colors';
import { fetchBranches, setFilter, setSearchQuery } from '../store/branchesSlice';
import AddBranchModal from '../components/AddBranchModal';

export default function BranchesScreen({ onNavigate }) {
  const dispatch = useDispatch();
  const mode = useSelector((state) => state.theme.mode);
  const { items: branches, loading, refreshing, error, fromLiveBackend, filter, searchQuery } = useSelector(
    (state) => state.branches
  );

  const isDark = mode === 'dark';
  const colors = isDark ? darkColors : lightColors;

  const [localSearch, setLocalSearch] = useState('');
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [showRawJson, setShowRawJson] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Fetch branches on mount
  useEffect(() => {
    dispatch(fetchBranches({ search: searchQuery }));
  }, [dispatch]);

  const onRefresh = () => {
    dispatch(fetchBranches({ search: localSearch }));
  };

  const handleSearchSubmit = (text) => {
    setLocalSearch(text);
    dispatch(setSearchQuery(text));
    dispatch(fetchBranches({ search: text }));
  };

  // Helper to extract manager from either manager or manager_id (both populated)
  const getBranchManager = (branch) => {
    if (branch.manager && typeof branch.manager === 'object') return branch.manager;
    if (branch.manager_id && typeof branch.manager_id === 'object') return branch.manager_id;
    return null;
  };

  // Filtered branches computed
  const filteredBranches = useMemo(() => {
    return branches.filter((branch) => {
      const manager = getBranchManager(branch);
      const q = localSearch.toLowerCase();

      // Search match
      const matchesSearch =
        !q ||
        branch.name?.toLowerCase().includes(q) ||
        branch.branchCode?.toLowerCase().includes(q) ||
        branch.address?.toLowerCase().includes(q) ||
        branch.phone?.toLowerCase().includes(q) ||
        (manager?.name && manager.name.toLowerCase().includes(q)) ||
        (manager?.username && manager.username.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      // Filter tabs match
      if (filter === 'Active') return branch.isActive === true;
      if (filter === 'Inactive') return branch.isActive === false;
      if (filter === 'WithManager') return manager !== null;
      if (filter === 'Unassigned') return manager === null;

      return true;
    });
  }, [branches, localSearch, filter]);

  // Statistics counts
  const stats = useMemo(() => {
    const total = branches.length;
    const active = branches.filter((b) => b.isActive).length;
    const withManager = branches.filter((b) => getBranchManager(b) !== null).length;
    const unassigned = total - withManager;
    const companyName = branches[0]?.company?.name || 'Apex Global';
    const companyCode = branches[0]?.company?.companyCode || '125';
    return { total, active, withManager, unassigned, companyName, companyCode };
  }, [branches]);

  const filterTabs = [
    { key: 'All', label: 'All', count: stats.total, icon: 'office-building' },
    { key: 'Active', label: 'Active', count: stats.active, icon: 'check-circle-outline' },
    { key: 'WithManager', label: 'Managed', count: stats.withManager, icon: 'account-tie' },
    { key: 'Unassigned', label: 'No Manager', count: stats.unassigned, icon: 'account-question-outline' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Header / Stats Section */}
      <View style={[styles.headerSection, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.headerTopRow}>
          <View>
            <View style={styles.titleWithBadge}>
              <Text style={[styles.screenTitle, { color: colors.text }]}>Company Branches</Text>
              <View
                style={[
                  styles.liveBadge,
                  {
                    backgroundColor: fromLiveBackend
                      ? 'rgba(16, 185, 129, 0.15)'
                      : isDark
                      ? '#1E293B'
                      : '#EEF2FF',
                  },
                ]}
              >
                <View
                  style={[
                    styles.pulseDot,
                    { backgroundColor: fromLiveBackend ? '#10B981' : '#6366F1' },
                  ]}
                />
                <Text
                  style={[
                    styles.liveBadgeText,
                    { color: fromLiveBackend ? '#10B981' : colors.primary },
                  ]}
                >
                  {fromLiveBackend ? 'Live /api/branches' : 'API Ready'}
                </Text>
              </View>
            </View>
            <Text style={[styles.screenSub, { color: colors.textSecondary }]}>
              {stats.companyName} • Company Code: #{stats.companyCode}
            </Text>
          </View>

          <View style={styles.headerRightActions}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setIsAddModalOpen(true)}
              style={[styles.addBranchHeaderBtn, { backgroundColor: colors.primary }]}
            >
              <MaterialCommunityIcons name="plus" size={16} color="#FFFFFF" />
              <Text style={styles.addBranchHeaderBtnText}>Add Branch</Text>
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
            <View style={styles.metricIconWrap}>
              <MaterialCommunityIcons name="source-branch" size={18} color="#6366F1" />
            </View>
            <Text style={[styles.metricValue, { color: colors.text }]}>{stats.total}</Text>
            <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Branches</Text>
          </View>

          <View style={[styles.metricCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
            <View style={styles.metricIconWrap}>
              <MaterialCommunityIcons name="shield-check" size={18} color="#10B981" />
            </View>
            <Text style={[styles.metricValue, { color: '#10B981' }]}>{stats.active}</Text>
            <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Active</Text>
          </View>

          <View style={[styles.metricCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
            <View style={styles.metricIconWrap}>
              <MaterialCommunityIcons name="account-tie" size={18} color="#8B5CF6" />
            </View>
            <Text style={[styles.metricValue, { color: '#8B5CF6' }]}>{stats.withManager}</Text>
            <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Assigned</Text>
          </View>

          <View style={[styles.metricCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
            <View style={styles.metricIconWrap}>
              <MaterialCommunityIcons name="account-alert-outline" size={18} color="#F59E0B" />
            </View>
            <Text style={[styles.metricValue, { color: '#F59E0B' }]}>{stats.unassigned}</Text>
            <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Vacant</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder }]}>
          <MaterialCommunityIcons name="magnify" size={20} color={colors.textMuted} />
          <TextInput
            value={localSearch}
            onChangeText={handleSearchSubmit}
            placeholder="Search by branch name, code, city, manager..."
            placeholderTextColor={colors.textMuted}
            style={[styles.searchInput, { color: colors.text }]}
          />
          {localSearch.length > 0 && (
            <TouchableOpacity onPress={() => handleSearchSubmit('')}>
              <MaterialCommunityIcons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Switcher Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterTabsWrap}>
          {filterTabs.map((tab) => {
            const isSelected = filter === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                activeOpacity={0.7}
                onPress={() => dispatch(setFilter(tab.key))}
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

      {/* Main Branches List */}
      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading || refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        {loading && branches.length === 0 ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading branches from /api/branches...</Text>
          </View>
        ) : error && branches.length === 0 ? (
          <View style={[styles.emptyBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <MaterialCommunityIcons name="alert-circle-outline" size={48} color={colors.danger} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Failed to load branches</Text>
            <Text style={[styles.emptySub, { color: colors.textSecondary }]}>{error}</Text>
            <TouchableOpacity onPress={onRefresh} style={[styles.resetBtn, { backgroundColor: colors.primary }]}>
              <Text style={styles.resetBtnText}>Retry Connection</Text>
            </TouchableOpacity>
          </View>
        ) : filteredBranches.length === 0 ? (
          <View style={[styles.emptyBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <MaterialCommunityIcons name="office-building-marker-outline" size={48} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No branches match your query</Text>
            <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
              Try clearing the search filter or switching to another category.
            </Text>
            <TouchableOpacity
              onPress={() => {
                setLocalSearch('');
                dispatch(setFilter('All'));
                dispatch(fetchBranches({}));
              }}
              style={[styles.resetBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.resetBtnText}>Reset All Filters</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredBranches.map((branch) => {
            const manager = getBranchManager(branch);
            const company = branch.company || {};
            const branchNumFormatted = String(branch.branchNumber || 1).padStart(2, '0');

            return (
              <View
                key={branch._id || branch.branchCode}
                style={[
                  styles.branchCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                {/* Branch Card Top Bar */}
                <View style={styles.cardTopBar}>
                  <View style={styles.cardTopLeft}>
                    {/* Number Badge */}
                    <View style={[styles.branchNumBadge, { backgroundColor: colors.primaryLight }]}>
                      <Text style={[styles.branchNumText, { color: colors.primary }]}>#{branchNumFormatted}</Text>
                    </View>

                    {/* Branch Code */}
                    <View style={[styles.codeBadge, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                      <MaterialCommunityIcons name="barcode" size={13} color={colors.textSecondary} />
                      <Text style={[styles.codeText, { color: colors.text }]}>{branch.branchCode}</Text>
                    </View>
                  </View>

                  {/* Active / Inactive Status Pill */}
                  <View
                    style={[
                      styles.statusPill,
                      {
                        backgroundColor: branch.isActive
                          ? 'rgba(16, 185, 129, 0.12)'
                          : 'rgba(239, 68, 68, 0.12)',
                        borderColor: branch.isActive
                          ? 'rgba(16, 185, 129, 0.3)'
                          : 'rgba(239, 68, 68, 0.3)',
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.statusDot,
                        { backgroundColor: branch.isActive ? '#10B981' : '#EF4444' },
                      ]}
                    />
                    <Text
                      style={[
                        styles.statusLabel,
                        { color: branch.isActive ? '#10B981' : '#EF4444' },
                      ]}
                    >
                      {branch.isActive ? 'OPERATIONAL' : 'INACTIVE'}
                    </Text>
                  </View>
                </View>

                {/* Branch Title & Company */}
                <View style={styles.titleBlock}>
                  <Text style={[styles.branchName, { color: colors.text }]}>{branch.name}</Text>
                  {company.name && (
                    <View style={styles.companyRow}>
                      <MaterialCommunityIcons name="domain" size={14} color="#8B5CF6" />
                      <Text style={[styles.companyText, { color: colors.textSecondary }]}>
                        {company.name} <Text style={{ color: colors.textMuted }}>({company.companyCode || '125'})</Text>
                      </Text>
                      {company.owner && (
                        <View style={[styles.ownerBadge, { backgroundColor: isDark ? '#1E293B' : '#EEF2FF' }]}>
                          <Text style={[styles.ownerText, { color: colors.primary }]}>Owner: {company.owner}</Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>

                {/* Address & Contact Info Grid */}
                <View style={[styles.infoGrid, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                  {branch.address ? (
                    <View style={styles.infoRow}>
                      <MaterialCommunityIcons name="map-marker" size={16} color="#EC4899" />
                      <Text style={[styles.infoRowText, { color: colors.text }]}>{branch.address}</Text>
                    </View>
                  ) : null}

                  <View style={styles.contactRow}>
                    {branch.phone ? (
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => Linking.openURL(`tel:${branch.phone}`)}
                        style={styles.contactItem}
                      >
                        <MaterialCommunityIcons name="phone" size={14} color="#10B981" />
                        <Text style={[styles.contactText, { color: colors.textSecondary }]}>{branch.phone}</Text>
                      </TouchableOpacity>
                    ) : null}

                    {branch.email ? (
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => Linking.openURL(`mailto:${branch.email}`)}
                        style={styles.contactItem}
                      >
                        <MaterialCommunityIcons name="email-outline" size={14} color="#3B82F6" />
                        <Text style={[styles.contactText, { color: colors.textSecondary }]} numberOfLines={1}>
                          {branch.email}
                        </Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                </View>

                {/* Populated Manager Section (.populate('manager_id', ...) / .populate('manager', ...)) */}
                <View style={styles.managerSection}>
                  <Text style={[styles.managerSectionTitle, { color: colors.textMuted }]}>
                    ASSIGNED BRANCH MANAGER
                  </Text>

                  {manager ? (
                    <View
                      style={[
                        styles.managerCard,
                        {
                          backgroundColor: isDark ? 'rgba(99, 102, 241, 0.08)' : '#F5F7FF',
                          borderColor: isDark ? 'rgba(99, 102, 241, 0.25)' : '#DCE3FD',
                        },
                      ]}
                    >
                      <View style={styles.managerHead}>
                        <View style={[styles.managerAvatar, { backgroundColor: colors.primary }]}>
                          <Text style={styles.managerAvatarText}>
                            {manager.name ? manager.name.charAt(0).toUpperCase() : 'M'}
                          </Text>
                        </View>

                        <View style={styles.managerDetails}>
                          <View style={styles.managerNameRow}>
                            <Text style={[styles.managerName, { color: colors.text }]}>{manager.name}</Text>
                            <View style={[styles.roleBadge, { backgroundColor: '#8B5CF6' }]}>
                              <Text style={styles.roleBadgeText}>{(manager.role || 'MANAGER').toUpperCase()}</Text>
                            </View>
                          </View>

                          <Text style={[styles.managerHandle, { color: colors.primary }]}>
                            @{manager.username || 'manager'}
                          </Text>
                        </View>

                        {manager.isActive && (
                          <View style={[styles.managerActiveBadge, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                            <MaterialCommunityIcons name="check-decagram" size={14} color="#10B981" />
                            <Text style={styles.managerActiveText}>Active</Text>
                          </View>
                        )}
                      </View>

                      {/* Manager Mobile & Email */}
                      <View style={[styles.managerContactsRow, { borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }]}>
                        {manager.mobile ? (
                          <View style={styles.mContactPill}>
                            <MaterialCommunityIcons name="cellphone" size={13} color={colors.textMuted} />
                            <Text style={[styles.mContactText, { color: colors.textSecondary }]}>
                              {manager.mobile}
                            </Text>
                          </View>
                        ) : null}

                        {manager.email ? (
                          <View style={styles.mContactPill}>
                            <MaterialCommunityIcons name="email-check-outline" size={13} color={colors.textMuted} />
                            <Text style={[styles.mContactText, { color: colors.textSecondary }]} numberOfLines={1}>
                              {manager.email}
                            </Text>
                          </View>
                        ) : null}
                      </View>
                    </View>
                  ) : (
                    <View
                      style={[
                        styles.unassignedCard,
                        {
                          backgroundColor: colors.surfaceElevated,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <View style={[styles.unassignedIconWrap, { backgroundColor: 'rgba(245, 158, 11, 0.12)' }]}>
                        <MaterialCommunityIcons name="account-question" size={20} color="#F59E0B" />
                      </View>
                      <View style={styles.unassignedInfo}>
                        <Text style={[styles.unassignedTitle, { color: colors.text }]}>Manager Position Vacant</Text>
                        <Text style={[styles.unassignedSub, { color: colors.textMuted }]}>
                          Pending appointment via Admin Console
                        </Text>
                      </View>
                    </View>
                  )}
                </View>

                {/* Card Bottom Bar with Details Button */}
                <View style={[styles.cardBottomBar, { borderTopColor: colors.borderLight }]}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => {
                      setSelectedBranch(branch);
                      setShowRawJson(false);
                    }}
                    style={[styles.inspectBtn, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
                  >
                    <MaterialCommunityIcons name="file-document-outline" size={16} color={colors.primary} />
                    <Text style={[styles.inspectBtnText, { color: colors.primary }]}>Inspect Population</Text>
                  </TouchableOpacity>

                  {branch.phone ? (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => Linking.openURL(`tel:${branch.phone}`)}
                      style={[styles.callBtn, { backgroundColor: colors.primary }]}
                    >
                      <MaterialCommunityIcons name="phone" size={15} color="#FFFFFF" />
                      <Text style={styles.callBtnText}>Call Branch</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Inspect Branch & Populated Models Modal */}
      <Modal visible={selectedBranch !== null} transparent animationType="slide">
        <View style={[styles.modalOverlay, { backgroundColor: colors.drawerOverlay }]}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {/* Modal Header */}
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <View style={styles.modalHeaderLeft}>
                <View style={[styles.modalNumBadge, { backgroundColor: colors.primaryLight }]}>
                  <Text style={[styles.modalNumText, { color: colors.primary }]}>
                    #{String(selectedBranch?.branchNumber || 1).padStart(2, '0')}
                  </Text>
                </View>
                <View>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>{selectedBranch?.name}</Text>
                  <Text style={[styles.modalCode, { color: colors.textSecondary }]}>
                    Code: {selectedBranch?.branchCode} • Status: {selectedBranch?.isActive ? 'Active' : 'Inactive'}
                  </Text>
                </View>
              </View>

              <TouchableOpacity onPress={() => setSelectedBranch(null)} style={styles.modalCloseBtn}>
                <MaterialCommunityIcons name="close" size={22} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Modal Body */}
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Tab Selector: Formatted vs Raw JSON */}
              <View style={[styles.jsonToggleRow, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                <TouchableOpacity
                  onPress={() => setShowRawJson(false)}
                  style={[
                    styles.jsonTabBtn,
                    !showRawJson && { backgroundColor: colors.primary },
                  ]}
                >
                  <Text style={[styles.jsonTabText, { color: !showRawJson ? '#FFFFFF' : colors.textSecondary }]}>
                    Visual Overview
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setShowRawJson(true)}
                  style={[
                    styles.jsonTabBtn,
                    showRawJson && { backgroundColor: colors.primary },
                  ]}
                >
                  <Text style={[styles.jsonTabText, { color: showRawJson ? '#FFFFFF' : colors.textSecondary }]}>
                    Raw Populated JSON
                  </Text>
                </TouchableOpacity>
              </View>

              {!showRawJson ? (
                <View style={styles.modalVisualContent}>
                  {/* Populated Company Section */}
                  <View style={[styles.modalBox, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                    <View style={styles.boxTitleRow}>
                      <MaterialCommunityIcons name="domain" size={18} color="#8B5CF6" />
                      <Text style={[styles.boxTitle, { color: colors.text }]}>
                        .populate('company', 'name companyCode owner')
                      </Text>
                    </View>
                    <View style={styles.keyValRow}>
                      <Text style={[styles.keyText, { color: colors.textMuted }]}>Name:</Text>
                      <Text style={[styles.valText, { color: colors.text }]}>
                        {selectedBranch?.company?.name || 'N/A'}
                      </Text>
                    </View>
                    <View style={styles.keyValRow}>
                      <Text style={[styles.keyText, { color: colors.textMuted }]}>Company Code:</Text>
                      <Text style={[styles.valText, { color: colors.primary }]}>
                        {selectedBranch?.company?.companyCode || 'N/A'}
                      </Text>
                    </View>
                    <View style={styles.keyValRow}>
                      <Text style={[styles.keyText, { color: colors.textMuted }]}>Owner:</Text>
                      <Text style={[styles.valText, { color: colors.text }]}>
                        {selectedBranch?.company?.owner || 'N/A'}
                      </Text>
                    </View>
                  </View>

                  {/* Populated Manager Section */}
                  <View style={[styles.modalBox, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                    <View style={styles.boxTitleRow}>
                      <MaterialCommunityIcons name="account-tie" size={18} color="#10B981" />
                      <Text style={[styles.boxTitle, { color: colors.text }]}>
                        .populate('manager', 'name email username mobile role isActive')
                      </Text>
                    </View>

                    {getBranchManager(selectedBranch || {}) ? (
                      (() => {
                        const m = getBranchManager(selectedBranch);
                        return (
                          <>
                            <View style={styles.keyValRow}>
                              <Text style={[styles.keyText, { color: colors.textMuted }]}>Name:</Text>
                              <Text style={[styles.valText, { color: colors.text }]}>{m.name}</Text>
                            </View>
                            <View style={styles.keyValRow}>
                              <Text style={[styles.keyText, { color: colors.textMuted }]}>Username:</Text>
                              <Text style={[styles.valText, { color: colors.primary }]}>@{m.username}</Text>
                            </View>
                            <View style={styles.keyValRow}>
                              <Text style={[styles.keyText, { color: colors.textMuted }]}>Email:</Text>
                              <Text style={[styles.valText, { color: colors.text }]}>{m.email}</Text>
                            </View>
                            <View style={styles.keyValRow}>
                              <Text style={[styles.keyText, { color: colors.textMuted }]}>Mobile:</Text>
                              <Text style={[styles.valText, { color: colors.text }]}>{m.mobile || 'N/A'}</Text>
                            </View>
                            <View style={styles.keyValRow}>
                              <Text style={[styles.keyText, { color: colors.textMuted }]}>Role:</Text>
                              <Text style={[styles.valText, { color: '#8B5CF6' }]}>{(m.role || 'manager').toUpperCase()}</Text>
                            </View>
                            <View style={styles.keyValRow}>
                              <Text style={[styles.keyText, { color: colors.textMuted }]}>Active Status:</Text>
                              <Text style={[styles.valText, { color: m.isActive ? '#10B981' : '#EF4444' }]}>
                                {m.isActive ? 'Active (true)' : 'Inactive (false)'}
                              </Text>
                            </View>
                          </>
                        );
                      })()
                    ) : (
                      <Text style={[styles.noManagerModalText, { color: colors.textMuted }]}>
                        Manager is null (unassigned)
                      </Text>
                    )}
                  </View>

                  {/* Branch Timestamps */}
                  <View style={[styles.modalBox, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                    <View style={styles.keyValRow}>
                      <Text style={[styles.keyText, { color: colors.textMuted }]}>Branch ID:</Text>
                      <Text style={[styles.valText, { color: colors.textMuted, fontSize: 11 }]}>
                        {selectedBranch?._id}
                      </Text>
                    </View>
                    <View style={styles.keyValRow}>
                      <Text style={[styles.keyText, { color: colors.textMuted }]}>Created At:</Text>
                      <Text style={[styles.valText, { color: colors.textSecondary }]}>
                        {selectedBranch?.createdAt}
                      </Text>
                    </View>
                  </View>
                </View>
              ) : (
                /* Raw JSON Box */
                <View style={[styles.jsonBox, { backgroundColor: isDark ? '#090D16' : '#F8FAFC', borderColor: colors.border }]}>
                  <Text style={[styles.jsonCode, { color: colors.text }]}>
                    {JSON.stringify(selectedBranch, null, 2)}
                  </Text>
                </View>
              )}
            </ScrollView>

            {/* Modal Bottom Button */}
            <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
              <TouchableOpacity
                onPress={() => setSelectedBranch(null)}
                style={[styles.modalCloseDoneBtn, { backgroundColor: colors.primary }]}
              >
                <Text style={styles.modalCloseDoneText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Floating Action Button (FAB) for Add Branch */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => setIsAddModalOpen(true)}
        style={[styles.fabBtn, { backgroundColor: colors.primary }]}
      >
        <MaterialCommunityIcons name="plus" size={22} color="#FFFFFF" />
        <Text style={styles.fabBtnText}>Add Branch</Text>
      </TouchableOpacity>

      {/* Slide Bottom-to-Up Add Branch Modal */}
      <AddBranchModal
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
  liveBadge: {
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
  liveBadgeText: {
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
  addBranchHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  addBranchHeaderBtnText: {
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
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 17,
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
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    gap: 8,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    height: '100%',
  },
  filterTabsWrap: {
    gap: 8,
    paddingBottom: 2,
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
    paddingBottom: 40,
    gap: 14,
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
  branchCard: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  cardTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTopLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  branchNumBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  branchNumText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  codeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  codeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  titleBlock: {
    marginBottom: 12,
  },
  branchName: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  companyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  ownerBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  ownerText: {
    fontSize: 10,
    fontWeight: '700',
  },
  infoGrid: {
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoRowText: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  contactRow: {
    flexDirection: 'row',
    gap: 14,
    flexWrap: 'wrap',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  contactText: {
    fontSize: 12,
    fontWeight: '500',
  },
  managerSection: {
    marginBottom: 12,
  },
  managerSectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  managerCard: {
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  managerHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  managerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  managerAvatarText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  managerDetails: {
    flex: 1,
  },
  managerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  managerName: {
    fontSize: 14,
    fontWeight: '700',
  },
  roleBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  roleBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  managerHandle: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  managerActiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  managerActiveText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '700',
  },
  managerContactsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    flexWrap: 'wrap',
  },
  mContactPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  mContactText: {
    fontSize: 11,
    fontWeight: '500',
  },
  unassignedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  unassignedIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unassignedInfo: {
    flex: 1,
  },
  unassignedTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  unassignedSub: {
    fontSize: 11,
    marginTop: 1,
  },
  cardBottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 10,
  },
  inspectBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
  },
  inspectBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  callBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 480,
    borderRadius: 20,
    borderWidth: 1,
    maxHeight: '85%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  modalNumBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalNumText: {
    fontSize: 13,
    fontWeight: '800',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  modalCode: {
    fontSize: 11,
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalBody: {
    padding: 16,
  },
  jsonToggleRow: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 3,
    borderWidth: 1,
    marginBottom: 14,
  },
  jsonTabBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  jsonTabText: {
    fontSize: 12,
    fontWeight: '700',
  },
  modalVisualContent: {
    gap: 12,
    paddingBottom: 16,
  },
  modalBox: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  boxTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  boxTitle: {
    fontSize: 12,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  keyValRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  keyText: {
    fontSize: 12,
    fontWeight: '500',
  },
  valText: {
    fontSize: 12,
    fontWeight: '700',
  },
  noManagerModalText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  jsonBox: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
  },
  jsonCode: {
    fontSize: 11,
    fontFamily: 'monospace',
    lineHeight: 16,
  },
  modalFooter: {
    padding: 12,
    borderTopWidth: 1,
  },
  modalCloseDoneBtn: {
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseDoneText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
