import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/Header';
import { colors } from '../../constants/colors';

const BRANCH_STOCK = [
  { id: '1', sku: 'SKU-EL-1049', name: 'Smart Barcode Scanner Pro', branchStock: 8, minAlert: 5, status: 'Adequate', price: 149.99 },
  { id: '2', sku: 'SKU-EL-2091', name: 'Thermal Receipt Printer 80mm', branchStock: 2, minAlert: 5, status: 'Critical', price: 89.50 },
  { id: '3', sku: 'SKU-IT-3310', name: 'Wireless POS Terminal Dock', branchStock: 1, minAlert: 2, status: 'Critical', price: 299.00 },
  { id: '4', sku: 'SKU-IT-4492', name: 'Heavy Duty Cash Drawer 16"', branchStock: 14, minAlert: 4, status: 'Adequate', price: 65.00 },
  { id: '5', sku: 'SKU-OF-5501', name: 'RFID Asset Security Tags (500pk)', branchStock: 48, minAlert: 20, status: 'Adequate', price: 42.00 },
  { id: '6', sku: 'SKU-OF-6612', name: 'BPA-Free Receipt Paper Rolls (50 Ct)', branchStock: 4, minAlert: 10, status: 'Low', price: 34.99 },
];

const BranchProductsScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState(BRANCH_STOCK);

  const filtered = items.filter(
    (i) =>
      i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRequestStock = (item) => {
    Alert.alert(
      'Request Warehouse Restock',
      `Dispatch automatic requisition for 10 units of "${item.name}" from Central Hub?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Request',
          onPress: () => {
            Alert.alert('Requisition Sent', `Requisition #REQ-${Date.now().toString().slice(-4)} created.`);
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => {
    const isCritical = item.status === 'Critical';
    const isLow = item.status === 'Low';

    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.skuText}>{item.sku}</Text>
            <Text style={styles.title}>{item.name}</Text>
          </View>
          <View
            style={[
              styles.badge,
              isCritical
                ? styles.badgeCritical
                : isLow
                ? styles.badgeLow
                : styles.badgeAdequate,
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                isCritical
                  ? styles.textCritical
                  : isLow
                  ? styles.textLow
                  : styles.textAdequate,
              ]}
            >
              {item.status}
            </Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View>
            <Text style={styles.stockLabel}>On-Shelf Stock</Text>
            <Text
              style={[
                styles.stockNumber,
                (isCritical || isLow) && { color: colors.danger },
              ]}
            >
              {item.branchStock} units
            </Text>
          </View>

          <View>
            <Text style={styles.stockLabel}>Min Alert Threshold</Text>
            <Text style={styles.stockSub}>{item.minAlert} units</Text>
          </View>

          <TouchableOpacity
            style={styles.reorderBtn}
            onPress={() => handleRequestStock(item)}
          >
            <Ionicons name="cart-outline" size={14} color={colors.accent} />
            <Text style={styles.reorderBtnText}>Restock</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header title="Branch Inventory" subtitle="Local Stock Allocation" />

      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={colors.textMuted} />
        <TextInput
          placeholder="Filter branch stock..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.input}
        />
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    marginBottom: 8,
    paddingHorizontal: 14,
    height: 46,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: colors.textPrimary,
  },
  list: {
    padding: 16,
    paddingTop: 8,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  skuText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  badgeCritical: {
    backgroundColor: colors.dangerLight,
  },
  badgeLow: {
    backgroundColor: colors.warningLight,
  },
  badgeAdequate: {
    backgroundColor: colors.successLight,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  textCritical: {
    color: colors.danger,
  },
  textLow: {
    color: colors.warning,
  },
  textAdequate: {
    color: colors.success,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  stockLabel: {
    fontSize: 10,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  stockNumber: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 2,
  },
  stockSub: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 2,
  },
  reorderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.accentLight,
    borderWidth: 1,
    borderColor: '#99F6E4',
  },
  reorderBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accent,
    marginLeft: 4,
  },
});

export default BranchProductsScreen;

