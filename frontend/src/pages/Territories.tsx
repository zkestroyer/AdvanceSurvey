import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../services/api';
import toast from 'react-hot-toast';
import Select from 'react-select';

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



const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function MapUpdater({ center }: { center: { lat: number, lng: number } | undefined }) {
  const map = useMap();
  if (center) {
    map.flyTo([center.lat, center.lng], 12, { duration: 1.5 });
  }
  return null;
}

interface Point {
  lat: number;
  lng: number;
}

interface Territory {
  id: string;
  name: string;
  bdm: string;
  tsos: number;
  shops: number;
  center: Point;
  polygon: Point[];
}


const initialTerritories: Territory[] = [
  {
    id: 't1',
    name: 'Downtown (Zone 1)',
    bdm: 'Sara Khan',
    tsos: 12,
    shops: 245,
    center: { lat: 24.8607, lng: 67.0011 },
    polygon: [
      { lat: 24.87, lng: 66.99 },
      { lat: 24.87, lng: 67.01 },
      { lat: 24.85, lng: 67.02 },
      { lat: 24.85, lng: 66.98 },
    ]
  },
  {
    id: 't2',
    name: 'North Ridge (Zone 2)',
    bdm: 'Usman Khalid',
    tsos: 8,
    shops: 130,
    center: { lat: 24.9100, lng: 67.0400 },
    polygon: [
      { lat: 24.92, lng: 67.03 },
      { lat: 24.92, lng: 67.06 },
      { lat: 24.90, lng: 67.05 },
      { lat: 24.89, lng: 67.03 },
    ]
  },
  {
    id: 't3',
    name: 'South Park (Zone 3)',
    bdm: 'Unassigned',
    tsos: 0,
    shops: 89,
    center: { lat: 24.8100, lng: 67.0800 },
    polygon: [
      { lat: 24.83, lng: 67.07 },
      { lat: 24.82, lng: 67.10 },
      { lat: 24.79, lng: 67.09 },
      { lat: 24.80, lng: 67.06 },
    ]
  }
];

