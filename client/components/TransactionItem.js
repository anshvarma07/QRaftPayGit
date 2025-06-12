import React from 'react';
import { View, Text } from 'react-native';

export default function TransactionItem({ transaction }) {
  return (
    <View style={{ padding: 10, borderBottomWidth: 1 }}>
      <Text>Vendor ID: {transaction.vendorId}</Text>
      <Text>Amount: {transaction.amount}</Text>
      <Text>Remark: {transaction.remark}</Text>
      <Text>Date: {new Date(transaction.createdAt).toLocaleString()}</Text>
    </View>
  );
}
