import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { darkColors, lightColors } from '../theme/colors';
import { getRoleConfig } from '../utils/roles';
import tw from '../utils/tw';

export default function SetTargetsScreen({ onNavigate }) {
  const mode = useSelector((state) => state.theme.mode);
  const user = useSelector((state) => state.auth.user);
  const isDark = mode === 'dark';
  const colors = isDark ? darkColors : lightColors;
  const roleConfig = getRoleConfig('manager');

  const [branchGoal, setBranchGoal] = useState('75000');
  const [incentiveRate, setIncentiveRate] = useState('10');
  const [minDeals, setMinDeals] = useState('20');

  const [salesmenTargets, setSalesmenTargets] = useState([
    {
      id: 'SLS-01',
      name: 'Leo Vance',
      quota: 18000,
      achieved: 14200,
      deals: 12,
    },
    {
      id: 'SLS-02',
      name: 'Marcus Brody',
      quota: 22000,
      achieved: 20100,
      deals: 16,
    },
    {
      id: 'SLS-03',
      name: 'Elena Rostova',
      quota: 15000,
      achieved: 11800,
      deals: 9,
    },
    {
      id: 'SLS-04',
      name: 'Devon Miles',
      quota: 20000,
      achieved: 18100,
      deals: 14,
    },
  ]);

  const handleSave = () => {
    Alert.alert('Targets Applied', `Branch quota of $${parseInt(branchGoal, 10).toLocaleString()} and ${incentiveRate}% incentive set for the sales force.`);
  };

  const totalQuota = salesmenTargets.reduce((a, b) => a + b.quota, 0);
  const totalAchieved = salesmenTargets.reduce((a, b) => a + b.achieved, 0);
  const progressPercent = Math.round((totalAchieved / totalQuota) * 100);

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
              Set Branch Targets
            </Text>
            <Text style={[tw('text-xs'), { color: colors.textSecondary }]}>
              Define sales targets, incentive brackets & salesman quotas
            </Text>
          </View>
        </View>

        {/* Progress Gauge */}
        <View
          style={[
            tw('p-4 rounded-3xl border mb-5 shadow-sm'),
            { backgroundColor: isDark ? '#1E293B' : '#FFFFFF', borderColor: colors.border },
          ]}
        >
          <View style={tw('flex-row items-center justify-between mb-2')}>
            <View>
              <Text style={[tw('text-xs font-semibold'), { color: colors.textSecondary }]}>
                Current Branch Achievement
              </Text>
              <Text style={[tw('text-xl font-black mt-0.5'), { color: colors.text }]}>
                ${totalAchieved.toLocaleString()} / ${totalQuota.toLocaleString()}
              </Text>
            </View>
            <View style={[tw('px-3 py-1 rounded-full'), { backgroundColor: '#10B98120' }]}>
              <Text style={[tw('text-xs font-black'), { color: '#10B981' }]}>
                {progressPercent}% Met
              </Text>
            </View>
          </View>

          {/* Bar */}
          <View style={tw('h-3 rounded-full bg-slate-200 overflow-hidden my-2')}>
            <View
              style={[
                tw('h-full rounded-full'),
                { width: `${progressPercent}%`, backgroundColor: '#10B981' },
              ]}
            />
          </View>
          <Text style={[tw('text-xs mt-1'), { color: colors.textMuted }]}>
            Target window closes in 14 days. 4 sales reps active on quota.
          </Text>
        </View>

        {/* Target Parameters */}
        <View
          style={[
            tw('p-4 rounded-3xl border mb-5 shadow-sm gap-3.5'),
            { backgroundColor: isDark ? '#1E293B' : '#FFFFFF', borderColor: colors.border },
          ]}
        >
          <Text style={[tw('text-xs font-bold uppercase'), { color: roleConfig.color }]}>
            MONTHLY TARGET PARAMETERS
          </Text>

          <View style={tw('flex-row gap-3')}>
            <View style={tw('flex-1')}>
              <Text style={[tw('text-xs font-semibold mb-1'), { color: colors.text }]}>
                Branch Revenue Goal ($)
              </Text>
              <TextInput
                value={branchGoal}
                onChangeText={setBranchGoal}
                keyboardType="numeric"
                style={[
                  tw('h-11 px-3.5 rounded-xl border text-xs'),
                  { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.text },
                ]}
              />
            </View>
            <View style={tw('flex-1')}>
              <Text style={[tw('text-xs font-semibold mb-1'), { color: colors.text }]}>
                Bonus Incentive (%)
              </Text>
              <TextInput
                value={incentiveRate}
                onChangeText={setIncentiveRate}
                keyboardType="numeric"
                style={[
                  tw('h-11 px-3.5 rounded-xl border text-xs'),
                  { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.text },
                ]}
              />
            </View>
          </View>

          <View>
            <Text style={[tw('text-xs font-semibold mb-1'), { color: colors.text }]}>
              Minimum Required Deal Count
            </Text>
            <TextInput
              value={minDeals}
              onChangeText={setMinDeals}
              keyboardType="numeric"
              style={[
                tw('h-11 px-3.5 rounded-xl border text-xs'),
                { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.text },
              ]}
            />
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSave}
            style={[
              tw('h-11 rounded-xl flex-row items-center justify-center gap-2 mt-1 shadow-sm'),
              { backgroundColor: roleConfig.color },
            ]}
          >
            <MaterialCommunityIcons name="target" size={16} color="#FFFFFF" />
            <Text style={tw('text-xs font-bold text-white')}>Update & Broadcast Targets</Text>
          </TouchableOpacity>
        </View>

        {/* Assigned Reps List */}
        <Text style={[tw('text-sm font-bold mb-3'), { color: colors.text }]}>
          Sales Representatives Assigned
        </Text>

        <View style={tw('gap-3')}>
          {salesmenTargets.map((s) => {
            const pct = Math.round((s.achieved / s.quota) * 100);
            return (
              <View
                key={s.id}
                style={[
                  tw('p-3.5 rounded-2xl border shadow-sm'),
                  { backgroundColor: isDark ? '#1E293B' : '#FFFFFF', borderColor: colors.border },
                ]}
              >
                <View style={tw('flex-row items-center justify-between mb-1.5')}>
                  <View style={tw('flex-row items-center gap-2')}>
                    <MaterialCommunityIcons name="account-star" size={18} color={roleConfig.color} />
                    <Text style={[tw('text-sm font-bold'), { color: colors.text }]}>
                      {s.name}
                    </Text>
                  </View>
                  <Text style={[tw('text-xs font-black'), { color: roleConfig.color }]}>
                    {pct}% Target
                  </Text>
                </View>

                <View style={tw('flex-row justify-between my-1')}>
                  <Text style={[tw('text-xs'), { color: colors.textSecondary }]}>
                    Achieved: ${s.achieved.toLocaleString()} / Quota: ${s.quota.toLocaleString()}
                  </Text>
                  <Text style={[tw('text-xs font-semibold'), { color: colors.textMuted }]}>
                    {s.deals} deals closed
                  </Text>
                </View>

                <View style={tw('h-2 rounded-full bg-slate-200 overflow-hidden mt-1')}>
                  <View
                    style={[
                      tw('h-full rounded-full'),
                      { width: `${pct}%`, backgroundColor: roleConfig.color },
                    ]}
                  />
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
