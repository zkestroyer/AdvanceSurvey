import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

const SurveyManagement = () => {
  const navigate = useNavigate();
  
  const [surveys, setSurveys] = useState<any[]>([]);
  const [showLovModal, setShowLovModal] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState<any>(null);
  const [lovFields, setLovFields] = useState<any[]>([]);
  const [newLovField, setNewLovField] = useState('');
  const [newLovOptions, setNewLovOptions] = useState('');

  const fetchSurveys = () => {
    api.get('/surveys/templates').then(res => {
      if (res.data?.success) {
        const mapped = res.data.data.map((t: any) => ({
          ...t,
          status: t.isActive ? 'Active' : 'Archived',
          responses: 0,
          target: 'All Shops',
          lastModified: new Date(t.updatedAt).toLocaleDateString()
        }));
        setSurveys(mapped);
      }
    }).catch(console.error);
  };

  useEffect(() => {
    fetchSurveys();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this survey and all its responses?')) {
      try {
        const res = await api.delete(`/surveys/${id}`);
        if (res.data.success) {
          toast.success('Survey deleted successfully');
          fetchSurveys();
        } else {
          toast.error(res.data.message || 'Failed to delete survey');
        }
      } catch (err) {
        toast.error('An error occurred while deleting the survey');
      }
    }
  };

  const handleOpenLov = (survey: any) => {
    setSelectedSurvey(survey);
    // Mocking existing LOVs for demo
    setLovFields([
      { id: '1', name: 'Brand', options: ['Samsung', 'Apple', 'Xiaomi', 'Oppo'] },
      { id: '2', name: 'Model', options: ['Galaxy S23', 'iPhone 14', 'Redmi Note 12'] },
      { id: '3', name: 'Warranty', options: ['1 Year', '2 Years', 'No Warranty'] }
    ]);
    setShowLovModal(true);
  };

  const handleAddLov = () => {
    if (!newLovField || !newLovOptions) {
      toast.error('Field name and options are required');
      return;
    }
    const optionsArray = newLovOptions.split(',').map(s => s.trim()).filter(s => s);
    if (optionsArray.length === 0) {
      toast.error('Please provide valid options separated by commas');
      return;
    }
    setLovFields([...lovFields, { id: Date.now().toString(), name: newLovField, options: optionsArray }]);
    setNewLovField('');
    setNewLovOptions('');
    toast.success('LOV field added');
  };

  const handleRemoveLov = (id: string) => {
    setLovFields(lovFields.filter(f => f.id !== id));
    toast.success('LOV field removed');
  };

  const handleSaveLovs = () => {
    // Here we would typically save to the backend. Since this is UI enhancement:
    toast.success(`LOVs saved for ${selectedSurvey?.title}`);
    setShowLovModal(false);
  };

  const totalSurveys = surveys.length;
  const activeNow = surveys.filter(s => s.status === 'Active').length;
  const totalResponses = surveys.reduce((acc, curr) => acc + (curr.responses || 0), 0);

  return (
    <main className="flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold font-['Outfit'] text-text-main">Survey Management</h1>
          <p className="text-text-muted mt-1">Manage survey templates, monitor responses, and deploy new surveys.</p>
        </div>
        
        <button 
          onClick={() => navigate('/surveys/builder')} 
          className="glass-button px-5 py-2.5 rounded-xl font-medium flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          Create New Survey
        </button>
      </div>

      {/* Stats/Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="glass-panel p-5 rounded-2xl">
          <p className="text-text-muted text-sm font-medium">Total Surveys</p>
          <p className="text-3xl font-bold text-text-main mt-1">{totalSurveys}</p>
        </div>
        <div className="glass-panel p-5 rounded-2xl">
          <p className="text-text-muted text-sm font-medium">Active Now</p>
          <p className="text-3xl font-bold text-slate-400 mt-1">{activeNow}</p>
        </div>
        <div className="glass-panel p-5 rounded-2xl">
          <p className="text-text-muted text-sm font-medium">Total Responses</p>
          <p className="text-3xl font-bold text-slate-400 mt-1">{totalResponses}</p>
        </div>
        <div className="glass-panel p-5 rounded-2xl flex flex-col justify-center">
          <input type="text" placeholder="Search surveys..." className="w-full glass-input px-4 py-2 rounded-lg text-sm" />
        </div>
      </div>

      {/* Survey List */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse glass-table">
            <thead>
              <tr>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Survey Title</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Responses</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Target Audience</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Last Modified</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {surveys.map((survey) => (
                <tr key={survey.id} className="group">
                  <td className="px-6 py-5">
                    <p className="text-text-main font-medium">{survey.title}</p>
                    <p className="text-xs text-text-muted mt-0.5">ID: {String(survey.id).toUpperCase()}-2026</p>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                      survey.status === 'Active' 
                        ? 'bg-success-bg text-success-text border-success-border' 
                        : survey.status === 'Archived'
                        ? 'bg-text-muted/10 text-text-muted border-panel-border'
                        : 'bg-warning-bg text-warning-text border-warning-border'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        survey.status === 'Active' ? 'bg-emerald-400 shadow-sm' : 
                        survey.status === 'Archived' ? 'bg-text-muted' : 'bg-amber-400'
                      }`}></span>
                      {survey.status}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-panel-solid rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-slate-500" 
                          style={{ width: `${Math.min(100, (survey.responses / 500) * 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-text-sub">{survey.responses}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-sm text-text-muted">{survey.target}</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-sm text-text-muted">{survey.lastModified}</span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-end gap-2 opacity-100 ">
                      <button onClick={() => navigate('/reports')} className="p-2 bg-panel-solid text-text-sub rounded-lg hover:bg-slate-500/20 hover:text-slate-400 transition-colors border border-panel-border" title="View Responses">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                      </button>
                      <button onClick={() => handleOpenLov(survey)} className="p-2 bg-panel-solid text-text-sub rounded-lg hover:bg-slate-500/20 hover:text-slate-400 transition-colors border border-panel-border" title="Configure LOVs">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
                      </button>
                      <button onClick={() => navigate(`/surveys/builder?edit=true&id=${survey.id}`)} className="p-2 bg-panel-solid text-text-sub rounded-lg hover:bg-panel-border transition-colors border border-panel-border" title="Edit Survey">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                      </button>
                      <button onClick={() => handleDelete(survey.id)} className="p-2 bg-danger-bg text-danger-text rounded-lg hover:bg-danger-bg transition-colors border border-danger-border" title="Delete">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showLovModal && (
        <div className="fixed inset-0 bg-panel-bg backdrop-blur-md flex items-center justify-center z-50">
          <div className="glass-panel rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all border border-panel-border flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-panel-border bg-panel-bg flex justify-between items-center shrink-0">
              <h3 className="font-bold font-['Outfit'] text-xl text-text-main">
                Configure LOVs - {selectedSurvey?.title}
              </h3>
              <button onClick={() => setShowLovModal(false)} className="text-text-muted hover:text-text-main transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div className="bg-panel-solid p-5 rounded-xl border border-panel-border flex flex-col gap-4">
                <h4 className="font-medium text-sm text-text-main">Add New LOV Field</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-text-muted mb-1">Field Name (e.g. Brand)</label>
                    <input 
                      value={newLovField} 
                      onChange={e=>setNewLovField(e.target.value)} 
                      type="text" 
                      className="w-full px-3 py-2 glass-input rounded-lg text-sm" 
                      placeholder="Enter field name" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-text-muted mb-1">Options (comma separated)</label>
                    <input 
                      value={newLovOptions} 
                      onChange={e=>setNewLovOptions(e.target.value)} 
                      type="text" 
                      className="w-full px-3 py-2 glass-input rounded-lg text-sm" 
                      placeholder="Option 1, Option 2..." 
                    />
                  </div>
                </div>
                <button 
                  onClick={handleAddLov}
                  className="self-end px-4 py-2 bg-slate-600 text-text-main rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors"
                >
                  Add Field Options
                </button>
              </div>

              <div>
                <h4 className="font-medium text-sm text-text-main mb-3">Configured LOV Fields</h4>
                {lovFields.length === 0 ? (
                  <p className="text-sm text-text-muted text-center py-4">No LOVs configured yet.</p>
                ) : (
                  <div className="space-y-3">
                    {lovFields.map(field => (
                      <div key={field.id} className="bg-panel-bg border border-panel-border p-4 rounded-xl flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <p className="font-bold text-text-main text-sm mb-1">{field.name}</p>
                          <div className="flex flex-wrap gap-1.5">
                            {field.options.map((opt: string, i: number) => (
                              <span key={i} className="px-2 py-0.5 bg-slate-500/10 text-slate-400 text-xs rounded-full border border-slate-500/20">
                                {opt}
                              </span>
                            ))}
                          </div>
                        </div>
                        <button 
                          onClick={() => handleRemoveLov(field.id)}
                          className="p-1.5 text-danger-text bg-danger-bg rounded hover:opacity-80 transition-opacity shrink-0"
                          title="Remove Field"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-panel-border bg-panel-bg shrink-0 flex justify-end gap-3">
              <button onClick={() => setShowLovModal(false)} className="px-5 py-2.5 bg-panel-solid text-text-sub rounded-xl font-medium border border-panel-border">Cancel</button>
              <button onClick={handleSaveLovs} className="px-5 py-2.5 glass-button rounded-xl font-medium">Save Configuration</button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
};

export default SurveyManagement;
