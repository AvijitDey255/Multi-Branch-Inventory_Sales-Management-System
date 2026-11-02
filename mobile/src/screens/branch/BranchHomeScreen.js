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

const REQUISITIONS = [
  { id: 'REQ-101', item: 'Thermal Receipt Rolls (50 Ct)', qty: 25, status: 'Approved', eta: 'Tomorrow' },
  { id: 'REQ-102', item: 'Barcode Scanner Pro', qty: 5, status: 'In Transit', eta: 'Today 4 PM' },
  { id: 'REQ-103', item: 'RFID Security Tags', qty: 100, status: 'Pending Approval', eta: 'Evaluating' },
];

const BranchHomeScreen = ({ navigation }) => {
  const { user } = useSelector((state) => state.auth);
  const { activeBranch } = useSelector((state) => state.ui);

  return (
    <View style={styles.container}>
      {/* Shared Header with Left 3-Line Hamburger Menu */}
      <Header title="Branch Operations" subtitle={activeBranch} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Branch Hero Info Banner */}
        <View style={styles.branchBanner}>
          <View style={styles.bannerInfo}>
            <Text style={styles.bannerRoleLabel}>BRANCH MANAGER PORTAL</Text>
            <Text style={styles.bannerName}>{user?.fullname || 'Branch Manager'}</Text>
            <Text style={styles.bannerSubtext}>
              Overseeing inventory levels, daily sales dispatch, and stock replenishments.
            </Text>
          </View>
          <View style={styles.bannerIconBox}>
            <Ionicons name="business" size={26} color={colors.accent} />
          </View>
        </View>

        {/* Branch Key Indicators */}
        <Text style={styles.sectionTitle}>Today's Branch Performance</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Daily Sales"
            value="$4,820.50"
            iconName="cash-outline"
            iconColor={colors.accent}
            iconBg={colors.accentLight}
            trend="+8.5%"
            trendPositive={true}
            style={styles.gridCard}
          />
          <StatCard
            title="Orders Processed"
            value="34"
            iconName="receipt-outline"
            iconColor={colors.primary}
            iconBg={colors.primaryMuted}
            subtitle="Today's counter"
            style={styles.gridCard}
          />
        </View>

        <View style={[styles.statsGrid, { marginTop: 12 }]}>
          <StatCard
            title="Items in Branch"
            value="684 Units"
            iconName="cube-outline"
            iconColor={colors.roleAdmin}
            iconBg="#EEF2FF"
            subtitle="92% capacity"
            style={styles.gridCard}
          />
          <StatCard
            title="Stock Reorders"
            value="3 Pending"
            iconName="swap-horizontal-outline"
            iconColor={colors.warning}
            iconBg={colors.warningLight}
            trend="Awaiting Hub"
            trendPositive={false}
            style={styles.gridCard}
          />
        </View>

        {/* Action Shortcuts */}
        <Text style={styles.sectionTitle}>Branch Operations</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('Products')}
          >
            <View style={[styles.actionIconWrap, { backgroundColor: '#F0FDFA' }]}>
              <Ionicons name="layers-outline" size={20} color={colors.accent} />
            </View>
            <Text style={styles.actionLabel}>Branch Stock</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('Order')}
          >
            <View style={[styles.actionIconWrap, { backgroundColor: '#EEF2FF' }]}>
              <Ionicons name="cart-outline" size={20} color={colors.primary} />
            </View>
            <Text style={styles.actionLabel}>Branch Orders</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => alert('New Stock Inward from Central Warehouse recorded')}
          >
            <View style={[styles.actionIconWrap, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="download-outline" size={20} color={colors.success} />
            </View>
            <Text style={styles.actionLabel}>Receive Stock</Text>
          </TouchableOpacity>
        </View>

        {/* Central Hub Stock Requisitions */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recent Stock Transfers</Text>
          <TouchableOpacity onPress={() => alert('Viewing all requisition logs')}>
            <Text style={styles.seeAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {REQUISITIONS.map((req) => (
          <View key={req.id} style={styles.requisitionCard}>
            <View style={styles.reqTop}>
              <Text style={styles.reqId}>{req.id}</Text>
              <View
                style={[
                  styles.statusTag,
                  req.status === 'Approved'
                    ? styles.statusApproved
                    : req.status === 'In Transit'
                    ? styles.statusTransit
                    : styles.statusPending,
                ]}
              >
                <Text
                  style={[
                    styles.statusTagText,
                    req.status === 'Approved'
                      ? styles.textApproved
                      : req.status === 'In Transit'
                      ? styles.textTransit
                      : styles.textPending,
                  ]}
                >
                  {req.status}
                </Text>
              </View>
            </View>

            <Text style={styles.reqItem}>{req.item}</Text>
            <View style={styles.reqBottom}>
              <Text style={styles.reqQty}>Quantity: {req.qty} units</Text>
              <Text style={styles.reqEta}>ETA: {req.eta}</Text>
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
  branchBanner: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginBottom: 20,
  },
  bannerInfo: {
    flex: 1,
  },
  bannerRoleLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.accent,
    letterSpacing: 0.8,
  },
  bannerName: {
    fontSize: 19,
    fontWeight: '800',
    color: colors.textInverse,
    marginTop: 2,
    marginBottom: 4,
  },
  bannerSubtext: {
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 15,
  },
  bannerIconBox: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: 'rgba(13, 148, 136, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
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
  },
  gridCard: {
    flex: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textPrimary,
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
    color: colors.accent,
  },
  requisitionCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reqTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  reqId: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusApproved: {
    backgroundColor: colors.successLight,
  },
  statusTransit: {
    backgroundColor: colors.infoLight,
  },
  statusPending: {
    backgroundColor: colors.warningLight,
  },
  statusTagText: {
    fontSize: 10,
    fontWeight: '800',
  },
  textApproved: {
    color: colors.success,
  },
  textTransit: {
    color: colors.info,
  },
  textPending: {
    color: colors.warning,
  },
  reqItem: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  reqBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  reqQty: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  reqEta: {
    fontSize: 12,
    color: colors.textMuted,
  },
});

export default BranchHomeScreen;

