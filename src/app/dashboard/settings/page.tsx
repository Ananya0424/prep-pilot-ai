'use client';

import { useState, useEffect } from 'react';
import { Settings, Lock, CheckCircle2, AlertTriangle, Key, User as UserIcon } from 'lucide-react';

export default function SettingsPage() {
  const [user, setUser] = useState<{ email: string; name: string } | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.user) setUser(data.user);
      })
      .catch(() => {});
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update password');
      }

      setSuccess('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getDisplayName = () => {
    if (user?.name && user.name !== 'Candidate') return user.name;
    if (user?.email) {
      const prefix = user.email.split('@')[0];
      const clean = prefix.split('.')[0].replace(/[0-9]/g, '');
      return clean ? clean.charAt(0).toUpperCase() + clean.slice(1) : prefix;
    }
    return 'User';
  };

  return (
    <div className="min-h-screen bg-[#F8F9FF]">
      <div className="max-w-[800px] mx-auto px-6 sm:px-8 pt-8 pb-24 space-y-8">

        {/* Page Header */}
        <div>
          <h1 className="text-[24px] font-extrabold text-slate-900 tracking-tight">Account Settings</h1>
          <p className="text-[14px] text-slate-400 font-medium mt-1">
            Manage your account security and preferences.
          </p>
        </div>

        {/* Account Info Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <UserIcon className="w-4 h-4 text-indigo-600" />
            <span className="text-[13px] font-bold text-slate-800">Profile Information</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Display Name</p>
              <p className="text-[14px] font-bold text-slate-800">{getDisplayName()}</p>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Email Address</p>
              <p className="text-[14px] font-bold text-slate-800 truncate">{user?.email || 'Loading...'}</p>
            </div>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Key className="w-4 h-4 text-indigo-600" />
            <span className="text-[13px] font-bold text-slate-800">Change Password</span>
          </div>

          {error && (
            <div className="mb-5 flex items-center gap-2.5 p-3.5 bg-red-50 border border-red-100 rounded-xl text-[13px] text-red-700 font-medium">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-5 flex items-center gap-2.5 p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl text-[13px] text-emerald-700 font-medium">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <p>{success}</p>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Current Password
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-[#F8F9FF] border border-slate-200 rounded-xl text-[14px] font-medium text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                New Password
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-[#F8F9FF] border border-slate-200 rounded-xl text-[14px] font-medium text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-[#F8F9FF] border border-slate-200 rounded-xl text-[14px] font-medium text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white text-[13px] font-bold rounded-xl transition-all shadow-sm shadow-indigo-600/20 disabled:opacity-50"
              >
                {loading ? 'Updating Password...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
