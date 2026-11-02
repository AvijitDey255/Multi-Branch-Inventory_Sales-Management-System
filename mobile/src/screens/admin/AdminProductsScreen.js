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
import productApi from '../../api/productApi';
import categoryApi from '../../api/categoryApi';
import variantsApi from '../../api/variantsApi';
import CustomButton from '../../components/CustomButton';

// 7 Standard variant types configuration
const VARIANT_CONFIGS = [
  { key: 'packagingType', altKey: 'packagingTyp', label: 'Packaging Type', icon: 'cube-outline', color: '#6366F1' },
  { key: 'volume', altKey: 'volume', label: 'Volume', icon: 'beaker-outline', color: '#06B6D4' },
  { key: 'brand', altKey: 'brand', label: 'Brand', icon: 'ribbon-outline', color: '#8B5CF6' },
  { key: 'units', altKey: 'units', label: 'Units', icon: 'calculator-outline', color: '#10B981' },
  { key: 'size', altKey: 'size', label: 'Size', icon: 'resize-outline', color: '#F59E0B' },
  { key: 'color', altKey: 'color', label: 'Color', icon: 'color-palette-outline', color: '#EC4899' },
  { key: 'weight', altKey: 'weight', label: 'Weight', icon: 'scale-outline', color: '#3B82F6' },
];

