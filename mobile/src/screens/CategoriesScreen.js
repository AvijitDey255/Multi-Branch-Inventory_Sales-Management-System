import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Image,
  Switch,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useSelector } from 'react-redux';
import { darkColors, lightColors } from '../theme/colors';
import { getRoleConfig } from '../utils/roles';
import tw from '../utils/tw';
import { toast, Toaster } from '../components/Toast';

export default function CategoriesScreen({ onNavigate }) {
  const mode = useSelector((state) => state.theme.mode);
  const user = useSelector((state) => state.auth.user);
  const isDark = mode === 'dark';
  const colors = isDark ? darkColors : lightColors;
  const roleConfig = getRoleConfig(user?.role || 'admin');

  const presetImages = [
    { label: 'Audio', uri: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&auto=format&fit=crop&q=80' },
    { label: 'Keyboard', uri: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300&auto=format&fit=crop&q=80' },
    { label: 'Drone', uri: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=300&auto=format&fit=crop&q=80' },
    { label: 'Display', uri: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=300&auto=format&fit=crop&q=80' },
    { label: 'Power', uri: 'https://images.unsplash.com/photo-1622445262464-84b1456045b6?w=300&auto=format&fit=crop&q=80' },
    { label: 'Office', uri: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=300&auto=format&fit=crop&q=80' },
    { label: 'Gaming', uri: 'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?w=300&auto=format&fit=crop&q=80' },
    { label: 'Wearable', uri: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&auto=format&fit=crop&q=80' },
  ];

  const [categories, setCategories] = useState([
    {
      id: 'CAT-01',
      name: 'Audio & Wearables',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&auto=format&fit=crop&q=80',
      isActive: true,
      itemCount: 42,
    },
    {
      id: 'CAT-02',
      name: 'Peripherals',
      image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300&auto=format&fit=crop&q=80',
      isActive: true,
      itemCount: 28,
    },
    {
      id: 'CAT-03',
      name: 'Hardware & Drones',
      image: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=300&auto=format&fit=crop&q=80',
      isActive: true,
      itemCount: 15,
    },
    {
      id: 'CAT-04',
      name: 'Ultra-Wide Displays',
      image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=300&auto=format&fit=crop&q=80',
      isActive: true,
      itemCount: 19,
    },
    {
      id: 'CAT-05',
      name: 'Power & Accessories',
      image: 'https://images.unsplash.com/photo-1622445262464-84b1456045b6?w=300&auto=format&fit=crop&q=80',
      isActive: false,
      itemCount: 64,
    },
    {
      id: 'CAT-06',
      name: 'Smart Office & IoT',
      image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=300&auto=format&fit=crop&q=80',
      isActive: true,
      itemCount: 14,
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');

  // Slide Sheet (Bottom to Up) state
  const [sheetVisible, setSheetVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCatId, setSelectedCatId] = useState(null);

  // Form states for slide sheet
  const [formName, setFormName] = useState('');
  const [formImage, setFormImage] = useState(presetImages[0].uri);
  const [formIsActive, setFormIsActive] = useState(true);

  // Open Slide Sheet for Create
  const handleOpenAdd = () => {
    setIsEditing(false);
    setSelectedCatId(null);
    setFormName('');
    setFormImage(presetImages[0].uri);
    setFormIsActive(true);
    setSheetVisible(true);
  };

  // Open Slide Sheet for Edit
  const handleOpenEdit = (category) => {
    setIsEditing(true);
    setSelectedCatId(category.id);
    setFormName(category.name);
    setFormImage(category.image || presetImages[0].uri);
    setFormIsActive(category.isActive);
    setSheetVisible(true);
  };

  // Pick Image from Local Device / Drive
  const handlePickFromDrive = async () => {
    try {
      // Browser / Web Drive File Picker fallback
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

      // Native Device Gallery / Drive Picker
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

  // Save (Create or Update)
  const handleSave = () => {
    if (!formName.trim()) {
      toast.error('Please enter a category name.', 'Required Field');
      return;
    }

    if (isEditing && selectedCatId) {
      setCategories(
        categories.map((c) =>
          c.id === selectedCatId
            ? {
                ...c,
                name: formName.trim(),
                image: formImage,
                isActive: formIsActive,
              }
            : c
        )
      );
      setSheetVisible(false);
      toast.success(`"${formName.trim()}" has been updated.`, 'Category Updated');
    } else {
      const newCat = {
        id: `CAT-0${categories.length + 1}`,
        name: formName.trim(),
        image: formImage,
        isActive: formIsActive,
        itemCount: 0,
      };
      setCategories([newCat, ...categories]);
      setSheetVisible(false);
      toast.success(`"${newCat.name}" is now live in store.`, 'Category Created');
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={[tw('flex-1'), { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={tw('p-4 pb-20')} showsVerticalScrollIndicator={false}>
        {/* Top Header */}
        <View style={tw('flex-row items-center justify-between mb-4')}>
          <View style={tw('flex-row items-center gap-2.5')}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => onNavigate && onNavigate('More')}
              style={[
                tw('w-9 h-9 rounded-xl items-center justify-center border'),
                { borderColor: colors.border, backgroundColor: colors.surfaceElevated },
              ]}
            >
              <MaterialCommunityIcons name="arrow-left" size={20} color={colors.text} />
            </TouchableOpacity>
            <View>
              <Text style={[tw('text-lg font-black'), { color: colors.text }]}>
                Product Categories
              </Text>
              <Text style={[tw('text-xs'), { color: colors.textSecondary }]}>
                Manage store departments & inventory groups
              </Text>
            </View>
          </View>

          {/* Add Category Button - slides open bottom to up */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleOpenAdd}
            style={[
              tw('px-3.5 py-2 rounded-xl flex-row items-center gap-1.5 shadow-sm'),
              { backgroundColor: roleConfig.color },
            ]}
          >
            <MaterialCommunityIcons name="plus" size={16} color="#FFFFFF" />
            <Text style={tw('text-xs font-bold text-white')}>Add Category</Text>
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
            placeholder="Search categories..."
            placeholderTextColor={colors.textMuted}
            style={[tw('flex-1 text-xs'), { color: colors.text }]}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialCommunityIcons name="close-circle" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Header Info */}
        <View style={tw('flex-row items-center justify-between mb-2.5 px-1')}>
          <Text style={[tw('text-xs font-bold uppercase tracking-wider'), { color: roleConfig.color }]}>
            CATEGORY LIST ({filteredCategories.length})
          </Text>
        </View>

        {/* List of Categories: image, name, active/disactive text, and number of products */}
        <View style={tw('gap-3')}>
          {filteredCategories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              activeOpacity={0.8}
              onPress={() => handleOpenEdit(cat)}
              style={[
                tw('p-3.5 rounded-3xl border flex-row items-center justify-between shadow-sm'),
                {
                  backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                  borderColor: colors.border,
                },
              ]}
            >
              {/* Left: Image, Name & Number of products */}
              <View style={tw('flex-row items-center gap-3.5 flex-1')}>
                {/* 1. Category Image */}
                <Image
                  source={{ uri: cat.image }}
                  style={{
                    width: 62,
                    height: 62,
                    borderRadius: 16,
                    backgroundColor: isDark ? '#334155' : '#E2E8F0',
                    borderWidth: 1.5,
                    borderColor: cat.isActive ? `${roleConfig.color}40` : colors.border,
                  }}
                  resizeMode="cover"
                />

                {/* 2. Name & 4. Number of products */}
                <View style={tw('flex-1')}>
                  <Text style={[tw('text-base font-bold'), { color: colors.text }]} numberOfLines={1}>
                    {cat.name}
                  </Text>

                  <View style={tw('flex-row items-center gap-1.5 mt-1')}>
                    <MaterialCommunityIcons name="cube-outline" size={15} color={roleConfig.color} />
                    <Text style={[tw('text-xs font-semibold'), { color: colors.textSecondary }]}>
                      {cat.itemCount} Products
                    </Text>
                  </View>
                </View>
              </View>

              {/* Right: 3. Active / Disactive Status Pill (No edit text) */}
              <View style={tw('items-end justify-center ml-2')}>
                <View
                  style={[
                    tw('px-3 py-1.5 rounded-full flex-row items-center gap-1.5 border'),
                    {
                      backgroundColor: cat.isActive ? '#10B98115' : isDark ? '#334155' : '#F1F5F9',
                      borderColor: cat.isActive ? '#10B981' : '#94A3B8',
                    },
                  ]}
                >
                  <View
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: 3.5,
                      backgroundColor: cat.isActive ? '#10B981' : '#64748B',
                    }}
                  />
                  <Text
                    style={[
                      tw('text-xs font-bold'),
                      { color: cat.isActive ? '#10B981' : '#64748B', fontSize: 11 },
                    ]}
                  >
                    {cat.isActive ? 'Active' : 'Disactive'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}

          {filteredCategories.length === 0 && (
            <View style={tw('items-center justify-center py-12')}>
              <MaterialCommunityIcons name="shape-outline" size={44} color={colors.textMuted} />
              <Text style={[tw('text-sm font-semibold mt-2'), { color: colors.textMuted }]}>
                No categories match your search.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* ============================================================= */}
      {/* SLIDE OPEN BOTTOM TO UP SHEET (Create & Edit Category)        */}
      {/* ============================================================= */}
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
                    name={isEditing ? 'pencil' : 'shape-plus'}
                    size={18}
                    color={roleConfig.color}
                  />
                </View>
                <Text style={[tw('text-base font-bold'), { color: colors.text }]}>
                  {isEditing ? 'Edit Category' : 'Add New Category'}
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
              {/* 1. Image Select (Device Drive + Presets) */}
              <View style={tw('mb-4')}>
                <Text style={[tw('text-xs font-semibold mb-2'), { color: colors.text }]}>
                  Category Image
                </Text>

                <View style={tw('flex-row items-center gap-3.5 mb-3')}>
                  {/* Selected Image Preview */}
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

                  {/* Pick from Own Drive Button */}
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
                      Pick file from photos or drive storage
                    </Text>
                  </View>
                </View>

                {/* Preset Fast Picker */}
                <Text style={[tw('text-xs font-semibold mb-1.5'), { color: colors.textMuted }]}>
                  Or pick from fast presets:
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
                          style={{ width: 48, height: 48, borderRadius: 10 }}
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

              {/* 2. Category Name Input */}
              <View style={tw('mb-4')}>
                <Text style={[tw('text-xs font-semibold mb-1.5'), { color: colors.text }]}>
                  Category Name
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
                    name="shape-outline"
                    size={18}
                    color={colors.textMuted}
                    style={tw('mr-2')}
                  />
                  <TextInput
                    value={formName}
                    onChangeText={setFormName}
                    placeholder="Enter category name"
                    placeholderTextColor={colors.textMuted}
                    style={[tw('flex-1 text-sm font-medium'), { color: colors.text }]}
                  />
                </View>
              </View>

              {/* 3. Active / Disactive Toggle Button */}
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
                        ? 'Category is active & displayed in store'
                        : 'Category is disactive & hidden from customers'}
                    </Text>
                  </View>
                </View>

                {/* Toggle Button */}
                <Switch
                  value={formIsActive}
                  onValueChange={setFormIsActive}
                  trackColor={{ false: '#94A3B8', true: '#10B981' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {/* Save / Update Button (No Delete button per user request) */}
              <View style={tw('mb-4')}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleSave}
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
                    {isEditing ? 'Update Category' : 'Create Category'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
