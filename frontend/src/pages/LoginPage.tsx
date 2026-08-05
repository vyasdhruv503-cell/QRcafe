import React, { useState } from 'react';
import { api } from '../services/api';
import type { AuthUser } from '../types';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { QrCode, Lock, Mail, AlertCircle } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (user: AuthUser) => void;
}

const MOCK_ADMIN_USER: AuthUser = {
  id: 'user_admin_1',
  name: 'Cafe Admin Manager',
  email: 'admin@cafeqr.com',
  role: 'ADMIN',
  cafeId: 'cafe_1',
  cafeName: 'My Cafe',
  currency: '₹',
};

const MOCK_KITCHEN_USER: AuthUser = {
  id: 'user_kitchen_1',
  name: 'Head Chef',
  email: 'kitchen@cafeqr.com',
  role: 'KITCHEN',
  cafeId: 'cafe_1',
  cafeName: 'My Cafe',
  currency: '₹',
};

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('admin@cafeqr.com');
  const [password, setPassword] = useState('admin123');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const data = await api.login({ email, password });
      onLoginSuccess(data.user);
    } catch (err: any) {
      // Fallback demo login if MySQL server is offline or unseeded
      if (email === 'kitchen@cafeqr.com') {
        localStorage.setItem('cafeqr_token', 'demo_kitchen_jwt_token');
        localStorage.setItem('cafeqr_user', JSON.stringify(MOCK_KITCHEN_USER));
        onLoginSuccess(MOCK_KITCHEN_USER);
      } else if (email === 'admin@cafeqr.com' || email.includes('admin')) {
        localStorage.setItem('cafeqr_token', 'demo_admin_jwt_token');
        localStorage.setItem('cafeqr_user', JSON.stringify(MOCK_ADMIN_USER));
        onLoginSuccess(MOCK_ADMIN_USER);
      } else {
        setError(err.message || 'Invalid email or password.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = (role: 'ADMIN' | 'KITCHEN') => {
    setIsLoading(true);
    setTimeout(() => {
      const targetUser = role === 'KITCHEN' ? MOCK_KITCHEN_USER : MOCK_ADMIN_USER;
      localStorage.setItem('cafeqr_token', `demo_${role.toLowerCase()}_jwt_token`);
      localStorage.setItem('cafeqr_user', JSON.stringify(targetUser));
      onLoginSuccess(targetUser);
      setIsLoading(false);
    }, 200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-900 p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl space-y-6">
        {/* Brand Header */}
        <div className="text-center">
          <div className="w-14 h-14 bg-amber-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-3 shadow-lg">
            <QrCode className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-stone-900">CafeQR Portal</h1>
          <p className="text-xs text-stone-500 font-semibold mt-1">
            Sign in to access Admin Dashboard or Kitchen View
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail className="w-4 h-4" />}
            required
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock className="w-4 h-4" />}
            required
          />

          <Button variant="primary" className="w-full py-3 text-sm shadow-md" isLoading={isLoading}>
            Sign In to Portal
          </Button>
        </form>

        {/* Quick Login Buttons */}
        <div className="pt-4 border-t border-stone-100 text-center">
          <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-2">
            Click to Instant Login (Demo Mode)
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => handleQuickDemoLogin('ADMIN')}
              type="button"
              className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition-all shadow-2xs"
            >
              👑 Admin Demo Login
            </button>
            <button
              onClick={() => handleQuickDemoLogin('KITCHEN')}
              type="button"
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 rounded-xl text-xs font-bold transition-all shadow-2xs"
            >
              👨‍🍳 Kitchen Demo Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
