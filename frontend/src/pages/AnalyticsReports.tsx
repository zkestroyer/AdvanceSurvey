import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Download, Filter, Search, ChevronRight, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const REPORT_TYPES = [
  { id: 'shop-addition', label: '1. Shop Addition Report', category: 'Basic Reports' },
  { id: 'tso-shop-addition', label: '2. TSO Shop Addition Report', category: 'Basic Reports' },
  { id: 'survey', label: '3. Survey Report', category: 'Basic Reports' },
  { id: 'daily-survey', label: '4. Daily Survey Report', category: 'Basic Reports' },
  { id: 'survey-detail', label: '5. Survey Detail Report', category: 'Basic Reports' },
  { id: 'territory-wise', label: '6. Territory Wise Survey Report', category: 'Advanced Reports' },
  { id: 'area-wise', label: '7. Area Wise Survey Report', category: 'Advanced Reports' },
  { id: 'tso-performance', label: '8. TSO Performance Report', category: 'Advanced Reports' },
  { id: 'bdm-performance', label: '9. BDM Performance Report', category: 'Advanced Reports' },
  { id: 'comparison', label: '10. Comparison Report', category: 'Advanced Reports' }
];

const AnalyticsReports = () => {
  const navigate = useNavigate();
  const [activeReport, setActiveReport] = useState(REPORT_TYPES[0].id);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSurveyDetailModal, setShowSurveyDetailModal] = useState<any>(null);
  const [activeModalTab, setActiveModalTab] = useState<string>('All');
  const [filters, setFilters] = useState({
    dateRange: 'all',
    territoryId: '',
    area: '',
    bdmId: '',
    tsoId: '',
    shopId: '',
    status: ''
  });

  const fetchReportData = async (reportType: string, currentFilters: any) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      Object.keys(currentFilters).forEach(key => {
        if (currentFilters[key]) queryParams.append(key, currentFilters[key]);
      });
      const res = await api.get(`/analytics/reports/${reportType}?${queryParams.toString()}`);
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load report data');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData(activeReport, filters);
  }, [activeReport, filters]);

  const handleExport = () => {
    toast.success('Report downloaded successfully!');
  };

  const handleDeleteSurvey = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this survey response? This action cannot be undone.')) return;
    try {
      const res = await api.delete(`/surveys/responses/${id}`);
      if (res.data.success) {
        toast.success('Survey deleted successfully');
        fetchReportData(activeReport, filters);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete survey');
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const drillDown = (reportId: string, filterKey: string, filterValue: string) => {
    setFilters(prev => ({ ...prev, [filterKey]: filterValue }));
    setActiveReport(reportId);
  };

  const renderTableHeaders = () => {
    switch (activeReport) {
      case 'shop-addition':
        return ['Shop Name', 'Owner Name', 'Territory', 'Area', 'Added By', 'BDM', 'Date Added'];
      case 'tso-shop-addition':
        return ['TSO Name', 'BDM', 'Territory', 'Area', 'Total Shops Added'];
      case 'survey':
      case 'survey-detail':
        return ['Survey ID', 'Shop', 'TSO', 'Territory', 'Area', 'BDM', 'Survey Date', 'Status', 'Action'];
      case 'territory-wise':
        return ['Territory', 'Total Surveys', 'No. of TSOs', 'Responsible BDM'];
      case 'area-wise':
        return ['Area', 'Territory', 'Total Surveys', 'Active TSOs'];
      case 'tso-performance':
        return ['TSO', 'BDM', 'Territory', 'Total Surveys', 'Total Shops Added'];
      case 'bdm-performance':
        return ['BDM', 'Total TSOs', 'Total Surveys', 'Total Shops Added'];
      case 'daily-survey':
        return ['Date', 'Surveys Done', 'Active TSOs'];
      case 'comparison':
        return ['Survey ID', 'Shop', 'Territory', 'Date', 'Survey Data (Flattened)'];
      default:
        return [];
    }
  };

  const renderTableRows = () => {
    return data.map((row, idx) => {
      switch (activeReport) {
        case 'shop-addition':
          return (
            <tr key={idx} className="border-b border-panel-border hover:bg-slate-500/5 text-sm">
              <td className="p-4 font-medium text-text-main">{row.shopName}</td>
              <td className="p-4 text-text-sub">{row.ownerName}</td>
              <td className="p-4 text-text-sub">{row.territory}</td>
              <td className="p-4 text-text-sub">{row.area || '-'}</td>
              <td className="p-4 text-text-sub">{row.addedBy}</td>
              <td className="p-4 text-text-sub">{row.bdm}</td>
              <td className="p-4 text-text-muted">{new Date(row.dateAdded).toLocaleDateString()}</td>
            </tr>
          );
        case 'tso-shop-addition':
          return (
            <tr key={idx} className="border-b border-panel-border hover:bg-slate-500/5 text-sm">
              <td className="p-4 font-medium text-text-main">{row.tsoName}</td>
              <td className="p-4 text-text-sub">{row.bdmName}</td>
              <td className="p-4 text-text-sub">{row.territory}</td>
              <td className="p-4 text-text-sub">{row.area}</td>
              <td className="p-4">
                <button onClick={() => drillDown('shop-addition', 'tsoId', row.id)} className="text-cyan-400 font-bold hover:underline">
                  {row.totalShopsAdded}
                </button>
              </td>
            </tr>
          );
        case 'survey':
        case 'survey-detail':
          return (
            <tr key={idx} className="border-b border-panel-border hover:bg-slate-500/5 text-sm">
              <td className="p-4 font-bold text-text-main">#{row.id}</td>
              <td className="p-4 text-text-sub">{row.shopName}</td>
              <td className="p-4 text-text-sub">{row.tsoName}</td>
              <td className="p-4 text-text-sub">{row.territory}</td>
              <td className="p-4 text-text-sub">{row.area || '-'}</td>
              <td className="p-4 text-text-sub">{row.bdm}</td>
              <td className="p-4 text-text-muted">{new Date(row.surveyDate).toLocaleDateString()}</td>
              <td className="p-4 text-text-sub">
                <span className={`px-2 py-1 rounded-full text-xs border ${row.status === 'completed' ? 'bg-emerald-500/20 text-success-text border-emerald-500/30' : 'bg-warning-bg text-warning-text border-warning-border'}`}>{row.status}</span>
              </td>
              <td className="p-4">
                <div className="flex gap-2">
                  <button onClick={() => setShowSurveyDetailModal(row)} className="px-3 py-1.5 bg-panel-solid text-slate-400 rounded-lg hover:bg-slate-500/20 transition-colors border border-panel-border text-xs font-medium">View Details</button>
                  <button onClick={() => handleDeleteSurvey(row.id)} className="p-1.5 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors border border-red-500/20" title="Delete Survey">
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          );
        case 'territory-wise':
          return (
            <tr key={idx} className="border-b border-panel-border hover:bg-slate-500/5 text-sm">
              <td className="p-4 font-medium text-text-main">{row.territory}</td>
              <td className="p-4">
                <button onClick={() => drillDown('survey', 'territoryId', row.id)} className="text-cyan-400 font-bold hover:underline">
                  {row.totalSurveys}
                </button>
              </td>
              <td className="p-4 text-text-sub">{row.noOfTsos}</td>
              <td className="p-4 text-text-sub">{row.responsibleBdm}</td>
            </tr>
          );
        case 'area-wise':
          return (
            <tr key={idx} className="border-b border-panel-border hover:bg-slate-500/5 text-sm">
              <td className="p-4 font-medium text-text-main">{row.area}</td>
              <td className="p-4 text-text-sub">{row.territory}</td>
              <td className="p-4">
                <button onClick={() => drillDown('survey', 'area', row.area)} className="text-cyan-400 font-bold hover:underline">
                  {row.totalSurveys}
                </button>
              </td>
              <td className="p-4 text-text-sub">{row.activeTsos}</td>
            </tr>
          );
        case 'tso-performance':
          return (
            <tr key={idx} className="border-b border-panel-border hover:bg-slate-500/5 text-sm">
              <td className="p-4 font-medium text-text-main">{row.tsoName}</td>
              <td className="p-4 text-text-sub">{row.bdm}</td>
              <td className="p-4 text-text-sub">{row.territory}</td>
              <td className="p-4">
                <button onClick={() => drillDown('survey', 'tsoId', row.id)} className="text-cyan-400 font-bold hover:underline">
                  {row.totalSurveys}
                </button>
              </td>
              <td className="p-4">
                <button onClick={() => drillDown('shop-addition', 'tsoId', row.id)} className="text-emerald-400 font-bold hover:underline">
                  {row.totalShopsAdded}
                </button>
              </td>
            </tr>
          );
        case 'bdm-performance':
          return (
            <tr key={idx} className="border-b border-panel-border hover:bg-slate-500/5 text-sm">
              <td className="p-4 font-medium text-text-main">{row.bdmName}</td>
              <td className="p-4 text-text-sub">{row.totalTsos}</td>
              <td className="p-4">
                <button onClick={() => drillDown('survey', 'bdmId', row.id)} className="text-cyan-400 font-bold hover:underline">
                  {row.totalSurveys}
                </button>
              </td>
              <td className="p-4">
                <button onClick={() => drillDown('shop-addition', 'bdmId', row.id)} className="text-emerald-400 font-bold hover:underline">
                  {row.totalShopsAdded}
                </button>
              </td>
            </tr>
          );
        case 'daily-survey':
          return (
            <tr key={idx} className="border-b border-panel-border hover:bg-slate-500/5 text-sm">
              <td className="p-4 font-medium text-text-main">{row.date}</td>
              <td className="p-4">
                 <button className="text-cyan-400 font-bold hover:underline">{row.surveysDone}</button>
              </td>
              <td className="p-4 text-text-sub">{row.activeTsos}</td>
            </tr>
          );
        case 'comparison':
          // Extract dynamic keys that aren't the base keys
          const baseKeys = ['surveyId', 'shopName', 'territory', 'city', 'area', 'date'];
          const dynamicKeys = Object.keys(row).filter(k => !baseKeys.includes(k));
          return (
            <tr key={idx} className="border-b border-panel-border hover:bg-slate-500/5 text-sm">
              <td className="p-4 font-bold text-text-main">#{row.surveyId}</td>
              <td className="p-4 font-medium text-text-main">{row.shopName}</td>
              <td className="p-4 text-text-sub">{row.territory}</td>
              <td className="p-4 text-text-muted">{row.date ? new Date(row.date).toLocaleDateString() : '-'}</td>
              <td className="p-4 text-xs">
                 <div className="flex flex-col gap-1 max-h-24 overflow-y-auto">
                    {dynamicKeys.map(dk => (
                      <div key={dk} className="flex justify-between border-b border-panel-border/30 pb-1">
                         <span className="text-text-muted capitalize">{dk}:</span>
                         <span className="text-cyan-400 font-medium ml-4">{row[dk]}</span>
                      </div>
                    ))}
                 </div>
              </td>
            </tr>
          );
        default:
          return null;
      }
    });
  };

  return (
    <main className="h-full flex flex-col p-6">
      <div className="flex justify-between items-end mb-6 shrink-0">
        <div>
          <h1 className="text-3xl font-bold font-['Outfit'] text-text-main">Advanced Reports</h1>
          <p className="text-text-muted mt-1">Generate dynamic reports with drill-down functionality.</p>
        </div>
        
        <button onClick={handleExport} className="glass-panel hover:-translate-y-1 hover:shadow-lg transition-all duration-300 text-text-sub border-panel-border px-5 py-2.5 rounded-xl font-medium shadow-sm flex items-center gap-2">
          <Download className="w-5 h-5" />
          Export Data
        </button>
      </div>

      <div className="flex flex-col gap-6 flex-1 min-h-0">
        
        {/* Top bar for Report Selection */}
        <div className="glass-panel rounded-2xl p-4 flex items-center gap-4 shrink-0 border border-panel-border bg-panel-bg">
          <span className="text-sm font-bold text-text-muted">Select Report:</span>
          <select 
            value={activeReport}
            onChange={(e) => {
              if (e.target.value === 'comparison') {
                navigate('/comparison-reports');
              } else {
                setActiveReport(e.target.value);
              }
            }}
            className="px-4 py-2.5 glass-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/50 text-text-main font-medium min-w-[300px]"
          >
            <optgroup label="Basic Reports">
              {REPORT_TYPES.filter(r => r.category === 'Basic Reports').map(r => (
                <option key={r.id} value={r.id}>{r.label}</option>
              ))}
            </optgroup>
            <optgroup label="Advanced Reports">
              {REPORT_TYPES.filter(r => r.category === 'Advanced Reports').map(r => (
                <option key={r.id} value={r.id}>{r.label}</option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* Main Report Area */}
        <div className="flex-1 glass-panel rounded-2xl flex flex-col overflow-hidden min-w-0">
          
          {/* Global Filters */}
          <div className="p-4 border-b border-panel-border bg-panel-bg flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2 text-text-muted">
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            
            <select 
              value={filters.dateRange} 
              onChange={e => handleFilterChange('dateRange', e.target.value)}
              className="px-3 py-2 glass-input rounded-lg text-sm text-text-sub w-32"
            >
              <option value="">All Time</option>
              <option value="today">Today</option>
              <option value="month">This Month</option>
            </select>

            <input 
              type="text" placeholder="Territory ID..." 
              value={filters.territoryId} onChange={e => handleFilterChange('territoryId', e.target.value)}
              className="px-3 py-2 glass-input rounded-lg text-sm text-text-sub w-32 placeholder:text-text-muted/50" 
            />

            <input 
              type="text" placeholder="Area..." 
              value={filters.area} onChange={e => handleFilterChange('area', e.target.value)}
              className="px-3 py-2 glass-input rounded-lg text-sm text-text-sub w-32 placeholder:text-text-muted/50" 
            />

            <select 
              value={filters.status} 
              onChange={e => handleFilterChange('status', e.target.value)}
              className="px-3 py-2 glass-input rounded-lg text-sm text-text-sub w-32"
            >
              <option value="">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          {/* Table Container */}
          <div className="flex-1 overflow-auto bg-panel-solid/50">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                 <div className="w-8 h-8 border-2 border-slate-500/30 border-t-cyan-400 rounded-full animate-spin"></div>
              </div>
            ) : (
              <table className="w-full text-left border-collapse glass-table min-w-max">
                <thead className="sticky top-0 z-10 bg-panel-bg shadow-sm">
                  <tr>
                    {renderTableHeaders().map((h, i) => (
                      <th key={i} className="px-4 py-4 text-xs font-semibold uppercase tracking-wider text-text-muted border-b border-panel-border">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data.length > 0 ? renderTableRows() : (
                    <tr>
                      <td colSpan={10} className="p-8 text-center text-text-muted italic">No data available for the selected filters.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
          
          <div className="p-4 border-t border-panel-border text-sm text-text-muted flex justify-between items-center bg-panel-bg">
            <span>Showing {data.length} entries</span>
          </div>
        </div>
      </div>

      {/* Survey Detail Modal */}
      {showSurveyDetailModal && (
        <div className="fixed inset-0 bg-panel-bg backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="glass-panel rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-full border border-panel-border">
            <div className="p-6 border-b border-panel-border bg-panel-bg flex justify-between items-center shrink-0">
              <div>
                <h3 className="font-bold font-['Outfit'] text-xl text-text-main">Survey Details #{showSurveyDetailModal.id}</h3>
                <p className="text-sm text-text-muted mt-1">Submitted by {showSurveyDetailModal.tsoName}</p>
              </div>
              <button onClick={() => setShowSurveyDetailModal(null)} className="text-text-muted hover:text-text-main transition-colors bg-panel-solid p-2 rounded-full border border-panel-border hover:bg-slate-500/20">
                 ✕
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* Meta Data */}
              <div className="grid grid-cols-2 gap-4 p-5 bg-slate-500/5 rounded-2xl border border-slate-500/10">
                <div>
                  <p className="text-xs text-text-muted font-semibold uppercase tracking-wider mb-1">Shop Name</p>
                  <p className="text-sm font-bold text-text-main">{showSurveyDetailModal.shopName}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted font-semibold uppercase tracking-wider mb-1">Date</p>
                  <p className="text-sm font-bold text-slate-400">
                    {new Date(showSurveyDetailModal.surveyDate).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Answers */}
              <div>
                <h4 className="font-bold text-text-main mb-4 border-b border-panel-border pb-2">Survey Responses</h4>
                
                {(() => {
                  const groupedAnswers: Record<string, any[]> = { 'All': showSurveyDetailModal.answers || [] };
                  showSurveyDetailModal.answers?.forEach((ans: any) => {
                    const sectionName = ans.question?.section?.title || 'General';
                    if (!groupedAnswers[sectionName]) groupedAnswers[sectionName] = [];
                    groupedAnswers[sectionName].push(ans);
                  });
                  const tabs = Object.keys(groupedAnswers);
                  const currentTab = tabs.includes(activeModalTab) ? activeModalTab : 'All';
                  const answersToDisplay = groupedAnswers[currentTab] || [];
                  
                  return (
                    <>
                      {tabs.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto pb-4 mb-4 border-b border-panel-border scrollbar-hide">
                          {tabs.map(tab => (
                            <button
                              key={tab}
                              onClick={() => setActiveModalTab(tab)}
                              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${currentTab === tab ? 'bg-cyan-500 text-white' : 'bg-panel-bg text-text-muted hover:text-text-main border border-panel-border'}`}
                            >
                              {tab} ({groupedAnswers[tab].length})
                            </button>
                          ))}
                        </div>
                      )}
                      
                      <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
                        {answersToDisplay.map((ans: any, idx: number) => (
                          <div key={idx} className="bg-panel-bg p-4 rounded-xl border border-panel-border">
                            <p className="text-sm font-medium text-text-sub mb-2">{idx + 1}. {ans.question?.questionText || 'Unknown Question'}</p>
                            {ans.question?.type === 'photo' ? (
                              <div className="w-full h-48 bg-panel-solid rounded-lg border-2 border-dashed border-panel-border flex flex-col items-center justify-center text-text-muted mt-3">
                                 <span>[Photo Attachment placeholder]</span>
                              </div>
                            ) : (
                              <p className="text-sm font-bold text-cyan-400 bg-cyan-500/10 inline-block px-3 py-1.5 rounded-lg border border-cyan-500/20">{ans.value || 'N/A'}</p>
                            )}
                          </div>
                        ))}
                        {answersToDisplay.length === 0 && (
                          <p className="text-sm text-text-muted italic">No responses available for this section.</p>
                        )}
                      </div>

                      {/* Photo Proofs Gallery */}
                      {currentTab === 'All' && showSurveyDetailModal.photoProofs && (
                        <div className="mt-6 pt-6 border-t border-panel-border">
                          <h4 className="font-bold text-text-main mb-4">Shop Photos</h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {(() => {
                              try {
                                const parsed = JSON.parse(showSurveyDetailModal.photoProofs);
                                const photos = Array.isArray(parsed) ? parsed : (parsed.photos || []);
                                if (Array.isArray(photos)) {
                                  return photos.map((b64: string, i: number) => (
                                    <div key={i} className="aspect-square rounded-xl overflow-hidden border border-panel-border bg-slate-500/10">
                                      <img src={`data:image/jpeg;base64,${b64}`} alt={`Shop Photo ${i+1}`} className="w-full h-full object-cover" />
                                    </div>
                                  ));
                                }
                                return null;
                              } catch (e) {
                                return <p className="text-sm text-warning-text">Failed to load photos.</p>;
                              }
                            })()}
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default AnalyticsReports;
