import { Link } from 'react-router-dom';

const MarketInsights = () => {
  return (
    <div className="pb-8 h-full flex flex-col bg-bg-base overflow-y-auto">
      <div className="bg-panel-solid border-b border-panel-border px-6 pt-12 md:pt-6 pb-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <Link to="/mobile/exec/dashboard" className="text-text-main bg-panel-border p-2 rounded-full">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
          </Link>
          <h1 className="text-lg font-bold text-text-main leading-tight">Market Insights</h1>
        </div>
      </div>

      <div className="p-6">
        {/* Brand Perception Mini Chart */}
        <div className="bg-panel-solid border border-panel-border rounded-2xl p-5 shadow-sm mb-6">
          <h3 className="font-bold text-text-main text-sm mb-4">Competitor Display Dominance</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1 font-medium"><span className="text-text-sub">Advance Telecom</span><span className="text-slate-500">45%</span></div>
              <div className="w-full bg-panel-border rounded-full h-2"><div className="bg-slate-600 h-2 rounded-full" style={{width: '45%'}}></div></div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1 font-medium"><span className="text-text-sub">Competitor X</span><span className="text-danger-text">30%</span></div>
              <div className="w-full bg-panel-border rounded-full h-2"><div className="bg-rose-500 h-2 rounded-full" style={{width: '30%'}}></div></div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1 font-medium"><span className="text-text-sub">Competitor Y</span><span className="text-orange-500">15%</span></div>
              <div className="w-full bg-panel-border rounded-full h-2"><div className="bg-orange-500 h-2 rounded-full" style={{width: '15%'}}></div></div>
            </div>
          </div>
        </div>

        {/* Pricing Alerts */}
        <h3 className="font-bold text-text-main mb-3 text-sm uppercase tracking-wider">Critical Pricing Alerts</h3>
        <div className="space-y-3">
          <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 text-rose-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"></path></svg>
              </div>
              <div>
                <h4 className="font-bold text-rose-900 text-sm">Competitor X Dropped Price</h4>
                <p className="text-xs text-rose-800 mt-1">Their flagship fiber plan was reported at $49.99 (down from $55) in 42 shops today.</p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 text-amber-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              </div>
              <div>
                <h4 className="font-bold text-amber-900 text-sm">Dealer Incentive Program</h4>
                <p className="text-xs text-amber-800 mt-1">Competitor Y launched a new signup bonus scheme. High churn risk in South Region.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketInsights;
