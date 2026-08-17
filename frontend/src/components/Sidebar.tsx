import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, FileSpreadsheet, Store, PieChart, Shield, Map, Box, TrendingUp, Tags, ClipboardList, Settings, Bell, LifeBuoy, BarChart2 } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const path = location.pathname;

  const NavItem = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => {
    const isActive = path === to;
    return (
      <Link 
        to={to} 
        className={`flex items-center gap-3 px-4 py-2.5 rounded-md font-medium transition-colors duration-200 ${
          isActive 
            ? 'bg-slate-100 text-slate-900 shadow-sm border border-slate-200' 
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
        }`}
      >
        <Icon className={`w-5 h-5 ${isActive ? 'text-slate-900' : 'text-slate-500'}`} />
        <span className="text-sm">{label}</span>
      </Link>
    );
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-full z-20 overflow-hidden">
      <div className="p-5 flex items-center gap-3 border-b border-slate-200">
        <div className="w-8 h-8 rounded bg-slate-900 flex items-center justify-center shadow-sm">
          <span className="font-bold text-white text-sm">AT</span>
        </div>
        <h1 className="font-bold text-lg tracking-tight text-slate-900">Advance Telecom</h1>
      </div>
      
      <div className="px-4 py-6 overflow-y-auto flex-1">
        <p className="text-xs text-slate-400 uppercase font-bold mb-3 tracking-wider ml-1">Main Menu</p>
        <nav className="flex flex-col gap-1">
          <NavItem to="/dashboard" icon={LayoutDashboard} label="Operations Dashboard" />
          <NavItem to="/management-dashboard" icon={PieChart} label="Executive Dashboard" />
          <NavItem to="/tso-management" icon={Users} label="TSO Management" />
          <NavItem to="/surveys" icon={FileSpreadsheet} label="Surveys" />
          <NavItem to="/shops" icon={Store} label="Shops / Inventory" />
          <NavItem to="/reports" icon={PieChart} label="Reports" />
          <NavItem to="/comparison-reports" icon={BarChart2} label="Comparison Engine" />
        </nav>

        <p className="text-xs text-slate-400 uppercase font-bold mb-3 mt-8 tracking-wider ml-1">Administration</p>
        <nav className="flex flex-col gap-1">
          <NavItem to="/roles" icon={Shield} label="Roles & Permissions" />
          <NavItem to="/regions-cities" icon={Map} label="Regions & Cities" />
          <NavItem to="/territories" icon={Map} label="Territories" />
          {/* <NavItem to="/competitors" icon={Box} label="Competitor Brands" />
          <NavItem to="/pricing" icon={TrendingUp} label="Pricing History" />
          <NavItem to="/audit-logs" icon={ClipboardList} label="Audit Logs" /> */}
          <NavItem to="/settings" icon={Settings} label="System Settings" />
          <NavItem to="/notifications" icon={Bell} label="Notification Hub" />
          <NavItem to="/support" icon={LifeBuoy} label="Support Tickets" />
        </nav>
      </div>
      
      <div className="mt-auto p-4 border-t border-slate-200 bg-slate-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full border border-slate-300 overflow-hidden">
            <img src="https://ui-avatars.com/api/?name=Admin+User&background=334155&color=fff" alt="Admin" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900 leading-tight">System Admin</p>
            <p className="text-xs text-slate-500">admin@advancetelecom.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
