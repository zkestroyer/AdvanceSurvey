import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';

const customSelectStyles = {
  control: (base: any, state: any) => ({
    ...base,
    background: '#ffffff',
    borderColor: state.isFocused ? '#94a3b8' : '#e2e8f0',
    borderRadius: '0.75rem',
    padding: '0.15rem',
    boxShadow: 'none',
    '&:hover': {
      borderColor: '#94a3b8'
    }
  }),
  menu: (base: any) => ({
    ...base,
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '0.75rem',
    overflow: 'hidden',
    zIndex: 50,
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
  }),
  option: (base: any, state: any) => ({
    ...base,
    backgroundColor: state.isSelected 
      ? '#f1f5f9' 
      : state.isFocused 
        ? '#f8fafc' 
        : 'transparent',
    color: '#0f172a',
    cursor: 'pointer',
    '&:active': {
      backgroundColor: '#e2e8f0'
    }
  }),
  singleValue: (base: any) => ({
    ...base,
    color: '#000000',
    fontWeight: '500'
  }),
  input: (base: any) => ({
    ...base,
    color: '#000000'
  }),
  placeholder: (base: any) => ({
    ...base,
    color: '#94a3b8'
  }),
  multiValue: (base: any) => ({
    ...base,
    backgroundColor: '#f1f5f9',
    borderRadius: '0.5rem'
  }),
  multiValueLabel: (base: any) => ({
    ...base,
    color: '#0f172a'
  }),
  multiValueRemove: (base: any) => ({
    ...base,
    color: '#64748b',
    ':hover': {
      backgroundColor: '#fee2e2',
      color: '#ef4444'
    }
  })
};

const MOCK_AREAS: Record<string, string[]> = {
  'Karachi': ['Clifton', 'DHA', 'Gulshan-e-Iqbal', 'Nazimabad', 'Saddar', 'Tariq Road', 'Malir', 'Korangi'],
  'Lahore': ['DHA', 'Gulberg', 'Model Town', 'Johar Town', 'Wapda Town', 'Cantt', 'Bahria Town'],
  'Islamabad': ['F-8', 'F-10', 'F-11', 'G-9', 'G-10', 'G-11', 'Blue Area', 'I-8']
};

interface User {
  id: string;
  name: string;
  email: string;
  initials: string;
  role: any;
  territory: any;
  status: 'Active' | 'Inactive';
  lastLogin: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [territories, setTerritories] = useState<any[]>([]);
  const [regions, setRegions] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [areas, setAreas] = useState<any[]>([]);

  useEffect(() => {
    const fetchUsersData = async () => {
      try {
        const [uRes, rRes, tRes, regRes, cityRes, areaRes] = await Promise.all([
          api.get('/master/users'),
          api.get('/master/roles'),
          api.get('/master/territories'),
          api.get('/master/regions'),
          api.get('/master/cities'),
          api.get('/master/areas')
        ]);
        if (uRes.data.success) setUsers(uRes.data.data);
        if (rRes.data.success) setRoles(rRes.data.data);
        if (tRes.data.success) setTerritories(tRes.data.data);
        if (regRes?.data?.success) setRegions(regRes.data.data);
        if (cityRes?.data?.success) setCities(cityRes.data.data);
        if (areaRes?.data?.success) setAreas(areaRes.data.data);
      } catch (err) {
        toast.error('Failed to load users data');
      }
    };
    fetchUsersData();
  }, []);
  
