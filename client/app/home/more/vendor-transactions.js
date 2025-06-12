import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  Share,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Receipt,
  Calendar,
  DollarSign,
  Share2,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function VendorTransactionsPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const transactionsParam = params.transactions;
  const vendorNameParam = params.vendorName;

  const [transactions, setTransactions] = useState([]);
  const [vendorName, setVendorName] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    if (transactionsParam) {
      try {
        const parsedTransactions = JSON.parse(transactionsParam);
        setTransactions(parsedTransactions);
        setVendorName(vendorNameParam || 'Unknown Vendor');

        const total = parsedTransactions.reduce((sum, transaction) => {
          return sum + parseFloat(transaction.amount || 0);
        }, 0);
        setTotalAmount(total);
      } catch (error) {
        console.error('Error parsing transactions:', error);
        Alert.alert('Error', 'Failed to load transaction details');
      }
    }
  }, [transactionsParam, vendorNameParam]);

  const handleBack = () => {
    router.back();
  };

  const handleTransactionPress = (transaction) => {
    Alert.alert(
      'Transaction Details',
      `Amount: ${formatCurrency(transaction.amount)}\nDate: ${formatDateTime(transaction.createdAt || transaction.date)}\nRemarks: ${transaction.remarks || 'No remarks'}`,
      [
        { text: 'OK', style: 'default' },
        {
          text: 'Share Receipt',
          onPress: () => shareTransactionDetails(transaction),
        },
      ]
    );
  };

  const shareTransactionDetails = async (transaction) => {
    try {
      const message = `Transaction Receipt\n\nVendor: ${vendorName}\nAmount: ${formatCurrency(transaction.amount)}\nDate: ${formatDateTime(transaction.createdAt || transaction.date)}\nTransaction ID: ${transaction._id || transaction.id}\nRemarks: ${transaction.remarks || 'No remarks'}\n\nPowered by QRaftPay`;
      
      await Share.share({
        message: message,
        title: 'Transaction Receipt',
      });
    } catch (error) {
      console.error('Error sharing transaction:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount) => {
    return `$${parseFloat(amount || 0).toFixed(2)}`;
  };

  const getTransactionIcon = (transaction) => {
    const status = transaction.status || 'completed';
    switch (status.toLowerCase()) {
      case 'completed':
      case 'success':
        return <CheckCircle size={20} color="#4CAF50" />;
      case 'pending':
        return <Clock size={20} color="#FF9800" />;
      case 'failed':
        return <AlertCircle size={20} color="#F44336" />;
      default:
        return <Receipt size={20} color="#2196F3" />;
    }
  };

  const getStatusColor = (transaction) => {
    const status = transaction.status || 'completed';
    switch (status.toLowerCase()) {
      case 'completed':
      case 'success':
        return '#4CAF50';
      case 'pending':
        return '#FF9800';
      case 'failed':
        return '#F44336';
      default:
        return '#2196F3';
    }
  };

  const groupTransactionsByDate = (transactions) => {
    const grouped = transactions.reduce((acc, transaction) => {
      const date = formatDate(transaction.createdAt || transaction.date);
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(transaction);
      return acc;
    }, {});

    const sortedDates = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));
    
    const result = {};
    sortedDates.forEach(date => {
      result[date] = grouped[date].sort((a, b) => 
        new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)
      );
    });
    
    return result;
  };

  const groupedTransactions = groupTransactionsByDate(transactions);

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
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {vendorName}
            </Text>
            <Text style={styles.headerSubtitle}>
              {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
            </Text>
          </View>
          <TouchableOpacity style={styles.shareButton}>
            <Share2 size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Summary Card */}
        <View style={styles.summaryContainer}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
            style={styles.summaryCard}
          >
            <View style={styles.summaryContent}>
              <View style={styles.summaryItem}>
                <DollarSign size={24} color="#4CAF50" />
                <Text style={styles.summaryValue}>{formatCurrency(totalAmount)}</Text>
                <Text style={styles.summaryLabel}>Total Spent</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Receipt size={24} color="#2196F3" />
                <Text style={styles.summaryValue}>{transactions.length}</Text>
                <Text style={styles.summaryLabel}>Transactions</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Calendar size={24} color="#FF9800" />
                <Text style={styles.summaryValue}>
                  {transactions.length > 0 ? formatDate(transactions[0].createdAt || transactions[0].date) : '-'}
                </Text>
                <Text style={styles.summaryLabel}>Last Transaction</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Transactions List */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {Object.keys(groupedTransactions).length === 0 ? (
            <View style={styles.emptyState}>
              <Receipt size={48} color="rgba(255, 255, 255, 0.6)" />
              <Text style={styles.emptyTitle}>No Transactions</Text>
              <Text style={styles.emptySubtitle}>
                No transactions found for this vendor.
              </Text>
            </View>
          ) : (
            Object.entries(groupedTransactions).map(([date, dayTransactions]) => (
              <View key={date} style={styles.dateGroup}>
                <Text style={styles.dateHeader}>{date}</Text>
                {dayTransactions.map((transaction, index) => (
                  <TouchableOpacity
                    key={transaction._id || transaction.id || index}
                    style={styles.transactionCard}
                    onPress={() => handleTransactionPress(transaction)}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.08)']}
                      style={styles.transactionGradient}
                    >
                      <View style={styles.transactionContent}>
                        <View style={styles.transactionLeft}>
                          <View style={styles.transactionIcon}>
                            {getTransactionIcon(transaction)}
                          </View>
                          <View style={styles.transactionDetails}>
                            <Text style={styles.transactionAmount}>
                              {formatCurrency(transaction.amount)}
                            </Text>
                            <Text style={styles.transactionTime}>
                              {new Date(transaction.createdAt || transaction.date).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </Text>
                            {transaction.remarks && (
                              <Text style={styles.transactionRemarks} numberOfLines={1}>
                                {transaction.remarks}
                              </Text>
                            )}
                          </View>
                        </View>
                        <View style={styles.transactionRight}>
                          <View style={[
                            styles.statusBadge,
                            { backgroundColor: getStatusColor(transaction) }
                          ]}>
                            <Text style={styles.statusText}>
                              {(transaction.status || 'completed').toUpperCase()}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>
            ))
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
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: 50,
      paddingBottom: 16,
    },
    backButton: {
      padding: 8,
      marginRight: 8,
    },
    headerTitleContainer: {
      flex: 1,
      marginLeft: 8,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#fff',
    },
    headerSubtitle: {
      fontSize: 14,
      color: 'rgba(255, 255, 255, 0.8)',
      marginTop: 2,
    },
    shareButton: {
      padding: 8,
      marginLeft: 8,
    },
    summaryContainer: {
      paddingHorizontal: 16,
      marginBottom: 16,
    },
    summaryCard: {
      borderRadius: 16,
      padding: 20,
      backdropFilter: 'blur(10px)',
    },
    summaryContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    summaryItem: {
      flex: 1,
      alignItems: 'center',
    },
    summaryValue: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#fff',
      marginTop: 8,
      marginBottom: 4,
    },
    summaryLabel: {
      fontSize: 12,
      color: 'rgba(255, 255, 255, 0.8)',
      textAlign: 'center',
    },
    summaryDivider: {
      width: 1,
      height: 40,
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      marginHorizontal: 16,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 16,
      paddingBottom: 20,
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 60,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: '#fff',
      marginTop: 16,
      marginBottom: 8,
    },
    emptySubtitle: {
      fontSize: 14,
      color: 'rgba(255, 255, 255, 0.7)',
      textAlign: 'center',
      paddingHorizontal: 32,
    },
    dateGroup: {
      marginBottom: 24,
    },
    dateHeader: {
      fontSize: 16,
      fontWeight: '600',
      color: '#fff',
      marginBottom: 12,
      paddingLeft: 4,
    },
    transactionCard: {
      marginBottom: 12,
      borderRadius: 12,
      overflow: 'hidden',
    },
    transactionGradient: {
      borderRadius: 12,
    },
    transactionContent: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
    },
    transactionLeft: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    transactionIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    transactionDetails: {
      flex: 1,
    },
    transactionAmount: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#fff',
      marginBottom: 2,
    },
    transactionTime: {
      fontSize: 12,
      color: 'rgba(255, 255, 255, 0.7)',
      marginBottom: 2,
    },
    transactionRemarks: {
      fontSize: 12,
      color: 'rgba(255, 255, 255, 0.6)',
      fontStyle: 'italic',
    },
    transactionRight: {
      alignItems: 'flex-end',
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      minWidth: 70,
      alignItems: 'center',
    },
    statusText: {
      fontSize: 10,
      fontWeight: '600',
      color: '#fff',
    },
  });