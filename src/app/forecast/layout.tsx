import { UserPreferencesProvider } from '@/app/hooks/useUserPreferences';
import { ServiceWorkerProvider } from '@/app/providers/ServiceWorkerProvider';

export default function ForecastLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ServiceWorkerProvider>
      <UserPreferencesProvider>
        {children}
      </UserPreferencesProvider>
    </ServiceWorkerProvider>
  );
} 