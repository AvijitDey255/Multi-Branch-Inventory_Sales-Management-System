import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/Header';
import { colors } from '../../constants/colors';

const ORDERS_DATA = [
  { id: 'ORD-8921', customer: 'Apex Logistics Inc.', total: 429.50, items: 3, status: 'Pending Dispatch', time: '10:45 AM' },
  { id: 'ORD-8920', customer: 'Delta Retail Mart', total: 1250.00, items: 8, status: 'Completed', time: '09:30 AM' },
  { id: 'ORD-8919', customer: 'Sunrise Grocers', total: 184.20, items: 2, status: 'Completed', time: 'Yesterday' },
  { id: 'ORD-8918', customer: 'Metro Hardware Hub', total: 890.00, items: 6, status: 'Dispatched', time: 'Yesterday' },
];

const FILTER_TABS = ['All', 'Pending Dispatch', 'Dispatched', 'Completed'];

const BranchOrdersScreen = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [orders, setOrders] = useState(ORDERS_DATA);

  const filtered = orders.filter((o) => activeTab === 'All' || o.status === activeTab);

  const handleUpdateStatus = (orderId) => {
    Alert.alert(
      'Fulfill Order',
      `Mark ${orderId} as Dispatched and notify customer?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm Dispatch',
          onPress: () => {
            setOrders(
              orders.map((o) =>
                o.id === orderId ? { ...o, status: 'Dispatched' } : o
              )
            );
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => {
    const isPending = item.status === 'Pending Dispatch';
    const isCompleted = item.status === 'Completed';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.orderId}>{item.id}</Text>
            <Text style={styles.timeText}>{item.time}</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              isPending
                ? styles.badgePending
                : isCompleted
                ? styles.badgeCompleted
                : styles.badgeTransit,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                isPending
                  ? styles.textPending
                  : isCompleted
                  ? styles.textCompleted
                  : styles.textTransit,
              ]}
            >
              {item.status}
            </Text>
          </View>
        </View>

        <Text style={styles.customerName}>{item.customer}</Text>

        <View style={styles.bottomRow}>
          <View>
            <Text style={styles.summaryLabel}>Total ({item.items} items)</Text>
            <Text style={styles.totalText}>${item.total.toFixed(2)}</Text>
          </View>

          {isPending && (
            <TouchableOpacity
              style={styles.dispatchBtn}
              onPress={() => handleUpdateStatus(item.id)}
            >
              <Ionicons name="paper-plane-outline" size={14} color="#FFF" />
              <Text style={styles.dispatchBtnText}>Dispatch</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header title="Branch Orders" subtitle="Fulfillment & Dispatch" />

      {/* Tabs */}
      <View style={styles.tabsRow}>
        {FILTER_TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.tabTextActive,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.textInverse,
    fontWeight: '700',
  },
  list: {
    padding: 16,
    paddingTop: 4,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  orderId: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  timeText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgePending: {
    backgroundColor: colors.warningLight,
  },
  badgeCompleted: {
    backgroundColor: colors.successLight,
  },
  badgeTransit: {
    backgroundColor: colors.infoLight,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  textPending: {
    color: colors.warning,
  },
  textCompleted: {
    color: colors.success,
  },
  textTransit: {
    color: colors.info,
  },
  customerName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 10,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  summaryLabel: {
    fontSize: 10,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  totalText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 2,
  },
  dispatchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  dispatchBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
    marginLeft: 6,
  },
});

export default BranchOrdersScreen;

