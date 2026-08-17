import { Link } from 'react-router-dom';

const MobileLogin = () => {
  return (
    <div className="min-h-screen bg-panel-solid flex flex-col items-center justify-center relative overflow-hidden md:rounded-[2.5rem]">
      {/* Background Ornaments */}
      <div className="absolute top-[-10%] left-[-20%] w-[150%] h-[50%] bg-slate-600/30 blur-[80px] rounded-full mix-blend-screen pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-20%] w-[150%] h-[50%] bg-slate-600/30 blur-[80px] rounded-full mix-blend-screen pointer-events-none"></div>

      <div className="w-full max-w-sm px-8 relative z-10 flex flex-col items-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-500 to-slate-400 flex items-center justify-center shadow-xl mb-6 shadow-slate-500/20">
          <span className="font-bold font-['Outfit'] text-text-main text-3xl">CT</span>
        </div>
        
        <h1 className="font-['Outfit'] font-bold text-3xl tracking-wide text-text-main mb-2 text-center">Advance Telecom</h1>
        <p className="text-slate-200 text-sm text-center mb-10">Field Agent Portal</p>

        <div className="w-full bg-panel-solid/10 backdrop-blur-xl border border-panel-border p-6 rounded-3xl shadow-2xl">
          <h2 className="text-text-main font-semibold text-lg mb-4">Welcome Back</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-200 mb-1 ml-1">Agent ID</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                </div>
                <input type="text" className="w-full pl-11 pr-4 py-3 bg-panel-solid/5 border border-panel-border rounded-xl text-text-main placeholder-slate-300/50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all" placeholder="e.g. TSO-142" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-200 mb-1 ml-1">PIN</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                </div>
                <input type="password" className="w-full pl-11 pr-4 py-3 bg-panel-solid/5 border border-panel-border rounded-xl text-text-main placeholder-slate-300/50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all" placeholder="••••" />
              </div>
            </div>

            <Link to="/mobile/dashboard" className="block w-full text-center py-3 bg-gradient-to-r from-slate-500 to-slate-500 hover:from-slate-600 hover:to-slate-600 text-text-main rounded-xl font-medium shadow-lg shadow-slate-500/25 transition-all mt-6 active:scale-95">
              Secure Login
            </Link>
          </div>
        </div>
        
        <p className="text-xs text-slate-200/60 mt-8 text-center">Need help? Contact your BDM for login credentials.</p>
      </div>
    </div>
  );
};

export default MobileLogin;
