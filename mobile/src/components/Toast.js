import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Animated,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';

// Event emitter pattern for standalone `toast.success()`, `toast.error()`, etc.
const listeners = new Set();

export const toast = {
  show: (message, options = {}) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    const item = {
      id,
      message: typeof message === 'string' ? message : JSON.stringify(message),
      title: options.title || null,
      type: options.type || 'info',
      duration: options.duration || 3000,
    };
    listeners.forEach((fn) => fn(item));
    return id;
  },
  success: (message, title = null, duration = 3000) => {
    return toast.show(message, { type: 'success', title, duration });
  },
  error: (message, title = null, duration = 3500) => {
    return toast.show(message, { type: 'error', title, duration });
  },
  info: (message, title = null, duration = 3000) => {
    return toast.show(message, { type: 'info', title, duration });
  },
};

export function Toaster({ insideModal = false }) {
  // On web, fixed root toaster already floats over modals with high zIndex; avoid duplicate
  if (Platform.OS === 'web' && insideModal) {
    return null;
  }

  const mode = useSelector((state) => state.theme?.mode || 'light');
  const isDark = mode === 'dark';

  const [currentToast, setCurrentToast] = useState(null);
  const slideAnim = useRef(new Animated.Value(-80)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef(null);

  useEffect(() => {
    const handleNewToast = (newToast) => {
      // Clear any pending dismissal
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      setCurrentToast(newToast);

      // Reset values
      slideAnim.setValue(-60);
      opacityAnim.setValue(0);

      // Animate In: spring slide-down + fade-in
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 70,
          friction: 9,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss
      timerRef.current = setTimeout(() => {
        dismissToast();
      }, newToast.duration || 3000);
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
        toValue: -60,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 180,
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
    ? 'check-circle'
    : isError
    ? 'alert-circle'
    : 'information';

  const iconColor = isSuccess
    ? '#10B981'
    : isError
    ? '#EF4444'
    : '#6366F1';

  const bgBorder = isSuccess
    ? (isDark ? '#064E3B' : '#A7F3D0')
    : isError
    ? (isDark ? '#7F1D1D' : '#FECACA')
    : (isDark ? '#312E81' : '#DDD6FE');

  const cardBg = isDark ? '#1E293B' : '#FFFFFF';
  const textColor = isDark ? '#F8FAFC' : '#0F172A';
  const subtextColor = isDark ? '#94A3B8' : '#64748B';

  return (
    <View style={styles.toastContainer} pointerEvents="box-none">
      <Animated.View
        style={[
          styles.toastCard,
          {
            backgroundColor: cardBg,
            borderColor: bgBorder,
            transform: [{ translateY: slideAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={dismissToast}
          style={styles.touchableArea}
        >
          {/* Icon Badge */}
          <View
            style={[
              styles.iconWrapper,
              {
                backgroundColor: isSuccess
                  ? '#10B98118'
                  : isError
                  ? '#EF444418'
                  : '#6366F118',
              },
            ]}
          >
            <MaterialCommunityIcons name={iconName} size={20} color={iconColor} />
          </View>

          {/* Text Message */}
          <View style={styles.textWrapper}>
            {currentToast.title ? (
              <Text style={[styles.titleText, { color: textColor }]}>
                {currentToast.title}
              </Text>
            ) : null}
            <Text style={[styles.messageText, { color: currentToast.title ? subtextColor : textColor }]}>
              {currentToast.message}
            </Text>
          </View>

          {/* Close button */}
          <TouchableOpacity
            onPress={dismissToast}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.closeButton}
          >
            <MaterialCommunityIcons name="close" size={16} color={subtextColor} />
          </TouchableOpacity>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  toastContainer: {
    position: Platform.OS === 'web' ? 'fixed' : 'absolute',
    top: Platform.OS === 'web' ? 20 : 48,
    left: 0,
    right: 0,
    zIndex: 999999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  toastCard: {
    minWidth: 260,
    maxWidth: 440,
    borderRadius: 20,
    borderWidth: 1.5,
    paddingVertical: 10,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 10,
  },
  touchableArea: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  textWrapper: {
    flex: 1,
    paddingRight: 6,
  },
  titleText: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 1,
  },
  messageText: {
    fontSize: 12.5,
    fontWeight: '600',
    lineHeight: 16,
  },
  closeButton: {
    padding: 4,
    marginLeft: 4,
  },
});

export default toast;
