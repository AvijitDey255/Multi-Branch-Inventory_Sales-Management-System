import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/Header';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import { colors } from '../../constants/colors';

const INITIAL_CUSTOMERS = [
  { id: '1', name: 'Apex Logistics Inc.', contact: 'Michael Scott', phone: '+1 (555) 234-8900', email: 'm.scott@apexlog.com', orders: 14, totalSpent: '$8,450.00' },
  { id: '2', name: 'Delta Retail Mart', contact: 'Dwight Schrute', phone: '+1 (555) 789-1234', email: 'sales@deltamart.com', orders: 9, totalSpent: '$4,120.00' },
  { id: '3', name: 'Sunrise Grocers', contact: 'Pam Beesly', phone: '+1 (555) 345-6789', email: 'pam@sunrisegrocers.com', orders: 6, totalSpent: '$2,310.00' },
  { id: '4', name: 'Metro Hardware Hub', contact: 'Jim Halpert', phone: '+1 (555) 901-2345', email: 'jhalpert@metrohub.com', orders: 22, totalSpent: '$14,890.00' },
];

const CustomersScreen = () => {
  const [search, setSearch] = useState('');
  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS);
  const [modalVisible, setModalVisible] = useState(false);

  // New customer states
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.contact.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  const handleAddCustomer = () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert('Required Fields', 'Please enter customer name and phone number.');
      return;
    }

    const newCust = {
      id: Date.now().toString(),
      name: name.trim(),
      contact: contact.trim() || name.trim(),
      phone: phone.trim(),
      email: email.trim() || 'info@customer.com',
      orders: 0,
      totalSpent: '$0.00',
    };

    setCustomers([newCust, ...customers]);
    setModalVisible(false);
    setName('');
    setContact('');
    setPhone('');
    setEmail('');
    Alert.alert('Success', 'New customer registered to branch database.');
  };

  const renderCustomerItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.name.substring(0, 2).toUpperCase()}
          </Text>
        </View>
        <View style={styles.details}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.contact}>Attn: {item.contact}</Text>
        </View>
      </View>

      <View style={styles.contactRow}>
        <View style={styles.contactItem}>
          <Ionicons name="call-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.contactText}>{item.phone}</Text>
        </View>
        <View style={styles.contactItem}>
          <Ionicons name="mail-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.contactText}>{item.email}</Text>
        </View>
      </View>

      <View style={styles.cardBottom}>
        <Text style={styles.spentText}>
          {item.orders} Orders • <Text style={{ fontWeight: '800' }}>{item.totalSpent}</Text>
        </Text>
        <TouchableOpacity
          style={styles.billBtn}
          onPress={() => alert(`Starting sale for ${item.name}`)}
        >
          <Ionicons name="add" size={14} color={colors.primary} />
          <Text style={styles.billBtnText}>Create Bill</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header title="Customers Directory" subtitle="Branch Client Registry" />

      {/* Search & Add Bar */}
      <View style={styles.topBar}>
        <View style={styles.searchWrap}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            placeholder="Search by company, contact, or phone..."
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="person-add" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderCustomerItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      {/* Add Customer Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Customer Profile</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <CustomInput
              label="Company / Customer Name"
              placeholder="e.g. Apex Enterprises"
              value={name}
              onChangeText={setName}
            />
            <CustomInput
              label="Contact Person"
              placeholder="e.g. John Doe"
              value={contact}
              onChangeText={setContact}
            />
            <CustomInput
              label="Phone Number"
              placeholder="+1 (555) 000-0000"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
            <CustomInput
              label="Email Address"
              placeholder="client@domain.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />

            <CustomButton
              title="Save Customer"
              onPress={handleAddCustomer}
              style={{ marginTop: 10 }}
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
  topBar: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 10,
    gap: 10,
    alignItems: 'center',
  },
  searchWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: colors.textPrimary,
  },
  addBtn: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
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
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primary,
  },
  details: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  contact: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  contactRow: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 8,
    padding: 8,
    gap: 4,
    marginBottom: 10,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  contactText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  spentText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  billBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: colors.primaryMuted,
  },
  billBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    marginLeft: 3,
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
    marginBottom: 18,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
});

export default CustomersScreen;

