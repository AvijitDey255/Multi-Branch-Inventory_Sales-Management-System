import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { createOrder, updateOrderStatus } from '../store/ecomSlice';
import { darkColors, lightColors } from '../theme/colors';
import { getRoleConfig } from '../utils/roles';
import tw from '../utils/tw';
import { toast } from '../components/Toast';

export default function OrdersScreen() {
  const dispatch = useDispatch();
  const mode = useSelector((state) => state.theme.mode);
  const user = useSelector((state) => state.auth.user);
  const orders = useSelector((state) => state.ecom.orders);
  const customers = useSelector((state) => state.ecom.customers);
  const isDark = mode === 'dark';
  const colors = isDark ? darkColors : lightColors;

  const currentRole = user?.role || 'admin';
  const roleConfig = getRoleConfig(currentRole);

  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  // New Order Form state (Salesman flow)
  const [customerName, setCustomerName] = useState('Emma Watson');
  const [itemDetails, setItemDetails] = useState('Nexus Quantum Headset ANC');
  const [orderAmount, setOrderAmount] = useState('349');

  const filteredOrders = orders.filter((o) => {
    const matchesFilter = activeFilter === 'All' || o.status === activeFilter;
    const matchesSearch =
      o.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.items.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleCreateOrder = () => {
    if (!customerName.trim() || !itemDetails.trim() || !orderAmount.trim()) {
      toast.error('Please fill in customer, items, and total amount.', 'Required Fields');
      return;
    }

    dispatch(
      createOrder({
        customer: customerName.trim(),
        customerEmail: `${customerName.toLowerCase().replace(/\s+/g, '.')}@client.com`,
        salesRep: user?.fullName || 'Sales Executive',
        items: itemDetails.trim(),
        total: parseFloat(orderAmount) || 100,
      })
    );

    const savedName = customerName.trim();
    setCustomerName('Emma Watson');
    setItemDetails('');
    setOrderAmount('');
    setModalVisible(false);
    toast.success(`Order placed successfully for ${savedName}!`, 'Order Created');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered':
        return '#10B981';
      case 'Shipped':
        return '#0EA5E9';
      case 'Processing':
        return '#F59E0B';
      default:
        return '#64748B';
    }
  };

  return (
    <View style={[tw('flex-1'), { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={tw('p-4 pb-16')} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={tw('flex-row items-center justify-between mb-4')}>
          <View>
            <Text style={[tw('text-xl font-black'), { color: colors.text }]}>
              Orders Management
            </Text>
            <Text style={[tw('text-xs mt-0.5'), { color: colors.textSecondary }]}>
              {currentRole === 'salesman'
                ? 'Create customer sales orders (+ New Order) & track quotas'
                : 'Manage enterprise logistics & fulfillment dispatch'}
            </Text>
          </View>

          {/* Salesman prominent + New Order Button */}
          {currentRole === 'salesman' && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setModalVisible(true)}
              style={[
                tw('px-3.5 py-2 rounded-xl flex-row items-center gap-1.5 shadow-md'),
                { backgroundColor: roleConfig.color },
              ]}
            >
              <MaterialCommunityIcons name="cart-plus" size={18} color="#FFFFFF" />
              <Text style={tw('text-xs font-bold text-white')}>New Order</Text>
            </TouchableOpacity>
          )}
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
            placeholder="Search orders, customers, or items..."
            placeholderTextColor={colors.textMuted}
            style={[tw('flex-1 text-xs'), { color: colors.text }]}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialCommunityIcons name="close-circle" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Filter Pills */}
        <View style={tw('flex-row gap-2 mb-4')}>
          {['All', 'Processing', 'Shipped', 'Delivered'].map((filter) => {
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

        {/* Orders List */}
        <View style={tw('gap-3.5')}>
          {filteredOrders.map((ord) => {
            const statusColor = getStatusColor(ord.status);

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
                {/* Top Row: Order ID, Rep & Status */}
                <View style={tw('flex-row items-center justify-between mb-2')}>
                  <View style={tw('flex-row items-center gap-2')}>
                    <View
                      style={[
                        tw('w-7 h-7 rounded-lg items-center justify-center'),
                        { backgroundColor: `${statusColor}20` },
                      ]}
                    >
                      <MaterialCommunityIcons name="cart-outline" size={16} color={statusColor} />
                    </View>
                    <View>
                      <Text style={[tw('text-xs font-bold'), { color: colors.text }]}>
                        {ord.id}
                      </Text>
                      <Text style={[tw('text-xs'), { color: colors.textMuted, fontSize: 10 }]}>
                        Rep: {ord.salesRep}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={[
                      tw('px-2.5 py-0.5 rounded-full'),
                      { backgroundColor: `${statusColor}20` },
                    ]}
                  >
                    <Text style={[tw('text-xs font-bold'), { color: statusColor, fontSize: 11 }]}>
                      {ord.status}
                    </Text>
                  </View>
                </View>

                {/* Customer & Items */}
                <View style={tw('my-1.5')}>
                  <Text style={[tw('text-sm font-bold'), { color: colors.text }]}>
                    {ord.customer}
                  </Text>
                  <Text style={[tw('text-xs mt-0.5'), { color: colors.textSecondary }]}>
                    {ord.items}
                  </Text>
                </View>

                {/* Footer: Date, Amount & Status Update action */}
                <View
                  style={[
                    tw('flex-row items-center justify-between pt-2.5 mt-2 border-t'),
                    { borderTopColor: colors.border },
                  ]}
                >
                  <Text style={[tw('text-xs'), { color: colors.textMuted }]}>
                    {ord.date}
                  </Text>

                  <View style={tw('flex-row items-center gap-3')}>
                    <Text style={[tw('text-base font-black'), { color: colors.text }]}>
                      ${ord.total.toLocaleString()}
                    </Text>

                    {/* Admin status toggler */}
                    {currentRole === 'admin' && ord.status !== 'Delivered' && (
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => {
                          const nextStatus = ord.status === 'Processing' ? 'Shipped' : 'Delivered';
                          dispatch(updateOrderStatus({ id: ord.id, status: nextStatus }));
                        }}
                        style={[tw('px-2.5 py-1 rounded-lg'), { backgroundColor: roleConfig.color }]}
                      >
                        <Text style={tw('text-xs font-bold text-white')}>
                          Mark {ord.status === 'Processing' ? 'Shipped' : 'Delivered'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            );
          })}

          {filteredOrders.length === 0 && (
            <View style={tw('items-center justify-center py-10')}>
              <MaterialCommunityIcons name="cart-remove" size={40} color={colors.textMuted} />
              <Text style={[tw('text-sm font-semibold mt-2'), { color: colors.textMuted }]}>
                No orders match your filter criteria.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Salesman: New Order Modal Form */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View
          style={[
            tw('flex-1 items-center justify-center p-4'),
            { backgroundColor: 'rgba(0, 0, 0, 0.6)' },
          ]}
        >
          <View
            style={[
              tw('w-full max-w-md p-5 rounded-3xl border shadow-xl'),
              {
                backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                borderColor: colors.border,
              },
            ]}
          >
            <View style={tw('flex-row items-center justify-between pb-3 border-b border-slate-200 mb-3')}>
              <View style={tw('flex-row items-center gap-2')}>
                <MaterialCommunityIcons name="cart-plus" size={20} color={roleConfig.color} />
                <Text style={[tw('text-base font-bold'), { color: colors.text }]}>
                  Place Direct Client Order
                </Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={tw('gap-3 mb-4')}>
              {/* Select or Type Customer */}
              <View>
                <Text style={[tw('text-xs font-semibold mb-1'), { color: colors.text }]}>
                  Client / Customer Name
                </Text>
                <TextInput
                  value={customerName}
                  onChangeText={setCustomerName}
                  placeholder="Select or enter customer"
                  placeholderTextColor={colors.textMuted}
                  style={[
                    tw('h-11 px-3.5 rounded-xl border text-xs'),
                    { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.text },
                  ]}
                />
              </View>

              {/* Items */}
              <View>
                <Text style={[tw('text-xs font-semibold mb-1'), { color: colors.text }]}>
                  Ordered Products & Quantity
                </Text>
                <TextInput
                  value={itemDetails}
                  onChangeText={setItemDetails}
                  placeholder="e.g. Titan Pro Keyboard (x3)"
                  placeholderTextColor={colors.textMuted}
                  style={[
                    tw('h-11 px-3.5 rounded-xl border text-xs'),
                    { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.text },
                  ]}
                />
              </View>

              {/* Total Amount */}
              <View>
                <Text style={[tw('text-xs font-semibold mb-1'), { color: colors.text }]}>
                  Total Deal Amount ($)
                </Text>
                <TextInput
                  value={orderAmount}
                  onChangeText={setOrderAmount}
                  placeholder="567"
                  keyboardType="numeric"
                  placeholderTextColor={colors.textMuted}
                  style={[
                    tw('h-11 px-3.5 rounded-xl border text-xs'),
                    { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.text },
                  ]}
                />
              </View>
            </View>

            {/* Submit */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleCreateOrder}
              style={[
                tw('h-12 rounded-xl flex-row items-center justify-center gap-2 shadow-md'),
                { backgroundColor: roleConfig.color },
              ]}
            >
              <MaterialCommunityIcons name="check-circle-outline" size={18} color="#FFFFFF" />
              <Text style={tw('text-xs font-bold text-white')}>Confirm & Dispatch Order</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
