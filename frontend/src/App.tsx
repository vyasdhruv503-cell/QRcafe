import React, { useEffect, useState } from 'react';
import { CustomerMenuPage } from './pages/CustomerMenuPage';
import { CustomerOrderTrackerPage } from './pages/CustomerOrderTrackerPage';
import { LoginPage } from './pages/LoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { KitchenKDSPage } from './pages/KitchenKDSPage';
import type { AuthUser } from './types';
import { api } from './services/api';

type ViewType = 'customer_menu' | 'customer_tracker' | 'login' | 'admin' | 'kitchen';

export const App: React.FC = () => {
  const [tableToken, setTableToken] = useState<string | null>(null);
  const [orderToken, setOrderToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [view, setView] = useState<ViewType>('customer_menu');
  const [isInitializing, setIsInitializing] = useState(true);

  // Helper to switch view and sync browser URL
  const navigateTo = (newView: ViewType, urlPath?: string) => {
    setView(newView);
    if (urlPath) {
      window.history.pushState({}, '', urlPath);
    } else {
      if (newView === 'admin') window.history.pushState({}, '', '/admin');
      else if (newView === 'kitchen') window.history.pushState({}, '', '/kitchen');
      else if (newView === 'login') window.history.pushState({}, '', '/login');
      else if (newView === 'customer_menu') window.history.pushState({}, '', '/');
    }
  };

  useEffect(() => {
    // 1. Check URL parameters for table or order tracking
    const searchParams = new URLSearchParams(window.location.search);
    const tableParam = searchParams.get('table');
    const orderParam = searchParams.get('order');
    const path = window.location.pathname;

    if (tableParam) {
      setTableToken(tableParam);
      setView('customer_menu');
      setIsInitializing(false);
      return;
    }

    if (orderParam) {
      setOrderToken(orderParam);
      setView('customer_tracker');
      setIsInitializing(false);
      return;
    }

    // 2. Check for active staff authentication
    const token = localStorage.getItem('cafeqr_token');
    if (token) {
      api
        .getMe()
        .then((res) => {
          setCurrentUser(res.user);
          if (path.includes('/kitchen')) {
            setView('kitchen');
          } else {
            setView('admin');
          }
        })
        .catch(() => {
          api.logout();
          if (path.includes('/admin') || path.includes('/kitchen')) {
            setView('login');
          } else {
            setTableToken('tok_table01_demo');
            setView('customer_menu');
          }
        })
        .finally(() => setIsInitializing(false));
    } else {
      if (path.includes('/admin') || path.includes('/kitchen') || path.includes('/login')) {
        setView('login');
      } else {
        setTableToken('tok_table01_demo');
        setView('customer_menu');
      }
      setIsInitializing(false);
    }

    // Listen for back/forward browser navigation
    const handlePopState = () => {
      const p = window.location.pathname;
      if (p.includes('/admin')) setView('admin');
      else if (p.includes('/kitchen')) setView('kitchen');
      else if (p.includes('/login')) setView('login');
      else setView('customer_menu');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleLoginSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    if (user.role === 'KITCHEN') {
      navigateTo('kitchen');
    } else {
      navigateTo('admin');
    }
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    navigateTo('login');
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-900 text-white">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-bold text-stone-400">Initializing CafeQR Platform...</p>
      </div>
    );
  }

  // --- RENDER VIEWS ---

  if (view === 'customer_tracker' && orderToken) {
    return (
      <CustomerOrderTrackerPage
        orderToken={orderToken}
        onBackToMenu={() => navigateTo('customer_menu')}
      />
    );
  }

  if (view === 'login') {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  if (view === 'admin') {
    if (!currentUser) {
      return <LoginPage onLoginSuccess={handleLoginSuccess} />;
    }
    return (
      <AdminDashboardPage
        user={currentUser}
        onLogout={handleLogout}
        onNavigateToKitchen={() => navigateTo('kitchen')}
        onNavigateToMenu={() => navigateTo('customer_menu')}
      />
    );
  }

  if (view === 'kitchen') {
    return (
      <KitchenKDSPage
        user={currentUser}
        onLogout={handleLogout}
        onNavigateToAdmin={currentUser?.role === 'ADMIN' ? () => navigateTo('admin') : undefined}
        onNavigateToMenu={() => navigateTo('customer_menu')}
      />
    );
  }

  // Customer Menu View (Default)
  return (
    <CustomerMenuPage
      tableToken={tableToken || 'tok_table01_demo'}
      onOrderPlaced={(token) => {
        setOrderToken(token);
        navigateTo('customer_tracker', `/?order=${token}`);
      }}
      onStaffLogin={() => navigateTo(currentUser ? (currentUser.role === 'KITCHEN' ? 'kitchen' : 'admin') : 'login')}
    />
  );
};
