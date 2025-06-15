import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions, 
  Platform,
  StatusBar 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MoreVertical, Bell } from 'lucide-react-native';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');

const Header = () => {
  const [vendorName, setVendorName] = useState('');
  const [notificationCount, setNotificationCount] = useState(3); // Mock notification count

  useEffect(() => {
    const fetchUsername = async () => {
      const name = await AsyncStorage.getItem('username');
      setVendorName(name || 'Vendor');
    };
    fetchUsername();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <>
      {/* Status bar styling */}
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <View style={styles.headerContainer}>
        {/* Left side - Profile/Menu */}
        <View style={styles.leftSection}>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => router.replace('/vendor/screens/MoreScreen')}
            activeOpacity={0.8}
          >
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {vendorName.charAt(0).toUpperCase()}
              </Text>
            </View>
          </TouchableOpacity>
          
          <View style={styles.greetingContainer}>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.vendorName}>{vendorName}</Text>
          </View>
        </View>

        {/* Right side - Actions */}
        <View style={styles.rightSection}>
          {/* Notification Bell */}
          <TouchableOpacity 
            style={styles.iconButton}
            activeOpacity={0.8}
          >
            <Bell size={22} color="rgba(255,255,255,0.9)" />
            {notificationCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.badgeText}>
                  {notificationCount > 9 ? '9+' : notificationCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* More Menu */}
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => router.replace('/vendor/screens/MoreScreen')}
            activeOpacity={0.8}
          >
            <MoreVertical size={22} color="rgba(255,255,255,0.9)" />
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 0 : 10,
    paddingBottom: 0,
    minHeight: 60,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileButton: {
    marginRight: 12,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  greetingContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
    marginBottom: 2,
  },
  vendorName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default Header;