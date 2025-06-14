import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MoreVertical } from 'lucide-react-native';
import { router } from 'expo-router';

const Header = () => {
  const [vendorName, setVendorName] = useState('');

  useEffect(() => {
    const fetchUsername = async () => {
      const name = await AsyncStorage.getItem('username');
      setVendorName(name || 'Vendor');
    };
    fetchUsername();
  }, []);

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.replace('/vendor/screens/MoreScreen')}>
        <MoreVertical size={24} color="black" />
      </TouchableOpacity>
      <Text style={styles.name}>{vendorName}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontWeight: '600',
    fontSize: 16,
    color: '#111',
  },
});

export default Header;
