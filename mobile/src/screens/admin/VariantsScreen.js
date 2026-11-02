import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  RefreshControl,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { getThemeColors } from '../../constants/colors';
import { toggleTheme } from '../../redux/slices/uiSlice';
import variantsApi from '../../api/variantsApi';
import CustomButton from '../../components/CustomButton';

// 7 Standard variant types specified by user
// packagingTyp, volume, brand, units, size, color, weight
const KNOWN_VARIANT_TYPES = [
  {
    key: 'packagingType',
    altKey: 'packagingTyp',
    label: 'Packaging Type',
    icon: 'cube-outline',
    color: '#6366F1',
    bgLight: '#EEF2FF',
    bgDark: '#1E1B4B',
    placeholder: 'Bottle, Pouch, Box, Can',
  },
  {
    key: 'volume',
    altKey: 'volume',
    label: 'Volume',
    icon: 'beaker-outline',
    color: '#06B6D4',
    bgLight: '#ECFEFF',
    bgDark: '#164E63',
    placeholder: '1 L, 500 ml, 250 ml',
  },
  {
    key: 'brand',
    altKey: 'brand',
    label: 'Brand',
    icon: 'ribbon-outline',
    color: '#8B5CF6',
    bgLight: '#F5F3FF',
    bgDark: '#2E1065',
    placeholder: 'Nike, Apple, Samsung, Nestlé',
  },
  {
    key: 'units',
    altKey: 'units',
    label: 'Units',
    icon: 'calculator-outline',
    color: '#10B981',
    bgLight: '#ECFDF5',
    bgDark: '#064E3B',
    placeholder: 'pcs, dozen, pack, set',
  },
  {
    key: 'size',
    altKey: 'size',
    label: 'Size',
    icon: 'resize-outline',
    color: '#F59E0B',
    bgLight: '#FFFBEB',
    bgDark: '#451A03',
    placeholder: 'S, M, L, XL, XXL, 42',
  },
  {
    key: 'color',
    altKey: 'color',
    label: 'Color',
    icon: 'color-palette-outline',
    color: '#EC4899',
    bgLight: '#FDF2F8',
    bgDark: '#500724',
    placeholder: 'Red, Blue, Black, White, Green',
  },
  {
    key: 'weight',
    altKey: 'weight',
    label: 'Weight',
    icon: 'scale-outline',
    color: '#3B82F6',
    bgLight: '#EFF6FF',
    bgDark: '#1E293B',
    placeholder: '1 kg, 500 gm, 250 gm, 5 kg',
  },
];

const VariantsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { theme } = useSelector((state) => state.ui);

  const isDark = theme === 'dark';
  const colors = getThemeColors(theme);

  // Variants map state: { [variantName]: [ { id, name, value } ] }
  const [variantsMap, setVariantsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Add Variant Bottom Sheet Modal states
  const [isPanelVisible, setIsPanelVisible] = useState(false);
  const [selectedType, setSelectedType] = useState('packagingType');
  const [enteredName, setEnteredName] = useState('packagingType');
  const [enteredValue, setEnteredValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Fetch all variants from GET /api/variants
  const fetchVariants = async (isPullToRefresh = false) => {
    if (isPullToRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const data = await variantsApi.getVariants();
      if (data && typeof data === 'object') {
        setVariantsMap(data);
      } else {
        setVariantsMap({});
      }
    } catch {
      // Retain existing map if offline
      setVariantsMap((prev) => prev || {});
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchVariants();
  }, []);

  // Helper to open slide-up modal for a specific variant type
  const openAddPanelForType = (typeKey) => {
    setSelectedType(typeKey);
    setEnteredName(typeKey);
    setEnteredValue('');
    setFormError('');
    setIsPanelVisible(true);
  };

  // Handle POST /api/variants with { name, value }
  const handleSaveVariant = async () => {
    setFormError('');

    const targetName = (enteredName || selectedType || '').trim();
    const targetValue = enteredValue.trim();

    if (!targetName) {
      setFormError('Please select or enter a variant name.');
      return;
    }

    if (!targetValue) {
      setFormError('Please enter a variant value.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: targetName,
        value: targetValue,
      };

      const result = await variantsApi.createVariant(payload);

      // Prepend or append to local map so UI updates immediately
      const newVariantItem = {
        id: result?.id || Date.now(),
        name: payload.name,
        value: payload.value,
      };

      setVariantsMap((prev) => {
        const currentList = prev[targetName] || prev[targetName === 'packagingType' ? 'packagingTyp' : targetName] || [];
        return {
          ...prev,
          [targetName]: [...currentList, newVariantItem],
        };
      });

      setIsPanelVisible(false);
      setEnteredValue('');
      Alert.alert('Success', `Variant "${payload.value}" added under "${payload.name}" successfully.`);
    } catch (err) {
      // If server error, still add locally for smooth UX
      const fallbackItem = {
        id: Date.now(),
        name: targetName,
        value: targetValue,
      };
      setVariantsMap((prev) => {
        const currentList = prev[targetName] || [];
        return {
          ...prev,
          [targetName]: [...currentList, fallbackItem],
        };
      });
      setIsPanelVisible(false);
      setEnteredValue('');
      Alert.alert('Notice', `Variant saved locally. (${err.message || 'Server offline'})`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get items for a variant type (checking both canonical and alt keys)
  const getItemsForType = (typeConfig) => {
    const list =
      variantsMap[typeConfig.key] ||
      (typeConfig.altKey && variantsMap[typeConfig.altKey]) ||
      [];

    if (!searchQuery.trim()) {
      return list;
    }

    const query = searchQuery.toLowerCase().trim();
    return list.filter((item) => {
      const val = (item.value || '').toLowerCase();
      const name = (item.name || '').toLowerCase();
      return val.includes(query) || name.includes(query);
    });
  };

  // Find active configuration for modal placeholder & styling
  const activeTypeConfig =
    KNOWN_VARIANT_TYPES.find((v) => v.key === selectedType) || KNOWN_VARIANT_TYPES[0];

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Top Navigation Bar */}
      <View style={[styles.navBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.navBtn, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
        </TouchableOpacity>

        <Text style={[styles.navTitle, { color: colors.textPrimary }]}>Product Variants</Text>

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

      {/* Search Bar & Quick Add Button Row */}
      <View style={styles.topControlRow}>
        <View style={[styles.searchWrap, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="search" size={18} color={colors.textMuted} style={styles.searchIcon} />
          <TextInput
            placeholder="Search variant values..."
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
          style={[styles.addVariantTopBtn, { backgroundColor: colors.primary }]}
          onPress={() => openAddPanelForType(selectedType || 'packagingType')}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.addVariantTopBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content Area */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading variants...
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchVariants(true)}
              tintColor={colors.primary}
            />
          }
        >
          {/* Render each of the 7 variant sections */}
          {KNOWN_VARIANT_TYPES.map((typeConfig) => {
            const items = getItemsForType(typeConfig);
            const totalCount =
              (variantsMap[typeConfig.key] || (typeConfig.altKey && variantsMap[typeConfig.altKey]) || []).length;
            const typeBg = isDark ? typeConfig.bgDark : typeConfig.bgLight;

            return (
              <View
                key={typeConfig.key}
                style={[
                  styles.sectionCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                {/* Section Header */}
                <View style={[styles.sectionHeaderRow, { borderBottomColor: colors.border }]}>
                  <View style={styles.sectionHeaderLeft}>
                    <View style={[styles.typeIconWrap, { backgroundColor: typeBg }]}>
                      <Ionicons name={typeConfig.icon} size={20} color={typeConfig.color} />
                    </View>
                    <View style={{ marginLeft: 10 }}>
                      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                        {typeConfig.label}
                      </Text>
                      <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>
                        Key: {typeConfig.key}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.sectionHeaderRight}>
                    <View style={[styles.countBadge, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                      <Text style={[styles.countBadgeText, { color: colors.textSecondary }]}>
                        {totalCount} {totalCount === 1 ? 'val' : 'vals'}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={[styles.sectionAddBtn, { backgroundColor: typeConfig.color }]}
                      onPress={() => openAddPanelForType(typeConfig.key)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="add" size={16} color="#FFFFFF" />
                      <Text style={styles.sectionAddBtnText}>Add</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Section Values Grid / List */}
                <View style={styles.sectionBody}>
                  {items.length === 0 ? (
                    <View style={[styles.emptySectionBox, { backgroundColor: colors.surfaceAlt }]}>
                      <Ionicons name="information-circle-outline" size={18} color={colors.textMuted} />
                      <Text style={[styles.emptySectionText, { color: colors.textMuted }]}>
                        {searchQuery ? `No ${typeConfig.label} matching "${searchQuery}"` : `No ${typeConfig.label} values added yet`}
                      </Text>
                      {!searchQuery && (
                        <TouchableOpacity
                          onPress={() => openAddPanelForType(typeConfig.key)}
                          style={{ marginTop: 4 }}
                        >
                          <Text style={[styles.emptyAddLink, { color: typeConfig.color }]}>
                            + Add {typeConfig.label}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  ) : (
                    <View style={styles.valuesGrid}>
                      {items.map((item, idx) => (
                        <View
                          key={item.id ? `variant-${item.id}` : `idx-${idx}`}
                          style={[
                            styles.valuePill,
                            {
                              backgroundColor: colors.surfaceAlt,
                              borderColor: colors.border,
                            },
                          ]}
                        >
                          <Text style={[styles.valueText, { color: colors.textPrimary }]}>
                            {item.value}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* ================= BOTTOM-TO-UP PANEL MODAL ================= */}
      <Modal
        visible={isPanelVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setIsPanelVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.bottomSheetOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <TouchableOpacity
            style={styles.sheetBackdrop}
            activeOpacity={1}
            onPress={() => setIsPanelVisible(false)}
          />

          <View
            style={[
              styles.bottomSheetPanel,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            {/* Grab Handle */}
            <View style={styles.handleBar} />

            {/* Panel Header */}
            <View style={styles.panelHeader}>
              <View>
                <Text style={[styles.panelTitle, { color: colors.textPrimary }]}>Add Variant Value</Text>
                <Text style={[styles.panelSubtitle, { color: colors.textMuted }]}>
                  Target: {activeTypeConfig.label} ({selectedType})
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsPanelVisible(false)}
                style={[styles.closeBtn, { backgroundColor: colors.surfaceAlt }]}
              >
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 24 }}
            >
              {/* Error Box */}
              {formError ? (
                <View style={[styles.errorBox, { backgroundColor: colors.dangerLight }]}>
                  <Ionicons name="alert-circle" size={16} color={colors.danger} />
                  <Text style={[styles.errorText, { color: colors.danger }]}>{formError}</Text>
                </View>
              ) : null}

              {/* 1. Variant Name (name) */}
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                Variant Name (name) *
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.typeSelectorRow}
              >
                {KNOWN_VARIANT_TYPES.map((type) => {
                  const isSelected = selectedType === type.key || enteredName === type.key;
                  return (
                    <TouchableOpacity
                      key={type.key}
                      style={[
                        styles.typeSelectorChip,
                        {
                          backgroundColor: isSelected ? type.color : colors.surfaceAlt,
                          borderColor: isSelected ? type.color : colors.border,
                        },
                      ]}
                      onPress={() => {
                        setSelectedType(type.key);
                        setEnteredName(type.key);
                        if (formError) setFormError('');
                      }}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={type.icon}
                        size={15}
                        color={isSelected ? '#FFFFFF' : colors.textSecondary}
                        style={{ marginRight: 6 }}
                      />
                      <Text
                        style={[
                          styles.typeSelectorChipText,
                          { color: isSelected ? '#FFFFFF' : colors.textPrimary },
                        ]}
                      >
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <View
                style={[
                  styles.inputWrap,
                  {
                    backgroundColor: colors.surfaceAlt,
                    borderColor: colors.border,
                    marginTop: 6,
                  },
                ]}
              >
                <Ionicons name="pricetag-outline" size={18} color={colors.textMuted} style={{ marginRight: 8 }} />
                <TextInput
                  placeholder="packagingType, volume, brand..."
                  placeholderTextColor={colors.textMuted}
                  value={enteredName}
                  onChangeText={(text) => {
                    setEnteredName(text);
                    setSelectedType(text);
                    if (formError) setFormError('');
                  }}
                  style={[styles.textInput, { color: colors.textPrimary }]}
                />
              </View>

              {/* 2. Variant Value (value) */}
              <Text style={[styles.fieldLabel, { color: colors.textSecondary, marginTop: 14 }]}>
                Variant Value (value) *
              </Text>
              <View
                style={[
                  styles.inputWrap,
                  {
                    backgroundColor: colors.surfaceAlt,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Ionicons name="pencil-outline" size={18} color={colors.textMuted} style={{ marginRight: 8 }} />
                <TextInput
                  placeholder={activeTypeConfig.placeholder || 'Variant value'}
                  placeholderTextColor={colors.textMuted}
                  value={enteredValue}
                  onChangeText={(text) => {
                    setEnteredValue(text);
                    if (formError) setFormError('');
                  }}
                  autoFocus
                  style={[styles.textInput, { color: colors.textPrimary }]}
                />
                {enteredValue ? (
                  <TouchableOpacity onPress={() => setEnteredValue('')}>
                    <Ionicons name="close-circle" size={18} color={colors.textMuted} />
                  </TouchableOpacity>
                ) : null}
              </View>

              {/* Save Button */}
              <CustomButton
                title={`Save ${activeTypeConfig.label}`}
                onPress={handleSaveVariant}
                loading={isSubmitting}
                iconName="checkmark-circle-outline"
                style={{ marginTop: 22 }}
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
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  topControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 10,
  },
  searchWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    height: '100%',
  },
  addVariantTopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 46,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  addVariantTopBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 13,
    marginTop: 10,
    fontWeight: '500',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 40,
    gap: 16,
  },
  sectionCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  typeIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  sectionSubtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  sectionHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 0.5,
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  sectionAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  sectionAddBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 2,
  },
  sectionBody: {
    padding: 12,
  },
  emptySectionBox: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 10,
    gap: 4,
  },
  emptySectionText: {
    fontSize: 12,
    textAlign: 'center',
  },
  emptyAddLink: {
    fontSize: 12,
    fontWeight: '700',
  },
  valuesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  valuePill: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  bottomSheetOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  bottomSheetPanel: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '82%',
    borderWidth: 1,
    borderBottomWidth: 0,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 20,
  },
  handleBar: {
    width: 44,
    height: 4,
    backgroundColor: '#94A3B8',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 14,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.2)',
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  panelSubtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  typeSelectorRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
    marginBottom: 6,
  },
  typeSelectorChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  typeSelectorChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    marginBottom: 6,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    height: '100%',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
});

export default VariantsScreen;

