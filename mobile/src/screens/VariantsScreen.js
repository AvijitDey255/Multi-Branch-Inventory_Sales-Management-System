import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { darkColors, lightColors } from '../theme/colors';
import { getRoleConfig } from '../utils/roles';
import tw from '../utils/tw';
import { toast, Toaster } from '../components/Toast';

export default function VariantsScreen({ onNavigate }) {
  const mode = useSelector((state) => state.theme.mode);
  const user = useSelector((state) => state.auth.user);
  const isDark = mode === 'dark';
  const colors = isDark ? darkColors : lightColors;
  const roleConfig = getRoleConfig(user?.role || 'admin');

  // Initial standard variants: colors, sizes, weights, units
  const [variants, setVariants] = useState([
    {
      id: 'var-colors',
      name: 'Colors',
      type: 'colors',
      icon: 'palette-outline',
      values: ['Red', 'Green', 'Blue', 'Black', 'White'],
    },
    {
      id: 'var-sizes',
      name: 'Sizes',
      type: 'sizes',
      icon: 'format-size',
      values: ['S', 'M', 'L', 'XL', 'XXL'],
    },
    {
      id: 'var-weights',
      name: 'Weights',
      type: 'weights',
      icon: 'weight',
      values: ['250g', '500g', '1kg', '2kg', '5kg'],
    },
    {
      id: 'var-units',
      name: 'Units',
      type: 'units',
      icon: 'package-variant-closed',
      values: ['Piece', 'Box', 'Pack', 'Pair', 'Set'],
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');

  // Slide Sheet (Bottom-to-Up) State
  const [sheetVisible, setSheetVisible] = useState(false);
  const [sheetMode, setSheetMode] = useState('add_variant'); // 'add_variant' (name & value) | 'add_value' (value for specific variant)
  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [selectedVariantName, setSelectedVariantName] = useState('');

  // Form inputs
  const [formName, setFormName] = useState('');
  const [formValues, setFormValues] = useState('');

  // Color preview swatches
  const getColorSwatch = (val) => {
    const map = {
      red: '#EF4444',
      green: '#10B981',
      blue: '#3B82F6',
      yellow: '#F59E0B',
      black: '#0F172A',
      white: '#FFFFFF',
      purple: '#8B5CF6',
      orange: '#F97316',
      pink: '#EC4899',
      gray: '#6B7280',
      grey: '#6B7280',
      silver: '#94A3B8',
      gold: '#D97706',
      cyan: '#06B6D4',
      teal: '#14B8A6',
    };
    return map[val.toLowerCase().trim()] || null;
  };

  // Open slide sheet for top "Add Variants" (enter name and value)
  const handleOpenAddVariant = () => {
    setSheetMode('add_variant');
    setSelectedVariantId(null);
    setSelectedVariantName('');
    setFormName('');
    setFormValues('');
    setSheetVisible(true);
  };

  // Open slide sheet for individual variant's + button (enter value)
  const handleOpenAddValueForVariant = (variant) => {
    setSheetMode('add_value');
    setSelectedVariantId(variant.id);
    setSelectedVariantName(variant.name);
    setFormName(variant.name);
    setFormValues('');
    setSheetVisible(true);
  };

  // Save from Slide Sheet
  const handleSaveSheet = () => {
    if (sheetMode === 'add_value') {
      // Adding values to existing variant
      if (!formValues.trim()) {
        toast.error('Please enter at least one value.', 'Missing Value');
        return;
      }

      const newItems = formValues
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      setVariants((prev) =>
        prev.map((v) => {
          if (v.id === selectedVariantId) {
            const existingLower = v.values.map((x) => x.toLowerCase());
            const toAdd = newItems.filter((item) => !existingLower.includes(item.toLowerCase()));

            if (toAdd.length === 0) {
              toast.info(`Entered values already exist in ${v.name}.`, 'Already Added');
              return v;
            }

            toast.success(`Added ${toAdd.join(', ')} to ${v.name}.`, 'Values Added');
            return {
              ...v,
              values: [...v.values, ...toAdd],
            };
          }
          return v;
        })
      );

      setSheetVisible(false);
      setFormValues('');
    } else {
      // Adding new variant (name and value)
      if (!formName.trim()) {
        toast.error('Please enter a variant name.', 'Missing Name');
        return;
      }
      if (!formValues.trim()) {
        toast.error('Please enter variant values (e.g. Red, Green).', 'Missing Values');
        return;
      }

      const parsedValues = formValues
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const trimmedName = formName.trim();
      const existing = variants.find((v) => v.name.toLowerCase() === trimmedName.toLowerCase());

      if (existing) {
        // Append values to existing variant
        const existingLower = existing.values.map((x) => x.toLowerCase());
        const toAdd = parsedValues.filter((item) => !existingLower.includes(item.toLowerCase()));

        setVariants((prev) =>
          prev.map((v) => (v.id === existing.id ? { ...v, values: [...v.values, ...toAdd] } : v))
        );
        toast.success(`Added values to existing ${existing.name} variant.`, 'Variant Updated');
      } else {
        // Create new variant
        const newVar = {
          id: `var-${Date.now()}`,
          name: trimmedName,
          type: trimmedName.toLowerCase(),
          icon: 'shape-outline',
          values: parsedValues,
        };
        setVariants([...variants, newVar]);
        toast.success(`Variant "${newVar.name}" created with ${parsedValues.length} values.`, 'Variant Created');
      }

      setSheetVisible(false);
      setFormName('');
      setFormValues('');
    }
  };

  // Delete a single value chip
  const handleDeleteValueChip = (variantId, valToDelete) => {
    setVariants((prev) =>
      prev.map((v) => {
        if (v.id === variantId) {
          const updated = v.values.filter((val) => val !== valToDelete);
          toast.info(`Removed "${valToDelete}" from ${v.name}.`, 'Value Removed');
          return { ...v, values: updated };
        }
        return v;
      })
    );
  };

  // Search filter
  const filteredVariants = variants.filter((v) => {
    const q = searchQuery.toLowerCase();
    const nameMatch = v.name.toLowerCase().includes(q);
    const valueMatch = v.values.some((val) => val.toLowerCase().includes(q));
    return nameMatch || valueMatch;
  });

  const totalValuesCount = variants.reduce((sum, v) => sum + v.values.length, 0);

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
                Product Variants
              </Text>
              <Text style={[tw('text-xs'), { color: colors.textSecondary }]}>
                Manage colors, sizes, weights & units
              </Text>
            </View>
          </View>

          {/* Top Add Variants Button (slides bottom to up) */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleOpenAddVariant}
            style={[
              tw('px-3.5 py-2 rounded-xl flex-row items-center gap-1.5 shadow-sm'),
              { backgroundColor: roleConfig.color },
            ]}
          >
            <MaterialCommunityIcons name="plus" size={16} color="#FFFFFF" />
            <Text style={tw('text-xs font-bold text-white')}>Add Variants</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Stats Bar */}
        <View style={tw('flex-row gap-3 mb-4')}>
          <View
            style={[
              tw('flex-1 p-3 rounded-2xl border flex-row items-center gap-3 shadow-sm'),
              { backgroundColor: isDark ? '#1E293B' : '#FFFFFF', borderColor: colors.border },
            ]}
          >
            <View
              style={[
                tw('w-10 h-10 rounded-xl items-center justify-center'),
                { backgroundColor: `${roleConfig.color}15` },
              ]}
            >
              <MaterialCommunityIcons name="shape" size={20} color={roleConfig.color} />
            </View>
            <View>
              <Text style={[tw('text-xs font-medium'), { color: colors.textSecondary }]}>
                Variant Types
              </Text>
              <Text style={[tw('text-base font-black'), { color: colors.text }]}>
                {variants.length} Categories
              </Text>
            </View>
          </View>

          <View
            style={[
              tw('flex-1 p-3 rounded-2xl border flex-row items-center gap-3 shadow-sm'),
              { backgroundColor: isDark ? '#1E293B' : '#FFFFFF', borderColor: colors.border },
            ]}
          >
            <View
              style={[
                tw('w-10 h-10 rounded-xl items-center justify-center'),
                { backgroundColor: '#10B98115' },
              ]}
            >
              <MaterialCommunityIcons name="tag-multiple" size={20} color="#10B981" />
            </View>
            <View>
              <Text style={[tw('text-xs font-medium'), { color: colors.textSecondary }]}>
                Total Values
              </Text>
              <Text style={[tw('text-base font-black'), { color: '#10B981' }]}>
                {totalValuesCount} Values
              </Text>
            </View>
          </View>
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
            placeholder="Search variants or values (e.g. Red, XL, 1kg)..."
            placeholderTextColor={colors.textMuted}
            style={[tw('flex-1 text-xs'), { color: colors.text }]}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialCommunityIcons name="close-circle" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Header Label */}
        <View style={tw('flex-row items-center justify-between mb-2.5 px-1')}>
          <Text style={[tw('text-xs font-bold uppercase tracking-wider'), { color: roleConfig.color }]}>
            LIST OF VARIANTS ({filteredVariants.length})
          </Text>
          <Text style={[tw('text-xs font-semibold'), { color: colors.textMuted }]}>
            Colors • Sizes • Weights • Units
          </Text>
        </View>

        {/* List of Variants (NO delete variant button on any variant) */}
        <View style={tw('gap-3.5')}>
          {filteredVariants.map((item) => {
            const valuesFormatted = item.values.length > 0 ? `- ${item.values.join(', ')}` : '- None';

            return (
              <View
                key={item.id}
                style={[
                  tw('p-4 rounded-3xl border shadow-sm'),
                  {
                    backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                    borderColor: colors.border,
                  },
                ]}
              >
                {/* 1. Header with Name & + Add Button of each variant */}
                <View style={tw('flex-row items-center justify-between mb-2.5')}>
                  <View style={tw('flex-row items-center gap-2.5 flex-1')}>
                    <View
                      style={[
                        tw('w-9 h-9 rounded-xl items-center justify-center'),
                        { backgroundColor: `${roleConfig.color}15` },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={item.icon || 'shape-outline'}
                        size={19}
                        color={roleConfig.color}
                      />
                    </View>

                    {/* Variant Name: name:colors */}
                    <View>
                      <View style={tw('flex-row items-center gap-1.5')}>
                        <Text style={[tw('text-xs font-bold uppercase tracking-wider'), { color: colors.textSecondary }]}>
                          name:
                        </Text>
                        <Text style={[tw('text-base font-black capitalize'), { color: colors.text }]}>
                          {item.name}
                        </Text>
                      </View>
                      <Text style={[tw('text-xs'), { color: colors.textMuted, fontSize: 10.5 }]}>
                        {item.values.length} options defined
                      </Text>
                    </View>
                  </View>

                  {/* + Add Button of each variant -> slides bottom to up sheet to enter value */}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => handleOpenAddValueForVariant(item)}
                    style={[
                      tw('px-3.5 py-1.5 rounded-xl flex-row items-center gap-1.5 shadow-sm border'),
                      {
                        backgroundColor: `${roleConfig.color}15`,
                        borderColor: roleConfig.color,
                      },
                    ]}
                  >
                    <MaterialCommunityIcons name="plus" size={15} color={roleConfig.color} />
                    <Text style={[tw('text-xs font-bold'), { color: roleConfig.color }]}>
                      + Add
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* 2. Values Display: values:-red,green */}
                <View
                  style={[
                    tw('p-3 rounded-2xl border'),
                    {
                      backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View style={tw('flex-row items-baseline gap-1 mb-2')}>
                    <Text style={[tw('text-xs font-bold'), { color: roleConfig.color }]}>
                      values:
                    </Text>
                    <Text
                      style={[
                        tw('text-xs font-semibold flex-1'),
                        { color: colors.text, lineHeight: 18 },
                      ]}
                    >
                      {valuesFormatted}
                    </Text>
                  </View>

                  {/* Chips pill list with color swatch and tap-to-remove */}
                  <View style={tw('flex-row flex-wrap gap-2 pt-1 border-t border-slate-200')}>
                    {item.values.map((val) => {
                      const swatch = item.type === 'colors' ? getColorSwatch(val) : null;

                      return (
                        <View
                          key={val}
                          style={[
                            tw('px-2.5 py-1 rounded-xl flex-row items-center gap-1.5 border'),
                            {
                              backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                              borderColor: colors.border,
                            },
                          ]}
                        >
                          {swatch && (
                            <View
                              style={{
                                width: 11,
                                height: 11,
                                borderRadius: 5.5,
                                backgroundColor: swatch,
                                borderWidth: 1,
                                borderColor: isDark ? '#475569' : '#CBD5E1',
                              }}
                            />
                          )}
                          <Text style={[tw('text-xs font-bold'), { color: colors.text }]}>
                            {val}
                          </Text>
                          <TouchableOpacity
                            onPress={() => handleDeleteValueChip(item.id, val)}
                            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                          >
                            <MaterialCommunityIcons name="close" size={13} color={colors.textMuted} />
                          </TouchableOpacity>
                        </View>
                      );
                    })}

                    {item.values.length === 0 && (
                      <Text style={[tw('text-xs italic py-1'), { color: colors.textMuted }]}>
                        No values added yet. Tap "+ Add" to add values.
                      </Text>
                    )}
                  </View>
                </View>
                {/* Notice: NO delete variant button on each variant per user request */}
              </View>
            );
          })}

          {filteredVariants.length === 0 && (
            <View style={tw('items-center justify-center py-12')}>
              <MaterialCommunityIcons name="shape-outline" size={44} color={colors.textMuted} />
              <Text style={[tw('text-sm font-semibold mt-2'), { color: colors.textMuted }]}>
                No variants found matching your search.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* ============================================================= */}
      {/* SLIDE BOTTOM TO UP SHEET (Add Variants / Add Value)            */}
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

          {/* Slide Sheet Container */}
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
                maxHeight: '85%',
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
                    name={sheetMode === 'add_value' ? 'tag-plus' : 'shape-plus'}
                    size={18}
                    color={roleConfig.color}
                  />
                </View>
                <Text style={[tw('text-base font-bold'), { color: colors.text }]}>
                  {sheetMode === 'add_value'
                    ? `Add Value to ${selectedVariantName}`
                    : 'Add Product Variant'}
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

            {/* Form Fields */}
            <ScrollView showsVerticalScrollIndicator={false} style={tw('mb-2')}>
              {/* 1. Enter Name (If adding new variant or allows selecting standard) */}
              {sheetMode === 'add_variant' ? (
                <View style={tw('mb-4')}>
                  <Text style={[tw('text-xs font-semibold mb-1.5'), { color: colors.text }]}>
                    Variant Name
                  </Text>
                  <TextInput
                    value={formName}
                    onChangeText={setFormName}
                    placeholder="e.g. Colors, Sizes, Weights, Units, Materials..."
                    placeholderTextColor={colors.textMuted}
                    style={[
                      tw('h-11 px-3.5 rounded-xl border text-xs font-medium'),
                      {
                        backgroundColor: colors.inputBackground,
                        borderColor: colors.inputBorder,
                        color: colors.text,
                      },
                    ]}
                  />

                  {/* Fast presets for Name */}
                  <View style={tw('flex-row items-center gap-1.5 mt-2')}>
                    <Text style={[tw('text-xs font-medium'), { color: colors.textMuted, fontSize: 10.5 }]}>
                      Quick select:
                    </Text>
                    {['Colors', 'Sizes', 'Weights', 'Units'].map((preset) => (
                      <TouchableOpacity
                        key={preset}
                        onPress={() => setFormName(preset)}
                        style={[
                          tw('px-2 py-0.5 rounded-md border'),
                          {
                            backgroundColor: formName === preset ? `${roleConfig.color}20` : (isDark ? '#0F172A' : '#F1F5F9'),
                            borderColor: formName === preset ? roleConfig.color : colors.border,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            tw('text-xs font-semibold'),
                            { color: formName === preset ? roleConfig.color : colors.textSecondary, fontSize: 10.5 },
                          ]}
                        >
                          {preset}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ) : (
                /* When adding value to existing variant, display name badge */
                <View
                  style={[
                    tw('p-3 rounded-xl border mb-4 flex-row items-center gap-2'),
                    { backgroundColor: `${roleConfig.color}10`, borderColor: `${roleConfig.color}30` },
                  ]}
                >
                  <MaterialCommunityIcons name="tag-outline" size={17} color={roleConfig.color} />
                  <Text style={[tw('text-xs font-bold'), { color: roleConfig.color }]}>
                    Adding new values to: {selectedVariantName}
                  </Text>
                </View>
              )}

              {/* 2. Enter Value(s) */}
              <View style={tw('mb-4')}>
                <Text style={[tw('text-xs font-semibold mb-1.5'), { color: colors.text }]}>
                  {sheetMode === 'add_value' ? 'Enter Value(s)' : 'Enter Initial Values'}
                </Text>
                <TextInput
                  value={formValues}
                  onChangeText={setFormValues}
                  placeholder={
                    selectedVariantName.toLowerCase().includes('color')
                      ? 'e.g. Purple, Gold, Navy Blue'
                      : selectedVariantName.toLowerCase().includes('size')
                      ? 'e.g. 3XL, 34, Medium'
                      : selectedVariantName.toLowerCase().includes('weight')
                      ? 'e.g. 10kg, 100g, 500g'
                      : 'e.g. Red, Green, Blue (separate by comma)'
                  }
                  placeholderTextColor={colors.textMuted}
                  autoFocus
                  style={[
                    tw('h-11 px-3.5 rounded-xl border text-xs font-medium'),
                    {
                      backgroundColor: colors.inputBackground,
                      borderColor: colors.inputBorder,
                      color: colors.text,
                    },
                  ]}
                />
                <Text style={[tw('text-xs mt-1.5'), { color: colors.textMuted, fontSize: 10.5 }]}>
                  Tip: You can enter multiple values separated by commas (e.g. "Red, Green, Blue")
                </Text>
              </View>

              {/* Save / Add Button in slide sheet */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleSaveSheet}
                style={[
                  tw('h-12 rounded-2xl flex-row items-center justify-center gap-2 shadow-md mt-2 mb-2'),
                  { backgroundColor: roleConfig.color },
                ]}
              >
                <MaterialCommunityIcons name="check-circle" size={18} color="#FFFFFF" />
                <Text style={tw('text-sm font-bold text-white')}>
                  {sheetMode === 'add_value' ? `Save Values to ${selectedVariantName}` : 'Save Variant & Values'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
