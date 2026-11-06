import React, { useState } from 'react';
import { UserRole, UserSession } from '../types';
import { StorageService } from '../utils/storage';
import { LogIn } from 'lucide-react';

interface LoginProps {
  onLogin: (session: UserSession) => void;
}

export const LoginModal: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Mock Authentication Logic
    // In production, this would be a secure API call
    let role: UserRole | null = null;
    let shiftName = '';

    if (username === 'admin' && password === 'admin123') {
      role = 'owner';
      shiftName = 'Owner / All Access';
    } else if (username === 'pagi' && password === 'pagi123') {
      role = 'shift_pagi';
      shiftName = 'Shift Pagi (07:00-15:00)';
    } else if (username === 'sore' && password === 'sore123') {
      role = 'shift_sore';
      shiftName = 'Shift Sore (15:00-23:00)';
    }

    if (role) {
      const session: UserSession = { username, role, shiftName };
      StorageService.saveSession(session);
      onLogin(session);
    } else {
      setError('Username atau password salah.');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm">
        <h2 className="text-xl font-black mb-6 text-slate-900">Login Karyawan</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button
            type="submit"
            className="w-full py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition"
          >
            Masuk
          </button>
        </form>
      </div>
    </div>
  );
};
