import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/Header';
import StatCard from '../../components/StatCard';
import { colors } from '../../constants/colors';

const BRANCH_DATA = [
  { id: '1', name: 'Main Central Hub', manager: 'Robert Chen', revenue: '$48,250', stock: '94%', status: 'Optimal' },
  { id: '2', name: 'North Metro Outlet', manager: 'Sarah Jenkins', revenue: '$32,180', stock: '68%', status: 'Reorder' },
  { id: '3', name: 'East Bay Retail', manager: 'Marcus Vance', revenue: '$27,900', stock: '88%', status: 'Optimal' },
  { id: '4', name: 'South Suburban Branch', manager: 'Emily Watson', revenue: '$19,450', stock: '52%', status: 'Low' },
];

const AdminHomeScreen = ({ navigation }) => {
  const { user } = useSelector((state) => state.auth);

  return (
    <View style={styles.container}>
      {/* Shared Header with Left 3-Line Hamburger Menu */}
      <Header title="Admin Overview" subtitle="System Master Control" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Welcome Hero Banner */}
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeTextWrap}>
            <Text style={styles.welcomeGreeting}>Welcome back,</Text>
            <Text style={styles.welcomeName}>
              {user?.fullname || 'Administrator'}
            </Text>
            <Text style={styles.welcomeDesc}>
              System-wide branch operations and aggregated revenues are operating normally.
            </Text>
          </View>
          <View style={styles.heroBadge}>
            <Ionicons name="shield-checkmark" size={28} color="#FFFFFF" />
          </View>
        </View>

        {/* Executive KPI Cards Grid */}
        <Text style={styles.sectionTitle}>System Key Metrics</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Revenue"
            value="$127,780"
            iconName="cash-outline"
            iconColor={colors.primary}
            iconBg={colors.primaryMuted}
            trend="+14.2%"
            trendPositive={true}
            style={styles.gridCard}
          />
          <StatCard
            title="Active Branches"
            value="4 / 4"
            iconName="business-outline"
            iconColor={colors.accent}
            iconBg={colors.accentLight}
            subtitle="All synced live"
            style={styles.gridCard}
          />
        </View>

        <View style={[styles.statsGrid, { marginTop: 12 }]}>
          <StatCard
            title="Catalog Items"
            value="1,420"
            iconName="pricetags-outline"
            iconColor={colors.roleAdmin}
            iconBg="#EEF2FF"
            trend="+38 items"
            trendPositive={true}
            style={styles.gridCard}
          />
          <StatCard
            title="Low Stock Alerts"
            value="7"
            iconName="warning-outline"
            iconColor={colors.danger}
            iconBg={colors.dangerLight}
            trend="Needs Attention"
            trendPositive={false}
            style={styles.gridCard}
          />
        </View>

        {/* Quick Management Actions */}
        <Text style={styles.sectionTitle}>Administrative Actions</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('Products')}
          >
            <View style={[styles.actionIconWrap, { backgroundColor: '#DBEAFE' }]}>
              <Ionicons name="add-circle" size={22} color={colors.primary} />
            </View>
            <Text style={styles.actionLabel}>Add Product</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => alert('Open Branch Onboarding')}
          >
            <View style={[styles.actionIconWrap, { backgroundColor: '#CCFBF1' }]}>
              <Ionicons name="git-branch" size={22} color={colors.accent} />
            </View>
            <Text style={styles.actionLabel}>New Branch</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => alert('Generating System Audit PDF Report')}
          >
            <View style={[styles.actionIconWrap, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="document-text" size={22} color="#D97706" />
            </View>
            <Text style={styles.actionLabel}>Export Audit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('More')}
          >
            <View style={[styles.actionIconWrap, { backgroundColor: '#F1F5F9' }]}>
              <Ionicons name="ellipsis-horizontal" size={22} color={colors.secondary} />
            </View>
            <Text style={styles.actionLabel}>System Settings</Text>
          </TouchableOpacity>
        </View>

        {/* Branch Network Performance Table */}
        <View style={styles.branchHeaderRow}>
          <Text style={styles.sectionTitle}>Branch Performance</Text>
          <TouchableOpacity onPress={() => alert('Viewing all 4 branch locations')}>
            <Text style={styles.seeAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {BRANCH_DATA.map((item) => (
          <View key={item.id} style={styles.branchCard}>
            <View style={styles.branchCardTop}>
              <View>
                <Text style={styles.branchName}>{item.name}</Text>
                <Text style={styles.branchManager}>Mgr: {item.manager}</Text>
              </View>
              <View
                style={[
                  styles.statusTag,
                  item.status === 'Optimal'
                    ? styles.statusOptimal
                    : item.status === 'Reorder'
                    ? styles.statusReorder
                    : styles.statusLow,
                ]}
              >
                <Text
                  style={[
                    styles.statusTagText,
                    item.status === 'Optimal'
                      ? styles.statusTextOptimal
                      : item.status === 'Reorder'
                      ? styles.statusTextReorder
                      : styles.statusTextLow,
                  ]}
                >
                  {item.status}
                </Text>
              </View>
            </View>

            <View style={styles.branchCardBottom}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Total Sales</Text>
                <Text style={styles.metricValue}>{item.revenue}</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Stock Health</Text>
                <Text style={styles.metricValue}>{item.stock}</Text>
              </View>
              <TouchableOpacity
                style={styles.inspectBtn}
                onPress={() => alert(`Inspecting ${item.name}`)}
              >
                <Text style={styles.inspectBtnText}>Manage</Text>
                <Ionicons name="chevron-forward" size={14} color={colors.primary} />
              </TouchableOpacity>
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
  welcomeCard: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  welcomeTextWrap: {
    flex: 1,
  },
  welcomeGreeting: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
  },
  welcomeName: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textInverse,
    marginTop: 2,
    marginBottom: 4,
  },
  welcomeDesc: {
    fontSize: 11,
    color: '#CBD5E1',
    lineHeight: 16,
  },
  heroBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.primary,
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
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingVertical: 14,
    paddingHorizontal: 6,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  branchHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  branchCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  branchCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 10,
    marginBottom: 10,
  },
  branchName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  branchManager: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusOptimal: {
    backgroundColor: colors.successLight,
  },
  statusReorder: {
    backgroundColor: colors.warningLight,
  },
  statusLow: {
    backgroundColor: colors.dangerLight,
  },
  statusTagText: {
    fontSize: 10,
    fontWeight: '800',
  },
  statusTextOptimal: {
    color: colors.success,
  },
  statusTextReorder: {
    color: colors.warning,
  },
  statusTextLow: {
    color: colors.danger,
  },
  branchCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricItem: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 11,
    color: colors.textMuted,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 2,
  },
  inspectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.primaryMuted,
  },
  inspectBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    marginRight: 2,
  },
});

export default AdminHomeScreen;

