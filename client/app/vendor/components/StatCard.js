import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const StatCard = ({ title, value }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#e0f2fe',
    padding: 16,
    borderRadius: 10,
    marginBottom: 10,
  },
  title: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '600',
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
});

export default StatCard;
