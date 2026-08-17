import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Bell, LogOut, Sun, Moon } from 'lucide-react';

const Header = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-50 shrink-0 shadow-sm">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Overview</h2>
        <p className="text-xs text-slate-500 mt-0.5">Monitor network surveys and operations</p>
      </div>
      
      <div className="flex items-center gap-5">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search surveys, TSOs..." 
            className="w-64 pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 transition-shadow"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2" />
        </div>
        
        {/* Theme Toggle */}
        <button
          onClick={() => setIsDark(!isDark)}
          className="p-1.5 text-slate-500 hover:text-slate-900 transition-colors rounded-md hover:bg-slate-100 focus:outline-none"
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-1.5 text-slate-500 hover:text-slate-900 transition-colors rounded-md hover:bg-slate-100 focus:outline-none"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-md shadow-lg overflow-hidden z-50">
              <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="font-medium text-slate-900 text-sm">Notifications</h3>
                <button className="text-xs text-slate-500 hover:text-slate-900">Mark all read</button>
              </div>
              <div className="max-h-64 overflow-y-auto">
                <div className="p-3 border-b border-slate-50 hover:bg-slate-50 transition-colors flex gap-3 cursor-pointer">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 shrink-0 border border-slate-200">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  <div>
                    <p className="text-sm text-slate-900 font-medium">TSO Ali synced 5 surveys</p>
                    <p className="text-xs text-slate-500 mt-0.5">2 mins ago</p>
                  </div>
                </div>
                <div className="p-3 border-b border-slate-50 hover:bg-slate-50 transition-colors flex gap-3 cursor-pointer">
                  <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-600 shrink-0 border border-red-100">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                  </div>
                  <div>
                    <p className="text-sm text-slate-900 font-medium">Site 14B reported offline</p>
                    <p className="text-xs text-slate-500 mt-0.5">15 mins ago</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Demo Button for Session Modal */}
        <button 
          onClick={() => setShowSessionModal(true)}
          className="text-xs text-slate-500 hover:text-slate-900 border border-slate-200 bg-white px-2.5 py-1 rounded transition-colors shadow-sm hover:bg-slate-50"
        >
          Test Timeout
        </button>

      </div>

      {/* Session Timeout Modal */}
      {showSessionModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-lg shadow-xl overflow-hidden transform transition-all border border-slate-200">
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-red-50 border border-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogOut className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Session Expiring</h3>
              <p className="text-slate-500 text-sm mb-6">Your session will expire in 2 minutes due to inactivity. Do you want to stay signed in?</p>
              
              <div className="flex gap-3">
                <Link to="/" className="flex-1">
                  <button className="w-full px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-md text-sm font-medium transition-colors">
                    Log Out
                  </button>
                </Link>
                <button 
                  onClick={() => setShowSessionModal(false)}
                  className="flex-1 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-sm font-medium transition-colors"
                >
                  Stay Signed In
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </header>
  );
};

export default Header;
