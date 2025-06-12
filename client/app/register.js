import React, { useState } from 'react';
import {
  View,
  TextInput,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { register } from '../utils/auth';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('buyer');
  const [showRoleOptions, setShowRoleOptions] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const handleRegister = async () => {
    if (!name || !email || !password || !role) {
      Alert.alert('Missing Information', 'All fields are required');
      return;
    }

    setIsLoading(true);
    try {
      const res = await register(name, email, password, role);
      if (res.success) {
        Alert.alert('Success!', 'Account created successfully');
        router.replace('/login');
      } else {
        Alert.alert('Registration failed', res.message || 'Unknown error');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleDisplayName = (role) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
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
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Floating orbs for visual interest */}
            <View style={[styles.orb, styles.orb1]} />
            <View style={[styles.orb, styles.orb2]} />
            <View style={[styles.orb, styles.orb3]} />
            
            <View style={styles.content}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.createText}>Create</Text>
                <Text style={styles.accountText}>Account</Text>
                <Text style={styles.subtitle}>Join us to get started</Text>
              </View>

              {/* Register Card */}
              <View style={styles.card}>
                <View style={styles.cardContent}>
                  {/* Name Input */}
                  <View style={styles.inputContainer}>
                    <Ionicons name="person-outline" size={20} color="#667eea" style={styles.inputIcon} />
                    <TextInput
                      placeholder="Full Name"
                      value={name}
                      onChangeText={setName}
                      placeholderTextColor="#8f9bb3"
                      style={styles.input}
                      autoCapitalize="words"
                    />
                  </View>

                  {/* Email Input */}
                  <View style={styles.inputContainer}>
                    <Ionicons name="mail-outline" size={20} color="#667eea" style={styles.inputIcon} />
                    <TextInput
                      placeholder="Email address"
                      value={email}
                      onChangeText={setEmail}
                      placeholderTextColor="#8f9bb3"
                      style={styles.input}
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                  </View>

                  {/* Password Input */}
                  <View style={styles.inputContainer}>
                    <Ionicons name="lock-closed-outline" size={20} color="#667eea" style={styles.inputIcon} />
                    <TextInput
                      placeholder="Password"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      placeholderTextColor="#8f9bb3"
                      style={styles.input}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeIcon}
                    >
                      <Ionicons 
                        name={showPassword ? "eye-outline" : "eye-off-outline"} 
                        size={20} 
                        color="#8f9bb3" 
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Role Selector */}
                  <View style={styles.inputContainer}>
                    <Ionicons name="briefcase-outline" size={20} color="#667eea" style={styles.inputIcon} />
                    <TouchableOpacity
                      style={styles.roleSelector}
                      onPress={() => setShowRoleOptions(!showRoleOptions)}
                    >
                      <Text style={styles.roleSelectorText}>
                        {getRoleDisplayName(role)}
                      </Text>
                      <Ionicons 
                        name={showRoleOptions ? "chevron-up-outline" : "chevron-down-outline"} 
                        size={20} 
                        color="#8f9bb3" 
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Role Options */}
                  {showRoleOptions && (
                    <View style={styles.roleOptions}>
                      {['buyer', 'vendor'].map((option) => (
                        <TouchableOpacity
                          key={option}
                          onPress={() => {
                            setRole(option);
                            setShowRoleOptions(false);
                          }}
                          style={[
                            styles.roleOption,
                            role === option && styles.selectedRoleOption
                          ]}
                        >
                          <View style={styles.roleOptionContent}>
                            <Ionicons 
                              name={option === 'buyer' ? 'card-outline' : 'storefront-outline'} 
                              size={18} 
                              color={role === option ? '#667eea' : '#8f9bb3'} 
                            />
                            <Text style={[
                              styles.roleOptionText,
                              role === option && styles.selectedRoleOptionText
                            ]}>
                              {getRoleDisplayName(option)}
                            </Text>
                          </View>
                          {role === option && (
                            <Ionicons name="checkmark-circle" size={18} color="#667eea" />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  {/* Register Button */}
                  <TouchableOpacity 
                    style={[styles.registerButton, isLoading && styles.registerButtonDisabled]} 
                    onPress={handleRegister}
                    disabled={isLoading}
                  >
                    <LinearGradient
                      colors={['#667eea', '#764ba2']}
                      style={styles.registerGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Text style={styles.registerButtonText}>
                        {isLoading ? 'Creating Account...' : 'Create Account'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  {/* Terms and Privacy */}
                  <Text style={styles.termsText}>
                    By creating an account, you agree to our{' '}
                    <Text style={styles.linkText}>Terms of Service</Text>
                    {' '}and{' '}
                    <Text style={styles.linkText}>Privacy Policy</Text>
                  </Text>
                </View>
              </View>

              {/* Login Link */}
              <TouchableOpacity 
                style={styles.loginContainer}
                onPress={() => router.push('/login')}
              >
                <Text style={styles.loginText}>
                  Already have an account? 
                  <Text style={styles.loginLink}> Sign in</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingTop: StatusBar.currentHeight + 40,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  
  // Floating orbs
  orb: {
    position: 'absolute',
    borderRadius: 100,
    opacity: 0.1,
  },
  orb1: {
    width: 180,
    height: 180,
    backgroundColor: '#fff',
    top: -40,
    right: -60,
  },
  orb2: {
    width: 120,
    height: 120,
    backgroundColor: '#fff',
    bottom: 150,
    left: -40,
  },
  orb3: {
    width: 90,
    height: 90,
    backgroundColor: '#fff',
    top: height * 0.4,
    right: 30,
  },

  // Header
  header: {
    marginBottom: 40,
  },
  createText: {
    fontSize: 42,
    fontWeight: '800',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  accountText: {
    fontSize: 42,
    fontWeight: '300',
    color: '#fff',
    marginTop: -10,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 8,
    fontWeight: '400',
  },

  // Card
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
    backdropFilter: 'blur(10px)',
    marginBottom: 32,
  },
  cardContent: {
    padding: 32,
  },

  // Inputs
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.1)',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#2c3e50',
  },
  eyeIcon: {
    padding: 4,
  },

  // Role Selector
  roleSelector: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  roleSelectorText: {
    fontSize: 16,
    color: '#2c3e50',
  },

  // Role Options
  roleOptions: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.1)',
    overflow: 'hidden',
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  selectedRoleOption: {
    backgroundColor: 'rgba(102, 126, 234, 0.05)',
  },
  roleOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleOptionText: {
    fontSize: 16,
    color: '#2c3e50',
    marginLeft: 12,
  },
  selectedRoleOptionText: {
    color: '#667eea',
    fontWeight: '500',
  },

  // Register Button
  registerButton: {
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  registerButtonDisabled: {
    opacity: 0.7,
  },
  registerGradient: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Terms
  termsText: {
    fontSize: 12,
    color: '#8f9bb3',
    textAlign: 'center',
    lineHeight: 18,
  },
  linkText: {
    color: '#667eea',
    fontWeight: '500',
  },

  // Login Link
  loginContainer: {
    alignItems: 'center',
  },
  loginText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  loginLink: {
    color: '#fff',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});