import toast from 'react-hot-toast';

const AuditLogs = () => {

  const handleExport = () => {
    toast.loading('Preparing CSV export...', { id: 'audit' });
    setTimeout(() => {
      toast.success('audit_logs_2026.csv downloaded!', { id: 'audit' });
    }, 2000);
  };

  return (
    <main className="h-full flex flex-col p-6">
      <div className="flex justify-between items-end mb-6 shrink-0">
        <div>
          <h1 className="text-3xl font-bold font-['Outfit'] text-text-main">Audit Logs</h1>
          <p className="text-text-muted mt-1">Track all system activities, changes, and access records.</p>
        </div>
        
        <button onClick={handleExport} className="glass-button px-5 py-2.5 rounded-xl font-medium shadow-sm flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
          Export Logs
        </button>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden border border-panel-border flex-1 flex flex-col">
        <div className="p-4 border-b border-panel-border bg-panel-bg flex gap-4 shrink-0">
          <input type="text" placeholder="Search by user, action, or IP..." className="flex-1 px-4 py-2.5 glass-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/50" />
          <select className="px-4 py-2.5 glass-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/50 appearance-none text-text-sub">
            <option>All Modules</option>
            <option>Authentication</option>
            <option>Pricing</option>
            <option>User Management</option>
          </select>
          <select className="px-4 py-2.5 glass-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/50 appearance-none text-text-sub">
            <option>Last 24 Hours</option>
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
          </select>
        </div>
        
        <div className="overflow-y-auto flex-1">
          <table className="w-full text-left border-collapse glass-table">
            <thead className="sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-text-muted">Timestamp</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-text-muted">User</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-text-muted">Action</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-text-muted">Module</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-text-muted">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              <tr className="hover:bg-panel-bg transition-colors">
                <td className="px-6 py-4 text-text-muted font-mono text-xs">Oct 26, 2023 15:42:10</td>
                <td className="px-6 py-4 font-bold text-text-main">Admin User</td>
                <td className="px-6 py-4"><span className="text-success-text font-bold uppercase text-xs tracking-wider mr-2 bg-success-bg px-2 py-0.5 rounded">Update</span> Price for Fiber Unlimited</td>
                <td className="px-6 py-4 text-text-sub">Pricing Management</td>
                <td className="px-6 py-4 text-text-muted text-xs font-mono bg-panel-bg px-2 rounded w-max">192.168.1.42</td>
              </tr>
              <tr className="hover:bg-panel-bg transition-colors">
                <td className="px-6 py-4 text-text-muted font-mono text-xs">Oct 26, 2023 14:15:22</td>
                <td className="px-6 py-4 font-bold text-text-main">Sara Khan</td>
                <td className="px-6 py-4"><span className="text-slate-400 font-bold uppercase text-xs tracking-wider mr-2 bg-slate-500/10 px-2 py-0.5 rounded">Create</span> New Zone 'North Ridge'</td>
                <td className="px-6 py-4 text-text-sub">Territories</td>
                <td className="px-6 py-4 text-text-muted text-xs font-mono bg-panel-bg px-2 rounded w-max">10.0.4.15</td>
              </tr>
              <tr className="hover:bg-panel-bg transition-colors">
                <td className="px-6 py-4 text-text-muted font-mono text-xs">Oct 26, 2023 09:00:01</td>
                <td className="px-6 py-4 font-bold text-text-main">Ali Jafri</td>
                <td className="px-6 py-4"><span className="text-slate-400 font-bold uppercase text-xs tracking-wider mr-2 bg-slate-500/10 px-2 py-0.5 rounded">Login</span> Successful Session</td>
                <td className="px-6 py-4 text-text-sub">Authentication</td>
                <td className="px-6 py-4 text-text-muted text-xs font-mono bg-panel-bg px-2 rounded w-max">172.16.2.100</td>
              </tr>
              <tr className="hover:bg-panel-bg transition-colors">
                <td className="px-6 py-4 text-text-muted font-mono text-xs">Oct 25, 2023 23:45:12</td>
                <td className="px-6 py-4 font-bold text-text-main">System API</td>
                <td className="px-6 py-4"><span className="text-danger-text font-bold uppercase text-xs tracking-wider mr-2 bg-danger-bg px-2 py-0.5 rounded">Delete</span> Draft Survey 'Old Layout'</td>
                <td className="px-6 py-4 text-text-sub">Survey Builder</td>
                <td className="px-6 py-4 text-text-muted text-xs font-mono bg-panel-bg px-2 rounded w-max">127.0.0.1</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
};

export default AuditLogs;
