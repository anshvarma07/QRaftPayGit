import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  StyleSheet, 
  Alert, 
  ActivityIndicator,
  ScrollView,
  Platform,
  Modal,
  Share
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import SafeStorage from '../../../utils/storage';
import { 
  QrCode, 
  User, 
  Settings, 
  HelpCircle, 
  Shield, 
  Bell, 
  Download,
  Share2,
  LogOut,
  ChevronRight,
  Star,
  TrendingUp,
  CreditCard,
  X
} from 'lucide-react-native';
import { generateVendorQR } from '../../../utils/api';
import Header from '../components/Header';
import { router } from 'expo-router';

export default function MoreScreen() {
  const [qrImage, setQrImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [vendorName, setVendorName] = useState('');
  const [vendorStats, setVendorStats] = useState({
    rating: '4.8',
    totalOrders: '1,234',
    joinDate: 'Jan 2023'
  });

  useEffect(() => {
    const fetchVendorData = async () => {
      try {
        const name = await SafeStorage.getUsername();
        setVendorName(name || 'Vendor');
      } catch (error) {
        console.error('Error fetching vendor data:', error);
        setVendorName('Vendor');
      }
    };
    fetchVendorData();
  }, []);

  const handleGenerateQR = async () => {
    setLoading(true);
    try {
      const token = await SafeStorage.getToken();
      const username = await SafeStorage.getUsername();
      if (token && username) {
        const result = await generateVendorQR(token, username);
        setQrImage(result.data?.image);
        setShowQRModal(true);
        Alert.alert("Success", "QR Generated Successfully!");
      } else {
        Alert.alert("Error", "Missing authentication data. Please login again.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Failed", "QR Generation failed. Please try again.");
    }
    setLoading(false);
  };

  const handleShareQR = async () => {
    if (qrImage) {
      try {
        await Share.share({
          message: 'Scan this QR code to visit my store!',
          url: qrImage,
        });
      } catch (error) {
        console.error(error);
      }
    }
  };

const handleLogout = () => {
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


  const MenuSection = ({ title, children }) => (
    <View style={styles.menuSection}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.menuContainer}>
        {children}
      </View>
    </View>
  );

  const MenuItem = ({ icon: Icon, title, subtitle, onPress, showChevron = true, color = '#6366F1' }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.menuItemLeft}>
        <View style={[styles.menuIconContainer, { backgroundColor: `${color}15` }]}>
          <Icon size={20} color={color} />
        </View>
        <View style={styles.menuItemText}>
          <Text style={styles.menuItemTitle}>{title}</Text>
          {subtitle && <Text style={styles.menuItemSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {showChevron && <ChevronRight size={20} color="#94A3B8" />}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#6366F1', '#8B5CF6', '#EC4899']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      >
        <Header />
        
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {vendorName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{vendorName}</Text>
              <Text style={styles.profileSubtext}>Vendor Profile</Text>
            </View>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{vendorStats.rating}</Text>
                <Text style={styles.statLabel}>Rating</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{vendorStats.totalOrders}</Text>
                <Text style={styles.statLabel}>Orders</Text>
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* QR Code Section */}
        <View style={styles.qrSection}>
          <TouchableOpacity 
            style={styles.qrButton} 
            onPress={handleGenerateQR}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#10B981', '#059669']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.qrButtonGradient}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <QrCode size={24} color="#fff" />
                  <Text style={styles.qrButtonText}>Generate QR Code</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Business Menu */}
        <MenuSection title="Business">
          <MenuItem 
            icon={TrendingUp} 
            title="Analytics" 
            subtitle="View detailed reports"
            color="#10B981"
          />
          <MenuItem 
            icon={CreditCard} 
            title="Payment Settings" 
            subtitle="Manage payment methods"
            color="#3B82F6"
          />
          <MenuItem 
            icon={Star} 
            title="Reviews & Ratings" 
            subtitle="Customer feedback"
            color="#F59E0B"
          />
        </MenuSection>

        {/* Account Menu */}
        <MenuSection title="Account">
          <MenuItem 
            icon={User} 
            title="Edit Profile" 
            subtitle="Update your information"
          />
          <MenuItem 
            icon={Bell} 
            title="Notifications" 
            subtitle="Manage your alerts"
          />
          <MenuItem 
            icon={Shield} 
            title="Privacy & Security" 
            subtitle="Account protection"
          />
        </MenuSection>

        {/* Support Menu */}
        <MenuSection title="Support">
          <MenuItem 
            icon={HelpCircle} 
            title="Help Center" 
            subtitle="Get support"
            color="#8B5CF6"
          />
          <MenuItem 
            icon={Settings} 
            title="App Settings" 
            subtitle="Customize your experience"
            color="#64748B"
          />
        </MenuSection>

        {/* Logout */}
        <View style={styles.logoutSection}>
          <TouchableOpacity 
            style={styles.logoutButton} 
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <LogOut size={20} color="#EF4444" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* QR Modal */}
      <Modal
        visible={showQRModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowQRModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowQRModal(false)}
            >
              <X size={24} color="#64748B" />
            </TouchableOpacity>
            
            <Text style={styles.modalTitle}>Your QR Code</Text>
            <Text style={styles.modalSubtitle}>
              Customers can scan this to visit your store
            </Text>
            
            {qrImage && (
              <View style={styles.qrContainer}>
                <Image source={{ uri: qrImage }} style={styles.qrImage} />
              </View>
            )}
            
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.actionButton} onPress={handleShareQR}>
                <Share2 size={20} color="#6366F1" />
                <Text style={styles.actionButtonText}>Share</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionButton}>
                <Download size={20} color="#6366F1" />
                <Text style={styles.actionButtonText}>Download</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  gradientBackground: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 30,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  profileSection: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  profileCard: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  profileSubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  scrollView: {
    flex: 1,
    marginTop: 20,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  qrSection: {
    marginBottom: 24,
  },
  qrButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  qrButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 12,
  },
  qrButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  menuSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  logoutSection: {
    marginBottom: 24,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
  bottomSpacing: {
    height: 100,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 350,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
    marginTop: 20,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
  },
  qrContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  qrImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366F1',
  },
});