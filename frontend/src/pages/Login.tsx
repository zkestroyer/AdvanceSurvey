import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Mail, Lock, ShieldCheck, ChevronRight } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('admin@advancetelecom.com');
  const [password, setPassword] = useState('password123');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Modal states
  const [showForgotPwd, setShowForgotPwd] = useState(false);
  const [showContactAdmin, setShowContactAdmin] = useState(false);
  const [modalEmail, setModalEmail] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalStatus, setModalStatus] = useState({ loading: false, message: '', error: false, mockLink: '' });
  
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password, platform: 'web', remember: rememberMe });
      if (response.data.success) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        if (rememberMe) {
          localStorage.setItem('session_type', 'extended');
        } else {
          localStorage.setItem('session_type', 'normal');
        }
        navigate('/dashboard');
      } else {
        setError(response.data.message || 'Login failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Server connection error');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalStatus({ loading: true, message: '', error: false, mockLink: '' });
    try {
      const res = await api.post('/auth/forgot-password', { email: modalEmail });
      setModalStatus({ loading: false, message: res.data.message, error: false, mockLink: res.data.mockLink || '' });
    } catch (err: any) {
      setModalStatus({ loading: false, message: err.response?.data?.message || 'Error processing request', error: true, mockLink: '' });
    }
  };

  const handleContactAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalStatus({ loading: true, message: '', error: false, mockLink: '' });
    try {
      const res = await api.post('/auth/support-ticket', { email: email, name: 'Guest User', message: modalMessage });
      setModalStatus({ loading: false, message: res.data.message, error: false, mockLink: '' });
    } catch (err: any) {
      setModalStatus({ loading: false, message: err.response?.data?.message || 'Error processing request', error: true, mockLink: '' });
    }
  };

  return (
    <div className="min-h-screen flex w-full font-['Inter'] bg-panel-solid/30">
      {/* Left Branding Panel */}
      <div className="hidden lg:flex w-1/2 bg-panel-solid relative overflow-hidden flex-col justify-between p-12">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-slate-600/30 to-slate-500/10 blur-3xl opacity-50 animate-pulse"></div>
          <div className="absolute bottom-[10%] -right-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tl from-slate-500/20 to-teal-400/10 blur-3xl opacity-60"></div>
          
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] bg-[length:20px_20px]"></div>
        </div>

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-12 h-12 bg-gradient-to-br from-slate-500 to-slate-400 rounded-xl flex items-center justify-center shadow-lg">
              <ShieldCheck className="text-text-main w-7 h-7" />
            </div>
            <span className="text-text-main font-['Outfit'] font-bold text-2xl tracking-wide">Advance Telecom</span>
          </div>

          <div className="max-w-md">
            <h1 className="text-4xl md:text-5xl font-['Outfit'] font-bold text-text-main leading-tight mb-6">
              Empowering Field Operations with <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-400 to-slate-400">Intelligent Data.</span>
            </h1>
            <p className="text-text-sub text-lg leading-relaxed mb-8">
              Streamline market surveys, track real-time analytics, and manage trade programs from a single, powerful command center.
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-3">
              <span className="px-4 py-2 rounded-full /10 glass-input  text-text-main text-sm backdrop-blur-md">Dynamic Surveys</span>
              <span className="px-4 py-2 rounded-full /10 glass-input  text-text-main text-sm backdrop-blur-md">Geo-Fencing</span>
              <span className="px-4 py-2 rounded-full /10 glass-input  text-text-main text-sm backdrop-blur-md">Offline Sync</span>
              <span className="px-4 py-2 rounded-full /10 glass-input  text-text-main text-sm backdrop-blur-md">Real-time Analytics</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-text-muted text-sm">
          &copy; {new Date().getFullYear()} Advance Telecom. Enterprise Survey System.
        </div>
      </div>

      {/* Right Login Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <div className="w-full max-w-md">
          <div className="text-center lg:text-left mb-10">
            {/* Mobile Logo */}
            <div className="lg:hidden w-16 h-16 bg-gradient-to-br from-slate-500 to-slate-400 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-lg shadow-slate-200/50">
              <ShieldCheck className="text-text-main w-8 h-8" />
            </div>
            
            <h2 className="font-['Outfit'] font-bold text-3xl sm:text-4xl text-text-main tracking-tight mb-2">Welcome Back</h2>
            <p className="text-text-muted">Sign in to your enterprise account to continue.</p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg mb-8 flex items-start shadow-sm" role="alert">
              <svg className="w-5 h-5 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-semibold text-text-sub mb-2">Corporate Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-text-muted" />
                </div>
                <input 
                  type="email" 
                  placeholder="name@telecom.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-panel-border bg-transparent focus:bg-transparent focus:outline-none focus:ring-2 focus:ring-slate-500/50 focus:border-slate-400 transition-all placeholder-slate-400 shadow-sm"
                  required
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-text-sub">Password</label>
                <button type="button" onClick={() => { setShowForgotPwd(true); setModalStatus({ loading: false, message: '', error: false, mockLink: '' }); setModalEmail(email); }} className="text-sm text-slate-400 hover:text-slate-700 font-medium transition-colors">Forgot password?</button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-text-muted" />
                </div>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-panel-border bg-transparent focus:bg-transparent focus:outline-none focus:ring-2 focus:ring-slate-500/50 focus:border-slate-400 transition-all placeholder-slate-400 shadow-sm"
                  required
                />
              </div>
            </div>

            <div className="flex items-center">
              <input id="remember-me" type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="w-4 h-4 rounded border-panel-border text-slate-400 focus:ring-slate-500 focus:ring-offset-0 transition-all cursor-pointer" />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-text-muted cursor-pointer select-none">
                Remember my device for 30 days
              </label>
            </div>

            <button 
              disabled={loading} 
              type="submit" 
              className="w-full flex items-center justify-center gap-2 bg-panel-solid hover:bg-slate-500 text-text-main font-semibold py-3.5 rounded-xl transition-all duration-300 shadow-lg hover:shadow-slate-500/30 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group mt-8"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-text-main" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Authenticating...
                </>
              ) : (
                <>
                  Sign In to Dashboard
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center lg:text-left">
            <p className="text-sm text-text-muted">
              Need access? <button type="button" onClick={() => { setShowContactAdmin(true); setModalStatus({ loading: false, message: '', error: false, mockLink: '' }); setModalMessage(''); }} className="text-slate-400 font-medium hover:underline">Contact System Administrator</button>
            </p>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPwd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-panel-solid rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-panel-border">
            <h3 className="font-['Outfit'] text-xl font-bold text-text-main mb-2">Reset Password</h3>
            <p className="text-text-muted text-sm mb-6">Enter your email address and we'll send you a link to reset your password.</p>
            {modalStatus.message && (
              <div className={`p-3 rounded-lg mb-4 text-sm ${modalStatus.error ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                {modalStatus.message}
                {modalStatus.mockLink && (
                  <div className="mt-2 pt-2 border-t border-green-200">
                    <p className="font-semibold mb-1">Development Mode Link:</p>
                    <a href={modalStatus.mockLink} className="text-teal-600 underline break-all">{modalStatus.mockLink}</a>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleForgotPassword}>
              <input 
                type="email" 
                value={modalEmail}
                onChange={(e) => setModalEmail(e.target.value)}
                placeholder="name@telecom.com"
                className="w-full px-4 py-3 rounded-xl border border-panel-border bg-transparent focus:outline-none focus:border-slate-400 mb-4"
                required
              />
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowForgotPwd(false)} className="flex-1 px-4 py-2 rounded-xl text-text-sub hover:bg-slate-100 transition-colors">Cancel</button>
                <button type="submit" disabled={modalStatus.loading} className="flex-1 px-4 py-2 rounded-xl bg-slate-800 text-white hover:bg-slate-700 transition-colors disabled:opacity-70">
                  {modalStatus.loading ? 'Sending...' : 'Send Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contact Admin Modal */}
      {showContactAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-panel-solid rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-panel-border">
            <h3 className="font-['Outfit'] text-xl font-bold text-text-main mb-2">Contact Admin</h3>
            <p className="text-text-muted text-sm mb-6">Send a message directly to the system administrator to request access or report an issue.</p>
            
            {modalStatus.message && (
              <div className={`p-3 rounded-lg mb-4 text-sm ${modalStatus.error ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                {modalStatus.message}
              </div>
            )}

            <form onSubmit={handleContactAdmin}>
              <textarea 
                value={modalMessage}
                onChange={(e) => setModalMessage(e.target.value)}
                placeholder="Your message here..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-panel-border bg-transparent focus:outline-none focus:border-slate-400 mb-4 resize-none"
                required
              ></textarea>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowContactAdmin(false)} className="flex-1 px-4 py-2 rounded-xl text-text-sub hover:bg-slate-100 transition-colors">Cancel</button>
                <button type="submit" disabled={modalStatus.loading} className="flex-1 px-4 py-2 rounded-xl bg-slate-800 text-white hover:bg-slate-700 transition-colors disabled:opacity-70">
                  {modalStatus.loading ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
