// screens/TransactionDetail.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  Dimensions,
  Modal,
  TextInput,
  Alert,
  Animated,
  Easing,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTransactionsByVendor, settleUpCustomer } from '../../../utils/api';

const { width } = Dimensions.get('window');

export default function TransactionDetail() {
  const { buyerId, buyerName, buyerEmail } = useLocalSearchParams();
  const router = useRouter();
  const [buyerTransactions, setBuyerTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [averageTransaction, setAverageTransaction] = useState(0);
  
  // Settle up modal states
  const [settleModalVisible, setSettleModalVisible] = useState(false);
  const [settleAmount, setSettleAmount] = useState('');
  const [settleRemarks, setSettleRemarks] = useState('');
  const [settlingUp, setSettlingUp] = useState(false);
  const [slideAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0));

  const fetchBuyerTx = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const vendorId = await AsyncStorage.getItem('UniqueID');

      const allTx = await getTransactionsByVendor(token, vendorId);
      const filtered = allTx.filter((tx) => tx.buyerId._id === buyerId);
      
      // Sort by date (newest first)
      const sortedTx = filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      setBuyerTransactions(sortedTx);
      
      // Calculate statistics
      const total = sortedTx.reduce((sum, tx) => sum + tx.amount, 0);
      setTotalAmount(total);
      setAverageTransaction(sortedTx.length > 0 ? total / sortedTx.length : 0);
    } catch (error) {
      console.error('Error fetching buyer transactions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchBuyerTx();
  }, []);

  useEffect(() => {
    fetchBuyerTx();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTransactionIcon = (amount) => {
    if (amount >= 1000) return '💰';
    if (amount >= 500) return '💵';
    return '💳';
  };

  const openSettleModal = () => {
    setSettleModalVisible(true);
    setSettleAmount(totalAmount.toString());
    
    // Animate modal appearance
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
    ]).start();
  };

  const closeSettleModal = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setSettleModalVisible(false);
      setSettleAmount('');
      setSettleRemarks('');
    });
  };

  const handleSettleUp = async () => {
    const amount = parseFloat(settleAmount);
    
    if (!amount || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount greater than 0');
      return;
    }
    
    if (amount > totalAmount) {
      Alert.alert('Invalid Amount', `Amount cannot exceed ₹${totalAmount.toLocaleString()}`);
      return;
    }

    Alert.alert(
      'Confirm Settlement',
      `Are you sure you want to settle ₹${amount.toLocaleString()} with ${buyerName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Settle',
          style: 'destructive',
          onPress: async () => {
            setSettlingUp(true);
            try {
              const token = await AsyncStorage.getItem('token');
              const vendorId = await AsyncStorage.getItem('UniqueID');
              
              await settleUpCustomer(token, vendorId, {
                customerId: buyerId, // This is buyer._id from route params
                amount: amount,
                remarks: settleRemarks || 'Settlement payment'
              });
              
              Alert.alert('Success', 'Settlement completed successfully!');
              closeSettleModal();
              fetchBuyerTx(); // Refresh data
            } catch (error) {
              Alert.alert('Error', 'Failed to process settlement. Please try again.');
              console.error('Settlement error:', error);
            } finally {
              setSettlingUp(false);
            }
          }
        }
      ]
    );
  };

  const renderTransactionItem = ({ item, index }) => (
    <View style={[styles.transactionCard, { marginTop: index === 0 ? 16 : 0 }]}>
      <View style={styles.transactionHeader}>
        <View style={styles.iconContainer}>
          <Text style={styles.transactionIcon}>{getTransactionIcon(item.amount)}</Text>
        </View>
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionRemark} numberOfLines={2}>
            {item.remarks || 'No remarks'}
          </Text>
          <View style={styles.transactionMeta}>
            <Text style={styles.transactionDate}>{formatDate(item.createdAt)}</Text>
            <Text style={styles.transactionTime}>{formatTime(item.createdAt)}</Text>
          </View>
        </View>
        <View style={styles.amountContainer}>
          <Text style={styles.transactionAmount}>₹{item.amount.toLocaleString()}</Text>
        </View>
      </View>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Customer Info Card */}
      <View style={styles.customerCard}>
        <View style={styles.customerHeader}>
          <View style={styles.customerAvatar}>
            <Text style={styles.avatarText}>
              {buyerName?.charAt(0)?.toUpperCase() || 'U'}
            </Text>
          </View>
          <View style={styles.customerInfo}>
            <Text style={styles.customerName}>{buyerName}</Text>
            <Text style={styles.customerEmail}>{buyerEmail}</Text>
          </View>
        </View>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>₹{totalAmount.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Total Due</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{buyerTransactions.length}</Text>
          <Text style={styles.statLabel}>Transactions</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>₹{Math.round(averageTransaction).toLocaleString()}</Text>
          <Text style={styles.statLabel}>Average</Text>
        </View>
      </View>

      {/* Settle Up Button */}
      {totalAmount > 0 && (
        <TouchableOpacity style={styles.settleButton} onPress={openSettleModal}>
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.settleButtonGradient}
          >
            <Text style={styles.settleButtonIcon}>💸</Text>
            <Text style={styles.settleButtonText}>Settle Up</Text>
            <Text style={styles.settleButtonAmount}>₹{totalAmount.toLocaleString()}</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* Section Title */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Transaction History</Text>
        <Text style={styles.sectionSubtitle}>
          {buyerTransactions.length} transaction{buyerTransactions.length !== 1 ? 's' : ''}
        </Text>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Text style={styles.emptyIcon}>📋</Text>
      </View>
      <Text style={styles.emptyTitle}>No Transactions Found</Text>
      <Text style={styles.emptySubtitle}>
        This customer hasn't made any transactions yet.
      </Text>
    </View>
  );

  const renderSettleModal = () => (
    <Modal
      visible={settleModalVisible}
      transparent={true}
      animationType="none"
      onRequestClose={closeSettleModal}
    >
      <View style={styles.modalOverlay}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [300, 0],
                  }),
                },
                {
                  scale: scaleAnim,
                },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.modalHeader}
          >
            <Text style={styles.modalTitle}>💸 Settle Up</Text>
            <Text style={styles.modalSubtitle}>with {buyerName}</Text>
          </LinearGradient>

          <View style={styles.modalContent}>
            <View style={styles.amountSection}>
              <Text style={styles.inputLabel}>Settlement Amount</Text>
              <View style={styles.amountInputContainer}>
                <Text style={styles.currencySymbol}>₹</Text>
                <TextInput
                  style={styles.amountInput}
                  value={settleAmount}
                  onChangeText={setSettleAmount}
                  placeholder="0"
                  keyboardType="numeric"
                  maxLength={10}
                />
              </View>
              <Text style={styles.amountLimit}>
                Max: ₹{totalAmount.toLocaleString()}
              </Text>
            </View>

            <View style={styles.remarksSection}>
              <Text style={styles.inputLabel}>Remarks (Optional)</Text>
              <TextInput
                style={styles.remarksInput}
                value={settleRemarks}
                onChangeText={setSettleRemarks}
                placeholder="Enter settlement remarks..."
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={closeSettleModal}
                disabled={settlingUp}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.confirmButton, settlingUp && styles.confirmButtonDisabled]}
                onPress={handleSettleUp}
                disabled={settlingUp}
              >
                {settlingUp ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Text style={styles.confirmButtonText}>Settle</Text>
                    <Text style={styles.confirmButtonIcon}>✓</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6366F1" />
      
      {/* Header */}
      <LinearGradient
        colors={['#6366F1', '#8B5CF6']}
        style={styles.gradient}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Customer Details</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Loading transactions...</Text>
        </View>
      ) : (
        <FlatList
          data={buyerTransactions}
          keyExtractor={(item) => item._id}
          renderItem={renderTransactionItem}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#6366F1']}
              tintColor="#6366F1"
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {renderSettleModal()}
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
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  headerContainer: {
    paddingHorizontal: 16,
  },
  customerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  customerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  customerEmail: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
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
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settleButton: {
    marginTop: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
  },
  settleButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  settleButtonIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  settleButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  settleButtonAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  sectionHeader: {
    marginTop: 32,
    marginBottom: 8,
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
  transactionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionIcon: {
    fontSize: 20,
  },
  transactionInfo: {
    flex: 1,
    marginRight: 12,
  },
  transactionRemark: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 6,
  },
  transactionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionDate: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
    marginRight: 8,
  },
  transactionTime: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: '#10B981',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  listContainer: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 60,
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '100%',
    maxWidth: 400,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 20,
  },
  modalHeader: {
    paddingVertical: 24,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  modalContent: {
    padding: 24,
  },
  amountSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: '700',
    color: '#64748B',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '800',
    color: '#1E293B',
    paddingVertical: 4,
  },
  amountLimit: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 8,
    textAlign: 'right',
    fontWeight: '500',
  },
  remarksSection: {
    marginBottom: 32,
  },
  remarksInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1E293B',
    minHeight: 80,
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#10B981',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  confirmButtonDisabled: {
    backgroundColor: '#94A3B8',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginRight: 8,
  },
  confirmButtonIcon: {
    fontSize: 16,
    color: '#FFFFFF',
  },
});