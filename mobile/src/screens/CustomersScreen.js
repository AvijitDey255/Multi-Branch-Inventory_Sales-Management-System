import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Modal,
  TouchableWithoutFeedback,
  Linking,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useSelector, useDispatch } from 'react-redux';
import { addCustomer, updateCustomer } from '../store/ecomSlice';
import { darkColors, lightColors } from '../theme/colors';
import { getRoleConfig } from '../utils/roles';
import tw from '../utils/tw';
import { toast, Toaster } from '../components/Toast';

export default function CustomersScreen({ onNavigate }) {
  const dispatch = useDispatch();
  const mode = useSelector((state) => state.theme.mode);
  const user = useSelector((state) => state.auth.user);
  const customers = useSelector((state) => state.ecom.customers || []);
  const isDark = mode === 'dark';
  const colors = isDark ? darkColors : lightColors;

  const currentRole = user?.role || 'salesman';
  const roleConfig = getRoleConfig(currentRole);

  const presetShopImages = [
    { label: 'Shop 1', uri: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=400&auto=format&fit=crop&q=80' },
    { label: 'Shop 2', uri: 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?w=400&auto=format&fit=crop&q=80' },
    { label: 'Shop 3', uri: 'https://images.unsplash.com/photo-1555421689-491a97ff2040?w=400&auto=format&fit=crop&q=80' },
    { label: 'Shop 4', uri: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&auto=format&fit=crop&q=80' },
    { label: 'Shop 5', uri: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&auto=format&fit=crop&q=80' },
    { label: 'Shop 6', uri: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400&auto=format&fit=crop&q=80' },
  ];

  const [searchQuery, setSearchQuery] = useState('');

  // 1. New Customer Slide Sheet (shop name & mobile number only)
  const [newSheetVisible, setNewSheetVisible] = useState(false);
  const [newShopName, setNewShopName] = useState('');
  const [newMobile, setNewMobile] = useState('');

  // 2. Edit Customer Slide Sheet (select image, shop name, owner name, email id, mobile)
  const [editSheetVisible, setEditSheetVisible] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState(null);
  const [editImage, setEditImage] = useState(presetShopImages[0].uri);
  const [editShopName, setEditShopName] = useState('');
  const [editOwnerName, setEditOwnerName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editMobile, setEditMobile] = useState('');

  // Open New Customer Sheet
  const handleOpenNewCustomer = () => {
    setNewShopName('');
    setNewMobile('');
    setNewSheetVisible(true);
  };

  // Save New Customer (Shop name & mobile only)
  const handleSaveNewCustomer = () => {
    if (!newShopName.trim()) {
      toast.error('Please enter the shop name.', 'Required Field');
      return;
    }
    if (!newMobile.trim()) {
      toast.error('Please enter the mobile number.', 'Required Field');
      return;
    }

    const trimmedShop = newShopName.trim();
    const trimmedMobile = newMobile.trim();

    dispatch(
      addCustomer({
        shopName: trimmedShop,
        company: trimmedShop,
        ownerName: `${trimmedShop} Owner`,
        name: `${trimmedShop} Owner`,
        mobile: trimmedMobile,
        phone: trimmedMobile,
        email: `${trimmedShop.toLowerCase().replace(/[^a-z0-9]/g, '')}@store.com`,
        image: presetShopImages[Math.floor(Math.random() * presetShopImages.length)].uri,
        totalSpent: '$0',
        ordersCount: 0,
        status: 'Active Client',
      })
    );

    setNewSheetVisible(false);
    toast.success(`"${trimmedShop}" registered successfully!`, 'Customer Added');
  };

  // Open Edit Customer Sheet
  const handleOpenEditCustomer = (cust) => {
    setEditingCustomerId(cust.id);
    setEditImage(cust.image || presetShopImages[0].uri);
    setEditShopName(cust.shopName || cust.company || '');
    setEditOwnerName(cust.ownerName || cust.name || '');
    setEditEmail(cust.email || '');
    setEditMobile(cust.mobile || cust.phone || '');
    setEditSheetVisible(true);
  };

  // Save Edited Customer
  const handleSaveEditCustomer = () => {
    if (!editShopName.trim()) {
      toast.error('Please enter shop name.', 'Required Field');
      return;
    }
    if (!editOwnerName.trim()) {
      toast.error('Please enter owner name.', 'Required Field');
      return;
    }
    if (!editMobile.trim()) {
      toast.error('Please enter mobile number.', 'Required Field');
      return;
    }

    dispatch(
      updateCustomer({
        id: editingCustomerId,
        shopName: editShopName.trim(),
        company: editShopName.trim(),
        ownerName: editOwnerName.trim(),
        name: editOwnerName.trim(),
        email: editEmail.trim(),
        mobile: editMobile.trim(),
        phone: editMobile.trim(),
        image: editImage,
      })
    );

    setEditSheetVisible(false);
    toast.success(`"${editShopName.trim()}" details updated.`, 'Customer Updated');
  };

  // Pick Image from Local Device / Drive for Edit Form
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
                setEditImage(event.target.result);
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
        toast.error('Storage permission required to choose an image.', 'Permission Needed');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setEditImage(result.assets[0].uri);
      }
    } catch (err) {
      console.warn('Image picker error:', err);
      toast.error('Could not open drive file selector.', 'Picker Notice');
    }
  };

  // Phone Call Action
  const handleCall = (cust) => {
    const phoneNumber = cust.mobile || cust.phone;
    if (phoneNumber) {
      const telUrl = `tel:${phoneNumber.replace(/[^0-9+]/g, '')}`;
      Linking.canOpenURL(telUrl)
        .then((supported) => {
          if (supported) {
            Linking.openURL(telUrl);
          } else {
            toast.info(`Calling ${cust.shopName || cust.company} at ${phoneNumber}`, 'Outreach');
          }
        })
        .catch(() => {
          toast.info(`Calling ${cust.shopName || cust.company} at ${phoneNumber}`, 'Outreach');
        });
    } else {
      toast.error('No phone number available for this customer.', 'Missing Number');
    }
  };

  // Order Action
  const handleOrder = (cust) => {
    toast.success(`Selected ${cust.shopName || cust.company} for new order.`, 'Order Initiated');
    if (onNavigate) {
      onNavigate('Orders');
    }
  };

  // Filter customers by search
  const filtered = customers.filter((c) => {
    const q = searchQuery.toLowerCase();
    const sName = (c.shopName || c.company || '').toLowerCase();
    const oName = (c.ownerName || c.name || '').toLowerCase();
    const phone = (c.mobile || c.phone || '').toLowerCase();
    return sName.includes(q) || oName.includes(q) || phone.includes(q);
  });

  return (
    <View style={[tw('flex-1'), { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={tw('p-4 pb-24')} showsVerticalScrollIndicator={false}>
        {/* Top Header */}
        <View style={tw('flex-row items-center justify-between mb-4')}>
          <View style={tw('flex-1 pr-2')}>
            <Text style={[tw('text-xl font-black'), { color: colors.text }]}>
              Customer Directory
            </Text>
            <Text style={[tw('text-xs mt-0.5'), { color: colors.textSecondary }]}>
              Manage retail shops, owner profiles & order placements
            </Text>
          </View>

          {/* New Customer Button on top */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleOpenNewCustomer}
            style={[
              tw('px-3.5 py-2 rounded-xl flex-row items-center gap-1.5 shadow-md'),
              { backgroundColor: roleConfig.color },
            ]}
          >
            <MaterialCommunityIcons name="account-plus" size={17} color="#FFFFFF" />
            <Text style={tw('text-xs font-bold text-white')}>New Customer</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View
          style={[
            tw('flex-row items-center h-11 px-3.5 rounded-xl border mb-4'),
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
            placeholder="Search by shop name, owner, or mobile..."
            placeholderTextColor={colors.textMuted}
            style={[tw('flex-1 text-xs'), { color: colors.text }]}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialCommunityIcons name="close-circle" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Header Count Info */}
        <View style={tw('flex-row items-center justify-between mb-3 px-1')}>
          <Text style={[tw('text-xs font-bold uppercase tracking-wider'), { color: roleConfig.color }]}>
            REGISTERED SHOPS ({filtered.length})
          </Text>
          <Text style={[tw('text-xs font-semibold'), { color: colors.textMuted }]}>
            Call, edit & place orders
          </Text>
        </View>

        {/* Customer List: shop image, shop name, owner name, call button, edit button, order button */}
        <View style={tw('gap-3.5')}>
          {filtered.map((cust) => {
            const shopTitle = cust.shopName || cust.company || 'Retail Shop';
            const ownerTitle = cust.ownerName || cust.name || 'Store Owner';
            const shopImg = cust.image || presetShopImages[0].uri;

            return (
              <View
                key={cust.id}
                style={[
                  tw('p-3.5 rounded-3xl border shadow-sm'),
                  {
                    backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                    borderColor: colors.border,
                  },
                ]}
              >
                {/* Top Section: Shop Image, Shop Name, Owner Name & Phone */}
                <View style={tw('flex-row gap-3.5 items-center mb-3')}>
                  {/* Shop Image */}
                  <Image
                    source={{ uri: shopImg }}
                    style={{
                      width: 74,
                      height: 74,
                      borderRadius: 18,
                      backgroundColor: isDark ? '#334155' : '#E2E8F0',
                      borderWidth: 1.5,
                      borderColor: colors.border,
                    }}
                    resizeMode="cover"
                  />

                  {/* Shop Details */}
                  <View style={tw('flex-1 justify-center')}>
                    {/* Shop Name */}
                    <Text
                      style={[tw('text-base font-black'), { color: colors.text }]}
                      numberOfLines={1}
                    >
                      {shopTitle}
                    </Text>

                    {/* Owner Name */}
                    <View style={tw('flex-row items-center gap-1.5 mt-1')}>
                      <MaterialCommunityIcons name="account-circle-outline" size={15} color={roleConfig.color} />
                      <Text
                        style={[tw('text-xs font-bold'), { color: colors.textSecondary }]}
                        numberOfLines={1}
                      >
                        Owner: <Text style={{ color: colors.text }}>{ownerTitle}</Text>
                      </Text>
                    </View>

                    {/* Mobile Number */}
                    <View style={tw('flex-row items-center gap-1.5 mt-1')}>
                      <MaterialCommunityIcons name="phone" size={14} color="#10B981" />
                      <Text style={[tw('text-xs font-semibold'), { color: colors.textMuted }]}>
                        {cust.mobile || cust.phone || 'No phone added'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Bottom Action Bar: Call button, Edit button, Order button */}
                <View style={tw('flex-row items-center justify-between pt-2.5 border-t border-slate-100')}>
                  {/* Quick ID Badge */}
                  <View
                    style={[
                      tw('px-2.5 py-1 rounded-lg border'),
                      { backgroundColor: isDark ? '#0F172A' : '#F8FAFC', borderColor: colors.border },
                    ]}
                  >
                    <Text style={[tw('text-xs font-mono font-bold'), { color: colors.textMuted, fontSize: 10.5 }]}>
                      {cust.id}
                    </Text>
                  </View>

                  {/* 3 Main Action Buttons: Call, Edit, Order */}
                  <View style={tw('flex-row items-center gap-2')}>
                    {/* 1. Call Button */}
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => handleCall(cust)}
                      style={[
                        tw('px-3 py-1.5 rounded-xl border flex-row items-center gap-1.5 shadow-sm'),
                        {
                          backgroundColor: '#10B98115',
                          borderColor: '#10B981',
                        },
                      ]}
                    >
                      <MaterialCommunityIcons name="phone" size={14} color="#10B981" />
                      <Text style={[tw('text-xs font-bold'), { color: '#10B981' }]}>Call</Text>
                    </TouchableOpacity>

                    {/* 2. Edit Button */}
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => handleOpenEditCustomer(cust)}
                      style={[
                        tw('px-3 py-1.5 rounded-xl border flex-row items-center gap-1.5 shadow-sm'),
                        {
                          backgroundColor: isDark ? '#334155' : '#F1F5F9',
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <MaterialCommunityIcons name="pencil" size={14} color={colors.text} />
                      <Text style={[tw('text-xs font-bold'), { color: colors.text }]}>Edit</Text>
                    </TouchableOpacity>

                    {/* 3. Order Button */}
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => handleOrder(cust)}
                      style={[
                        tw('px-3.5 py-1.5 rounded-xl flex-row items-center gap-1.5 shadow-md'),
                        { backgroundColor: roleConfig.color },
                      ]}
                    >
                      <MaterialCommunityIcons name="cart-plus" size={14} color="#FFFFFF" />
                      <Text style={tw('text-xs font-bold text-white')}>Order</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}

          {filtered.length === 0 && (
            <View style={tw('items-center justify-center py-14')}>
              <MaterialCommunityIcons name="account-search-outline" size={44} color={colors.textMuted} />
              <Text style={[tw('text-sm font-semibold mt-2'), { color: colors.textMuted }]}>
                No customer shops match your search.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* ============================================================= */}
      {/* 1. NEW CUSTOMER SLIDE SHEET (Shop Name & Mobile Number Only)  */}
      {/* ============================================================= */}
      <Modal
        visible={newSheetVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setNewSheetVisible(false)}
      >
        <Toaster insideModal />
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0, 0, 0, 0.55)' }}>
          <TouchableWithoutFeedback onPress={() => setNewSheetVisible(false)}>
            <View style={{ flex: 1 }} />
          </TouchableWithoutFeedback>

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
                maxHeight: '80%',
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

            {/* Header */}
            <View style={tw('flex-row items-center justify-between pb-3 border-b border-slate-200 mb-4')}>
              <View style={tw('flex-row items-center gap-2')}>
                <View
                  style={[
                    tw('w-8 h-8 rounded-xl items-center justify-center'),
                    { backgroundColor: `${roleConfig.color}15` },
                  ]}
                >
                  <MaterialCommunityIcons name="store-plus" size={18} color={roleConfig.color} />
                </View>
                <Text style={[tw('text-base font-bold'), { color: colors.text }]}>
                  New Customer
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => setNewSheetVisible(false)}
                style={[
                  tw('w-8 h-8 rounded-full items-center justify-center'),
                  { backgroundColor: isDark ? '#0F172A' : '#F1F5F9' },
                ]}
              >
                <MaterialCommunityIcons name="close" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={[tw('text-xs mb-4'), { color: colors.textSecondary }]}>
              Quick customer registration. Enter shop name and mobile number only.
            </Text>

            {/* Form Fields: Shop Name and Mobile Number only */}
            <View style={tw('gap-4 mb-5')}>
              {/* Enter Shop Name */}
              <View>
                <Text style={[tw('text-xs font-semibold mb-1.5'), { color: colors.text }]}>
                  Shop Name
                </Text>
                <View
                  style={[
                    tw('flex-row items-center h-12 px-3.5 rounded-xl border'),
                    {
                      backgroundColor: colors.inputBackground,
                      borderColor: colors.inputBorder,
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="storefront-outline"
                    size={18}
                    color={colors.textMuted}
                    style={tw('mr-2')}
                  />
                  <TextInput
                    value={newShopName}
                    onChangeText={setNewShopName}
                    placeholder="Enter shop name (e.g. Star Electronics)"
                    placeholderTextColor={colors.textMuted}
                    style={[tw('flex-1 text-sm font-medium'), { color: colors.text }]}
                  />
                </View>
              </View>

              {/* Enter Mobile Number */}
              <View>
                <Text style={[tw('text-xs font-semibold mb-1.5'), { color: colors.text }]}>
                  Mobile Number
                </Text>
                <View
                  style={[
                    tw('flex-row items-center h-12 px-3.5 rounded-xl border'),
                    {
                      backgroundColor: colors.inputBackground,
                      borderColor: colors.inputBorder,
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="phone-outline"
                    size={18}
                    color={colors.textMuted}
                    style={tw('mr-2')}
                  />
                  <TextInput
                    value={newMobile}
                    onChangeText={setNewMobile}
                    placeholder="Enter mobile number (e.g. +1 555 123 4567)"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="phone-pad"
                    style={[tw('flex-1 text-sm font-medium'), { color: colors.text }]}
                  />
                </View>
              </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleSaveNewCustomer}
              style={[
                tw('h-12 rounded-2xl flex-row items-center justify-center gap-2 shadow-md'),
                { backgroundColor: roleConfig.color },
              ]}
            >
              <MaterialCommunityIcons name="check-circle" size={18} color="#FFFFFF" />
              <Text style={tw('text-sm font-bold text-white')}>Register Customer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ========================================================================= */}
      {/* 2. EDIT CUSTOMER SLIDE SHEET (Image, Shop Name, Owner, Email ID, Mobile)  */}
      {/* ========================================================================= */}
      <Modal
        visible={editSheetVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditSheetVisible(false)}
      >
        <Toaster insideModal />
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0, 0, 0, 0.55)' }}>
          <TouchableWithoutFeedback onPress={() => setEditSheetVisible(false)}>
            <View style={{ flex: 1 }} />
          </TouchableWithoutFeedback>

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
                maxHeight: '90%',
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

            {/* Header */}
            <View style={tw('flex-row items-center justify-between pb-3 border-b border-slate-200 mb-4')}>
              <View style={tw('flex-row items-center gap-2')}>
                <View
                  style={[
                    tw('w-8 h-8 rounded-xl items-center justify-center'),
                    { backgroundColor: `${roleConfig.color}15` },
                  ]}
                >
                  <MaterialCommunityIcons name="store-edit-outline" size={18} color={roleConfig.color} />
                </View>
                <Text style={[tw('text-base font-bold'), { color: colors.text }]}>
                  Edit Customer Shop
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => setEditSheetVisible(false)}
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
                  Shop Image
                </Text>

                <View style={tw('flex-row items-center gap-3.5 mb-3')}>
                  <Image
                    source={{ uri: editImage }}
                    style={{
                      width: 74,
                      height: 74,
                      borderRadius: 18,
                      borderWidth: 2,
                      borderColor: roleConfig.color,
                      backgroundColor: isDark ? '#334155' : '#E2E8F0',
                    }}
                    resizeMode="cover"
                  />

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
                      Pick storefront photo from storage or drive
                    </Text>
                  </View>
                </View>

                {/* Preset Fast Picker */}
                <Text style={[tw('text-xs font-semibold mb-1.5'), { color: colors.textMuted }]}>
                  Or select preset storefront:
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={tw('gap-2')}>
                  {presetShopImages.map((preset) => {
                    const isSelected = editImage === preset.uri;
                    return (
                      <TouchableOpacity
                        key={preset.label}
                        activeOpacity={0.8}
                        onPress={() => setEditImage(preset.uri)}
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

              {/* 2. Shop Name */}
              <View style={tw('mb-3.5')}>
                <Text style={[tw('text-xs font-semibold mb-1.5'), { color: colors.text }]}>
                  Shop Name
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
                    name="storefront-outline"
                    size={17}
                    color={colors.textMuted}
                    style={tw('mr-2')}
                  />
                  <TextInput
                    value={editShopName}
                    onChangeText={setEditShopName}
                    placeholder="Enter shop name..."
                    placeholderTextColor={colors.textMuted}
                    style={[tw('flex-1 text-xs font-medium'), { color: colors.text }]}
                  />
                </View>
              </View>

              {/* 3. Owner Name */}
              <View style={tw('mb-3.5')}>
                <Text style={[tw('text-xs font-semibold mb-1.5'), { color: colors.text }]}>
                  Owner Name
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
                    name="account-outline"
                    size={17}
                    color={colors.textMuted}
                    style={tw('mr-2')}
                  />
                  <TextInput
                    value={editOwnerName}
                    onChangeText={setEditOwnerName}
                    placeholder="Enter owner name..."
                    placeholderTextColor={colors.textMuted}
                    style={[tw('flex-1 text-xs font-medium'), { color: colors.text }]}
                  />
                </View>
              </View>

              {/* 4. Email ID */}
              <View style={tw('mb-3.5')}>
                <Text style={[tw('text-xs font-semibold mb-1.5'), { color: colors.text }]}>
                  Email ID
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
                    name="email-outline"
                    size={17}
                    color={colors.textMuted}
                    style={tw('mr-2')}
                  />
                  <TextInput
                    value={editEmail}
                    onChangeText={setEditEmail}
                    placeholder="Enter email address..."
                    placeholderTextColor={colors.textMuted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={[tw('flex-1 text-xs font-medium'), { color: colors.text }]}
                  />
                </View>
              </View>

              {/* 5. Mobile */}
              <View style={tw('mb-5')}>
                <Text style={[tw('text-xs font-semibold mb-1.5'), { color: colors.text }]}>
                  Mobile Number
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
                    name="phone-outline"
                    size={17}
                    color={colors.textMuted}
                    style={tw('mr-2')}
                  />
                  <TextInput
                    value={editMobile}
                    onChangeText={setEditMobile}
                    placeholder="Enter mobile number..."
                    placeholderTextColor={colors.textMuted}
                    keyboardType="phone-pad"
                    style={[tw('flex-1 text-xs font-medium'), { color: colors.text }]}
                  />
                </View>
              </View>

              {/* Save / Update Button (No Delete button) */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleSaveEditCustomer}
                style={[
                  tw('h-12 rounded-2xl flex-row items-center justify-center gap-2 shadow-md mb-4'),
                  { backgroundColor: roleConfig.color },
                ]}
              >
                <MaterialCommunityIcons name="content-save-check" size={18} color="#FFFFFF" />
                <Text style={tw('text-sm font-bold text-white')}>Update Customer</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
