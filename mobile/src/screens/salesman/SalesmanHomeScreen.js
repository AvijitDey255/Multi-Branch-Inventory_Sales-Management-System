import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/Header';
import StatCard from '../../components/StatCard';
import { colors } from '../../constants/colors';

const RECENT_BILLS = [
  { id: 'INV-3091', customer: 'Walk-in Retail Buyer', amount: '$89.50', payment: 'Cash', time: '11:20 AM' },
  { id: 'INV-3090', customer: 'Global Office Supplies', amount: '$420.00', payment: 'Credit Card', time: '10:05 AM' },
  { id: 'INV-3089', customer: 'Nexus Tech Lab', amount: '$149.99', payment: 'UPI / Online', time: '09:15 AM' },
];

const SalesmanHomeScreen = ({ navigation }) => {
  const { user } = useSelector((state) => state.auth);
  const { activeBranch } = useSelector((state) => state.ui);

  return (
    <View style={styles.container}>
      {/* Shared Header with Left 3-Line Hamburger Menu */}
      <Header title="Sales POS Terminal" subtitle={activeBranch} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Sales Hero Banner */}
        <View style={styles.heroBanner}>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroRole}>SALES REPRESENTATIVE</Text>
            <Text style={styles.heroName}>{user?.fullname || 'Sales Rep'}</Text>
            <Text style={styles.heroSub}>
              Daily Target: $2,500.00 • 74% Achieved ($1,840.00)
            </Text>
            {/* Target Progress Bar */}
            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { width: '74%' }]} />
            </View>
          </View>
        </View>

        {/* Salesperson Daily Stats */}
        <Text style={styles.sectionTitle}>Daily Performance</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Today's Sales"
            value="$1,840.00"
            iconName="wallet-outline"
            iconColor={colors.roleSales}
            iconBg="#FFF7ED"
            trend="+12%"
            trendPositive={true}
            style={styles.gridCard}
          />
          <StatCard
            title="Bills Generated"
            value="18 Orders"
            iconName="receipt-outline"
            iconColor={colors.primary}
            iconBg={colors.primaryMuted}
            subtitle="Avg $102 / bill"
            style={styles.gridCard}
          />
        </View>

        {/* Fast Action Buttons */}
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity
            style={styles.primaryActionBtn}
            onPress={() => navigation.navigate('Order')}
            activeOpacity={0.8}
          >
            <Ionicons name="cart" size={20} color="#FFF" />
            <Text style={styles.primaryActionText}>New Sales Order / POS</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryActionBtn}
            onPress={() => navigation.navigate('Customer')}
            activeOpacity={0.8}
          >
            <Ionicons name="person-add-outline" size={18} color={colors.primary} />
            <Text style={styles.secondaryActionText}>Add Customer</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Transactions List */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recent Invoices</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Order')}>
            <Text style={styles.seeAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {RECENT_BILLS.map((bill) => (
          <View key={bill.id} style={styles.billCard}>
            <View style={styles.billIconWrap}>
              <Ionicons name="receipt" size={20} color={colors.primary} />
            </View>
            <View style={styles.billInfo}>
              <Text style={styles.billId}>{bill.id}</Text>
              <Text style={styles.billCustomer}>{bill.customer}</Text>
              <Text style={styles.billMeta}>
                {bill.payment} • {bill.time}
              </Text>
            </View>
            <View style={styles.billAmountWrap}>
              <Text style={styles.billAmount}>{bill.amount}</Text>
              <View style={styles.paidBadge}>
                <Text style={styles.paidBadgeText}>PAID</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  heroBanner: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
  },
  heroRole: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.roleSales,
    letterSpacing: 0.8,
  },
  heroName: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textInverse,
    marginTop: 2,
  },
  heroSub: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 6,
    marginBottom: 10,
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: '#334155',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.roleSales,
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
  },
  gridCard: {
    flex: 1,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  primaryActionBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  primaryActionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
    marginLeft: 8,
  },
  secondaryActionBtn: {
    flex: 1.3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    height: 50,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.primary,
    paddingHorizontal: 10,
  },
  secondaryActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
    marginLeft: 6,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  billCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  billIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  billInfo: {
    flex: 1,
  },
  billId: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  billCustomer: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  billMeta: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  billAmountWrap: {
    alignItems: 'flex-end',
  },
  billAmount: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  paidBadge: {
    backgroundColor: colors.successLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  paidBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.success,
  },
});

export default SalesmanHomeScreen;

