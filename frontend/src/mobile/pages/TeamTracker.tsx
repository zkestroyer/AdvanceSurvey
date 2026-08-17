import { Link } from 'react-router-dom';

const TeamTracker = () => {
  return (
    <div className="pb-8 h-full flex flex-col bg-bg-base">
      <div className="bg-panel-solid border-b border-panel-border px-6 pt-12 md:pt-6 pb-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <Link to="/mobile/exec/dashboard" className="text-text-main bg-panel-border p-2 rounded-full">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
          </Link>
          <h1 className="text-lg font-bold text-text-main leading-tight">Team Tracker</h1>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col relative">
        {/* Map Background Placeholder */}
        <div className="absolute inset-0 opacity-30 mix-blend-multiply pointer-events-none" style={{ backgroundImage: 'url(https://www.transparenttextures.com/patterns/cartographer.png)' }}></div>
        
        <div className="relative z-10 flex-1 flex flex-col">
          <div className="bg-panel-bg backdrop-blur-md border border-panel-border rounded-2xl p-4 shadow-sm mb-4">
             <div className="relative">
              <input type="text" className="w-full pl-10 pr-4 py-2 bg-panel-solid border border-panel-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-500" placeholder="Search TSO or BDM..." />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-panel-solid/90 backdrop-blur-md border border-panel-border rounded-2xl p-4 shadow-sm">
              <div className="flex justify-between items-start">
                <div className="flex gap-3 items-center">
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-emerald-500">
                     <img src="https://ui-avatars.com/api/?name=Ali+Jafri&background=random" alt="Ali" />
                  </div>
                  <div>
                    <h4 className="font-bold text-text-main text-sm">Ali Jafri (TSO)</h4>
                    <p className="text-xs text-text-muted flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Online • Blue Area
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex gap-4 text-xs font-medium text-text-muted">
                <span>Visited: <strong className="text-text-main">12</strong></span>
                <span>Pending: <strong className="text-text-main">4</strong></span>
              </div>
            </div>

            <div className="bg-panel-solid/90 backdrop-blur-md border border-panel-border rounded-2xl p-4 shadow-sm opacity-60">
              <div className="flex justify-between items-start">
                <div className="flex gap-3 items-center">
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-slate-300">
                     <img src="https://ui-avatars.com/api/?name=Usman+K&background=random" alt="Usman" />
                  </div>
                  <div>
                    <h4 className="font-bold text-text-main text-sm">Usman Khalid (TSO)</h4>
                    <p className="text-xs text-text-muted flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-text-muted rounded-full"></span> Offline • F-8 Markaz
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex gap-4 text-xs font-medium text-text-muted">
                <span>Visited: <strong className="text-text-main">8</strong></span>
                <span>Pending: <strong className="text-text-main">15</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamTracker;
