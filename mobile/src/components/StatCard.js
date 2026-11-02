import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { getThemeColors } from '../constants/colors';

const StatCard = ({
  title,
  value,
  iconName,
  iconColor,
  iconBg,
  subtitle,
  trend,
  trendPositive = true,
  style,
}) => {
  const theme = useSelector((state) => state.ui?.theme || 'light');
  const colors = getThemeColors(theme);

  const cardIconColor = iconColor || colors.primary;
  const cardIconBg = iconBg || colors.primaryMuted;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      <View style={styles.topRow}>
        <View style={[styles.iconWrap, { backgroundColor: cardIconBg }]}>
          <Ionicons name={iconName} size={20} color={cardIconColor} />
        </View>
        {trend && (
          <View
            style={[
              styles.trendBadge,
              {
                backgroundColor: trendPositive
                  ? colors.successLight
                  : colors.dangerLight,
              },
            ]}
          >
            <Ionicons
              name={trendPositive ? 'trending-up' : 'trending-down'}
              size={12}
              color={trendPositive ? colors.success : colors.danger}
            />
            <Text
              style={[
                styles.trendText,
                { color: trendPositive ? colors.success : colors.danger },
              ]}
            >
              {trend}
            </Text>
          </View>
        )}
      </View>
      <Text style={[styles.value, { color: colors.textPrimary }]} numberOfLines={1}>
        {value}
      </Text>
      <Text style={[styles.title, { color: colors.textSecondary }]} numberOfLines={1}>
        {title}
      </Text>
      {subtitle && (
        <Text style={[styles.subtitle, { color: colors.textMuted }]} numberOfLines={1}>
          {subtitle}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    flex: 1,
    minWidth: 140,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  trendText: {
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 3,
  },
  value: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  subtitle: {
    fontSize: 10,
    marginTop: 4,
  },
});

export default StatCard;
