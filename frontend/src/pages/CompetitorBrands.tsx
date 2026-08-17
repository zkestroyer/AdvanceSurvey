import { useState, useMemo, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';

interface Competitor {
  id: string;
  name: string;
  flagshipProduct: string;
  price: number;
  threatLevel: string;
  marketShare: number;
}

const CompetitorBrands = () => {
  const [competitors, setCompetitors] = useState<any[]>([]);

  useEffect(() => {
    const fetchCompetitors = async () => {
      try {
        const res = await api.get('/master/competitors');
        if (res.data.success) {
          setCompetitors(res.data.data);
        }
      } catch (err) {
        toast.error('Failed to load competitors');
      }
    };
    fetchCompetitors();
  }, []);

  const advanceMarketShare = 42; // Base share for Advance Telecom
  
  const totalCompetitorShare = useMemo(() => {
    return competitors.reduce((acc, curr) => acc + curr.marketShare, 0);
  }, [competitors]);
  
  const othersShare = Math.max(0, 100 - advanceMarketShare - totalCompetitorShare);

  const [showBrandModal, setShowBrandModal] = useState(false);
  
  // Form State
  const [bName, setBName] = useState('');
  const [bProduct, setBProduct] = useState('');
  const [bThreat, setBThreat] = useState('Medium');
  const [bPrice, setBPrice] = useState('');
  const [bShare, setBShare] = useState('5');

  const handleAddCompetitor = async () => {
    if (!bName || !bProduct) return toast.error('Name and Product are required');
    
    try {
      const res = await api.post('/master/competitors', {
        name: bName,
        marketShare: parseFloat(bShare) || 5
      });
      if (res.data.success) {
        const newComp = res.data.data;
        setCompetitors([...competitors, { ...newComp, flagshipProduct: bProduct, price: parseFloat(bPrice)||0, threatLevel: bThreat }]);
        setShowBrandModal(false);
        setBName(''); setBProduct(''); setBPrice(''); setBShare('5');
        toast.success('Competitor brand added');
      }
    } catch(e) {
      toast.error('Failed to add competitor');
    }
  };

  const getThreatBadge = (level: string) => {
    switch(level) {
      case 'Critical': return <span className="px-2.5 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full font-medium text-xs">Critical</span>;
      case 'High': return <span className="px-2.5 py-1 bg-danger-bg text-danger-text border border-danger-border rounded-full font-medium text-xs">High</span>;
      case 'Medium': return <span className="px-2.5 py-1 bg-warning-bg text-warning-text border border-warning-border rounded-full font-medium text-xs">Medium</span>;
      case 'Low': return <span className="px-2.5 py-1 bg-success-bg text-success-text border border-success-border rounded-full font-medium text-xs">Low</span>;
      default: return null;
    }
  };

  // Color palette for dynamic bars
  const colors = ['bg-rose-500', 'bg-orange-500', 'bg-slate-500', 'bg-pink-500', 'bg-violet-500'];

  return (
    <main className="h-full flex flex-col p-6">
      <div className="flex justify-between items-end mb-6 shrink-0">
        <div>
          <h1 className="text-3xl font-bold font-['Outfit'] text-text-main">Competitor Brand Management</h1>
          <p className="text-text-muted mt-1">Track competitor products, share of shelf, and perception.</p>
        </div>
        
        <button onClick={() => setShowBrandModal(true)} className="glass-button px-5 py-2.5 rounded-xl font-medium shadow-sm flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          Add Competitor
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="glass-panel rounded-2xl p-6 border border-panel-border h-max">
          <h3 className="font-bold text-text-main mb-6">Market Share Estimates</h3>
          <div className="space-y-5">
            <div>
              <div className="flex justify-between text-sm mb-2"><span className="text-text-sub font-medium">Advance Telecom</span><span className="font-bold text-slate-400">{advanceMarketShare}%</span></div>
              <div className="w-full bg-panel-bg rounded-full h-2 overflow-hidden border border-panel-border"><div className="bg-slate-500 h-full rounded-full shadow-sm" style={{width: `${advanceMarketShare}%`}}></div></div>
            </div>
            
            {competitors.map((c, i) => (
              <div key={c.id}>
                <div className="flex justify-between text-sm mb-2"><span className="text-text-muted">{c.name}</span><span className={`font-bold text-${colors[i%colors.length].split('-')[1]}-400`}>{c.marketShare}%</span></div>
                <div className="w-full bg-panel-bg rounded-full h-2 overflow-hidden border border-panel-border"><div className={`${colors[i%colors.length]} h-full rounded-full`} style={{width: `${c.marketShare}%`}}></div></div>
              </div>
            ))}

            <div>
              <div className="flex justify-between text-sm mb-2"><span className="text-text-muted">Others</span><span className="font-bold text-text-muted">{othersShare}%</span></div>
              <div className="w-full bg-panel-bg rounded-full h-2 overflow-hidden border border-panel-border"><div className="bg-text-sub h-full rounded-full" style={{width: `${othersShare}%`}}></div></div>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-2xl border border-panel-border col-span-2 flex flex-col overflow-hidden">
          <div className="flex justify-between items-center p-6 border-b border-panel-border bg-panel-bg">
            <h3 className="font-bold text-text-main">Tracked Competitor Products</h3>
          </div>
          <div className="overflow-y-auto flex-1 p-2">
            <table className="w-full text-left border-collapse glass-table">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Brand</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Flagship Product</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Est. Retail Price</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Threat Level</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {competitors.map(c => (
                  <tr key={c.id} className="hover:bg-panel-bg transition-colors group">
                    <td className="px-4 py-4 font-bold text-text-main">{c.name}</td>
                    <td className="px-4 py-4 text-text-sub">{c.flagshipProduct || 'N/A'}</td>
                    <td className="px-4 py-4 text-slate-300 font-medium">${(c.price || 0).toFixed(2)}</td>
                    <td className="px-4 py-4">{getThreatBadge(c.threatLevel || 'Medium')}</td>
                    <td className="px-4 py-4 text-right opacity-100 ">
                       <button className="p-2 bg-panel-solid text-text-sub rounded-lg hover:bg-panel-border border border-panel-border" title="Edit Competitor">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showBrandModal && (
        <div className="fixed inset-0 bg-panel-bg backdrop-blur-md flex items-center justify-center z-50">
          <div className="glass-panel rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all border border-panel-border">
            <div className="p-6 border-b border-panel-border bg-panel-bg flex justify-between items-center">
              <h3 className="font-bold font-['Outfit'] text-xl text-text-main">Add Competitor</h3>
              <button onClick={() => setShowBrandModal(false)} className="text-text-muted hover:text-text-main transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-text-sub mb-2">Brand Name</label>
                <input value={bName} onChange={e=>setBName(e.target.value)} type="text" className="w-full px-4 py-3 glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500/50" placeholder="e.g. MegaCom" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-sub mb-2">Flagship Product</label>
                <input value={bProduct} onChange={e=>setBProduct(e.target.value)} type="text" className="w-full px-4 py-3 glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500/50" placeholder="e.g. Mega Fiber" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-sub mb-2">Price ($)</label>
                  <input value={bPrice} onChange={e=>setBPrice(e.target.value)} type="number" step="0.01" className="w-full px-4 py-3 glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500/50" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-sub mb-2">Market Share %</label>
                  <input value={bShare} onChange={e=>setBShare(e.target.value)} type="number" className="w-full px-4 py-3 glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500/50" placeholder="5" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-sub mb-2">Threat Level</label>
                <select value={bThreat} onChange={e=>setBThreat(e.target.value)} className="w-full px-4 py-3 glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500/50 appearance-none text-text-sub">
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                  <option>Critical</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setShowBrandModal(false)} className="px-5 py-2.5 bg-panel-solid text-text-sub rounded-xl font-medium hover:bg-panel-border transition-colors border border-panel-border">Cancel</button>
                <button onClick={handleAddCompetitor} className="px-5 py-2.5 glass-button rounded-xl font-medium">Save Competitor</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default CompetitorBrands;
