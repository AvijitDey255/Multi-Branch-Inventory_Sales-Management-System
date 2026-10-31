import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Linking,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useSelector, useDispatch } from 'react-redux';
import { updateBusinessProfile } from '../store/ecomSlice';
import { darkColors, lightColors } from '../theme/colors';
import { getRoleConfig } from '../utils/roles';
import { getItem, saveItem, StorageKeys } from '../utils/storage';
import { toast, Toaster } from '../components/Toast';
import tw from '../utils/tw';

export default function BusinessScreen({ onNavigate }) {
  const dispatch = useDispatch();
  const mode = useSelector((state) => state.theme.mode);
  const user = useSelector((state) => state.auth.user);
  const storedProfile = useSelector((state) => state.ecom.businessProfile);

  const isDark = mode === 'dark';
  const colors = isDark ? darkColors : lightColors;
  const roleConfig = getRoleConfig(user?.role || 'admin');

  // Curated corporate preset images
  const presetImages = [
    { label: 'Tech Tower', uri: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80' },
    { label: 'Modern Office', uri: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop&q=80' },
    { label: 'Glass Campus', uri: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=600&auto=format&fit=crop&q=80' },
    { label: 'Commercial Hub', uri: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=80' },
  ];

  // Form states
  const [image, setImage] = useState(
    storedProfile?.image || presetImages[0].uri
  );
  const [companyName, setCompanyName] = useState(
    storedProfile?.companyName || 'Nexus Global Technologies Inc.'
  );
  const [mobileNumber, setMobileNumber] = useState(
    storedProfile?.mobileNumber || '+1 (555) 019-2831'
  );
  const [alternativeEmail, setAlternativeEmail] = useState(
    storedProfile?.alternativeEmail || 'support@nexus-enterprise.io'
  );
  const [fullAddress, setFullAddress] = useState(
    storedProfile?.fullAddress ||
      '500 Howard Street, Suite 400, Financial District, San Francisco, CA 94105, USA'
  );
  const [facebook, setFacebook] = useState(
    storedProfile?.links?.facebook || 'https://facebook.com/nexuscommerce'
  );
  const [linkedin, setLinkedin] = useState(
    storedProfile?.links?.linkedin || 'https://linkedin.com/company/nexus-commerce'
  );
  const [website, setWebsite] = useState(
    storedProfile?.links?.website || 'https://nexus-commerce.io'
  );

  const [errors, setErrors] = useState({});

  // Restore stored profile on mount
  useEffect(() => {
    async function loadSavedProfile() {
      const saved = await getItem(StorageKeys.BUSINESS_PROFILE, true);
      if (saved) {
        if (saved.image) setImage(saved.image);
        if (saved.companyName) setCompanyName(saved.companyName);
        if (saved.mobileNumber) setMobileNumber(saved.mobileNumber);
        if (saved.alternativeEmail) setAlternativeEmail(saved.alternativeEmail);
        if (saved.fullAddress) setFullAddress(saved.fullAddress);
        if (saved.links) {
          if (saved.links.facebook) setFacebook(saved.links.facebook);
          if (saved.links.linkedin) setLinkedin(saved.links.linkedin);
          if (saved.links.website) setWebsite(saved.links.website);
        }
      }
    }
    loadSavedProfile();
  }, []);

  // Image upload handler (Web Drive / File Picker or Native Gallery)
  const handlePickImage = async () => {
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
                setImage(event.target.result);
                toast.success('Company image selected from storage.', 'Image Updated');
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
        toast.error('Permission to access photos/drive is required.', 'Permission Denied');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImage(result.assets[0].uri);
        toast.success('Company image updated successfully.', 'Image Selected');
      }
    } catch (err) {
      console.warn('Image picker error:', err);
      toast.error('Failed to open file picker.', 'Notice');
    }
  };

  // Open external links
  const handleOpenLink = async (url, title) => {
    if (!url || !url.trim()) {
      toast.error(`Please provide a ${title} link first.`, 'Empty Link');
      return;
    }
    const cleanUrl = url.trim().startsWith('http') ? url.trim() : `https://${url.trim()}`;
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.open(cleanUrl, '_blank');
      } else {
        await Linking.openURL(cleanUrl);
      }
    } catch (_) {
      toast.error(`Could not open ${cleanUrl}`, 'Link Error');
    }
  };

  // Form validation
  const validate = () => {
    const errs = {};
    if (!companyName.trim()) {
      errs.companyName = 'Company name is required';
    }
    if (!mobileNumber.trim()) {
      errs.mobileNumber = 'Mobile number is required';
    }
    if (!alternativeEmail.trim()) {
      errs.alternativeEmail = 'Alternative email ID is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(alternativeEmail.trim())) {
      errs.alternativeEmail = 'Please enter a valid email address';
    }
    if (!fullAddress.trim()) {
      errs.fullAddress = 'Full corporate address is required';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Save changes
  const handleSaveProfile = async () => {
    if (!validate()) {
      toast.error('Please complete all required fields.', 'Validation Error');
      return;
    }

    const updated = {
      image,
      companyName: companyName.trim(),
      mobileNumber: mobileNumber.trim(),
      alternativeEmail: alternativeEmail.trim(),
      fullAddress: fullAddress.trim(),
      links: {
        facebook: facebook.trim(),
        linkedin: linkedin.trim(),
        website: website.trim(),
      },
    };

    dispatch(updateBusinessProfile(updated));
    await saveItem(StorageKeys.BUSINESS_PROFILE, updated);

    toast.success('Business profile updated successfully!', 'Changes Saved');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[tw('flex-1'), { backgroundColor: colors.background }]}
    >
      <Toaster insideModal={false} />

      <ScrollView
        contentContainerStyle={tw('p-4 pb-28')}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header Navigation */}
        <View style={tw('flex-row items-center justify-between mb-5')}>
          <View style={tw('flex-row items-center gap-3')}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => onNavigate && onNavigate('More')}
              style={[
                tw('w-10 h-10 rounded-2xl items-center justify-center border shadow-sm'),
                { borderColor: colors.border, backgroundColor: colors.surfaceElevated },
              ]}
              accessibilityLabel="Back to Menu"
            >
              <MaterialCommunityIcons name="arrow-left" size={20} color={colors.text} />
            </TouchableOpacity>
            <View>
              <Text style={[tw('text-xl font-black'), { color: colors.text }]}>
                Business Profile
              </Text>
              <Text style={[tw('text-xs font-semibold'), { color: colors.textSecondary }]}>
                Company identity & verified presence
              </Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleSaveProfile}
            style={[
              tw('flex-row items-center gap-1.5 px-3.5 py-2 rounded-2xl shadow-sm'),
              { backgroundColor: roleConfig.color },
            ]}
          >
            <MaterialCommunityIcons name="check" size={16} color="#FFFFFF" />
            <Text style={tw('text-xs font-black text-white uppercase tracking-wider')}>
              Save
            </Text>
          </TouchableOpacity>
        </View>

        {/* Hero Identity Banner & Image */}
        <View
          style={[
            tw('rounded-3xl border overflow-hidden mb-5 shadow-sm'),
            {
              backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
              borderColor: colors.border,
            },
          ]}
        >
          {/* Cover Photo */}
          <View style={[tw('w-full h-40 relative'), { backgroundColor: colors.surfaceElevated }]}>
            <Image
              source={{ uri: image }}
              style={tw('w-full h-full')}
              resizeMode="cover"
            />
            {/* Status Pill */}
            <View
              style={[
                tw('absolute top-3.5 right-3.5 px-3 py-1 rounded-full flex-row items-center gap-1.5 border backdrop-blur-md'),
                {
                  backgroundColor: 'rgba(15, 23, 42, 0.75)',
                  borderColor: 'rgba(255,255,255,0.2)',
                },
              ]}
            >
              <MaterialCommunityIcons name="check-decagram" size={14} color="#10B981" />
              <Text style={tw('text-xs font-bold text-white')}>VERIFIED BUSINESS</Text>
            </View>

            {/* Change Image Button Over Cover */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handlePickImage}
              style={[
                tw('absolute bottom-3 right-3 px-3 py-1.5 rounded-xl flex-row items-center gap-1.5 border shadow-md'),
                {
                  backgroundColor: 'rgba(15, 23, 42, 0.85)',
                  borderColor: 'rgba(255,255,255,0.25)',
                },
              ]}
            >
              <MaterialCommunityIcons name="camera-plus-outline" size={15} color="#FFFFFF" />
              <Text style={tw('text-xs font-bold text-white')}>Upload Photo</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Presets Selection Bar */}
          <View style={[tw('p-3.5 border-t'), { borderColor: colors.border, backgroundColor: colors.surfaceElevated }]}>
            <Text style={[tw('text-xs font-bold uppercase mb-2 tracking-wider'), { color: colors.textMuted }]}>
              SELECT COVER PRESET OR UPLOAD
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={tw('flex-row gap-2')}>
                {presetImages.map((preset) => {
                  const isSelected = image === preset.uri;
                  return (
                    <TouchableOpacity
                      key={preset.label}
                      activeOpacity={0.8}
                      onPress={() => {
                        setImage(preset.uri);
                        toast.info(`Applied cover: ${preset.label}`);
                      }}
                      style={[
                        tw('flex-row items-center gap-2 p-1.5 pr-3 rounded-xl border'),
                        {
                          backgroundColor: isSelected ? `${roleConfig.color}20` : (isDark ? '#0F172A' : '#FFFFFF'),
                          borderColor: isSelected ? roleConfig.color : colors.border,
                        },
                      ]}
                    >
                      <Image source={{ uri: preset.uri }} style={tw('w-7 h-7 rounded-lg')} />
                      <Text
                        style={[
                          tw('text-xs font-bold'),
                          { color: isSelected ? roleConfig.color : colors.text },
                        ]}
                      >
                        {preset.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        </View>

        {/* Form Section 1: Company Profile Details */}
        <View
          style={[
            tw('p-4.5 rounded-3xl border mb-4 shadow-sm gap-4'),
            {
              backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
              borderColor: colors.border,
            },
          ]}
        >
          <View style={tw('flex-row items-center gap-2 pb-2.5 border-b border-slate-100')}>
            <View
              style={[
                tw('w-7 h-7 rounded-lg items-center justify-center'),
                { backgroundColor: `${roleConfig.color}20` },
              ]}
            >
              <MaterialCommunityIcons name="domain" size={16} color={roleConfig.color} />
            </View>
            <Text style={[tw('text-sm font-extrabold'), { color: colors.text }]}>
              COMPANY INFORMATION
            </Text>
          </View>

          {/* Company Name */}
          <View>
            <Text style={[tw('text-xs font-bold uppercase mb-1.5 tracking-wider'), { color: colors.textSecondary }]}>
              Company Name *
            </Text>
            <View
              style={[
                tw('flex-row items-center h-12 px-3.5 rounded-2xl border'),
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: errors.companyName ? colors.danger : colors.inputBorder,
                },
              ]}
            >
              <MaterialCommunityIcons
                name="office-building"
                size={18}
                color={errors.companyName ? colors.danger : colors.textMuted}
                style={tw('mr-2.5')}
              />
              <TextInput
                value={companyName}
                onChangeText={(text) => {
                  setCompanyName(text);
                  if (errors.companyName) setErrors((prev) => ({ ...prev, companyName: null }));
                }}
                placeholder="Enter corporate business name"
                placeholderTextColor={colors.textMuted}
                style={[tw('flex-1 text-xs font-semibold'), { color: colors.text }]}
              />
            </View>
            {errors.companyName && (
              <Text style={[tw('text-xs mt-1 font-semibold'), { color: colors.danger }]}>
                {errors.companyName}
              </Text>
            )}
          </View>
        </View>

        {/* Form Section 2: Contact Information */}
        <View
          style={[
            tw('p-4.5 rounded-3xl border mb-4 shadow-sm gap-4'),
            {
              backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
              borderColor: colors.border,
            },
          ]}
        >
          <View style={tw('flex-row items-center gap-2 pb-2.5 border-b border-slate-100')}>
            <View
              style={[
                tw('w-7 h-7 rounded-lg items-center justify-center'),
                { backgroundColor: '#10B98120' },
              ]}
            >
              <MaterialCommunityIcons name="card-account-phone-outline" size={16} color="#10B981" />
            </View>
            <Text style={[tw('text-sm font-extrabold'), { color: colors.text }]}>
              OFFICIAL CONTACT
            </Text>
          </View>

          {/* Mobile Number */}
          <View>
            <Text style={[tw('text-xs font-bold uppercase mb-1.5 tracking-wider'), { color: colors.textSecondary }]}>
              Mobile Number *
            </Text>
            <View
              style={[
                tw('flex-row items-center h-12 px-3.5 rounded-2xl border'),
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: errors.mobileNumber ? colors.danger : colors.inputBorder,
                },
              ]}
            >
              <MaterialCommunityIcons
                name="phone-outline"
                size={18}
                color={errors.mobileNumber ? colors.danger : colors.textMuted}
                style={tw('mr-2.5')}
              />
              <TextInput
                value={mobileNumber}
                onChangeText={(text) => {
                  setMobileNumber(text);
                  if (errors.mobileNumber) setErrors((prev) => ({ ...prev, mobileNumber: null }));
                }}
                placeholder="+1 (555) 000-0000"
                placeholderTextColor={colors.textMuted}
                keyboardType="phone-pad"
                style={[tw('flex-1 text-xs font-semibold'), { color: colors.text }]}
              />
            </View>
            {errors.mobileNumber && (
              <Text style={[tw('text-xs mt-1 font-semibold'), { color: colors.danger }]}>
                {errors.mobileNumber}
              </Text>
            )}
          </View>

          {/* Alternative Email ID */}
          <View>
            <Text style={[tw('text-xs font-bold uppercase mb-1.5 tracking-wider'), { color: colors.textSecondary }]}>
              Alternative Email ID *
            </Text>
            <View
              style={[
                tw('flex-row items-center h-12 px-3.5 rounded-2xl border'),
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: errors.alternativeEmail ? colors.danger : colors.inputBorder,
                },
              ]}
            >
              <MaterialCommunityIcons
                name="email-outline"
                size={18}
                color={errors.alternativeEmail ? colors.danger : colors.textMuted}
                style={tw('mr-2.5')}
              />
              <TextInput
                value={alternativeEmail}
                onChangeText={(text) => {
                  setAlternativeEmail(text);
                  if (errors.alternativeEmail) setErrors((prev) => ({ ...prev, alternativeEmail: null }));
                }}
                placeholder="support@company.com"
                placeholderTextColor={colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                style={[tw('flex-1 text-xs font-semibold'), { color: colors.text }]}
              />
            </View>
            {errors.alternativeEmail && (
              <Text style={[tw('text-xs mt-1 font-semibold'), { color: colors.danger }]}>
                {errors.alternativeEmail}
              </Text>
            )}
          </View>
        </View>

        {/* Form Section 3: Full Address */}
        <View
          style={[
            tw('p-4.5 rounded-3xl border mb-4 shadow-sm gap-4'),
            {
              backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
              borderColor: colors.border,
            },
          ]}
        >
          <View style={tw('flex-row items-center gap-2 pb-2.5 border-b border-slate-100')}>
            <View
              style={[
                tw('w-7 h-7 rounded-lg items-center justify-center'),
                { backgroundColor: '#F59E0B20' },
              ]}
            >
              <MaterialCommunityIcons name="map-marker-radius-outline" size={16} color="#F59E0B" />
            </View>
            <Text style={[tw('text-sm font-extrabold'), { color: colors.text }]}>
              LOCATION & ADDRESS
            </Text>
          </View>

          <View>
            <Text style={[tw('text-xs font-bold uppercase mb-1.5 tracking-wider'), { color: colors.textSecondary }]}>
              Full Address *
            </Text>
            <View
              style={[
                tw('p-3.5 rounded-2xl border'),
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: errors.fullAddress ? colors.danger : colors.inputBorder,
                },
              ]}
            >
              <View style={tw('flex-row items-start gap-2.5')}>
                <MaterialCommunityIcons
                  name="map-marker-outline"
                  size={19}
                  color={errors.fullAddress ? colors.danger : colors.textMuted}
                  style={tw('mt-0.5')}
                />
                <TextInput
                  value={fullAddress}
                  onChangeText={(text) => {
                    setFullAddress(text);
                    if (errors.fullAddress) setErrors((prev) => ({ ...prev, fullAddress: null }));
                  }}
                  placeholder="Street address, building suite, city, state, postal code, country"
                  placeholderTextColor={colors.textMuted}
                  multiline
                  numberOfLines={3}
                  style={[tw('flex-1 text-xs font-medium leading-5'), { color: colors.text, minHeight: 64 }]}
                />
              </View>
            </View>
            {errors.fullAddress && (
              <Text style={[tw('text-xs mt-1 font-semibold'), { color: colors.danger }]}>
                {errors.fullAddress}
              </Text>
            )}
          </View>
        </View>

        {/* Form Section 4: Social & Web Links */}
        <View
          style={[
            tw('p-4.5 rounded-3xl border mb-6 shadow-sm gap-3.5'),
            {
              backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
              borderColor: colors.border,
            },
          ]}
        >
          <View style={tw('flex-row items-center justify-between pb-2.5 border-b border-slate-100')}>
            <View style={tw('flex-row items-center gap-2')}>
              <View
                style={[
                  tw('w-7 h-7 rounded-lg items-center justify-center'),
                  { backgroundColor: '#6366F120' },
                ]}
              >
                <MaterialCommunityIcons name="share-variant-outline" size={16} color="#6366F1" />
              </View>
              <Text style={[tw('text-sm font-extrabold'), { color: colors.text }]}>
                LINKS (FACEBOOK, LINKEDIN, WEBSITE)
              </Text>
            </View>
            <Text style={[tw('text-xs font-semibold'), { color: colors.textMuted }]}>
              Tap icon to visit
            </Text>
          </View>

          {/* Facebook */}
          <View>
            <Text style={[tw('text-xs font-semibold mb-1'), { color: colors.text }]}>
              Facebook Profile / Page
            </Text>
            <View
              style={[
                tw('flex-row items-center h-12 px-3.5 rounded-2xl border'),
                { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder },
              ]}
            >
              <MaterialCommunityIcons name="facebook" size={20} color="#1877F2" style={tw('mr-2.5')} />
              <TextInput
                value={facebook}
                onChangeText={setFacebook}
                placeholder="https://facebook.com/your-business"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
                style={[tw('flex-1 text-xs font-semibold'), { color: colors.text }]}
              />
              {facebook ? (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleOpenLink(facebook, 'Facebook')}
                  style={[tw('flex-row items-center gap-1 px-2.5 py-1 rounded-xl'), { backgroundColor: '#1877F218' }]}
                >
                  <Text style={[tw('text-xs font-bold'), { color: '#1877F2', fontSize: 11 }]}>Visit</Text>
                  <MaterialCommunityIcons name="open-in-new" size={13} color="#1877F2" />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          {/* LinkedIn */}
          <View>
            <Text style={[tw('text-xs font-semibold mb-1'), { color: colors.text }]}>
              LinkedIn Company Page
            </Text>
            <View
              style={[
                tw('flex-row items-center h-12 px-3.5 rounded-2xl border'),
                { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder },
              ]}
            >
              <MaterialCommunityIcons name="linkedin" size={20} color="#0A66C2" style={tw('mr-2.5')} />
              <TextInput
                value={linkedin}
                onChangeText={setLinkedin}
                placeholder="https://linkedin.com/company/your-business"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
                style={[tw('flex-1 text-xs font-semibold'), { color: colors.text }]}
              />
              {linkedin ? (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleOpenLink(linkedin, 'LinkedIn')}
                  style={[tw('flex-row items-center gap-1 px-2.5 py-1 rounded-xl'), { backgroundColor: '#0A66C218' }]}
                >
                  <Text style={[tw('text-xs font-bold'), { color: '#0A66C2', fontSize: 11 }]}>Visit</Text>
                  <MaterialCommunityIcons name="open-in-new" size={13} color="#0A66C2" />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          {/* Website */}
          <View>
            <Text style={[tw('text-xs font-semibold mb-1'), { color: colors.text }]}>
              Official Website
            </Text>
            <View
              style={[
                tw('flex-row items-center h-12 px-3.5 rounded-2xl border'),
                { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder },
              ]}
            >
              <MaterialCommunityIcons name="web" size={20} color={roleConfig.color} style={tw('mr-2.5')} />
              <TextInput
                value={website}
                onChangeText={setWebsite}
                placeholder="https://your-company.com"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
                style={[tw('flex-1 text-xs font-semibold'), { color: colors.text }]}
              />
              {website ? (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleOpenLink(website, 'Website')}
                  style={[tw('flex-row items-center gap-1 px-2.5 py-1 rounded-xl'), { backgroundColor: `${roleConfig.color}18` }]}
                >
                  <Text style={[tw('text-xs font-bold'), { color: roleConfig.color, fontSize: 11 }]}>Visit</Text>
                  <MaterialCommunityIcons name="open-in-new" size={13} color={roleConfig.color} />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        </View>

        {/* Bottom Save Action Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleSaveProfile}
          style={[
            tw('h-13 rounded-2xl flex-row items-center justify-center gap-2.5 shadow-xl'),
            { backgroundColor: roleConfig.color },
          ]}
        >
          <MaterialCommunityIcons name="content-save-check" size={20} color="#FFFFFF" />
          <Text style={tw('text-sm font-bold text-white tracking-wide')}>
            Save Business Profile
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
