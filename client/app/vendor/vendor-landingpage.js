import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Share,
  Clipboard,
} from 'react-native';
import { generateVendorQR } from '../../utils/api'; // Adjust the import path as needed
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock data for demonstration
const mockVendorData = {
  name: "Ansh Varma",
  businessName: "Varma Electronics",
  totalSales: "₹45,230",
  todaySales: "₹2,150",
  totalTransactions: 143,
  rating: 4.8
};

export default function VendorLandingPage() {
  const [qrCode, setQrCode] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateQR = async () => {
    setIsLoading(true);
    
    try {
      const token = await AsyncStorage.getItem('token'); 
      const vendorName = await AsyncStorage.getItem('username');
      const result = await generateVendorQR(token, vendorName);
      setQrCode(result.data?.image);
      Alert.alert('Success', 'QR Code generated successfully!');
    } catch (err) {
      Alert.alert('Error', 'Failed to generate QR code. Please try again.');
      console.error('QR generation failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const copyQRCode = async () => {
    if (qrCode) {
      try {
        await Clipboard.setString(qrCode);
        Alert.alert('Copied', 'QR code copied to clipboard!');
      } catch (err) {
        Alert.alert('Error', 'Failed to copy QR code');
      }
    }
  };

  const shareQRCode = async () => {
    if (qrCode) {
      try {
        await Share.share({
          message: `Payment QR Code for ${vendorName}`,
          url: qrCode,
        });
      } catch (err) {
        console.error('Failed to share QR code:', err);
      }
    }
  };

  const StatCard = ({ title, value, bgColor, textColor }) => (
    <View style={[styles.statCard, { backgroundColor: bgColor }]}>
      <Text style={[styles.statTitle, { color: textColor }]}>{title}</Text>
      <Text style={[styles.statValue, { color: textColor }]}>{value}</Text>
    </View>
  );

  const TransactionItem = ({ time, customer, amount, status }) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionLeft}>
        <Text style={styles.customerText}>{customer}</Text>
        <Text style={styles.timeText}>{time}</Text>
      </View>
      <View style={styles.transactionRight}>
        <Text style={styles.amountText}>{amount}</Text>
        <Text style={[
          styles.statusText,
          { color: status === 'Completed' ? '#10B981' : '#F59E0B' }
        ]}>
          {status}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>QR</Text>
            </View>
            <View>
              <Text style={styles.appName}>QraftPay Vendor</Text>
              <Text style={styles.appSubtitle}>Payment Dashboard</Text>
            </View>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{mockVendorData.name}</Text>
          </View>
        </View>

        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>
            Welcome back, {mockVendorData.name}! 👋
          </Text>
          <Text style={styles.welcomeSubtitle}>
            Manage your payments and generate QR codes for seamless transactions
          </Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <StatCard
              title="Total Sales"
              value={mockVendorData.totalSales}
              bgColor="#10B981"
              textColor="#ffffff"
            />
            <StatCard
              title="Today's Sales"
              value={mockVendorData.todaySales}
              bgColor="#3B82F6"
              textColor="#ffffff"
            />
          </View>
          <View style={styles.statsRow}>
            <StatCard
              title="Transactions"
              value={mockVendorData.totalTransactions.toString()}
              bgColor="#8B5CF6"
              textColor="#ffffff"
            />
            <StatCard
              title="Rating"
              value={`${mockVendorData.rating}⭐`}
              bgColor="#F59E0B"
              textColor="#ffffff"
            />
          </View>
        </View>

        {/* QR Code Generation Section */}
        <View style={styles.qrSection}>
          <Text style={styles.sectionTitle}>Generate Payment QR Code</Text>
          <Text style={styles.sectionSubtitle}>
            Create a QR code for customers to scan and pay
          </Text>

          <TouchableOpacity
            style={[
              styles.generateButton,
              // { opacity: isLoading || hello ? 0.5 : 1 }
            ]}
            onPress={handleGenerateQR}
            // disabled={isLoading || !vendorName.trim()}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.generateButtonText}>Generate QR Code</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* QR Code Display */}
        {qrCode && (
          <View style={styles.qrDisplaySection}>
            <Text style={styles.sectionTitle}>Your QR Code</Text>
            <Text style={styles.sectionSubtitle}>
              Share this with customers for payments
            </Text>

            <View style={styles.qrImageContainer}>
              <Image source={{ uri: qrCode }} style={styles.qrImage} />
            </View>

            <View style={styles.qrActions}>
              <TouchableOpacity style={styles.actionButton} onPress={copyQRCode}>
                <Text style={styles.actionButtonText}>Copy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={shareQRCode}>
                <Text style={styles.actionButtonText}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Recent Activity */}
        <View style={styles.activitySection}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          
          <TransactionItem
            time="10:30 AM"
            customer="Customer #1234"
            amount="₹150"
            status="Completed"
          />
          <TransactionItem
            time="09:45 AM"
            customer="Customer #5678"
            amount="₹300"
            status="Completed"
          />
          <TransactionItem
            time="09:15 AM"
            customer="Customer #9012"
            amount="₹75"
            status="Pending"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  appName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  appSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  userInfo: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  userName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  welcomeSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 12,
    marginHorizontal: 6,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    opacity: 0.9,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  qrSection: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#ffffff',
  },
  generateButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  generateButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  qrDisplaySection: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  qrImageContainer: {
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
  },
  qrImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
  },
  qrActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  actionButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
  },
  activitySection: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  transactionLeft: {
    flex: 1,
  },
  customerText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 14,
    color: '#6B7280',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
});