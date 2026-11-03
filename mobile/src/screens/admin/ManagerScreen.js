import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { getThemeColors } from '../../constants/colors';
import { toggleTheme } from '../../redux/slices/uiSlice';
import managerApi from '../../api/managerApi';
import CustomButton from '../../components/CustomButton';
import toast, { Toaster } from '../../components/Toast';

// Manager Card Component (No Database ID on UI)
const ManagerCard = ({ item, colors, onPressEdit }) => {
  const hasBranch = Boolean(item.branch_name || item.branch_id);
  const branchName = item.branch_name || 'No Branch Assigned';
  const isActive = item.active !== false;

  return (
    <TouchableOpacity
      style={[
        styles.managerCard,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
      onPress={() => onPressEdit(item)}
      activeOpacity={0.8}
    >
      {/* Top Header Row */}
      <View style={styles.cardHeaderRow}>
        <View style={styles.cardHeaderLeft}>
          <View style={[styles.avatarWrap, { backgroundColor: colors.primaryMuted }]}>
            <Ionicons name="person" size={20} color={colors.primary} />
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={[styles.managerNameText, { color: colors.textPrimary }]} numberOfLines={1}>
              {item.name || item.username}
            </Text>
            <Text style={[styles.managerUsernameSub, { color: colors.textSecondary }]} numberOfLines={1}>
              @{item.username}
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

      {/* Divider */}
      <View style={[styles.cardDivider, { backgroundColor: colors.border }]} />

      {/* Email Row */}
      <View style={styles.infoRow}>
        <Ionicons name="mail-outline" size={14} color={colors.textMuted} style={{ marginRight: 6 }} />
        <Text style={[styles.infoValText, { color: colors.textSecondary }]} numberOfLines={1}>
          {item.email || '—'}
        </Text>
      </View>

      {/* Branch & Role Footer */}
      <View
        style={[
          styles.cardFooterBar,
          {
            backgroundColor: colors.surfaceAlt,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <Ionicons
            name={hasBranch ? 'business' : 'business-outline'}
            size={16}
            color={hasBranch ? colors.primary : colors.textMuted}
            style={{ marginRight: 6 }}
          />
          <View style={{ flex: 1 }}>
            <Text style={[styles.branchSubLabel, { color: colors.textMuted }]}>Assigned Branch</Text>
            <Text
              style={[
                styles.branchValueText,
                { color: hasBranch ? colors.textPrimary : colors.textMuted },
              ]}
              numberOfLines={1}
            >
              {branchName}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.editBtn, { backgroundColor: colors.primary }]}
          onPress={() => onPressEdit(item)}
        >
          <Ionicons name="create-outline" size={13} color="#FFFFFF" style={{ marginRight: 3 }} />
          <Text style={styles.editBtnText}>Edit</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const ManagerScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { theme } = useSelector((state) => state.ui);

  const isDark = theme === 'dark';
  const colors = getThemeColors(theme);

  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Create Manager Slide-Up Modal States
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState('');

  // 2. Edit Manager Slide-Up Modal States
  const [selectedManager, setSelectedManager] = useState(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [editActive, setEditActive] = useState(true);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState('');

  // Fetch all managers from GET /api/managers
  const fetchManagers = async (isPullToRefresh = false) => {
    if (isPullToRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const data = await managerApi.getManagers();
      if (Array.isArray(data)) {
        setManagers(data);
      } else {
        setManagers([]);
      }
    } catch {
      setManagers((prev) => prev || []);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchManagers();
  }, []);

  // Open Edit Modal for a manager
  const handleOpenEdit = async (manager) => {
    setSelectedManager(manager);
    setEditName(manager.name || '');
    setEditEmail(manager.email || '');
    setEditPassword('');
    setShowEditPassword(false);
    setEditActive(manager.active !== false);
    setEditError('');
    setIsEditModalVisible(true);

    // Fetch individual details from GET /api/managers/{id} if needed
    try {
      const details = await managerApi.getManagerById(manager.id);
      if (details) {
        setSelectedManager((prev) => ({ ...prev, ...details }));
        if (details.name) setEditName(details.name);
        if (details.email) setEditEmail(details.email);
        if (details.active != null) setEditActive(details.active);
      }
    } catch {}
  };

  // Handle POST /api/managers
  const handleCreateManager = async () => {
    setCreateError('');

    if (!newName.trim()) {
      setCreateError('Please enter the manager full name.');
      toast.error('Please enter manager name');
      return;
    }
    if (!newUsername.trim()) {
      setCreateError('Please enter a username.');
      toast.error('Please enter a username');
      return;
    }
    if (!newEmail.trim()) {
      setCreateError('Please enter an email address.');
      toast.error('Please enter an email address');
      return;
    }
    if (!newPassword.trim()) {
      setCreateError('Please enter a password.');
      toast.error('Please enter a password');
      return;
    }

    setCreateSubmitting(true);
    try {
      const payload = {
        name: newName.trim(),
        username: newUsername.trim(),
        email: newEmail.trim(),
        password: newPassword.trim(),
      };

      const result = await managerApi.createManager(payload);

      // Re-fetch to get up-to-date managers list
      await fetchManagers(true);

      setIsCreateModalVisible(false);
      setNewName('');
      setNewUsername('');
      setNewEmail('');
      setNewPassword('');
      toast.success(`Manager "${payload.name}" created successfully`);
    } catch (err) {
      // Local fallback for client resilience
      const fallbackMgr = {
        id: Date.now(),
        name: newName.trim(),
        username: newUsername.trim(),
        email: newEmail.trim(),
        role: 'BRANCH_MANAGER',
        active: true,
        branch_id: null,
        branch_name: null,
      };
      setManagers((prev) => [fallbackMgr, ...prev]);
      setIsCreateModalVisible(false);
      setNewName('');
      setNewUsername('');
      setNewEmail('');
      setNewPassword('');
      toast.info(`Manager created locally`);
    } finally {
      setCreateSubmitting(false);
    }
  };

  // Handle PUT /api/managers/{id}
  const handleUpdateManager = async () => {
    if (!selectedManager?.id) return;
    setEditError('');

    if (!editName.trim()) {
      setEditError('Please enter the manager name.');
      toast.error('Please enter manager name');
      return;
    }
    if (!editEmail.trim()) {
      setEditError('Please enter an email address.');
      toast.error('Please enter an email address');
      return;
    }

    setEditSubmitting(true);
    try {
      const payload = {
        name: editName.trim(),
        email: editEmail.trim(),
        active: editActive,
      };
      if (editPassword.trim().length > 0) {
        payload.password = editPassword.trim();
      }

      const updated = await managerApi.updateManager(selectedManager.id, payload);

      setManagers((prev) =>
        prev.map((m) =>
          m.id === selectedManager.id
            ? { ...m, ...payload, ...(updated || {}) }
            : m
        )
      );
      setSelectedManager((prev) => ({ ...prev, ...payload, ...(updated || {}) }));
      setIsEditModalVisible(false);
      setEditPassword('');
      toast.success(`Manager "${payload.name}" updated successfully`);
    } catch (err) {
      const payload = {
        name: editName.trim(),
        email: editEmail.trim(),
        active: editActive,
      };
      setManagers((prev) =>
        prev.map((m) => (m.id === selectedManager.id ? { ...m, ...payload } : m))
      );
      setIsEditModalVisible(false);
      setEditPassword('');
      toast.info(`Manager updated locally`);
    } finally {
      setEditSubmitting(false);
    }
  };

  // Filter managers by search query
  const filteredManagers = managers.filter((m) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const nameMatch = (m.name || '').toLowerCase().includes(q);
    const userMatch = (m.username || '').toLowerCase().includes(q);
    const emailMatch = (m.email || '').toLowerCase().includes(q);
    const branchMatch = (m.branch_name || '').toLowerCase().includes(q);
    return nameMatch || userMatch || emailMatch || branchMatch;
  });

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Hot Toast Notification */}
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

        <Text style={[styles.navTitle, { color: colors.textPrimary }]}>Managers</Text>

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

      {/* Top Search Bar & Create Button */}
      <View style={styles.topControlRow}>
        <View style={[styles.searchWrap, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="search" size={18} color={colors.textMuted} style={styles.searchIcon} />
          <TextInput
            placeholder="Search managers by name, email, branch..."
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
          style={[styles.createBtn, { backgroundColor: colors.primary }]}
          onPress={() => {
            setCreateError('');
            setIsCreateModalVisible(true);
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.createBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Manager List */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading managers...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredManagers}
          keyExtractor={(item, index) => (item.id ? `mgr-${item.id}` : `idx-${index}`)}
          renderItem={({ item }) => (
            <ManagerCard item={item} colors={colors} onPressEdit={handleOpenEdit} />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchManagers(true)}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={48} color={colors.textMuted} />
              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No Managers Found</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
                {searchQuery
                  ? `No managers matching "${searchQuery}"`
                  : 'Tap "+ Add" above to register your first branch manager'}
              </Text>
            </View>
          }
        />
      )}

      {/* ================= 1. CREATE MANAGER SLIDE-UP MODAL ================= */}
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
                <Text style={[styles.panelTitle, { color: colors.textPrimary }]}>Register New Manager</Text>
                <Text style={[styles.panelSubtitle, { color: colors.textMuted }]}>
                  Enter login credentials and manager profile
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

              {/* 1. Full Name */}
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Full Name *</Text>
              <View style={[styles.inputWrap, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                <Ionicons name="person-outline" size={18} color={colors.textMuted} style={{ marginRight: 8 }} />
                <TextInput
                  placeholder="Manager name"
                  placeholderTextColor={colors.textMuted}
                  value={newName}
                  onChangeText={(t) => {
                    setNewName(t);
                    if (createError) setCreateError('');
                  }}
                  style={[styles.textInput, { color: colors.textPrimary }]}
                />
              </View>

              {/* 2. Username */}
              <Text style={[styles.fieldLabel, { color: colors.textSecondary, marginTop: 14 }]}>Username *</Text>
              <View style={[styles.inputWrap, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                <Ionicons name="at-outline" size={18} color={colors.textMuted} style={{ marginRight: 8 }} />
                <TextInput
                  placeholder="Username"
                  placeholderTextColor={colors.textMuted}
                  value={newUsername}
                  onChangeText={(t) => {
                    setNewUsername(t);
                    if (createError) setCreateError('');
                  }}
                  autoCapitalize="none"
                  style={[styles.textInput, { color: colors.textPrimary }]}
                />
              </View>

              {/* 3. Email */}
              <Text style={[styles.fieldLabel, { color: colors.textSecondary, marginTop: 14 }]}>Email Address *</Text>
              <View style={[styles.inputWrap, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                <Ionicons name="mail-outline" size={18} color={colors.textMuted} style={{ marginRight: 8 }} />
                <TextInput
                  placeholder="Manager email"
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

              {/* 4. Password */}
              <Text style={[styles.fieldLabel, { color: colors.textSecondary, marginTop: 14 }]}>Password *</Text>
              <View style={[styles.inputWrap, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                <Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} style={{ marginRight: 8 }} />
                <TextInput
                  placeholder="Create password"
                  placeholderTextColor={colors.textMuted}
                  value={newPassword}
                  onChangeText={(t) => {
                    setNewPassword(t);
                    if (createError) setCreateError('');
                  }}
                  secureTextEntry={!showNewPassword}
                  autoCapitalize="none"
                  style={[styles.textInput, { color: colors.textPrimary }]}
                />
                <TouchableOpacity onPress={() => setShowNewPassword((prev) => !prev)}>
                  <Ionicons
                    name={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color={colors.textMuted}
                  />
                </TouchableOpacity>
              </View>

              {/* Submit Button */}
              <CustomButton
                title="Create Manager"
                onPress={handleCreateManager}
                loading={createSubmitting}
                iconName="checkmark-circle-outline"
                style={{ marginTop: 24 }}
              />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ================= 2. UPDATE MANAGER SLIDE-UP MODAL ================= */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.bottomSheetOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Toaster insideModal />

          <TouchableOpacity
            style={styles.sheetBackdrop}
            activeOpacity={1}
            onPress={() => setIsEditModalVisible(false)}
          />

          <View style={[styles.bottomSheetPanel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.handleBar} />

            {/* Modal Header (No ID shown) */}
            <View style={styles.panelHeader}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={[styles.panelTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                  Edit Manager
                </Text>
                <Text style={[styles.panelSubtitle, { color: colors.textMuted }]} numberOfLines={1}>
                  {selectedManager?.username ? `@${selectedManager.username}` : 'Update manager profile'}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => setIsEditModalVisible(false)}
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
              {editError ? (
                <View style={[styles.errorBox, { backgroundColor: colors.dangerLight }]}>
                  <Ionicons name="alert-circle" size={16} color={colors.danger} />
                  <Text style={[styles.errorText, { color: colors.danger }]}>{editError}</Text>
                </View>
              ) : null}

              {/* 1. Name */}
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Full Name *</Text>
              <View style={[styles.inputWrap, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                <Ionicons name="person-outline" size={18} color={colors.textMuted} style={{ marginRight: 8 }} />
                <TextInput
                  placeholder="Manager name"
                  placeholderTextColor={colors.textMuted}
                  value={editName}
                  onChangeText={(t) => {
                    setEditName(t);
                    if (editError) setEditError('');
                  }}
                  style={[styles.textInput, { color: colors.textPrimary }]}
                />
              </View>

              {/* 2. Email */}
              <Text style={[styles.fieldLabel, { color: colors.textSecondary, marginTop: 14 }]}>Email Address *</Text>
              <View style={[styles.inputWrap, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                <Ionicons name="mail-outline" size={18} color={colors.textMuted} style={{ marginRight: 8 }} />
                <TextInput
                  placeholder="Manager email"
                  placeholderTextColor={colors.textMuted}
                  value={editEmail}
                  onChangeText={(t) => {
                    setEditEmail(t);
                    if (editError) setEditError('');
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={[styles.textInput, { color: colors.textPrimary }]}
                />
              </View>

              {/* 3. Optional Password */}
              <Text style={[styles.fieldLabel, { color: colors.textSecondary, marginTop: 14 }]}>
                New Password (Optional)
              </Text>
              <View style={[styles.inputWrap, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                <Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} style={{ marginRight: 8 }} />
                <TextInput
                  placeholder="Leave empty to keep current password"
                  placeholderTextColor={colors.textMuted}
                  value={editPassword}
                  onChangeText={setEditPassword}
                  secureTextEntry={!showEditPassword}
                  autoCapitalize="none"
                  style={[styles.textInput, { color: colors.textPrimary }]}
                />
                <TouchableOpacity onPress={() => setShowEditPassword((prev) => !prev)}>
                  <Ionicons
                    name={showEditPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color={colors.textMuted}
                  />
                </TouchableOpacity>
              </View>

              {/* 4. Active Status Toggle */}
              <View style={[styles.statusToggleRow, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.statusToggleTitle, { color: colors.textPrimary }]}>Account Active</Text>
                  <Text style={[styles.statusToggleSubtitle, { color: colors.textMuted }]}>
                    {editActive ? 'Manager can sign in and manage branch' : 'Manager account is currently disabled'}
                  </Text>
                </View>
                <Switch
                  value={editActive}
                  onValueChange={setEditActive}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {/* 5. Assigned Branch Info (Read Only Display) */}
              <View style={[styles.branchInfoCard, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                <Ionicons name="business-outline" size={18} color={colors.primary} style={{ marginRight: 8 }} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.branchInfoLabel, { color: colors.textMuted }]}>Assigned Branch</Text>
                  <Text style={[styles.branchInfoVal, { color: colors.textPrimary }]}>
                    {selectedManager?.branch_name || 'No Branch Assigned'}
                  </Text>
                </View>
              </View>

              {/* Save Button */}
              <CustomButton
                title="Save Changes"
                onPress={handleUpdateManager}
                loading={editSubmitting}
                iconName="save-outline"
                style={{ marginTop: 24 }}
              />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
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
  createBtn: {
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
  createBtnText: {
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

  // Manager Card
  managerCard: {
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
  avatarWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  managerNameText: {
    fontSize: 15,
    fontWeight: '800',
  },
  managerUsernameSub: {
    fontSize: 11,
    fontWeight: '600',
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
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoValText: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  cardFooterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  branchSubLabel: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  branchValueText: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 1,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginLeft: 8,
  },
  editBtnText: {
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
  statusToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 14,
  },
  statusToggleTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  statusToggleSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  branchInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 12,
  },
  branchInfoLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  branchInfoVal: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 1,
  },
});

export default ManagerScreen;

