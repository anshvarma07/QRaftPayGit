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
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
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
          <ArrowLeft size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transactions</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Stats Section */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <DollarSign size={18} color="#fff" />
          </View>
          <Text style={styles.statValue}>{formatCurrency(totalAmount)}</Text>
          <Text style={styles.statLabel}>Total Spent</Text>
        </View>
        
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Receipt size={18} color="#fff" />
          </View>
          <Text style={styles.statValue}>{totalTransactions}</Text>
          <Text style={styles.statLabel}>Transactions</Text>
        </View>
        
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Store size={18} color="#fff" />
          </View>
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
            tintColor="#2563eb"
            colors={['#2563eb']}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {Object.keys(groupedTransactions).length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Receipt size={48} color="rgba(255, 255, 255, 0.6)" />
            </View>
            <Text style={styles.emptyTitle}>No Transactions Yet</Text>
            <Text style={styles.emptySubtitle}>
              Your transaction history will appear here once you start making purchases.
            </Text>
          </View>
        ) : (
          <View style={styles.vendorsList}>
            {Object.values(groupedTransactions)
              .sort((a, b) => b.totalAmount - a.totalAmount)
              .map((vendorData, index) => (
              <TouchableOpacity
                key={vendorData.vendorId}
                style={styles.vendorCard}
                onPress={() => handleVendorPress(vendorData)}
                activeOpacity={0.7}
              >
                <View style={styles.vendorHeader}>
                  <View style={styles.vendorInfo}>
                    <View style={styles.vendorIconContainer}>
                      <Store size={20} color="#374151" />
                    </View>
                    <View style={styles.vendorDetails}>
                      <Text style={styles.vendorName}>{vendorData.vendorName}</Text>
                      <Text style={styles.transactionCount}>
                        {vendorData.transactionCount} transaction{vendorData.transactionCount !== 1 ? 's' : ''}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.amountContainer}>
                    <Text style={styles.totalAmount}>
                      {formatCurrency(vendorData.totalAmount)}
                    </Text>
                    <ChevronRight size={16} color="#9ca3af" />
                  </View>
                </View>
                
                <View style={styles.vendorFooter}>
                  <Text style={styles.latestTransaction}>
                  {(() => {const sortedTransactions = [...vendorData.transactions].sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));const latest = sortedTransactions[0];return (<Text style={styles.latestTransaction}>Last: {formatDate(latest?.createdAt || latest?.date)} • {formatCurrency(latest?.amount)}</Text>);})()}
                  </Text>
                </View>
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
    paddingTop: StatusBar.currentHeight + 16,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },

  // Stats
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },

  // Scroll View
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  // Vendor Cards
  vendorsList: {
    gap: 12,
  },
  vendorCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  vendorHeader: {
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
  vendorIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  vendorDetails: {
    flex: 1,
  },
  vendorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  transactionCount: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#059669',
  },
  vendorFooter: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  latestTransaction: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 20,
  },

  // Loading
  loadingText: {
    fontSize: 14,
    color: '#fff',
    marginTop: 12,
    fontWeight: '500',
  },
});