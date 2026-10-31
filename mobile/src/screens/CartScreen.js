import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import {
  addToCart,
  decreaseCartQuantity,
  removeFromCart,
  clearCart,
  createOrder,
} from '../store/ecomSlice';
import { darkColors, lightColors } from '../theme/colors';
import { getRoleConfig } from '../utils/roles';
import tw from '../utils/tw';
import { toast } from '../components/Toast';

export default function CartScreen({ onNavigate }) {
  const dispatch = useDispatch();
  const mode = useSelector((state) => state.theme.mode);
  const user = useSelector((state) => state.auth.user);
  const cart = useSelector((state) => state.ecom.cart || []);
  const isDark = mode === 'dark';
  const colors = isDark ? darkColors : lightColors;

  const currentRole = user?.role || 'manager';
  const roleConfig = getRoleConfig(currentRole);

  const totalAmount = cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
  const totalItemsCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty.', 'Cannot Checkout');
      return;
    }

    const itemSummary = cart
      .map((item) => `${item.name} (${item.quantity}x)`)
      .join(', ');

    dispatch(
      createOrder({
        customer: user?.fullName || 'Sarah Jenkins (Manager)',
        customerEmail: user?.email || 'manager@nexus.io',
        salesRep: 'Store Operations',
        items: itemSummary,
        total: totalAmount,
      })
    );

    dispatch(clearCart());
    toast.success(`Order placed successfully for $${totalAmount.toLocaleString()}!`, 'Order Placed');
    if (onNavigate) {
      onNavigate('Orders');
    }
  };

  return (
    <View style={[tw('flex-1'), { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={tw('p-4 pb-24')} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={tw('flex-row items-center justify-between mb-4')}>
          <View style={tw('flex-row items-center gap-2.5')}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => onNavigate && onNavigate('Products')}
              style={[
                tw('w-9 h-9 rounded-xl items-center justify-center border'),
                { borderColor: colors.border, backgroundColor: colors.surfaceElevated },
              ]}
            >
              <MaterialCommunityIcons name="arrow-left" size={20} color={colors.text} />
            </TouchableOpacity>
            <View>
              <Text style={[tw('text-xl font-black'), { color: colors.text }]}>
                Shopping Cart
              </Text>
              <Text style={[tw('text-xs'), { color: colors.textSecondary }]}>
                {cart.length > 0
                  ? `${totalItemsCount} item${totalItemsCount === 1 ? '' : 's'} in your order cart`
                  : 'Your cart is currently empty'}
              </Text>
            </View>
          </View>

          {cart.length > 0 && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                dispatch(clearCart());
                toast.info('Cart cleared.', 'Cart Empty');
              }}
              style={[
                tw('px-3 py-1.5 rounded-xl flex-row items-center gap-1 border'),
                { borderColor: '#EF444430', backgroundColor: '#EF444410' },
              ]}
            >
              <MaterialCommunityIcons name="trash-can-outline" size={15} color="#EF4444" />
              <Text style={[tw('text-xs font-bold'), { color: '#EF4444' }]}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Cart Items List */}
        {cart.length > 0 ? (
          <View style={tw('gap-3.5 mb-5')}>
            {cart.map((item) => {
              const itemTotal = item.price * (item.quantity || 1);

              return (
                <View
                  key={item.id}
                  style={[
                    tw('p-3.5 rounded-3xl border shadow-sm flex-row gap-3.5'),
                    {
                      backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                      borderColor: colors.border,
                    },
                  ]}
                >
                  {/* Thumbnail Image */}
                  <Image
                    source={{ uri: item.image }}
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 18,
                      backgroundColor: isDark ? '#334155' : '#E2E8F0',
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                    resizeMode="cover"
                  />

                  {/* Info & Quantity Stepper */}
                  <View style={tw('flex-1 justify-between')}>
                    <View>
                      <View style={tw('flex-row items-center justify-between')}>
                        <View
                          style={[
                            tw('px-2 py-0.5 rounded-md border'),
                            {
                              backgroundColor: `${roleConfig.color}12`,
                              borderColor: `${roleConfig.color}30`,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              tw('text-xs font-bold uppercase tracking-wider'),
                              { color: roleConfig.color, fontSize: 9.5 },
                            ]}
                          >
                            {item.category}
                          </Text>
                        </View>

                        {/* Remove item button */}
                        <TouchableOpacity
                          onPress={() => {
                            dispatch(removeFromCart(item.id));
                            toast.info(`Removed "${item.name}" from cart.`);
                          }}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <MaterialCommunityIcons name="close" size={18} color={colors.textMuted} />
                        </TouchableOpacity>
                      </View>

                      <Text
                        style={[tw('text-sm font-bold mt-1'), { color: colors.text }]}
                        numberOfLines={1}
                      >
                        {item.name}
                      </Text>

                      <Text style={[tw('text-xs font-semibold mt-0.5'), { color: colors.textMuted }]}>
                        ${item.price} each
                      </Text>
                    </View>

                    {/* Bottom Row: Item Total and Stepper */}
                    <View style={tw('flex-row items-center justify-between mt-2 pt-2 border-t border-slate-100')}>
                      <Text style={[tw('text-base font-black'), { color: colors.text }]}>
                        ${itemTotal}
                      </Text>

                      {/* - + Stepper */}
                      <View
                        style={[
                          tw('flex-row items-center rounded-xl border overflow-hidden'),
                          {
                            backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                            borderColor: colors.border,
                          },
                        ]}
                      >
                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={() => dispatch(decreaseCartQuantity(item.id))}
                          style={[
                            tw('w-8 h-8 items-center justify-center'),
                            { backgroundColor: isDark ? '#334155' : '#F1F5F9' },
                          ]}
                        >
                          <MaterialCommunityIcons name="minus" size={15} color={colors.text} />
                        </TouchableOpacity>

                        <Text style={[tw('w-8 text-center text-xs font-black'), { color: colors.text }]}>
                          {item.quantity}
                        </Text>

                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={() => dispatch(addToCart(item))}
                          style={[
                            tw('w-8 h-8 items-center justify-center'),
                            { backgroundColor: roleConfig.color },
                          ]}
                        >
                          <MaterialCommunityIcons name="plus" size={15} color="#FFFFFF" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          /* Empty Cart State */
          <View style={tw('items-center justify-center py-16 px-4')}>
            <View
              style={[
                tw('w-20 h-20 rounded-3xl items-center justify-center mb-4'),
                { backgroundColor: `${roleConfig.color}15` },
              ]}
            >
              <MaterialCommunityIcons name="cart-off" size={40} color={roleConfig.color} />
            </View>
            <Text style={[tw('text-lg font-black'), { color: colors.text }]}>
              Your Cart is Empty
            </Text>
            <Text
              style={[
                tw('text-xs text-center mt-1 mb-5 max-w-xs'),
                { color: colors.textSecondary },
              ]}
            >
              Browse the products catalogue and use the "+ Add to Cart" button to add inventory items here.
            </Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => onNavigate && onNavigate('Products')}
              style={[
                tw('px-5 py-2.5 rounded-2xl flex-row items-center gap-2 shadow-md'),
                { backgroundColor: roleConfig.color },
              ]}
            >
              <MaterialCommunityIcons name="cube-outline" size={18} color="#FFFFFF" />
              <Text style={tw('text-xs font-bold text-white')}>Browse Products</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Order Summary Card when cart is not empty */}
        {cart.length > 0 && (
          <View
            style={[
              tw('p-4 rounded-3xl border shadow-sm mb-4'),
              {
                backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[tw('text-xs font-bold uppercase tracking-wider mb-3'), { color: roleConfig.color }]}>
              ORDER SUMMARY
            </Text>

            <View style={tw('gap-2 pb-3 border-b border-slate-100')}>
              <View style={tw('flex-row justify-between')}>
                <Text style={[tw('text-xs font-medium'), { color: colors.textSecondary }]}>
                  Subtotal ({totalItemsCount} units)
                </Text>
                <Text style={[tw('text-xs font-bold'), { color: colors.text }]}>
                  ${totalAmount}
                </Text>
              </View>

              <View style={tw('flex-row justify-between')}>
                <Text style={[tw('text-xs font-medium'), { color: colors.textSecondary }]}>
                  Handling & Warehouse Delivery
                </Text>
                <Text style={[tw('text-xs font-bold text-emerald-500')]}>
                  FREE
                </Text>
              </View>
            </View>

            <View style={tw('flex-row items-baseline justify-between pt-3 mb-4')}>
              <Text style={[tw('text-sm font-black'), { color: colors.text }]}>
                Total Order Value
              </Text>
              <Text style={[tw('text-xl font-black'), { color: roleConfig.color }]}>
                ${totalAmount}
              </Text>
            </View>

            {/* Checkout / Place Order Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleCheckout}
              style={[
                tw('h-12 rounded-2xl flex-row items-center justify-center gap-2 shadow-md'),
                { backgroundColor: roleConfig.color },
              ]}
            >
              <MaterialCommunityIcons name="cart-check" size={20} color="#FFFFFF" />
              <Text style={tw('text-sm font-bold text-white')}>
                Place Order (${totalAmount})
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
