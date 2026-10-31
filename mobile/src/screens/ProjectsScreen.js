import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { darkColors, lightColors } from '../theme/colors';
import { addProject, updateProjectStatus, deleteProject } from '../store/projectsSlice';

export default function ProjectsScreen() {
  const dispatch = useDispatch();
  const mode = useSelector((state) => state.theme.mode);
  const projects = useSelector((state) => state.projects.items);
  const isDark = mode === 'dark';
  const colors = isDark ? darkColors : lightColors;

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [modalVisible, setModalVisible] = useState(false);

  // New Project Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Luxury Suite');
  const [newClient, setNewClient] = useState('');
  const [newAmount, setNewAmount] = useState('');

  const tabs = ['All', 'Confirmed', 'In Progress', 'Pending'];

  const filtered = projects.filter((item) => {
    const matchesTab = activeTab === 'All' || item.status.toLowerCase() === activeTab.toLowerCase();
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleCreateProject = () => {
    if (!newTitle.trim()) {
      return;
    }
    dispatch(
      addProject({
        title: newTitle.trim(),
        category: newCategory,
        client: newClient.trim() || 'Internal Client',
        amount: newAmount.trim() ? `$${newAmount.replace('$', '')}` : '$1,200',
        status: 'In Progress',
        progress: 25,
        description: `Custom booking for ${newCategory}. Created through mobile client console.`,
      })
    );
    setNewTitle('');
    setNewClient('');
    setNewAmount('');
    setModalVisible(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search Bar & Add Button */}
      <View style={styles.topSection}>
        <View style={styles.searchRow}>
          <View
            style={[
              styles.searchWrapper,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <MaterialCommunityIcons name="magnify" size={20} color={colors.textMuted} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search projects, suites or clients..."
              placeholderTextColor={colors.textMuted}
              style={[styles.searchInput, { color: colors.text }]}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <MaterialCommunityIcons name="close-circle" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setModalVisible(true)}
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
          >
            <MaterialCommunityIcons name="plus" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Status Filter Switching Tabs */}
        <View style={styles.tabsRow}>
          {tabs.map((tab) => {
            const isSelected = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                activeOpacity={0.7}
                onPress={() => setActiveTab(tab)}
                style={[
                  styles.tabButton,
                  isSelected && {
                    backgroundColor: colors.primary,
                    borderColor: colors.primary,
                  },
                  !isSelected && {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.tabButtonText,
                    {
                      color: isSelected ? '#FFFFFF' : colors.textSecondary,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Projects List */}
      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <View style={[styles.emptyBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <MaterialCommunityIcons name="folder-search-outline" size={48} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No bookings found</Text>
            <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
              Try adjusting your search query or tab filters.
            </Text>
          </View>
        ) : (
          filtered.map((item) => (
            <View
              key={item.id}
              style={[
                styles.projectCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.cardHeader}>
                <View style={styles.cardLeft}>
                  <View style={[styles.avatarIcon, { backgroundColor: colors.primaryLight }]}>
                    <MaterialCommunityIcons name={item.icon || 'briefcase-outline'} size={22} color={colors.primary} />
                  </View>
                  <View style={styles.cardTitleWrap}>
                    <Text style={[styles.itemTitle, { color: colors.text }]} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={[styles.itemMeta, { color: colors.textSecondary }]}>
                      {item.category} • {item.client}
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.badgePill,
                    {
                      backgroundColor:
                        item.status === 'Confirmed'
                          ? 'rgba(16, 185, 129, 0.15)'
                          : item.status === 'In Progress'
                          ? 'rgba(99, 102, 241, 0.15)'
                          : 'rgba(245, 158, 11, 0.15)',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      {
                        color:
                          item.status === 'Confirmed'
                            ? '#10B981'
                            : item.status === 'In Progress'
                            ? '#6366F1'
                            : '#F59E0B',
                      },
                    ]}
                  >
                    {item.status}
                  </Text>
                </View>
              </View>

              <Text style={[styles.itemDesc, { color: colors.textMuted }]}>{item.description}</Text>

              {/* Progress and Actions */}
              <View style={styles.progressRow}>
                <View style={styles.progressInfo}>
                  <Text style={[styles.progressTitle, { color: colors.textSecondary }]}>Completion Status</Text>
                  <Text style={[styles.progressVal, { color: colors.text }]}>{item.progress}%</Text>
                </View>
                <View style={[styles.track, { backgroundColor: colors.surfaceElevated }]}>
                  <View
                    style={[
                      styles.fill,
                      {
                        width: `${item.progress}%`,
                        backgroundColor: item.tagColor || colors.primary,
                      },
                    ]}
                  />
                </View>
              </View>

              <View style={[styles.footerBar, { borderTopColor: colors.borderLight }]}>
                <View style={styles.footerLeft}>
                  <Text style={[styles.amountLabel, { color: colors.textMuted }]}>Value:</Text>
                  <Text style={[styles.amountValue, { color: colors.text }]}>{item.amount}</Text>
                </View>

                {/* Status Toggle & Delete Actions */}
                <View style={styles.actionButtonsRow}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() =>
                      dispatch(
                        updateProjectStatus({
                          id: item.id,
                          status: item.status === 'Confirmed' ? 'In Progress' : 'Confirmed',
                        })
                      )
                    }
                    style={[
                      styles.statusToggleBtn,
                      {
                        backgroundColor:
                          item.status === 'Confirmed' ? colors.warningLight : colors.successLight,
                      },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={item.status === 'Confirmed' ? 'clock-fast' : 'check'}
                      size={14}
                      color={item.status === 'Confirmed' ? '#F59E0B' : '#10B981'}
                    />
                    <Text
                      style={[
                        styles.statusToggleText,
                        { color: item.status === 'Confirmed' ? '#F59E0B' : '#10B981' },
                      ]}
                    >
                      {item.status === 'Confirmed' ? 'Set Active' : 'Confirm'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => dispatch(deleteProject(item.id))}
                    style={[styles.deleteBtn, { backgroundColor: colors.dangerLight }]}
                  >
                    <MaterialCommunityIcons name="trash-can-outline" size={16} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Modal: Add New Project / Booking */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={[styles.modalBackdrop, { backgroundColor: colors.drawerOverlay }]}>
          <View style={[styles.modalContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>New Booking / Project</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCloseBtn}>
                <MaterialCommunityIcons name="close" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.modalInputGroup}>
                <Text style={[styles.modalLabel, { color: colors.text }]}>Project or Suite Title *</Text>
                <TextInput
                  value={newTitle}
                  onChangeText={setNewTitle}
                  placeholder="e.g. Sovereign Penthouse Lounge"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.modalInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceElevated }]}
                />
              </View>

              <View style={styles.modalInputGroup}>
                <Text style={[styles.modalLabel, { color: colors.text }]}>Category</Text>
                <TextInput
                  value={newCategory}
                  onChangeText={setNewCategory}
                  placeholder="e.g. VIP Venue, Fleet, Soundstage"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.modalInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceElevated }]}
                />
              </View>

              <View style={styles.modalInputGroup}>
                <Text style={[styles.modalLabel, { color: colors.text }]}>Client / Entity Name</Text>
                <TextInput
                  value={newClient}
                  onChangeText={setNewClient}
                  placeholder="e.g. Vanguard Partners"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.modalInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceElevated }]}
                />
              </View>

              <View style={styles.modalInputGroup}>
                <Text style={[styles.modalLabel, { color: colors.text }]}>Budget / Amount ($)</Text>
                <TextInput
                  value={newAmount}
                  onChangeText={setNewAmount}
                  placeholder="e.g. 2400"
                  keyboardType="numeric"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.modalInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceElevated }]}
                />
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleCreateProject}
                style={[styles.modalSubmitBtn, { backgroundColor: colors.primary }]}
              >
                <MaterialCommunityIcons name="plus-circle-outline" size={18} color="#FFFFFF" />
                <Text style={styles.modalSubmitText}>Create Booking Entry</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topSection: {
    padding: 16,
    paddingBottom: 8,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  searchWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    height: '100%',
  },
  addBtn: {
    width: 46,
    height: 46,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  tabButtonText: {
    fontSize: 12,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 30,
    gap: 14,
  },
  emptyBox: {
    padding: 30,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 10,
  },
  emptySub: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
  },
  projectCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  avatarIcon: {
    width: 42,
    height: 42,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitleWrap: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  itemMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  badgePill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  itemDesc: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },
  progressRow: {
    marginBottom: 12,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressTitle: {
    fontSize: 11,
    fontWeight: '500',
  },
  progressVal: {
    fontSize: 11,
    fontWeight: '700',
  },
  track: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
  footerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  amountLabel: {
    fontSize: 12,
  },
  amountValue: {
    fontSize: 14,
    fontWeight: '800',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusToggleText: {
    fontSize: 11,
    fontWeight: '700',
  },
  deleteBtn: {
    width: 28,
    height: 28,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalBody: {
    marginTop: 14,
  },
  modalInputGroup: {
    marginBottom: 14,
    gap: 6,
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  modalInput: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  modalSubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
    marginBottom: 12,
  },
  modalSubmitText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
