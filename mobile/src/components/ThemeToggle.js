import React from 'react';
import { TouchableOpacity, StyleSheet, View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '../store/themeSlice';
import { darkColors, lightColors } from '../theme/colors';

export default function ThemeToggle({ showLabel = false, compact = false }) {
  const dispatch = useDispatch();
  const mode = useSelector((state) => state.theme.mode);
  const isDark = mode === 'dark';
  const colors = isDark ? darkColors : lightColors;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => dispatch(toggleTheme())}
      style={[
        styles.container,
        {
          backgroundColor: isDark ? '#1E293B' : '#EEF2FF',
          borderColor: isDark ? '#334155' : '#CBD5E1',
        },
        compact && styles.compactContainer,
      ]}
    >
      <View style={styles.iconWrapper}>
        <MaterialCommunityIcons
          name={isDark ? 'weather-night' : 'white-balance-sunny'}
          size={compact ? 18 : 20}
          color={isDark ? '#818CF8' : '#F59E0B'}
        />
      </View>
      {showLabel && (
        <Text style={[styles.label, { color: colors.text }]}>
          {isDark ? 'Dark Mode' : 'Light Mode'}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  compactContainer: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 8,
  },
});
