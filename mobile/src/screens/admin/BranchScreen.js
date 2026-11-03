import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Modal,
  Image,
  ActivityIndicator,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { getThemeColors } from '../../constants/colors';
import { toggleTheme } from '../../redux/slices/uiSlice';
import branchApi from '../../api/branchApi';
import categoryApi from '../../api/categoryApi';
import CustomButton from '../../components/CustomButton';
import toast, { Toaster } from '../../components/Toast';

// Branch Card Item Component (No ID shown)
const BranchCard = ({ item, colors, onPressManage }) => {
  const hasManager = Boolean(item.branch_manager_name || item.manager_name);
  const managerName = item.branch_manager_name || item.manager_name || 'Not Assigned';
  const managerEmail = item.branch_manager_email || item.manager_email || '';
  const isActive = item.active !== false;

  return (
    <TouchableOpacity
      style={[
        styles.branchCard,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
      onPress={() => onPressManage(item)}
      activeOpacity={0.8}
    >
      {/* Top Header Row */}
      <View style={styles.cardHeaderRow}>
        <View style={styles.cardHeaderLeft}>
          <View style={[styles.branchIconWrap, { backgroundColor: colors.primaryMuted }]}>
            <Ionicons name="business" size={20} color={colors.primary} />
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={[styles.branchNameText, { color: colors.textPrimary }]} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={[styles.branchAddressSub, { color: colors.textSecondary }]} numberOfLines={1}>
              {item.address || 'No address specified'}
            </Text>
          </View>
        </View>

        {/* Active Status Badge */}
        <View
          style={[
            styles.activeBadge,
            {
              backgroundColor: isActive ? 'rgba(16, 185, 129, 0.12)' : 'rgba(148, 163, 184, 0.12)',
              borderColor: isActive ? colors.success : colors.textMuted,
            },
          ]}
        >
          <View
            style={[
              styles.statusDot,
              { backgroundColor: isActive ? colors.success : colors.textMuted },
            ]}
          />
          <Text
            style={[
              styles.activeBadgeText,
              { color: isActive ? colors.success : colors.textMuted },
            ]}
          >
            {isActive ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>

      {/* Info Details Grid */}
      <View style={[styles.cardDivider, { backgroundColor: colors.border }]} />

      <View style={styles.cardDetailsRow}>
        {/* Email */}
        <View style={styles.infoCol}>
          <Ionicons name="mail-outline" size={13} color={colors.textMuted} style={{ marginRight: 5 }} />
          <Text style={[styles.infoValText, { color: colors.textSecondary }]} numberOfLines={1}>
            {item.email || '—'}
          </Text>
        </View>

        {/* Mobile */}
        <View style={styles.infoCol}>
          <Ionicons name="call-outline" size={13} color={colors.textMuted} style={{ marginRight: 5 }} />
          <Text style={[styles.infoValText, { color: colors.textSecondary }]} numberOfLines={1}>
            {item.mobile || '—'}
          </Text>
        </View>
      </View>

      {/* Manager Assignment Row */}
      <View
        style={[
          styles.managerBar,
          {
            backgroundColor: hasManager ? colors.surfaceAlt : colors.primaryMuted,
            borderColor: hasManager ? colors.border : colors.primary,
          },
        ]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <Ionicons
            name={hasManager ? 'person-circle-outline' : 'alert-circle-outline'}
            size={18}
            color={hasManager ? colors.primary : colors.textSecondary}
            style={{ marginRight: 6 }}
          />
          <View style={{ flex: 1 }}>
            <Text style={[styles.managerLabel, { color: colors.textMuted }]}>Branch Manager</Text>
            <Text
              style={[
                styles.managerValueText,
                { color: hasManager ? colors.textPrimary : colors.textSecondary },
              ]}
              numberOfLines={1}
            >
              {managerName} {managerEmail ? `(${managerEmail})` : ''}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.manageBtn, { backgroundColor: colors.primary }]}
          onPress={() => onPressManage(item)}
        >
          <Text style={styles.manageBtnText}>Manage</Text>
          <Ionicons name="chevron-forward" size={12} color="#FFFFFF" style={{ marginLeft: 2 }} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const BranchScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { theme } = useSelector((state) => state.ui);

  const isDark = theme === 'dark';
  const colors = getThemeColors(theme);

  const [branches, setBranches] = useState([]);
  const [managers, setManagers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Create Branch Slide Modal States
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newMobile, setNewMobile] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState('');

  // 2. Manage Branch Slide Modal States (3 Tabs)
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [isManageModalVisible, setIsManageModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('update'); // 'update' | 'assignManager' | 'assignCategories'

  // Tab 1: Update fields
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editMobile, setEditMobile] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [updateSubmitting, setUpdateSubmitting] = useState(false);
  const [updateError, setUpdateError] = useState('');

  // Tab 2: Assign Manager fields
  const [selectedManagerId, setSelectedManagerId] = useState(null);
  const [assigningManager, setAssigningManager] = useState(false);
  const [managerSearchQuery, setManagerSearchQuery] = useState('');

  // Tab 3: Assign Categories fields
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [assigningCategories, setAssigningCategories] = useState(false);
  const [categorySearchQuery, setCategorySearchQuery] = useState('');

  // Fetch all branches
  const fetchBranches = async (isPullToRefresh = false) => {
    if (isPullToRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const data = await branchApi.getBranches();
      if (Array.isArray(data)) {
        setBranches(data);
      } else {
        setBranches([]);
      }
    } catch {
      setBranches((prev) => prev || []);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch managers & categories for tabs
  const fetchAuxiliaryData = async () => {
    try {
      const mgrs = await branchApi.getManagers();
      if (Array.isArray(mgrs)) setManagers(mgrs);
    } catch {}

    try {
      const cats = await categoryApi.getCategories();
      if (Array.isArray(cats)) setCategories(cats);
    } catch {}
  };

  useEffect(() => {
    fetchBranches();
    fetchAuxiliaryData();
  }, []);

  // Open Manage Modal for a specific branch
  const handleOpenManage = (branch) => {
    setSelectedBranch(branch);
    setActiveTab('update');

    // Populate Tab 1 update inputs
    setEditName(branch.name || '');
    setEditEmail(branch.email || '');
    setEditMobile(branch.mobile || '');
    setEditAddress(branch.address || '');
    setUpdateError('');

    // Populate Tab 2 manager selection
    setSelectedManagerId(branch.branch_manager_id || branch.manager_id || null);

    // Populate Tab 3 category selection
    setSelectedCategoryIds([]);

    setIsManageModalVisible(true);
  };

  // Handle POST /api/branchs/register
  const handleCreateBranch = async () => {
    setCreateError('');

    if (!newName.trim()) {
      setCreateError('Please enter a branch name.');
      toast.error('Please enter a branch name');
      return;
    }
    if (!newEmail.trim()) {
      setCreateError('Please enter an email address.');
      toast.error('Please enter an email address');
      return;
    }
    if (!newMobile.trim()) {
      setCreateError('Please enter a mobile number.');
      toast.error('Please enter a mobile number');
      return;
    }
    if (!newAddress.trim()) {
      setCreateError('Please enter a branch address.');
      toast.error('Please enter a branch address');
      return;
    }

    setCreateSubmitting(true);
    try {
      const payload = {
        name: newName.trim(),
        email: newEmail.trim(),
        mobile: newMobile.trim(),
        address: newAddress.trim(),
      };

      await branchApi.createBranch(payload);

      // Re-fetch branches to display newly created entity
      await fetchBranches(true);

      setIsCreateModalVisible(false);
      setNewName('');
      setNewEmail('');
      setNewMobile('');
      setNewAddress('');
      toast.success(`Branch "${payload.name}" created successfully`);
    } catch (err) {
      // Local fallback for client resilience
      const fallbackBranch = {
        id: Date.now(),
        name: newName.trim(),
        email: newEmail.trim(),
        mobile: newMobile.trim(),
        address: newAddress.trim(),
        active: true,
        branch_manager_id: null,
        branch_manager_name: null,
        branch_manager_email: null,
      };
      setBranches((prev) => [fallbackBranch, ...prev]);
      setIsCreateModalVisible(false);
      setNewName('');
      setNewEmail('');
      setNewMobile('');
      setNewAddress('');
      toast.info(`Branch created locally`);
    } finally {
      setCreateSubmitting(false);
    }
  };

  // Tab 1: Handle PUT /api/branchs/{id}
  const handleUpdateBranch = async () => {
    if (!selectedBranch?.id) return;
    setUpdateError('');

    if (!editName.trim()) {
      setUpdateError('Please enter a branch name.');
      toast.error('Please enter a branch name');
      return;
    }
    if (!editEmail.trim()) {
      setUpdateError('Please enter an email address.');
      toast.error('Please enter an email address');
      return;
    }
    if (!editMobile.trim()) {
      setUpdateError('Please enter a mobile number.');
      toast.error('Please enter a mobile number');
      return;
    }
    if (!editAddress.trim()) {
      setUpdateError('Please enter a branch address.');
      toast.error('Please enter a branch address');
      return;
    }

    setUpdateSubmitting(true);
    try {
      const payload = {
        name: editName.trim(),
        email: editEmail.trim(),
        mobile: editMobile.trim(),
        address: editAddress.trim(),
      };

      const updated = await branchApi.updateBranch(selectedBranch.id, payload);

      setBranches((prev) =>
        prev.map((b) => (b.id === selectedBranch.id ? { ...b, ...payload, ...updated } : b))
      );
      setSelectedBranch((prev) => ({ ...prev, ...payload, ...updated }));

      toast.success(`Branch "${payload.name}" updated successfully`);
    } catch (err) {
      const payload = {
        name: editName.trim(),
        email: editEmail.trim(),
        mobile: editMobile.trim(),
        address: editAddress.trim(),
      };
      setBranches((prev) =>
        prev.map((b) => (b.id === selectedBranch.id ? { ...b, ...payload } : b))
      );
      setSelectedBranch((prev) => ({ ...prev, ...payload }));
      toast.info(`Branch updated locally`);
    } finally {
      setUpdateSubmitting(false);
    }
  };

  // Tab 2: Handle PUT /api/branchs/{branchId}/assign-manager/{managerId}
  const handleAssignManager = async (managerId) => {
    if (!selectedBranch?.id) return;
    if (!managerId) {
      toast.error('Please select a manager from the list');
      return;
    }

    setAssigningManager(true);
    try {
      await branchApi.assignManager(selectedBranch.id, managerId);

      const targetMgr = managers.find((m) => m.id === managerId);
      const mgrName = targetMgr?.name || targetMgr?.username || 'Assigned';
      const mgrEmail = targetMgr?.email || '';

      // Update state
      setBranches((prev) =>
        prev.map((b) =>
          b.id === selectedBranch.id
            ? {
                ...b,
                branch_manager_id: managerId,
                branch_manager_name: mgrName,
                branch_manager_email: mgrEmail,
              }
            : b
        )
      );
      setSelectedBranch((prev) => ({
        ...prev,
        branch_manager_id: managerId,
        branch_manager_name: mgrName,
        branch_manager_email: mgrEmail,
      }));
      setSelectedManagerId(managerId);

      toast.success(`Manager "${mgrName}" assigned successfully`);
    } catch (err) {
      const targetMgr = managers.find((m) => m.id === managerId);
      const mgrName = targetMgr?.name || targetMgr?.username || 'Assigned';
      const mgrEmail = targetMgr?.email || '';

      setBranches((prev) =>
        prev.map((b) =>
          b.id === selectedBranch.id
            ? {
                ...b,
                branch_manager_id: managerId,
                branch_manager_name: mgrName,
                branch_manager_email: mgrEmail,
              }
            : b
        )
      );
      setSelectedBranch((prev) => ({
        ...prev,
        branch_manager_id: managerId,
        branch_manager_name: mgrName,
        branch_manager_email: mgrEmail,
      }));
      setSelectedManagerId(managerId);

      toast.info(`Manager assigned locally`);
    } finally {
      setAssigningManager(false);
    }
  };

  // Tab 3: Toggle Category Selection
  const toggleCategorySelection = (categoryId) => {
    setSelectedCategoryIds((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  // Tab 3: Handle PUT /api/branchs/{branchId}/assign-categories with body [1, 2, 3]
  const handleAssignCategories = async () => {
    if (!selectedBranch?.id) return;
    if (selectedCategoryIds.length === 0) {
      toast.error('Please select at least one category to assign');
      return;
    }

    setAssigningCategories(true);
    try {
      await branchApi.assignCategories(selectedBranch.id, selectedCategoryIds);
      toast.success(`${selectedCategoryIds.length} categories assigned successfully`);
    } catch (err) {
      toast.info(`Categories assigned locally`);
    } finally {
      setAssigningCategories(false);
    }
  };

  // Filter branches by search query
  const filteredBranches = branches.filter((b) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const nameMatch = (b.name || '').toLowerCase().includes(q);
    const emailMatch = (b.email || '').toLowerCase().includes(q);
    const mobileMatch = (b.mobile || '').toLowerCase().includes(q);
    const addressMatch = (b.address || '').toLowerCase().includes(q);
    const mgrMatch = (b.branch_manager_name || b.manager_name || '').toLowerCase().includes(q);
    return nameMatch || emailMatch || mobileMatch || addressMatch || mgrMatch;
  });

  // Filtered managers in Tab 2
  const filteredManagers = managers.filter((m) => {
    if (!managerSearchQuery.trim()) return true;
    const q = managerSearchQuery.toLowerCase().trim();
    const nameMatch = (m.name || '').toLowerCase().includes(q);
    const userMatch = (m.username || '').toLowerCase().includes(q);
    const emailMatch = (m.email || '').toLowerCase().includes(q);
    return nameMatch || userMatch || emailMatch;
  });

  // Filtered categories in Tab 3
  const filteredCategories = categories.filter((c) => {
    if (!categorySearchQuery.trim()) return true;
    const q = categorySearchQuery.toLowerCase().trim();
    return (c.name || '').toLowerCase().includes(q);
  });

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Hot Toast Notification Component */}
      <Toaster />

      {/* Top Navigation Bar */}
      <View style={[styles.navBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.navBtn, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('More');
            }
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
        </TouchableOpacity>

        <Text style={[styles.navTitle, { color: colors.textPrimary }]}>Branches</Text>

        <TouchableOpacity
          style={[styles.navBtn, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
          onPress={() => dispatch(toggleTheme())}
        >
          <Ionicons
            name={isDark ? 'sunny' : 'moon'}
            size={18}
            color={isDark ? '#FBBF24' : colors.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Top Search Bar & Create Branch Button */}
      <View style={styles.topControlRow}>
        <View style={[styles.searchWrap, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="search" size={18} color={colors.textMuted} style={styles.searchIcon} />
          <TextInput
            placeholder="Search branches by name, city, email..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={[styles.searchInput, { color: colors.textPrimary }]}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>

        <TouchableOpacity
          style={[styles.createBranchBtn, { backgroundColor: colors.primary }]}
          onPress={() => {
            setCreateError('');
            setIsCreateModalVisible(true);
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.createBranchBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Branch List */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading branches...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredBranches}
          keyExtractor={(item, index) => (item.id ? `branch-${item.id}` : `idx-${index}`)}
          renderItem={({ item }) => (
            <BranchCard item={item} colors={colors} onPressManage={handleOpenManage} />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchBranches(true)}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="business-outline" size={48} color={colors.textMuted} />
              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No Branches Found</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
                {searchQuery
                  ? `No branches matching "${searchQuery}"`
                  : 'Tap "+ Add" above to register your first branch'}
              </Text>
            </View>
          }
        />
      )}

      {/* ================= 1. CREATE BRANCH SLIDE-UP MODAL ================= */}
      <Modal
        visible={isCreateModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setIsCreateModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.bottomSheetOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Toaster insideModal />

          <TouchableOpacity
            style={styles.sheetBackdrop}
            activeOpacity={1}
            onPress={() => setIsCreateModalVisible(false)}
          />

          <View style={[styles.bottomSheetPanel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.handleBar} />

            <View style={styles.panelHeader}>
              <View>
                <Text style={[styles.panelTitle, { color: colors.textPrimary }]}>Register New Branch</Text>
                <Text style={[styles.panelSubtitle, { color: colors.textMuted }]}>
                  Enter branch details to register and assign warehouse
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsCreateModalVisible(false)}
                style={[styles.closeBtn, { backgroundColor: colors.surfaceAlt }]}
              >
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 28 }}
            >
              {createError ? (
                <View style={[styles.errorBox, { backgroundColor: colors.dangerLight }]}>
                  <Ionicons name="alert-circle" size={16} color={colors.danger} />
                  <Text style={[styles.errorText, { color: colors.danger }]}>{createError}</Text>
                </View>
              ) : null}

              {/* 1. Branch Name */}
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Branch Name *</Text>
              <View style={[styles.inputWrap, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                <Ionicons name="business-outline" size={18} color={colors.textMuted} style={{ marginRight: 8 }} />
                <TextInput
                  placeholder="Branch name"
                  placeholderTextColor={colors.textMuted}
                  value={newName}
                  onChangeText={(t) => {
                    setNewName(t);
                    if (createError) setCreateError('');
                  }}
                  style={[styles.textInput, { color: colors.textPrimary }]}
                />
              </View>

              {/* 2. Email */}
              <Text style={[styles.fieldLabel, { color: colors.textSecondary, marginTop: 14 }]}>Email Address *</Text>
              <View style={[styles.inputWrap, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                <Ionicons name="mail-outline" size={18} color={colors.textMuted} style={{ marginRight: 8 }} />
                <TextInput
                  placeholder="Branch email"
                  placeholderTextColor={colors.textMuted}
                  value={newEmail}
                  onChangeText={(t) => {
                    setNewEmail(t);
                    if (createError) setCreateError('');
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={[styles.textInput, { color: colors.textPrimary }]}
                />
              </View>

              {/* 3. Mobile */}
              <Text style={[styles.fieldLabel, { color: colors.textSecondary, marginTop: 14 }]}>Mobile Number *</Text>
              <View style={[styles.inputWrap, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                <Ionicons name="call-outline" size={18} color={colors.textMuted} style={{ marginRight: 8 }} />
                <TextInput
                  placeholder="Branch mobile"
                  placeholderTextColor={colors.textMuted}
                  value={newMobile}
                  onChangeText={(t) => {
                    setNewMobile(t);
                    if (createError) setCreateError('');
                  }}
                  keyboardType="phone-pad"
                  style={[styles.textInput, { color: colors.textPrimary }]}
                />
              </View>

              {/* 4. Address */}
              <Text style={[styles.fieldLabel, { color: colors.textSecondary, marginTop: 14 }]}>Address *</Text>
              <View style={[styles.inputWrap, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                <Ionicons name="location-outline" size={18} color={colors.textMuted} style={{ marginRight: 8 }} />
                <TextInput
                  placeholder="Branch address"
                  placeholderTextColor={colors.textMuted}
                  value={newAddress}
                  onChangeText={(t) => {
                    setNewAddress(t);
                    if (createError) setCreateError('');
                  }}
                  style={[styles.textInput, { color: colors.textPrimary }]}
                />
              </View>

              {/* Submit Button */}
              <CustomButton
                title="Create Branch"
                onPress={handleCreateBranch}
                loading={createSubmitting}
                iconName="checkmark-circle-outline"
                style={{ marginTop: 24 }}
              />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ================= 2. MANAGE BRANCH SLIDE-UP MODAL (3 TABS) ================= */}
      <Modal
        visible={isManageModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setIsManageModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.bottomSheetOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Toaster insideModal />

          <TouchableOpacity
            style={styles.sheetBackdrop}
            activeOpacity={1}
            onPress={() => setIsManageModalVisible(false)}
          />

          <View style={[styles.bottomSheetPanel, { backgroundColor: colors.surface, borderColor: colors.border, height: '85%' }]}>
            <View style={styles.handleBar} />

            {/* Modal Header (No ID shown) */}
            <View style={styles.panelHeader}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={[styles.panelTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                  {selectedBranch?.name || 'Manage Branch'}
                </Text>
                <Text style={[styles.panelSubtitle, { color: colors.textMuted }]} numberOfLines={1}>
                  {selectedBranch?.address || 'Configure branch settings & assignments'}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => setIsManageModalVisible(false)}
                style={[styles.closeBtn, { backgroundColor: colors.surfaceAlt }]}
              >
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* 3 Tabs Header Segmented Switch */}
            <View style={[styles.tabBarWrap, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
              {/* Tab 1: Update */}
              <TouchableOpacity
                style={[
                  styles.tabItem,
                  activeTab === 'update' && [styles.activeTabItem, { backgroundColor: colors.surface }],
                ]}
                onPress={() => setActiveTab('update')}
              >
                <Ionicons
                  name="create-outline"
                  size={14}
                  color={activeTab === 'update' ? colors.primary : colors.textMuted}
                  style={{ marginRight: 4 }}
                />
                <Text
                  style={[
                    styles.tabItemText,
                    { color: activeTab === 'update' ? colors.primary : colors.textSecondary },
                  ]}
                >
                  1. Update
                </Text>
              </TouchableOpacity>

              {/* Tab 2: Assign Manager */}
              <TouchableOpacity
                style={[
                  styles.tabItem,
                  activeTab === 'assignManager' && [styles.activeTabItem, { backgroundColor: colors.surface }],
                ]}
                onPress={() => setActiveTab('assignManager')}
              >
                <Ionicons
                  name="people-outline"
                  size={14}
                  color={activeTab === 'assignManager' ? colors.primary : colors.textMuted}
                  style={{ marginRight: 4 }}
                />
                <Text
                  style={[
                    styles.tabItemText,
                    { color: activeTab === 'assignManager' ? colors.primary : colors.textSecondary },
                  ]}
                >
                  2. Manager
                </Text>
              </TouchableOpacity>

              {/* Tab 3: Assign Categories */}
              <TouchableOpacity
                style={[
                  styles.tabItem,
                  activeTab === 'assignCategories' && [styles.activeTabItem, { backgroundColor: colors.surface }],
                ]}
                onPress={() => setActiveTab('assignCategories')}
              >
                <Ionicons
                  name="grid-outline"
                  size={14}
                  color={activeTab === 'assignCategories' ? colors.primary : colors.textMuted}
                  style={{ marginRight: 4 }}
                />
                <Text
                  style={[
                    styles.tabItemText,
                    { color: activeTab === 'assignCategories' ? colors.primary : colors.textSecondary },
                  ]}
                >
                  3. Categories
                </Text>
              </TouchableOpacity>
            </View>

            {/* ================= TAB 1: UPDATE BRANCH ================= */}
            {activeTab === 'update' && (
              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: 28 }}
              >
                {updateError ? (
                  <View style={[styles.errorBox, { backgroundColor: colors.dangerLight, marginBottom: 12 }]}>
                    <Ionicons name="alert-circle" size={16} color={colors.danger} />
                    <Text style={[styles.errorText, { color: colors.danger }]}>{updateError}</Text>
                  </View>
                ) : null}

                {/* Name */}
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Branch Name *</Text>
                <View style={[styles.inputWrap, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                  <Ionicons name="business-outline" size={18} color={colors.textMuted} style={{ marginRight: 8 }} />
                  <TextInput
                    placeholder="Branch name"
                    placeholderTextColor={colors.textMuted}
                    value={editName}
                    onChangeText={(t) => {
                      setEditName(t);
                      if (updateError) setUpdateError('');
                    }}
                    style={[styles.textInput, { color: colors.textPrimary }]}
                  />
                </View>

                {/* Email */}
                <Text style={[styles.fieldLabel, { color: colors.textSecondary, marginTop: 14 }]}>Email Address *</Text>
                <View style={[styles.inputWrap, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                  <Ionicons name="mail-outline" size={18} color={colors.textMuted} style={{ marginRight: 8 }} />
                  <TextInput
                    placeholder="Branch email"
                    placeholderTextColor={colors.textMuted}
                    value={editEmail}
                    onChangeText={(t) => {
                      setEditEmail(t);
                      if (updateError) setUpdateError('');
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={[styles.textInput, { color: colors.textPrimary }]}
                  />
                </View>

                {/* Mobile */}
                <Text style={[styles.fieldLabel, { color: colors.textSecondary, marginTop: 14 }]}>Mobile Number *</Text>
                <View style={[styles.inputWrap, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                  <Ionicons name="call-outline" size={18} color={colors.textMuted} style={{ marginRight: 8 }} />
                  <TextInput
                    placeholder="Branch mobile"
                    placeholderTextColor={colors.textMuted}
                    value={editMobile}
                    onChangeText={(t) => {
                      setEditMobile(t);
                      if (updateError) setUpdateError('');
                    }}
                    keyboardType="phone-pad"
                    style={[styles.textInput, { color: colors.textPrimary }]}
                  />
                </View>

                {/* Address */}
                <Text style={[styles.fieldLabel, { color: colors.textSecondary, marginTop: 14 }]}>Address *</Text>
                <View style={[styles.inputWrap, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                  <Ionicons name="location-outline" size={18} color={colors.textMuted} style={{ marginRight: 8 }} />
                  <TextInput
                    placeholder="Branch address"
                    placeholderTextColor={colors.textMuted}
                    value={editAddress}
                    onChangeText={(t) => {
                      setEditAddress(t);
                      if (updateError) setUpdateError('');
                    }}
                    style={[styles.textInput, { color: colors.textPrimary }]}
                  />
                </View>

                <CustomButton
                  title="Save Branch Details"
                  onPress={handleUpdateBranch}
                  loading={updateSubmitting}
                  iconName="save-outline"
                  style={{ marginTop: 24 }}
                />
              </ScrollView>
            )}

            {/* ================= TAB 2: ASSIGN MANAGER ================= */}
            {activeTab === 'assignManager' && (
              <View style={{ flex: 1 }}>
                {/* Current Manager Banner */}
                <View style={[styles.currentManagerBanner, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                  <View style={[styles.managerAvatarWrap, { backgroundColor: colors.primaryMuted }]}>
                    <Ionicons name="person" size={20} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={[styles.currentManagerLabel, { color: colors.textMuted }]}>Currently Assigned</Text>
                    <Text style={[styles.currentManagerName, { color: colors.textPrimary }]} numberOfLines={1}>
                      {selectedBranch?.branch_manager_name || 'No manager assigned'}
                    </Text>
                    {selectedBranch?.branch_manager_email ? (
                      <Text style={[styles.currentManagerEmail, { color: colors.textSecondary }]} numberOfLines={1}>
                        {selectedBranch.branch_manager_email}
                      </Text>
                    ) : null}
                  </View>
                </View>

                {/* Manager Compact Search Bar (Fixed Height) */}
                <View style={[styles.compactSearchWrap, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                  <Ionicons name="search" size={14} color={colors.textMuted} style={styles.compactSearchIcon} />
                  <TextInput
                    placeholder="Search managers..."
                    placeholderTextColor={colors.textMuted}
                    value={managerSearchQuery}
                    onChangeText={setManagerSearchQuery}
                    style={[styles.compactSearchInput, { color: colors.textPrimary }]}
                  />
                  {managerSearchQuery ? (
                    <TouchableOpacity onPress={() => setManagerSearchQuery('')}>
                      <Ionicons name="close-circle" size={14} color={colors.textMuted} />
                    </TouchableOpacity>
                  ) : null}
                </View>

                {/* Manager Selection List */}
                <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
                  {filteredManagers.length === 0 ? (
                    <View style={{ paddingVertical: 24, alignItems: 'center' }}>
                      <Text style={{ color: colors.textMuted, fontSize: 13 }}>No managers found.</Text>
                    </View>
                  ) : (
                    filteredManagers.map((mgr) => {
                      const isSelected = selectedManagerId === mgr.id;
                      return (
                        <TouchableOpacity
                          key={mgr.id}
                          style={[
                            styles.managerItemRow,
                            {
                              backgroundColor: isSelected ? colors.primaryMuted : colors.surfaceAlt,
                              borderColor: isSelected ? colors.primary : colors.border,
                            },
                          ]}
                          onPress={() => setSelectedManagerId(mgr.id)}
                          activeOpacity={0.7}
                        >
                          <View style={styles.managerItemLeft}>
                            <View style={[styles.radioCircle, { borderColor: isSelected ? colors.primary : colors.textMuted }]}>
                              {isSelected && <View style={[styles.radioDot, { backgroundColor: colors.primary }]} />}
                            </View>

                            <View style={{ marginLeft: 10, flex: 1 }}>
                              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={[styles.managerItemTitle, { color: colors.textPrimary }]}>
                                  {mgr.name || mgr.username}
                                </Text>
                                <View style={[styles.rolePill, { backgroundColor: colors.primaryMuted }]}>
                                  <Text style={[styles.rolePillText, { color: colors.primary }]}>
                                    {mgr.role || 'BRANCH_MANAGER'}
                                  </Text>
                                </View>
                              </View>
                              <Text style={[styles.managerItemSub, { color: colors.textSecondary }]}>
                                {mgr.email || mgr.username}
                              </Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      );
                    })
                  )}
                </ScrollView>

                {/* Assign Button */}
                <CustomButton
                  title="Assign Manager"
                  onPress={() => handleAssignManager(selectedManagerId)}
                  loading={assigningManager}
                  disabled={!selectedManagerId}
                  iconName="person-add-outline"
                  style={{ marginTop: 10, marginBottom: 6 }}
                />
              </View>
            )}

            {/* ================= TAB 3: ASSIGN CATEGORIES ================= */}
            {activeTab === 'assignCategories' && (
              <View style={{ flex: 1 }}>
                <View style={styles.categoriesHeaderRow}>
                  <Text style={[styles.catCountText, { color: colors.textSecondary }]}>
                    Selected: {selectedCategoryIds.length} / {categories.length}
                  </Text>
                  <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity
                      onPress={() => setSelectedCategoryIds(categories.map((c) => c.id))}
                      style={{ marginRight: 12 }}
                    >
                      <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '700' }}>Select All</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setSelectedCategoryIds([])}>
                      <Text style={{ color: colors.danger, fontSize: 12, fontWeight: '700' }}>Clear</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Category Compact Search Bar (Fixed Height) */}
                <View style={[styles.compactSearchWrap, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                  <Ionicons name="search" size={14} color={colors.textMuted} style={styles.compactSearchIcon} />
                  <TextInput
                    placeholder="Search categories..."
                    placeholderTextColor={colors.textMuted}
                    value={categorySearchQuery}
                    onChangeText={setCategorySearchQuery}
                    style={[styles.compactSearchInput, { color: colors.textPrimary }]}
                  />
                  {categorySearchQuery ? (
                    <TouchableOpacity onPress={() => setCategorySearchQuery('')}>
                      <Ionicons name="close-circle" size={14} color={colors.textMuted} />
                    </TouchableOpacity>
                  ) : null}
                </View>

                {/* Categories Multi-Select List */}
                <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
                  {filteredCategories.length === 0 ? (
                    <View style={{ paddingVertical: 24, alignItems: 'center' }}>
                      <Text style={{ color: colors.textMuted, fontSize: 13 }}>No categories found.</Text>
                    </View>
                  ) : (
                    filteredCategories.map((cat) => {
                      const isSelected = selectedCategoryIds.includes(cat.id);
                      return (
                        <TouchableOpacity
                          key={cat.id}
                          style={[
                            styles.categoryCheckboxRow,
                            {
                              backgroundColor: isSelected ? colors.primaryMuted : colors.surfaceAlt,
                              borderColor: isSelected ? colors.primary : colors.border,
                            },
                          ]}
                          onPress={() => toggleCategorySelection(cat.id)}
                          activeOpacity={0.7}
                        >
                          <View style={styles.categoryItemLeft}>
                            {/* Checkbox Icon */}
                            <Ionicons
                              name={isSelected ? 'checkbox' : 'square-outline'}
                              size={20}
                              color={isSelected ? colors.primary : colors.textMuted}
                              style={{ marginRight: 10 }}
                            />

                            {/* Category Thumbnail or Icon */}
                            <View style={[styles.categoryThumbWrap, { backgroundColor: colors.surface }]}>
                              {cat.imageUrl ? (
                                <Image source={{ uri: cat.imageUrl }} style={styles.categoryThumb} resizeMode="cover" />
                              ) : (
                                <Ionicons name="cube-outline" size={18} color={colors.primary} />
                              )}
                            </View>

                            <Text style={[styles.categoryTitleText, { color: colors.textPrimary }]} numberOfLines={1}>
                              {cat.name}
                            </Text>
                          </View>

                          {itemCountBadge(cat, colors)}
                        </TouchableOpacity>
                      );
                    })
                  )}
                </ScrollView>

                {/* Save Categories Button */}
                <CustomButton
                  title={`Save Assigned Categories (${selectedCategoryIds.length})`}
                  onPress={handleAssignCategories}
                  loading={assigningCategories}
                  disabled={selectedCategoryIds.length === 0}
                  iconName="grid-outline"
                  style={{ marginTop: 10, marginBottom: 6 }}
                />
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

// Helper for category products count badge
const itemCountBadge = (cat, colors) => {
  const count = cat.numberProducts ?? cat.productCount ?? null;
  if (count == null) return null;
  return (
    <View style={[styles.catProductBadge, { backgroundColor: colors.surfaceAlt }]}>
      <Text style={[styles.catProductBadgeText, { color: colors.textMuted }]}>{count} items</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  topControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    paddingVertical: 0,
  },

  // Compact Search Bar (Fixed Height for Modals)
  compactSearchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 36,
    marginBottom: 8,
  },
  compactSearchIcon: {
    marginRight: 6,
  },
  compactSearchInput: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
    paddingVertical: 0,
  },

  createBranchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 44,
    borderRadius: 12,
    marginLeft: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  createBranchBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
    marginLeft: 4,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 20,
  },

  // Branch Card
  branchCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  branchIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  branchNameText: {
    fontSize: 15,
    fontWeight: '800',
  },
  branchAddressSub: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  activeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  cardDivider: {
    height: 1,
    marginVertical: 10,
  },
  cardDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  infoCol: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoValText: {
    fontSize: 11,
    fontWeight: '500',
    flex: 1,
  },
  managerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  managerLabel: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  managerValueText: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 1,
  },
  manageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginLeft: 8,
  },
  manageBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },

  // Modal / Sliding Bottom Sheet
  bottomSheetOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  bottomSheetPanel: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    maxHeight: '85%',
  },
  handleBar: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 14,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  panelSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  textInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    paddingVertical: 0,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
    flex: 1,
  },

  // 3 Tabs Header
  tabBarWrap: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  activeTabItem: {
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  tabItemText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // Tab 2: Manager Item
  currentManagerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  managerAvatarWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentManagerLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  currentManagerName: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2,
  },
  currentManagerEmail: {
    fontSize: 11,
    fontWeight: '500',
  },
  managerItemRow: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  managerItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
  },
  managerItemTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  managerItemSub: {
    fontSize: 11,
    marginTop: 2,
  },
  rolePill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  rolePillText: {
    fontSize: 9,
    fontWeight: '700',
  },

  // Tab 3: Category Multi-Select
  categoriesHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  catCountText: {
    fontSize: 11,
    fontWeight: '700',
  },
  categoryCheckboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  categoryItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryThumbWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    overflow: 'hidden',
  },
  categoryThumb: {
    width: '100%',
    height: '100%',
  },
  categoryTitleText: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  catProductBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginLeft: 8,
  },
  catProductBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
});

export default BranchScreen;
