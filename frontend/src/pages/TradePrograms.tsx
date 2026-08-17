import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';

interface Program {
  id: string;
  title: string;
  desc: string;
  status: 'Active' | 'Ongoing' | 'Draft';
  iconColor: string;
}

const TradePrograms = () => {
  const [programs, setPrograms] = useState<any[]>([]);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const res = await api.get('/master/programs');
        if (res.data.success) {
          const colors = ['cyan', 'indigo', 'emerald', 'rose', 'amber', 'purple'];
          const loaded = res.data.data.map((p:any, i:number) => ({
            id: p.id.toString(),
            title: p.title,
            desc: p.description,
            status: p.status,
            iconColor: colors[i % colors.length]
          }));
          setPrograms(loaded);
        }
      } catch (err) {
        toast.error('Failed to load trade programs');
      }
    };
    fetchPrograms();
  }, []);

  const [showModal, setShowModal] = useState(false);
  
  // Form State
  const [pTitle, setPTitle] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [pStatus, setPStatus] = useState<'Active'|'Ongoing'|'Draft'>('Draft');

  const handleSave = async () => {
    if (!pTitle || !pDesc) return toast.error('Title and description are required');
    const colors = ['cyan', 'indigo', 'emerald', 'rose', 'amber', 'purple'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    try {
      const res = await api.post('/master/programs', {
        title: pTitle,
        description: pDesc,
        status: pStatus
      });
      if (res.data.success) {
        const newProg = {
          id: res.data.data.id.toString(),
          title: res.data.data.title,
          desc: res.data.data.description,
          status: res.data.data.status,
          iconColor: randomColor
        };
        
        setPrograms([newProg, ...programs]);
        setShowModal(false);
        setPTitle(''); setPDesc(''); setPStatus('Draft');
        toast.success('Trade program launched successfully');
      }
    } catch (e) {
      toast.error('Failed to create program');
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'Active') return <span className="px-3 py-1 bg-success-bg text-success-text border border-success-border rounded-full font-medium text-xs">Active (Current Qtr)</span>;
    if (status === 'Ongoing') return <span className="px-3 py-1 bg-text-muted/20 text-text-sub border border-panel-border rounded-full font-medium text-xs">Ongoing Scheme</span>;
    return <span className="px-3 py-1 bg-warning-bg text-warning-text border border-warning-border rounded-full font-medium text-xs">Draft / Planned</span>;
  };

  return (
    <main className="h-full p-6 overflow-y-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold font-['Outfit'] text-text-main">Trade Programs & Incentives</h1>
          <p className="text-text-muted mt-1">Manage dealer incentive schemes, promos, and trade payment terms.</p>
        </div>
        
        <button onClick={() => setShowModal(true)} className="glass-button px-5 py-2.5 rounded-xl font-medium shadow-sm flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          Launch New Program
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {programs.map(p => (
          <div key={p.id} className="glass-panel rounded-2xl p-6 border border-panel-border hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col">
            <div className={`w-14 h-14 rounded-2xl bg-${p.iconColor}-500/20 text-${p.iconColor}-400 flex items-center justify-center mb-5 border border-${p.iconColor}-500/30 shadow-sm`}>
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </div>
            <h3 className="text-xl font-bold text-text-main mb-2">{p.title}</h3>
            <p className="text-sm text-text-muted mb-8 flex-1 leading-relaxed">{p.desc}</p>
            <div className="flex justify-between items-center pt-4 border-t border-panel-border mt-auto">
              {getStatusBadge(p.status)}
              <span className="text-slate-400 font-medium text-sm cursor-pointer hover:text-slate-300 transition-colors">View Targets &rarr;</span>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-panel-bg backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="glass-panel rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all border border-panel-border">
            <div className="p-6 border-b border-panel-border bg-panel-bg flex justify-between items-center">
              <h3 className="font-bold font-['Outfit'] text-xl text-text-main">Launch Trade Program</h3>
              <button onClick={() => setShowModal(false)} className="text-text-muted hover:text-text-main transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-text-sub mb-2">Program Title</label>
                <input value={pTitle} onChange={e=>setPTitle(e.target.value)} type="text" className="w-full px-4 py-3 glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500/50" placeholder="e.g. Summer Bonanza" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-sub mb-2">Description & Rules</label>
                <textarea value={pDesc} onChange={e=>setPDesc(e.target.value)} rows={3} className="w-full px-4 py-3 glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500/50 resize-none" placeholder="Detail the incentive criteria..."></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-sub mb-2">Initial Status</label>
                <div className="flex gap-4">
                  <label className="flex items-center group cursor-pointer p-3 border border-panel-border bg-panel-bg rounded-xl flex-1 hover:bg-panel-solid transition-colors">
                    <input type="radio" name="status" checked={pStatus==='Draft'} onChange={()=>setPStatus('Draft')} className="w-4 h-4 text-slate-500 focus:ring-slate-500 border-slate-600 bg-panel-solid rounded-full" />
                    <span className="ml-2 text-sm text-text-sub group-hover:text-text-main">Draft</span>
                  </label>
                  <label className="flex items-center group cursor-pointer p-3 border border-panel-border bg-panel-bg rounded-xl flex-1 hover:bg-panel-solid transition-colors">
                    <input type="radio" name="status" checked={pStatus==='Active'} onChange={()=>setPStatus('Active')} className="w-4 h-4 text-emerald-500 focus:ring-emerald-500 border-slate-600 bg-panel-solid rounded-full" />
                    <span className="ml-2 text-sm text-text-sub group-hover:text-text-main">Active</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-panel-border">
                <button onClick={() => setShowModal(false)} className="px-5 py-2.5 bg-panel-solid text-text-sub rounded-xl font-medium hover:bg-panel-border transition-colors border border-panel-border">Cancel</button>
                <button onClick={handleSave} className="px-5 py-2.5 glass-button rounded-xl font-medium">Publish Program</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default TradePrograms;
