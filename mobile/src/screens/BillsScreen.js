import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { payBill } from '../store/ecomSlice';
import { darkColors, lightColors } from '../theme/colors';
import { getRoleConfig } from '../utils/roles';
import tw from '../utils/tw';

export default function BillsScreen() {
  const dispatch = useDispatch();
  const mode = useSelector((state) => state.theme.mode);
  const user = useSelector((state) => state.auth.user);
  const bills = useSelector((state) => state.ecom.bills);
  const isDark = mode === 'dark';
  const colors = isDark ? darkColors : lightColors;

  const roleConfig = getRoleConfig('customer');

  const handlePay = (id, title, amount) => {
    dispatch(payBill(id));
    Alert.alert('Payment Successful', `Paid $${amount} for ${title}. Receipt sent to ${user?.email || 'your email'}.`);
  };

  const dueBills = bills.filter((b) => b.status === 'Due');
  const totalDue = dueBills.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <View style={[tw('flex-1'), { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={tw('p-4 pb-16')} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={tw('flex-row items-center justify-between mb-4')}>
          <View>
            <Text style={[tw('text-xl font-black'), { color: colors.text }]}>
              My Billing & Receipts
            </Text>
            <Text style={[tw('text-xs mt-0.5'), { color: colors.textSecondary }]}>
              Manage customer subscriptions, monthly statements, and payments
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

        {/* Due Banner Card */}
        <View
          style={[
            tw('p-4 rounded-2xl border mb-5 shadow-sm'),
            {
              backgroundColor: isDark ? '#1E293B' : '#FFFBEB',
              borderColor: totalDue > 0 ? '#F59E0B' : '#10B981',
            },
          ]}
        >
          <View style={tw('flex-row items-center justify-between')}>
            <View style={tw('flex-row items-center gap-3')}>
              <View
                style={[
                  tw('w-10 h-10 rounded-xl items-center justify-center'),
                  { backgroundColor: totalDue > 0 ? '#F59E0B' : '#10B981' },
                ]}
              >
                <MaterialCommunityIcons
                  name={totalDue > 0 ? 'credit-card-clock' : 'check-all'}
                  size={22}
                  color="#FFFFFF"
                />
              </View>
              <View>
                <Text style={[tw('text-xs font-semibold'), { color: colors.textSecondary }]}>
                  {totalDue > 0 ? 'Outstanding Balance Due' : 'All Bills Fully Settled'}
                </Text>
                <Text style={[tw('text-xl font-black'), { color: colors.text }]}>
                  ${totalDue.toFixed(2)}
                </Text>
              </View>
            </View>

            {totalDue > 0 && (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  dueBills.forEach((b) => dispatch(payBill(b.id)));
                  Alert.alert('All Paid', 'All outstanding balances have been cleared!');
                }}
                style={[tw('px-3.5 py-2 rounded-xl shadow-sm'), { backgroundColor: '#F59E0B' }]}
              >
                <Text style={tw('text-xs font-bold text-white')}>Pay All Now</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Bills List */}
        <Text style={[tw('text-sm font-bold mb-3'), { color: colors.text }]}>
          Statement History
        </Text>

        <View style={tw('gap-3')}>
          {bills.map((bill) => {
            const isPaid = bill.status === 'Paid';
            return (
              <View
                key={bill.id}
                style={[
                  tw('p-4 rounded-2xl border shadow-sm'),
                  {
                    backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={tw('flex-row items-center justify-between mb-1.5')}>
                  <View style={tw('flex-row items-center gap-2')}>
                    <MaterialCommunityIcons
                      name="receipt-text-outline"
                      size={18}
                      color={isPaid ? '#10B981' : '#F59E0B'}
                    />
                    <Text style={[tw('text-xs font-bold'), { color: colors.text }]}>
                      {bill.id}
                    </Text>
                  </View>
                  <View
                    style={[
                      tw('px-2.5 py-0.5 rounded-full'),
                      { backgroundColor: isPaid ? '#10B98120' : '#F59E0B20' },
                    ]}
                  >
                    <Text
                      style={[
                        tw('text-xs font-bold'),
                        { color: isPaid ? '#10B981' : '#F59E0B', fontSize: 11 },
                      ]}
                    >
                      {bill.status}
                    </Text>
                  </View>
                </View>

                <View style={tw('flex-row items-center justify-between my-1')}>
                  <View>
                    <Text style={[tw('text-sm font-bold'), { color: colors.text }]}>
                      {bill.title}
                    </Text>
                    <Text style={[tw('text-xs'), { color: colors.textMuted }]}>
                      Period: {bill.period} • {bill.category}
                    </Text>
                  </View>
                  <Text style={[tw('text-base font-black'), { color: colors.text }]}>
                    ${bill.amount.toFixed(2)}
                  </Text>
                </View>

                <View
                  style={[
                    tw('flex-row items-center justify-between pt-2.5 mt-2 border-t'),
                    { borderTopColor: colors.border },
                  ]}
                >
                  <Text style={[tw('text-xs'), { color: colors.textSecondary }]}>
                    Due: {bill.dueDate}
                  </Text>

                  <View style={tw('flex-row gap-2')}>
                    {!isPaid ? (
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => handlePay(bill.id, bill.title, bill.amount)}
                        style={[tw('px-3 py-1 rounded-lg'), { backgroundColor: '#F59E0B' }]}
                      >
                        <Text style={tw('text-xs font-bold text-white')}>Pay Now</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => Alert.alert('Receipt Downloaded', `Receipt for ${bill.id} saved.`)}
                        style={[
                          tw('px-2.5 py-1 rounded-lg border'),
                          { borderColor: colors.border, backgroundColor: colors.surfaceElevated },
                        ]}
                      >
                        <Text style={[tw('text-xs font-semibold'), { color: colors.text }]}>
                          Download Receipt
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
