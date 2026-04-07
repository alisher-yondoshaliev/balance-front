import AppRouter from './router';
import { useAuthInit } from './hooks/useAuthInit';

export default function App() {
  // Initialize auth on app load
  useAuthInit();

  return <AppRouter />;
}