const Territories = () => {
  const [territories, setTerritories] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [areas, setAreas] = useState<any[]>([]);
  const [activeId, setActiveId] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  
  useEffect(() => {
    const fetchTerritories = async () => {
      try {
        const [res, citiesRes, areasRes] = await Promise.all([
          api.get('/master/territories'),
          api.get('/master/cities'),
          api.get('/master/areas')
        ]);
        if (citiesRes.data.success) setCities(citiesRes.data.data);
        if (areasRes.data.success) setAreas(areasRes.data.data);
        
        if (res.data.success) {
          const loaded = res.data.data.map((t:any) => {
            let extra = { bdm: 'Unassigned', center: { lat: 24.8607, lng: 67.0011 }, polygon: [] };
            try { extra = JSON.parse(t.region) } catch(e){}
            return {
              id: t.id.toString(),
              name: t.name,
              bdm: extra.bdm,
              tsos: t.users?.length || 0,
              shops: t.shops?.length || 0,
              center: extra.center,
              polygon: extra.polygon
            };
          });
          if (loaded.length === 0) {
            setTerritories(initialTerritories);
            setActiveId(initialTerritories[0].id);
          } else {
            setTerritories(loaded);
            setActiveId(loaded[0].id);
          }
        }
      } catch (err) {
        toast.error('Failed to load territories');
        setTerritories(initialTerritories);
        setActiveId(initialTerritories[0].id);
      }
    };
    fetchTerritories();
  }, []);

  // Modal State
  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneBdm, setNewZoneBdm] = useState('Unassigned');
  const [newZoneCity, setNewZoneCity] = useState('');
  const [newZoneAreas, setNewZoneAreas] = useState<string[]>([]);

  const activeTerritory = territories.find(t => t.id === activeId);

  const handleSaveZone = async () => {
    if (!newZoneName) return;
    const baseLat = 24.8607 + (Math.random() * 0.1 - 0.05);
    const baseLng = 67.0011 + (Math.random() * 0.1 - 0.05);
    const center = { lat: baseLat, lng: baseLng };
    const polygon = [
        { lat: baseLat + 0.01, lng: baseLng - 0.01 },
        { lat: baseLat + 0.01, lng: baseLng + 0.01 },
        { lat: baseLat - 0.01, lng: baseLng + 0.01 },
        { lat: baseLat - 0.01, lng: baseLng - 0.01 },
    ];
    
    try {
      const res = await api.post('/master/territories', {
        name: newZoneName,
        region: JSON.stringify({ bdm: newZoneBdm, center, polygon, areas: newZoneAreas })
      });
      if (res.data.success) {
        const t = res.data.data;
        const newT = {
          id: t.id.toString(),
          name: t.name,
          bdm: newZoneBdm,
          tsos: 0,
          shops: 0,
          center,
          polygon
        };
        setTerritories([...territories, newT]);
        setActiveId(newT.id);
        setShowModal(false);
        setNewZoneName('');
        setNewZoneCity('');
        setNewZoneAreas([]);
        toast.success('New zone created successfully');
      }
    } catch(e) {
      toast.error('Failed to create zone');
    }
  };

  const handleDeleteZone = async () => {
    if (!activeId) return;
    if (!window.confirm('Are you sure you want to delete this zone?')) return;
    try {
      // First check if it's a locally added one or from DB. Let's just call API and if it succeeds or returns 404, we remove it locally.
      // But we can just call API directly. The mock IDs might start with 't', DB IDs are numbers.
      if (!activeId.toString().startsWith('t')) {
        const res = await api.delete(`/master/territories/${activeId}`);
        if (!res.data.success) throw new Error(res.data.message);
      }
      setTerritories(territories.filter(t => t.id !== activeId));
      setActiveId(null);
      toast.success('Zone deleted successfully');
    } catch(e: any) {
      if (e.response?.data?.message) {
        toast.error(e.response.data.message);
      } else {
        toast.error('Failed to delete zone');
      }
    }
  };

  const handleEditBoundaries = () => {
    toast('Polygon drawing tools will activate in Advanced Mode.', { icon: '🗺️' });
  };

  return (
    <main className="h-full flex flex-col p-6">
      <div className="flex justify-between items-end mb-6 shrink-0">
        <div>
          <h1 className="text-3xl font-bold font-['Outfit'] text-text-main">Geo-Fencing & Territories</h1>
          <p className="text-text-muted mt-1">Manage geographic zones, map regions, and assigned BDMs.</p>
        </div>
        
        <button 
          onClick={() => setShowModal(true)} 
          className="glass-button px-5 py-2.5 rounded-xl font-medium shadow-sm flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          Create New Zone
        </button>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Left List */}
        <div className="w-96 glass-panel rounded-2xl flex flex-col shrink-0 overflow-hidden">
          <div className="p-4 border-b border-panel-border bg-panel-bg">
            <h3 className="font-bold text-text-main tracking-wide">Active Territories</h3>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-white/5 p-2 space-y-2">
            {territories.map(t => {
              const isActive = t.id === activeId;
              return (
                <div 
                  key={t.id}
                  onClick={() => setActiveId(t.id)}
                  className={`p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                    isActive 
                      ? 'bg-slate-500/10 border border-slate-500/50 ' 
                      : 'bg-transparent border border-transparent hover:bg-panel-solid/5 hover:border-panel-border'
                  }`}
                >
                  <h4 className={`font-bold ${isActive ? 'text-slate-400' : 'text-text-main'}`}>{t.name}</h4>
                  <p className="text-xs text-text-muted mt-1">Assigned BDM: <span className="text-text-sub font-medium">{t.bdm}</span></p>
                  <div className="flex gap-2 mt-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      t.tsos > 0 ? 'bg-success-bg text-success-text border-success-border' : 'bg-danger-bg text-danger-text border-danger-border'
                    }`}>
                      {t.tsos} TSOs
                    </span>
                    <span className="px-2.5 py-1 bg-slate-500/10 text-slate-400 border border-slate-500/20 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      {t.shops} Shops
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Map Area */}
        <div className="flex-1 glass-panel rounded-2xl relative overflow-hidden flex flex-col">
            <div className="flex-1 relative">
              <MapContainer
                center={[activeTerritory?.center.lat || 24.8607, activeTerritory?.center.lng || 67.0011]}
                zoom={12}
                style={{ width: '100%', height: '100%', zIndex: 10 }}
                zoomControl={true}
                attributionControl={false}
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
                
                <MapUpdater center={activeTerritory?.center} />

                {/* Render Polygons */}
                {territories.map(t => (
                  <Polygon
                    key={t.id}
                    positions={t.polygon.map(p => [p.lat, p.lng])}
                    pathOptions={{
                      fillColor: t.id === activeId ? '#06b6d4' : '#4f46e5',
                      fillOpacity: t.id === activeId ? 0.3 : 0.1,
                      color: t.id === activeId ? '#06b6d4' : '#4f46e5',
                      opacity: 0.8,
                      weight: t.id === activeId ? 3 : 1,
                    }}
                  />
                ))}

                {/* Render Center Marker for Active */}
                {activeTerritory && (
                  <Marker 
                    position={[activeTerritory.center.lat, activeTerritory.center.lng]} 
                    icon={customIcon}
                  />
                )}
              </MapContainer>
              
              {/* Map Overlay Controls */}
              {!showModal && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-panel-bg backdrop-blur-md px-6 py-3 rounded-full border border-panel-border shadow-2xl z-[1000]">
                  <span className="text-sm font-medium text-text-main flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-slate-500 rounded-full animate-pulse shadow-sm"></span>
                  {activeTerritory?.name}
                </span>
                <div className="w-px h-4 bg-panel-solid/20 mx-2"></div>
                <button onClick={handleEditBoundaries} className="text-sm font-medium text-slate-400 hover:text-slate-300 transition-colors">
                  Edit Boundaries
                </button>
                <div className="w-px h-4 bg-panel-solid/20 mx-2"></div>
                <button onClick={handleDeleteZone} className="text-sm font-medium text-danger-text hover:text-red-400 transition-colors">
                  Delete
                </button>
              </div>
              )}
            </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-panel-bg backdrop-blur-md flex items-center justify-center z-50">
          <div className="glass-panel rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all border border-panel-border">
            <div className="p-6 border-b border-panel-border bg-panel-bg flex justify-between items-center">
              <h3 className="font-bold font-['Outfit'] text-xl text-text-main">Create New Zone</h3>
              <button onClick={() => setShowModal(false)} className="text-text-muted hover:text-text-main transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-text-sub mb-2">Zone Name</label>
                <input 
                  type="text" 
                  value={newZoneName}
                  onChange={e => setNewZoneName(e.target.value)}
                  className="w-full px-4 py-3 glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500/50" 
                  placeholder="e.g. West Coast Region" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-sub mb-2">Assign to BDM</label>
                <select 
                  value={newZoneBdm}
                  onChange={e => setNewZoneBdm(e.target.value)}
                  className="w-full px-4 py-3 glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500/50 appearance-none text-text-sub"
                >
                  <option>Sara Khan</option>
                  <option>Usman Khalid</option>
                  <option>Ali Jafri</option>
                  <option>Unassigned</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-sub mb-2">City</label>
                <Select 
                  options={cities.map(c => ({ label: c.name, value: c.id }))}
                  value={cities.filter(c => c.id.toString() === newZoneCity.toString()).map(c => ({ label: c.name, value: c.id }))[0] || null}
                  onChange={(opt: any) => setNewZoneCity(opt ? opt.value : '')}
                  styles={customSelectStyles}
                  placeholder="Select City"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-sub mb-2">Areas</label>
                <Select 
                  isMulti
                  options={areas.filter(a => a.cityId?.toString() === newZoneCity.toString()).map(a => ({ label: a.name, value: a.name }))}
                  value={newZoneAreas.map(a => ({ label: a, value: a }))}
                  onChange={(opts: any) => setNewZoneAreas(opts ? opts.map((o: any) => o.value) : [])}
                  styles={customSelectStyles}
                  placeholder="Select Areas"
                  isDisabled={!newZoneCity}
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button onClick={() => setShowModal(false)} className="px-5 py-2.5 bg-panel-solid text-text-sub rounded-xl font-medium hover:bg-panel-border transition-colors border border-panel-border">Cancel</button>
                <button onClick={handleSaveZone} className="px-5 py-2.5 glass-button rounded-xl font-medium">Save Zone</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Territories;
