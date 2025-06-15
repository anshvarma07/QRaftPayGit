import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const cardWidth = (width - 60) / 2; // Account for padding and gap

const StatCard = ({ 
  title, 
  value, 
  trend, 
  trendUp = true, 
  icon, 
  gradient = ['#6366F1', '#8B5CF6'],
  onPress 
}) => {
  return (
    <TouchableOpacity 
      style={styles.cardContainer} 
      activeOpacity={0.9}
      onPress={onPress}
    >
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* Background Pattern */}
        <View style={styles.backgroundPattern}>
          <View style={styles.circle1} />
          <View style={styles.circle2} />
        </View>

        {/* Card Content */}
        <View style={styles.cardContent}>
          {/* Header with Icon */}
          <View style={styles.cardHeader}>
            {icon && <Text style={styles.icon}>{icon}</Text>}
            <View style={styles.trendContainer}>
              {trend && (
                <View style={styles.trendBadge}>
                  <Text style={styles.trendText}>
                    {trendUp ? '↗' : '↘'} {trend}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Main Value */}
          <View style={styles.valueContainer}>
            <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>
              {value}
            </Text>
          </View>

          {/* Title */}
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
        </View>

        {/* Shimmer Effect Overlay */}
        <View style={styles.shimmerOverlay} />
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: cardWidth,
    height: 140,
    marginBottom: 0,
  },
  card: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  circle1: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
    top: -20,
    right: -20,
  },
  circle2: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    bottom: -10,
    left: -10,
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
    opacity: 0.3,
  },
  cardContent: {
    flex: 1,
    zIndex: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  icon: {
    fontSize: 20,
    opacity: 0.9,
  },
  trendContainer: {
    alignItems: 'flex-end',
  },
  trendBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  trendText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  valueContainer: {
    flex: 1,
    justifyContent: 'center',
    marginVertical: 4,
  },
  value: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 16,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
});

export default StatCard;