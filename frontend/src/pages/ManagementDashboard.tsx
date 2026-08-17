import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { Briefcase, BarChart2, Shield, Target } from 'lucide-react';

const ManagementDashboard = () => {
  const [data, setData] = useState<any>(null);
  const [comparisonData, setComparisonData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  const [groupBy, setGroupBy] = useState('week');

  const COLORS = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#64748b'];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [dashRes, compRes] = await Promise.all([
          api.get('/analytics/management/dashboard'),
          api.post('/analytics/management/comparison', { groupBy, filters: {} })
        ]);
        if (dashRes.data.success) {
          setData(dashRes.data.data);
        }
        if (compRes.data.success) {
          setComparisonData(compRes.data.data);
        }
      } catch (error) {
        console.error('Error fetching management dashboard stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [groupBy]);

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8">
        <div className="w-12 h-12 border-4 border-slate-500/30 border-t-slate-400 rounded-full animate-spin mb-4 shadow-sm"></div>
        <p className="text-slate-400 font-medium font-['Outfit'] animate-pulse">Loading Executive Dashboard...</p>
      </div>
    );
  }

  return (
    <main className="p-2 md:p-6 space-y-8">
      <div className="flex justify-between items-end mb-6 shrink-0">
        <div>
          <h1 className="text-3xl font-bold font-['Outfit'] text-text-main">Executive Dashboard</h1>
          <p className="text-text-muted mt-1">High-level view of market share, brand distribution, and comparisons.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div onClick={() => navigate('/reports?type=survey')} className="glass-panel p-6 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-indigo-500/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/30">
              <Briefcase className="w-5 h-5" />
            </div>
            <h3 className="text-text-sub font-medium text-sm tracking-wide uppercase">Total Surveys</h3>
          </div>
          <p className="text-3xl font-bold font-['Outfit'] text-text-main mt-2">{data?.kpis?.totalSurveys || 0}</p>
        </div>
        
        <div onClick={() => navigate('/reports?type=shop-addition')} className="glass-panel p-6 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-cyan-500/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 border border-cyan-500/30">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-text-sub font-medium text-sm tracking-wide uppercase">Total Shops</h3>
          </div>
          <p className="text-3xl font-bold font-['Outfit'] text-text-main mt-2">{data?.kpis?.totalShops || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6">
          <h3 className="font-['Outfit'] font-bold text-lg text-text-main mb-6">Brand Distribution (Surveys)</h3>
          <div className="h-64 w-full relative">
            {data?.brandStats?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.brandStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="count"
                    label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                  >
                    {data.brandStats.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(6, 182, 212, 0.3)', borderRadius: '8px', color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-text-muted text-center mt-20">No brand data available.</p>
            )}
          </div>
        </div>

        <div className="glass-panel p-6">
          <h3 className="font-['Outfit'] font-bold text-lg text-text-main mb-6">Product Tracking</h3>
          <div className="h-64 w-full relative">
            {data?.productStats?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.productStats} margin={{ left: -20, bottom: 20 }}>
                  <XAxis dataKey="name" stroke="#94a3b8" angle={-45} textAnchor="end" height={60} tick={{fontSize: 11}} />
                  <YAxis stroke="#94a3b8" />
                  <RechartsTooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(6, 182, 212, 0.3)', borderRadius: '8px', color: '#fff' }} />
                  <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-text-muted text-center mt-20">No product data available.</p>
            )}
          </div>
        </div>
      </div>

      <div className="glass-panel p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-['Outfit'] font-bold text-lg text-text-main">Dynamic Comparison Reports</h3>
          <select 
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value)}
            className="px-4 py-2 glass-input rounded-xl text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-slate-500/50"
          >
            <option value="week">Week-on-Week Trend</option>
            <option value="month">Month-on-Month Trend</option>
            <option value="city">Compare by City</option>
            <option value="territory">Compare by Territory</option>
          </select>
        </div>
        
        <div className="h-72 w-full relative">
          {comparisonData?.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ left: -20 }}>
                <XAxis dataKey={groupBy} stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <RechartsTooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(6, 182, 212, 0.3)', borderRadius: '8px', color: '#fff' }} />
                <Legend />
                <Bar dataKey="count" name="Count" fill="#06b6d4" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-text-muted text-center mt-20">No comparison data available.</p>
          )}
        </div>
      </div>

    </main>
  );
};

export default ManagementDashboard;
