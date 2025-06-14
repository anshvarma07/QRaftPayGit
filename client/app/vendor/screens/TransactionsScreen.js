import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Header from '../components/Header';

export default function TransactionsScreen() {
  return (
    <View style={styles.container}>
      <Header />
      <Text style={styles.text}>Transaction history will appear here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  text: { padding: 20, fontSize: 16 },
});