  // Modals
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showAssignTerritoryModal, setShowAssignTerritoryModal] = useState<string | null>(null);
  const [showDeactivateModal, setShowDeactivateModal] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);

  const [editUserId, setEditUserId] = useState<string | null>(null);

  // Form State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newEmployeeId, setNewEmployeeId] = useState('');
  const [newMobileNumber, setNewMobileNumber] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newConfirmPassword, setNewConfirmPassword] = useState('');
  const [newDesignation, setNewDesignation] = useState('');
  const [newDepartment, setNewDepartment] = useState('');
  const [newStatus, setNewStatus] = useState('Active');
  
  // Filter States
  const [filterRole, setFilterRole] = useState('All Roles');
  const [filterStatus, setFilterStatus] = useState('All Statuses');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [newRegion, setNewRegion] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newArea, setNewArea] = useState('');
  const [newTerritory, setNewTerritory] = useState('');
  const [newCnic, setNewCnic] = useState('');
  const [newAssignedBdmId, setNewAssignedBdmId] = useState('');
  const [newDeviceImei, setNewDeviceImei] = useState('');
  const [newDeviceType, setNewDeviceImeiType] = useState('');

  const [newDashboardAccess, setNewDashboardAccess] = useState(false);
  const [newReportAccess, setNewReportAccess] = useState(false);
  const [newExportPermission, setNewExportPermission] = useState(false);

  const [assignTerritory, setAssignTerritory] = useState('');

  const openAddUser = () => {
    setEditUserId(null);
    setNewName(''); setNewEmail(''); setNewRole(''); setNewEmployeeId('');
    setNewMobileNumber(''); setNewUsername(''); setNewPassword(''); setNewConfirmPassword('');
    setNewDesignation(''); setNewDepartment(''); setNewStatus('Active');
    setNewRegion(''); setNewCity(''); setNewArea(''); setNewTerritory(''); setNewCnic('');
    setNewAssignedBdmId(''); setNewDeviceImei(''); setNewDeviceImeiType('');
    setNewDashboardAccess(false); setNewReportAccess(false); setNewExportPermission(false);
    setShowAddUserModal(true);
  };

  const openEditUser = (u: any) => {
    setEditUserId(u.id);
    setNewName(u.name || ''); setNewEmail(u.email || ''); setNewRole(u.roleId?.toString() || u.role?.id?.toString() || ''); setNewEmployeeId(u.employeeId || '');
    setNewMobileNumber(u.mobileNumber || ''); setNewUsername(u.email ? u.email.split('@')[0] : ''); setNewPassword(''); setNewConfirmPassword('');
    setNewDesignation(u.designation || ''); setNewDepartment(u.department || ''); setNewStatus(u.status || 'Active');
    setNewRegion(''); setNewCity(''); setNewArea(''); setNewTerritory(u.territoryId?.toString() || u.territory?.id?.toString() || ''); setNewCnic(u.cnic || '');
    setNewAssignedBdmId(u.assignedBdmId?.toString() || ''); setNewDeviceImei(u.deviceImei || ''); setNewDeviceImeiType(u.deviceType || '');
    setNewDashboardAccess(!!u.dashboardAccess); setNewReportAccess(!!u.reportAccess); setNewExportPermission(!!u.exportPermission);
    setShowAddUserModal(true);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNewEmail(val);
    setNewUsername(val);
  };

  const handleAddUser = async () => {
    if (!newName || !newRole) return toast.error('Name and role are required!');
    if (!editUserId && !newPassword) return toast.error('Password is required for new users!');
    
    const selectedRoleName = roles.find(r => r.id.toString() === newRole)?.name;
    const requiresConfirmPassword = selectedRoleName === 'Admin' || selectedRoleName === 'Management';
    
    if (newPassword && requiresConfirmPassword) {
      if (!newConfirmPassword) return toast.error('Confirm Password is required');
      if (newPassword !== newConfirmPassword) return toast.error('Passwords do not match');
    }
    
    try {
      const payload: any = {
        name: newName,
        email: newEmail || `${newUsername}@domain.com`,
        roleId: newRole,
        employeeId: newEmployeeId,
        mobileNumber: newMobileNumber,
        designation: newDesignation,
        department: newDepartment,
        cnic: newCnic,
        deviceImei: newDeviceImei,
        deviceType: newDeviceType,
        status: newStatus,
        assignedBdmId: newAssignedBdmId,
        territoryId: newTerritory,
        dashboardAccess: newDashboardAccess,
        reportAccess: newReportAccess,
        exportPermission: newExportPermission
      };
      
      if (newPassword) payload.password = newPassword;

      if (editUserId) {
        const res = await api.put(`/master/users/${editUserId}`, payload);
        if (res.data.success) {
          setUsers(users.map(u => u.id === editUserId ? { ...res.data.data, role: roles.find(r=>r.id.toString()===newRole), territory: territories.find(t=>t.id.toString()===newTerritory.toString()) } : u));
          setShowAddUserModal(false);
          toast.success('User updated successfully');
        }
      } else {
        const res = await api.post('/master/users', payload);
        if (res.data.success) {
          setUsers([...users, { ...res.data.data, role: roles.find(r=>r.id.toString()===newRole), territory: territories.find(t=>t.id.toString()===newTerritory.toString()) }]);
          setShowAddUserModal(false);
          toast.success('User added successfully');
        }
      }
    } catch (e) {
      toast.error(editUserId ? 'Failed to update user' : 'Failed to add user');
    }
  };

  const handleAssignTerritory = async () => {
    if (!showAssignTerritoryModal) return;
    try {
      const res = await api.put(`/master/users/${showAssignTerritoryModal}/territory`, { territoryId: assignTerritory });
      if (res.data.success) {
        const selectedTerritory = territories.find(t => t.id.toString() === assignTerritory);
        setUsers(users.map(u => u.id === showAssignTerritoryModal ? { ...u, territory: selectedTerritory } : u));
        setShowAssignTerritoryModal(null);
        toast.success('Territory assigned');
      }
    } catch(e) {
      toast.error('Failed to assign territory');
    }
  };

  const handleDeactivate = async () => {
    if (!showDeactivateModal) return;
    try {
      const res = await api.put(`/master/users/${showDeactivateModal}/status`, { status: 'Inactive' });
      if (res.data.success) {
        setUsers(users.map(u => u.id === showDeactivateModal ? { ...u, status: 'Inactive' } : u));
        setShowDeactivateModal(null);
        toast.success('User deactivated');
      }
    } catch (e) {
      toast.error('Failed to deactivate user');
    }
  };

  const handleDelete = async () => {
    if (!showDeleteModal) return;
    try {
      const res = await api.delete(`/master/users/${showDeleteModal}`);
      if (res.data.success) {
        setUsers(users.filter(u => u.id !== showDeleteModal));
        setShowDeleteModal(null);
        toast.success('User deleted');
      }
    } catch (e) {
      toast.error('Failed to delete user');
    }
  };

  const handleCnicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^0-9]/g, '');
    if (val.length > 13) val = val.substring(0, 13);
    
    let formatted = val;
    if (val.length > 5 && val.length <= 12) {
      formatted = val.substring(0, 5) + '-' + val.substring(5);
    } else if (val.length > 12) {
      formatted = val.substring(0, 5) + '-' + val.substring(5, 12) + '-' + val.substring(12);
    }
    setNewCnic(formatted);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^0-9]/g, '');
    if (val.length > 11) val = val.substring(0, 11);
    
    let formatted = val;
    if (val.length > 4) {
      formatted = val.substring(0, 4) + '-' + val.substring(4);
    }
    setNewMobileNumber(formatted);
  };

  const selectedRoleName = roles.find(r => r.id.toString() === newRole)?.name || '';

  return (
    <main className="h-full flex flex-col p-6 overflow-hidden">
      <div className="flex justify-between items-end mb-6 shrink-0">
        <div>
          <h1 className="text-3xl font-bold font-['Outfit'] text-text-main">User Management</h1>
          <p className="text-text-muted mt-1">Manage Admins, BDMs, and TSOs.</p>
        </div>
        
        <button onClick={openAddUser} className="glass-button px-5 py-2.5 rounded-xl font-medium shadow-sm flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
          Add New User
        </button>
      </div>

      {/* Filters */}
      <div className="glass-panel p-4 rounded-2xl mb-6 flex gap-4 shrink-0">
        <select value={filterRole} onChange={e => setFilterRole(e.target.value)} className="px-4 py-2 glass-input rounded-lg text-sm bg-panel-bg backdrop-blur-sm text-text-sub">
          <option>All Roles</option>
          {roles.map(r => <option key={r.id}>{r.name}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-4 py-2 glass-input rounded-lg text-sm bg-panel-bg backdrop-blur-sm text-text-sub">
          <option>All Statuses</option>
          <option>Active</option>
          <option>Inactive</option>
        </select>
        <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} type="text" placeholder="Search users by name or email..." className="flex-1 px-4 py-2 glass-input rounded-lg text-sm bg-panel-bg backdrop-blur-sm placeholder-slate-500" />
      </div>

      {/* Users Table */}
      <div className="glass-panel rounded-2xl flex-1 overflow-hidden flex flex-col">
        <div className="overflow-y-auto">
          <table className="w-full text-left border-collapse glass-table">
            <thead className="sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Territory/Zone</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {users.filter(user => {
                const roleMatch = filterRole === 'All Roles' || user.role?.name === filterRole;
                const statusMatch = filterStatus === 'All Statuses' || user.status === filterStatus;
                const searchMatch = !searchQuery || (user.name && user.name.toLowerCase().includes(searchQuery.toLowerCase())) || (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase()));
                return roleMatch && statusMatch && searchMatch;
              }).map(user => {
                const initials = user.name ? user.name.split(' ').map((n:any) => n[0]).join('').toUpperCase().substring(0, 2) : 'U';
                return (
                <tr key={user.id} className="hover:bg-panel-bg transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-500/20 text-slate-400 border border-slate-500/30 flex items-center justify-center font-bold text-xs shadow-sm">{initials}</div>
                      <div>
                        <p className="font-medium text-text-main">{user.name}</p>
                        <p className="text-xs text-text-muted">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-slate-500/10 text-slate-400 border border-slate-500/20 rounded-full font-medium text-xs tracking-wider">{user.role?.name || 'Unknown'}</span>
                  </td>
                  <td className="px-6 py-4 text-text-sub">{user.territory?.name || 'Unassigned'}</td>
                  <td className="px-6 py-4">
                    {user.status === 'Inactive' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-panel-bg text-text-muted border-panel-border">
                        Inactive
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-success-bg text-success-text border-success-border">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm"></span>Active
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-100 ">
                      <button onClick={() => openEditUser(user)} className="p-2 bg-panel-solid text-text-sub rounded-lg hover:bg-slate-500/20 hover:text-slate-400 transition-colors border border-panel-border" title="Edit User">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                      </button>
                      <button onClick={() => setShowAssignTerritoryModal(user.id)} className="p-2 bg-panel-solid text-text-sub rounded-lg hover:bg-slate-500/20 hover:text-slate-400 transition-colors border border-panel-border" title="Assign Territory">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                      </button>
                      <button onClick={() => setShowDeactivateModal(user.id)} className="p-2 bg-danger-bg text-danger-text rounded-lg hover:bg-danger-bg transition-colors border border-danger-border" title="Deactivate User">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path></svg>
                      </button>
                      <button onClick={() => setShowDeleteModal(user.id)} className="p-2 bg-danger-bg text-red-500 rounded-lg hover:bg-red-500/20 transition-colors border border-danger-border" title="Delete User">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              );})}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODALS */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-panel-bg/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="glass-panel rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden transform transition-all border border-panel-border flex flex-col">
            <div className="p-6 border-b border-panel-border bg-panel-bg flex justify-between items-center shrink-0">
              <h3 className="font-bold font-['Outfit'] text-xl text-text-main">{editUserId ? 'Edit User' : 'Add New User'}</h3>
              <button onClick={() => setShowAddUserModal(false)} className="text-text-muted hover:text-text-main">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* Always visible Role selection */}
              <div>
                <label className="block text-sm font-medium text-text-sub mb-2">Select Role to configure fields</label>
                <select value={newRole} onChange={e=>setNewRole(e.target.value)} className="w-full px-4 py-3 glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500/50 appearance-none text-text-main font-semibold">
                  <option value="" disabled>Select Role</option>
                  {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>

              {selectedRoleName && (
                <>
                  <div className="border-t border-white/10 pt-4">
                    <h4 className="text-text-main font-bold mb-4 font-['Outfit']">Basic Information</h4>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-text-sub mb-2">Full Name*</label>
                        <input value={newName} onChange={e=>setNewName(e.target.value)} type="text" className="w-full px-4 py-3 glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500/50" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-sub mb-2">Employee ID*</label>
                        <input value={newEmployeeId} onChange={e=>setNewEmployeeId(e.target.value)} type="text" className="w-full px-4 py-3 glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500/50" />
                      </div>
                      
                      {selectedRoleName !== 'TSO' && (
                        <div>
                          <label className="block text-sm font-medium text-text-sub mb-2">Email*</label>
                          <input value={newEmail} onChange={handleEmailChange} type="email" className="w-full px-4 py-3 glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500/50" />
                        </div>
                      )}
                      
                      {selectedRoleName === 'TSO' && (
                        <div>
                          <label className="block text-sm font-medium text-text-sub mb-2">CNIC (Optional)</label>
                          <input value={newCnic} onChange={handleCnicChange} placeholder="12345-1234567-1" type="text" className="w-full px-4 py-3 glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500/50" />
                        </div>
                      )}
                      
                      <div>
                        <label className="block text-sm font-medium text-text-sub mb-2">Mobile Number*</label>
                        <input value={newMobileNumber} onChange={handlePhoneChange} placeholder="0300-1234567" type="text" className="w-full px-4 py-3 glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500/50" />
                      </div>

                      {selectedRoleName === 'TSO' && (
                        <div>
                          <label className="block text-sm font-medium text-text-sub mb-2">Email</label>
                          <input value={newEmail} onChange={handleEmailChange} type="email" className="w-full px-4 py-3 glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500/50" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-4">
                    <h4 className="text-text-main font-bold mb-4 font-['Outfit']">Login</h4>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-text-sub mb-2">Username*</label>
                        <input value={newUsername} onChange={e=>setNewUsername(e.target.value)} type="text" className="w-full px-4 py-3 glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500/50" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-sub mb-2">Password*</label>
                        <input value={newPassword} onChange={e=>setNewPassword(e.target.value)} type="password" className="w-full px-4 py-3 glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500/50" />
                      </div>
                      {(selectedRoleName === 'Admin' || selectedRoleName === 'Management') && (
                        <div>
                          <label className="block text-sm font-medium text-text-sub mb-2">Confirm Password*</label>
                          <input value={newConfirmPassword} onChange={e=>setNewConfirmPassword(e.target.value)} type="password" className="w-full px-4 py-3 glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500/50" />
                        </div>
                      )}
                    </div>
                  </div>

                  {(selectedRoleName === 'BDM' || selectedRoleName === 'TSO') && (
                    <div className="border-t border-white/10 pt-4">
                      <h4 className="text-text-main font-bold mb-4 font-['Outfit']">{selectedRoleName === 'BDM' ? 'Organization / Assignment' : 'Assignment'}</h4>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-text-sub mb-2">Region*</label>
                          <Select 
                            options={regions.map(r => ({ label: r.name, value: r.id }))}
                            value={regions.filter(r => r.id.toString() === newRegion.toString()).map(r => ({ label: r.name, value: r.id }))[0] || null}
                            onChange={(opt: any) => setNewRegion(opt ? opt.value : '')}
                            styles={customSelectStyles}
                            placeholder="Select Region"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text-sub mb-2">City*</label>
                          <Select 
                            options={cities.filter(c => c.regionId?.toString() === newRegion.toString()).map(c => ({ label: c.name, value: c.name }))}
                            value={newCity ? { label: newCity, value: newCity } : null}
                            onChange={(opt: any) => setNewCity(opt ? opt.value : '')}
                            styles={customSelectStyles}
                            placeholder="Select City"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text-sub mb-2">Territory*</label>
                          <Select 
                            options={territories.map(t => ({ label: t.name, value: t.id }))}
                            value={territories.filter(t => t.id.toString() === newTerritory.toString()).map(t => ({ label: t.name, value: t.id }))[0] || null}
                            onChange={(opt: any) => setNewTerritory(opt ? opt.value : '')}
                            styles={customSelectStyles}
                            placeholder="Select Territory"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text-sub mb-2">Area*</label>
                          <CreatableSelect 
                            options={areas.filter(a => a.city?.name === newCity).map(a => ({ label: a.name, value: a.name }))}
                            value={newArea ? { label: newArea, value: newArea } : null}
                            onChange={(opt: any) => setNewArea(opt ? opt.value : '')}
                            styles={customSelectStyles}
                            placeholder="Select or Create Area"
                          />
                        </div>
                        {selectedRoleName === 'TSO' && (
                          <div>
                            <label className="block text-sm font-medium text-text-sub mb-2">Assigned BDM*</label>
                            <select value={newAssignedBdmId} onChange={e=>setNewAssignedBdmId(e.target.value)} className="w-full px-4 py-3 glass-input rounded-xl focus:outline-none text-text-sub">
                              <option value="">Select BDM</option>
                              {users.filter(u => u.role?.name === 'BDM' && u.status === 'Active').map(u => (
                                <option key={u.id} value={u.id}>{u.name}</option>
                              ))}
                            </select>
                          </div>
                        )}
                        {selectedRoleName === 'BDM' && (
                          <div>
                            <label className="block text-sm font-medium text-text-sub mb-2">Designation</label>
                            <input value={newDesignation} onChange={e=>setNewDesignation(e.target.value)} type="text" className="w-full px-4 py-3 glass-input rounded-xl focus:outline-none" />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {(selectedRoleName === 'Admin' || selectedRoleName === 'Management') && (
                    <div className="border-t border-white/10 pt-4">
                      <h4 className="text-text-main font-bold mb-4 font-['Outfit']">Role & Access</h4>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-text-sub mb-2">Designation</label>
                          {selectedRoleName === 'Management' ? (
                            <select value={newDesignation} onChange={e=>setNewDesignation(e.target.value)} className="w-full px-4 py-3 glass-input rounded-xl focus:outline-none text-text-sub">
                              <option value="">Select</option>
                              <option>Director</option><option>GM</option><option>Regional Head</option><option>Sales Head</option><option>CEO</option><option>Custom</option>
                            </select>
                          ) : (
                            <input value={newDesignation} onChange={e=>setNewDesignation(e.target.value)} type="text" className="w-full px-4 py-3 glass-input rounded-xl focus:outline-none" />
                          )}
                        </div>
                        {selectedRoleName === 'Admin' && (
                          <div>
                            <label className="block text-sm font-medium text-text-sub mb-2">Department</label>
                            <input value={newDepartment} onChange={e=>setNewDepartment(e.target.value)} type="text" className="w-full px-4 py-3 glass-input rounded-xl focus:outline-none" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-6 mt-4">
                        <label className="flex items-center gap-2 text-text-sub cursor-pointer">
                          <input type="checkbox" checked={newDashboardAccess} onChange={e=>setNewDashboardAccess(e.target.checked)} className="rounded bg-panel-border border-transparent focus:ring-slate-500 text-slate-500" />
                          Dashboard Access
                        </label>
                        <label className="flex items-center gap-2 text-text-sub cursor-pointer">
                          <input type="checkbox" checked={newReportAccess} onChange={e=>setNewReportAccess(e.target.checked)} className="rounded bg-panel-border border-transparent focus:ring-slate-500 text-slate-500" />
                          Reports Access
                        </label>
                        {selectedRoleName === 'Management' && (
                          <label className="flex items-center gap-2 text-text-sub cursor-pointer">
                            <input type="checkbox" checked={newExportPermission} onChange={e=>setNewExportPermission(e.target.checked)} className="rounded bg-panel-border border-transparent focus:ring-slate-500 text-slate-500" />
                            Export Permission
                          </label>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedRoleName === 'TSO' && (
                    <div className="border-t border-white/10 pt-4">
                      <h4 className="text-text-main font-bold mb-4 font-['Outfit']">Device</h4>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-text-sub mb-2">Device IMEI (Optional)</label>
                          <input value={newDeviceImei} onChange={e=>setNewDeviceImei(e.target.value)} type="text" className="w-full px-4 py-3 glass-input rounded-xl focus:outline-none" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text-sub mb-2">Device Type</label>
                          <input value={newDeviceType} onChange={e=>setNewDeviceImeiType(e.target.value)} type="text" className="w-full px-4 py-3 glass-input rounded-xl focus:outline-none" placeholder="e.g. Android" />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="border-t border-white/10 pt-4">
                    <label className="block text-sm font-medium text-text-sub mb-2">Status</label>
                    <select value={newStatus} onChange={e=>setNewStatus(e.target.value)} className="w-full px-4 py-3 glass-input rounded-xl focus:outline-none text-text-sub">
                      <option>Active</option>
                      <option>Inactive</option>
                    </select>
                  </div>
                </>
              )}
            </div>
            <div className="p-6 border-t border-panel-border bg-panel-bg flex justify-end gap-3 shrink-0">
                <button onClick={() => setShowAddUserModal(false)} className="px-5 py-2.5 bg-panel-solid text-text-sub rounded-xl font-medium hover:bg-panel-border transition-colors border border-panel-border">Cancel</button>
                <button onClick={handleAddUser} className="px-5 py-2.5 glass-button rounded-xl font-medium">{editUserId ? 'Update User' : 'Save User'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Other Modals... */}
      {showAssignTerritoryModal && (
        <div className="fixed inset-0 bg-panel-bg/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="glass-panel rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all border border-panel-border">
            <div className="p-6 border-b border-panel-border bg-panel-bg flex justify-between items-center">
              <h3 className="font-bold font-['Outfit'] text-xl text-text-main">Assign Territory</h3>
              <button onClick={() => setShowAssignTerritoryModal(null)} className="text-text-muted hover:text-text-main">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-text-sub mb-2">Select Territory</label>
                <select value={assignTerritory} onChange={e=>setAssignTerritory(e.target.value)} className="w-full px-4 py-3 glass-input rounded-xl focus:outline-none text-text-sub">
                  <option value="">Select Territory</option>
                  {territories.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-panel-border bg-panel-bg flex justify-end gap-3">
              <button onClick={() => setShowAssignTerritoryModal(null)} className="px-5 py-2.5 bg-panel-solid text-text-sub rounded-xl font-medium hover:bg-panel-border transition-colors border border-panel-border">Cancel</button>
              <button onClick={handleAssignTerritory} className="px-5 py-2.5 glass-button rounded-xl font-medium">Assign</button>
            </div>
          </div>
        </div>
      )}

      {showDeactivateModal && (
        <div className="fixed inset-0 bg-panel-bg/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="glass-panel rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all border border-panel-border">
            <div className="p-6 border-b border-panel-border bg-panel-bg flex justify-between items-center">
              <h3 className="font-bold font-['Outfit'] text-xl text-danger-text">Deactivate User</h3>
              <button onClick={() => setShowDeactivateModal(null)} className="text-text-muted hover:text-text-main">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <div className="p-6">
              <p className="text-text-main">Are you sure you want to deactivate this user? They will no longer be able to log in to the system.</p>
            </div>
            <div className="p-6 border-t border-panel-border bg-panel-bg flex justify-end gap-3">
              <button onClick={() => setShowDeactivateModal(null)} className="px-5 py-2.5 bg-panel-solid text-text-sub rounded-xl font-medium hover:bg-panel-border transition-colors border border-panel-border">Cancel</button>
              <button onClick={handleDeactivate} className="px-5 py-2.5 glass-button rounded-xl font-medium !bg-danger-bg !text-danger-text border !border-danger-border">Deactivate</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-panel-bg/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="glass-panel rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all border border-panel-border">
            <div className="p-6 border-b border-panel-border bg-panel-bg flex justify-between items-center">
              <h3 className="font-bold font-['Outfit'] text-xl text-danger-text">Delete User</h3>
              <button onClick={() => setShowDeleteModal(null)} className="text-text-muted hover:text-text-main">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <div className="p-6">
              <p className="text-text-sub">Are you sure you want to permanently delete this user? This action cannot be undone.</p>
            </div>
            <div className="p-6 border-t border-panel-border bg-panel-bg flex justify-end gap-3">
              <button onClick={() => setShowDeleteModal(null)} className="px-5 py-2.5 bg-panel-solid text-text-sub rounded-xl font-medium hover:bg-panel-border transition-colors border border-panel-border">Cancel</button>
              <button onClick={handleDelete} className="px-5 py-2.5 bg-red-500/20 text-red-500 hover:bg-red-500/30 rounded-xl font-medium border border-red-500/30">Delete</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default UserManagement;
