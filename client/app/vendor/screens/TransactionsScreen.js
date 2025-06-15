import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Platform,
  Dimensions 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, Filter, TrendingUp, TrendingDown, Clock } from 'lucide-react-native';
import Header from '../components/Header';

const { width } = Dimensions.get('window');

// Mock transaction data
const transactions = [
  {
    id: '1',
    type: 'credit',
    amount: 1250,
    description: 'Order #12345 - Pizza Margherita',
    customer: 'Rahul Sharma',
    time: '2 hours ago',
    status: 'completed'
  },
  {
    id: '2',
    type: 'credit',
    amount: 850,
    description: 'Order #12344 - Burger Combo',
    customer: 'Priya Singh',
    time: '4 hours ago',
    status: 'completed'
  },
  {
    id: '3',
    type: 'debit',
    amount: 200,
    description: 'Platform Fee',
    customer: 'System',
    time: '6 hours ago',
    status: 'completed'
  },
  {
    id: '4',
    type: 'credit',
    amount: 2100,
    description: 'Order #12343 - Family Feast',
    customer: 'Amit Kumar',
    time: '1 day ago',
    status: 'completed'
  },
  {
    id: '5',
    type: 'credit',
    amount: 750,
    description: 'Order #12342 - Chicken Biryani',
    customer: 'Sneha Patel',
    time: '1 day ago',
    status: 'pending'
  },
];

export default function TransactionsScreen() {
  const [selectedFilter, setSelectedFilter] = useState('all');

  const getTotalEarnings = () => {
    return transactions
      .filter(t => t.type === 'credit')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getTransactionIcon = (type, status) => {
    if (status === 'pending') return <Clock size={16} color="#F59E0B" />;
    return type === 'credit' ? 
      <TrendingUp size={16} color="#10B981" /> : 
      <TrendingDown size={16} color="#EF4444" />;
  };

  const TransactionItem = ({ transaction }) => (
    <TouchableOpacity style={styles.transactionCard} activeOpacity={0.8}>
      <View style={styles.transactionHeader}>
        <View style={styles.transactionIcon}>
          {getTransactionIcon(transaction.type, transaction.status)}
        </View>
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionDescription} numberOfLines={1}>
            {transaction.description}
          </Text>
          <Text style={styles.customerName}>{transaction.customer}</Text>
          <Text style={styles.transactionTime}>{transaction.time}</Text>
        </View>
        <View style={styles.amountContainer}>
          <Text style={[
            styles.amount,
            { color: transaction.type === 'credit' ? '#10B981' : '#EF4444' }
          ]}>
            {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount}
          </Text>
          <View style={[
            styles.statusBadge,
            { backgroundColor: transaction.status === 'completed' ? '#DCFCE7' : '#FEF3C7' }
          ]}>
            <Text style={[
              styles.statusText,
              { color: transaction.status === 'completed' ? '#166534' : '#92400E' }
            ]}>
              {transaction.status}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#6366F1', '#8B5CF6', '#EC4899']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      >
        <Header />
        
        {/* Summary Section */}
        <View style={styles.summarySection}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Earnings</Text>
            <Text style={styles.summaryAmount}>₹{getTotalEarnings().toLocaleString()}</Text>
            <Text style={styles.summarySubtext}>This month</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Filter Section */}
        <View style={styles.filterSection}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <View style={styles.filterButtons}>
            {['all', 'credit', 'debit'].map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterButton,
                  selectedFilter === filter && styles.activeFilterButton
                ]}
                onPress={() => setSelectedFilter(filter)}
              >
                <Text style={[
                  styles.filterText,
                  selectedFilter === filter && styles.activeFilterText
                ]}>
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton}>
            <Search size={20} color="#6366F1" />
            <Text style={styles.actionButtonText}>Search</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Filter size={20} color="#6366F1" />
            <Text style={styles.actionButtonText}>Filter</Text>
          </TouchableOpacity>
        </View>

        {/* Transactions List */}
        <View style={styles.transactionsList}>
          {transactions
            .filter(t => selectedFilter === 'all' || t.type === selectedFilter)
            .map((transaction) => (
              <TransactionItem key={transaction.id} transaction={transaction} />
            ))}
        </View>

        {/* Load More Button */}
        <TouchableOpacity style={styles.loadMoreButton}>
          <Text style={styles.loadMoreText}>Load More Transactions</Text>
        </TouchableOpacity>

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
  summarySection: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  summaryCard: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  summaryLabel: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  summarySubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
    marginTop: 20,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  filterSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: '#E2E8F0',
  },
  activeFilterButton: {
    backgroundColor: '#6366F1',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366F1',
  },
  transactionsList: {
    gap: 12,
    marginBottom: 24,
  },
  transactionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  customerName: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 2,
  },
  transactionTime: {
    fontSize: 12,
    color: '#94A3B8',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  loadMoreButton: {
    backgroundColor: '#6366F1',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  loadMoreText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  bottomSpacing: {
    height: 100,
  },
});