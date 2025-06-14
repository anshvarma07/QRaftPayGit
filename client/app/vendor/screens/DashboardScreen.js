import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import Header from '../components/Header';
import StatCard from '../components/StatCard';

export default function DashboardScreen() {
  return (
    <View style={styles.container}>
      <Header />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Welcome Back 👋</Text>
        <View style={styles.stats}>
          <StatCard title="Total Sales" value="₹45,230" />
          <StatCard title="Today's Sales" value="₹2,150" />
          <StatCard title="Transactions" value="143" />
          <StatCard title="Rating" value="4.8⭐" />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  stats: { gap: 10 },
});
