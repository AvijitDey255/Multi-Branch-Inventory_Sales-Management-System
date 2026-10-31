import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { darkColors, lightColors } from '../theme/colors';
import { fetchManagers, createBranch, fetchBranches } from '../store/branchesSlice';
import { toast } from './Toast';

export default function AddBranchModal({ visible, onClose }) {
  const dispatch = useDispatch();
  const mode = useSelector((state) => state.theme?.mode || 'dark');
  const isDark = mode === 'dark';
  const colors = isDark ? darkColors : lightColors;

  const { managers, managersLoading, createLoading } = useSelector(
    (state) => state.branches
  );

  // Form Fields State
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [selectedManagerId, setSelectedManagerId] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Dropdown UI toggle
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [errors, setErrors] = useState({});

  // Fetch managers from /api/users/managers when modal opens
  useEffect(() => {
    if (visible) {
      dispatch(fetchManagers());
      // Reset form
      setName('');
      setAddress('');
      setPhone('');
      setEmail('');
      setSelectedManagerId('');
      setIsActive(true);
      setIsDropdownOpen(false);
      setErrors({});
    }
  }, [visible, dispatch]);

  const selectedManager = managers.find((m) => m._id === selectedManagerId) || null;

  const validate = () => {
    const errs = {};
    if (!name.trim()) {
      errs.name = 'Branch name is required';
    }
    if (email.trim() && !/^\S+@\S+\.\S+$/.test(email.trim())) {
      errs.email = 'Please enter a valid email address';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      const payload = {
        name: name.trim(),
        address: address.trim(),
        phone: phone.trim(),
        email: email.trim(),
        manager_id: selectedManagerId || null,
        isActive,
      };

      const resultAction = await dispatch(createBranch(payload));

      if (createBranch.fulfilled.match(resultAction)) {
        const payloadData = resultAction.payload;
        toast.success(
          payloadData?.message || 'Branch created successfully',
          'Success'
        );
        // Refresh branches list
        dispatch(fetchBranches({}));
        onClose();
      } else {
        toast.error(resultAction.payload || 'Failed to create branch', 'Error');
      }
    } catch (err) {
      toast.error(err.message || 'Error creating branch', 'Error');
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalBackdrop}
      >
        {/* Backdrop tap to dismiss */}
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={[styles.backdropTouchArea, { backgroundColor: colors.drawerOverlay }]} />
        </TouchableWithoutFeedback>

        {/* Bottom Sheet Card */}
        <View style={[styles.sheetContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* Sheet Handle */}
          <View style={styles.sheetHandleWrap}>
            <View style={[styles.sheetHandle, { backgroundColor: colors.textMuted }]} />
          </View>

          {/* Sheet Header */}
          <View style={[styles.sheetHeader, { borderBottomColor: colors.border }]}>
            <View style={styles.headerTitleWrap}>
              <View style={[styles.headerIconBox, { backgroundColor: colors.primaryLight }]}>
                <MaterialCommunityIcons name="office-building-plus" size={22} color={colors.primary} />
              </View>
              <View>
                <Text style={[styles.sheetTitle, { color: colors.text }]}>Add New Branch</Text>
                <Text style={[styles.sheetSubtitle, { color: colors.textSecondary }]}>
                  Configure details & assign branch manager
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: colors.surfaceElevated }]}
            >
              <MaterialCommunityIcons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Scrollable Form Content */}
          <ScrollView
            style={styles.formScroll}
            contentContainerStyle={styles.formScrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Branch Name */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                Branch Name <Text style={{ color: colors.danger }}>*</Text>
              </Text>
              <View
                style={[
                  styles.inputWrap,
                  {
                    backgroundColor: colors.inputBackground,
                    borderColor: errors.name ? colors.danger : colors.inputBorder,
                  },
                ]}
              >
                <MaterialCommunityIcons name="office-building" size={20} color={colors.textMuted} style={styles.fieldIcon} />
                <TextInput
                  value={name}
                  onChangeText={(val) => {
                    setName(val);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
                  }}
                  placeholder="e.g. North Point Plaza Branch"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.textInput, { color: colors.text }]}
                />
              </View>
              {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
            </View>

            {/* Address */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Address</Text>
              <View
                style={[
                  styles.inputWrap,
                  {
                    backgroundColor: colors.inputBackground,
                    borderColor: colors.inputBorder,
                  },
                ]}
              >
                <MaterialCommunityIcons name="map-marker-outline" size={20} color={colors.textMuted} style={styles.fieldIcon} />
                <TextInput
                  value={address}
                  onChangeText={setAddress}
                  placeholder="e.g. 77 North Street, Downtown"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.textInput, { color: colors.text }]}
                />
              </View>
            </View>

            {/* Phone & Email Row */}
            <View style={styles.rowTwoCol}>
              {/* Phone */}
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Phone Number</Text>
                <View
                  style={[
                    styles.inputWrap,
                    {
                      backgroundColor: colors.inputBackground,
                      borderColor: colors.inputBorder,
                    },
                  ]}
                >
                  <MaterialCommunityIcons name="phone-outline" size={18} color={colors.textMuted} style={styles.fieldIcon} />
                  <TextInput
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="9900112233"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="phone-pad"
                    style={[styles.textInput, { color: colors.text }]}
                  />
                </View>
              </View>

              {/* Email */}
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Branch Email</Text>
                <View
                  style={[
                    styles.inputWrap,
                    {
                      backgroundColor: colors.inputBackground,
                      borderColor: errors.email ? colors.danger : colors.inputBorder,
                    },
                  ]}
                >
                  <MaterialCommunityIcons name="email-outline" size={18} color={colors.textMuted} style={styles.fieldIcon} />
                  <TextInput
                    value={email}
                    onChangeText={(val) => {
                      setEmail(val);
                      if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
                    }}
                    placeholder="branch@apex.com"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={[styles.textInput, { color: colors.text }]}
                  />
                </View>
              </View>
            </View>
            {errors.email ? <Text style={[styles.errorText, { marginTop: -6, marginBottom: 8 }]}>{errors.email}</Text> : null}

            {/* Manager Dropdown (From /api/users/managers) */}
            <View style={styles.inputGroup}>
              <View style={styles.labelWithAction}>
                <Text style={[styles.inputLabel, { color: colors.text, marginBottom: 0 }]}>
                  Branch Manager
                </Text>
                <TouchableOpacity
                  onPress={() => dispatch(fetchManagers())}
                  style={styles.refreshManagersBtn}
                  disabled={managersLoading}
                >
                  {managersLoading ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <>
                      <MaterialCommunityIcons name="refresh" size={14} color={colors.primary} />
                      <Text style={[styles.refreshManagersText, { color: colors.primary }]}>
                        /api/users/managers
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              {/* Dropdown Selector Button */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setIsDropdownOpen(!isDropdownOpen)}
                style={[
                  styles.dropdownSelector,
                  {
                    backgroundColor: colors.inputBackground,
                    borderColor: isDropdownOpen ? colors.primary : colors.inputBorder,
                  },
                ]}
              >
                <View style={styles.dropdownSelectorLeft}>
                  <View
                    style={[
                      styles.managerAvatarMini,
                      {
                        backgroundColor: selectedManager
                          ? colors.primaryLight
                          : colors.surfaceElevated,
                      },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={selectedManager ? 'account-tie' : 'account-question-outline'}
                      size={18}
                      color={selectedManager ? colors.primary : colors.textMuted}
                    />
                  </View>

                  <View style={styles.managerSelectedTextWrap}>
                    {selectedManager ? (
                      <>
                        <Text style={[styles.managerSelectedName, { color: colors.text }]}>
                          {selectedManager.name || selectedManager.username}
                        </Text>
                        <Text style={[styles.managerSelectedEmail, { color: colors.textSecondary }]}>
                          {selectedManager.email || 'No email provided'}
                        </Text>
                      </>
                    ) : (
                      <Text style={[styles.placeholderText, { color: colors.textMuted }]}>
                        Select Manager from dropdown...
                      </Text>
                    )}
                  </View>
                </View>

                <MaterialCommunityIcons
                  name={isDropdownOpen ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={colors.textMuted}
                />
              </TouchableOpacity>

              {/* Dropdown List Body */}
              {isDropdownOpen && (
                <View
                  style={[
                    styles.dropdownListContainer,
                    {
                      backgroundColor: colors.surfaceElevated,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  {/* Unassigned / None Option */}
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedManagerId('');
                      setIsDropdownOpen(false);
                    }}
                    style={[
                      styles.dropdownItem,
                      {
                        borderBottomColor: colors.border,
                        backgroundColor: !selectedManagerId
                          ? colors.primaryLight
                          : 'transparent',
                      },
                    ]}
                  >
                    <View style={styles.dropdownItemLeft}>
                      <View style={[styles.itemIconCircle, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                        <MaterialCommunityIcons name="account-off-outline" size={18} color="#F59E0B" />
                      </View>
                      <View>
                        <Text style={[styles.itemTitle, { color: colors.text }]}>None (Unassigned)</Text>
                        <Text style={[styles.itemSub, { color: colors.textMuted }]}>
                          Leave branch manager position vacant
                        </Text>
                      </View>
                    </View>
                    {!selectedManagerId && (
                      <MaterialCommunityIcons name="check-circle" size={18} color={colors.primary} />
                    )}
                  </TouchableOpacity>

                  {/* List of managers */}
                  {managersLoading ? (
                    <View style={styles.managersLoadingBox}>
                      <ActivityIndicator size="small" color={colors.primary} />
                      <Text style={[styles.managersLoadingText, { color: colors.textSecondary }]}>
                        Loading managers from /api/users/managers...
                      </Text>
                    </View>
                  ) : managers.length === 0 ? (
                    <View style={styles.emptyManagersBox}>
                      <Text style={[styles.emptyManagersText, { color: colors.textMuted }]}>
                        No managers found in backend
                      </Text>
                    </View>
                  ) : (
                    managers.map((m) => {
                      const isSelected = selectedManagerId === m._id;
                      return (
                        <TouchableOpacity
                          key={m._id}
                          onPress={() => {
                            setSelectedManagerId(m._id);
                            setIsDropdownOpen(false);
                          }}
                          style={[
                            styles.dropdownItem,
                            {
                              borderBottomColor: colors.border,
                              backgroundColor: isSelected ? colors.primaryLight : 'transparent',
                            },
                          ]}
                        >
                          <View style={styles.dropdownItemLeft}>
                            <View style={[styles.itemIconCircle, { backgroundColor: colors.primaryLight }]}>
                              <MaterialCommunityIcons name="account-tie" size={18} color={colors.primary} />
                            </View>
                            <View style={styles.managerInfoCol}>
                              <Text style={[styles.itemTitle, { color: colors.text }]}>
                                {m.name || m.username || 'Unnamed Manager'}
                              </Text>
                              <Text style={[styles.itemSub, { color: colors.textSecondary }]}>
                                {m.email || 'No email'}
                              </Text>
                            </View>
                          </View>

                          {isSelected && (
                            <MaterialCommunityIcons name="check-circle" size={18} color={colors.primary} />
                          )}
                        </TouchableOpacity>
                      );
                    })
                  )}
                </View>
              )}
            </View>

            {/* IsActive Toggle */}
            <View
              style={[
                styles.statusToggleCard,
                {
                  backgroundColor: colors.surfaceElevated,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.statusToggleLeft}>
                <View
                  style={[
                    styles.statusIndicatorDot,
                    { backgroundColor: isActive ? '#10B981' : colors.textMuted },
                  ]}
                />
                <View>
                  <Text style={[styles.statusToggleTitle, { color: colors.text }]}>
                    Branch Status: {isActive ? 'Active' : 'Inactive'}
                  </Text>
                  <Text style={[styles.statusToggleSub, { color: colors.textSecondary }]}>
                    {isActive
                      ? 'Branch is open for bookings and operations'
                      : 'Branch operations temporarily paused'}
                  </Text>
                </View>
              </View>

              <Switch
                value={isActive}
                onValueChange={setIsActive}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={Platform.OS === 'android' ? (isActive ? '#FFFFFF' : '#94A3B8') : undefined}
              />
            </View>

            {/* Endpoint Reference Banner */}
            <View style={[styles.endpointBadgeBox, { backgroundColor: isDark ? '#1E293B' : '#EEF2FF' }]}>
              <MaterialCommunityIcons name="api" size={16} color={colors.primary} />
              <Text style={[styles.endpointBadgeText, { color: colors.primary }]}>
                Sends POST to /api/branches with manager_id
              </Text>
            </View>
          </ScrollView>

          {/* Footer Action Buttons */}
          <View style={[styles.sheetFooter, { borderTopColor: colors.border, backgroundColor: colors.surface }]}>
            <TouchableOpacity
              onPress={onClose}
              disabled={createLoading}
              style={[
                styles.cancelBtn,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.surfaceElevated,
                },
              ]}
            >
              <Text style={[styles.cancelBtnText, { color: colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={createLoading}
              style={[
                styles.submitBtn,
                {
                  backgroundColor: colors.primary,
                  opacity: createLoading ? 0.7 : 1,
                },
              ]}
            >
              {createLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <MaterialCommunityIcons name="check" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.submitBtnText}>Create Branch</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdropTouchArea: {
    ...StyleSheet.absoluteFillObject,
  },
  sheetContainer: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    maxHeight: '88%',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  sheetHandleWrap: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  sheetHandle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    opacity: 0.4,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  headerIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  sheetSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formScroll: {
    paddingHorizontal: 20,
  },
  formScrollContent: {
    paddingVertical: 16,
    paddingBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 48,
  },
  fieldIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
  rowTwoCol: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  errorText: {
    fontSize: 11,
    color: '#EF4444',
    marginTop: 4,
    fontWeight: '500',
  },
  labelWithAction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  refreshManagersBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  refreshManagersText: {
    fontSize: 11,
    fontWeight: '600',
  },
  dropdownSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    minHeight: 52,
  },
  dropdownSelectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  managerAvatarMini: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  managerSelectedTextWrap: {
    flex: 1,
  },
  managerSelectedName: {
    fontSize: 14,
    fontWeight: '700',
  },
  managerSelectedEmail: {
    fontSize: 11,
    marginTop: 1,
  },
  placeholderText: {
    fontSize: 13,
  },
  dropdownListContainer: {
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 6,
    overflow: 'hidden',
    maxHeight: 220,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  dropdownItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  itemIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  managerInfoCol: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  itemSub: {
    fontSize: 11,
    marginTop: 2,
  },
  managersLoadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  managersLoadingText: {
    fontSize: 12,
  },
  emptyManagersBox: {
    padding: 16,
    alignItems: 'center',
  },
  emptyManagersText: {
    fontSize: 12,
  },
  statusToggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  statusToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  statusIndicatorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusToggleTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  statusToggleSub: {
    fontSize: 11,
    marginTop: 2,
  },
  endpointBadgeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  endpointBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  sheetFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  submitBtn: {
    flex: 2,
    height: 46,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
