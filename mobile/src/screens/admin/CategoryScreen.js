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
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useSelector, useDispatch } from 'react-redux';
import { getThemeColors } from '../../constants/colors';
import { toggleTheme } from '../../redux/slices/uiSlice';
import categoryApi from '../../api/categoryApi';
import CustomButton from '../../components/CustomButton';

// Category Card Component: shows a box icon if category has no image or if image fails to load
const CategoryCard = ({ item, colors }) => {
  const [imageError, setImageError] = useState(false);
  const productCount =
    item.numberProducts ??
    item.productCount ??
    item.productsCount ??
    (item.products ? item.products.length : 0);

  const hasImage = Boolean(
    !imageError &&
    item.imageUrl &&
    typeof item.imageUrl === 'string' &&
    item.imageUrl.trim().length > 0
  );

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      {/* Category Image or 3D Box Icon */}
      <View style={[styles.imageWrap, { backgroundColor: colors.surfaceAlt }]}>
        {hasImage ? (
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.categoryImage}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <Ionicons name="cube-outline" size={30} color={colors.primary} />
        )}
      </View>

      {/* Category Details */}
      <View style={styles.cardDetails}>
        <Text style={[styles.categoryName, { color: colors.textPrimary }]} numberOfLines={1}>
          {item.name}
        </Text>

        <View style={styles.badgeRow}>
          <View style={[styles.productBadge, { backgroundColor: colors.primaryMuted, borderColor: colors.border }]}>
            <Ionicons name="pricetag-outline" size={12} color={colors.primary} />
            <Text style={[styles.productBadgeText, { color: colors.primary }]}>
              {productCount} Products
            </Text>
          </View>
        </View>
      </View>

      {/* Right Arrow / Action */}
      <View style={[styles.arrowBox, { backgroundColor: colors.surfaceAlt }]}>
        <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
      </View>
    </View>
  );
};

const CategoryScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { theme } = useSelector((state) => state.ui);

  const isDark = theme === 'dark';
  const colors = getThemeColors(theme);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Add Category Bottom Sheet Modal states
  const [isPanelVisible, setIsPanelVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedImage, setSelectedImage] = useState(null); // Image picked from phone gallery
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Pick image directly from user's own phone gallery
  const pickImageFromGallery = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          'Permission Required',
          'Gallery access is required to choose a category photo. Please grant permission in device settings.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0]);
        if (formError) setFormError('');
      }
    } catch (err) {
      Alert.alert('Gallery Error', 'Could not open photo gallery: ' + (err.message || 'Unknown error'));
    }
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
  };

  // Fetch Categories from GET /api/category
  const fetchCategories = async (isPullToRefresh = false) => {
    if (isPullToRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const data = await categoryApi.getCategories();
      if (Array.isArray(data)) {
        setCategories(data);
      } else {
        setCategories([]);
      }
    } catch {
      // Retain existing categories if offline or error occurs
      setCategories((prev) => prev || []);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Filter categories by search input
  const filteredCategories = categories.filter((cat) => {
    const name = cat.name ? cat.name.toLowerCase() : '';
    return name.includes(searchQuery.toLowerCase().trim());
  });

  // Handle POST /api/category
  const handleCreateCategory = async () => {
    setFormError('');

    if (!newCategoryName.trim()) {
      setFormError('Please enter a category name.');
      return;
    }

    setIsSubmitting(true);
    try {
      // If image is not selected, send null - never set any default image
      const payload = {
        name: newCategoryName.trim(),
        imageUri: selectedImage ? selectedImage.uri : null,
      };

      const result = await categoryApi.createCategory(payload);

      // Prepend to local state list immediately
      const createdItem = {
        id: result?.id || Date.now(),
        name: result?.name || payload.name,
        imageUrl: result?.imageUrl || (selectedImage ? selectedImage.uri : null),
        numberProducts: result?.numberProducts ?? 0,
      };

      setCategories([createdItem, ...categories]);
      setIsPanelVisible(false);
      setNewCategoryName('');
      setSelectedImage(null);

      Alert.alert('Success', `Category "${payload.name}" created successfully.`);
    } catch (err) {
      // If backend network error, still add locally without any default image
      const fallbackItem = {
        id: Date.now(),
        name: newCategoryName.trim(),
        imageUrl: selectedImage ? selectedImage.uri : null,
        numberProducts: 0,
      };
      setCategories([fallbackItem, ...categories]);
      setIsPanelVisible(false);
      setNewCategoryName('');
      setSelectedImage(null);
      Alert.alert('Notice', `Category added locally. (${err.message || 'Server offline'})`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCategoryCard = ({ item }) => <CategoryCard item={item} colors={colors} />;

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Top Navigation Bar */}
      <View
        style={[
          styles.navBar,
          {
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
        </TouchableOpacity>

        <Text style={[styles.navTitle, { color: colors.textPrimary }]}>Categories</Text>

        <TouchableOpacity
          style={[styles.themeBtn, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
          onPress={() => dispatch(toggleTheme())}
        >
          <Ionicons
            name={isDark ? 'sunny' : 'moon'}
            size={18}
            color={isDark ? '#FBBF24' : colors.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Search Bar & Add Category Button Row */}
      <View style={styles.topControlRow}>
        {/* Search Bar */}
        <View
          style={[
            styles.searchWrap,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <Ionicons name="search" size={18} color={colors.textMuted} style={styles.searchIcon} />
          <TextInput
            placeholder="Search category name..."
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

        {/* Add Category Button */}
        <TouchableOpacity
          style={[styles.addCategoryBtn, { backgroundColor: colors.primary }]}
          onPress={() => {
            setFormError('');
            setIsPanelVisible(true);
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.addCategoryBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Categories List */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading categories...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredCategories}
          keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
          renderItem={renderCategoryCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchCategories(true)}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="grid-outline" size={48} color={colors.textMuted} />
              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No Categories Found</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
                {searchQuery ? `No category matching "${searchQuery}"` : 'Tap "+ Add" above to create your first category'}
              </Text>
            </View>
          }
        />
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
            {/* Panel Grab Handle Indicator */}
            <View style={styles.handleBar} />

            {/* Panel Header */}
            <View style={styles.panelHeader}>
              <View>
                <Text style={[styles.panelTitle, { color: colors.textPrimary }]}>Add New Category</Text>
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
              {/* Error Message */}
              {formError ? (
                <View style={[styles.errorBox, { backgroundColor: colors.dangerLight }]}>
                  <Ionicons name="alert-circle" size={16} color={colors.danger} />
                  <Text style={[styles.errorText, { color: colors.danger }]}>{formError}</Text>
                </View>
              ) : null}

              {/* 1. Category Name Input */}
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Category Name *</Text>
              <View
                style={[
                  styles.inputWrap,
                  {
                    backgroundColor: colors.surfaceAlt,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Ionicons name="pricetag-outline" size={18} color={colors.textMuted} style={{ marginRight: 8 }} />
                <TextInput
                  placeholder="Category name"
                  placeholderTextColor={colors.textMuted}
                  value={newCategoryName}
                  onChangeText={(text) => {
                    setNewCategoryName(text);
                    if (formError) setFormError('');
                  }}
                  style={[styles.textInput, { color: colors.textPrimary }]}
                />
              </View>

              {/* 2. Select Image from Phone Gallery */}
              <Text style={[styles.fieldLabel, { color: colors.textSecondary, marginTop: 14 }]}>
                Category Image (From Device Gallery)
              </Text>

              {!selectedImage ? (
                <TouchableOpacity
                  style={[
                    styles.galleryPickerCard,
                    {
                      backgroundColor: colors.surfaceAlt,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={pickImageFromGallery}
                  activeOpacity={0.7}
                >
                  <View style={[styles.galleryIconWrap, { backgroundColor: colors.primaryMuted }]}>
                    <Ionicons name="images" size={32} color={colors.primary} />
                  </View>
                  <Text style={[styles.galleryPickerTitle, { color: colors.textPrimary }]}>
                    Select from Gallery
                  </Text>
                  <Text style={[styles.galleryPickerSubtitle, { color: colors.textMuted }]}>
                    Tap to open your photo gallery and choose an image
                  </Text>
                  <View style={[styles.browseButtonPill, { backgroundColor: colors.primary }]}>
                    <Ionicons name="folder-open" size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.browseButtonText}>Browse Photos</Text>
                  </View>
                </TouchableOpacity>
              ) : (
                <View
                  style={[
                    styles.selectedImageCard,
                    {
                      backgroundColor: colors.surfaceAlt,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Image
                    source={{ uri: selectedImage.uri }}
                    style={styles.selectedImagePreview}
                    resizeMode="cover"
                  />
                  <View style={styles.imageActionRow}>
                    <TouchableOpacity
                      style={[
                        styles.imageActionBtn,
                        { backgroundColor: colors.primaryMuted, borderColor: colors.primary },
                      ]}
                      onPress={pickImageFromGallery}
                    >
                      <Ionicons name="sync" size={15} color={colors.primary} />
                      <Text style={[styles.imageActionText, { color: colors.primary }]}>Change Photo</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.imageActionBtn,
                        { backgroundColor: colors.dangerLight, borderColor: colors.danger },
                      ]}
                      onPress={removeSelectedImage}
                    >
                      <Ionicons name="trash-outline" size={15} color={colors.danger} />
                      <Text style={[styles.imageActionText, { color: colors.danger }]}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Save Category Button */}
              <CustomButton
                title="Save Category"
                onPress={handleCreateCategory}
                loading={isSubmitting}
                iconName="checkmark-circle-outline"
                style={{ marginTop: 20 }}
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
  backBtn: {
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
  themeBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  addCategoryBtn: {
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
  addCategoryBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    marginBottom: 10,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  imageWrap: {
    width: 54,
    height: 54,
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryImage: {
    width: '100%',
    height: '100%',
  },
  cardDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 0.5,
  },
  productBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
  },
  arrowBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
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
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 30,
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
  galleryPickerCard: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  galleryIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  galleryPickerTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  galleryPickerSubtitle: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 14,
    paddingHorizontal: 10,
  },
  browseButtonPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  browseButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  selectedImageCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 10,
    marginBottom: 6,
  },
  selectedImagePreview: {
    width: '100%',
    height: 180,
    borderRadius: 12,
  },
  imageActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 10,
  },
  imageActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
  },
  imageActionText: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 5,
  },
});

export default CategoryScreen;
