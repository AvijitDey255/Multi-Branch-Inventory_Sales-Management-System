import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, Modal, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { darkColors, lightColors } from '../theme/colors';
import { getRoleConfig } from '../utils/roles';
import tw from '../utils/tw';

export default function SalesmenScreen({ onNavigate }) {
  const mode = useSelector((state) => state.theme.mode);
  const user = useSelector((state) => state.auth.user);
  const isDark = mode === 'dark';
  const colors = isDark ? darkColors : lightColors;
  const roleConfig = getRoleConfig('manager');

  const [salesmen, setSalesmen] = useState([
    {
      id: 'SLS-101',
      name: 'Leo Vance',
      email: 'salesman@nexus.io',
      phone: '+1 (555) 612-8830',
      dealsClosed: 14,
      totalSales: '$42,500',
      rating: '4.9 ★',
      status: 'Top Performer',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    },
    {
      id: 'SLS-102',
      name: 'Marcus Brody',
      email: 'marcus.sales@nexus.io',
      phone: '+1 (555) 781-9920',
      dealsClosed: 16,
      totalSales: '$49,800',
      rating: '4.95 ★',
      status: 'Leader',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    },
    {
      id: 'SLS-103',
      name: 'Elena Rostova',
      email: 'elena.r@nexus.io',
      phone: '+1 (555) 349-1102',
      dealsClosed: 9,
      totalSales: '$28,400',
      rating: '4.7 ★',
      status: 'Active',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
    },
    {
      id: 'SLS-104',
      name: 'Devon Miles',
      email: 'devon.m@nexus.io',
      phone: '+1 (555) 890-4412',
      dealsClosed: 11,
      totalSales: '$33,900',
      rating: '4.8 ★',
      status: 'Active',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80',
    },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [repName, setRepName] = useState('');
  const [repEmail, setRepEmail] = useState('');
  const [repPhone, setRepPhone] = useState('');

  const handleAddSalesman = () => {
    if (!repName.trim() || !repEmail.trim()) {
      Alert.alert('Required Fields', 'Please enter salesman name and email.');
      return;
    }

    const newRep = {
      id: `SLS-10${salesmen.length + 1}`,
      name: repName.trim(),
      email: repEmail.trim(),
      phone: repPhone.trim() || '+1 (555) 123-4567',
      dealsClosed: 0,
      totalSales: '$0',
      rating: '5.0 ★',
      status: 'New Onboard',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80',
    };

    setSalesmen([...salesmen, newRep]);
    setRepName('');
    setRepEmail('');
    setRepPhone('');
    setModalVisible(false);
    Alert.alert('Salesman Added', `Invited ${newRep.name} to branch sales force.`);
  };

  return (
    <View style={[tw('flex-1'), { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={tw('p-4 pb-16')} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={tw('flex-row items-center justify-between mb-4')}>
          <View style={tw('flex-row items-center gap-2.5')}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => onNavigate && onNavigate('More')}
              style={[
                tw('w-9 h-9 rounded-xl items-center justify-center border'),
                { borderColor: colors.border, backgroundColor: colors.surfaceElevated },
              ]}
            >
              <MaterialCommunityIcons name="arrow-left" size={20} color={colors.text} />
            </TouchableOpacity>
            <View>
              <Text style={[tw('text-lg font-black'), { color: colors.text }]}>
                Branch Sales Force
              </Text>
              <Text style={[tw('text-xs'), { color: colors.textSecondary }]}>
                Sales representatives, closed deals & customer accounts
              </Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setModalVisible(true)}
            style={[
              tw('px-3 py-2 rounded-xl flex-row items-center gap-1.5 shadow-sm'),
              { backgroundColor: roleConfig.color },
            ]}
          >
            <MaterialCommunityIcons name="account-plus" size={16} color="#FFFFFF" />
            <Text style={tw('text-xs font-bold text-white')}>Add Rep</Text>
          </TouchableOpacity>
        </View>

        {/* Team Members */}
        <View style={tw('gap-3.5')}>
          {salesmen.map((rep) => (
            <View
              key={rep.id}
              style={[
                tw('p-4 rounded-3xl border shadow-sm'),
                { backgroundColor: isDark ? '#1E293B' : '#FFFFFF', borderColor: colors.border },
              ]}
            >
              <View style={tw('flex-row items-center justify-between mb-2')}>
                <View style={tw('flex-row items-center gap-3')}>
                  <Image source={{ uri: rep.avatar }} style={tw('w-12 h-12 rounded-full')} />
                  <View>
                    <Text style={[tw('text-sm font-bold'), { color: colors.text }]}>
                      {rep.name}
                    </Text>
                    <Text style={[tw('text-xs'), { color: colors.textMuted }]}>
                      {rep.email}
                    </Text>
                  </View>
                </View>

                <View style={[tw('px-2.5 py-0.5 rounded-full'), { backgroundColor: `${roleConfig.color}15` }]}>
                  <Text style={[tw('text-xs font-bold'), { color: roleConfig.color, fontSize: 10.5 }]}>
                    {rep.status}
                  </Text>
                </View>
              </View>

              {/* Stats */}
              <View style={tw('flex-row justify-between py-2 border-y border-slate-100 my-1')}>
                <View>
                  <Text style={[tw('text-xs'), { color: colors.textMuted, fontSize: 11 }]}>Total Sold</Text>
                  <Text style={[tw('text-xs font-bold mt-0.5'), { color: colors.text }]}>
                    {rep.totalSales}
                  </Text>
                </View>
                <View>
                  <Text style={[tw('text-xs'), { color: colors.textMuted, fontSize: 11 }]}>Deals Closed</Text>
                  <Text style={[tw('text-xs font-bold mt-0.5'), { color: colors.text }]}>
                    {rep.dealsClosed} deals
                  </Text>
                </View>
                <View>
                  <Text style={[tw('text-xs'), { color: colors.textMuted, fontSize: 11 }]}>Client Rating</Text>
                  <Text style={[tw('text-xs font-bold mt-0.5'), { color: '#F59E0B' }]}>
                    {rep.rating}
                  </Text>
                </View>
              </View>

              {/* Actions */}
              <View style={tw('flex-row justify-end gap-2 mt-2 pt-1')}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => Alert.alert('Outreach', `Calling ${rep.name} at ${rep.phone}`)}
                  style={[
                    tw('px-3 py-1.5 rounded-xl border flex-row items-center gap-1.5'),
                    { borderColor: colors.border, backgroundColor: colors.surfaceElevated },
                  ]}
                >
                  <MaterialCommunityIcons name="phone-outline" size={14} color={colors.text} />
                  <Text style={[tw('text-xs font-semibold'), { color: colors.text }]}>Call Rep</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => Alert.alert('Assigned', `Assigned new client lead to ${rep.name}`)}
                  style={[
                    tw('px-3 py-1.5 rounded-xl flex-row items-center gap-1.5'),
                    { backgroundColor: roleConfig.color },
                  ]}
                >
                  <MaterialCommunityIcons name="account-arrow-right" size={14} color="#FFFFFF" />
                  <Text style={tw('text-xs font-bold text-white')}>Assign Lead</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Add Rep Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View
          style={[
            tw('flex-1 items-center justify-center p-4'),
            { backgroundColor: 'rgba(0,0,0,0.6)' },
          ]}
        >
          <View
            style={[
              tw('w-full max-w-md p-5 rounded-3xl border shadow-xl'),
              { backgroundColor: isDark ? '#1E293B' : '#FFFFFF', borderColor: colors.border },
            ]}
          >
            <View style={tw('flex-row items-center justify-between pb-3 border-b border-slate-200 mb-3')}>
              <Text style={[tw('text-base font-bold'), { color: colors.text }]}>
                Onboard Sales Representative
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={tw('gap-3 mb-4')}>
              <View>
                <Text style={[tw('text-xs font-semibold mb-1'), { color: colors.text }]}>
                  Representative Full Name
                </Text>
                <TextInput
                  value={repName}
                  onChangeText={setRepName}
                  placeholder="e.g. Jordan Hayes"
                  placeholderTextColor={colors.textMuted}
                  style={[
                    tw('h-11 px-3.5 rounded-xl border text-xs'),
                    { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.text },
                  ]}
                />
              </View>

              <View>
                <Text style={[tw('text-xs font-semibold mb-1'), { color: colors.text }]}>
                  Corporate Email
                </Text>
                <TextInput
                  value={repEmail}
                  onChangeText={setRepEmail}
                  placeholder="jordan.h@nexus.io"
                  placeholderTextColor={colors.textMuted}
                  style={[
                    tw('h-11 px-3.5 rounded-xl border text-xs'),
                    { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.text },
                  ]}
                />
              </View>

              <View>
                <Text style={[tw('text-xs font-semibold mb-1'), { color: colors.text }]}>
                  Phone Number
                </Text>
                <TextInput
                  value={repPhone}
                  onChangeText={setRepPhone}
                  placeholder="+1 (555) 000-0000"
                  placeholderTextColor={colors.textMuted}
                  style={[
                    tw('h-11 px-3.5 rounded-xl border text-xs'),
                    { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.text },
                  ]}
                />
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleAddSalesman}
              style={[
                tw('h-12 rounded-xl flex-row items-center justify-center gap-2 shadow-md'),
                { backgroundColor: roleConfig.color },
              ]}
            >
              <MaterialCommunityIcons name="account-check" size={18} color="#FFFFFF" />
              <Text style={tw('text-xs font-bold text-white')}>Add to Sales Force</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
