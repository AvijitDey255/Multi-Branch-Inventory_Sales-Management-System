import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { darkColors, lightColors } from '../theme/colors';
import { getRoleConfig } from '../utils/roles';
import tw from '../utils/tw';

export default function SpecialOffersScreen({ onNavigate }) {
  const mode = useSelector((state) => state.theme.mode);
  const user = useSelector((state) => state.auth.user);
  const isDark = mode === 'dark';
  const colors = isDark ? darkColors : lightColors;
  const currentRole = user?.role || 'admin';
  const roleConfig = getRoleConfig(currentRole);

  const [offers, setOffers] = useState([
    {
      id: 'OFFER-01',
      code: 'FALL25',
      title: 'Autumn Tech Extravaganza',
      discount: '25% OFF',
      category: 'Audio & Hardware',
      expires: 'Oct 31, 2026',
      minSpend: '$250',
      status: 'Live & Active',
      color: '#6366F1',
    },
    {
      id: 'OFFER-02',
      code: 'ENTERPRISEVIP',
      title: 'Corporate Bulk Purchase Credit',
      discount: '$500 CREDIT',
      category: 'Orders above $3,000',
      expires: 'Nov 15, 2026',
      minSpend: '$3,000',
      status: 'Live & Active',
      color: '#10B981',
    },
    {
      id: 'OFFER-03',
      code: 'FLASHTECH',
      title: 'Free Express Priority Courier',
      discount: 'FREE AIR SHIP',
      category: 'All Categories',
      expires: 'Sunday, 11:59 PM',
      minSpend: '$99',
      status: 'Ending Soon',
      color: '#F59E0B',
    },
    {
      id: 'OFFER-04',
      code: 'WELCOME10',
      title: 'New Client Welcome Voucher',
      discount: '10% OFF',
      category: 'First Order Only',
      expires: 'Dec 31, 2026',
      minSpend: '$50',
      status: 'Ongoing',
      color: '#0EA5E9',
    },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [codeName, setCodeName] = useState('');
  const [discountVal, setDiscountVal] = useState('');
  const [titleName, setTitleName] = useState('');

  const handleCreateOffer = () => {
    if (!codeName.trim() || !discountVal.trim()) {
      Alert.alert('Required Fields', 'Please enter coupon code and discount.');
      return;
    }

    const newOffer = {
      id: `OFFER-0${offers.length + 1}`,
      code: codeName.trim().toUpperCase(),
      title: titleName.trim() || 'Exclusive Promotional Campaign',
      discount: discountVal.trim(),
      category: 'All Store Items',
      expires: 'In 30 Days',
      minSpend: '$100',
      status: 'Live & Active',
      color: roleConfig.color,
    };

    setOffers([newOffer, ...offers]);
    setCodeName('');
    setDiscountVal('');
    setTitleName('');
    setModalVisible(false);
    Alert.alert('Special Offer Created', `Promo code ${newOffer.code} is now live.`);
  };

  return (
    <View style={[tw('flex-1'), { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={tw('p-4 pb-16')} showsVerticalScrollIndicator={false}>
        {/* Header */}
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
                Special Offers & Deals
              </Text>
              <Text style={[tw('text-xs'), { color: colors.textSecondary }]}>
                Promotional coupons, flash discounts & campaign vouchers
              </Text>
            </View>
          </View>

          {(currentRole === 'admin' || currentRole === 'manager') && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setModalVisible(true)}
              style={[
                tw('px-3 py-2 rounded-xl flex-row items-center gap-1.5 shadow-sm'),
                { backgroundColor: roleConfig.color },
              ]}
            >
              <MaterialCommunityIcons name="tag-plus" size={16} color="#FFFFFF" />
              <Text style={tw('text-xs font-bold text-white')}>New Promo</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Offers Cards */}
        <View style={tw('gap-3.5')}>
          {offers.map((offer) => (
            <View
              key={offer.id}
              style={[
                tw('p-4 rounded-3xl border shadow-sm'),
                { backgroundColor: isDark ? '#1E293B' : '#FFFFFF', borderColor: colors.border },
              ]}
            >
              <View style={tw('flex-row items-center justify-between mb-2')}>
                <View
                  style={[
                    tw('px-3 py-1 rounded-xl flex-row items-center gap-1.5 border'),
                    { backgroundColor: `${offer.color}15`, borderColor: offer.color },
                  ]}
                >
                  <MaterialCommunityIcons name="ticket-percent-outline" size={16} color={offer.color} />
                  <Text style={[tw('text-xs font-mono font-black'), { color: offer.color }]}>
                    {offer.code}
                  </Text>
                </View>

                <View style={[tw('px-2.5 py-0.5 rounded-full'), { backgroundColor: `${offer.color}15` }]}>
                  <Text style={[tw('text-xs font-bold'), { color: offer.color, fontSize: 10.5 }]}>
                    {offer.status}
                  </Text>
                </View>
              </View>

              <Text style={[tw('text-base font-bold'), { color: colors.text }]}>
                {offer.title}
              </Text>
              <Text style={[tw('text-xs mt-0.5'), { color: colors.textMuted }]}>
                Category: {offer.category} • Min Spend: {offer.minSpend}
              </Text>

              {/* Footer */}
              <View style={tw('flex-row items-center justify-between pt-2.5 mt-2 border-t border-slate-100')}>
                <View>
                  <Text style={[tw('text-xs'), { color: colors.textMuted }]}>Reward Value</Text>
                  <Text style={[tw('text-base font-black'), { color: offer.color }]}>
                    {offer.discount}
                  </Text>
                </View>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => Alert.alert('Promo Code Applied', `Copied "${offer.code}" to checkout cart.`)}
                  style={[
                    tw('px-3.5 py-1.5 rounded-xl border flex-row items-center gap-1'),
                    { borderColor: colors.border, backgroundColor: colors.surfaceElevated },
                  ]}
                >
                  <MaterialCommunityIcons name="content-copy" size={14} color={colors.text} />
                  <Text style={[tw('text-xs font-bold'), { color: colors.text }]}>
                    Apply Code
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Add Offer Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View
          style={[
            tw('flex-1 items-center justify-center p-4'),
            { backgroundColor: 'rgba(0,0,0,0.6)' },
          ]}
        >
          <View
            style={[
              tw('w-full max-w-md p-5 rounded-3xl border shadow-xl'),
              { backgroundColor: isDark ? '#1E293B' : '#FFFFFF', borderColor: colors.border },
            ]}
          >
            <View style={tw('flex-row items-center justify-between pb-3 border-b border-slate-200 mb-3')}>
              <Text style={[tw('text-base font-bold'), { color: colors.text }]}>
                Create Promotional Offer
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={tw('gap-3 mb-4')}>
              <View>
                <Text style={[tw('text-xs font-semibold mb-1'), { color: colors.text }]}>
                  Promo Coupon Code
                </Text>
                <TextInput
                  value={codeName}
                  onChangeText={setCodeName}
                  placeholder="e.g. VIP2026"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="characters"
                  style={[
                    tw('h-11 px-3.5 rounded-xl border text-xs'),
                    { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.text },
                  ]}
                />
              </View>

              <View>
                <Text style={[tw('text-xs font-semibold mb-1'), { color: colors.text }]}>
                  Campaign Title
                </Text>
                <TextInput
                  value={titleName}
                  onChangeText={setTitleName}
                  placeholder="e.g. Weekend Flash Deal"
                  placeholderTextColor={colors.textMuted}
                  style={[
                    tw('h-11 px-3.5 rounded-xl border text-xs'),
                    { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.text },
                  ]}
                />
              </View>

              <View>
                <Text style={[tw('text-xs font-semibold mb-1'), { color: colors.text }]}>
                  Discount Value (e.g. 20% OFF or $50 OFF)
                </Text>
                <TextInput
                  value={discountVal}
                  onChangeText={setDiscountVal}
                  placeholder="20% OFF"
                  placeholderTextColor={colors.textMuted}
                  style={[
                    tw('h-11 px-3.5 rounded-xl border text-xs'),
                    { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.text },
                  ]}
                />
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleCreateOffer}
              style={[
                tw('h-12 rounded-xl flex-row items-center justify-center gap-2 shadow-md'),
                { backgroundColor: roleConfig.color },
              ]}
            >
              <MaterialCommunityIcons name="tag-check" size={18} color="#FFFFFF" />
              <Text style={tw('text-xs font-bold text-white')}>Launch Promotional Offer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
