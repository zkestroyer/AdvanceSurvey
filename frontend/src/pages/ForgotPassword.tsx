import { Link } from 'react-router-dom';

const ForgotPassword = () => {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-transparent">
      <div className="glass-panel p-10 rounded-3xl shadow-2xl w-full max-w-md border border-panel-border relative z-10">
        <div className="mb-8">
          <Link to="/" className="text-text-muted hover:text-slate-400 transition-colors flex items-center text-sm font-medium mb-6">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Back to login
          </Link>
          <h1 className="font-['Outfit'] font-bold text-3xl text-text-main tracking-tight">Reset Password</h1>
          <p className="text-text-muted mt-2 text-sm">Enter your email and we'll send you a link to reset your password.</p>
        </div>

        <form className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-text-sub mb-2">Email Address</label>
            <input 
              type="email" 
              placeholder="name@telecom.co" 
              className="w-full px-4 py-3 rounded-xl border border-panel-border bg-panel-bg focus:bg-panel-bg focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all placeholder-slate-400 backdrop-blur-md"
            />
          </div>
          
          <Link to="/reset-password" className="block w-full">
            <button type="button" className="w-full bg-gradient-to-r from-slate-600 to-slate-500 hover:from-slate-500 hover:to-slate-400 text-text-main font-medium py-3 rounded-xl transition-all shadow-lg shadow-slate-200/50 active:scale-[0.98]">
              Send Reset Link
            </button>
          </Link>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
