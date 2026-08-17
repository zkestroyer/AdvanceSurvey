import { useState, useEffect } from 'react';
import { Download, Filter, BarChart2, Table as TableIcon, History, ChevronDown, ChevronUp, ChevronsUpDown, Play, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import api from '../services/api';
import Select from 'react-select';



const ComparisonReports = () => {
  const [activeTab, setActiveTab] = useState<'tabular' | 'graphical' | 'history'>('tabular');
  
  // Lovable App layout states
  const [comparisonType, setComparisonType] = useState<string>('Compare Products');
  const [comparisonMode, setComparisonMode] = useState<'Multi-select' | 'Comparison rows'>('Multi-select');
  const [dateFrom, setDateFrom] = useState('2026-02-01');
  const [dateTo, setDateTo] = useState('2026-08-10');
  
  const [hasRun, setHasRun] = useState(false);

  // Data for dropdowns
  const [products, setProducts] = useState<any[]>([]);
  const [territories, setTerritories] = useState<any[]>([]);
  const [shops, setShops] = useState<any[]>([]);
  const [regions, setRegions] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, terrRes, shopRes, regRes, cityRes] = await Promise.all([
          api.get('/master/products'),
          api.get('/master/territories'),
          api.get('/master/shops'),
          api.get('/master/regions'),
          api.get('/master/cities'),
        ]);
        if (prodRes.data.success) setProducts(prodRes.data.data);
        if (terrRes.data.success) setTerritories(terrRes.data.data);
        if (shopRes.data.success) setShops(shopRes.data.data);
        if (regRes?.data?.success) setRegions(regRes.data.data);
        if (cityRes?.data?.success) setCities(cityRes.data.data);
      } catch (e) {
        console.error('Error fetching comparison data:', e);
      }
    };
    fetchData();
  }, []);

  const defaultFilters = {
    productCategory: '',
    brand: [] as string[],
    comparisonEntities: [] as string[],
    product: '',
    distributor: '',
    warranty: '',
    ipRating: '',
    capacity: '',
    energy: '',
    territory: '',
    city: '',
    area: '',
    surveyType: '',
    stockAvailability: ''
  };

  const [draftFilters, setDraftFilters] = useState(defaultFilters);
  const [activeFilters, setActiveFilters] = useState(defaultFilters);

  const handleFilterChange = (key: string, value: any) => {
    setDraftFilters(prev => {
      const next = { ...prev, [key]: value };
      if (key === 'productCategory') { next.brand = []; next.product = ''; }
      if (key === 'brand') { next.product = ''; }
      return next;
    });
  };

  const handleRunComparison = () => {
    setActiveFilters(draftFilters);
    setHasRun(true);
    toast.success('Comparison generated');
  };

  const handleReset = () => {
    setDraftFilters(defaultFilters);
    setActiveFilters(defaultFilters);
    setHasRun(false);
    setComparisonType('Compare Products');
    setComparisonMode('Multi-select');
  };

  // Derive unique values for dropdowns
  const uniqueCategories = Array.from(new Set(products.map(p => p.category).filter(Boolean))).sort();
  
  const getFilteredBrands = () => {
    const source = draftFilters.productCategory 
      ? products.filter(p => p.category === draftFilters.productCategory) 
      : products;
    const seen = new Map<string, string>();
    source.forEach(p => {
      if (p.brand) {
        const key = p.brand.trim().toLowerCase();
        if (!seen.has(key)) seen.set(key, p.brand.trim());
      }
    });
    return Array.from(seen.values()).sort();
  };
  const filteredBrands = getFilteredBrands();

  const getFilteredProducts = () => {
    let source = products;
    if (draftFilters.productCategory) source = source.filter(p => p.category === draftFilters.productCategory);
    if (draftFilters.brand && draftFilters.brand.length > 0) {
      source = source.filter(p => p.brand && draftFilters.brand.some((b: string) => p.brand.trim().toLowerCase() === b.trim().toLowerCase()));
    }
    return Array.from(new Set(source.map(p => p.name).filter(Boolean))).sort();
  };
  const filteredProducts = getFilteredProducts();

  const uniqueDistributors = Array.from(new Set(shops.filter(s => s.type === 'Distributor' || s.type === 'Importer').map(s => s.name).filter(Boolean))).sort();
  const uniqueCities = Array.from(new Set([...shops.map(s => s.city).filter(Boolean), ...cities.map(c => c.name)])).sort();
  const uniqueAreas = Array.from(new Set(shops.map(s => s.area).filter(Boolean))).sort();

  // Helper for generic tailwind select wrapper to match Lovable's shadcn select
  const ShadcnSelect = ({ label, value, onChange, options, disabled, placeholder }: any) => (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</span>
      </div>
      <div className="relative">
        <select 
          value={value} 
          onChange={e => onChange(e.target.value)} 
          disabled={disabled}
          className="appearance-none inline-flex items-center gap-2 whitespace-nowrap rounded-md text-sm cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-50 px-4 py-2 h-9 w-full font-normal text-slate-700 dark:text-slate-300"
        >
          <option value="">{placeholder || 'All'}</option>
          {options.map((opt: any) => (
            <option key={opt.value || opt} value={opt.value || opt}>
              {opt.label || opt}
            </option>
          ))}
        </select>
        <ChevronsUpDown className="absolute right-3 top-2.5 h-4 w-4 opacity-50 pointer-events-none" />
      </div>
    </div>
  );

  // Compute dynamic data based on activeFilters
  const computedData = (() => {
    let filtered = products;
    
    // Hardware Filters
    if (activeFilters.productCategory) {
      filtered = filtered.filter(p => p.category === activeFilters.productCategory);
    }
    if (activeFilters.brand && activeFilters.brand.length > 0) {
      filtered = filtered.filter(p => p.brand && activeFilters.brand.some((b: string) => p.brand.trim().toLowerCase() === b.trim().toLowerCase()));
    }
    if (activeFilters.product) {
      filtered = filtered.filter(p => p.name === activeFilters.product);
    }
    if (activeFilters.warranty) {
      filtered = filtered.filter(p => p.warranty === activeFilters.warranty);
    }
    
    const searchMatches = (p: any, term: string) => {
      const searchStr = `${p.name || ''} ${p.model || ''}`.toLowerCase();
      return searchStr.includes(term.toLowerCase());
    };
    if (activeFilters.ipRating) filtered = filtered.filter(p => searchMatches(p, activeFilters.ipRating));
    if (activeFilters.capacity) filtered = filtered.filter(p => searchMatches(p, activeFilters.capacity));
    if (activeFilters.energy) filtered = filtered.filter(p => searchMatches(p, activeFilters.energy));

    // Location/Shop Filters
    let filteredShops = shops;
    if (activeFilters.distributor) filteredShops = filteredShops.filter(s => s.name === activeFilters.distributor);
    if (activeFilters.territory) filteredShops = filteredShops.filter(s => s.territory === activeFilters.territory || s.region === activeFilters.territory);
    if (activeFilters.city) filteredShops = filteredShops.filter(s => s.city === activeFilters.city);
    if (activeFilters.area) filteredShops = filteredShops.filter(s => s.area === activeFilters.area);
    if (activeFilters.surveyType) filteredShops = filteredShops.filter(s => s.type === activeFilters.surveyType); // approximate mapping
    
    // Process core comparison entities dynamically based on Type selected
    if (activeFilters.comparisonEntities && activeFilters.comparisonEntities.length > 0) {
      if (comparisonType === 'Compare Brands') {
        filtered = filtered.filter(p => p.brand && activeFilters.comparisonEntities.includes(p.brand));
      } else if (comparisonType === 'Compare Products') {
        filtered = filtered.filter(p => p.name && activeFilters.comparisonEntities.includes(p.name));
      } else if (comparisonType === 'Compare Distributors') {
        filteredShops = filteredShops.filter(s => activeFilters.comparisonEntities.includes(s.name));
      } else if (comparisonType === 'Compare Territories') {
        filteredShops = filteredShops.filter(s => activeFilters.comparisonEntities.includes(s.territory) || activeFilters.comparisonEntities.includes(s.region));
      } else if (comparisonType === 'Compare Cities') {
        filteredShops = filteredShops.filter(s => activeFilters.comparisonEntities.includes(s.city));
      } else if (comparisonType === 'Compare Categories') {
        filtered = filtered.filter(p => p.category && activeFilters.comparisonEntities.includes(p.category));
      }
    }
    
    const baseShopCount = Math.max(1, filteredShops.length);

    if (comparisonType === 'Compare Brands') {
      // Group by Brand
      const brandMap = new Map();
      filtered.forEach(p => {
        const b = p.brand || 'Unknown';
        if (!brandMap.has(b)) brandMap.set(b, { sum: 0, count: 0 });
        brandMap.get(b).sum += (p.price || 0);
        brandMap.get(b).count += 1;
      });

      const priceData = Array.from(brandMap.entries()).map(([brand, data]) => ({
        name: brand,
        brand,
        purchasePrice: Math.round(data.sum / data.count),
        shopCount: Math.max(1, Math.floor(baseShopCount * (data.count / filtered.length))) 
      })).sort((a, b) => b.purchasePrice - a.purchasePrice);

      return { priceData };
    } else if (comparisonType === 'Compare Products') {
      // Product Comparison
      const priceData = filtered.map(p => ({
        name: p.name,
        brand: p.brand || 'Unknown',
        category: p.category,
        warranty: p.warranty || 'N/A',
        purchasePrice: p.price || 0,
        shopCount: Math.max(1, Math.floor(baseShopCount / filtered.length))
      })).sort((a, b) => b.purchasePrice - a.purchasePrice);

      return { priceData };
    } else if (comparisonType === 'Compare Distributors') {
      const distMap = new Map();
      filteredShops.forEach(s => {
        const d = (s.type === 'Distributor' || s.type === 'Importer') ? s.name : 'Other';
        if (!distMap.has(d)) distMap.set(d, 0);
        distMap.set(d, distMap.get(d) + 1);
      });
      const priceData = Array.from(distMap.entries()).map(([dist, count]) => ({
        name: dist,
        purchasePrice: 0, 
        shopCount: count
      })).sort((a, b) => b.shopCount - a.shopCount);
      return { priceData };
    } else if (comparisonType === 'Compare Territories') {
      const terrMap = new Map();
      filteredShops.forEach(s => {
        const t = s.territory || s.region || 'Unknown';
        if (!terrMap.has(t)) terrMap.set(t, 0);
        terrMap.set(t, terrMap.get(t) + 1);
      });
      const priceData = Array.from(terrMap.entries()).map(([terr, count]) => ({
        name: terr,
        purchasePrice: 0,
        shopCount: count
      })).sort((a, b) => b.shopCount - a.shopCount);
      return { priceData };
    } else if (comparisonType === 'Compare Cities') {
      const cityMap = new Map();
      filteredShops.forEach(s => {
        const c = s.city || 'Unknown';
        if (!cityMap.has(c)) cityMap.set(c, 0);
        cityMap.set(c, cityMap.get(c) + 1);
      });
      const priceData = Array.from(cityMap.entries()).map(([city, count]) => ({
        name: city,
        purchasePrice: 0,
        shopCount: count
      })).sort((a, b) => b.shopCount - a.shopCount);
      return { priceData };
    } else if (comparisonType === 'Compare Categories') {
      const catMap = new Map();
      filtered.forEach(p => {
        const c = p.category || 'Unknown';
        if (!catMap.has(c)) catMap.set(c, { sum: 0, count: 0 });
        catMap.get(c).sum += (p.price || 0);
        catMap.get(c).count += 1;
      });
      const priceData = Array.from(catMap.entries()).map(([cat, data]) => ({
        name: cat,
        purchasePrice: Math.round(data.sum / data.count),
        shopCount: Math.max(1, Math.floor(baseShopCount * (data.count / filtered.length)))
      })).sort((a, b) => b.purchasePrice - a.purchasePrice);
      return { priceData };
    }

    return { priceData: [] };
  })();

  const historyBrandKey = activeFilters.brand.length > 0 ? activeFilters.brand.join(', ') : 'Brand';
  const computedHistoryData = [
    { date: '2023-01-01', [historyBrandKey]: 26000 },
    { date: '2023-04-01', [historyBrandKey]: 26500 },
    { date: '2023-07-01', [historyBrandKey]: 27000 },
    { date: '2023-10-01', [historyBrandKey]: 27500 },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 px-6 py-4">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Comparison Engine</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Survey Management & Analytics Portal — compare brands, products, distributors and regions.</p>
          </div>
          <div className="inline-flex items-center rounded-md border border-transparent bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-2.5 py-0.5 text-xs font-normal">
            {comparisonType}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-[1400px] space-y-4 px-6 py-6">
        
        {/* Card 1: Configuration */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex flex-col space-y-1.5 p-6 pb-3">
            <div className="font-semibold tracking-tight text-base">1. Comparison Configuration</div>
          </div>
          <div className="p-6 pt-0 space-y-5">
            
            {/* Top Config Row */}
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-1.5">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Comparison Type</span>
                <div className="relative">
                  <select 
                    value={comparisonType}
                    onChange={e => {
                      setComparisonType(e.target.value as any);
                      setDraftFilters(prev => ({ ...prev, comparisonEntities: [] }));
                    }}
                    className="appearance-none inline-flex items-center gap-2 whitespace-nowrap rounded-md text-sm cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm hover:bg-slate-100 px-4 py-2 h-9 w-full font-normal"
                  >
                    <option value="Compare Products">Compare Products</option>
                    <option value="Compare Brands">Compare Brands</option>
                    <option value="Compare Distributors">Compare Distributors</option>
                    <option value="Compare Territories">Compare Territories</option>
                    <option value="Compare Cities">Compare Cities</option>
                    <option value="Compare Categories">Compare Categories</option>
                  </select>
                  <ChevronsUpDown className="absolute right-3 top-2.5 h-4 w-4 opacity-50 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Comparison Mode</span>
                <div className="inline-flex h-9 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 p-1 text-slate-500 w-full">
                  <button 
                    onClick={() => setComparisonMode('Multi-select')}
                    className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 font-medium transition-all flex-1 text-xs ${comparisonMode === 'Multi-select' ? 'bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 shadow' : ''}`}
                  >
                    Multi-select
                  </button>
                  <button 
                    onClick={() => setComparisonMode('Comparison rows')}
                    className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 font-medium transition-all flex-1 text-xs ${comparisonMode === 'Comparison rows' ? 'bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 shadow' : ''}`}
                  >
                    Comparison rows
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Date From</span>
                <input 
                  type="date" 
                  value={dateFrom} 
                  onChange={e => setDateFrom(e.target.value)}
                  className="flex w-full rounded-md border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400 h-9" 
                />
              </div>
              <div className="space-y-1.5">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Date To</span>
                <input 
                  type="date" 
                  value={dateTo} 
                  onChange={e => setDateTo(e.target.value)}
                  className="flex w-full rounded-md border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400 h-9" 
                />
              </div>
            </div>

            <div className="shrink-0 bg-slate-200 dark:bg-slate-800 h-[1px] w-full"></div>
            
            {/* Main Brand Selection */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Select {comparisonType.replace('Compare ', '')} values to compare</p>
              <div className="space-y-1.5 max-w-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{comparisonType.replace('Compare ', '')}</span>
                </div>
                <div className="relative">
                  <Select
                    isMulti
                    options={(() => {
                      if (comparisonType === 'Compare Brands') return filteredBrands.map(b => ({ label: b, value: b }));
                      if (comparisonType === 'Compare Products') return filteredProducts.map(p => ({ label: p, value: p }));
                      if (comparisonType === 'Compare Distributors') return uniqueDistributors.map(d => ({ label: d, value: d }));
                      if (comparisonType === 'Compare Territories') return Array.from(new Set(shops.map(s => s.territory || s.region).filter(Boolean))).sort().map((t: any) => ({ label: t, value: t }));
                      if (comparisonType === 'Compare Cities') return uniqueCities.map(c => ({ label: c, value: c }));
                      if (comparisonType === 'Compare Categories') return uniqueCategories.map(c => ({ label: c, value: c }));
                      return [];
                    })()}
                    value={(draftFilters.comparisonEntities || []).map((b: string) => ({ label: b, value: b }))}
                    onChange={(selected) => handleFilterChange('comparisonEntities', (selected as any[]).map((s: any) => s.value))}
                    placeholder={`Search & select ${comparisonType.replace('Compare ', '').toLowerCase()}...`}
                    className="text-sm"
                    styles={{
                      control: (base) => ({
                        ...base,
                        borderColor: '#e2e8f0',
                        borderRadius: '0.375rem',
                        boxShadow: 'none',
                        '&:hover': {
                          borderColor: '#94a3b8'
                        }
                      })
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="shrink-0 bg-slate-200 dark:bg-slate-800 h-[1px] w-full"></div>
            
            {/* Additional Filters Grid */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Additional filters</p>
              <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
                <ShadcnSelect label="Product Category" value={draftFilters.productCategory} onChange={(v: string) => handleFilterChange('productCategory', v)} options={uniqueCategories} />
                <ShadcnSelect label="Product" value={draftFilters.product} onChange={(v: string) => handleFilterChange('product', v)} options={filteredProducts} />
                <ShadcnSelect label="Distributor" value={draftFilters.distributor} onChange={(v: string) => handleFilterChange('distributor', v)} options={uniqueDistributors} />
                <ShadcnSelect label="Warranty" value={draftFilters.warranty} onChange={(v: string) => handleFilterChange('warranty', v)} options={['1 Year', '2 Years', '5 Years', '10 Years', '15 Years', '25 Years']} />
                <ShadcnSelect label="IP Rating" value={draftFilters.ipRating} onChange={(v: string) => handleFilterChange('ipRating', v)} options={['IP20', 'IP21', 'IP54', 'IP65', 'IP66']} />
                <ShadcnSelect label="Capacity" value={draftFilters.capacity} onChange={(v: string) => handleFilterChange('capacity', v)} options={['100W', '200W', '400W', '540W', '580W', '600W']} />
                <ShadcnSelect label="Energy" value={draftFilters.energy} onChange={(v: string) => handleFilterChange('energy', v)} options={['Solar', 'Wind', 'Battery']} />
                <ShadcnSelect label="Territory" value={draftFilters.territory} onChange={(v: string) => handleFilterChange('territory', v)} options={territories.map(t => t.name)} />
                <ShadcnSelect label="City" value={draftFilters.city} onChange={(v: string) => handleFilterChange('city', v)} options={uniqueCities} disabled={!draftFilters.territory} placeholder={!draftFilters.territory ? "Select Territory first" : "All"} />
                <ShadcnSelect label="Area" value={draftFilters.area} onChange={(v: string) => handleFilterChange('area', v)} options={uniqueAreas} disabled={!draftFilters.city} placeholder={!draftFilters.city ? "Select City first" : "All"} />
                <ShadcnSelect label="Survey Type" value={draftFilters.surveyType} onChange={(v: string) => handleFilterChange('surveyType', v)} options={['Pricing Survey', 'Availability Survey', 'Market Survey', 'Brand Survey']} />
                <ShadcnSelect label="Stock Availability" value={draftFilters.stockAvailability} onChange={(v: string) => handleFilterChange('stockAvailability', v)} options={['In Stock', 'Out of Stock']} />
              </div>
            </div>

          </div>
        </div>

        {/* Card 2: Actions */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex flex-col space-y-1.5 p-6 pb-3">
            <div className="font-semibold tracking-tight text-base">2. Selected Comparison Items</div>
          </div>
          <div className="p-6 pt-0 space-y-4">
            {!hasRun && (
              <div className="flex flex-wrap gap-2">
                <p className="text-sm text-slate-500 dark:text-slate-400">Nothing selected yet.</p>
              </div>
            )}
            
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center rounded-md border border-transparent bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-2.5 py-0.5 text-xs font-normal">
                Date: {dateFrom} → {dateTo}
              </div>
              {hasRun && activeFilters.comparisonEntities && activeFilters.comparisonEntities.length > 0 && (
                <div className="inline-flex items-center rounded-md border border-transparent bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-2.5 py-0.5 text-xs font-normal">
                  {comparisonType.replace('Compare ', '')}: {activeFilters.comparisonEntities.join(', ')}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button 
                onClick={handleRunComparison}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400 bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-900 shadow hover:bg-slate-900/90 h-10 rounded-md px-8"
              >
                <Play className="h-4 w-4" /> Run Comparison
              </button>
              <button 
                onClick={handleReset}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm hover:bg-slate-100 h-10 rounded-md px-8"
              >
                <RotateCcw className="h-4 w-4" /> Reset
              </button>
            </div>
          </div>
        </div>

        {/* Card 3: Results */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
          {!hasRun ? (
            <div className="p-6 flex h-40 flex-col items-center justify-center gap-1 text-center">
              <p className="text-sm font-medium">No comparison generated yet</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Configure your comparison above, then click Run Comparison.</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {/* Legacy Tabs inside the result card to retain chart viewing capabilities */}
              <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 shrink-0 p-2 gap-2">
                <button onClick={() => setActiveTab('tabular')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'tabular' ? 'bg-white dark:bg-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>Tabular View</button>
                <button onClick={() => setActiveTab('graphical')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'graphical' ? 'bg-white dark:bg-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>Graphical View</button>
                <button onClick={() => setActiveTab('history')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'history' ? 'bg-white dark:bg-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>Price History</button>
              </div>

              <div className="p-6">
                {activeTab === 'tabular' && (
                  <table className="w-full text-left border-collapse min-w-max">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase border-b border-slate-200 dark:border-slate-800">
                          {comparisonType.replace('Compare ', '')} ↕
                        </th>
                        {comparisonType === 'Compare Products' && (
                          <>
                            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase border-b border-slate-200 dark:border-slate-800">Category</th>
                            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase border-b border-slate-200 dark:border-slate-800">Warranty</th>
                          </>
                        )}
                        {(comparisonType === 'Compare Brands' || comparisonType === 'Compare Products' || comparisonType === 'Compare Categories') && (
                          <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase border-b border-slate-200 dark:border-slate-800 text-right">Purchase Price ↕</th>
                        )}
                        <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase border-b border-slate-200 dark:border-slate-800 text-right">Shop Count ↕</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {computedData.priceData.length > 0 ? computedData.priceData.map((d, i) => (
                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{d.name}</td>
                          {comparisonType === 'Compare Products' && (
                            <>
                              <td className="px-4 py-3 text-slate-500 text-sm">{d.category}</td>
                              <td className="px-4 py-3 text-slate-500 text-sm">{d.warranty}</td>
                            </>
                          )}
                          {(comparisonType === 'Compare Brands' || comparisonType === 'Compare Products' || comparisonType === 'Compare Categories') && (
                            <td className="px-4 py-3 text-right text-emerald-600 dark:text-emerald-400 font-mono">Rs. {d.purchasePrice?.toLocaleString() || 0}</td>
                          )}
                          <td className="px-4 py-3 text-right text-slate-500">{d.shopCount} Shops</td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={3} className="px-4 py-8 text-center text-slate-500 text-sm">No products match your selected filters.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}

                {activeTab === 'graphical' && (
                  <div style={{ height: '400px' }} className="w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={computedData.priceData as any[]} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis dataKey="name" stroke="#64748b" />
                        <YAxis stroke="#64748b" />
                        <Tooltip cursor={{fill: 'rgba(0,0,0,0.05)'}} contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', color: '#0f172a', borderRadius: '8px' }} />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        <Bar dataKey={
                          (comparisonType === 'Compare Brands' || comparisonType === 'Compare Products' || comparisonType === 'Compare Categories') 
                            ? "purchasePrice" 
                            : "shopCount"
                        } name={
                          (comparisonType === 'Compare Brands' || comparisonType === 'Compare Products' || comparisonType === 'Compare Categories') 
                            ? "Purchase Price (Rs)" 
                            : "Shop Count"
                        } fill="#0f172a" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {activeTab === 'history' && (
                  <div style={{ height: '400px' }} className="w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={computedHistoryData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis dataKey="date" stroke="#64748b" />
                        <YAxis stroke="#64748b" domain={['auto', 'auto']} />
                        <Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', color: '#0f172a', borderRadius: '8px' }} />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        <Line type="monotone" dataKey={historyBrandKey} name={historyBrandKey} stroke="#0f172a" strokeWidth={3} dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ComparisonReports;
