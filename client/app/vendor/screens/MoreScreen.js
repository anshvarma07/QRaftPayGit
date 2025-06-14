import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateVendorQR } from '../../../utils/api';
import Header from '../components/Header';

export default function MoreScreen() {
  const [qrImage, setQrImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateQR = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const username = await AsyncStorage.getItem('username');
      const result = await generateVendorQR(token, username);
      setQrImage(result.data?.image);
      Alert.alert("Success", "QR Generated");
    } catch (error) {
      console.error(error);
      Alert.alert("Failed", "QR Generation failed");
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Header />
      <TouchableOpacity style={styles.button} onPress={handleGenerateQR}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Generate QR</Text>}
      </TouchableOpacity>
      {qrImage && <Image source={{ uri: qrImage }} style={styles.qrImage} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  button: {
    backgroundColor: '#3B82F6',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  qrImage: {
    width: 200,
    height: 200,
    alignSelf: 'center',
    marginTop: 20
  }
});
