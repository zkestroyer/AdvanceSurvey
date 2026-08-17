import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';

interface Ticket {
  id: string;
  subject: string;
  reporter: string;
  priority: 'High' | 'Medium' | 'Low';
  created: string;
  status: 'Open' | 'Resolved';
  message?: string;
  photo?: string;
}

const SupportTickets = () => {
  const [tickets, setTickets] = useState<any[]>([]);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await api.get('/master/tickets');
        if (res.data.success) {
          const loaded = res.data.data.map((t:any) => ({
            id: t.id.toString(),
            subject: t.subject || t.message || 'No Subject',
            reporter: t.name || t.email || 'Guest User',
            priority: t.priority,
            created: new Date(t.createdAt).toLocaleDateString(),
            status: t.status,
            message: t.message,
            photo: t.photo
          }));
          setTickets(loaded);
        }
      } catch (err) {
        toast.error('Failed to load tickets');
      }
    };
    fetchTickets();
  }, []);

  const [filter, setFilter] = useState('Status: Open');
  const [search, setSearch] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const openTicketsCount = tickets.filter(t => t.status === 'Open').length;
  const highPriorityCount = tickets.filter(t => t.priority === 'High' && t.status === 'Open').length;
  const resolvedCount = tickets.filter(t => t.status === 'Resolved').length;

  const handleResolve = async (id: string) => {
    try {
      const res = await api.put(`/master/tickets/${id}`, { status: 'Resolved' });
      if (res.data.success) {
        setTickets(tickets.map(t => t.id === id ? { ...t, status: 'Resolved' } : t));
        toast.success('Ticket marked as resolved!');
      }
    } catch (e) {
      toast.error('Failed to update ticket');
    }
  };

  const getPriorityBadge = (p: string) => {
    if (p === 'High') return <span className="px-2.5 py-1 bg-danger-bg text-danger-text border border-danger-border rounded-full font-medium text-xs">High</span>;
    if (p === 'Medium') return <span className="px-2.5 py-1 bg-warning-bg text-warning-text border border-warning-border rounded-full font-medium text-xs">Medium</span>;
    return <span className="px-2.5 py-1 bg-success-bg text-success-text border border-success-border rounded-full font-medium text-xs">Low</span>;
  };

  const filteredTickets = tickets.filter(t => {
    if (filter === 'Status: Open' && t.status !== 'Open') return false;
    if (filter === 'Status: Resolved' && t.status !== 'Resolved') return false;
    if (search && !t.subject.toLowerCase().includes(search.toLowerCase()) && !t.id.includes(search)) return false;
    return true;
  });

  return (
    <main className="h-full flex flex-col p-6">
      <div className="flex justify-between items-end mb-6 shrink-0">
        <div>
          <h1 className="text-3xl font-bold font-['Outfit'] text-text-main">Support & Tickets</h1>
          <p className="text-text-muted mt-1">Manage field agent issues and app support requests.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 shrink-0">
        <div className="glass-panel p-5 rounded-2xl border border-panel-border hover:-translate-y-1 transition-transform">
          <p className="text-sm text-text-muted font-medium mb-1">Open Tickets</p>
          <h3 className="text-3xl font-bold text-text-main">{openTicketsCount}</h3>
        </div>
        <div className="glass-panel p-5 rounded-2xl border border-panel-border hover:-translate-y-1 transition-transform">
          <p className="text-sm text-text-muted font-medium mb-1">High Priority</p>
          <h3 className="text-3xl font-bold text-danger-text">{highPriorityCount}</h3>
        </div>
        <div className="glass-panel p-5 rounded-2xl border border-panel-border hover:-translate-y-1 transition-transform">
          <p className="text-sm text-text-muted font-medium mb-1">Resolved Today</p>
          <h3 className="text-3xl font-bold text-success-text">{resolvedCount}</h3>
        </div>
        <div className="glass-panel p-5 rounded-2xl border border-panel-border hover:-translate-y-1 transition-transform">
          <p className="text-sm text-text-muted font-medium mb-1">Avg Resolution Time</p>
          <h3 className="text-3xl font-bold text-slate-400">2.4 hrs</h3>
        </div>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden border border-panel-border flex-1 flex flex-col">
        <div className="p-4 border-b border-panel-border bg-panel-bg flex gap-4 shrink-0">
          <input value={search} onChange={e=>setSearch(e.target.value)} type="text" placeholder="Search ticket ID or subject..." className="flex-1 px-4 py-2.5 glass-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/50" />
          <select value={filter} onChange={e=>setFilter(e.target.value)} className="px-4 py-2.5 glass-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/50 appearance-none text-text-sub">
            <option>All Tickets</option>
            <option>Status: Open</option>
            <option>Status: Resolved</option>
          </select>
        </div>
        
        <div className="overflow-y-auto flex-1">
          <table className="w-full text-left border-collapse glass-table">
            <thead className="sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-text-muted">Ticket ID</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-text-muted">Subject</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-text-muted">Reporter</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-text-muted">Priority</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-text-muted">Created</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-text-muted text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {filteredTickets.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-text-muted">No tickets match your filters.</td></tr>
              )}
              {filteredTickets.map(t => (
                <tr key={t.id} className="hover:bg-panel-bg transition-colors group">
                  <td className="px-6 py-4 font-mono font-medium text-text-muted">#TK-{t.id}</td>
                  <td className={`px-6 py-4 font-bold ${t.status === 'Resolved' ? 'text-text-muted line-through' : 'text-text-main'}`}>{t.subject}</td>
                  <td className="px-6 py-4 text-text-muted">{t.reporter}</td>
                  <td className="px-6 py-4">{getPriorityBadge(t.priority)}</td>
                  <td className="px-6 py-4 text-text-muted">{t.created}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => setSelectedTicket(t)} className="px-3 py-1.5 bg-panel-solid text-text-sub rounded-lg hover:bg-slate-500/20 hover:text-slate-400 transition-colors border border-panel-border text-xs font-medium mr-2">View</button>
                    {t.status === 'Open' ? (
                       <button onClick={() => handleResolve(t.id)} className="px-4 py-1.5 bg-success-bg text-success-text rounded-lg hover:bg-emerald-500/20 transition-colors border border-success-border text-xs font-bold opacity-100">
                         Resolve
                       </button>
                    ) : (
                      <span className="text-text-muted text-xs italic">Closed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedTicket && (
        <div className="fixed inset-0 bg-panel-bg backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="glass-panel rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col border border-panel-border">
            <div className="p-6 border-b border-panel-border bg-panel-bg flex justify-between items-center">
              <h3 className="font-bold font-['Outfit'] text-xl text-text-main">Ticket #TK-{selectedTicket.id}</h3>
              <button onClick={() => setSelectedTicket(null)} className="text-text-muted hover:text-text-main transition-colors bg-panel-solid p-2 rounded-full border border-panel-border hover:bg-slate-500/20">
                ✕
              </button>
            </div>
            <div className="p-6">
              <h4 className="font-bold text-lg text-text-main mb-2">{selectedTicket.subject}</h4>
              <p className="text-sm text-text-muted mb-4">Reported by: <span className="text-text-sub">{selectedTicket.reporter}</span></p>
              <div className="flex gap-4 mb-4">
                <div>
                  <span className="text-xs text-text-muted uppercase tracking-wider block mb-1">Priority</span>
                  {getPriorityBadge(selectedTicket.priority)}
                </div>
                <div>
                  <span className="text-xs text-text-muted uppercase tracking-wider block mb-1">Status</span>
                  <span className={`text-sm font-bold ${selectedTicket.status === 'Open' ? 'text-warning-text' : 'text-success-text'}`}>{selectedTicket.status}</span>
                </div>
              </div>
              <div className="bg-panel-solid p-4 rounded-xl border border-panel-border">
                 <p className="text-sm text-text-sub whitespace-pre-wrap">{selectedTicket.message || 'No description provided.'}</p>
                {selectedTicket.photo && (
                   <div className="mt-4">
                     <p className="text-xs font-bold text-text-muted mb-2 uppercase">Attachment</p>
                      <img 
                        src={(() => {
                          const p = selectedTicket.photo!;
                          if (p.startsWith('data:')) return p;
                          const rawUrl = p.startsWith('http') ? p : `http://172.104.130.208:5000${p.startsWith('/') ? '' : '/'}${p}`;
                          const baseUrl = api.defaults.baseURL || 'https://demo.bloomix.io/api/v1';
                          return `${baseUrl}/proxy-image?url=${encodeURIComponent(rawUrl)}`;
                        })()} 
                        alt="Ticket attachment" 
                        className="max-w-full h-auto max-h-64 rounded-lg border border-panel-border" 
                        onError={(e) => { 
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none'; 
                        }}
                      />
                   </div>
                 )}
              </div>
            </div>
            {selectedTicket.status === 'Open' && (
              <div className="p-4 border-t border-panel-border bg-panel-bg flex justify-end gap-3">
                <button onClick={() => { handleResolve(selectedTicket.id); setSelectedTicket(null); }} className="px-5 py-2.5 bg-success-bg text-success-text rounded-xl font-medium border border-success-border">
                  Mark as Resolved
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
};

export default SupportTickets;
