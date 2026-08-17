import { Outlet, Link, useLocation } from 'react-router-dom';

const MobileLayout = () => {
  const location = useLocation();
  const path = location.pathname;

  return (
    <div className="min-h-screen bg-panel-solid flex items-center justify-center p-0 md:p-8">
      {/* Device Frame */}
      <div className="w-full h-screen md:h-[850px] md:w-[400px] bg-bg-base md:rounded-[3rem] relative overflow-hidden md:border-[8px] md:border-panel-solid shadow-2xl flex flex-col">
        
        {/* Mock Status Bar (Desktop only) */}
        <div className="hidden md:flex justify-between items-center px-6 py-3 bg-bg-base text-xs font-medium text-text-main z-50">
          <span>9:41</span>
          <div className="flex gap-2 items-center">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h2v2h-2zm0-10h2v8h-2z"/></svg>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M2 22h20V2z"/></svg>
            <svg className="w-5 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4z"/></svg>
          </div>
        </div>

        {/* Dynamic Content Area */}
        <div className="flex-1 overflow-y-auto bg-bg-base relative pb-20">
          <Outlet />
        </div>

        {/* Bottom Navigation */}
        <div className="absolute bottom-0 w-full bg-panel-bg backdrop-blur-xl border-t border-panel-border px-6 py-4 flex justify-between items-center z-50">
          <Link to="/mobile/dashboard" className={`flex flex-col items-center gap-1 ${path.includes('/dashboard') ? 'text-slate-500' : 'text-text-muted hover:text-text-muted'}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
            <span className="text-[10px] font-medium">Home</span>
          </Link>
          <Link to="/mobile/shops" className={`flex flex-col items-center gap-1 ${path.includes('/shops') ? 'text-slate-500' : 'text-text-muted hover:text-text-muted'}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
            <span className="text-[10px] font-medium">Shops</span>
          </Link>
          <Link to="/mobile/sync" className={`flex flex-col items-center gap-1 relative ${path.includes('/sync') ? 'text-slate-500' : 'text-text-muted hover:text-text-muted'}`}>
            <div className="absolute -top-1 -right-2 w-3 h-3 bg-rose-500 rounded-full border-2 border-white"></div>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
            <span className="text-[10px] font-medium">Sync</span>
          </Link>
          <Link to="/mobile/profile" className={`flex flex-col items-center gap-1 ${path.includes('/profile') ? 'text-slate-500' : 'text-text-muted hover:text-text-muted'}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
            <span className="text-[10px] font-medium">Profile</span>
          </Link>
        </div>

        {/* Home Indicator (iOS line) */}
        <div className="hidden md:block absolute bottom-2 left-1/2 transform -translate-x-1/2 w-1/3 h-1 bg-panel-border rounded-full z-50"></div>
      </div>
    </div>
  );
};

export default MobileLayout;
