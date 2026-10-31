import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { darkColors, lightColors } from '../theme/colors';
import { addProject } from '../store/projectsSlice';

const CATALOG = [
  {
    id: 'SVC-1',
    title: 'Skyline Atrium Penthouse',
    category: 'VIP Lounges',
    price: '$350/hr',
    numericPrice: '$350',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&auto=format&fit=crop&q=80',
    location: '450 Mission St, San Francisco',
    rating: '4.98 ★ (42 reviews)',
    amenities: ['Panoramic 360° Views', 'Full Bar Service', 'Ultra-fast Fiber', 'Dedicated Butler'],
    icon: 'office-building',
  },
  {
    id: 'SVC-2',
    title: 'Executive Tesla Model S Plaid',
    category: 'Fleet & Chauffeur',
    price: '$850/day',
    numericPrice: '$850',
    image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=600&auto=format&fit=crop&q=80',
    location: 'SFO Airport or City Delivery',
    rating: '4.95 ★ (88 reviews)',
    amenities: ['Chauffeur Included', 'Privacy Tint Glass', 'Refreshment Bar', 'Mobile Hotspot'],
    icon: 'car-sports',
  },
  {
    id: 'SVC-3',
    title: 'Acoustic Soundstage & Pod Studio',
    category: 'Creative Spaces',
    price: '$220/hr',
    numericPrice: '$220',
    image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&auto=format&fit=crop&q=80',
    location: 'Arts & Media District, SF',
    rating: '4.92 ★ (31 reviews)',
    amenities: ['Shure SM7B Mics', '4K PTZ Broadcast', 'Sound Isolation', 'Audio Engineer'],
    icon: 'microphone-variant',
  },
  {
    id: 'SVC-4',
    title: 'Oceanic Horizon 85ft Yacht',
    category: 'Luxury Charters',
    price: '$1,200/hr',
    numericPrice: '$4,800',
    image: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=600&auto=format&fit=crop&q=80',
    location: 'Pier 39 Marina, SF Bay',
    rating: '5.0 ★ (19 reviews)',
    amenities: ['Captain & 3 Crew', 'Chef & Dining', 'Flybridge Lounge', 'Water Toys'],
    icon: 'sail-boat',
  },
];

export const SERVICE_CATEGORIES = ['All', 'VIP Lounges', 'Fleet & Chauffeur', 'Creative Spaces', 'Luxury Charters'];

export default function ServicesScreen({ onNavigate }) {
  const dispatch = useDispatch();
  const mode = useSelector((state) => state.theme.mode);
  const isDark = mode === 'dark';
  const colors = isDark ? darkColors : lightColors;

  const [selectedCat, setSelectedCat] = useState('All');
  const [bookedIds, setBookedIds] = useState([]);

  const filteredCatalog =
    selectedCat === 'All'
      ? CATALOG
      : CATALOG.filter((item) => item.category === selectedCat);

  const handleBookNow = (service) => {
    dispatch(
      addProject({
        title: service.title,
        category: service.category,
        client: 'Self (Instant Reservation)',
        amount: service.numericPrice,
        status: 'Confirmed',
        progress: 100,
        description: `Reserved ${service.title} at ${service.location}. VIP Confirmation Code: NX-${Math.floor(1000 + Math.random() * 9000)}.`,
      })
    );
    setBookedIds([...bookedIds, service.id]);
    alert(`🎉 Reservation Confirmed!\n\n${service.title} has been booked and added to your Projects & Dashboard!`);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Explore Services & Spaces</Text>
        <Text style={[styles.headerSub, { color: colors.textSecondary }]}>
          Premium executive venues, studio production suites and VIP fleet charters.
        </Text>
      </View>

      {/* Category Filter Switcher */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScroll}
      >
        {SERVICE_CATEGORIES.map((cat) => {
          const isSelected = selectedCat === cat;
          return (
            <TouchableOpacity
              key={cat}
              activeOpacity={0.7}
              onPress={() => setSelectedCat(cat)}
              style={[
                styles.categoryChip,
                {
                  backgroundColor: isSelected ? colors.primary : colors.surface,
                  borderColor: isSelected ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  {
                    color: isSelected ? '#FFFFFF' : colors.textSecondary,
                    fontWeight: isSelected ? '700' : '500',
                  },
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Catalog Cards */}
      <View style={styles.catalogList}>
        {filteredCatalog.map((item) => {
          const isAlreadyBooked = bookedIds.includes(item.id);
          return (
            <View
              key={item.id}
              style={[
                styles.card,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <Image source={{ uri: item.image }} style={styles.cardImage} />

              <View style={styles.cardBody}>
                <View style={styles.cardHeaderRow}>
                  <View style={[styles.badge, { backgroundColor: colors.primaryLight }]}>
                    <Text style={[styles.badgeLabel, { color: colors.primary }]}>{item.category}</Text>
                  </View>
                  <Text style={[styles.priceTag, { color: colors.text }]}>{item.price}</Text>
                </View>

                <Text style={[styles.itemTitle, { color: colors.text }]}>{item.title}</Text>

                <View style={styles.locRow}>
                  <MaterialCommunityIcons name="map-marker-outline" size={15} color={colors.textMuted} />
                  <Text style={[styles.locText, { color: colors.textMuted }]}>{item.location}</Text>
                </View>

                <View style={styles.ratingRow}>
                  <MaterialCommunityIcons name="star" size={14} color="#F59E0B" />
                  <Text style={[styles.ratingText, { color: colors.textSecondary }]}>{item.rating}</Text>
                </View>

                {/* Amenities */}
                <View style={styles.amenitiesWrap}>
                  {item.amenities.map((amenity, idx) => (
                    <View
                      key={idx}
                      style={[styles.amenityPill, { backgroundColor: colors.surfaceElevated }]}
                    >
                      <MaterialCommunityIcons name="check" size={12} color="#10B981" />
                      <Text style={[styles.amenityText, { color: colors.textSecondary }]}>{amenity}</Text>
                    </View>
                  ))}
                </View>

                {/* Book Action */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => handleBookNow(item)}
                  style={[
                    styles.bookBtn,
                    {
                      backgroundColor: isAlreadyBooked ? '#10B981' : colors.primary,
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={isAlreadyBooked ? 'check-circle' : 'calendar-check'}
                    size={18}
                    color="#FFFFFF"
                  />
                  <Text style={styles.bookBtnText}>
                    {isAlreadyBooked ? 'Booked Successfully' : 'Instant Reservation'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  categoryScroll: {
    gap: 8,
    paddingBottom: 4,
    marginBottom: 16,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 12,
  },
  catalogList: {
    gap: 16,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 160,
  },
  cardBody: {
    padding: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  priceTag: {
    fontSize: 16,
    fontWeight: '800',
  },
  itemTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6,
  },
  locRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  locText: {
    fontSize: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 10,
  },
  ratingText: {
    fontSize: 12,
  },
  amenitiesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  amenityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  amenityText: {
    fontSize: 11,
  },
  bookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 46,
    borderRadius: 12,
    gap: 8,
  },
  bookBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
