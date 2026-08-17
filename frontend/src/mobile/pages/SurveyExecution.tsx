import { Link, useLocation } from 'react-router-dom';

const SurveyExecution = () => {
  const location = useLocation();
  const shop = location.state?.shop || { name: 'Quick Stop Grocers', city: 'Islamabad', address: 'F-8 Markaz, Near Main Boulevard' };

  return (
    <div className="pb-8 h-full flex flex-col bg-bg-base">
      {/* Header */}
      <div className="bg-panel-solid border-b border-panel-border px-6 pt-12 md:pt-6 pb-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <Link to="/mobile/check-in" className="text-text-muted hover:text-text-main">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </Link>
        <h1 className="text-lg font-bold text-text-main font-['Outfit']">Q4 Field Audit</h1>
        <div className="text-xs font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded">2/5</div>
      </div>

      <div className="p-6 flex-1 overflow-y-auto">
        <div className="space-y-6">
          
          {/* Outlet Name & Date (Auto-filled but editable for corrections) */}
          <div className="bg-panel-solid border border-panel-border rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-text-main text-sm mb-4">1. Outlet Information <span className="text-danger-text">*</span></h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">Name of Outlet</label>
                <input type="text" className="w-full border border-panel-border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 bg-bg-base" defaultValue={shop.name} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1">Date</label>
                  <input type="date" className="w-full border border-panel-border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 bg-bg-base text-text-muted" defaultValue="2023-10-24" readOnly />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1">City / Town</label>
                  <input type="text" className="w-full border border-panel-border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 bg-bg-base" defaultValue={shop.city} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">Full Address</label>
                <textarea className="w-full border border-panel-border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 bg-bg-base" rows={2} defaultValue={shop.address}></textarea>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="bg-panel-solid border border-panel-border rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-text-main text-sm mb-4">2. Contact Details <span className="text-danger-text">*</span></h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">Contact Person Name</label>
                <input type="text" className="w-full border border-panel-border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 bg-bg-base" placeholder="e.g. Ali Ahmed" />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">Contact No(s)</label>
                <input type="tel" className="w-full border border-panel-border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 bg-bg-base" placeholder="0300-XXXXXXX" />
              </div>
            </div>
          </div>

          {/* Classification */}
          <div className="bg-panel-solid border border-panel-border rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-text-main text-sm mb-4">3. Outlet Classification <span className="text-danger-text">*</span></h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-text-muted mb-2">Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center p-3 border border-panel-border rounded-xl cursor-pointer hover:bg-bg-base">
                    <input type="radio" name="type" className="text-slate-500 focus:ring-slate-500" />
                    <span className="ml-2 text-sm text-text-sub">Importer</span>
                  </label>
                  <label className="flex items-center p-3 border border-panel-border rounded-xl cursor-pointer hover:bg-bg-base">
                    <input type="radio" name="type" className="text-slate-500 focus:ring-slate-500" />
                    <span className="ml-2 text-sm text-text-sub">Distributor</span>
                  </label>
                  <label className="flex items-center p-3 border border-slate-200 bg-slate-50 rounded-xl cursor-pointer">
                    <input type="radio" name="type" className="text-slate-500 focus:ring-slate-500" defaultChecked />
                    <span className="ml-2 text-sm font-medium text-slate-900">Dealer</span>
                  </label>
                  <label className="flex items-center p-3 border border-panel-border rounded-xl cursor-pointer hover:bg-bg-base">
                    <input type="radio" name="type" className="text-slate-500 focus:ring-slate-500" />
                    <span className="ml-2 text-sm text-text-sub">Wholesaler</span>
                  </label>
                  <label className="flex items-center p-3 border border-panel-border rounded-xl cursor-pointer hover:bg-bg-base col-span-2">
                    <input type="radio" name="type" className="text-slate-500 focus:ring-slate-500" />
                    <span className="ml-2 text-sm text-text-sub">Retailer</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-muted mb-2">Classification</label>
                <div className="flex gap-2">
                  <label className="flex-1 flex items-center justify-center p-3 border border-panel-border rounded-xl cursor-pointer hover:bg-bg-base">
                    <input type="radio" name="class" className="sr-only peer" />
                    <span className="text-sm text-text-muted peer-checked:font-bold peer-checked:text-slate-500">Large</span>
                  </label>
                  <label className="flex-1 flex items-center justify-center p-3 border border-panel-border rounded-xl cursor-pointer bg-slate-50 border-slate-200">
                    <input type="radio" name="class" className="sr-only peer" defaultChecked />
                    <span className="text-sm font-bold text-slate-500">Medium</span>
                  </label>
                  <label className="flex-1 flex items-center justify-center p-3 border border-panel-border rounded-xl cursor-pointer hover:bg-bg-base">
                    <input type="radio" name="class" className="sr-only peer" />
                    <span className="text-sm text-text-muted peer-checked:font-bold peer-checked:text-slate-500">Small</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Product Mapping & Dynamic Inputs */}
          <div className="bg-panel-solid border border-panel-border rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-text-main text-sm mb-4">4. Product Information <span className="text-danger-text">*</span></h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">Brand</label>
                <select className="w-full border border-panel-border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 bg-bg-base">
                  <option>Select Brand</option>
                  <option>Samsung</option>
                  <option>Apple</option>
                  <option>Other</option>
                </select>
                <input type="text" className="w-full border border-panel-border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 bg-bg-base mt-2" placeholder="Please specify if Other..." />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">Model</label>
                <select className="w-full border border-panel-border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 bg-bg-base">
                  <option>Select Model</option>
                  <option>Galaxy S23</option>
                  <option>iPhone 15</option>
                  <option>Other</option>
                </select>
                <input type="text" className="w-full border border-panel-border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 bg-bg-base mt-2 hidden" placeholder="Please specify if Other..." />
              </div>
            </div>
            
            <button className="mt-4 w-full px-4 py-3 bg-panel-bg text-slate-500 border-2 border-slate-500 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-500/10">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
              Add Another Product
            </button>
          </div>

        </div>
      </div>

      <div className="p-4 bg-panel-solid border-t border-panel-border flex gap-3 sticky bottom-0">
        <button className="px-6 py-3 bg-panel-border text-text-sub rounded-xl font-bold text-sm">Save Draft</button>
        <Link to="/mobile/dashboard" className="flex-1 py-3 bg-gradient-to-r from-slate-600 to-slate-500 text-text-main rounded-xl font-bold text-sm text-center shadow-lg shadow-slate-500/30">
          Submit Survey
        </Link>
      </div>
    </div>
  );
};

export default SurveyExecution;
