import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { markInvoicePaid } from '../store/ecomSlice';
import { darkColors, lightColors } from '../theme/colors';
import { getRoleConfig } from '../utils/roles';
import tw from '../utils/tw';

export default function InvoicesScreen() {
  const dispatch = useDispatch();
  const mode = useSelector((state) => state.theme.mode);
  const user = useSelector((state) => state.auth.user);
  const invoices = useSelector((state) => state.ecom.invoices);
  const isDark = mode === 'dark';
  const colors = isDark ? darkColors : lightColors;

  const currentRole = user?.role || 'admin';
  const roleConfig = getRoleConfig(currentRole);

  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredInvoices = invoices.filter((inv) => {
    const matchesFilter = activeFilter === 'All' || inv.status === activeFilter;
    const matchesSearch =
      inv.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalAmount = invoices.reduce((sum, item) => sum + item.amount, 0);
  const paidAmount = invoices
    .filter((i) => i.status === 'Paid')
    .reduce((sum, item) => sum + item.amount, 0);

  const handleMarkPaid = (id) => {
    dispatch(markInvoicePaid(id));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid':
        return '#10B981';
      case 'Pending':
        return '#F59E0B';
      case 'Overdue':
        return '#EF4444';
      default:
        return '#64748B';
    }
  };

  return (
    <View style={[tw('flex-1'), { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={tw('p-4 pb-12')}
        showsVerticalScrollIndicator={false}
      >
        {/* Page Title & Role Badge */}
        <View style={tw('flex-row items-center justify-between mb-4')}>
          <View>
            <Text style={[tw('text-xl font-black'), { color: colors.text }]}>
              Company Invoices
            </Text>
            <Text style={[tw('text-xs mt-0.5'), { color: colors.textSecondary }]}>
              {currentRole === 'admin'
                ? 'Full enterprise billing & payment tracking'
                : 'Store operations & receivable invoices'}
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

        {/* Summary Metric Cards */}
        <View style={tw('flex-row gap-3 mb-4')}>
          <View
            style={[
              tw('flex-1 p-3.5 rounded-2xl border shadow-sm'),
              {
                backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[tw('text-xs font-semibold'), { color: colors.textSecondary }]}>
              Total Invoiced
            </Text>
            <Text style={[tw('text-lg font-black mt-1'), { color: colors.text }]}>
              ${totalAmount.toLocaleString()}
            </Text>
            <Text style={[tw('text-xs mt-0.5'), { color: colors.textMuted }]}>
              {invoices.length} invoices generated
            </Text>
          </View>

          <View
            style={[
              tw('flex-1 p-3.5 rounded-2xl border shadow-sm'),
              {
                backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[tw('text-xs font-semibold'), { color: colors.textSecondary }]}>
              Total Collected
            </Text>
            <Text style={[tw('text-lg font-black mt-1'), { color: '#10B981' }]}>
              ${paidAmount.toLocaleString()}
            </Text>
            <Text style={[tw('text-xs mt-0.5'), { color: '#10B981' }]}>
              ✓ Settled in bank
            </Text>
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
            placeholder="Search by client or invoice #..."
            placeholderTextColor={colors.textMuted}
            style={[tw('flex-1 text-xs'), { color: colors.text }]}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialCommunityIcons name="close-circle" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Status Filter Tabs */}
        <View style={tw('flex-row gap-2 mb-4')}>
          {['All', 'Paid', 'Pending', 'Overdue'].map((filter) => {
            const isSel = activeFilter === filter;
            return (
              <TouchableOpacity
                key={filter}
                onPress={() => setActiveFilter(filter)}
                activeOpacity={0.7}
                style={[
                  tw('px-3.5 py-1.5 rounded-xl border'),
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
                    tw('text-xs font-bold'),
                    { color: isSel ? '#FFFFFF' : colors.textSecondary },
                  ]}
                >
                  {filter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Invoices List */}
        <View style={tw('gap-3')}>
          {filteredInvoices.map((inv) => {
            const statusColor = getStatusColor(inv.status);

            return (
              <View
                key={inv.id}
                style={[
                  tw('p-4 rounded-2xl border shadow-sm'),
                  {
                    backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                    borderColor: colors.border,
                  },
                ]}
              >
                {/* Top Row: Invoice ID & Status */}
                <View style={tw('flex-row items-center justify-between mb-2')}>
                  <View style={tw('flex-row items-center gap-2')}>
                    <MaterialCommunityIcons
                      name="file-document-outline"
                      size={18}
                      color={roleConfig.color}
                    />
                    <Text style={[tw('text-xs font-bold'), { color: colors.text }]}>
                      {inv.id}
                    </Text>
                  </View>
                  <View
                    style={[
                      tw('px-2.5 py-0.5 rounded-full'),
                      { backgroundColor: `${statusColor}20` },
                    ]}
                  >
                    <Text style={[tw('text-xs font-bold'), { color: statusColor, fontSize: 11 }]}>
                      {inv.status}
                    </Text>
                  </View>
                </View>

                {/* Client info & Amount */}
                <View style={tw('flex-row items-center justify-between my-1')}>
                  <View>
                    <Text style={[tw('text-base font-bold'), { color: colors.text }]}>
                      {inv.client}
                    </Text>
                    <Text style={[tw('text-xs'), { color: colors.textMuted }]}>
                      {inv.clientEmail} • {inv.itemsCount} line items
                    </Text>
                  </View>
                  <Text style={[tw('text-lg font-black'), { color: colors.text }]}>
                    ${inv.amount.toLocaleString()}
                  </Text>
                </View>

                {/* Dates & Actions */}
                <View
                  style={[
                    tw('flex-row items-center justify-between pt-3 mt-2 border-t'),
                    { borderTopColor: colors.border },
                  ]}
                >
                  <Text style={[tw('text-xs'), { color: colors.textSecondary }]}>
                    Due: {inv.dueDate}
                  </Text>

                  <View style={tw('flex-row gap-2')}>
                    {inv.status !== 'Paid' && (
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => handleMarkPaid(inv.id)}
                        style={[tw('px-2.5 py-1 rounded-lg'), { backgroundColor: '#10B981' }]}
                      >
                        <Text style={tw('text-xs font-bold text-white')}>Mark Paid</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => Alert.alert('Receipt Downloaded', `Invoice ${inv.id} PDF saved.`)}
                      style={[
                        tw('px-2.5 py-1 rounded-lg border'),
                        { borderColor: colors.border, backgroundColor: colors.surfaceElevated },
                      ]}
                    >
                      <Text style={[tw('text-xs font-semibold'), { color: colors.text }]}>
                        PDF
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}

          {filteredInvoices.length === 0 && (
            <View style={tw('items-center justify-center py-10')}>
              <MaterialCommunityIcons name="file-search-outline" size={40} color={colors.textMuted} />
              <Text style={[tw('text-sm font-semibold mt-2'), { color: colors.textMuted }]}>
                No invoices match your search.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
