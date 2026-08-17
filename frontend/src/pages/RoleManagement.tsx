import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

interface Role {
  id: string;
  name: string;
  description: string;
  accessLevel: string;
  usersCount: number;
}

const RoleManagement = () => {
  const [roles, setRoles] = useState<any[]>([]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await api.get('/master/roles');
        if (res.data.success) {
          setRoles(res.data.data);
        }
      } catch (err) {
        toast.error('Failed to load roles');
      }
    };
    fetchRoles();
  }, []);

  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [rName, setRName] = useState('');
  const [rPermissions, setRPermissions] = useState<string[]>([]);
  const [hasWebAccess, setHasWebAccess] = useState(false);
  const [hasMobileAccess, setHasMobileAccess] = useState(false);

  const [activeTab, setActiveTab] = useState('web');

  const permissionTabs = [
    {
      id: 'mobile',
      label: 'Mobile App',
      groups: [
        {
          group: 'Field Execution',
          permissions: [
            { id: 'mobile_survey_execution', label: 'Execute Surveys' },
            { id: 'mobile_offline_sync', label: 'Offline Sync' }
          ]
        }
      ]
    },
    {
      id: 'web',
      label: 'Web Admin',
      groups: [
        {
          group: 'Survey Modules',
          permissions: [
            { id: 'survey_management', label: 'Survey Management' },
            { id: 'survey_publish', label: 'Survey Builder (Publish)' },
            { id: 'survey_edit_submitted', label: 'Edit Submitted Surveys' }
          ]
        },
        {
          group: 'User & Organization',
          permissions: [
            { id: 'user_management', label: 'User Management' },
            { id: 'region_city_management', label: 'Region/City Management' },
            { id: 'roles_permissions', label: 'Roles & Permissions Management' }
          ]
        },
        {
          group: 'Master Data',
          permissions: [
            { id: 'master_data', label: 'Shops & General Master Data' },
            { id: 'product_mapping', label: 'Product Catalog Mapping' }
          ]
        }
      ]
    },
    {
      id: 'management',
      label: 'Management Portal',
      groups: [
        {
          group: 'Reporting & Analytics',
          permissions: [
            { id: 'dashboard_view', label: 'Executive Dashboard Viewing' },
            { id: 'analytics_export', label: 'Reports / Analytics Export' },
            { id: 'comparison_reports', label: 'View Comparison Reports' }
          ]
        }
      ]
    }
  ];

  const togglePermission = (id: string) => {
    setRPermissions(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleEditClick = (role: any) => {
    setEditingRoleId(role.id);
    setRName(role.name);
    let parsedPerms: string[] = [];
    try {
      if (Array.isArray(role.permissions)) {
        parsedPerms = role.permissions;
      } else if (typeof role.permissions === 'string') {
        const parsed = JSON.parse(role.permissions || '[]');
        if (Array.isArray(parsed)) {
          parsedPerms = parsed;
        }
      }
    } catch(e) {}
    setRPermissions(parsedPerms);
    setHasWebAccess(role.webAccess || false);
    setHasMobileAccess(role.mobileAccess || false);
    setShowRoleModal(true);
  };

  const handleSaveRole = async () => {
    if (!rName) return toast.error('Role name is required');
    try {
      if (editingRoleId) {
        const res = await api.put(`/master/roles/${editingRoleId}`, {
          name: rName,
          permissions: rPermissions,
          webAccess: hasWebAccess,
          mobileAccess: hasMobileAccess
        });
        if (res.data.success) {
          setRoles(roles.map(r => r.id === editingRoleId ? res.data.data : r));
          toast.success('Role updated successfully');
        }
      } else {
        const res = await api.post('/master/roles', {
          name: rName,
          permissions: rPermissions,
          webAccess: hasWebAccess,
          mobileAccess: hasMobileAccess
        });
        if (res.data.success) {
          setRoles([...roles, res.data.data]);
          toast.success('Custom role created');
        }
      }
      setShowRoleModal(false);
      setEditingRoleId(null);
      setRName('');
      setRPermissions([]);
      setHasWebAccess(false);
      setHasMobileAccess(false);
    } catch (e) {
      toast.error('Failed to save role');
    }
  };

  const getAccessBadge = (level: string) => {
    if (level === 'All Modules') return <span className="px-2.5 py-1 bg-danger-bg text-danger-text border border-danger-border rounded-full font-medium text-xs">All Modules</span>;
    if (level === 'Regional Data') return <span className="px-2.5 py-1 bg-success-bg text-success-text border border-success-border rounded-full font-medium text-xs">Regional Data</span>;
    if (level === 'Assigned Areas') return <span className="px-2.5 py-1 bg-slate-500/10 text-slate-400 border border-slate-500/20 rounded-full font-medium text-xs">Assigned Areas</span>;
    return <span className="px-2.5 py-1 bg-slate-500/10 text-slate-400 border border-slate-500/20 rounded-full font-medium text-xs">{level}</span>;
  }

  return (
    <main className="h-full flex flex-col p-6">
      <div className="flex justify-between items-end mb-6 shrink-0">
        <div>
          <h1 className="text-3xl font-bold font-['Outfit'] text-text-main">Role & Permission Management</h1>
          <p className="text-text-muted mt-1">Configure system roles and access levels.</p>
        </div>
        
        <button onClick={() => {
          setEditingRoleId(null);
          setRName('');
          setRPermissions([]);
          setHasWebAccess(false);
          setHasMobileAccess(false);
          setShowRoleModal(true);
        }} className="glass-button px-5 py-2.5 rounded-xl font-medium shadow-sm flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          Add Custom Role
        </button>
      </div>

      <div className="glass-panel rounded-2xl flex-1 overflow-hidden flex flex-col">
        <div className="overflow-y-auto">
          <table className="w-full text-left border-collapse glass-table">
            <thead className="sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Role Name</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Access Level</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Users</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {roles.map(r => (
                <tr key={r.id} className="hover:bg-panel-bg transition-colors group">
                  <td className="px-6 py-4 font-bold text-text-main">{r.name}</td>
                  <td className="px-6 py-4 text-text-muted">Custom configured role</td>
                  <td className="px-6 py-4">{getAccessBadge('Custom Policy')}</td>
                  <td className="px-6 py-4 text-text-sub font-medium">0</td>
                  <td className="px-6 py-4 text-right opacity-100 ">
                    <button onClick={() => handleEditClick(r)} className="px-3 py-1.5 bg-panel-solid text-text-sub rounded-lg hover:bg-slate-500/20 hover:text-slate-400 transition-colors border border-panel-border text-xs font-medium">Edit Policy</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showRoleModal && (
        <div className="fixed inset-0 bg-panel-bg backdrop-blur-md flex items-center justify-center z-50">
          <div className="glass-panel rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all border border-panel-border">
            <div className="p-6 border-b border-panel-border bg-panel-bg flex justify-between items-center">
              <h3 className="font-bold font-['Outfit'] text-xl text-text-main">Configure Role & Permissions</h3>
              <button onClick={() => setShowRoleModal(false)} className="text-text-muted hover:text-text-main transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-text-sub mb-2">Role Name</label>
                <input value={rName} onChange={e=>setRName(e.target.value)} type="text" className="w-full px-4 py-3 glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500/50" placeholder="e.g. Audit Viewer" />
              </div>
              
              <div className="flex gap-6 mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={hasWebAccess} onChange={e => setHasWebAccess(e.target.checked)} className="w-4 h-4 rounded bg-panel-solid border-panel-border cursor-pointer accent-cyan-500" />
                  <span className="text-sm text-text-sub font-medium">Web Access</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={hasMobileAccess} onChange={e => setHasMobileAccess(e.target.checked)} className="w-4 h-4 rounded bg-panel-solid border-panel-border cursor-pointer accent-cyan-500" />
                  <span className="text-sm text-text-sub font-medium">Mobile Access</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-sub mb-2">Module Permissions</label>
                
                <div className="flex gap-2 mb-4 p-1 bg-panel-solid/50 rounded-lg border border-panel-border">
                  {permissionTabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                        activeTab === tab.id
                          ? 'bg-slate-500/20 text-text-main shadow-sm border border-slate-500/30'
                          : 'text-text-muted hover:text-text-sub hover:bg-panel-solid/50 border border-transparent'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="space-y-4 glass-input rounded-xl p-5 border border-panel-border max-h-64 overflow-y-auto">
                  {permissionTabs.find(t => t.id === activeTab)?.groups.map(group => (
                    <div key={group.group} className="mb-4 last:mb-0">
                      <h4 className="text-xs font-semibold text-text-main uppercase tracking-wider mb-2 pb-1 border-b border-panel-border">{group.group}</h4>
                      <div className="space-y-2">
                        {group.permissions.map(perm => (
                          <label key={perm.id} className="flex items-center group cursor-pointer pl-2">
                            <div className="relative flex items-center justify-center w-5 h-5 mr-3 shrink-0">
                              <input 
                                type="checkbox" 
                                checked={rPermissions.includes(perm.id)}
                                onChange={() => togglePermission(perm.id)}
                                className="peer appearance-none w-5 h-5 border-2 border-slate-600 rounded checked:bg-slate-500 checked:border-slate-500 transition-colors cursor-pointer" 
                              />
                              <svg className="absolute w-3 h-3 text-text-main pointer-events-none opacity-0 peer-checked:opacity-100 " fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                            </div>
                            <span className="text-sm text-text-sub group-hover:text-text-main transition-colors">{perm.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setShowRoleModal(false)} className="px-5 py-2.5 bg-panel-solid text-text-sub rounded-xl font-medium hover:bg-panel-border transition-colors border border-panel-border">Cancel</button>
                <button onClick={handleSaveRole} className="px-5 py-2.5 glass-button rounded-xl font-medium">{editingRoleId ? 'Update Role' : 'Save Role'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default RoleManagement;
