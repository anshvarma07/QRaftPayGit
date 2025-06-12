import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ArrowLeft,
  Receipt,
  Calendar,
  DollarSign,
  Store,
  ChevronRight,
  AlertCircle,
  TrendingUp,
  Filter,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getTransactions } from '../../../utils/api';

export default function TransactionsPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState([]);
  const [groupedTransactions, setGroupedTransactions] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalTransactions, setTotalTransactions] = useState(0);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Authentication token not found');
        router.replace('/login');
        return;
      }

      const response = await getTransactions(token);
      // Handle the API response structure: { success: true, data: [...] }
      const transactionsData = response.data || response.transactions || response;
      
      setTransactions(transactionsData);
      groupTransactionsByVendor(transactionsData);
      calculateStats(transactionsData);
    } catch (error) {
      console.error('Error loading transactions:', error);
      Alert.alert(
        'Error', 
        error.response?.data?.message || 'Failed to load transactions'
      );
    } finally {
      setLoading(false);
    }
  };

  const groupTransactionsByVendor = (transactionsData) => {
    const grouped = transactionsData.reduce((acc, transaction) => {
      // Handle the new API structure where vendor info is nested in vendorId
      const vendorId = transaction.vendorId?._id || transaction.vendorId || 'unknown';
      const vendorName = transaction.vendorId?.name || transaction.vendorName || `Vendor ${vendorId}`;
      
      if (!acc[vendorId]) {
        acc[vendorId] = {
          vendorId,
          vendorName,
          transactions: [],
          totalAmount: 0,
          transactionCount: 0,
        };
      }
      
      acc[vendorId].transactions.push(transaction);
      acc[vendorId].totalAmount += parseFloat(transaction.amount || 0);
      acc[vendorId].transactionCount += 1;
      
      return acc;
    }, {});

    setGroupedTransactions(grouped);
  };

  const calculateStats = (transactionsData) => {
    const total = transactionsData.reduce((sum, transaction) => {
      return sum + parseFloat(transaction.amount || 0);
    }, 0);
    
    setTotalAmount(total);
    setTotalTransactions(transactionsData.length);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
  };

  const handleBack = () => {
    router.back();
  };

  const handleVendorPress = (vendorData) => {
    router.push({
      pathname: 'home/more/vendor-transactions',
      params: {
        vendorId: vendorData.vendorId,
        vendorName: vendorData.vendorName,
        transactions: JSON.stringify(vendorData.transactions),
      },
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount || 0).toFixed(2)}`;
  };

  if (loading) {
    return (
      <LinearGradient
        colors={['#667eea', '#764ba2', '#f093fb']}
        style={[styles.container, styles.centerContent]}
      >
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Loading transactions...</Text>
      </LinearGradient>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <LinearGradient
        colors={['#667eea', '#764ba2', '#f093fb']}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Your Transactions</Text>
          <TouchableOpacity style={styles.filterButton}>
            <Filter size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <DollarSign size={20} color="#4CAF50" />
            <Text style={styles.statValue}>{formatCurrency(totalAmount)}</Text>
            <Text style={styles.statLabel}>Total Spent</Text>
          </View>
          <View style={styles.statCard}>
            <Receipt size={20} color="#2196F3" />
            <Text style={styles.statValue}>{totalTransactions}</Text>
            <Text style={styles.statLabel}>Transactions</Text>
          </View>
          <View style={styles.statCard}>
            <Store size={20} color="#FF9800" />
            <Text style={styles.statValue}>{Object.keys(groupedTransactions).length}</Text>
            <Text style={styles.statLabel}>Vendors</Text>
          </View>
        </View>

        {/* Transactions List */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#fff"
              colors={['#fff']}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {Object.keys(groupedTransactions).length === 0 ? (
            <View style={styles.emptyState}>
              <AlertCircle size={48} color="rgba(255, 255, 255, 0.6)" />
              <Text style={styles.emptyTitle}>No Transactions Found</Text>
              <Text style={styles.emptySubtitle}>
                You haven't made any transactions yet.
              </Text>
            </View>
          ) : (
            <View style={styles.vendorsList}>
              <Text style={styles.sectionTitle}>Transactions by Vendor</Text>
              {Object.values(groupedTransactions)
                .sort((a, b) => b.totalAmount - a.totalAmount) // Sort by total amount descending
                .map((vendorData, index) => (
                <TouchableOpacity
                  key={vendorData.vendorId}
                  style={styles.vendorCard}
                  onPress={() => handleVendorPress(vendorData)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
                    style={styles.vendorCardGradient}
                  >
                    <View style={styles.vendorCardContent}>
                      <View style={styles.vendorInfo}>
                        <View style={styles.vendorIcon}>
                          <Store size={24} color="#fff" />
                        </View>
                        <View style={styles.vendorDetails}>
                          <Text style={styles.vendorName}>{vendorData.vendorName}</Text>
                          <Text style={styles.vendorStats}>
                            {vendorData.transactionCount} transaction{vendorData.transactionCount !== 1 ? 's' : ''}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.vendorAmount}>
                        <Text style={styles.vendorTotal}>
                          {formatCurrency(vendorData.totalAmount)}
                        </Text>
                        <ChevronRight size={20} color="rgba(255, 255, 255, 0.7)" />
                      </View>
                    </View>
                    
                    {/* Recent Transaction Preview */}
                    {vendorData.transactions.length > 0 && (
                      <View style={styles.recentTransaction}>
                        <Text style={styles.recentLabel}>Latest:</Text>
                        <Text style={styles.recentDate}>
                          {formatDate(vendorData.transactions[0]?.createdAt)}
                        </Text>
                        <Text style={styles.recentAmount}>
                          {formatCurrency(vendorData.transactions[0]?.amount)}
                        </Text>
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: StatusBar.currentHeight + 20,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  filterButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },

  // Stats
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },

  // Scroll View
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },

  // Section
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
  },

  // Vendor Cards
  vendorsList: {
    marginBottom: 20,
  },
  vendorCard: {
    marginBottom: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  vendorCardGradient: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  vendorCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  vendorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  vendorIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 12,
    borderRadius: 16,
    marginRight: 16,
  },
  vendorDetails: {
    flex: 1,
  },
  vendorName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  vendorStats: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  vendorAmount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vendorTotal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    marginRight: 8,
  },

  // Recent Transaction
  recentTransaction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  recentLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '600',
  },
  recentDate: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    flex: 1,
    textAlign: 'center',
  },
  recentAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4CAF50',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 22,
  },

  // Loading
  loadingText: {
    fontSize: 16,
    color: '#fff',
    marginTop: 16,
  },
});