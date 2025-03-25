import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ServiceWorkerProvider } from "./providers/ServiceWorkerProvider";
import NavigationMenu from "./components/NavigationMenu";
import { UserPreferencesProvider } from "./hooks/useUserPreferences";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import { APIStatusIndicator } from "./components/APIStatusIndicator";
import { apiHealthCheck } from "./lib/apiHealthCheck";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Weather App",
  description: "Modern weather application with offline support",
  manifest: "/manifest.json",
};

// Initialize API health monitoring
if (typeof window !== 'undefined') {
  apiHealthCheck.startMonitoring();
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#1e293b" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <UserPreferencesProvider>
          <ServiceWorkerProvider>
            <ErrorBoundary>
              {children}
              <NavigationMenu />
              <APIStatusIndicator />
            </ErrorBoundary>
          </ServiceWorkerProvider>
        </UserPreferencesProvider>
      </body>
    </html>
  );
}
