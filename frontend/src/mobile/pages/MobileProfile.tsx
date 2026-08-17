import { Link } from 'react-router-dom';

const MobileProfile = () => {
  return (
    <div className="pb-8 h-full flex flex-col bg-bg-base overflow-y-auto">
      {/* Header Profile Area */}
      <div className="bg-gradient-to-br from-slate-600 to-slate-500 px-6 pt-12 md:pt-6 pb-8 text-text-main relative overflow-hidden shadow-lg shadow-slate-500/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-panel-solid/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="flex flex-col items-center relative z-10 mt-4">
          <div className="w-24 h-24 rounded-full bg-panel-solid/20 border-4 border-white/50 overflow-hidden shadow-xl mb-4">
            <img src="https://ui-avatars.com/api/?name=Ali+Jafri&background=random" alt="Profile" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-bold font-['Outfit']">Ali Jafri</h1>
          <p className="text-slate-100 text-sm font-medium mt-1">Territory Sales Officer (TSO)</p>
          <div className="mt-3 px-3 py-1 bg-panel-solid/20 rounded-full text-xs font-semibold backdrop-blur-sm border border-white/30 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Active
          </div>
        </div>
      </div>

      <div className="p-6 flex-1">
        {/* Territory Info */}
        <div className="bg-panel-solid border border-panel-border rounded-2xl p-5 shadow-sm mb-6 -mt-10 relative z-20">
          <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Assigned Territory</h3>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-slate-50 text-slate-500 rounded-xl flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            </div>
            <div>
              <h4 className="font-bold text-text-main">Islamabad North</h4>
              <p className="text-xs text-text-muted mt-1">Includes F-8, F-10, G-9, and Blue Area sectors. Assigned to 245 active shops.</p>
            </div>
          </div>
        </div>

        {/* Settings Menu */}
        <h3 className="font-bold text-text-main mb-3 text-sm">Account Settings</h3>
        <div className="bg-panel-solid border border-panel-border rounded-2xl shadow-sm overflow-hidden mb-6">
          <button className="w-full p-4 flex items-center justify-between border-b border-panel-border hover:bg-bg-base transition-colors">
            <div className="flex items-center gap-3">
              <div className="text-text-muted"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg></div>
              <span className="text-sm font-medium text-text-sub">Edit Profile</span>
            </div>
            <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
          </button>
          
          <button className="w-full p-4 flex items-center justify-between border-b border-panel-border hover:bg-bg-base transition-colors">
            <div className="flex items-center gap-3">
              <div className="text-text-muted"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg></div>
              <span className="text-sm font-medium text-text-sub">Change PIN</span>
            </div>
            <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
          </button>
          
          <button className="w-full p-4 flex items-center justify-between hover:bg-bg-base transition-colors">
            <div className="flex items-center gap-3">
              <div className="text-text-muted"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"></path></svg></div>
              <span className="text-sm font-medium text-text-sub">Support Center</span>
            </div>
            <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
          </button>
        </div>

        {/* Logout */}
        <Link to="/mobile/login" className="w-full p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-center gap-2 text-rose-600 font-bold active:bg-rose-100 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          Secure Logout
        </Link>
        
        <p className="text-center text-xs text-text-muted mt-6">App Version 2.1.0 (Build 44)</p>
      </div>
    </div>
  );
};

export default MobileProfile;
