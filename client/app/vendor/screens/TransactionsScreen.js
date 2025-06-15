// screens/TransactionsScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import Header from '../components/Header';
import { getTransactionsByVendor } from '../../../utils/api';
import TransactionBox from '../components/TransactionBox';

const { width, height } = Dimensions.get('window');

export default function TransactionsScreen() {
  const [transactions, setTransactions] = useState([]);
  const [grouped, setGrouped] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);

  const fetchTransactions = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const vendorId = await AsyncStorage.getItem('UniqueID');
      if (token && vendorId) {
        const txData = await getTransactionsByVendor(token, vendorId);
        setTransactions(txData);

        const groupedByBuyer = {};
        let revenue = 0;
        
        txData.forEach((tx) => {
          const buyerId = tx.buyerId._id;
          if (!groupedByBuyer[buyerId]) groupedByBuyer[buyerId] = [];
          groupedByBuyer[buyerId].push(tx);
          revenue += tx.amount;
        });
        
        setGrouped(groupedByBuyer);
        setTotalRevenue(revenue);
        setTotalCustomers(Object.keys(groupedByBuyer).length);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchTransactions();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Text style={styles.emptyIcon}>📊</Text>
      </View>
      <Text style={styles.emptyTitle}>No Transactions Yet</Text>
      <Text style={styles.emptySubtitle}>
        Your customer transactions will appear here once you start receiving payments.
      </Text>
    </View>
  );

  const renderStatsCards = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statCard}>
        <Text style={styles.statValue}>₹{totalRevenue.toLocaleString()}</Text>
        <Text style={styles.statLabel}>Total Revenue</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={styles.statValue}>{totalCustomers}</Text>
        <Text style={styles.statLabel}>Active Customers</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={styles.statValue}>{transactions.length}</Text>
        <Text style={styles.statLabel}>Total Transactions</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6366F1" />
      
      {/* Header Section */}
      <LinearGradient
        colors={['#6366F1', '#8B5CF6', '#EC4899']}
        style={styles.gradient}
      >
        <Header />
        <View style={styles.headerContent}>
          <Text style={styles.heading}>Transaction Overview</Text>
          <Text style={styles.subheading}>
            Track your sales and customer activity
          </Text>
        </View>
      </LinearGradient>

      {/* Main Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Loading transactions...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#6366F1']}
              tintColor="#6366F1"
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Stats Cards */}
          {totalCustomers > 0 && renderStatsCards()}

          {/* Section Header */}
          {totalCustomers > 0 && (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Customer Transactions</Text>
              <Text style={styles.sectionSubtitle}>
                Tap on any customer to view detailed transaction history
              </Text>
            </View>
          )}

          {/* Transaction Boxes or Empty State */}
          {Object.keys(grouped).length === 0 ? (
            renderEmptyState()
          ) : (
            <View style={styles.transactionsList}>
              {Object.keys(grouped).map((buyerId) => (
                <TransactionBox
                  key={buyerId}
                  buyer={grouped[buyerId][0].buyerId}
                  transactions={grouped[buyerId]}
                />
              ))}
            </View>
          )}

          {/* Bottom Padding */}
          <View style={styles.bottomPadding} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  gradient: {
    paddingTop: StatusBar.currentHeight + 10 || 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerContent: {
    marginTop: 10,
  },
  heading: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subheading: {
    fontSize: 16,
    color: '#E2E8F0',
    fontWeight: '500',
    opacity: 0.9,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 10,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  transactionsList: {
    paddingTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 80,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyIcon: {
    fontSize: 32,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
  },
  bottomPadding: {
    height: 32,
  },
});