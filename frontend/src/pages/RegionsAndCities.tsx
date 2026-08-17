import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import Papa from 'papaparse';
import { Upload, Download } from 'lucide-react';

export default function RegionsAndCities() {
  const [regions, setRegions] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [areas, setAreas] = useState<any[]>([]);
  
  const [newRegionName, setNewRegionName] = useState('');
  const [newCityName, setNewCityName] = useState('');
  const [newAreaName, setNewAreaName] = useState('');
  
  const [selectedRegionId, setSelectedRegionId] = useState('');
  const [selectedCityId, setSelectedCityId] = useState('');
  
  const [regionSearch, setRegionSearch] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [areaSearch, setAreaSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [regionsRes, citiesRes, areasRes] = await Promise.all([
        api.get('/master/regions'),
        api.get('/master/cities'),
        api.get('/master/areas')
      ]);
      const fetchedRegions = regionsRes.data.data || [];
      const fetchedCities = citiesRes.data.data || [];
      const fetchedAreas = areasRes.data.data || [];
      
      setRegions(fetchedRegions.sort((a:any, b:any) => a.name.localeCompare(b.name)));
      setCities(fetchedCities.sort((a:any, b:any) => a.name.localeCompare(b.name)));
      setAreas(fetchedAreas.sort((a:any, b:any) => a.name.localeCompare(b.name)));
    } catch (e) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRegion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRegionName.trim()) return;
    try {
      const res = await api.post('/master/regions', { name: newRegionName });
      if (res.data.success) {
        setRegions([...regions, res.data.data]);
        setNewRegionName('');
        toast.success('Region added successfully');
      }
    } catch (e) {
      toast.error('Failed to add region');
    }
  };

  const handleAddCity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCityName.trim() || !selectedRegionId) return;
    try {
      const res = await api.post('/master/cities', { name: newCityName, regionId: selectedRegionId });
      if (res.data.success) {
        setCities([...cities, res.data.data]);
        setNewCityName('');
        toast.success('City added successfully');
      }
    } catch (e) {
      toast.error('Failed to add city');
    }
  };

  const handleAddArea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAreaName.trim() || !selectedCityId) return;
    try {
      const res = await api.post('/master/areas', { name: newAreaName, cityId: selectedCityId });
      if (res.data.success) {
        setAreas([...areas, res.data.data].sort((a,b)=>a.name.localeCompare(b.name)));
        setNewAreaName('');
        toast.success('Area added successfully');
      }
    } catch (e) {
      toast.error('Failed to add area');
    }
  };

  const handleDeleteRegion = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this region?')) return;
    try {
      await api.delete(`/master/regions/${id}`);
      setRegions(regions.filter(r => r.id !== id));
      setCities(cities.filter(c => c.regionId !== id)); // Cascaded deletes
      toast.success('Region deleted');
    } catch (e) {
      toast.error('Failed to delete region');
    }
  };

  const handleDeleteCity = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this city?')) return;
    try {
      await api.delete(`/master/cities/${id}`);
      setCities(cities.filter(c => c.id !== id));
      toast.success('City deleted');
    } catch (e) {
      toast.error('Failed to delete city');
    }
  };

  const handleDeleteArea = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this area?')) return;
    try {
      await api.delete(`/master/areas/${id}`);
      setAreas(areas.filter(a => a.id !== id));
      toast.success('Area deleted');
    } catch (e) {
      toast.error('Failed to delete area');
    }
  };

  const handleCityFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const citiesToImport = results.data.map((row: any) => ({
            name: row['City Name'] || row.name || row.City,
            region: row.Region || row.region || ''
          })).filter(c => c.name);

          if (citiesToImport.length === 0) {
            toast.error('No valid cities found in CSV');
            return;
          }

          const res = await api.post('/master/cities/bulk', { cities: citiesToImport });
          if (res.data.success) {
            fetchData();
            toast.success(`${res.data.data.length} cities imported successfully`);
          }
        } catch (err) {
          toast.error('Failed to import cities');
        }
        if (e.target) e.target.value = '';
      },
      error: () => toast.error('Error parsing CSV file')
    });
  };

  const handleAreaFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const areasToImport = results.data.map((row: any) => ({
            name: row['Area Name'] || row.name || row.Area,
            city: row.City || row.city || ''
          })).filter(a => a.name);

          if (areasToImport.length === 0) {
            toast.error('No valid areas found in CSV');
            return;
          }

          const res = await api.post('/master/areas/bulk', { areas: areasToImport });
          if (res.data.success) {
            fetchData();
            toast.success(`${res.data.data.length} areas imported successfully`);
          }
        } catch (err) {
          toast.error('Failed to import areas');
        }
        if (e.target) e.target.value = '';
      },
      error: () => toast.error('Error parsing CSV file')
    });
  };

  const downloadSampleCityCSV = () => {
    const csvContent = 'data:text/csv;charset=utf-8,City Name,Region\nLahore,Central Region (Punjab)\n';
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Sample_Cities.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadSampleAreaCSV = () => {
    const csvContent = 'data:text/csv;charset=utf-8,Area Name,City\nGulshan-e-Iqbal,Karachi\n';
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Sample_Areas.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="p-8 text-white">Loading...</div>;

  const filteredRegions = regions.filter(r => r.name.toLowerCase().includes(regionSearch.toLowerCase()));
  const filteredCities = cities.filter(c => c.name.toLowerCase().includes(citySearch.toLowerCase()));
  const filteredAreas = areas.filter(a => a.name.toLowerCase().includes(areaSearch.toLowerCase()));

  return (
    <main className="h-full flex flex-col p-0 overflow-hidden">
      <div className="mb-6 shrink-0">
        <h1 className="text-3xl font-bold font-['Outfit'] text-text-main">Regions, Cities & Areas</h1>
        <p className="text-text-muted mt-1">Manage geographic hierarchy for your system.</p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0 overflow-hidden">
        {/* Regions Panel */}
        <div className="glass-panel rounded-2xl flex flex-col min-h-0 overflow-hidden">
          <div className="p-5 border-b border-panel-border shrink-0">
            <h2 className="text-xl font-bold text-text-main mb-4 font-['Outfit']">Add Region</h2>
            <form onSubmit={handleAddRegion} className="flex gap-4">
              <input 
                value={newRegionName} 
                onChange={e=>setNewRegionName(e.target.value)} 
                type="text" 
                placeholder="E.g., North Region" 
                className="flex-1 min-w-0 px-4 py-2.5 glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500/50 text-sm" 
              />
              <button type="submit" className="glass-button px-5 py-2.5 rounded-xl font-medium shadow-sm text-sm shrink-0">
                Add Region
              </button>
            </form>
          </div>

          <div className="p-4 border-b border-panel-border bg-panel-bg shrink-0 flex items-center justify-between gap-4">
            <h3 className="font-bold text-text-main tracking-wide">Existing Regions</h3>
            <input 
              type="text" 
              placeholder="Search Region..." 
              value={regionSearch}
              onChange={e => setRegionSearch(e.target.value)}
              className="px-3 py-1.5 glass-input rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500/50 text-xs w-40"
            />
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {filteredRegions.length === 0 ? <p className="text-text-muted p-4 text-center text-sm">No regions found.</p> : (
              <div className="divide-y divide-panel-border">
                {filteredRegions.map(r => (
                  <div key={r.id} className="flex justify-between items-center p-4 hover:bg-panel-solid/5 transition-colors group">
                    <span className="text-text-main font-medium">{r.name}</span>
                    <button onClick={() => handleDeleteRegion(r.id)} className="text-danger-text hover:bg-danger-bg p-2 rounded-lg font-medium opacity-0 group-hover:opacity-100 transition-all text-xs">
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Cities Panel */}
        <div className="glass-panel rounded-2xl flex flex-col min-h-0 overflow-hidden">
          <div className="p-5 border-b border-panel-border shrink-0">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-text-main font-['Outfit']">Add City</h2>
              <div className="flex items-center gap-2">
                <button onClick={downloadSampleCityCSV} className="text-slate-400 hover:text-white transition-colors" title="Download Sample CSV">
                  <Download className="w-4 h-4" />
                </button>
                <label className="text-slate-400 hover:text-white transition-colors cursor-pointer" title="Upload CSV">
                  <Upload className="w-4 h-4" />
                  <input type="file" accept=".csv" className="hidden" onChange={handleCityFileUpload} />
                </label>
              </div>
            </div>
            <form onSubmit={handleAddCity} className="flex flex-col gap-3">
              <div className="flex gap-3">
                <input 
                  value={newCityName} 
                  onChange={e=>setNewCityName(e.target.value)} 
                  type="text" 
                  placeholder="E.g., Lahore" 
                  className="flex-1 min-w-0 px-4 py-2.5 glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500/50 text-sm" 
                />
                <select 
                  value={selectedRegionId} 
                  onChange={e=>setSelectedRegionId(e.target.value)} 
                  className="flex-1 min-w-0 px-4 py-2.5 glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500/50 text-text-main bg-panel-bg text-sm appearance-none truncate"
                >
                  <option value="" disabled>Select Region</option>
                  {regions.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="glass-button px-5 py-2.5 rounded-xl font-medium shadow-sm w-full text-sm">
                Add City
              </button>
            </form>
          </div>

          <div className="p-4 border-b border-panel-border bg-panel-bg shrink-0 flex items-center justify-between gap-4">
            <h3 className="font-bold text-text-main tracking-wide">Existing Cities</h3>
            <input 
              type="text" 
              placeholder="Search City..." 
              value={citySearch}
              onChange={e => setCitySearch(e.target.value)}
              className="px-3 py-1.5 glass-input rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500/50 text-xs w-40"
            />
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {filteredCities.length === 0 ? <p className="text-text-muted p-4 text-center text-sm">No cities found.</p> : (
              <div className="divide-y divide-panel-border">
                {filteredCities.map(c => (
                  <div key={c.id} className="flex justify-between items-center p-4 hover:bg-panel-solid/5 transition-colors group">
                    <div>
                      <p className="text-text-main font-bold">{c.name}</p>
                      <p className="text-xs text-text-muted mt-1">Region: <span className="text-text-sub font-medium">{c.region?.name || 'Unknown'}</span></p>
                    </div>
                    <button onClick={() => handleDeleteCity(c.id)} className="text-danger-text hover:bg-danger-bg p-2 rounded-lg font-medium opacity-0 group-hover:opacity-100 transition-all text-xs shrink-0">
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Areas Panel */}
        <div className="glass-panel rounded-2xl flex flex-col min-h-0 overflow-hidden">
          <div className="p-5 border-b border-panel-border shrink-0">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-text-main font-['Outfit']">Add Area</h2>
              <div className="flex items-center gap-2">
                <button onClick={downloadSampleAreaCSV} className="text-slate-400 hover:text-white transition-colors" title="Download Sample CSV">
                  <Download className="w-4 h-4" />
                </button>
                <label className="text-slate-400 hover:text-white transition-colors cursor-pointer" title="Upload CSV">
                  <Upload className="w-4 h-4" />
                  <input type="file" accept=".csv" className="hidden" onChange={handleAreaFileUpload} />
                </label>
              </div>
            </div>
            <form onSubmit={handleAddArea} className="flex flex-col gap-3">
              <div className="flex gap-3">
                <input 
                  value={newAreaName} 
                  onChange={e=>setNewAreaName(e.target.value)} 
                  type="text" 
                  placeholder="E.g., Gulshan-e-Iqbal" 
                  className="flex-1 min-w-0 px-4 py-2.5 glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500/50 text-sm" 
                />
                <select 
                  value={selectedCityId} 
                  onChange={e=>setSelectedCityId(e.target.value)} 
                  className="flex-1 min-w-0 px-4 py-2.5 glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500/50 text-text-main bg-panel-bg text-sm appearance-none truncate"
                >
                  <option value="" disabled>Select City</option>
                  {cities.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="glass-button px-5 py-2.5 rounded-xl font-medium shadow-sm w-full text-sm">
                Add Area
              </button>
            </form>
          </div>

          <div className="p-4 border-b border-panel-border bg-panel-bg shrink-0 flex items-center justify-between gap-4">
            <h3 className="font-bold text-text-main tracking-wide">Existing Areas</h3>
            <input 
              type="text" 
              placeholder="Search Area..." 
              value={areaSearch}
              onChange={e => setAreaSearch(e.target.value)}
              className="px-3 py-1.5 glass-input rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500/50 text-xs w-40"
            />
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {filteredAreas.length === 0 ? <p className="text-text-muted p-4 text-center text-sm">No areas found.</p> : (
              <div className="divide-y divide-panel-border">
                {filteredAreas.map(a => (
                  <div key={a.id} className="flex justify-between items-center p-4 hover:bg-panel-solid/5 transition-colors group">
                    <div>
                      <p className="text-text-main font-bold">{a.name}</p>
                      <p className="text-xs text-text-muted mt-1">City: <span className="text-text-sub font-medium">{a.city?.name || 'Unknown'}</span></p>
                    </div>
                    <button onClick={() => handleDeleteArea(a.id)} className="text-danger-text hover:bg-danger-bg p-2 rounded-lg font-medium opacity-0 group-hover:opacity-100 transition-all text-xs shrink-0">
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
