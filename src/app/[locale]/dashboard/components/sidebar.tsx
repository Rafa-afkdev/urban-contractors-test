"use client";

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { usePendingAppointments } from '@/hooks/use-pending-appointments';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Calendar, 
  Users,
  Menu, 
  LogOut,
  BarChart3,
  Package,
  Settings,
  X
} from 'lucide-react';
import Image from 'next/image';
import { Link, usePathname } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { useUser } from '../../../../../hooks/use-user';
import { useTheme } from 'next-themes';

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const t = useTranslations('Sidebar');
  const { user } = useUser();
  const { pendingCount, loading } = usePendingAppointments();
  const pathname = usePathname();
  const { theme } = useTheme();

  const navigationItems = [
    {
      name: t('home'),
      href: '/dashboard/home',
      icon: Home,
    },
    // {
    //   name: t('dashboard'),
    //   href: '/dashboard',
    //   icon: BarChart3,
    // },
    {
      name: t('schedule'),
      href: '/dashboard/pending-appointments',
      icon: Calendar,
      badge: !loading ? pendingCount : undefined,
    },
    {
      name: 'Products',
      href: '/dashboard/products',
      icon: Package,
    },
    {
      name: t('clients'),
      href: '/dashboard/clients',
      icon: Users,
    },
    {
      name: t('settings'),
      href: '/dashboard/settings',
      icon: Settings,
    },
  ];

  const toggleMobile = () => setIsMobileOpen(!isMobileOpen);
  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "fixed top-4 z-50 md:hidden bg-orange-500 hover:bg-orange-600 backdrop-blur-sm border border-orange-500 shadow-sm text-white",
          isMobileOpen ? "right-4" : "left-4"
        )}
        aria-label={isMobileOpen ? 'Close sidebar' : 'Open sidebar'}
        onClick={toggleMobile}
      >
        {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={toggleMobile}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-lg transition-transform duration-300 ease-in-out",
          "md:translate-x-0 md:static md:z-auto md:shadow-none md:flex md:flex-shrink-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo section */}
          <div className="flex items-center justify-center p-6 border-b border-gray-200 dark:border-gray-700">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="relative w-28 h-28">
                <Image
                  src={theme === 'dark' ? "/Logo.png" : "/Logo-Dark.png"}
                  alt="Urban Contractors Logo"
                  fill
                  className="object-contain"
                />
              </div>
              {/* <span className="text-xl font-bold text-gray-900 dark:text-white">
                Urban Contractors
              </span> */}
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'));
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200",
                    isActive
                      ? "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-orange-500 rounded-full min-w-[20px] h-5 ml-auto mr-4">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Bottom section */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            {/* <Button
              variant="ghost"
              className="w-full justify-start text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <LogOut className="h-5 w-5 mr-3" />
              {t('logout')}
            </Button> */}
            <ProfileDropdown/>
          </div>
        </div>
      </aside>
    </>
  );
}
