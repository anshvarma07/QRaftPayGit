import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  ArrowLeft, 
  User, 
  Receipt, 
  Settings, 
  HelpCircle, 
  Shield,
  ChevronRight
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function MorePage() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const handleProfile = () => {
    router.push('home/more/profile');
  };

  const handleTransactions = () => {
    router.push('home/more/transactions');
  };

  const menuItems = [
    {
      id: 1,
      title: 'Your Profile',
      subtitle: 'Manage your personal information',
      icon: User,
      onPress: handleProfile,
      gradient: ['#667eea', '#764ba2'],
    },
    {
      id: 2,
      title: 'Your Transactions',
      subtitle: 'View payment history & receipts',
      icon: Receipt,
      onPress: handleTransactions,
      gradient: ['#3742fa', '#2f3542'],
    },
    {
      id: 3,
      title: 'Settings',
      subtitle: 'App preferences & configuration',
      icon: Settings,
      onPress: () => {}, // TODO: Implement settings
      gradient: ['#ff6b6b', '#ee5a24'],
    },
    {
      id: 4,
      title: 'Security',
      subtitle: 'Privacy & security settings',
      icon: Shield,
      onPress: () => {}, // TODO: Implement security
      gradient: ['#26de81', '#20bf6b'],
    },
    {
      id: 5,
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      icon: HelpCircle,
      onPress: () => {}, // TODO: Implement help
      gradient: ['#fd9644', '#f7b731'],
    },
  ];

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

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.8}>
            <LinearGradient
              colors={['#667eea', '#764ba2', 'rgba(0,0,0,0.1)']}
              style={styles.backButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <ArrowLeft size={24} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>More Options</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Content */}
        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>What would you like to do?</Text>
            <Text style={styles.welcomeSubtitle}>
              Access your profile, transactions, and more
            </Text>
          </View>

          {/* Menu Items */}
          <View style={styles.menuContainer}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.menuItem,
                  index === menuItems.length - 1 && styles.lastMenuItem
                ]}
                onPress={item.onPress}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={item.gradient}
                  style={styles.menuItemGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.menuItemContent}>
                    <View style={styles.menuItemLeft}>
                      <View style={styles.menuItemIcon}>
                        <item.icon size={24} color="#fff" />
                      </View>
                      <View style={styles.menuItemText}>
                        <Text style={styles.menuItemTitle}>{item.title}</Text>
                        <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                      </View>
                    </View>
                    <ChevronRight size={20} color="rgba(255, 255, 255, 0.7)" />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <Text style={styles.quickActionsTitle}>Quick Stats</Text>
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>5</Text>
                <Text style={styles.statLabel}>Menu Items</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>24/7</Text>
                <Text style={styles.statLabel}>Support</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>100%</Text>
                <Text style={styles.statLabel}>Secure</Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>QRaftPay • Version 1.0.0</Text>
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
    opacity: 0.08,
    backgroundColor: '#fff',
  },
  orb1: {
    width: 180,
    height: 180,
    top: -40,
    right: -40,
  },
  orb2: {
    width: 120,
    height: 120,
    bottom: 150,
    left: -20,
  },
  orb3: {
    width: 90,
    height: 90,
    top: height * 0.4,
    right: -10,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: StatusBar.currentHeight + 20,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  backButton: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  backButtonGradient: {
    padding: 12,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  placeholder: {
    width: 48,
  },

  // Content
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },

  // Welcome Section
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 22,
  },

  // Menu Items
  menuContainer: {
    marginBottom: 30,
  },
  menuItem: {
    marginBottom: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  lastMenuItem: {
    marginBottom: 0,
  },
  menuItemGradient: {
    borderRadius: 20,
    padding: 20,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    padding: 12,
    borderRadius: 16,
    marginRight: 16,
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  menuItemSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 18,
  },

  // Quick Actions
  quickActions: {
    marginBottom: 20,
  },
  quickActionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingBottom: 30,
    paddingHorizontal: 24,
  },
  footerText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
  },
});