import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Modal,
  Switch,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useSelector, useDispatch } from 'react-redux';
import {
  addProduct,
  updateProduct,
  addToCart,
  decreaseCartQuantity,
} from '../store/ecomSlice';
import { darkColors, lightColors } from '../theme/colors';
import { getRoleConfig } from '../utils/roles';
import tw from '../utils/tw';
import { toast, Toaster } from '../components/Toast';

export default function ProductsScreen({ onNavigate }) {
  const dispatch = useDispatch();
  const mode = useSelector((state) => state.theme.mode);
  const user = useSelector((state) => state.auth.user);
  const products = useSelector((state) => state.ecom.products);
  const cart = useSelector((state) => state.ecom.cart || []);
  const isDark = mode === 'dark';
  const colors = isDark ? darkColors : lightColors;

  const currentRole = user?.role || 'admin';
  const isAdmin = currentRole === 'admin';
  const isManager = currentRole === 'manager';
  const roleConfig = getRoleConfig(currentRole);

  // Cart helpers
  const getProductCartQty = (prodId) => {
    const item = cart.find((c) => c.id === prodId);
    return item ? item.quantity : 0;
  };
  const totalCartItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const totalCartPrice = cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);

  // Existing Categories list for selection & filtering
  const existingCategories = [
    'Audio & Wearables',
    'Peripherals',
    'Hardware & Drones',
    'Ultra-Wide Displays',
    'Power & Accessories',
    'Smart Office & IoT',
  ];

  const presetImages = [
    { label: 'Audio', uri: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop&q=80' },
    { label: 'Keyboard', uri: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&auto=format&fit=crop&q=80' },
    { label: 'Drone', uri: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=400&auto=format&fit=crop&q=80' },
    { label: 'Display', uri: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&auto=format&fit=crop&q=80' },
    { label: 'Charger', uri: 'https://images.unsplash.com/photo-1622445262464-84b1456045b6?w=400&auto=format&fit=crop&q=80' },
    { label: 'Watch', uri: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&auto=format&fit=crop&q=80' },
    { label: 'Mouse', uri: 'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?w=400&auto=format&fit=crop&q=80' },
    { label: 'IoT Hub', uri: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400&auto=format&fit=crop&q=80' },
  ];

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilterCategory, setSelectedFilterCategory] = useState('All');

  // Slide Sheet (Bottom-to-Up) State for Admin Create and Edit
  const [sheetVisible, setSheetVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);

  // Form States for Admin: name, desc, image, mfgPrice, price (selling), stock, category, isActive
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formImage, setFormImage] = useState(presetImages[0].uri);
  const [formMfgPrice, setFormMfgPrice] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formStock, setFormStock] = useState('');
  const [formCategory, setFormCategory] = useState(existingCategories[0]);
  const [formIsActive, setFormIsActive] = useState(true);

  // Open Slide Sheet for Create (Admin only)
  const handleOpenCreate = () => {
    if (!isAdmin) return;
    setIsEditing(false);
    setSelectedProductId(null);
    setFormName('');
    setFormDesc('');
    setFormImage(presetImages[0].uri);
    setFormMfgPrice('');
    setFormPrice('');
    setFormStock('');
    setFormCategory(existingCategories[0]);
    setFormIsActive(true);
    setSheetVisible(true);
  };

  // Open Slide Sheet for Edit (Admin only)
  const handleOpenEdit = (product) => {
    if (!isAdmin) return; // Manager does not open edit slide
    setIsEditing(true);
    setSelectedProductId(product.id);
    setFormName(product.name || '');
    setFormDesc(product.description || '');
    setFormImage(product.image || presetImages[0].uri);
    setFormMfgPrice(product.mfgPrice !== undefined ? String(product.mfgPrice) : '');
    setFormPrice(product.price !== undefined ? String(product.price) : '');
    setFormStock(product.stock !== undefined ? String(product.stock) : '');
    setFormCategory(product.category || existingCategories[0]);
    setFormIsActive(product.isActive !== undefined ? product.isActive : true);
    setSheetVisible(true);
  };

  // Pick Image from Local Device / Drive
  const handlePickFromDrive = async () => {
    try {
      if (Platform.OS === 'web' && typeof document !== 'undefined') {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
          const file = e.target.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              if (event.target?.result) {
                setFormImage(event.target.result);
              }
            };
            reader.readAsDataURL(file);
          }
        };
        input.click();
        return;
      }

      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        toast.error('Access to storage or gallery is required to choose an image.', 'Permission Needed');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setFormImage(result.assets[0].uri);
      }
    } catch (err) {
      console.warn('Image picker error:', err);
      toast.error('Could not open drive file selector.', 'Picker Notice');
    }
  };

  // Save (Create or Update for Admin)
  const handleSaveProduct = () => {
    if (!formName.trim()) {
      toast.error('Please enter a product name.', 'Required Field');
      return;
    }
    if (!formPrice.trim()) {
      toast.error('Please set a selling price.', 'Required Field');
      return;
    }

    const mfgNum = parseFloat(formMfgPrice) || 0;
    const sellNum = parseFloat(formPrice) || 0;
    const stockNum = parseInt(formStock, 10) || 0;

    if (isEditing && selectedProductId) {
      dispatch(
        updateProduct({
          id: selectedProductId,
          name: formName.trim(),
          description: formDesc.trim() || 'Premium product catalog specification.',
          image: formImage,
          mfgPrice: mfgNum,
          price: sellNum,
          stock: stockNum,
          category: formCategory,
          isActive: formIsActive,
        })
      );
      setSheetVisible(false);
      toast.success(`"${formName.trim()}" has been updated.`, 'Product Updated');
    } else {
      dispatch(
        addProduct({
          name: formName.trim(),
          description: formDesc.trim() || 'Premium product catalog specification.',
          image: formImage,
          mfgPrice: mfgNum,
          price: sellNum,
          stock: stockNum,
          category: formCategory,
          isActive: formIsActive,
        })
      );
      setSheetVisible(false);
      toast.success(`"${formName.trim()}" added to catalog successfully!`, 'Product Created');
    }
  };

  // Filter products by category and search
  const filteredProducts = products.filter((prod) => {
    const matchesCategory =
      selectedFilterCategory === 'All' || prod.category === selectedFilterCategory;
    const matchesSearch =
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (prod.category && prod.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (prod.description && prod.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <View style={[tw('flex-1'), { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={tw('p-4 pb-28')} showsVerticalScrollIndicator={false}>
        {/* Top Header */}
        <View style={tw('flex-row items-center justify-between mb-4')}>
          <View style={tw('flex-1 pr-2')}>
            <Text style={[tw('text-xl font-black'), { color: colors.text }]}>
              {isAdmin ? 'Product Catalogue' : 'Store Products'}
            </Text>
            <Text style={[tw('text-xs mt-0.5'), { color: colors.textSecondary }]}>
              {isAdmin
                ? 'Manage inventory, manufacturing & selling prices'
                : 'Browse products, check stock & order to cart'}
            </Text>
          </View>

          {/* Action Buttons: Admin gets Categories + Add Product; Manager gets Cart Shortcut */}
          <View style={tw('flex-row items-center gap-2')}>
            {isAdmin ? (
              <>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => onNavigate && onNavigate('Categories')}
                  style={[
                    tw('px-3 py-2 rounded-xl flex-row items-center gap-1.5 border'),
                    { borderColor: colors.border, backgroundColor: colors.surfaceElevated },
                  ]}
                >
                  <MaterialCommunityIcons name="shape-outline" size={16} color={roleConfig.color} />
                  <Text style={[tw('text-xs font-bold'), { color: colors.text }]}>Categories</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleOpenCreate}
                  style={[
                    tw('px-3.5 py-2 rounded-xl flex-row items-center gap-1.5 shadow-md'),
                    { backgroundColor: roleConfig.color },
                  ]}
                >
                  <MaterialCommunityIcons name="plus" size={16} color="#FFFFFF" />
                  <Text style={tw('text-xs font-bold text-white')}>Add Product</Text>
                </TouchableOpacity>
              </>
            ) : (
              /* Manager / Non-admin: Cart Button in Header */
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => onNavigate && onNavigate('Cart')}
                style={[
                  tw('px-3.5 py-2 rounded-xl flex-row items-center gap-1.5 border shadow-sm'),
                  {
                    backgroundColor: `${roleConfig.color}15`,
                    borderColor: roleConfig.color,
                  },
                ]}
              >
                <MaterialCommunityIcons name="cart-outline" size={17} color={roleConfig.color} />
                <Text style={[tw('text-xs font-bold'), { color: roleConfig.color }]}>
                  Cart ({totalCartItems})
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Search Bar */}
        <View
          style={[
            tw('flex-row items-center h-11 px-3.5 rounded-xl border mb-3'),
            {
              backgroundColor: colors.inputBackground,
              borderColor: colors.inputBorder,
            },
          ]}
        >
          <MaterialCommunityIcons
            name="magnify"
            size={18}
            color={colors.textMuted}
            style={tw('mr-2')}
          />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search products by title, category, description..."
            placeholderTextColor={colors.textMuted}
            style={[tw('flex-1 text-xs'), { color: colors.text }]}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialCommunityIcons name="close-circle" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Filter Category Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={tw('gap-2 mb-4')}
        >
          {['All', ...existingCategories].map((cat) => {
            const isSel = selectedFilterCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setSelectedFilterCategory(cat)}
                activeOpacity={0.7}
                style={[
                  tw('px-3 py-1.5 rounded-xl border'),
                  {
                    backgroundColor: isSel
                      ? roleConfig.color
                      : isDark
                      ? '#1E293B'
                      : colors.surfaceElevated,
                    borderColor: isSel ? roleConfig.color : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    tw('text-xs font-semibold'),
                    { color: isSel ? '#FFFFFF' : colors.textSecondary },
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Header Count Info */}
        <View style={tw('flex-row items-center justify-between mb-2.5 px-1')}>
          <Text style={[tw('text-xs font-bold uppercase tracking-wider'), { color: roleConfig.color }]}>
            PRODUCTS LIST ({filteredProducts.length})
          </Text>
          <Text style={[tw('text-xs font-semibold'), { color: colors.textMuted }]}>
            {isAdmin ? 'Tap product to edit' : 'Add products to cart'}
          </Text>
        </View>

        {/* Products List */}
        <View style={tw('gap-3.5')}>
          {filteredProducts.map((prod) => {
            const isProductActive = prod.isActive !== undefined ? prod.isActive : true;
            const stockCount = prod.stock || 0;
            const isLowStock = stockCount > 0 && stockCount <= 10;
            const isOutOfStock = stockCount === 0;

            const stockBg = isOutOfStock
              ? '#EF444415'
              : isLowStock
              ? '#F59E0B15'
              : '#10B98115';
            const stockColor = isOutOfStock
              ? '#EF4444'
              : isLowStock
              ? '#F59E0B'
              : '#10B981';

            const cartQty = getProductCartQty(prod.id);

            // Container component: TouchableOpacity for admin (tap to edit), View for manager
            const ContainerComponent = isAdmin ? TouchableOpacity : View;
            const containerProps = isAdmin
              ? { activeOpacity: 0.8, onPress: () => handleOpenEdit(prod) }
              : {};

            return (
              <ContainerComponent
                key={prod.id}
                {...containerProps}
                style={[
                  tw('p-3.5 rounded-3xl border shadow-sm flex-row gap-3.5'),
                  {
                    backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                    borderColor: colors.border,
                  },
                ]}
              >
                {/* 1. Thumbnail Image */}
                <View style={{ position: 'relative' }}>
                  <Image
                    source={{ uri: prod.image }}
                    style={{
                      width: 82,
                      height: 82,
                      borderRadius: 18,
                      backgroundColor: isDark ? '#334155' : '#E2E8F0',
                      borderWidth: 1.5,
                      borderColor: isProductActive ? `${roleConfig.color}40` : colors.border,
                    }}
                    resizeMode="cover"
                  />
                  {/* Status Indicator Dot on Image */}
                  <View
                    style={{
                      position: 'absolute',
                      top: 6,
                      left: 6,
                      width: 9,
                      height: 9,
                      borderRadius: 4.5,
                      backgroundColor: isProductActive ? '#10B981' : '#64748B',
                      borderWidth: 1.5,
                      borderColor: '#FFFFFF',
                    }}
                  />
                </View>

                {/* 2. Main Product Info */}
                <View style={tw('flex-1 justify-between')}>
                  <View>
                    {/* Top Row: Category Pill & Active Status */}
                    <View style={tw('flex-row items-center justify-between')}>
                      <View
                        style={[
                          tw('px-2 py-0.5 rounded-md border'),
                          {
                            backgroundColor: `${roleConfig.color}12`,
                            borderColor: `${roleConfig.color}30`,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            tw('text-xs font-bold uppercase tracking-wider'),
                            { color: roleConfig.color, fontSize: 9.5 },
                          ]}
                          numberOfLines={1}
                        >
                          {prod.category}
                        </Text>
                      </View>

                      {/* Active Status pill for Admin, or Stock pill for Manager */}
                      {isAdmin ? (
                        <View
                          style={[
                            tw('px-2 py-0.5 rounded-full flex-row items-center gap-1 border'),
                            {
                              backgroundColor: isProductActive ? '#10B98115' : isDark ? '#334155' : '#F1F5F9',
                              borderColor: isProductActive ? '#10B981' : '#94A3B8',
                            },
                          ]}
                        >
                          <View
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: 3,
                              backgroundColor: isProductActive ? '#10B981' : '#64748B',
                            }}
                          />
                          <Text
                            style={[
                              tw('text-xs font-bold'),
                              { color: isProductActive ? '#10B981' : '#64748B', fontSize: 10 },
                            ]}
                          >
                            {isProductActive ? 'Active' : 'Disactive'}
                          </Text>
                        </View>
                      ) : (
                        <View
                          style={[
                            tw('px-2 py-0.5 rounded-lg border'),
                            { backgroundColor: stockBg, borderColor: `${stockColor}30` },
                          ]}
                        >
                          <Text style={[tw('text-xs font-bold'), { color: stockColor, fontSize: 10 }]}>
                            {isOutOfStock ? 'Out of stock' : `${stockCount} in stock`}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Product Name */}
                    <Text
                      style={[tw('text-sm font-black mt-1'), { color: colors.text }]}
                      numberOfLines={1}
                    >
                      {prod.name}
                    </Text>

                    {/* Description preview */}
                    <Text
                      style={[tw('text-xs mt-0.5'), { color: colors.textMuted, fontSize: 11 }]}
                      numberOfLines={2}
                    >
                      {prod.description}
                    </Text>
                  </View>

                  {/* Bottom Row: Price & Action */}
                  <View style={tw('flex-row items-center justify-between mt-2 pt-2 border-t border-slate-100')}>
                    <View style={tw('flex-row items-baseline gap-2')}>
                      {/* Selling Price */}
                      <Text style={[tw('text-base font-black'), { color: colors.text }]}>
                        ${prod.price}
                      </Text>

                      {/* Manufacturing Price (shown to Admin) */}
                      {isAdmin && prod.mfgPrice !== undefined && prod.mfgPrice > 0 ? (
                        <Text style={[tw('text-xs font-medium'), { color: colors.textMuted, fontSize: 10.5 }]}>
                          Mfg: ${prod.mfgPrice}
                        </Text>
                      ) : null}
                    </View>

                    {/* Admin: Stock Pill / Edit hint; Manager: Add to Cart button or - + Stepper */}
                    {isAdmin ? (
                      <View
                        style={[
                          tw('px-2.5 py-0.5 rounded-lg border'),
                          { backgroundColor: stockBg, borderColor: `${stockColor}40` },
                        ]}
                      >
                        <Text style={[tw('text-xs font-bold'), { color: stockColor, fontSize: 10.5 }]}>
                          {isOutOfStock ? 'Out of stock' : `${stockCount} in stock`}
                        </Text>
                      </View>
                    ) : (
                      /* MANAGER VIEW: Add to Cart button OR - + Stepper to add more */
                      <View>
                        {cartQty === 0 ? (
                          <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => {
                              dispatch(addToCart(prod));
                              toast.success(`Added "${prod.name}" to cart.`);
                            }}
                            style={[
                              tw('px-3.5 py-1.5 rounded-xl flex-row items-center gap-1.5 shadow-sm'),
                              { backgroundColor: roleConfig.color },
                            ]}
                          >
                            <MaterialCommunityIcons name="cart-plus" size={15} color="#FFFFFF" />
                            <Text style={tw('text-xs font-bold text-white')}>Add to Cart</Text>
                          </TouchableOpacity>
                        ) : (
                          /* Stepper [-] [qty] [+] */
                          <View
                            style={[
                              tw('flex-row items-center rounded-xl border overflow-hidden shadow-sm'),
                              {
                                backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                                borderColor: roleConfig.color,
                              },
                            ]}
                          >
                            <TouchableOpacity
                              activeOpacity={0.7}
                              onPress={() => dispatch(decreaseCartQuantity(prod.id))}
                              style={[
                                tw('w-7 h-7 items-center justify-center'),
                                { backgroundColor: isDark ? '#334155' : '#E2E8F0' },
                              ]}
                            >
                              <MaterialCommunityIcons name="minus" size={14} color={colors.text} />
                            </TouchableOpacity>

                            <Text
                              style={[
                                tw('w-7 text-center text-xs font-black'),
                                { color: roleConfig.color },
                              ]}
                            >
                              {cartQty}
                            </Text>

                            <TouchableOpacity
                              activeOpacity={0.7}
                              onPress={() => {
                                dispatch(addToCart(prod));
                                toast.success(`Added more "${prod.name}" (${cartQty + 1})`);
                              }}
                              style={[
                                tw('w-7 h-7 items-center justify-center'),
                                { backgroundColor: roleConfig.color },
                              ]}
                            >
                              <MaterialCommunityIcons name="plus" size={14} color="#FFFFFF" />
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                </View>
              </ContainerComponent>
            );
          })}

          {filteredProducts.length === 0 && (
            <View style={tw('items-center justify-center py-12')}>
              <MaterialCommunityIcons name="cube-off-outline" size={44} color={colors.textMuted} />
              <Text style={[tw('text-sm font-semibold mt-2'), { color: colors.textMuted }]}>
                No products match your search or filter.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* FLOATING CART BAR FOR MANAGER WHEN CART HAS ITEMS */}
      {!isAdmin && totalCartItems > 0 && (
        <View
          style={[
            tw('absolute bottom-2 left-4 right-4 p-3.5 rounded-2xl border shadow-xl flex-row items-center justify-between'),
            {
              backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
              borderColor: roleConfig.color,
              elevation: 8,
            },
          ]}
        >
          <View style={tw('flex-row items-center gap-2.5')}>
            <View
              style={[
                tw('w-9 h-9 rounded-xl items-center justify-center'),
                { backgroundColor: `${roleConfig.color}20` },
              ]}
            >
              <MaterialCommunityIcons name="cart-check" size={20} color={roleConfig.color} />
            </View>
            <View>
              <Text style={[tw('text-xs font-black'), { color: colors.text }]}>
                {totalCartItems} item{totalCartItems === 1 ? '' : 's'} in Cart
              </Text>
              <Text style={[tw('text-xs font-bold'), { color: roleConfig.color, fontSize: 11 }]}>
                Total: ${totalCartPrice.toLocaleString()}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onNavigate && onNavigate('Cart')}
            style={[
              tw('px-3.5 py-2 rounded-xl flex-row items-center gap-1.5 shadow-md'),
              { backgroundColor: roleConfig.color },
            ]}
          >
            <Text style={tw('text-xs font-bold text-white')}>View Cart</Text>
            <MaterialCommunityIcons name="arrow-right" size={15} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}

      {/* ============================================================= */}
      {/* ADMIN ONLY: SLIDE OPEN BOTTOM TO UP SHEET (Create & Edit)     */}
      {/* ============================================================= */}
      {isAdmin && (
        <Modal
          visible={sheetVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setSheetVisible(false)}
        >
          <Toaster insideModal />
          <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0, 0, 0, 0.55)' }}>
            {/* Backdrop Tap to close */}
            <TouchableWithoutFeedback onPress={() => setSheetVisible(false)}>
              <View style={{ flex: 1 }} />
            </TouchableWithoutFeedback>

            {/* Bottom Sheet Container */}
            <View
              style={[
                {
                  borderTopLeftRadius: 28,
                  borderTopRightRadius: 28,
                  paddingHorizontal: 20,
                  paddingTop: 12,
                  paddingBottom: Platform.OS === 'ios' ? 36 : 24,
                  backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                  borderTopWidth: 1,
                  borderColor: colors.border,
                  maxHeight: '92%',
                },
              ]}
            >
              {/* Grab Handle */}
              <View
                style={{
                  width: 44,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: isDark ? '#475569' : '#CBD5E1',
                  alignSelf: 'center',
                  marginBottom: 14,
                }}
              />

              {/* Sheet Header */}
              <View style={tw('flex-row items-center justify-between pb-3 border-b border-slate-200 mb-4')}>
                <View style={tw('flex-row items-center gap-2')}>
                  <View
                    style={[
                      tw('w-8 h-8 rounded-xl items-center justify-center'),
                      { backgroundColor: `${roleConfig.color}15` },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={isEditing ? 'pencil-outline' : 'cube-plus'}
                      size={18}
                      color={roleConfig.color}
                    />
                  </View>
                  <Text style={[tw('text-base font-bold'), { color: colors.text }]}>
                    {isEditing ? 'Edit Product' : 'Create New Product'}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => setSheetVisible(false)}
                  style={[
                    tw('w-8 h-8 rounded-full items-center justify-center'),
                    { backgroundColor: isDark ? '#0F172A' : '#F1F5F9' },
                  ]}
                >
                  <MaterialCommunityIcons name="close" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* 1. Select Image (Device/Drive Picker + Presets) */}
                <View style={tw('mb-4')}>
                  <Text style={[tw('text-xs font-semibold mb-2'), { color: colors.text }]}>
                    Product Image
                  </Text>

                  <View style={tw('flex-row items-center gap-3.5 mb-3')}>
                    {/* Selected Preview */}
                    <Image
                      source={{ uri: formImage }}
                      style={{
                        width: 76,
                        height: 76,
                        borderRadius: 18,
                        borderWidth: 2,
                        borderColor: roleConfig.color,
                        backgroundColor: isDark ? '#334155' : '#E2E8F0',
                      }}
                      resizeMode="cover"
                    />

                    {/* Pick from Device / Drive */}
                    <View style={tw('flex-1 gap-1.5')}>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={handlePickFromDrive}
                        style={[
                          tw('py-2.5 px-3 rounded-xl flex-row items-center justify-center gap-2 border shadow-sm'),
                          {
                            backgroundColor: `${roleConfig.color}15`,
                            borderColor: roleConfig.color,
                          },
                        ]}
                      >
                        <MaterialCommunityIcons name="folder-image" size={18} color={roleConfig.color} />
                        <Text style={[tw('text-xs font-bold'), { color: roleConfig.color }]}>
                          Choose from Device / Drive
                        </Text>
                      </TouchableOpacity>
                      <Text style={[tw('text-xs'), { color: colors.textMuted, fontSize: 10.5 }]}>
                        Upload image file from local storage or drive
                      </Text>
                    </View>
                  </View>

                  {/* Preset Fast Picker */}
                  <Text style={[tw('text-xs font-semibold mb-1.5'), { color: colors.textMuted }]}>
                    Or select preset image:
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={tw('gap-2')}>
                    {presetImages.map((preset) => {
                      const isSelected = formImage === preset.uri;
                      return (
                        <TouchableOpacity
                          key={preset.label}
                          activeOpacity={0.8}
                          onPress={() => setFormImage(preset.uri)}
                          style={[
                            tw('items-center p-1 rounded-xl border-2'),
                            {
                              borderColor: isSelected ? roleConfig.color : 'transparent',
                              backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                            },
                          ]}
                        >
                          <Image
                            source={{ uri: preset.uri }}
                            style={{ width: 44, height: 44, borderRadius: 10 }}
                            resizeMode="cover"
                          />
                          <Text
                            style={[
                              tw('text-xs font-semibold mt-1'),
                              { color: isSelected ? roleConfig.color : colors.textMuted, fontSize: 9.5 },
                            ]}
                          >
                            {preset.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>

                {/* 2. Product Name */}
                <View style={tw('mb-3.5')}>
                  <Text style={[tw('text-xs font-semibold mb-1.5'), { color: colors.text }]}>
                    Product Name
                  </Text>
                  <View
                    style={[
                      tw('flex-row items-center h-11 px-3.5 rounded-xl border'),
                      {
                        backgroundColor: colors.inputBackground,
                        borderColor: colors.inputBorder,
                      },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="tag-text-outline"
                      size={17}
                      color={colors.textMuted}
                      style={tw('mr-2')}
                    />
                    <TextInput
                      value={formName}
                      onChangeText={setFormName}
                      placeholder="Enter product title or model..."
                      placeholderTextColor={colors.textMuted}
                      style={[tw('flex-1 text-xs font-medium'), { color: colors.text }]}
                    />
                  </View>
                </View>

                {/* 3. Description */}
                <View style={tw('mb-3.5')}>
                  <Text style={[tw('text-xs font-semibold mb-1.5'), { color: colors.text }]}>
                    Description
                  </Text>
                  <View
                    style={[
                      tw('px-3.5 py-2.5 rounded-xl border'),
                      {
                        backgroundColor: colors.inputBackground,
                        borderColor: colors.inputBorder,
                      },
                    ]}
                  >
                    <TextInput
                      value={formDesc}
                      onChangeText={setFormDesc}
                      placeholder="Key specifications, features and material details..."
                      placeholderTextColor={colors.textMuted}
                      multiline
                      numberOfLines={3}
                      style={[
                        tw('text-xs font-medium'),
                        { color: colors.text, minHeight: 52, textAlignVertical: 'top' },
                      ]}
                    />
                  </View>
                </View>

                {/* 4. Select Category from Existing Categories */}
                <View style={tw('mb-4')}>
                  <Text style={[tw('text-xs font-semibold mb-1.5'), { color: colors.text }]}>
                    Select Category (from existing categories)
                  </Text>
                  <View style={tw('flex-row flex-wrap gap-2')}>
                    {existingCategories.map((cat) => {
                      const isSelected = formCategory === cat;
                      return (
                        <TouchableOpacity
                          key={cat}
                          activeOpacity={0.8}
                          onPress={() => setFormCategory(cat)}
                          style={[
                            tw('px-3 py-1.5 rounded-xl border flex-row items-center gap-1.5'),
                            {
                              backgroundColor: isSelected
                                ? `${roleConfig.color}20`
                                : isDark
                                ? '#0F172A'
                                : '#F8FAFC',
                              borderColor: isSelected ? roleConfig.color : colors.border,
                            },
                          ]}
                        >
                          {isSelected && (
                            <MaterialCommunityIcons
                              name="check-circle"
                              size={14}
                              color={roleConfig.color}
                            />
                          )}
                          <Text
                            style={[
                              tw('text-xs font-bold'),
                              { color: isSelected ? roleConfig.color : colors.textSecondary },
                            ]}
                          >
                            {cat}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* 5. Manufacturing Price & Set Selling Price */}
                <View style={tw('flex-row gap-3 mb-3.5')}>
                  {/* Manufacturing Price */}
                  <View style={tw('flex-1')}>
                    <Text style={[tw('text-xs font-semibold mb-1.5'), { color: colors.text }]}>
                      Manufacturing Price ($)
                    </Text>
                    <View
                      style={[
                        tw('flex-row items-center h-11 px-3 rounded-xl border'),
                        {
                          backgroundColor: colors.inputBackground,
                          borderColor: colors.inputBorder,
                        },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name="factory"
                        size={16}
                        color={colors.textMuted}
                        style={tw('mr-1.5')}
                      />
                      <TextInput
                        value={formMfgPrice}
                        onChangeText={setFormMfgPrice}
                        placeholder="e.g. 150"
                        keyboardType="numeric"
                        placeholderTextColor={colors.textMuted}
                        style={[tw('flex-1 text-xs font-bold'), { color: colors.text }]}
                      />
                    </View>
                  </View>

                  {/* Set Selling Price */}
                  <View style={tw('flex-1')}>
                    <Text style={[tw('text-xs font-semibold mb-1.5'), { color: colors.text }]}>
                      Set Selling Price ($)
                    </Text>
                    <View
                      style={[
                        tw('flex-row items-center h-11 px-3 rounded-xl border'),
                        {
                          backgroundColor: colors.inputBackground,
                          borderColor: colors.inputBorder,
                        },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name="currency-usd"
                        size={16}
                        color={roleConfig.color}
                        style={tw('mr-1.5')}
                      />
                      <TextInput
                        value={formPrice}
                        onChangeText={setFormPrice}
                        placeholder="e.g. 299"
                        keyboardType="numeric"
                        placeholderTextColor={colors.textMuted}
                        style={[tw('flex-1 text-xs font-bold'), { color: colors.text }]}
                      />
                    </View>
                  </View>
                </View>

                {/* 6. Stock Quantity */}
                <View style={tw('mb-4')}>
                  <Text style={[tw('text-xs font-semibold mb-1.5'), { color: colors.text }]}>
                    Stock Quantity
                  </Text>
                  <View
                    style={[
                      tw('flex-row items-center h-11 px-3.5 rounded-xl border'),
                      {
                        backgroundColor: colors.inputBackground,
                        borderColor: colors.inputBorder,
                      },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="cube-outline"
                      size={17}
                      color={colors.textMuted}
                      style={tw('mr-2')}
                    />
                    <TextInput
                      value={formStock}
                      onChangeText={setFormStock}
                      placeholder="e.g. 50"
                      keyboardType="numeric"
                      placeholderTextColor={colors.textMuted}
                      style={[tw('flex-1 text-xs font-medium'), { color: colors.text }]}
                    />
                  </View>
                </View>

                {/* 7. Active / Disactive Toggle */}
                <View
                  style={[
                    tw('p-3.5 rounded-2xl border mb-5 flex-row items-center justify-between'),
                    {
                      backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View style={tw('flex-row items-center gap-3')}>
                    <View
                      style={[
                        tw('w-9 h-9 rounded-xl items-center justify-center'),
                        { backgroundColor: formIsActive ? '#10B98120' : isDark ? '#334155' : '#E2E8F0' },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={formIsActive ? 'check-circle' : 'close-circle'}
                        size={20}
                        color={formIsActive ? '#10B981' : '#64748B'}
                      />
                    </View>
                    <View>
                      <Text style={[tw('text-sm font-bold'), { color: colors.text }]}>
                        Status: {formIsActive ? 'Active' : 'Disactive'}
                      </Text>
                      <Text style={[tw('text-xs'), { color: colors.textMuted }]}>
                        {formIsActive
                          ? 'Product is active and visible in store'
                          : 'Product is disactive and hidden from buyers'}
                      </Text>
                    </View>
                  </View>

                  <Switch
                    value={formIsActive}
                    onValueChange={setFormIsActive}
                    trackColor={{ false: '#94A3B8', true: '#10B981' }}
                    thumbColor="#FFFFFF"
                  />
                </View>

                {/* Save / Update Button */}
                <View style={tw('mb-4')}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handleSaveProduct}
                    style={[
                      tw('h-12 rounded-2xl flex-row items-center justify-center gap-2 shadow-md'),
                      { backgroundColor: roleConfig.color },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={isEditing ? 'content-save-check' : 'plus-circle'}
                      size={18}
                      color="#FFFFFF"
                    />
                    <Text style={tw('text-sm font-bold text-white')}>
                      {isEditing ? 'Update Product' : 'Create Product'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}
