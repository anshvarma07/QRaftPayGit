import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, Linking, Platform, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function Scanner() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [cameraReady, setCameraReady] = useState(false);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const scanlineAnimation = new Animated.Value(0);
  const pulseAnimation = new Animated.Value(1);
  const router = useRouter();

  useEffect(() => {
    if (!permission?.granted && permission?.canAskAgain) {
      requestPermission();
    }
  }, [permission]);

  useEffect(() => {
    setScanned(false);
    setIsActive(true);
    setCameraReady(false);
  }, []);

  // Animated scanning line
  useEffect(() => {
    if (cameraReady && !scanned) {
      const scanlineLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(scanlineAnimation, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(scanlineAnimation, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );
      scanlineLoop.start();
      
      return () => scanlineLoop.stop();
    }
  }, [cameraReady, scanned]);

  // Pulse animation for corners
  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();
    
    return () => pulseLoop.stop();
  }, []);

  const handleCameraReady = () => {
    setCameraReady(true);
  };

  const handleBarCodeScanned = ({ type, data }) => {
    console.log('Barcode scanned:', { type, data, scanned, isActive });
    
    if (scanned || !isActive) {
      console.log('Scan blocked - already scanned or inactive');
      return;
    }
    
    setScanned(true);
    setIsActive(false);
    
    console.log('Processing scan result');
    
    if (Platform.OS === 'ios') {
      try {
        const { impactAsync, ImpactFeedbackStyle } = require('expo-haptics');
        impactAsync(ImpactFeedbackStyle.Medium);
      } catch (error) {
        console.log('Haptic feedback not available');
      }
    }

    Alert.alert(
      '🎯 Code Scanned Successfully!', 
      `${data}`,
      [
        {
          text: 'Scan Another',
          style: 'default',
          onPress: () => {
            console.log('Resetting for new scan');
            setScanned(false);
            setIsActive(true);
          }
        },
        {
          text: 'Done',
          style: 'default',
          onPress: () => {
            console.log('Navigating to add transaction with vendor ID:', data);
            const vendorId=data;
            router.replace({
                pathname: '/home/addtransaction',
                params: { vendor : vendorId },
        });
          }
        }
      ]
    );
  };

  if (!permission) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Initializing Scanner...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <View style={styles.permissionContent}>
          <View style={styles.iconContainer}>
            <Text style={styles.cameraIcon}>📷</Text>
          </View>
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionDescription}>
            We need camera access to scan QR codes and barcodes for you
          </Text>
          {permission.canAskAgain ? (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={requestPermission}
            >
              <Text style={styles.primaryButtonText}>Enable Camera</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => Linking.openSettings()}
            >
              <Text style={styles.primaryButtonText}>Open Settings</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  const scanAreaSize = screenWidth * 0.7;
  const cameraHeight = screenHeight * 0.75;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Camera Section - 3/4 of screen */}
      <View style={[styles.cameraSection, { height: cameraHeight }]}>
        <CameraView
          style={styles.camera}
          facing="back"
          flash={flashEnabled ? 'on' : 'off'}
          onCameraReady={handleCameraReady}
          onBarcodeScanned={isActive && cameraReady ? handleBarCodeScanned : undefined}
          barcodeScannerSettings={{
            barcodeTypes: [
              'qr', 'pdf417', 'aztec', 'ean13', 'ean8', 'upc_e',
              'datamatrix', 'code128', 'code39', 'code93', 'codabar', 'itf14', 'upc_a'
            ],
          }}
        >
          {/* Top Controls */}
          <View style={styles.topControls}>
            <TouchableOpacity 
              style={styles.controlButton} 
              onPress={() => router.replace('/home/landingpage')}
            >
              <Text style={styles.controlIcon}>✕</Text>
            </TouchableOpacity>
            
            <Text style={styles.titleText}>QR Scanner</Text>
            
            <TouchableOpacity 
              style={[styles.controlButton, flashEnabled && styles.activeControl]}
              onPress={() => setFlashEnabled(!flashEnabled)}
            >
              <Text style={[styles.controlIcon, flashEnabled && styles.activeControlText]}>
                {flashEnabled ? '🔦' : '💡'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Scanning Overlay */}
          <View style={styles.scanOverlay}>
            <View style={styles.scanAreaContainer}>
              <View style={[styles.scanBox, { width: scanAreaSize, height: scanAreaSize }]}>
                {/* Animated corners */}
                <Animated.View style={[
                  styles.scanCorner, 
                  styles.topLeft,
                  { transform: [{ scale: pulseAnimation }] }
                ]} />
                <Animated.View style={[
                  styles.scanCorner, 
                  styles.topRight,
                  { transform: [{ scale: pulseAnimation }] }
                ]} />
                <Animated.View style={[
                  styles.scanCorner, 
                  styles.bottomLeft,
                  { transform: [{ scale: pulseAnimation }] }
                ]} />
                <Animated.View style={[
                  styles.scanCorner, 
                  styles.bottomRight,
                  { transform: [{ scale: pulseAnimation }] }
                ]} />
                
                {/* Animated scanning line */}
                {cameraReady && !scanned && (
                  <Animated.View style={[
                    styles.scanLine,
                    {
                      transform: [{
                        translateY: scanlineAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, scanAreaSize - 4]
                        })
                      }]
                    }
                  ]} />
                )}
              </View>
              
              <Text style={styles.scanInstruction}>
                {!cameraReady 
                  ? '🔄 Starting camera...' 
                  : scanned 
                    ? '✅ Code scanned successfully!' 
                    : '📱 Align QR code or barcode within the frame'
                }
              </Text>
              
              {!cameraReady && (
                <ActivityIndicator 
                  size="small" 
                  color="#00FF88" 
                  style={styles.cameraLoader}
                />
              )}
            </View>
          </View>
        </CameraView>
      </View>

      {/* Bottom Section - 1/4 of screen */}
      <View style={styles.bottomSection}>
        <View style={styles.bottomContent}>
          <View style={styles.featureRow}>
            <View style={styles.feature}>
              <Text style={styles.featureIcon}>⚡</Text>
              <Text style={styles.featureText}>Instant Scan</Text>
            </View>
            <View style={styles.feature}>
              <Text style={styles.featureIcon}>🎯</Text>
              <Text style={styles.featureText}>High Accuracy</Text>
            </View>
            <View style={styles.feature}>
              <Text style={styles.featureIcon}>🔒</Text>
              <Text style={styles.featureText}>Secure</Text>
            </View>
          </View>
          
          <View style={styles.supportedFormats}>
            <Text style={styles.supportedTitle}>Supported Formats</Text>
            <Text style={styles.supportedText}>QR Code • EAN • UPC • Code 128 • Data Matrix • PDF417</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  
  // Camera Section (3/4 screen)
  cameraSection: {
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  
  // Top Controls
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
  },
  activeControl: {
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  controlIcon: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  activeControlText: {
    color: '#333',
  },
  titleText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  
  // Scan Overlay
  scanOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanAreaContainer: {
    alignItems: 'center',
  },
  scanBox: {
    position: 'relative',
    backgroundColor: 'transparent',
  },
  scanCorner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#00FF88',
    borderWidth: 4,
    borderRadius: 4,
  },
  topLeft: {
    top: -2,
    left: -2,
    borderBottomWidth: 0,
    borderRightWidth: 0,
  },
  topRight: {
    top: -2,
    right: -2,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderTopWidth: 0,
    borderRightWidth: 0,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#00FF88',
    shadowColor: '#00FF88',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  scanInstruction: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 30,
    paddingHorizontal: 40,
    fontWeight: '500',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    lineHeight: 22,
  },
  cameraLoader: {
    marginTop: 15,
  },
  
  // Bottom Section (1/4 screen)
  bottomSection: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  bottomContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 32,
  },
  feature: {
    alignItems: 'center',
    flex: 1,
  },
  featureIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  featureText: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '600',
    textAlign: 'center',
  },
  supportedFormats: {
    alignItems: 'center',
  },
  supportedTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8,
  },
  supportedText: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 18,
  },
  
  // Loading States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6c757d',
    fontWeight: '500',
  },
  
  // Permission States
  permissionContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  permissionContent: {
    alignItems: 'center',
    maxWidth: 320,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  cameraIcon: {
    fontSize: 32,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#212529',
    textAlign: 'center',
    marginBottom: 12,
  },
  permissionDescription: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    minWidth: 200,
    elevation: 3,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});