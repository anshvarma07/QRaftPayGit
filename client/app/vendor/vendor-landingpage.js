import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function VendorLandingPage() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Vendor Landing Page</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff', // optional: white background
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
