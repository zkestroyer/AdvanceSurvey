
const OfflineSync = () => {
  return (
    <div className="pb-8 h-full flex flex-col bg-bg-base">
      {/* Header */}
      <div className="bg-panel-solid border-b border-panel-border px-6 pt-12 md:pt-6 pb-4 shadow-sm flex items-center justify-between">
        <h1 className="text-xl font-bold font-['Outfit'] text-text-main">Offline Sync</h1>
        <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        {/* Status Card */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-text-main shadow-xl mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-slate-500/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 bg-panel-solid/10 rounded-full flex items-center justify-center border border-panel-border">
              <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
            </div>
            <div>
              <h2 className="text-xl font-bold">2 Pending</h2>
              <p className="text-xs text-text-muted mt-1">Surveys saved offline waiting for sync.</p>
            </div>
          </div>
          
          <button className="w-full mt-6 py-3 bg-slate-600 hover:bg-slate-500 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
            Sync Now
          </button>
        </div>

        <h3 className="font-bold text-text-main mb-3 text-sm">Offline Queue</h3>
        
        <div className="space-y-3">
          <div className="bg-panel-solid border border-panel-border rounded-2xl p-4 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-semibold text-text-main text-sm">Mega Mobile</h4>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-700 rounded-md">Pending</span>
            </div>
            <p className="text-xs text-text-muted mb-2">Q4 Field Audit</p>
            <p className="text-[10px] text-text-muted flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              Saved Today at 10:42 AM
            </p>
          </div>
          
          <div className="bg-panel-solid border border-panel-border rounded-2xl p-4 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-semibold text-text-main text-sm">City Communications</h4>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-700 rounded-md">Pending</span>
            </div>
            <p className="text-xs text-text-muted mb-2">Q4 Field Audit</p>
            <p className="text-[10px] text-text-muted flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              Saved Yesterday at 4:15 PM
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfflineSync;
