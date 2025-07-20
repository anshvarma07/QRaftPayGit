import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Update state with error details
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // You can also log the error to an error reporting service here
    // logErrorToService(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  }

  handleReportError = () => {
    const { error, errorInfo } = this.state;
    const errorMessage = `Error: ${error?.message}\n\nStack: ${errorInfo?.componentStack}`;
    
    Alert.alert(
      'Error Report',
      errorMessage,
      [{ text: 'OK' }]
    );
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <LinearGradient
            colors={['#667eea', '#764ba2', '#f093fb']}
            style={styles.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.content}>
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>⚠️</Text>
              </View>
              
              <Text style={styles.title}>Oops! Something went wrong</Text>
              <Text style={styles.subtitle}>
                We encountered an unexpected error. Don't worry, your data is safe.
              </Text>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={this.handleRetry}
                >
                  <Text style={styles.retryButtonText}>Try Again</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.reportButton}
                  onPress={this.handleReportError}
                >
                  <Text style={styles.reportButtonText}>Report Error</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.helpText}>
                If the problem persists, please restart the app or contact support.
              </Text>
            </View>
          </LinearGradient>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    maxWidth: 300,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  icon: {
    fontSize: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  reportButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  reportButtonText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    fontWeight: '500',
  },
  helpText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default ErrorBoundary; 