import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/Header';
import CustomButton from '../../components/CustomButton';
import { colors } from '../../constants/colors';

const SAMPLE_ORDERS = [
  { id: 'INV-4099', customer: 'Global Office Supplies', amount: 420.00, items: 3, method: 'Card', time: '11:20 AM', status: 'Completed' },
  { id: 'INV-4098', customer: 'Apex Logistics Inc.', amount: 149.99, items: 1, method: 'Cash', time: '10:45 AM', status: 'Completed' },
  { id: 'INV-4097', customer: 'Walk-in Customer', amount: 89.50, items: 1, method: 'UPI', time: '09:30 AM', status: 'Completed' },
  { id: 'INV-4096', customer: 'Metro Hardware Hub', amount: 890.00, items: 5, method: 'Credit', time: 'Yesterday', status: 'Completed' },
];

const CATALOG_ITEMS = [
  { id: '1', name: 'Smart Barcode Scanner Pro', price: 149.99 },
  { id: '2', name: 'Thermal Receipt Printer 80mm', price: 89.50 },
  { id: '3', name: 'BPA-Free Paper Rolls (50 Ct)', price: 34.99 },
];

const SalesmanOrdersScreen = () => {
  const [orders, setOrders] = useState(SAMPLE_ORDERS);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(CATALOG_ITEMS[0]);
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('Cash');

  const handleCreateOrder = () => {
    const total = selectedProduct.price * quantity;
    const newOrder = {
      id: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
      customer: 'Walk-in Customer',
      amount: total,
      items: quantity,
      method: paymentMethod,
      time: 'Just now',
      status: 'Completed',
    };

    setOrders([newOrder, ...orders]);
    setModalVisible(false);
    setQuantity(1);
    Alert.alert('Sale Completed', `Invoice #${newOrder.id} generated for $${total.toFixed(2)}.`);
  };

  const renderOrder = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.invoiceNo}>{item.id}</Text>
          <Text style={styles.timeText}>{item.time} • {item.method}</Text>
        </View>
        <Text style={styles.amountText}>${item.amount.toFixed(2)}</Text>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.customerName}>{item.customer}</Text>
        <Text style={styles.itemCountText}>{item.items} item(s)</Text>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.statusPill}>
          <Ionicons name="checkmark-circle" size={12} color={colors.success} />
          <Text style={styles.statusPillText}>{item.status}</Text>
        </View>
        <TouchableOpacity
          style={styles.receiptBtn}
          onPress={() => Alert.alert('Receipt Ready', `Invoice ${item.id} can be shared via email or Bluetooth thermal printer.`)}
        >
          <Ionicons name="print-outline" size={14} color={colors.primary} />
          <Text style={styles.receiptBtnText}>Print Bill</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header title="Sales POS Orders" subtitle="Counter Invoices" />

      {/* Top Banner with Quick Order Button */}
      <View style={styles.topActionBanner}>
        <View>
          <Text style={styles.counterLabel}>COUNTER TERMINAL #1</Text>
          <Text style={styles.counterTitle}>Ready for transaction</Text>
        </View>
        <TouchableOpacity
          style={styles.newSaleBtn}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="add-circle" size={18} color="#FFF" />
          <Text style={styles.newSaleBtnText}>Quick Sale</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrder}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      {/* Quick Sale Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Point-of-Sale Checkout</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>Select Item</Text>
            {CATALOG_ITEMS.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.productOption,
                  selectedProduct.id === item.id && styles.productOptionActive,
                ]}
                onPress={() => setSelectedProduct(item)}
              >
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
              </TouchableOpacity>
            ))}

            <Text style={[styles.fieldLabel, { marginTop: 14 }]}>Quantity</Text>
            <View style={styles.quantityRow}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Ionicons name="remove" size={18} color={colors.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.qtyText}>{quantity}</Text>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setQuantity(quantity + 1)}
              >
                <Ionicons name="add" size={18} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.fieldLabel, { marginTop: 14 }]}>Payment Method</Text>
            <View style={styles.payMethodsRow}>
              {['Cash', 'Card', 'UPI'].map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[
                    styles.methodBtn,
                    paymentMethod === m && styles.methodBtnActive,
                  ]}
                  onPress={() => setPaymentMethod(m)}
                >
                  <Text
                    style={[
                      styles.methodText,
                      paymentMethod === m && styles.methodTextActive,
                    ]}
                  >
                    {m}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.checkoutTotalRow}>
              <Text style={styles.checkoutTotalLabel}>Grand Total:</Text>
              <Text style={styles.checkoutTotalAmount}>
                ${(selectedProduct.price * quantity).toFixed(2)}
              </Text>
            </View>

            <CustomButton
              title="Confirm Payment & Print Receipt"
              onPress={handleCreateOrder}
              style={{ marginTop: 14 }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topActionBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: 16,
    marginBottom: 8,
    padding: 16,
    backgroundColor: '#0F172A',
    borderRadius: 14,
  },
  counterLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.roleSales,
    letterSpacing: 0.8,
  },
  counterTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textInverse,
    marginTop: 2,
  },
  newSaleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.roleSales,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  newSaleBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFF',
    marginLeft: 6,
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  invoiceNo: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  timeText: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  amountText: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  customerName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  itemCountText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.success,
    marginLeft: 4,
  },
  receiptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  receiptBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  productOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 6,
    backgroundColor: colors.surfaceAlt,
  },
  productOptionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryMuted,
  },
  productName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  qtyBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  payMethodsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  methodBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
  },
  methodBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  methodText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  methodTextActive: {
    color: '#FFF',
  },
  checkoutTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  checkoutTotalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  checkoutTotalAmount: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.primary,
  },
});

export default SalesmanOrdersScreen;

