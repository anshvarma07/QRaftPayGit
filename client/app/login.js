import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
  StyleSheet,
  Dimensions,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { login } from '../utils/auth';
import { LinearGradient } from 'expo-linear-gradient';
import SafeStorage from '../utils/storage';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        // Use safe storage to save user data
        const saveSuccess = await SafeStorage.saveUserData(res);
        
        if (saveSuccess) {
          Alert.alert('Welcome back!', 'Login successful');
          if (res.user.role === 'vendor') {
            router.replace('/vendor/navigation/AppNavigator');
          }
          else if (res.user.role === 'buyer') {
            router.replace('/home/landingpage');
          }
        } else {
          Alert.alert('Warning', 'Login successful but failed to save session data. Please try again.');
        }
      } else {
        Alert.alert('Login failed', res.message);
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
          {/* Floating orbs for visual interest */}
          <View style={[styles.orb, styles.orb1]} />
          <View style={[styles.orb, styles.orb2]} />
          <View style={[styles.orb, styles.orb3]} />
          
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.welcomeText}>Welcome</Text>
              <Text style={styles.backText}>Back</Text>
              <Text style={styles.subtitle}>Sign in to continue</Text>
            </View>

            {/* Login Card */}
            <View style={styles.card}>
              <View style={styles.cardContent}>
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

                {/* Forgot Password */}
                <TouchableOpacity style={styles.forgotContainer}>
                  <Text style={styles.forgotText}>Forgot Password?</Text>
                </TouchableOpacity>

                {/* Login Button */}
                <TouchableOpacity 
                  style={[styles.loginButton, isLoading && styles.loginButtonDisabled]} 
                  onPress={handleLogin}
                  disabled={isLoading}
                >
                  <LinearGradient
                    colors={['#667eea', '#764ba2']}
                    style={styles.loginGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.loginButtonText}>
                      {isLoading ? 'Signing In...' : 'Sign In'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>


              </View>
            </View>

            {/* Sign Up Link */}
            <TouchableOpacity 
              style={styles.signupContainer}
              onPress={() => router.push('/register')}
            >
              <Text style={styles.signupText}>
                Don't have an account? 
                <Text style={styles.signupLink}> Create one</Text>
              </Text>
            </TouchableOpacity>
          </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: StatusBar.currentHeight + 40,
    paddingBottom: 40,
  },
  
  // Floating orbs
  orb: {
    position: 'absolute',
    borderRadius: 100,
    opacity: 0.1,
  },
  orb1: {
    width: 200,
    height: 200,
    backgroundColor: '#fff',
    top: -50,
    right: -50,
  },
  orb2: {
    width: 150,
    height: 150,
    backgroundColor: '#fff',
    bottom: 100,
    left: -30,
  },
  orb3: {
    width: 80,
    height: 80,
    backgroundColor: '#fff',
    top: height * 0.3,
    right: 50,
  },

  // Header
  header: {
    marginBottom: 40,
  },
  welcomeText: {
    fontSize: 42,
    fontWeight: '800',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  backText: {
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

  // Forgot Password
  forgotContainer: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '500',
  },

  // Login Button
  loginButton: {
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginGradient: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },



  // Sign Up
  signupContainer: {
    marginTop: 32,
    alignItems: 'center',
  },
  signupText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  signupLink: {
    color: '#fff',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});