import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { darkColors, lightColors } from '../theme/colors';
import { getRoleConfig } from '../utils/roles';
import tw from '../utils/tw';

export default function MyOrdersScreen() {
  const mode = useSelector((state) => state.theme.mode);
  const user = useSelector((state) => state.auth.user);
  const orders = useSelector((state) => state.ecom.orders);
  const isDark = mode === 'dark';
  const colors = isDark ? darkColors : lightColors;

  const roleConfig = getRoleConfig('customer');

  const steps = ['Placed', 'Processing', 'In Transit', 'Delivered'];

  return (
    <View style={[tw('flex-1'), { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={tw('p-4 pb-16')} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={tw('flex-row items-center justify-between mb-4')}>
          <View>
            <Text style={[tw('text-xl font-black'), { color: colors.text }]}>
              My Purchases & Tracking
            </Text>
            <Text style={[tw('text-xs mt-0.5'), { color: colors.textSecondary }]}>
              Live delivery progress, order receipts, and repeat orders
            </Text>
          </View>
          <View
            style={[
              tw('px-2.5 py-1 rounded-lg border'),
              { backgroundColor: `${roleConfig.color}15`, borderColor: roleConfig.color },
            ]}
          >
            <Text style={[tw('text-xs font-bold'), { color: roleConfig.color }]}>
              {roleConfig.badge}
            </Text>
          </View>
        </View>

        {/* Orders List */}
        <View style={tw('gap-4')}>
          {orders.map((ord) => {
            const currentStep = ord.trackingStep || 1;

            return (
              <View
                key={ord.id}
                style={[
                  tw('p-4 rounded-2xl border shadow-sm'),
                  {
                    backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                    borderColor: colors.border,
                  },
                ]}
              >
                {/* Header Row */}
                <View style={tw('flex-row items-center justify-between mb-2')}>
                  <View style={tw('flex-row items-center gap-2')}>
                    <MaterialCommunityIcons
                      name="package-variant-closed"
                      size={20}
                      color={roleConfig.color}
                    />
                    <Text style={[tw('text-sm font-bold'), { color: colors.text }]}>
                      {ord.id}
                    </Text>
                  </View>
                  <View style={tw('flex-row items-center gap-1')}>
                    <Text style={[tw('text-xs font-semibold'), { color: colors.textMuted }]}>
                      {ord.date}
                    </Text>
                  </View>
                </View>

                {/* Items & Total */}
                <View style={tw('my-2')}>
                  <Text style={[tw('text-sm font-bold'), { color: colors.text }]}>
                    {ord.items}
                  </Text>
                  <Text style={[tw('text-xs mt-0.5'), { color: colors.textSecondary }]}>
                    Dispatched by Nexus Prime Air • Tracking #NX-{ord.id.replace('ORD-', '')}-EXP
                  </Text>
                </View>

                {/* Visual Step Tracker */}
                <View style={tw('my-3 p-3 rounded-xl bg-slate-50 border border-slate-200')}>
                  <View style={tw('flex-row justify-between items-center mb-1.5')}>
                    {steps.map((st, idx) => {
                      const isComplete = idx <= currentStep;
                      return (
                        <View key={st} style={tw('items-center flex-1')}>
                          <View
                            style={[
                              tw('w-6 h-6 rounded-full items-center justify-center'),
                              {
                                backgroundColor: isComplete ? '#10B981' : '#CBD5E1',
                              },
                            ]}
                          >
                            <MaterialCommunityIcons
                              name={isComplete ? 'check' : 'circle-small'}
                              size={14}
                              color="#FFFFFF"
                            />
                          </View>
                          <Text
                            style={[
                              tw('text-xs mt-1 font-semibold'),
                              {
                                color: isComplete ? '#10B981' : '#94A3B8',
                                fontSize: 9.5,
                              },
                            ]}
                          >
                            {st}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </View>

                {/* Footer */}
                <View style={tw('flex-row items-center justify-between pt-2 border-t border-slate-100')}>
                  <View>
                    <Text style={[tw('text-xs'), { color: colors.textMuted }]}>Paid Total</Text>
                    <Text style={[tw('text-base font-black'), { color: colors.text }]}>
                      ${ord.total.toFixed(2)}
                    </Text>
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => Alert.alert('Order Placed Again', `Added items from ${ord.id} to cart.`)}
                    style={[
                      tw('px-3 py-1.5 rounded-xl border flex-row items-center gap-1.5'),
                      { borderColor: colors.border, backgroundColor: colors.surfaceElevated },
                    ]}
                  >
                    <MaterialCommunityIcons name="reload" size={14} color={colors.text} />
                    <Text style={[tw('text-xs font-bold'), { color: colors.text }]}>
                      Order Again
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
