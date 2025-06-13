import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { createTransaction } from '../../utils/api'; 
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: screenWidth } = Dimensions.get('window');

export default function AddTransaction() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [amount, setAmount] = useState('');
  const [remarks, setRemarks] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (params.vendor) {
      setVendorName(params.vendor);
    }
    if (params.vendorData) {
      try {
        const vendorData = JSON.parse(params.vendorData);
        setVendorName(vendorData.name || vendorData.vendor || 'Unknown Vendor');
      } catch (error) {
        console.log('Error parsing vendor data:', error);
      }
    }
  }, [params]);

  const validateForm = () => {
    const newErrors = {};

    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }

    if (!remarks.trim()) {
      newErrors.remarks = 'Please add a remark for this transaction';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAmountChange = (text) => {
    const numericText = text.replace(/[^0-9.]/g, '');
    const parts = numericText.split('.');
    if (parts.length <= 2) {
      setAmount(parts.length === 2 ? `${parts[0]}.${parts[1].slice(0, 2)}` : numericText);
    }

    if (errors.amount) {
      setErrors(prev => ({ ...prev, amount: null }));
    }
  };

const handleSubmit = async () => {
  if (!validateForm()) return;

  setIsLoading(true);

  try {
    // Get token
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      Alert.alert('🚫 Unauthorized', 'You must be logged in to add a transaction.', [{ text: 'OK' }]);
      return;
    }

    // Prepare payload
    const vendorIdParts = vendorName.split(':');
    if (vendorIdParts.length < 2) {
      Alert.alert('Invalid Vendor', 'Vendor format is incorrect.', [{ text: 'OK' }]);
      return;
    }
    console.log('Vendor ID Parts:', vendorIdParts[2].trim());
    const payload = {
      vendorId: vendorIdParts[2].trim(),
      amount: parseFloat(amount),
      remarks: remarks.trim()
    };

    // Call API
    const response = await createTransaction(token, payload);

    if (!response || !response.success) {
      throw new Error(response?.message || 'Something went wrong');
    }

    // Success
    Alert.alert(
      '✅ Transaction Added',
      `₹${amount} added to debt for ${vendorName.split(':')[1] || 'Unknown Vendor'}`,
      [
        {
          text: 'Add Another',
          onPress: () => {
            setAmount('');
            setRemarks('');
            setErrors({});
          }
        },
        {
          text: 'Done',
          onPress: () => router.replace('/home/landingpage')
        }
      ]
    );
  } catch (error) {
    console.error('Transaction Error:', error);
    Alert.alert('❌ Error', error.message || 'Failed to save transaction. Please try again.', [{ text: 'OK' }]);
  } finally {
    setIsLoading(false);
  }
};

  const quickAmounts = [10, 20, 50, 100, 200, 500];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Transaction</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Vendor Info Card */}
        <View style={styles.vendorCard}>
          <View style={styles.vendorIcon}>
            <Text style={styles.vendorIconText}>🏪</Text>
          </View>
          <View style={styles.vendorInfo}>
            <Text style={styles.vendorLabel}>Transaction with</Text>
            <Text style={styles.vendorName}>{vendorName.split(':')[1] || 'Unknown Vendor'}</Text>
            {errors.vendor && <Text style={styles.errorText}>{errors.vendor}</Text>}
          </View>
        </View>

        {/* Amount Input */}
        <View style={styles.amountSection}>
          <Text style={styles.sectionLabel}>Amount</Text>
          <View style={styles.amountInputContainer}>
            <Text style={styles.currencySymbol}>₹</Text>
            <TextInput
              style={[styles.amountInput, errors.amount && styles.inputError]}
              value={amount}
              onChangeText={handleAmountChange}
              placeholder="0.00"
              placeholderTextColor="#ccc"
              keyboardType="numeric"
              maxLength={10}
            />
          </View>
          {errors.amount && <Text style={styles.errorText}>{errors.amount}</Text>}

          {/* Quick Amount Buttons */}
          <View style={styles.quickAmounts}>
            <Text style={styles.quickAmountsLabel}>Quick Select:</Text>
            <View style={styles.quickAmountsGrid}>
              {quickAmounts.map((quickAmount) => (
                <TouchableOpacity
                  key={quickAmount}
                  style={styles.quickAmountButton}
                  onPress={() => setAmount(quickAmount.toString())}
                >
                  <Text style={styles.quickAmountText}>₹{quickAmount}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Remarks Input */}
        <View style={styles.remarksSection}>
          <Text style={styles.sectionLabel}>Remarks</Text>
          <TextInput
            style={[styles.remarksInput, errors.remarks && styles.inputError]}
            value={remarks}
            onChangeText={(text) => {
              setRemarks(text);
              if (errors.remarks) {
                setErrors(prev => ({ ...prev, remarks: null }));
              }
            }}
            placeholder="Enter transaction details (e.g., groceries, payment for supplies)"
            placeholderTextColor="#999"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
          {errors.remarks && <Text style={styles.errorText}>{errors.remarks}</Text>}
        </View>

        {/* Summary */}
        {amount && vendorName && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Transaction Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Vendor:</Text>
              <Text style={styles.summaryValue}>{vendorName.split(':')[1] || 'Unknown Vendor'}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Amount:</Text>
              <Text style={[styles.summaryValue, styles.summaryAmount, styles.debitAmount]}>
                +₹{amount}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Type:</Text>
              <Text style={styles.summaryValue}>Debt Added</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.submitContainer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            (!amount || !vendorName || !remarks) && styles.submitButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={!amount || !remarks || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.submitButtonText}>💳 Add to Debt</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 18,
    color: '#495057',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
  },
  placeholder: {
    width: 40,
  },
  
  // Content
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  
  // Vendor Card
  vendorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginTop: 20,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  vendorIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  vendorIconText: {
    fontSize: 24,
  },
  vendorInfo: {
    flex: 1,
  },
  vendorLabel: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '500',
    marginBottom: 4,
  },
  vendorName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    padding: 0,
  },
  
  // Section Labels
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 12,
  },
  
  // Transaction Type Toggle
  typeToggle: {
    marginBottom: 24,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  toggleLeft: {
    marginRight: 2,
  },
  toggleRight: {
    marginLeft: 2,
  },
  toggleActive: {
    backgroundColor: '#007bff',
    elevation: 2,
    shadowColor: '#007bff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6c757d',
  },
  toggleTextActive: {
    color: '#fff',
  },
  
  // Amount Input
  amountSection: {
    marginBottom: 24,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '600',
    color: '#495057',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: '700',
    color: '#212529',
    paddingVertical: 16,
  },
  
  // Quick Amounts
  quickAmounts: {
    marginTop: 16,
  },
  quickAmountsLabel: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '500',
    marginBottom: 8,
  },
  quickAmountsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  quickAmountButton: {
    backgroundColor: '#e9ecef',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    margin: 4,
  },
  quickAmountText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#495057',
  },
  
  // Remarks Input
  remarksSection: {
    marginBottom: 24,
  },
  remarksInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#212529',
    minHeight: 80,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  
  // Summary Card
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6c757d',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212529',
  },
  summaryAmount: {
    fontSize: 16,
  },
  debitAmount: {
    color: '#dc3545',
  },
  creditAmount: {
    color: '#28a745',
  },
  
  // Submit Button
  submitContainer: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  submitButton: {
    backgroundColor: '#007bff',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#007bff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#adb5bd',
    elevation: 0,
    shadowOpacity: 0,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Error States
  inputError: {
    borderWidth: 1,
    borderColor: '#dc3545',
  },
  errorText: {
    fontSize: 12,
    color: '#dc3545',
    marginTop: 4,
    fontWeight: '500',
  },
});