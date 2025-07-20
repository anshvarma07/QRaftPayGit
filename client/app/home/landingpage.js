import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import SafeStorage from '../../utils/storage';
import { QrCode, LogOut, Sparkles, MoreHorizontal } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function LandingPage() {
  const router = useRouter();

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await SafeStorage.clearUserData();
              Alert.alert('Logged out successfully');
              router.replace('/login');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout properly. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleScan = () => {
    router.push('home/scanner');
  };

  const handleMore = () => {
    router.push('home/more');
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <LinearGradient
        colors={['#667eea', '#764ba2', '#f093fb']}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Background Elements */}
        <View style={[styles.backgroundOrb, styles.orb1]} />
        <View style={[styles.backgroundOrb, styles.orb2]} />
        <View style={[styles.backgroundOrb, styles.orb3]} />
        <View style={[styles.backgroundOrb, styles.orb4]} />

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>Welcome back!</Text>
              <Text style={styles.appName}>QRaftPay</Text>
            </View>
            <View style={styles.headerButtons}>
              <TouchableOpacity style={styles.moreButton} onPress={handleMore}>
                <MoreHorizontal size={20} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <LogOut size={20} color="#ff4757" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={['#fff', 'rgba(255,255,255,0.8)']}
                style={styles.iconGradient}
              >
                <Sparkles size={40} color="#667eea" />
              </LinearGradient>
            </View>
            <Text style={styles.heroTitle}>Quick & Secure Payments</Text>
            <Text style={styles.heroSubtitle}>
              Scan QR codes to make instant payments with just one tap
            </Text>
          </View>

          {/* Main Action Button */}
          <View style={styles.mainActionContainer}>
            <TouchableOpacity
              style={styles.mainActionButton}
              onPress={handleScan}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#4CAF50', '#45a049', '#2e7d32']}
                style={styles.mainButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.mainButtonContent}>
                  <View style={styles.mainButtonIcon}>
                    <QrCode size={48} color="#fff" />
                  </View>
                  <Text style={styles.mainButtonTitle}>Scan QR Code</Text>
                  <Text style={styles.mainButtonDescription}>
                    Tap to start scanning and make payments
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Quick Stats */}
          <View style={styles.quickStats}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>127</Text>
              <Text style={styles.statLabel}>Total Scans</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>$2,450</Text>
              <Text style={styles.statLabel}>This Month</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>98%</Text>
              <Text style={styles.statLabel}>Success Rate</Text>
            </View>
          </View>

          {/* Features */}
          <View style={styles.featuresContainer}>
            <Text style={styles.featuresTitle}>Why QRaftPay?</Text>
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <Text style={styles.featureText}>🔒 Bank-level security</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureText}>⚡ Instant transactions</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureText}>📱 Simple & intuitive</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Bottom Decoration */}
        <View style={styles.bottomDecoration}>
          <Text style={styles.footerText}>Secure • Fast • Reliable</Text>
        </View>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Background Elements
  backgroundOrb: {
    position: 'absolute',
    borderRadius: 100,
    opacity: 0.1,
    backgroundColor: '#fff',
  },
  orb1: {
    width: 200,
    height: 200,
    top: -50,
    right: -50,
  },
  orb2: {
    width: 150,
    height: 150,
    bottom: 200,
    left: -30,
  },
  orb3: {
    width: 100,
    height: 100,
    top: height * 0.3,
    right: -20,
  },
  orb4: {
    width: 80,
    height: 80,
    bottom: 100,
    right: 100,
  },

  // Header
  header: {
    paddingTop: StatusBar.currentHeight + 20,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '400',
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  moreButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },

  // Content
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },

  // Hero Section
  heroSection: {
    alignItems: 'center',
    marginBottom: 50,
  },
  iconContainer: {
    marginBottom: 20,
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },

  // Main Action Button
  mainActionContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  mainActionButton: {
    width: '100%',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  mainButtonGradient: {
    borderRadius: 24,
    padding: 32,
  },
  mainButtonContent: {
    alignItems: 'center',
  },
  mainButtonIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    padding: 20,
    borderRadius: 24,
    marginBottom: 16,
  },
  mainButtonTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  mainButtonDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },

  // Quick Stats
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },

  // Features
  featuresContainer: {
    marginBottom: 20,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  featuresList: {
    alignItems: 'center',
  },
  featureItem: {
    marginBottom: 8,
  },
  featureText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },

  // Bottom
  bottomDecoration: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  footerText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
  },
});