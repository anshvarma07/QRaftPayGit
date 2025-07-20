import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator, Text } from 'react-native';
import SafeStorage from '../utils/storage';
import StorageInitializer from '../utils/storageInit';

export default function Index() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuthState = async () => {
      try {
        // Initialize storage first
        await StorageInitializer.initialize();
        
        // Check if user is logged in
        const isLoggedIn = await SafeStorage.isLoggedIn();
        const userData = await SafeStorage.getUserData();
        
        if (isLoggedIn && userData.token && userData.userRole) {
          // User is logged in, redirect based on role
          if (userData.userRole === 'vendor') {
            router.replace('/vendor/navigation/AppNavigator');
          } else if (userData.userRole === 'buyer') {
            router.replace('/home/landingpage');
          } else {
            // Invalid role, redirect to login
            router.replace('/login');
          }
        } else {
          // Not logged in, redirect to login
          router.replace('/login');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setError('Failed to check authentication status');
        // Fallback to login screen
        setTimeout(() => {
          router.replace('/login');
        }, 2000);
      } finally {
        setIsLoading(false);
      }
    };

    // Add a small delay to ensure everything is ready
    const timeout = setTimeout(checkAuthState, 200);
    
    return () => clearTimeout(timeout);
  }, [router]);

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ color: 'red', textAlign: 'center', marginBottom: 20 }}>
          {error}
        </Text>
        <ActivityIndicator size="large" color="#2575fc" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#2575fc" />
    </View>
  );
}
