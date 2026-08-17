import { Link } from 'react-router-dom';

const TSODashboard = () => {
  return (
    <div className="pb-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-600 to-slate-500 px-6 pt-12 md:pt-6 pb-20 rounded-b-[2rem] text-text-main relative overflow-hidden shadow-lg shadow-slate-500/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-panel-solid/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="flex justify-between items-center relative z-10">
          <div>
            <p className="text-slate-100 text-sm font-medium">Good Morning,</p>
            <h1 className="text-2xl font-bold font-['Outfit']">Ali Jafri</h1>
          </div>
          <div className="w-12 h-12 rounded-full bg-panel-solid/20 border-2 border-white/50 overflow-hidden shadow-inner">
            <img src="https://ui-avatars.com/api/?name=Ali+Jafri&background=random" alt="Profile" />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-6 -mt-12 relative z-20 flex gap-4">
        <div className="flex-1 bg-panel-solid rounded-2xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-panel-border flex flex-col justify-center">
          <p className="text-xs text-text-muted font-medium mb-1">Today's Target</p>
          <h2 className="text-2xl font-bold text-text-main">12<span className="text-sm font-normal text-text-muted ml-1">shops</span></h2>
        </div>
        <div className="flex-1 bg-panel-solid rounded-2xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-panel-border flex flex-col justify-center">
          <p className="text-xs text-text-muted font-medium mb-1">Completed</p>
          <h2 className="text-2xl font-bold text-emerald-600">8<span className="text-sm font-normal text-text-muted ml-1">shops</span></h2>
        </div>
      </div>

      <div className="px-6 mt-8">
        <h3 className="font-bold text-text-main mb-4 text-lg font-['Outfit']">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-4">
          <Link to="/mobile/shops" className="bg-gradient-to-br from-slate-50 to-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col items-center text-center active:scale-95 transition-transform">
            <div className="w-12 h-12 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center mb-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
            </div>
            <span className="text-sm font-semibold text-text-main">My Shops</span>
          </Link>
          <Link to="/mobile/sync" className="bg-gradient-to-br from-slate-50 to-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col items-center text-center active:scale-95 transition-transform relative">
            <div className="absolute top-3 right-3 w-3 h-3 bg-rose-500 rounded-full shadow-sm"></div>
            <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center mb-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
            </div>
            <span className="text-sm font-semibold text-text-main">Offline Sync</span>
          </Link>
        </div>
      </div>

      <div className="px-6 mt-8">
        <div className="flex justify-between items-end mb-4">
          <h3 className="font-bold text-text-main text-lg font-['Outfit']">Pending Visits</h3>
          <Link to="/mobile/shops" className="text-slate-500 text-xs font-semibold hover:underline">View All</Link>
        </div>
        
        <div className="space-y-3">
          <Link to="/mobile/check-in" className="block bg-panel-solid border border-panel-border rounded-2xl p-4 shadow-sm active:bg-bg-base transition-colors">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-semibold text-text-main text-sm">Quick Stop Grocers</h4>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-rose-100 text-rose-700 rounded-md">High Priority</span>
            </div>
            <p className="text-xs text-text-muted flex items-center gap-1 mb-3">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              Sector F-8 Markaz, Islamabad
            </p>
            <div className="w-full text-center py-2 bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold">Start Survey</div>
          </Link>
          
          <Link to="/mobile/check-in" className="block bg-panel-solid border border-panel-border rounded-2xl p-4 shadow-sm active:bg-bg-base transition-colors">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-semibold text-text-main text-sm">Star Telecom</h4>
            </div>
            <p className="text-xs text-text-muted flex items-center gap-1 mb-3">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              Blue Area, Islamabad
            </p>
            <div className="w-full text-center py-2 bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold">Start Survey</div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TSODashboard;
