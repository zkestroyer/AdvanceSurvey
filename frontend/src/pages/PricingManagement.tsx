import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';

interface PriceRecord {
  id: string;
  product: string;
  date: string;
  oldPrice: number;
  newPrice: number;
  status: 'Approved' | 'Pending Review';
}

const PricingManagement = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pRes, rRes] = await Promise.all([
          api.get('/master/products'),
          api.get('/master/pricing')
        ]);
        if (pRes.data.success) setProducts(pRes.data.data);
        if (rRes.data.success) {
          const loaded = rRes.data.data.map((r:any) => ({
            id: r.id.toString(),
            productId: r.productId,
            date: new Date(r.updatedAt).toLocaleDateString(),
            oldPrice: r.oldPrice,
            newPrice: r.newPrice,
            status: 'Pending Review' // Mock status
          }));
          setRecords(loaded);
        }
      } catch (err) {
        toast.error('Failed to load pricing');
      }
    };
    fetchData();
  }, []);

  const [showModal, setShowModal] = useState(false);
  
  // Form State
  const [product, setProduct] = useState('');
  const [oldPrice] = useState('39.99');
  const [newPrice, setNewPrice] = useState('');

  const handleSave = async () => {
    if (!newPrice || !product) return toast.error('Product and new price are required');
    
    try {
      const res = await api.post('/master/pricing', {
        productId: product,
        oldPrice: parseFloat(oldPrice) || 0,
        newPrice: parseFloat(newPrice) || 0
      });
      if (res.data.success) {
        const newRecord = {
          id: res.data.data.id.toString(),
          productId: res.data.data.productId,
          date: new Date().toLocaleDateString(),
          oldPrice: res.data.data.oldPrice,
          newPrice: res.data.data.newPrice,
          status: 'Pending Review'
        };
        setRecords([newRecord, ...records]);
        setShowModal(false);
        setNewPrice('');
        toast.success('Price update submitted for review');
      }
    } catch(e) {
      toast.error('Failed to update price');
    }
  };

  const getVariance = (oldP: number, newP: number) => {
    const diff = newP - oldP;
    const percent = (diff / oldP) * 100;
    const sign = diff > 0 ? '+' : '';
    const color = diff > 0 ? 'text-success-text' : 'text-danger-text';
    return <span className={`font-bold ${color}`}>{sign}{percent.toFixed(1)}%</span>;
  };

  return (
    <main className="h-full flex flex-col p-6">
      <div className="flex justify-between items-end mb-6 shrink-0">
        <div>
          <h1 className="text-3xl font-bold font-['Outfit'] text-text-main">Pricing Management & History</h1>
          <p className="text-text-muted mt-1">Manage product pricing updates and track historical changes.</p>
        </div>
        
        <button onClick={() => setShowModal(true)} className="glass-button px-5 py-2.5 rounded-xl font-medium shadow-sm flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          Update Price List
        </button>
      </div>

      <div className="glass-panel rounded-2xl flex-1 overflow-hidden flex flex-col">
        <div className="p-6 border-b border-panel-border bg-panel-bg flex justify-between items-center shrink-0">
           <h3 className="font-bold text-text-main">Recent Pricing Approvals</h3>
           <select className="px-4 py-2 glass-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/50 appearance-none text-text-sub">
             <option>All Products</option>
             <option>Fiber Services</option>
             <option>Mobile Plans</option>
           </select>
        </div>
        <div className="overflow-y-auto flex-1">
          <table className="w-full text-left border-collapse glass-table">
            <thead className="sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Effective Date</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Previous Price</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">New Price</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Variance</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {records.map(r => {
                const pName = products.find(p=>p.id.toString()===r.productId?.toString())?.name || 'Unknown Product';
                return (
                <tr key={r.id} className="hover:bg-panel-bg transition-colors group">
                  <td className="px-6 py-4 font-bold text-text-main">{pName}</td>
                  <td className="px-6 py-4 text-text-muted">{r.date}</td>
                  <td className="px-6 py-4 text-text-muted line-through">${r.oldPrice.toFixed(2)}</td>
                  <td className="px-6 py-4 font-bold text-slate-400 text-base">${r.newPrice.toFixed(2)}</td>
                  <td className="px-6 py-4">{getVariance(r.oldPrice, r.newPrice)}</td>
                  <td className="px-6 py-4">
                    {r.status === 'Approved' ? 
                      <span className="px-2.5 py-1 bg-success-bg text-success-text border border-success-border rounded-full font-medium text-xs tracking-wide">Approved</span> :
                      <span className="px-2.5 py-1 bg-warning-bg text-warning-text border border-warning-border rounded-full font-medium text-xs tracking-wide">Pending Review</span>
                    }
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-panel-bg backdrop-blur-md flex items-center justify-center z-50">
          <div className="glass-panel rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all border border-panel-border">
            <div className="p-6 border-b border-panel-border bg-panel-bg flex justify-between items-center">
              <h3 className="font-bold font-['Outfit'] text-xl text-text-main">Propose Price Update</h3>
              <button onClick={() => setShowModal(false)} className="text-text-muted hover:text-text-main transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-text-sub mb-2">Select Product</label>
                <select value={product} onChange={e=>setProduct(e.target.value)} className="w-full px-4 py-3 glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500/50 appearance-none text-text-sub">
                  <option value="" disabled>Select Product</option>
                  {products.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-sub mb-2">Current Price ($)</label>
                  <input value={oldPrice} readOnly type="text" className="w-full px-4 py-3 glass-input bg-panel-bg opacity-70 rounded-xl cursor-not-allowed text-text-muted" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-sub mb-2">Proposed Price ($)</label>
                  <input value={newPrice} onChange={e=>setNewPrice(e.target.value)} type="number" step="0.01" className="w-full px-4 py-3 glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500/50 font-bold text-slate-400" placeholder="0.00" />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setShowModal(false)} className="px-5 py-2.5 bg-panel-solid text-text-sub rounded-xl font-medium hover:bg-panel-border transition-colors border border-panel-border">Cancel</button>
                <button onClick={handleSave} className="px-5 py-2.5 glass-button rounded-xl font-medium">Submit for Review</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default PricingManagement;
