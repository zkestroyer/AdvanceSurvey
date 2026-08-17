import { Link } from 'react-router-dom';

const ShopDirectory = () => {
  return (
    <div className="pb-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-600 to-slate-500 px-6 pt-12 md:pt-6 pb-6 rounded-b-[2rem] text-text-main shadow-lg shadow-slate-500/20">
        <div className="flex justify-between items-center mb-4">
          <Link to="/mobile/dashboard" className="text-text-main bg-panel-solid/20 p-2 rounded-full backdrop-blur-md">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
          </Link>
          <h1 className="text-xl font-bold font-['Outfit']">My Assigned Shops</h1>
          <button className="text-text-main bg-panel-solid/20 p-2 rounded-full backdrop-blur-md">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg>
          </button>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-200">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
          <input type="text" className="w-full pl-10 pr-4 py-2.5 bg-panel-solid/20 border border-white/30 rounded-xl text-text-main placeholder-slate-100 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-md" placeholder="Search by name, ID or area..." />
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 mt-4 flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        <button className="whitespace-nowrap px-4 py-1.5 bg-slate-600 text-text-main rounded-full text-xs font-medium shadow-sm">All (245)</button>
        <button className="whitespace-nowrap px-4 py-1.5 bg-panel-solid border border-panel-border text-text-muted rounded-full text-xs font-medium shadow-sm">Pending (12)</button>
        <button className="whitespace-nowrap px-4 py-1.5 bg-panel-solid border border-panel-border text-text-muted rounded-full text-xs font-medium shadow-sm">Visited (233)</button>
        <button className="whitespace-nowrap px-4 py-1.5 bg-panel-solid border border-panel-border text-text-muted rounded-full text-xs font-medium shadow-sm">Requires Attention</button>
      </div>

      {/* List */}
      <div className="px-6 mt-4 space-y-3">
        <div className="bg-panel-solid border border-panel-border rounded-2xl p-4 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 bg-slate-50 text-slate-500 rounded-xl flex items-center justify-center font-bold text-lg border border-slate-100">
            QS
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-text-main text-sm">Quick Stop Grocers</h3>
                <p className="text-[10px] text-text-muted">ID: SH-9021 • Category: A</p>
              </div>
              <span className="w-2 h-2 rounded-full bg-rose-500 mt-1 shadow-sm"></span>
            </div>
            <p className="text-xs text-text-muted flex items-center gap-1 mt-2">
              <svg className="w-3.5 h-3.5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
              F-8 Markaz, Islamabad
            </p>
            <div className="mt-3 flex gap-2">
              <Link 
                to="/mobile/check-in" 
                state={{ shop: { name: 'Quick Stop Grocers', id: 'SH-9021', city: 'Islamabad', address: 'F-8 Markaz, Islamabad' } }}
                className="flex-1 text-center py-2 bg-slate-600 text-text-main rounded-lg text-xs font-semibold shadow-md hover:bg-slate-700 active:scale-95 transition-all"
              >
                Check-in
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-panel-solid border border-panel-border rounded-2xl p-4 shadow-sm flex items-start gap-4 opacity-75">
          <div className="w-12 h-12 bg-bg-base text-text-muted rounded-xl flex items-center justify-center font-bold text-lg border border-panel-border">
            ST
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-text-main text-sm">Star Telecom</h3>
                <p className="text-[10px] text-text-muted">ID: SH-4412 • Category: B</p>
              </div>
              <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-bold">Visited</span>
            </div>
            <p className="text-xs text-text-muted flex items-center gap-1 mt-2">
              <svg className="w-3.5 h-3.5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
              Blue Area, Islamabad
            </p>
            <div className="mt-3 flex gap-2">
              <button disabled className="flex-1 text-center py-2 bg-panel-border text-text-muted rounded-lg text-xs font-semibold">Done Today</button>
            </div>
          </div>
        </div>

        <div className="bg-panel-solid border border-panel-border rounded-2xl p-4 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 bg-slate-50 text-slate-500 rounded-xl flex items-center justify-center font-bold text-lg border border-slate-100">
            MM
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-text-main text-sm">Mega Mobile</h3>
                <p className="text-[10px] text-text-muted">ID: SH-1102 • Category: A</p>
              </div>
            </div>
            <p className="text-xs text-text-muted flex items-center gap-1 mt-2">
              <svg className="w-3.5 h-3.5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
              G-9 Markaz, Islamabad
            </p>
            <div className="mt-3 flex gap-2">
              <Link 
                to="/mobile/check-in" 
                state={{ shop: { name: 'Mega Mobile', id: 'SH-1102', city: 'Islamabad', address: 'G-9 Markaz, Islamabad' } }}
                className="flex-1 text-center py-2 bg-slate-600 text-text-main rounded-lg text-xs font-semibold shadow-md hover:bg-slate-700 active:scale-95 transition-all"
              >
                Check-in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopDirectory;
