import React from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient'; // or react-native-linear-gradient
import Header from '../components/Header';
import StatCard from '../components/StatCard';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#6366F1', '#8B5CF6', '#EC4899']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      >
        <Header />
        
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Welcome Back 👋</Text>
          <Text style={styles.subtitle}>Here's what's happening with your business today</Text>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Grid */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <StatCard 
              title="Total Sales" 
              value="₹45,230" 
              trend="+12.5%"
              trendUp={true}
              icon="💰"
              gradient={['#10B981', '#059669']}
            />
            <StatCard 
              title="Today's Sales" 
              value="₹2,150" 
              trend="+8.2%"
              trendUp={true}
              icon="📈"
              gradient={['#3B82F6', '#1D4ED8']}
            />
          </View>
          
          <View style={styles.statsRow}>
            <StatCard 
              title="Transactions" 
              value="143" 
              trend="+23"
              trendUp={true}
              icon="💳"
              gradient={['#8B5CF6', '#7C3AED']}
            />
            <StatCard 
              title="Rating" 
              value="Coming Soon" 
              trend="Coming Soon"
              trendUp={true}
              icon="⭐"
              gradient={['#F59E0B', '#D97706']}
            />
          </View>
        </View>

        {/* Quick Actions Section */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionButtons}>
            <View style={styles.actionButton}>
              <View style={styles.actionIcon}>
                <Text style={styles.actionEmoji}>📊</Text>
              </View>
              <Text style={styles.actionText}>View Reports</Text>
            </View>
            
            <View style={styles.actionButton}>
              <View style={styles.actionIcon}>
                <Text style={styles.actionEmoji}>🔔</Text>
              </View>
              <Text style={styles.actionText}>Notifications</Text>
            </View>
            
            <View style={styles.actionButton}>
              <View style={styles.actionIcon}>
                <Text style={styles.actionEmoji}>⚙️</Text>
              </View>
              <Text style={styles.actionText}>Settings</Text>
            </View>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.recentActivity}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityCard}>
            <View style={styles.activityItem}>
              <View style={styles.activityDot} />
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>New order received</Text>
                <Text style={styles.activityTime}>2 minutes ago</Text>
              </View>
              <Text style={styles.activityAmount}>₹850</Text>
            </View>
            
            <View style={styles.activityItem}>
              <View style={[styles.activityDot, { backgroundColor: '#3B82F6' }]} />
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Payment completed</Text>
                <Text style={styles.activityTime}>15 minutes ago</Text>
              </View>
              <Text style={styles.activityAmount}>₹1,200</Text>
            </View>
            
            <View style={styles.activityItem}>
              <View style={[styles.activityDot, { backgroundColor: '#F59E0B' }]} />
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Customer review</Text>
                <Text style={styles.activityTime}>1 hour ago</Text>
              </View>
              <Text style={styles.activityRating}>5.0 ⭐</Text>
            </View>
          </View>
        </View>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  gradientBackground: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 30,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  welcomeSection: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#E2E8F0',
    fontWeight: '500',
    opacity: 0.9,
  },
  scrollView: {
    flex: 1,
    marginTop: 20,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  statsContainer: {
    marginBottom: 32,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  quickActionsContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionEmoji: {
    fontSize: 24,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
  },
  recentActivity: {
    marginBottom: 32,
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  activityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    marginRight: 16,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 14,
    color: '#64748B',
  },
  activityAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10B981',
  },
  activityRating: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F59E0B',
  },
  bottomSpacing: {
    height: 100, // Space for bottom tab navigator
  },
});