// Product Card Component with image failure fallback to 3D box icon
const ProductCard = ({ item, colors }) => {
  const [imageError, setImageError] = useState(false);
  const hasImage = Boolean(
    !imageError &&
    item.imageUrl &&
    typeof item.imageUrl === 'string' &&
    item.imageUrl.trim().length > 0
  );

  const stockCount = item.stock_quantity ?? item.quantity ?? 0;
  const isLowStock = stockCount < 10;
  const sellingPrice = item.selling_price ?? item.price ?? 0;
  const mrpPrice = item.mrp ?? 0;

  // Collect available non-empty variant tags
  const variantTags = [];
  if (item.packagingTyp || item.packagingType) variantTags.push({ label: item.packagingTyp || item.packagingType, icon: 'cube-outline' });
  if (item.volume) variantTags.push({ label: item.volume, icon: 'beaker-outline' });
  if (item.brand) variantTags.push({ label: item.brand, icon: 'ribbon-outline' });
  if (item.units) variantTags.push({ label: item.units, icon: 'calculator-outline' });
  if (item.size) variantTags.push({ label: item.size, icon: 'resize-outline' });
  if (item.color) variantTags.push({ label: item.color, icon: 'color-palette-outline' });
  if (item.weight) variantTags.push({ label: item.weight, icon: 'scale-outline' });

  return (
    <View
      style={[
        styles.productCard,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={styles.cardHeaderRow}>
        {/* Product Image Thumbnail or 3D Box Icon */}
        <View style={[styles.imageWrap, { backgroundColor: colors.surfaceAlt }]}>
          {hasImage ? (
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.productImage}
              resizeMode="cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <Ionicons name="cube-outline" size={30} color={colors.primary} />
          )}
        </View>

        {/* Product Name & Category */}
        <View style={styles.headerInfo}>
          <View style={styles.titleRow}>
            <Text style={[styles.productName, { color: colors.textPrimary }]} numberOfLines={1}>
              {item.name}
            </Text>
            {item.id != null && (
              <Text style={[styles.idBadge, { color: colors.textMuted }]}>#{item.id}</Text>
            )}
          </View>

          {/* Category Badge */}
          {item.category?.name ? (
            <View style={[styles.categoryPill, { backgroundColor: colors.primaryMuted, borderColor: colors.border }]}>
              <Ionicons name="folder-outline" size={11} color={colors.primary} style={{ marginRight: 4 }} />
              <Text style={[styles.categoryPillText, { color: colors.primary }]}>
                {item.category.name}
              </Text>
            </View>
          ) : null}

          {/* Pricing Row */}
          <View style={styles.priceRow}>
            <Text style={[styles.sellingPriceText, { color: colors.success }]}>
              ₹{Number(sellingPrice).toFixed(2)}
            </Text>
            {mrpPrice > 0 && mrpPrice > sellingPrice ? (
              <Text style={[styles.mrpText, { color: colors.textMuted }]}>
                MRP ₹{Number(mrpPrice).toFixed(2)}
              </Text>
            ) : null}
          </View>
        </View>
      </View>

      {/* Variants Attributes Row (if any non-empty) */}
      {variantTags.length > 0 ? (
        <View style={styles.variantsRow}>
          {variantTags.map((v, i) => (
            <View
              key={i}
              style={[
                styles.variantTag,
                {
                  backgroundColor: colors.surfaceAlt,
                  borderColor: colors.border,
                },
              ]}
            >
              <Ionicons name={v.icon} size={11} color={colors.textSecondary} style={{ marginRight: 4 }} />
              <Text style={[styles.variantTagText, { color: colors.textSecondary }]}>
                {v.label}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {/* Card Footer: Stock Status */}
      <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
        <View style={styles.stockStatusWrap}>
          <Ionicons
            name={isLowStock ? 'alert-circle' : 'checkmark-circle'}
            size={14}
            color={isLowStock ? colors.danger : colors.success}
          />
          <Text
            style={[
              styles.stockStatusText,
              { color: isLowStock ? colors.danger : colors.textSecondary },
            ]}
          >
            {stockCount} in stock
          </Text>
        </View>

        <View style={styles.stockBadge}>
          <Text style={[styles.stockBadgeLabel, { color: isLowStock ? colors.danger : colors.success }]}>
            {isLowStock ? 'LOW STOCK' : 'AVAILABLE'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const AdminProductsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { theme } = useSelector((state) => state.ui);

  const isDark = theme === 'dark';
  const colors = getThemeColors(theme);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [variantsMap, setVariantsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Add Product Main Modal
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Form Fields
  const [prodName, setProdName] = useState('');
  const [prodMrp, setProdMrp] = useState('');
  const [prodSellingPrice, setProdSellingPrice] = useState('');
  const [prodStock, setProdStock] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

  // Selected Category Object: { id, name }
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Selected Variants State (each holds { id, value } or null)
  const [selectedVariants, setSelectedVariants] = useState({
    packagingType: null,
    volume: null,
    brand: null,
    units: null,
    size: null,
    color: null,
    weight: null,
  });

  // Category Picker Sheet States
  const [isCategoryPickerVisible, setIsCategoryPickerVisible] = useState(false);
  const [categorySearchQuery, setCategorySearchQuery] = useState('');

  // Create Category Sub-modal States
  const [isCreateCategoryModalVisible, setIsCreateCategoryModalVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryImg, setNewCategoryImg] = useState(null);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  // Variant Picker Sheet States
  const [activeVariantPicker, setActiveVariantPicker] = useState(null); // { key, label, altKey, icon, color }

  // Create Variant Sub-modal States
  const [isCreateVariantModalVisible, setIsCreateVariantModalVisible] = useState(false);
  const [newVariantValue, setNewVariantValue] = useState('');
  const [isCreatingVariant, setIsCreatingVariant] = useState(false);

  // Fetch products from GET /api/products
  const fetchProducts = async (isPullToRefresh = false) => {
    if (isPullToRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const data = await productApi.getProducts();
      if (Array.isArray(data)) {
        setProducts(data);
      } else {
        setProducts([]);
      }
    } catch {
      setProducts((prev) => prev || []);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch categories & variants for selection
  const fetchAuxiliaryData = async () => {
    try {
      const cats = await categoryApi.getCategories();
      if (Array.isArray(cats)) {
        setCategories(cats);
        if (cats.length > 0 && !selectedCategory) {
          setSelectedCategory(cats[0]);
        }
      }
    } catch {}

    try {
      const vars = await variantsApi.getVariants();
      if (vars && typeof vars === 'object') {
        setVariantsMap(vars);
      }
    } catch {}
  };

  useEffect(() => {
    fetchProducts();
    fetchAuxiliaryData();
  }, []);

  // Pick Image from device gallery
  const pickProductImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Required', 'Gallery access is required to choose a product photo.');
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

  // Pick Image for New Category from device gallery
  const pickCategoryNewImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Required', 'Gallery access is required to choose an image.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setNewCategoryImg(result.assets[0]);
      }
    } catch (err) {
      Alert.alert('Gallery Error', 'Could not open photo gallery: ' + (err.message || 'Unknown error'));
    }
  };

  // Reset Add Product Form
  const resetForm = () => {
    setProdName('');
    setProdMrp('');
    setProdSellingPrice('');
    setProdStock('');
    setSelectedImage(null);
    setSelectedVariants({
      packagingType: null,
      volume: null,
      brand: null,
      units: null,
      size: null,
      color: null,
      weight: null,
    });
    setFormError('');
  };

  // Handle Save New Category from inside picker
  const handleSaveNewCategory = async () => {
    if (!newCategoryName.trim()) {
      Alert.alert('Required', 'Please enter a category name.');
      return;
    }

    setIsCreatingCategory(true);
    try {
      const payload = {
        name: newCategoryName.trim(),
        imageUri: newCategoryImg ? newCategoryImg.uri : null,
      };

      await categoryApi.createCategory(payload);

      // Fetch latest categories from backend to retrieve the actual database ID
      let createdCategory = null;
      try {
        const freshCategories = await categoryApi.getCategories();
        if (Array.isArray(freshCategories) && freshCategories.length > 0) {
          setCategories(freshCategories);
          createdCategory = freshCategories.find(
            (c) => (c.name || '').toLowerCase() === payload.name.toLowerCase()
          );
        }
      } catch {}

      if (!createdCategory) {
        createdCategory = {
          id: Date.now(),
          name: payload.name,
          imageUrl: newCategoryImg ? newCategoryImg.uri : null,
        };
        setCategories((prev) => [createdCategory, ...prev]);
      }

      setSelectedCategory(createdCategory);
      setIsCreateCategoryModalVisible(false);
      setIsCategoryPickerVisible(false);
      setNewCategoryName('');
      setNewCategoryImg(null);
      Alert.alert('Success', `Category "${payload.name}" created and selected.`);
    } catch (err) {
      const fallbackCat = {
        id: Date.now(),
        name: newCategoryName.trim(),
        imageUrl: newCategoryImg ? newCategoryImg.uri : null,
      };
      setCategories((prev) => [fallbackCat, ...prev]);
      setSelectedCategory(fallbackCat);
      setIsCreateCategoryModalVisible(false);
      setIsCategoryPickerVisible(false);
      setNewCategoryName('');
      setNewCategoryImg(null);
      Alert.alert('Notice', `Category saved locally. (${err.message || 'Server offline'})`);
    } finally {
      setIsCreatingCategory(false);
    }
  };

  // Handle Save New Variant from inside picker
  const handleSaveNewVariant = async () => {
    if (!newVariantValue.trim() || !activeVariantPicker) {
      Alert.alert('Required', 'Please enter a variant value.');
      return;
    }

    setIsCreatingVariant(true);
    try {
      const typeKey = activeVariantPicker.key;
      const payload = {
        name: typeKey,
        value: newVariantValue.trim(),
      };

      await variantsApi.createVariant(payload);

      // Fetch fresh variants map from backend to retrieve the actual database ID
      let createdVariant = null;
      try {
        const freshVariants = await variantsApi.getVariants();
        if (freshVariants && typeof freshVariants === 'object') {
          setVariantsMap(freshVariants);
          const list = freshVariants[typeKey] || (activeVariantPicker.altKey && freshVariants[activeVariantPicker.altKey]) || [];
          createdVariant = list.find(
            (v) => (v.value || '').toLowerCase() === payload.value.toLowerCase()
          );
        }
      } catch {}

      if (!createdVariant) {
        createdVariant = {
          id: Date.now(),
          name: payload.name,
          value: payload.value,
        };
        setVariantsMap((prev) => {
          const currentList = prev[typeKey] || prev[activeVariantPicker.altKey] || [];
          return {
            ...prev,
            [typeKey]: [...currentList, createdVariant],
          };
        });
      }

      // Set as currently selected variant for product
      setSelectedVariants((prev) => ({
        ...prev,
        [typeKey]: createdVariant,
      }));

      setIsCreateVariantModalVisible(false);
      setActiveVariantPicker(null);
      setNewVariantValue('');
      Alert.alert('Success', `Variant "${payload.value}" created and selected.`);
    } catch (err) {
      const typeKey = activeVariantPicker.key;
      const fallbackVariant = {
        id: Date.now(),
        name: typeKey,
        value: newVariantValue.trim(),
      };

      setVariantsMap((prev) => {
        const currentList = prev[typeKey] || [];
        return {
          ...prev,
          [typeKey]: [...currentList, fallbackVariant],
        };
      });

      setSelectedVariants((prev) => ({
        ...prev,
        [typeKey]: fallbackVariant,
      }));

      setIsCreateVariantModalVisible(false);
      setActiveVariantPicker(null);
      setNewVariantValue('');
      Alert.alert('Notice', `Variant saved locally. (${err.message || 'Server offline'})`);
    } finally {
      setIsCreatingVariant(false);
    }
  };

  // Handle POST /api/products
  const handleCreateProduct = async () => {
    setFormError('');

    if (!selectedImage) {
      setFormError('Please select a product image.');
      return;
    }

    if (!prodName.trim()) {
      setFormError('Please enter a product name.');
      return;
    }

    if (!selectedCategory || !selectedCategory.id) {
      setFormError('Please select a category.');
      return;
    }

    if (!prodSellingPrice.trim()) {
      setFormError('Please enter a selling price.');
      return;
    }

    if (!prodStock.trim()) {
      setFormError('Please enter stock quantity.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Send Category and Variant attributes where field name is variant name and value is the variant ID
      const payload = {
        name: prodName.trim(),
        mrp: prodMrp ? parseFloat(prodMrp) : 0,
        selling_price: parseFloat(prodSellingPrice) || 0,
        stock_quantity: prodStock ? parseInt(prodStock, 10) : 0,
        category: selectedCategory.id,
        categoryId: selectedCategory.id,
        packagingTyp: selectedVariants.packagingType?.id,
        packagingType: selectedVariants.packagingType?.id,
        volume: selectedVariants.volume?.id,
        brand: selectedVariants.brand?.id,
        units: selectedVariants.units?.id,
        size: selectedVariants.size?.id,
        color: selectedVariants.color?.id,
        weight: selectedVariants.weight?.id,
        imageUri: selectedImage ? selectedImage.uri : null,
      };

      const result = await productApi.createProduct(payload);

      // Construct local item for immediate UI display
      const newProductItem = {
        id: result?.id || Date.now(),
        name: payload.name,
        mrp: payload.mrp || 0,
        selling_price: payload.selling_price,
        stock_quantity: payload.stock_quantity,
        packagingTyp: selectedVariants.packagingType?.value || '',
        volume: selectedVariants.volume?.value || '',
        brand: selectedVariants.brand?.value || '',
        units: selectedVariants.units?.value || '',
        size: selectedVariants.size?.value || '',
        color: selectedVariants.color?.value || '',
        weight: selectedVariants.weight?.value || '',
        imageUrl: result?.imageUrl || (selectedImage ? selectedImage.uri : null),
        category: selectedCategory || { id: payload.category, name: 'General' },
      };

      setProducts([newProductItem, ...products]);
      setIsAddModalVisible(false);
      resetForm();
      Alert.alert('Success', `Product "${payload.name}" created successfully.`);
    } catch (err) {
      // Local fallback item for client smooth UX
      const fallbackItem = {
        id: Date.now(),
        name: prodName.trim(),
        mrp: parseFloat(prodMrp) || 0,
        selling_price: parseFloat(prodSellingPrice) || 0,
        stock_quantity: parseInt(prodStock, 10) || 0,
        packagingTyp: selectedVariants.packagingType?.value || '',
        volume: selectedVariants.volume?.value || '',
        brand: selectedVariants.brand?.value || '',
        units: selectedVariants.units?.value || '',
        size: selectedVariants.size?.value || '',
        color: selectedVariants.color?.value || '',
        weight: selectedVariants.weight?.value || '',
        imageUrl: selectedImage ? selectedImage.uri : null,
        category: selectedCategory || { name: 'General' },
      };
      setProducts([fallbackItem, ...products]);
      setIsAddModalVisible(false);
      resetForm();
      Alert.alert('Notice', `Product saved locally. (${err.message || 'Server offline'})`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter products by search input
  const filteredProducts = products.filter((p) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    const nameMatch = (p.name || '').toLowerCase().includes(query);
    const catMatch = (p.category?.name || '').toLowerCase().includes(query);
    const brandMatch = (p.brand || '').toLowerCase().includes(query);
    const packMatch = (p.packagingTyp || p.packagingType || '').toLowerCase().includes(query);
    return nameMatch || catMatch || brandMatch || packMatch;
  });

  // Filtered categories in picker
  const filteredCategoriesInPicker = categories.filter((c) => {
    if (!categorySearchQuery.trim()) return true;
    return (c.name || '').toLowerCase().includes(categorySearchQuery.toLowerCase().trim());
  });

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
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

        <Text style={[styles.navTitle, { color: colors.textPrimary }]}>Products</Text>

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

      {/* Search Bar & Add Product Button Row */}
      <View style={styles.topControlRow}>
        <View style={[styles.searchWrap, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="search" size={18} color={colors.textMuted} style={styles.searchIcon} />
          <TextInput
            placeholder="Search products by name, category..."
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
          style={[styles.addProductBtn, { backgroundColor: colors.primary }]}
          onPress={() => {
            resetForm();
            setIsAddModalVisible(true);
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.addProductBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Product List */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading products...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item, index) => (item.id ? `prod-${item.id}` : `idx-${index}`)}
          renderItem={({ item }) => <ProductCard item={item} colors={colors} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchProducts(true)}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="cube-outline" size={48} color={colors.textMuted} />
              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No Products Found</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
                {searchQuery ? `No products matching "${searchQuery}"` : 'Tap "+ Add" above to create your first product'}
              </Text>
            </View>
          }
        />
      )}

      {/* ================= 1. ADD PRODUCT MAIN SLIDING SHEET ================= */}
      <Modal
        visible={isAddModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setIsAddModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.bottomSheetOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <TouchableOpacity
            style={styles.sheetBackdrop}
            activeOpacity={1}
            onPress={() => setIsAddModalVisible(false)}
          />

          <View style={[styles.bottomSheetPanel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.handleBar} />

            {/* Modal Header */}
            <View style={styles.panelHeader}>
              <View>
                <Text style={[styles.panelTitle, { color: colors.textPrimary }]}>Add New Product</Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsAddModalVisible(false)}
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
              {/* Form Error */}
              {formError ? (
                <View style={[styles.errorBox, { backgroundColor: colors.dangerLight }]}>
                  <Ionicons name="alert-circle" size={16} color={colors.danger} />
                  <Text style={[styles.errorText, { color: colors.danger }]}>{formError}</Text>
                </View>
              ) : null}

              {/* 1. Image from Device Gallery */}
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                Product Image (From Gallery)
              </Text>
              {!selectedImage ? (
                <TouchableOpacity
                  style={[styles.galleryPickerCard, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
                  onPress={pickProductImage}
                  activeOpacity={0.7}
                >
                  <View style={[styles.galleryIconWrap, { backgroundColor: colors.primaryMuted }]}>
                    <Ionicons name="images" size={28} color={colors.primary} />
                  </View>
                  <Text style={[styles.galleryPickerTitle, { color: colors.textPrimary }]}>Choose from Gallery</Text>
                  <Text style={[styles.galleryPickerSubtitle, { color: colors.textMuted }]}>
                    Tap to upload photo from your phone
                  </Text>
                </TouchableOpacity>
              ) : (
                <View style={[styles.selectedImageCard, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                  <Image source={{ uri: selectedImage.uri }} style={styles.selectedImagePreview} resizeMode="cover" />
                  <View style={styles.imageActionRow}>
                    <TouchableOpacity
                      style={[styles.imageActionBtn, { backgroundColor: colors.primaryMuted, borderColor: colors.primary }]}
                      onPress={pickProductImage}
                    >
                      <Ionicons name="sync" size={14} color={colors.primary} />
                      <Text style={[styles.imageActionText, { color: colors.primary }]}>Change</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.imageActionBtn, { backgroundColor: colors.dangerLight, borderColor: colors.danger }]}
                      onPress={() => setSelectedImage(null)}
                    >
                      <Ionicons name="trash-outline" size={14} color={colors.danger} />
                      <Text style={[styles.imageActionText, { color: colors.danger }]}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* 2. Product Name */}
              <Text style={[styles.fieldLabel, { color: colors.textSecondary, marginTop: 14 }]}>
                Product Name *
              </Text>
              <View style={[styles.inputWrap, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                <Ionicons name="cube-outline" size={18} color={colors.textMuted} style={{ marginRight: 8 }} />
                <TextInput
                  placeholder="Product name"
                  placeholderTextColor={colors.textMuted}
                  value={prodName}
                  onChangeText={(t) => {
                    setProdName(t);
                    if (formError) setFormError('');
                  }}
                  style={[styles.textInput, { color: colors.textPrimary }]}
                />
              </View>

              {/* 3. Category Selection Trigger Button */}
              <Text style={[styles.fieldLabel, { color: colors.textSecondary, marginTop: 14 }]}>
                Category *
              </Text>
              <TouchableOpacity
                style={[styles.selectorBox, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
                onPress={() => {
                  setCategorySearchQuery('');
                  setIsCategoryPickerVisible(true);
                }}
                activeOpacity={0.8}
              >
                <View style={styles.selectorLeft}>
                  <View style={[styles.selectorIconWrap, { backgroundColor: colors.primaryMuted }]}>
                    <Ionicons name="folder" size={16} color={colors.primary} />
                  </View>
                  <Text
                    style={[
                      styles.selectorValueText,
                      { color: selectedCategory ? colors.textPrimary : colors.textMuted },
                    ]}
                  >
                    {selectedCategory ? selectedCategory.name : 'Tap to select category...'}
                  </Text>
                </View>
                <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
              </TouchableOpacity>

              {/* 4. Pricing & Stock Row */}
              <View style={styles.formRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.fieldLabel, { color: colors.textSecondary, marginTop: 14 }]}>
                    Selling Price (₹) *
                  </Text>
                  <View style={[styles.inputWrap, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                    <Text style={{ color: colors.textMuted, marginRight: 4, fontWeight: '700' }}>₹</Text>
                    <TextInput
                      placeholder="200.00"
                      placeholderTextColor={colors.textMuted}
                      value={prodSellingPrice}
                      onChangeText={(t) => {
                        setProdSellingPrice(t);
                        if (formError) setFormError('');
                      }}
                      keyboardType="numeric"
                      style={[styles.textInput, { color: colors.textPrimary }]}
                    />
                  </View>
                </View>

                <View style={{ width: 10 }} />

                <View style={{ flex: 1 }}>
                  <Text style={[styles.fieldLabel, { color: colors.textSecondary, marginTop: 14 }]}>
                    MRP Price (₹)
                  </Text>
                  <View style={[styles.inputWrap, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                    <Text style={{ color: colors.textMuted, marginRight: 4, fontWeight: '700' }}>₹</Text>
                    <TextInput
                      placeholder="250.00"
                      placeholderTextColor={colors.textMuted}
                      value={prodMrp}
                      onChangeText={setProdMrp}
                      keyboardType="numeric"
                      style={[styles.textInput, { color: colors.textPrimary }]}
                    />
                  </View>
                </View>
              </View>

              {/* Stock Quantity */}
              <Text style={[styles.fieldLabel, { color: colors.textSecondary, marginTop: 14 }]}>
                Initial Stock Quantity *
              </Text>
              <View style={[styles.inputWrap, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                <Ionicons name="layers-outline" size={18} color={colors.textMuted} style={{ marginRight: 8 }} />
                <TextInput
                  placeholder="Stock quantity"
                  placeholderTextColor={colors.textMuted}
                  value={prodStock}
                  onChangeText={(t) => {
                    setProdStock(t);
                    if (formError) setFormError('');
                  }}
                  keyboardType="numeric"
                  style={[styles.textInput, { color: colors.textPrimary }]}
                />
              </View>

              {/* 5. Variant Attributes Selection Section */}
              <View style={styles.variantSectionHeaderRow}>
                <Text style={[styles.sectionDividerHeading, { color: colors.textMuted }]}>
                  VARIANT ATTRIBUTES (OPTIONAL)
                </Text>
                <Text style={[styles.sectionDividerSub, { color: colors.textMuted }]}>
                  Tap any option to select or create
                </Text>
              </View>

              <View style={styles.variantGrid}>
                {VARIANT_CONFIGS.map((config) => {
                  const currentSelection = selectedVariants[config.key];
                  return (
                    <TouchableOpacity
                      key={config.key}
                      style={[
                        styles.variantCardBtn,
                        {
                          backgroundColor: colors.surfaceAlt,
                          borderColor: currentSelection ? config.color : colors.border,
                        },
                      ]}
                      onPress={() => setActiveVariantPicker(config)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.variantCardTop}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Ionicons name={config.icon} size={14} color={config.color} style={{ marginRight: 6 }} />
                          <Text style={[styles.variantCardLabel, { color: colors.textSecondary }]}>
                            {config.label}
                          </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={13} color={colors.textMuted} />
                      </View>

                      <Text
                        style={[
                          styles.variantCardValue,
                          { color: currentSelection ? colors.textPrimary : colors.textMuted },
                        ]}
                        numberOfLines={1}
                      >
                        {currentSelection ? currentSelection.value : 'Not selected'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Save Product Button */}
              <CustomButton
                title="Save Product"
                onPress={handleCreateProduct}
                loading={isSubmitting}
                iconName="checkmark-circle-outline"
                style={{ marginTop: 24 }}
              />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ================= 2. SELECT CATEGORY BOTTOM-TO-UP SLIDE ================= */}
      <Modal
        visible={isCategoryPickerVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setIsCategoryPickerVisible(false)}
      >
        <View style={styles.bottomSheetOverlay}>
          <TouchableOpacity
            style={styles.sheetBackdrop}
            activeOpacity={1}
            onPress={() => setIsCategoryPickerVisible(false)}
          />

          <View style={[styles.pickerSheetPanel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.handleBar} />

            {/* Picker Header */}
            <View style={styles.panelHeader}>
              <View>
                <Text style={[styles.panelTitle, { color: colors.textPrimary }]}>Select Category</Text>
                <Text style={[styles.panelSubtitle, { color: colors.textMuted }]}>
                  Choose a category or create a new one below
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsCategoryPickerVisible(false)}
                style={[styles.closeBtn, { backgroundColor: colors.surfaceAlt }]}
              >
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Category Search Input */}
            <View style={[styles.searchWrap, { backgroundColor: colors.surfaceAlt, borderColor: colors.border, marginBottom: 12 }]}>
              <Ionicons name="search" size={16} color={colors.textMuted} style={styles.searchIcon} />
              <TextInput
                placeholder="Search category name..."
                placeholderTextColor={colors.textMuted}
                value={categorySearchQuery}
                onChangeText={setCategorySearchQuery}
                style={[styles.searchInput, { color: colors.textPrimary }]}
              />
            </View>

            {/* Categories List */}
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 280 }}>
              {filteredCategoriesInPicker.map((cat) => {
                const isSelected = selectedCategory?.id === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.pickerItemRow,
                      {
                        backgroundColor: isSelected ? colors.primaryMuted : colors.surfaceAlt,
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => {
                      setSelectedCategory(cat);
                      setIsCategoryPickerVisible(false);
                    }}
                  >
                    <View style={styles.pickerItemLeft}>
                      <View style={[styles.pickerIconWrap, { backgroundColor: colors.surface }]}>
                        {cat.imageUrl ? (
                          <Image source={{ uri: cat.imageUrl }} style={styles.pickerThumb} resizeMode="cover" />
                        ) : (
                          <Ionicons name="cube-outline" size={20} color={colors.primary} />
                        )}
                      </View>
                      <Text style={[styles.pickerItemTitle, { color: colors.textPrimary }]}>{cat.name}</Text>
                    </View>

                    {isSelected && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Bottom Button: Create New Category */}
            <TouchableOpacity
              style={[styles.createSubBtn, { backgroundColor: colors.primary }]}
              onPress={() => setIsCreateCategoryModalVisible(true)}
              activeOpacity={0.85}
            >
              <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
              <Text style={styles.createSubBtnText}>+ Create New Category</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ================= 3. CREATE CATEGORY SUB-MODAL ================= */}
      <Modal
        visible={isCreateCategoryModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setIsCreateCategoryModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.bottomSheetOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <TouchableOpacity
            style={styles.sheetBackdrop}
            activeOpacity={1}
            onPress={() => setIsCreateCategoryModalVisible(false)}
          />

          <View style={[styles.bottomSheetPanel, { backgroundColor: colors.surface, borderColor: colors.border, maxHeight: '80%' }]}>
            <View style={styles.handleBar} />

            <View style={styles.panelHeader}>
              <View>
                <Text style={[styles.panelTitle, { color: colors.textPrimary }]}>Create Category</Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsCreateCategoryModalVisible(false)}
                style={[styles.closeBtn, { backgroundColor: colors.surfaceAlt }]}
              >
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {/* Category Image from Gallery */}
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Category Image (From Gallery)</Text>
              {!newCategoryImg ? (
                <TouchableOpacity
                  style={[styles.galleryPickerCard, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
                  onPress={pickCategoryNewImage}
                >
                  <Ionicons name="images" size={24} color={colors.primary} />
                  <Text style={[styles.galleryPickerTitle, { color: colors.textPrimary, marginTop: 4 }]}>Select Photo</Text>
                </TouchableOpacity>
              ) : (
                <View style={[styles.selectedImageCard, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                  <Image source={{ uri: newCategoryImg.uri }} style={{ width: '100%', height: 110, borderRadius: 8 }} resizeMode="cover" />
                  <View style={styles.imageActionRow}>
                    <TouchableOpacity onPress={pickCategoryNewImage} style={styles.imageActionBtn}>
                      <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '700' }}>Change</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setNewCategoryImg(null)} style={styles.imageActionBtn}>
                      <Text style={{ color: colors.danger, fontSize: 11, fontWeight: '700' }}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Category Name */}
              <Text style={[styles.fieldLabel, { color: colors.textSecondary, marginTop: 12 }]}>Category Name *</Text>
              <View style={[styles.inputWrap, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                <Ionicons name="pricetag-outline" size={18} color={colors.textMuted} style={{ marginRight: 8 }} />
                <TextInput
                  placeholder="Category name"
                  placeholderTextColor={colors.textMuted}
                  value={newCategoryName}
                  onChangeText={setNewCategoryName}
                  style={[styles.textInput, { color: colors.textPrimary }]}
                />
              </View>

              {/* Save Category Button */}
              <CustomButton
                title="Save & Select Category"
                onPress={handleSaveNewCategory}
                loading={isCreatingCategory}
                iconName="checkmark-circle-outline"
                style={{ marginTop: 20 }}
              />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ================= 4. SELECT VARIANT BOTTOM-TO-UP SLIDE ================= */}
      <Modal
        visible={activeVariantPicker !== null}
        animationType="slide"
        transparent
        onRequestClose={() => setActiveVariantPicker(null)}
      >
        <View style={styles.bottomSheetOverlay}>
          <TouchableOpacity
            style={styles.sheetBackdrop}
            activeOpacity={1}
            onPress={() => setActiveVariantPicker(null)}
          />

          <View style={[styles.pickerSheetPanel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.handleBar} />

            {/* Picker Header */}
            <View style={styles.panelHeader}>
              <View>
                <Text style={[styles.panelTitle, { color: colors.textPrimary }]}>
                  Select {activeVariantPicker?.label}
                </Text>
                <Text style={[styles.panelSubtitle, { color: colors.textMuted }]}>
                  Choose a variant value or create a new one below
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setActiveVariantPicker(null)}
                style={[styles.closeBtn, { backgroundColor: colors.surfaceAlt }]}
              >
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* None / Clear Option */}
            <TouchableOpacity
              style={[styles.pickerItemRow, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
              onPress={() => {
                if (activeVariantPicker) {
                  setSelectedVariants((prev) => ({
                    ...prev,
                    [activeVariantPicker.key]: null,
                  }));
                }
                setActiveVariantPicker(null);
              }}
            >
              <View style={styles.pickerItemLeft}>
                <Ionicons name="close-circle-outline" size={18} color={colors.textMuted} style={{ marginRight: 8 }} />
                <Text style={[styles.pickerItemTitle, { color: colors.textMuted }]}>None (Do not set)</Text>
              </View>
            </TouchableOpacity>

            {/* List of Variants for Active Type */}
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 260 }}>
              {activeVariantPicker &&
                (() => {
                  const key = activeVariantPicker.key;
                  const altKey = activeVariantPicker.altKey;
                  const rawList = variantsMap[key] || (altKey && variantsMap[altKey]);
                  const list = Array.isArray(rawList) ? rawList : [];
                  const currentSelected = selectedVariants[key];

                  if (list.length === 0) {
                    return (
                      <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                        <Text style={{ color: colors.textMuted, fontSize: 13 }}>
                          No values yet for {activeVariantPicker.label}.
                        </Text>
                      </View>
                    );
                  }

                  return list.map((item, idx) => {
                    const isSelected = currentSelected?.id === item.id || currentSelected?.value === item.value;
                    return (
                      <TouchableOpacity
                        key={item.id ? `var-${item.id}` : `idx-${idx}`}
                        style={[
                          styles.pickerItemRow,
                          {
                            backgroundColor: isSelected ? colors.primaryMuted : colors.surfaceAlt,
                            borderColor: isSelected ? colors.primary : colors.border,
                          },
                        ]}
                        onPress={() => {
                          setSelectedVariants((prev) => ({
                            ...prev,
                            [key]: item,
                          }));
                          setActiveVariantPicker(null);
                        }}
                      >
                        <Text style={[styles.pickerItemTitle, { color: colors.textPrimary }]}>
                          {item.value}
                        </Text>
                        {isSelected && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
                      </TouchableOpacity>
                    );
                  });
                })()}
            </ScrollView>

            {/* Bottom Button: Create New Variant */}
            <TouchableOpacity
              style={[styles.createSubBtn, { backgroundColor: activeVariantPicker?.color || colors.primary }]}
              onPress={() => {
                setNewVariantValue('');
                setIsCreateVariantModalVisible(true);
              }}
              activeOpacity={0.85}
            >
              <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
              <Text style={styles.createSubBtnText}>
                + Create New {activeVariantPicker?.label || 'Variant'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ================= 5. CREATE VARIANT SUB-MODAL ================= */}
      <Modal
        visible={isCreateVariantModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setIsCreateVariantModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.bottomSheetOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <TouchableOpacity
            style={styles.sheetBackdrop}
            activeOpacity={1}
            onPress={() => setIsCreateVariantModalVisible(false)}
          />

          <View style={[styles.bottomSheetPanel, { backgroundColor: colors.surface, borderColor: colors.border, maxHeight: '60%' }]}>
            <View style={styles.handleBar} />

            <View style={styles.panelHeader}>
              <View>
                <Text style={[styles.panelTitle, { color: colors.textPrimary }]}>
                  Create {activeVariantPicker?.label}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsCreateVariantModalVisible(false)}
                style={[styles.closeBtn, { backgroundColor: colors.surfaceAlt }]}
              >
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Variant Value *</Text>
              <View style={[styles.inputWrap, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                <Ionicons name="pencil-outline" size={18} color={colors.textMuted} style={{ marginRight: 8 }} />
                <TextInput
                  placeholder="Variant value"
                  placeholderTextColor={colors.textMuted}
                  value={newVariantValue}
                  onChangeText={setNewVariantValue}
                  autoFocus
                  style={[styles.textInput, { color: colors.textPrimary }]}
                />
              </View>

              <CustomButton
                title={`Save & Select ${activeVariantPicker?.label || 'Variant'}`}
                onPress={handleSaveNewVariant}
                loading={isCreatingVariant}
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
  addProductBtn: {
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
  addProductBtnText: {
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
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
    gap: 10,
  },
  productCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageWrap: {
    width: 60,
    height: 60,
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  headerInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productName: {
    fontSize: 16,
    fontWeight: '800',
    flex: 1,
  },
  idBadge: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 6,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 0.5,
    marginTop: 3,
    marginBottom: 4,
  },
  categoryPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sellingPriceText: {
    fontSize: 15,
    fontWeight: '800',
  },
  mrpText: {
    fontSize: 12,
    textDecorationLine: 'line-through',
    fontWeight: '500',
  },
  variantsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(150, 150, 150, 0.15)',
  },
  variantTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 0.5,
  },
  variantTagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 0.5,
  },
  stockStatusWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stockStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  stockBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  stockBadgeLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
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
    maxHeight: '86%',
    borderWidth: 1,
    borderBottomWidth: 0,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 20,
  },
  pickerSheetPanel: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '72%',
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
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    height: '100%',
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  selectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectorIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  selectorValueText: {
    fontSize: 14,
    fontWeight: '600',
  },
  variantSectionHeaderRow: {
    marginTop: 18,
    marginBottom: 8,
  },
  sectionDividerHeading: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  sectionDividerSub: {
    fontSize: 10,
    marginTop: 2,
  },
  variantGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  variantCardBtn: {
    width: '48.5%',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  variantCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  variantCardLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  variantCardValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  galleryPickerCard: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  galleryIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  galleryPickerTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  galleryPickerSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  selectedImageCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 8,
    marginBottom: 4,
  },
  selectedImagePreview: {
    width: '100%',
    height: 140,
    borderRadius: 10,
  },
  imageActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 8,
  },
  imageActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  imageActionText: {
    fontSize: 11,
    fontWeight: '700',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    gap: 6,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '600',
  },
  pickerItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 6,
  },
  pickerItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  pickerIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    overflow: 'hidden',
  },
  pickerThumb: {
    width: '100%',
    height: '100%',
  },
  pickerItemTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  createSubBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 12,
    marginTop: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    gap: 6,
  },
  createSubBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default AdminProductsScreen;
