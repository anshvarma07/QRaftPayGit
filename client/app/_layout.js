import { Stack } from 'expo-router';
import ErrorBoundary from '../components/ErrorBoundary';

export default function Layout() {
  return (
    <ErrorBoundary>
      <Stack screenOptions={{ headerShown: false }} />
    </ErrorBoundary>
  );
}
