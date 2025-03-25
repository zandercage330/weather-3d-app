'use client';

import { UserPreferencesProvider } from '@/app/hooks/useUserPreferences';
import { ServiceWorkerProvider } from '@/app/providers/ServiceWorkerProvider';

export default function MapLayout({
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