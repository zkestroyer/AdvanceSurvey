import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import Papa from 'papaparse';
import { Plus, Edit2, Download, Upload } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  category: string;
  brand?: string;
  model?: string;
  warranty?: string;
  price: number;
  isActive: boolean;
}

interface Shop {
  id: string;
  name: string;
  ownerName: string;
  territoryId: string;
  city?: string;
  area?: string;
  address?: string;
  contactNo?: string;
  classification?: string;
  type?: string;
  territory?: any;
}

const MasterData = () => {
  const [activeTab, setActiveTab] = useState<'products' | 'shops' | 'mappings'>('products');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [territories, setTerritories] = useState<any[]>([]);
  const [regions, setRegions] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [mappings, setMappings] = useState<any[]>([]);

  // Derive unique categories from actual product data
  const uniqueCategories = Array.from(new Set(products.map(p => p.category).filter(Boolean))).sort();

  // Derive unique brands, normalized case-insensitively to eliminate duplicates like Fox Ess / FoxEss
  const getUniqueBrands = (category?: string) => {
    const sourceProducts = category ? products.filter(p => p.category === category) : products;
    const allBrands = [
      ...sourceProducts.map(p => p.brand).filter(Boolean),
      ...(category ? [] : mappings.map((m: any) => m.name).filter(Boolean))
    ] as string[];
    const seen = new Map<string, string>();
    allBrands.forEach(b => {
      const key = b.trim().toLowerCase();
      if (!seen.has(key)) seen.set(key, b.trim());
    });
    return Array.from(seen.values()).sort();
  };
  const uniqueBrands = getUniqueBrands();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, shopRes, terrRes, regRes, cityRes, mapRes] = await Promise.all([
          api.get('/master/products'),
          api.get('/master/shops'),
          api.get('/master/territories'),
          api.get('/master/regions'),
          api.get('/master/cities'),
          api.get('/master/mappings/brands')
        ]);
        if (prodRes.data.success) setProducts(prodRes.data.data);
        if (shopRes.data.success) setShops(shopRes.data.data);
        if (terrRes?.data?.success) setTerritories(terrRes.data.data);
        if (regRes?.data?.success) setRegions(regRes.data.data);
        if (cityRes?.data?.success) setCities(cityRes.data.data);
        if (mapRes?.data?.success) setMappings(mapRes.data.data);
      } catch (e) {
        console.error('Error fetching master data:', e);
      }
    };
    fetchData();
  }, []);

  const [showProductModal, setShowProductModal] = useState(false);
  const [showShopModal, setShowShopModal] = useState(false);
  const [showMappingModal, setShowMappingModal] = useState(false);
  const [showProductMenu, setShowProductMenu] = useState(false);
  const [showShopMenu, setShowShopMenu] = useState(false);
  const [editProductId, setEditProductId] = useState<string | null>(null);
  const [editShopId, setEditShopId] = useState<string | null>(null);

  // Mapping Form State
  const [mBrandName, setMBrandName] = useState('');
  const [mProductId, setMProductId] = useState('');

  // Form State
  const [pName, setPName] = useState('');
  const [pCategory, setPCategory] = useState('');
  const [pBrand, setPBrand] = useState('');
  const [pModel, setPModel] = useState('');
  const [pWarranty, setPWarranty] = useState('');
  const [pPrice, setPPrice] = useState('');

  const [sName, setSName] = useState('');
  const [sOwner, setSOwner] = useState('');
  const [sContactNo, setSContactNo] = useState('');
  const [sClassification, setSClassification] = useState('Medium');
  const [sRegion, setSRegion] = useState('South');
  const [sCity, setSCity] = useState('');
  const [sArea, setSArea] = useState('');
  const [sAddress, setSAddress] = useState('');
  const [sShopType, setSShopType] = useState('Dealer');
  const [sTerritoryId, setSTerritoryId] = useState('');

  const openAddProduct = () => {
    setEditProductId(null);
    setPName(''); setPCategory(''); setPPrice('');
    setPBrand(''); setPModel(''); setPWarranty('');
    setShowProductModal(true);
  };

  const openEditProduct = (p: Product) => {
    setEditProductId(p.id);
    setPName(p.name); setPCategory(p.category); setPPrice(p.price.toString());
    setPBrand(p.brand || ''); setPModel(p.model || ''); setPWarranty(p.warranty || '');
    setShowProductModal(true);
  };

  const openAddShop = () => {
    setEditShopId(null);
    setSName(''); setSOwner(''); setSContactNo(''); setSClassification('Medium');
    setSRegion('South'); setSCity(''); setSArea(''); setSAddress(''); setSShopType('Dealer'); setSTerritoryId('');
    setShowShopModal(true);
  };

  const openEditShop = (s: Shop) => {
    setEditShopId(s.id);
    setSName(s.name); setSOwner(s.ownerName || '');
    setSContactNo(s.contactNo || ''); setSClassification(s.classification || 'Medium');
    setSCity(s.city || '');
    setSArea(s.area || '');
    setSAddress(s.address || '');
    setSShopType(s.type || 'Dealer');
    setSTerritoryId(s.territoryId?.toString() || '');
    setSRegion(s.territory?.region?.id?.toString() || s.territory?.region || '');
    setShowShopModal(true);
  };

  const handleAddProduct = async () => {
    if (!pName || !pPrice) return toast.error('Name and Price are required');
    try {
      if (editProductId) {
        const res = await api.put(`/master/products/${editProductId}`, {
          name: pName,
          category: pCategory,
          brand: pBrand,
          model: pModel,
          warranty: pWarranty,
          price: parseFloat(pPrice),
        });
        if (res.data.success) {
          setProducts(products.map(p => p.id === editProductId ? res.data.data : p));
          setShowProductModal(false);
          toast.success('Product updated successfully');
        }
      } else {
        const res = await api.post('/master/products', {
          name: pName,
          category: pCategory,
          brand: pBrand,
          model: pModel,
          warranty: pWarranty,
          price: parseFloat(pPrice),
          isActive: true
        });
        if (res.data.success) {
          setProducts([...products, res.data.data]);
          setShowProductModal(false);
          toast.success('Product added successfully');
        }
      }
    } catch (e) {
      toast.error('Failed to save product');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const productsToImport = results.data.map((row: any) => ({
            name: row.Name || row.name,
            category: row.Category || row.category || 'Hardware',
            brand: row.Brand || row.brand || '',
            model: row.Model || row.model || '',
            warranty: row.Warranty || row.warranty || '',
            price: parseFloat(row.Price || row.price) || 0,
            isActive: true
          })).filter(p => p.name);

          if (productsToImport.length === 0) {
            toast.error('No valid products found in CSV');
            return;
          }

          const res = await api.post('/master/products/bulk', { products: productsToImport });
          if (res.data.success) {
            setProducts([...products, ...res.data.data]);
            toast.success(`${res.data.data.length} products imported successfully`);
          }
        } catch (err) {
          toast.error('Failed to import products');
        }
        // Reset the file input
        if (e.target) e.target.value = '';
      },
      error: () => {
        toast.error('Error parsing CSV file');
      }
    });
  };

  const handleShopFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const shopsToImport = results.data.map((row: any) => ({
            name: row['Shop Name'] || row.name,
            ownerName: row['Owner Name'] || row.ownerName || '',
            city: row.City || row.city || '',
            area: row.Area || row.area || '',
            address: row.Address || row.address || '',
            type: row['Shop Type'] || row.type || 'Dealer',
            territoryId: row.TerritoryId || row.territoryId || 1
          })).filter(s => s.name);

          if (shopsToImport.length === 0) {
            toast.error('No valid shops found in CSV');
            return;
          }

          const res = await api.post('/master/shops/bulk', { shops: shopsToImport });
          if (res.data.success) {
            const shopRes = await api.get('/master/shops');
            if(shopRes.data.success) setShops(shopRes.data.data);
            toast.success(`${res.data.data.length} shops imported successfully`);
          }
        } catch (err) {
          toast.error('Failed to import shops');
        }
        if (e.target) e.target.value = '';
      },
      error: () => {
        toast.error('Error parsing CSV file');
      }
    });
  };

  const downloadSampleShopCSV = () => {
    const csvContent = 'data:text/csv;charset=utf-8,Shop Name,Owner Name,City,Area,Address,Shop Type,TerritoryId\nSample Shop,John Doe,Karachi,Clifton,Street 1,Dealer,1\n';
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Sample_Shops.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddShop = async () => {
    if (!sName || !sOwner) return toast.error('Name and Contact Person are required');
    try {
      const payload = {
        name: sName,
        ownerName: sOwner,
        contactNo: sContactNo,
        classification: sClassification,
        city: sCity,
        area: sArea,
        address: sAddress,
        type: sShopType,
        territoryId: sTerritoryId || 1
      };
      if (editShopId) {
        const res = await api.put(`/master/shops/${editShopId}`, payload);
        if (res.data.success) {
          setShops(shops.map(s => s.id === editShopId ? res.data.data : s));
          setShowShopModal(false);
          toast.success('Shop updated successfully');
        }
      } else {
        const res = await api.post('/master/shops', payload);
        if (res.data.success) {
          setShops([...shops, res.data.data]);
          setShowShopModal(false);
          toast.success('Shop added successfully');
        }
      }
    } catch (e) {
      toast.error(editShopId ? 'Failed to update shop' : 'Failed to add shop');
    }
  };

  const handleDeleteShop = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this shop?')) return;
    try {
      const res = await api.delete(`/master/shops/${id}`);
      if (res.data.success) {
        setShops(shops.filter(s => s.id !== id));
        toast.success('Shop deleted successfully');
      }
    } catch (e: any) {
      if (e.response?.data?.message) {
        toast.error(e.response.data.message);
      } else {
        toast.error('Failed to delete shop');
      }
    }
  };

  const handleAddMapping = async () => {
    if (!mBrandName || !mProductId) return toast.error('Brand and Product are required');
    try {
      const res = await api.post('/master/mappings/brands', { brandName: mBrandName, productId: parseInt(mProductId) });
      if (res.data.success) {
        const mapRes = await api.get('/master/mappings/brands');
        setMappings(mapRes.data.data);
        setShowMappingModal(false);
        setMBrandName(''); setMProductId('');
        toast.success('Mapping added');
      }
    } catch (e) {
      toast.error('Failed to add mapping');
    }
  };

  return (
    <main className="h-full flex flex-col p-6">
      <div className="flex justify-between items-end mb-6 shrink-0">
        <div>
          <h1 className="text-3xl font-bold font-['Outfit'] text-text-main">Master Data</h1>
          <p className="text-text-muted mt-1">Manage product catalogs, and dealer shops directory.</p>
        </div>
        
        {activeTab === 'products' ? (
          <div className="relative">
            <button onClick={() => setShowProductMenu(!showProductMenu)} className="glass-button px-5 py-2.5 rounded-xl font-medium shadow-sm flex items-center gap-2 bg-gradient-to-r from-slate-500 to-slate-500 hover:from-slate-400 hover:to-slate-400 text-text-main transition-all">
              <Plus className="w-5 h-5" />
              Add Product
            </button>
            {showProductMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowProductMenu(false)}></div>
                <div className="absolute right-0 mt-2 w-48 bg-panel-bg border border-panel-border rounded-xl shadow-xl z-50 overflow-hidden py-1">
                  <button onClick={() => { setShowProductMenu(false); openAddProduct(); }} className="w-full text-left px-4 py-2 hover:bg-panel-solid/10 text-text-main">
                    Single Add
                  </button>
                  <label className="block w-full text-left px-4 py-2 hover:bg-panel-solid/10 text-text-main cursor-pointer">
                    Bulk Upload
                    <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
                  </label>
                </div>
              </>
            )}
          </div>
        ) : activeTab === 'shops' ? (
          <div className="relative">
            <button onClick={() => setShowShopMenu(!showShopMenu)} className="glass-button px-5 py-2.5 rounded-xl font-medium shadow-sm flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add Shop
            </button>
            {showShopMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowShopMenu(false)}></div>
                <div className="absolute right-0 mt-2 w-56 bg-panel-bg border border-panel-border rounded-xl shadow-xl z-50 overflow-hidden py-1">
                  <button onClick={() => { setShowShopMenu(false); openAddShop(); }} className="w-full text-left px-4 py-2 hover:bg-panel-solid/10 text-text-main">
                    Single Add
                  </button>
                  <label className="block w-full text-left px-4 py-2 hover:bg-panel-solid/10 text-text-main cursor-pointer">
                    Bulk Upload
                    <input type="file" accept=".csv" className="hidden" onChange={(e) => { handleShopFileUpload(e); setShowShopMenu(false); }} />
                  </label>
                  <div className="border-t border-panel-border my-1"></div>
                  <button onClick={() => { setShowShopMenu(false); downloadSampleShopCSV(); }} className="w-full text-left px-4 py-2 hover:bg-panel-solid/10 text-slate-400 text-sm">
                    Download Sample File
                  </button>
                </div>
              </>
            )}
          </div>
        ) : activeTab === 'mappings' ? (
          <div className="relative">
            <button onClick={() => setShowMappingModal(true)} className="glass-button px-5 py-2.5 rounded-xl font-medium shadow-sm flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add Mapping
            </button>
          </div>
        ) : null}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 glass-panel w-max rounded-xl mb-6 shrink-0 border border-panel-border">
        <button 
          onClick={() => setActiveTab('products')}
          className={`px-6 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${activeTab === 'products' ? 'bg-slate-500/20 text-slate-400  border border-slate-500/30' : 'text-text-muted hover:text-text-sub border border-transparent'}`}
        >
          Product Catalog
        </button>
        <button 
          onClick={() => setActiveTab('shops')}
          className={`px-6 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${activeTab === 'shops' ? 'bg-slate-500/20 text-slate-400  border border-slate-500/30' : 'text-text-muted hover:text-text-sub border border-transparent'}`}
        >
          Shops Directory
        </button>
        <button 
          onClick={() => setActiveTab('mappings')}
          className={`px-6 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${activeTab === 'mappings' ? 'bg-slate-500/20 text-slate-400  border border-slate-500/30' : 'text-text-muted hover:text-text-sub border border-transparent'}`}
        >
          Product Mappings
        </button>
      </div>

      {/* Tab Content */}
      <div className="glass-panel rounded-2xl flex-1 overflow-hidden flex flex-col">
        
        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="overflow-y-auto">
            <table className="w-full text-left border-collapse glass-table">
              <thead className="sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Product ID</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Brand</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Model</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Current Price</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {products.length === 0 && (
                  <tr><td colSpan={8} className="px-6 py-12 text-center text-text-muted">No products found.</td></tr>
                )}
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-panel-bg transition-colors group">
                    <td className="px-6 py-4 font-medium text-text-muted">PRD-{p.id}</td>
                    <td className="px-6 py-4 font-bold text-text-main">{p.name}</td>
                    <td className="px-6 py-4 text-slate-400">{p.category}</td>
                    <td className="px-6 py-4 text-text-sub">{p.brand || '-'}</td>
                    <td className="px-6 py-4 text-text-sub">{p.model || '-'}</td>
                    <td className="px-6 py-4 text-slate-300 font-medium">Rs. {p.price.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      {p.isActive ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-success-bg text-success-text border border-success-border">Active</span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-text-muted/10 text-text-muted border border-panel-border">Inactive</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right opacity-100 ">
                      <button onClick={() => openEditProduct(p)} className="p-2 bg-panel-solid text-text-sub rounded-lg hover:bg-panel-border border border-panel-border" title="Edit Product">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Shops Tab */}
        {activeTab === 'shops' && (
          <div className="overflow-y-auto">
            <table className="w-full text-left border-collapse glass-table">
              <thead className="sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Shop ID</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Store Name</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Owner</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">City</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Area</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Address</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Territory</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {shops.length === 0 && (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-text-muted">No shops found.</td></tr>
                )}
                {shops.map(s => (
                  <tr key={s.id} className="hover:bg-panel-bg transition-colors group">
                    <td className="px-6 py-4 font-medium text-text-muted">SH-{s.id}</td>
                    <td className="px-6 py-4 font-bold text-text-main">{s.name}</td>
                    <td className="px-6 py-4 text-text-sub">{s.ownerName}</td>
                    <td className="px-6 py-4 text-text-sub">{s.city || '-'}</td>
                    <td className="px-6 py-4 text-text-sub">{s.area || '-'}</td>
                    <td className="px-6 py-4 text-text-sub truncate max-w-[200px]" title={s.address}>{s.address || '-'}</td>
                    <td className="px-6 py-4"><span className="px-2.5 py-1 bg-slate-500/10 text-slate-400 border border-slate-500/20 rounded-full font-medium text-xs">{s.territoryId}</span></td>
                    <td className="px-6 py-4 text-right opacity-100 ">
                       <div className="flex items-center justify-end gap-2">
                         <button onClick={() => openEditShop(s)} className="p-2 bg-panel-solid text-text-sub rounded-lg hover:bg-panel-border border border-panel-border" title="Edit Shop">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                        </button>
                        <button onClick={() => handleDeleteShop(s.id)} className="p-2 bg-panel-solid text-danger-text rounded-lg hover:bg-danger-bg hover:border-danger-border border border-panel-border transition-colors" title="Delete Shop">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Mappings Tab */}
        {activeTab === 'mappings' && (
          <div className="overflow-y-auto">
            <table className="w-full text-left border-collapse glass-table">
              <thead className="sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Brand Name</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Mapped Products</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {mappings.length === 0 && (
                  <tr><td colSpan={2} className="px-6 py-12 text-center text-text-muted">No mappings found.</td></tr>
                )}
                {mappings.map((m, i) => (
                  <tr key={i} className="hover:bg-panel-bg transition-colors group">
                    <td className="px-6 py-4 font-bold text-text-main">{m.name}</td>
                    <td className="px-6 py-4 text-text-sub">
                      <div className="flex flex-wrap gap-2">
                        {m.mappings?.map((p: any) => (
                          <span key={p.productId} className="px-2 py-1 bg-panel-solid/50 border border-panel-border rounded-md text-xs">{p.productName}</span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-panel-bg backdrop-blur-md flex items-center justify-center z-50">
          <div className="glass-panel rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden transform transition-all border border-panel-border">
            <div className="p-6 border-b border-panel-border bg-panel-bg flex justify-between items-center shrink-0">
              <h3 className="font-bold font-['Outfit'] text-xl text-text-main">{editProductId ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={() => setShowProductModal(false)} className="text-text-muted hover:text-text-main transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <div className="p-6 space-y-5 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-text-sub mb-2">Product Name</label>
                <input value={pName} onChange={e=>setPName(e.target.value)} type="text" className="w-full px-4 py-3 glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500/50" placeholder="e.g. Fiber 200Mbps" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-sub mb-2">Category</label>
                  <select value={pCategory} onChange={e => { setPCategory(e.target.value); setPBrand(''); setPModel(''); }} className="w-full px-4 py-3 glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500/50 appearance-none text-text-sub">
                    <option value="">Select Category</option>
                    {uniqueCategories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-sub mb-2">Brand</label>
                  <select value={pBrand} onChange={e => { setPBrand(e.target.value); setPModel(''); }} className="w-full px-4 py-3 glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500/50 appearance-none text-text-sub">
                    <option value="">Select Brand</option>
                    {getUniqueBrands(pCategory).map((b: string) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-sub mb-2">Model</label>
                  <select value={pModel} onChange={e => setPModel(e.target.value)} className="w-full px-4 py-3 glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500/50 appearance-none text-text-sub">
                    <option value="">Select Model</option>
                    {Array.from(new Set(products.filter(p => p.brand?.toLowerCase() === pBrand.toLowerCase()).map(p => p.model).filter(Boolean))).map((m: any) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-sub mb-2">Warranty</label>
                  <input value={pWarranty} onChange={e=>setPWarranty(e.target.value)} type="text" className="w-full px-4 py-3 glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500/50" placeholder="e.g. 1 Year" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-sub mb-2">Price (Rs)</label>
                <input value={pPrice} onChange={e=>setPPrice(e.target.value)} type="number" step="0.01" className="w-full px-4 py-3 glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500/50" placeholder="0" />
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-panel-border shrink-0">
                <button onClick={() => setShowProductModal(false)} className="px-5 py-2.5 bg-panel-solid text-text-sub rounded-xl font-medium hover:bg-panel-border transition-colors border border-panel-border">Cancel</button>
                <button onClick={handleAddProduct} className="px-5 py-2.5 glass-button rounded-xl font-medium">{editProductId ? 'Update Product' : 'Save Product'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Shop Modal */}
      {showShopModal && (
        <div className="fixed inset-0 bg-panel-bg backdrop-blur-md flex items-center justify-center z-50">
          <div className="glass-panel rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden transform transition-all border border-panel-border">
            <div className="p-6 border-b border-panel-border bg-panel-bg flex justify-between items-center shrink-0">
              <h3 className="font-bold font-['Outfit'] text-xl text-text-main">{editShopId ? 'Edit Shop' : 'Add New Shop'}</h3>
              <button onClick={() => setShowShopModal(false)} className="text-text-muted hover:text-text-main transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <div className="p-6 space-y-5 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-text-sub mb-2">Shop Name</label>
                <input value={sName} onChange={e=>setSName(e.target.value)} type="text" className="w-full px-4 py-3 glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500/50" placeholder="e.g. Al-Fatah Electronics" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-sub mb-2">Contact Person Name</label>
                <input value={sOwner} onChange={e=>setSOwner(e.target.value)} type="text" className="w-full px-4 py-3 glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500/50" placeholder="e.g. Asad Jamil" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-sub mb-2">Contact Phone Number</label>
                <input value={sContactNo} onChange={e=>setSContactNo(e.target.value)} type="text" className="w-full px-4 py-3 glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500/50" placeholder="e.g. 0300-1234567" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-sub mb-2">Classification</label>
                <select value={sClassification} onChange={e=>setSClassification(e.target.value)} className="w-full px-4 py-3 glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500/50 appearance-none text-text-sub">
                  <option value="Large">Large</option>
                  <option value="Medium">Medium</option>
                  <option value="Small">Small</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-sub mb-2">Region</label>
                <select value={sRegion} onChange={e=>setSRegion(e.target.value)} className="w-full px-4 py-3 glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500/50 appearance-none text-text-sub">
                  <option value="">Select Region</option>
                  {regions.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-sub mb-2">City</label>
                <select value={sCity} onChange={e=>setSCity(e.target.value)} className="w-full px-4 py-3 glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500/50 appearance-none text-text-sub">
                  <option value="">Select City</option>
                  {cities.filter(c => c.regionId?.toString() === sRegion.toString()).map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-sub mb-2">Territory</label>
                <select value={sTerritoryId} onChange={e=>setSTerritoryId(e.target.value)} className="w-full px-4 py-3 glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500/50 appearance-none text-text-sub">
                  <option value="">Select Territory</option>
                  {territories.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-sub mb-2">Area</label>
                  <input value={sArea} onChange={e=>setSArea(e.target.value)} type="text" className="w-full px-4 py-3 glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500/50" placeholder="e.g. Clifton" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-sub mb-2">Address</label>
                  <input value={sAddress} onChange={e=>setSAddress(e.target.value)} type="text" className="w-full px-4 py-3 glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500/50" placeholder="e.g. Street 1, ABC Road" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-sub mb-2">Shop Type</label>
                <select value={sShopType} onChange={e=>setSShopType(e.target.value)} className="w-full px-4 py-3 glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500/50 appearance-none text-text-sub">
                  <option>Importer</option>
                  <option>Distributor</option>
                  <option>Dealer</option>
                  <option>Wholesaler</option>
                  <option>Retailer</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-panel-border shrink-0">
                <button onClick={() => setShowShopModal(false)} className="px-5 py-2.5 bg-panel-solid text-text-sub rounded-xl font-medium hover:bg-panel-border transition-colors border border-panel-border">Cancel</button>
                <button onClick={handleAddShop} className="px-5 py-2.5 glass-button rounded-xl font-medium">{editShopId ? 'Update Shop' : 'Save Shop'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Mapping Modal */}
      {showMappingModal && (
        <div className="fixed inset-0 bg-panel-bg backdrop-blur-md flex items-center justify-center z-50">
          <div className="glass-panel rounded-3xl shadow-2xl w-full max-w-sm flex flex-col overflow-hidden transform transition-all border border-panel-border">
            <div className="p-6 border-b border-panel-border bg-panel-bg flex justify-between items-center shrink-0">
              <h3 className="font-bold font-['Outfit'] text-xl text-text-main">Add Product Mapping</h3>
              <button onClick={() => setShowMappingModal(false)} className="text-text-muted hover:text-text-main transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <div className="p-6 space-y-5 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-text-sub mb-2">Brand Name</label>
                <select value={mBrandName} onChange={e => { setMBrandName(e.target.value); setMProductId(''); }} className="w-full px-4 py-3 glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500/50 appearance-none text-text-sub">
                  <option value="">Select Brand</option>
                  {getUniqueBrands().map((b: string) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-sub mb-2">Product</label>
                <select value={mProductId} onChange={e=>setMProductId(e.target.value)} className="w-full px-4 py-3 glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500/50 appearance-none text-text-sub">
                  <option value="">Select a Product</option>
                  {products.filter(p => mBrandName ? p.brand?.toLowerCase() === mBrandName.toLowerCase() : true).map(p => (
                    <option key={p.id} value={p.id}>{p.name} {p.model ? `(${p.model})` : ''}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-panel-border shrink-0">
                <button onClick={() => setShowMappingModal(false)} className="px-5 py-2.5 bg-panel-solid text-text-sub rounded-xl font-medium hover:bg-panel-border transition-colors border border-panel-border">Cancel</button>
                <button onClick={handleAddMapping} className="px-5 py-2.5 glass-button rounded-xl font-medium">Save Mapping</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default MasterData;
