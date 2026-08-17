import { Link } from 'react-router-dom';

const ExecDashboard = () => {
  return (
    <div className="pb-8 bg-bg-base min-h-full">
      {/* Header */}
      <div className="bg-panel-solid px-6 pt-12 md:pt-6 pb-20 rounded-b-[2rem] text-text-main relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="flex justify-between items-center relative z-10 mb-4">
          <div>
            <p className="text-text-muted text-sm font-medium">Executive Overview</p>
            <h1 className="text-2xl font-bold font-['Outfit']">Management App</h1>
          </div>
          <div className="w-10 h-10 rounded-full bg-panel-solid/10 flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
          </div>
        </div>
      </div>

      {/* Main KPI Card */}
      <div className="px-6 -mt-14 relative z-20 mb-6">
        <div className="bg-gradient-to-br from-slate-600 to-slate-500 rounded-3xl p-6 text-text-main shadow-[0_8px_30px_rgba(99,102,241,0.3)]">
          <p className="text-slate-100 text-sm font-medium mb-1">Total Surveys Completed (Today)</p>
          <div className="flex items-end gap-3 mb-4">
            <h2 className="text-4xl font-bold font-['Outfit']">1,428</h2>
            <span className="text-emerald-300 text-sm font-bold flex items-center mb-1"><svg className="w-4 h-4 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg> 12%</span>
          </div>
          <div className="w-full bg-panel-solid/20 rounded-full h-1.5 mb-2">
             <div className="bg-panel-solid h-1.5 rounded-full" style={{width: '78%'}}></div>
          </div>
          <p className="text-xs text-slate-100 text-right">78% of Daily Target</p>
        </div>
      </div>

      {/* Grid Menu */}
      <div className="px-6 grid grid-cols-2 gap-4">
        <Link to="/mobile/exec/team" className="bg-panel-solid border border-panel-border rounded-2xl p-5 shadow-sm active:bg-bg-base transition-colors flex flex-col justify-center">
          <div className="w-10 h-10 bg-slate-50 text-slate-500 rounded-full flex items-center justify-center mb-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
          </div>
          <h3 className="font-bold text-text-main text-sm">Team Tracker</h3>
          <p className="text-xs text-text-muted mt-1">142 TSOs Active</p>
        </Link>
        <Link to="/mobile/exec/market" className="bg-panel-solid border border-panel-border rounded-2xl p-5 shadow-sm active:bg-bg-base transition-colors flex flex-col justify-center">
          <div className="w-10 h-10 bg-slate-50 text-slate-600 rounded-full flex items-center justify-center mb-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
          </div>
          <h3 className="font-bold text-text-main text-sm">Market Insights</h3>
          <p className="text-xs text-text-muted mt-1">Pricing & Competitors</p>
        </Link>
      </div>

      {/* Regional Performance */}
      <div className="px-6 mt-6">
        <h3 className="font-bold text-text-main mb-4 text-sm uppercase tracking-wider">Regional Performance</h3>
        <div className="space-y-3">
          <div className="bg-panel-solid border border-panel-border rounded-2xl p-4 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-panel-border rounded-full flex items-center justify-center font-bold text-text-sub">N</div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <h4 className="font-bold text-text-main text-sm">North Region</h4>
                <span className="text-emerald-600 font-bold text-xs">85% Target</span>
              </div>
              <div className="w-full bg-panel-border rounded-full h-1.5"><div className="bg-emerald-500 h-1.5 rounded-full" style={{width: '85%'}}></div></div>
            </div>
          </div>
          <div className="bg-panel-solid border border-panel-border rounded-2xl p-4 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-panel-border rounded-full flex items-center justify-center font-bold text-text-sub">S</div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <h4 className="font-bold text-text-main text-sm">South Region</h4>
                <span className="text-amber-500 font-bold text-xs">62% Target</span>
              </div>
              <div className="w-full bg-panel-border rounded-full h-1.5"><div className="bg-amber-500 h-1.5 rounded-full" style={{width: '62%'}}></div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecDashboard;
