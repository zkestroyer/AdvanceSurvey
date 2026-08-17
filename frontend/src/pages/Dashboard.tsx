import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Users, Store, FileSpreadsheet, MapPin, Activity, Calendar, Clock, BarChart2, Shield, TrendingUp, Briefcase, Layout } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart as RePieChart, Pie, Cell } from 'recharts';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const Dashboard = () => {
  const [stats, setStats] = useState<any>({});
  const [charts, setCharts] = useState<any>({ topTSOs: [], surveysByTerritory: [], surveysByArea: [] });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const COLORS = ['#06b6d4', '#4f46e5', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, chartsRes] = await Promise.all([
          api.get('/analytics/dashboard'),
          api.get('/analytics/dashboard/charts')
        ]);
        if (statsRes.data.success) {
          setStats(statsRes.data.data);
        }
        if (chartsRes.data.success) {
          setCharts(chartsRes.data.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8">
        <div className="w-12 h-12 border-4 border-slate-500/30 border-t-slate-400 rounded-full animate-spin mb-4 shadow-sm"></div>
        <p className="text-slate-400 font-medium font-['Outfit'] animate-pulse">Initializing Dashboard...</p>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Shops', value: stats.totalShops || 0, icon: Store, color: 'slate', report: 'shop-addition' },
    { title: 'Shops Added Today', value: stats.shopsAddedToday || 0, icon: Calendar, color: 'emerald', report: 'shop-addition' },
    { title: 'Shops This Month', value: stats.shopsAddedThisMonth || 0, icon: TrendingUp, color: 'emerald', report: 'shop-addition' },
    { title: 'Total Surveys', value: stats.totalSurveys || 0, icon: FileSpreadsheet, color: 'cyan', report: 'survey' },
    { title: 'Surveys Today', value: stats.surveysToday || 0, icon: Clock, color: 'indigo', report: 'daily-survey' },
    { title: 'Surveys This Month', value: stats.surveysThisMonth || 0, icon: Activity, color: 'indigo', report: 'survey' },
    { title: 'Active TSOs', value: stats.activeTSOs || 0, icon: Users, color: 'slate', report: 'tso-performance' },
    { title: 'Active BDMs', value: stats.activeBDMs || 0, icon: Shield, color: 'amber', report: 'bdm-performance' },
    { title: 'Territories Covered', value: stats.territoriesCovered || 0, icon: MapPin, color: 'rose', report: 'territory-wise' },
    { title: 'Areas Covered', value: stats.areasCovered || 0, icon: Layout, color: 'rose', report: 'area-wise' },
    { title: 'Avg Surveys / TSO', value: stats.avgSurveysPerTSO || 0, icon: BarChart2, color: 'cyan', report: 'tso-performance' },
    { title: 'Pending Surveys', value: stats.pendingSurveys || 0, icon: Briefcase, color: 'amber', report: 'survey' },
  ];

class ErrorBoundary extends React.Component<any, { hasError: boolean, error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-red-900/20 text-red-400 rounded-xl">
          <h2 className="text-xl font-bold mb-4">Dashboard Component Crashed</h2>
          <pre className="text-sm overflow-auto">{this.state.error?.toString()}</pre>
          <pre className="text-xs overflow-auto mt-4 text-red-500/80">{this.state.error?.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

  return (
    <ErrorBoundary>
      <main className="p-2 md:p-6 space-y-8">
      {/* 12 Summary Counters Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {statCards.map((stat, idx) => (
          <div key={idx} onClick={() => navigate(`/reports?type=${stat.report}`)} className="glass-panel p-4 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 hover:shadow-lg hover:shadow-slate-500/10 cursor-pointer">

            <div className="flex items-center gap-3 mb-2 relative z-10">
              <div className={`w-8 h-8 rounded-full bg-${stat.color}-500/20 flex items-center justify-center text-${stat.color}-400 border border-${stat.color}-500/30 shadow-sm shrink-0`}>
                <stat.icon className="w-4 h-4" />
              </div>
              <h3 className="text-text-sub font-medium text-xs tracking-wide uppercase">{stat.title}</h3>
            </div>
            <p className="text-2xl font-bold font-['Outfit'] text-text-main relative z-10 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6">
          <h3 className="font-['Outfit'] font-bold text-lg text-text-main mb-6">Top 10 TSOs by Surveys</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.topTSOs || []} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" stroke="#94a3b8" />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" tick={{fontSize: 12}} width={80} />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(6, 182, 212, 0.3)', borderRadius: '8px', color: '#fff' }}
                />
                <Bar dataKey="surveys" fill="#06b6d4" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-6">
          <h3 className="font-['Outfit'] font-bold text-lg text-text-main mb-6">Surveys by Territory</h3>
          <div className="h-64 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={charts.surveysByTerritory || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="surveys"
                  stroke="none"
                  label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                >
                  {(charts.surveysByTerritory || []).map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(6, 182, 212, 0.3)', borderRadius: '8px', color: '#fff' }}
                />
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Coverage Map */}
      <div className="glass-panel overflow-hidden p-1">
        <div className="px-6 py-4 flex items-center justify-between border-b border-panel-border">
          <h3 className="font-['Outfit'] font-bold text-lg text-text-main">Live Coverage Map</h3>
        </div>
        <div className="h-80 w-full rounded-b-xl overflow-hidden relative bg-panel-solid flex items-center justify-center">
            <MapContainer
              center={[24.8607, 67.0011]}
              zoom={11}
              style={{ width: '100%', height: '100%', zIndex: 10 }}
              attributionControl={false}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />
              <Marker position={[24.8607, 67.0011]} icon={customIcon}>
                <Popup>TSO Active</Popup>
              </Marker>
            </MapContainer>
        </div>
      </div>
    </main>
    </ErrorBoundary>
  );
};

export default Dashboard;
