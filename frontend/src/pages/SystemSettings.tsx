import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';

const SystemSettings = () => {
  const [settings, setSettings] = useState({
    companyName: 'Advance Telecom',
    currency: 'USD ($)',
    timezone: 'Asia/Karachi (GMT+5)',
    mapKey: 'AIzaSyCRn04gwMcS7KXBrEWkuAm5Zbqwy8k3kR0',
    smsGateway: 'https://api.twilio.com/2010-04-01/Accounts/',
    retention: '12 Months'
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/master/settings');
        if (res.data.success) {
          const loaded: any = { ...settings };
          res.data.data.forEach((s: any) => {
            if (s.key in loaded) loaded[s.key] = s.value;
          });
          setSettings(loaded);
        }
      } catch (err) {
        toast.error('Failed to load settings');
      }
    };
    fetchSettings();
  }, []);

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    toast.loading('Saving configuration...', { id: 'sysSettings' });
    try {
      const res = await api.post('/master/settings', settings);
      if (res.data.success) {
        toast.success('System settings saved successfully!', { id: 'sysSettings' });
      } else {
        toast.error('Failed to save settings', { id: 'sysSettings' });
      }
    } catch(e) {
      toast.error('Error saving settings', { id: 'sysSettings' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (k: keyof typeof settings, v: string) => {
    setSettings({ ...settings, [k]: v });
  };

  return (
    <main className="h-full p-6 overflow-y-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold font-['Outfit'] text-text-main">System Settings</h1>
          <p className="text-text-muted mt-1">Configure global application preferences and API integrations.</p>
        </div>
        
        <button onClick={handleSave} disabled={isSaving} className="glass-button px-6 py-2.5 rounded-xl font-medium shadow-sm flex items-center gap-2">
          {isSaving ? (
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-text-main" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>
          )}
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-panel rounded-3xl p-8 border border-panel-border relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-slate-500 to-slate-500"></div>
          <h3 className="text-xl font-bold text-text-main mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            General Preferences
          </h3>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-text-sub mb-2">Company Name</label>
              <input value={settings.companyName} onChange={e=>handleChange('companyName', e.target.value)} type="text" className="w-full px-5 py-3 glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500/50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-sub mb-2">Default Currency</label>
              <select value={settings.currency} onChange={e=>handleChange('currency', e.target.value)} className="w-full px-5 py-3 glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500/50 appearance-none text-text-sub">
                <option>USD ($)</option>
                <option>PKR (Rs)</option>
                <option>EUR (€)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-sub mb-2">Timezone</label>
              <select value={settings.timezone} onChange={e=>handleChange('timezone', e.target.value)} className="w-full px-5 py-3 glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500/50 appearance-none text-text-sub">
                <option>Asia/Karachi (GMT+5)</option>
                <option>UTC</option>
                <option>America/New_York (EST)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-8 border border-panel-border relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-slate-500"></div>
          <h3 className="text-xl font-bold text-text-main mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-success-text" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            API Integrations
          </h3>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-text-sub mb-2">Google Maps API Key</label>
              <input value={settings.mapKey} onChange={e=>handleChange('mapKey', e.target.value)} type="password" className="w-full px-5 py-3 glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500/50" />
              <p className="text-xs text-text-muted mt-2">Used for Geo-Fencing and Survey Location tagging.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-sub mb-2">SMS Gateway Endpoint</label>
              <input value={settings.smsGateway} onChange={e=>handleChange('smsGateway', e.target.value)} type="text" className="w-full px-5 py-3 glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500/50" />
              <p className="text-xs text-text-muted mt-2">Used for TSO OTP verification and urgent alerts.</p>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-8 border border-panel-border col-span-1 md:col-span-2 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 to-orange-500"></div>
          <h3 className="text-xl font-bold text-text-main mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-danger-text" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path></svg>
            Data Retention Policy
          </h3>
          <div className="flex flex-col md:flex-row items-center justify-between p-6 bg-panel-bg rounded-2xl border border-panel-border gap-6">
            <div className="flex-1">
              <h4 className="font-bold text-text-main text-lg">Auto-archive old surveys</h4>
              <p className="text-sm text-text-muted mt-1 leading-relaxed">Surveys older than the selected period will be automatically moved to cold storage AWS S3 bucket to save primary database costs.</p>
            </div>
            <select value={settings.retention} onChange={e=>handleChange('retention', e.target.value)} className="w-full md:w-64 px-5 py-3 glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500/50 appearance-none text-text-sub shadow-xl">
              <option>12 Months</option>
              <option>24 Months</option>
              <option>Never Auto-archive</option>
            </select>
          </div>
        </div>
      </div>
    </main>
  );
};

export default SystemSettings;
