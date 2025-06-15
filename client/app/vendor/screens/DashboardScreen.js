import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions, Platform, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Header from '../components/Header';
import StatCard from '../components/StatCard';
import { getTransactionsByVendor } from '../../../utils/api'; // Update path accordingly

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const vendorId = await AsyncStorage.getItem('UniqueID');
        if (token && vendorId) {
          const txData = await getTransactionsByVendor(token, vendorId);
          setTransactions(txData);
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#6366F1', '#8B5CF6', '#EC4899']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      >
        <Header />
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
              value={(transactions?.length || 0).toString()}
              trend={`+${transactions.length}`}
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

        {/* Quick Actions */}
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

        {/* Recent Activity Section */}
        <View style={styles.recentActivity}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityCard}>
            {loading ? (
              <ActivityIndicator size="large" color="#6366F1" />
            ) : transactions.length === 0 ? (
              <Text style={{ textAlign: 'center', color: '#64748B' }}>No recent transactions</Text>
            ) : (
              transactions.map((tx) => (
                <View key={tx._id} style={styles.activityItem}>
                  <View style={styles.activityDot} />
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle}>{tx.remarks}</Text>
                    <Text style={styles.activityTime}>
                      {new Date(tx.createdAt).toLocaleString()}
                    </Text>
                  </View>
                  <Text style={styles.activityAmount}>₹{tx.amount}</Text>
                </View>
              ))
            )}
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
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
    shadowOffset: { width: 0, height: 4 },
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
    shadowOffset: { width: 0, height: 4 },
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
  bottomSpacing: {
    height: 100,
  },
});
