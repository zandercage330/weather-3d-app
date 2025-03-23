'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Map, Umbrella, Activity, BarChart2, Menu, X } from 'lucide-react';

interface NavigationMenuProps {
  className?: string;
}

export default function NavigationMenu({ className = '' }: NavigationMenuProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const links = [
    { href: '/', label: 'Home', icon: <Home className="w-5 h-5" /> },
    { href: '/activities', label: 'Activities', icon: <Activity className="w-5 h-5" /> },
    { href: '/forecast', label: 'Forecast', icon: <Umbrella className="w-5 h-5" /> },
    { href: '/map', label: 'Weather Map', icon: <Map className="w-5 h-5" /> },
    { href: '/history', label: 'History', icon: <BarChart2 className="w-5 h-5" /> },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={toggleMenu}
        className="md:hidden fixed bottom-4 right-4 z-50 bg-blue-600 text-white p-3 rounded-full shadow-lg"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile navigation */}
      <nav
        className={`md:hidden fixed inset-x-0 bottom-0 z-40 transform ${
          isOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        } transition-all duration-300 ease-in-out bg-white dark:bg-gray-900 shadow-lg rounded-t-xl`}
      >
        <div className="flex flex-col py-4 px-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center px-4 py-3 rounded-lg ${
                pathname === link.href
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'
              }`}
              onClick={() => setIsOpen(false)}
            >
              {link.icon}
              <span className="ml-3">{link.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Desktop navigation */}
      <nav
        className={`hidden md:flex fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-full shadow-lg px-2 py-1 ${className}`}
      >
        <div className="flex items-center space-x-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center px-4 py-2 rounded-full transition-colors ${
                pathname === link.href
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'
              }`}
            >
              {link.icon}
              <span className="ml-2 font-medium">{link.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
} 