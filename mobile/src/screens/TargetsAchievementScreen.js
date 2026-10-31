import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { darkColors, lightColors } from '../theme/colors';
import { getRoleConfig } from '../utils/roles';
import tw from '../utils/tw';

export default function TargetsAchievementScreen({ onNavigate }) {
  const mode = useSelector((state) => state.theme.mode);
  const user = useSelector((state) => state.auth.user);
  const isDark = mode === 'dark';
  const colors = isDark ? darkColors : lightColors;
  const roleConfig = getRoleConfig('salesman');

  const monthlyQuota = 18000;
  const currentSales = 14200;
  const progressPct = Math.round((currentSales / monthlyQuota) * 100);
  const commissionRate = 10;
  const earnedCommission = (currentSales * (commissionRate / 100));

  const deals = [
    { id: 'DL-901', client: 'Apex Design Collective', amount: 2150, date: 'Yesterday', items: 'OmniStudio Soundstage 4 Booking' },
    { id: 'DL-898', client: 'Velox Retail Inc', amount: 3400, date: 'Oct 14, 2026', items: 'Titan Pro Keyboards (x12) + Headsets' },
    { id: 'DL-882', client: 'Starlight Tech Inc', amount: 4850, date: 'Oct 10, 2026', items: 'Apex Horizon Curved 34" Monitors (x6)' },
    { id: 'DL-870', client: 'Watson Creative Studio', amount: 3800, date: 'Oct 04, 2026', items: 'AeroGlide 4K Ultra Drones (x4)' },
  ];

  return (
    <View style={[tw('flex-1'), { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={tw('p-4 pb-16')} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={tw('flex-row items-center gap-2.5 mb-4')}>
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
              Targets & Achievements
            </Text>
            <Text style={[tw('text-xs'), { color: colors.textSecondary }]}>
              Monthly quota tracking, bonus tiers & closed deals
            </Text>
          </View>
        </View>

        {/* Big Progress Card */}
        <View
          style={[
            tw('p-4 rounded-3xl border mb-5 shadow-sm'),
            { backgroundColor: isDark ? '#1E293B' : '#FFFFFF', borderColor: colors.border },
          ]}
        >
          <View style={tw('flex-row items-center justify-between mb-2')}>
            <View>
              <Text style={[tw('text-xs font-semibold'), { color: colors.textSecondary }]}>
                October Monthly Sales Quota
              </Text>
              <Text style={[tw('text-2xl font-black mt-0.5'), { color: colors.text }]}>
                ${currentSales.toLocaleString()} <Text style={[tw('text-sm font-normal'), { color: colors.textMuted }]}>/ ${monthlyQuota.toLocaleString()}</Text>
              </Text>
            </View>

            <View style={[tw('px-3 py-1 rounded-full'), { backgroundColor: '#10B98120' }]}>
              <Text style={[tw('text-xs font-black'), { color: '#10B981' }]}>
                {progressPct}% Achieved
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={tw('h-3.5 rounded-full bg-slate-200 overflow-hidden my-2.5')}>
            <View
              style={[
                tw('h-full rounded-full'),
                { width: `${progressPct}%`, backgroundColor: '#10B981' },
              ]}
            />
          </View>

          <View style={tw('flex-row justify-between items-center mt-1')}>
            <Text style={[tw('text-xs'), { color: colors.textMuted }]}>
              Just ${(monthlyQuota - currentSales).toLocaleString()} remaining to unlock tier-2 bonus.
            </Text>
            <Text style={[tw('text-xs font-bold'), { color: '#10B981' }]}>
              14 Days Left
            </Text>
          </View>
        </View>

        {/* 2 Earnings & Bonus Metric Cards */}
        <View style={tw('flex-row gap-3 mb-5')}>
          <View
            style={[
              tw('flex-1 p-3.5 rounded-2xl border shadow-sm'),
              { backgroundColor: isDark ? '#1E293B' : '#FFFFFF', borderColor: colors.border },
            ]}
          >
            <View style={tw('flex-row items-center justify-between mb-1')}>
              <Text style={[tw('text-xs font-semibold'), { color: colors.textSecondary }]}>
                Commission (10%)
              </Text>
              <MaterialCommunityIcons name="wallet-giftcard" size={18} color="#10B981" />
            </View>
            <Text style={[tw('text-lg font-black mt-1'), { color: '#10B981' }]}>
              ${earnedCommission.toFixed(0)}
            </Text>
            <Text style={[tw('text-xs mt-0.5'), { color: colors.textMuted, fontSize: 10.5 }]}>
              Direct bank deposit next Friday
            </Text>
          </View>

          <View
            style={[
              tw('flex-1 p-3.5 rounded-2xl border shadow-sm'),
              { backgroundColor: isDark ? '#1E293B' : '#FFFFFF', borderColor: colors.border },
            ]}
          >
            <View style={tw('flex-row items-center justify-between mb-1')}>
              <Text style={[tw('text-xs font-semibold'), { color: colors.textSecondary }]}>
                Branch Rank
              </Text>
              <MaterialCommunityIcons name="trophy-award" size={18} color="#F59E0B" />
            </View>
            <Text style={[tw('text-lg font-black mt-1'), { color: '#F59E0B' }]}>
              #2 of 14 Reps
            </Text>
            <Text style={[tw('text-xs mt-0.5'), { color: colors.textMuted, fontSize: 10.5 }]}>
              Top 10% Sales Force
            </Text>
          </View>
        </View>

        {/* Recent Deals Contributing to Target */}
        <View style={tw('flex-row items-center justify-between mb-3')}>
          <Text style={[tw('text-sm font-bold'), { color: colors.text }]}>
            Recent Closed Deals (This Month)
          </Text>
          <TouchableOpacity onPress={() => onNavigate && onNavigate('Orders')}>
            <Text style={[tw('text-xs font-bold'), { color: roleConfig.color }]}>
              + Place Deal
            </Text>
          </TouchableOpacity>
        </View>

        <View style={tw('gap-3')}>
          {deals.map((dl) => (
            <View
              key={dl.id}
              style={[
                tw('p-3.5 rounded-2xl border shadow-sm'),
                { backgroundColor: isDark ? '#1E293B' : '#FFFFFF', borderColor: colors.border },
              ]}
            >
              <View style={tw('flex-row items-center justify-between mb-1')}>
                <View style={tw('flex-row items-center gap-2')}>
                  <MaterialCommunityIcons name="file-check-outline" size={18} color="#10B981" />
                  <Text style={[tw('text-xs font-bold'), { color: colors.text }]}>
                    {dl.id} • {dl.client}
                  </Text>
                </View>
                <Text style={[tw('text-xs font-semibold'), { color: colors.textMuted }]}>
                  {dl.date}
                </Text>
              </View>

              <Text style={[tw('text-xs my-0.5'), { color: colors.textSecondary }]}>
                {dl.items}
              </Text>

              <View style={tw('flex-row items-center justify-between pt-2 border-t border-slate-100 mt-1')}>
                <Text style={[tw('text-xs'), { color: colors.textMuted }]}>
                  Commission: +${(dl.amount * 0.1).toFixed(0)}
                </Text>
                <Text style={[tw('text-sm font-black'), { color: colors.text }]}>
                  ${dl.amount.toLocaleString()}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
