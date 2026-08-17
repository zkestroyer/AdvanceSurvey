import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (!token) {
      toast.error('Missing reset token');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/reset-password', { token, newPassword: password });
      if (res.data.success) {
        toast.success(res.data.message);
        navigate('/');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-transparent">
      <div className="glass-panel p-10 rounded-3xl shadow-2xl w-full max-w-md border border-panel-border relative z-10">
        <div className="mb-8">
          <h1 className="font-['Outfit'] font-bold text-3xl text-text-main tracking-tight">Set New Password</h1>
          <p className="text-text-muted mt-2 text-sm">Please enter your new password below.</p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-text-sub mb-2">New Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
              required
              className="w-full px-4 py-3 rounded-xl border border-panel-border bg-panel-bg focus:bg-panel-bg focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all placeholder-slate-400 backdrop-blur-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-sub mb-2">Confirm Password</label>
            <input 
              type="password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••" 
              required
              className="w-full px-4 py-3 rounded-xl border border-panel-border bg-panel-bg focus:bg-panel-bg focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all placeholder-slate-400 backdrop-blur-md"
            />
          </div>
          
          <button disabled={loading} type="submit" className="w-full bg-gradient-to-r from-slate-600 to-slate-500 hover:from-slate-500 hover:to-slate-400 text-text-main font-medium py-3 rounded-xl transition-all shadow-lg shadow-slate-200/50 active:scale-[0.98] disabled:opacity-70">
            {loading ? 'Updating...' : 'Update Password'}
          </button>

          <div className="text-center mt-4">
             <Link to="/" className="text-sm text-slate-400 hover:text-slate-300">Back to Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
