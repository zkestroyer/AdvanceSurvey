import { Link, useLocation } from 'react-router-dom';

const ShopCheckIn = () => {
  const location = useLocation();
  const shop = location.state?.shop || { name: 'Quick Stop Grocers', id: 'SH-9021', city: 'Islamabad', address: 'F-8 Markaz, Islamabad' };

  return (
    <div className="pb-8 h-full flex flex-col bg-bg-base">
      {/* Header */}
      <div className="bg-panel-solid border-b border-panel-border px-6 pt-12 md:pt-6 pb-4 flex items-center gap-4 sticky top-0 z-10 shadow-sm">
        <Link to="/mobile/shops" className="text-text-main bg-panel-border p-2 rounded-full">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
        </Link>
        <div>
          <h1 className="text-lg font-bold text-text-main leading-tight">{shop.name}</h1>
          <p className="text-xs text-text-muted">ID: {shop.id}</p>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        {/* GPS Status */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-6 flex gap-3 items-start">
          <div className="mt-0.5 text-emerald-600 bg-emerald-100 p-1.5 rounded-full">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <div>
            <h3 className="font-bold text-emerald-800 text-sm">GPS Location Verified</h3>
            <p className="text-xs text-emerald-700 mt-1">You are within 15 meters of the registered shop location.</p>
            <p className="text-[10px] text-emerald-600/80 font-mono mt-1">LAT: 33.7294, LNG: 73.0931</p>
          </div>
        </div>

        <div className="bg-panel-solid border border-panel-border rounded-2xl p-6 shadow-sm mb-6 flex-1 flex flex-col items-center justify-center">
          <div className="w-20 h-20 bg-slate-50 text-slate-500 rounded-full flex items-center justify-center mb-4">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
          </div>
          <h3 className="font-bold text-text-main text-center mb-2">Exterior Photo Required</h3>
          <p className="text-sm text-text-muted text-center mb-6">Please take a clear photo of the shop's exterior showing the signage before starting the survey.</p>
          
          <button className="w-full py-3 bg-panel-solid text-text-main rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:bg-panel-solid active:scale-95 transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path></svg>
            Open Camera
          </button>
        </div>

        <Link 
          to="/mobile/survey" 
          state={{ shop }}
          className="block w-full py-4 bg-gradient-to-r from-slate-600 to-slate-500 text-text-main rounded-xl font-bold text-center shadow-lg shadow-slate-500/30 active:scale-95 transition-transform"
        >
          Start Survey Form
        </Link>
      </div>
    </div>
  );
};

export default ShopCheckIn;
