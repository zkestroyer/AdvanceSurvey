import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';

interface Broadcast {
  id: string;
  title: string;
  message: string;
  date: string;
  audience: string;
  sentCount: number;
  type: 'info' | 'urgent';
  pushNotification: boolean;
}

const NotificationHub = () => {
  const [toggles, setToggles] = useState({
    surveyPush: true,
    priceChange: true,
    maintenance: false,
  });

  const [broadcasts, setBroadcasts] = useState<any[]>([]);

  useEffect(() => {
    const fetchBroadcasts = async () => {
      try {
        const res = await api.get('/master/notifications');
        if (res.data.success) {
          const loaded = res.data.data.map((b:any) => ({
            id: b.id.toString(),
            title: b.title,
            message: b.message,
            date: new Date(b.createdAt).toLocaleString(),
            audience: b.audience,
            sentCount: b.audience === 'All TSOs' ? 142 : b.audience === 'BDMs Only' ? 14 : 156, // Mock count
            type: b.type,
            pushNotification: b.pushNotification || false
          }));
          setBroadcasts(loaded.reverse()); // latest first
        }
      } catch (err) {
        toast.error('Failed to load notifications');
      }
    };
    fetchBroadcasts();
  }, []);

  const [showModal, setShowModal] = useState(false);
  const [bTitle, setBTitle] = useState('');
  const [bMessage, setBMessage] = useState('');
  const [bAudience, setBAudience] = useState('All TSOs');
  const [bType, setBType] = useState<'info'|'urgent'>('info');
  const [bPushNotification, setBPushNotification] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const openAddModal = () => {
    setEditingId(null);
    setBTitle('');
    setBMessage('');
    setBAudience('All TSOs');
    setBType('info');
    setBPushNotification(false);
    setShowModal(true);
  };

  const openEditModal = (b: Broadcast) => {
    setEditingId(b.id);
    setBTitle(b.title);
    setBMessage(b.message);
    setBAudience(b.audience);
    setBType(b.type);
    setBPushNotification(b.pushNotification || false);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this broadcast?')) return;
    try {
      const res = await api.delete(`/master/notifications/${id}`);
      if (res.data.success) {
        setBroadcasts(broadcasts.filter(b => b.id !== id));
        toast.success('Broadcast deleted');
      }
    } catch(e) {
      toast.error('Failed to delete broadcast');
    }
  };

  const handleSendBroadcast = async () => {
    if (!bTitle || !bMessage) return toast.error('Title and message are required!');
    
    try {
      let res;
      if (editingId) {
        res = await api.put(`/master/notifications/${editingId}`, {
          title: bTitle,
          message: bMessage,
          audience: bAudience,
          type: bType,
          pushNotification: bPushNotification
        });
      } else {
        res = await api.post('/master/notifications', {
          title: bTitle,
          message: bMessage,
          audience: bAudience,
          type: bType,
          pushNotification: bPushNotification
        });
      }

      if (res.data.success) {
        const updatedB = {
          id: res.data.data.id.toString(),
          title: res.data.data.title,
          message: res.data.data.message,
          date: new Date(res.data.data.createdAt || Date.now()).toLocaleString(),
          audience: res.data.data.audience,
          sentCount: res.data.data.audience === 'All TSOs' ? 142 : res.data.data.audience === 'BDMs Only' ? 14 : 156,
          type: res.data.data.type,
          pushNotification: res.data.data.pushNotification
        };
        
        if (editingId) {
          setBroadcasts(broadcasts.map(b => b.id === editingId ? updatedB : b));
          toast.success('Broadcast updated successfully');
        } else {
          setBroadcasts([updatedB, ...broadcasts]);
          toast.success('Broadcast sent successfully to ' + updatedB.sentCount + ' devices');
        }
        setShowModal(false);
      }
    } catch(e) {
      toast.error('Failed to send broadcast');
    }
  };

  const toggleHandler = (key: keyof typeof toggles) => {
    setToggles(prev => {
      const newState = { ...prev, [key]: !prev[key] };
      toast.success(`Automated alert ${newState[key] ? 'enabled' : 'disabled'}`);
      return newState;
    });
  };

  return (
    <main className="h-full flex flex-col p-6">
      <div className="flex justify-between items-end mb-6 shrink-0">
        <div>
          <h1 className="text-3xl font-bold font-['Outfit'] text-text-main">Notification Hub</h1>
          <p className="text-text-muted mt-1">Broadcast messages and manage automated alerts.</p>
        </div>
        
        <button onClick={openAddModal} className="glass-button px-5 py-2.5 rounded-xl font-medium shadow-sm flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          Send Broadcast
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 overflow-hidden">
        <div className="glass-panel rounded-2xl p-6 border border-panel-border h-max">
          <h3 className="font-semibold text-text-main mb-6 border-b border-panel-border pb-4">Automated Alert Triggers</h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-sub">New Survey Published</p>
                <p className="text-xs text-text-muted">Push to all TSOs</p>
              </div>
              <div onClick={() => toggleHandler('surveyPush')} className={`w-12 h-6 rounded-full flex items-center p-1 cursor-pointer transition-colors ${toggles.surveyPush ? 'bg-slate-500' : 'bg-panel-border'}`}>
                <div className={`w-4 h-4 bg-panel-solid rounded-full shadow-sm transition-transform ${toggles.surveyPush ? 'translate-x-6' : 'translate-x-0'}`}></div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-sub">Price Change Approved</p>
                <p className="text-xs text-text-muted">Email BDMs</p>
              </div>
              <div onClick={() => toggleHandler('priceChange')} className={`w-12 h-6 rounded-full flex items-center p-1 cursor-pointer transition-colors ${toggles.priceChange ? 'bg-slate-500' : 'bg-panel-border'}`}>
                <div className={`w-4 h-4 bg-panel-solid rounded-full shadow-sm transition-transform ${toggles.priceChange ? 'translate-x-6' : 'translate-x-0'}`}></div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-sub">System Maintenance</p>
                <p className="text-xs text-text-muted">In-app banner</p>
              </div>
              <div onClick={() => toggleHandler('maintenance')} className={`w-12 h-6 rounded-full flex items-center p-1 cursor-pointer transition-colors ${toggles.maintenance ? 'bg-slate-500' : 'bg-panel-border'}`}>
                <div className={`w-4 h-4 bg-panel-solid rounded-full shadow-sm transition-transform ${toggles.maintenance ? 'translate-x-6' : 'translate-x-0'}`}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-2xl overflow-hidden border border-panel-border col-span-2 flex flex-col h-full">
          <div className="p-6 border-b border-panel-border bg-panel-bg shrink-0">
            <h3 className="font-bold text-text-main">Recent Broadcasts</h3>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-white/5">
            {broadcasts.length === 0 && (
              <div className="p-10 text-center text-text-muted">No broadcasts sent yet.</div>
            )}
            {broadcasts.map(b => (
              <div key={b.id} className="p-6 hover:bg-panel-bg transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h4 className={`font-semibold ${b.type === 'urgent' ? 'text-danger-text' : 'text-slate-400'}`}>{b.title}</h4>
                  <div className="flex items-center gap-4 ml-4">
                    <span className="text-xs text-text-muted whitespace-nowrap">{b.date}</span>
                    <div className="flex gap-2">
                      <button onClick={() => openEditModal(b)} className="p-1.5 text-text-muted hover:text-cyan-400 hover:bg-slate-500/10 rounded transition-colors" title="Edit">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                      </button>
                      <button onClick={() => handleDelete(b.id)} className="p-1.5 text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded transition-colors" title="Delete">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-text-sub leading-relaxed">{b.message}</p>
                <div className="mt-4 flex gap-3 items-center">
                  <span className="px-3 py-1 bg-slate-500/10 text-slate-400 border border-slate-500/20 rounded-full text-xs font-medium">To: {b.audience}</span>
                  <span className="px-3 py-1 bg-success-bg text-success-text border border-success-border rounded-full text-xs font-medium">Sent ({b.sentCount} delivered)</span>
                  {b.pushNotification && <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full text-xs font-medium">Push Notification Sent</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-panel-bg backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="glass-panel rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all border border-panel-border">
            <div className="p-6 border-b border-panel-border bg-panel-bg flex justify-between items-center">
              <h3 className="font-bold font-['Outfit'] text-xl text-text-main">{editingId ? 'Edit Broadcast' : 'Send Broadcast Message'}</h3>
              <button onClick={() => setShowModal(false)} className="text-text-muted hover:text-text-main transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-text-sub mb-2">Title</label>
                <input value={bTitle} onChange={e=>setBTitle(e.target.value)} type="text" className="w-full px-4 py-3 glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500/50" placeholder="Message Subject" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-sub mb-2">Message</label>
                <textarea value={bMessage} onChange={e=>setBMessage(e.target.value)} rows={4} className="w-full px-4 py-3 glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500/50 resize-none" placeholder="Type your broadcast message..."></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-sub mb-2">Target Audience</label>
                  <select value={bAudience} onChange={e=>setBAudience(e.target.value)} className="w-full px-4 py-3 glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500/50 appearance-none text-text-sub">
                    <option>All TSOs</option>
                    <option>BDMs Only</option>
                    <option>Everyone</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-sub mb-2">Message Type</label>
                  <select value={bType} onChange={e=>setBType(e.target.value as any)} className="w-full px-4 py-3 glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500/50 appearance-none text-text-sub">
                    <option value="info">Informational</option>
                    <option value="urgent">Urgent Alert</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  id="pushCheckbox" 
                  checked={bPushNotification} 
                  onChange={e => setBPushNotification(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-600 bg-panel-solid focus:ring-cyan-500 focus:ring-offset-slate-900" 
                />
                <label htmlFor="pushCheckbox" className="text-sm text-text-main font-medium cursor-pointer">
                  Send Mobile Push Notification to App
                </label>
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-panel-border">
                <button onClick={() => setShowModal(false)} className="px-5 py-2.5 bg-panel-solid text-text-sub rounded-xl font-medium hover:bg-panel-border transition-colors border border-panel-border">Cancel</button>
                <button onClick={handleSendBroadcast} className="px-5 py-2.5 glass-button rounded-xl font-medium flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                  Send Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default NotificationHub;
