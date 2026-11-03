import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Animated,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { getThemeColors } from '../constants/colors';

// Event emitter pattern for toast.success(), toast.error(), toast.info()
const listeners = new Set();

export const toast = {
  show: (message, options = {}) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    const item = {
      id,
      message: typeof message === 'string' ? message : String(message),
      title: options.title || null,
      type: options.type || 'info', // 'success' | 'error' | 'info'
      duration: options.duration || 2600,
    };
    listeners.forEach((fn) => fn(item));
    return id;
  },
  success: (message, title = null, duration = 2600) => {
    return toast.show(message, { type: 'success', title, duration });
  },
  error: (message, title = null, duration = 3000) => {
    return toast.show(message, { type: 'error', title, duration });
  },
  info: (message, title = null, duration = 2600) => {
    return toast.show(message, { type: 'info', title, duration });
  },
};

export function Toaster({ insideModal = false }) {
  const { theme } = useSelector((state) => state.ui || {});
  const isDark = theme === 'dark';

  const [currentToast, setCurrentToast] = useState(null);
  const slideAnim = useRef(new Animated.Value(-60)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef(null);

  useEffect(() => {
    const handleNewToast = (newToast) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      setCurrentToast(newToast);

      slideAnim.setValue(-50);
      opacityAnim.setValue(0);

      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 90,
          friction: 9,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();

      timerRef.current = setTimeout(() => {
        dismissToast();
      }, newToast.duration || 2600);
    };

    listeners.add(handleNewToast);
    return () => {
      listeners.delete(handleNewToast);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const dismissToast = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -50,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 160,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCurrentToast(null);
    });
  };

  if (!currentToast) return null;

  const isSuccess = currentToast.type === 'success';
  const isError = currentToast.type === 'error';

  const iconName = isSuccess
    ? 'checkmark-circle'
    : isError
    ? 'alert-circle'
    : 'information-circle';

  const accentColor = isSuccess
    ? '#10B981'
    : isError
    ? '#EF4444'
    : '#2563EB';

  const cardBg = isDark ? '#1E293B' : '#FFFFFF';
  const borderColor = isDark ? '#334155' : '#E2E8F0';
  const textColor = isDark ? '#F8FAFC' : '#0F172A';
  const subtextColor = isDark ? '#94A3B8' : '#64748B';

  return (
    <View
      style={[
        styles.toastWrapper,
        insideModal ? styles.insideModalWrapper : styles.rootWrapper,
      ]}
      pointerEvents="box-none"
    >
      <Animated.View
        style={[
          styles.hotToastCard,
          {
            backgroundColor: cardBg,
            borderColor: borderColor,
            transform: [{ translateY: slideAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={dismissToast}
          style={styles.toastContent}
        >
          <View style={[styles.iconWrap, { backgroundColor: `${accentColor}18` }]}>
            <Ionicons name={iconName} size={18} color={accentColor} />
          </View>

          <View style={styles.textWrap}>
            {currentToast.title ? (
              <Text style={[styles.title, { color: textColor }]}>
                {currentToast.title}
              </Text>
            ) : null}
            <Text
              style={[
                styles.message,
                { color: currentToast.title ? subtextColor : textColor },
              ]}
              numberOfLines={2}
            >
              {currentToast.message}
            </Text>
          </View>

          <TouchableOpacity
            onPress={dismissToast}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.closeBtn}
          >
            <Ionicons name="close" size={14} color={subtextColor} />
          </TouchableOpacity>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  toastWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 999999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  rootWrapper: {
    top: Platform.OS === 'ios' ? 54 : 36,
  },
  insideModalWrapper: {
    top: 20,
  },
  hotToastCard: {
    minWidth: 260,
    maxWidth: 420,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 8,
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },
  textWrap: {
    flex: 1,
    paddingRight: 6,
  },
  title: {
    fontSize: 12.5,
    fontWeight: '700',
    marginBottom: 1,
  },
  message: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  closeBtn: {
    padding: 3,
    marginLeft: 4,
  },
});

export default toast;

