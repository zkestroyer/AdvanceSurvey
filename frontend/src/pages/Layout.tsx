import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const Layout = () => {
  return (
    <div className="flex h-screen bg-transparent p-4 gap-4">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden gap-4">
        <Header />
        <div className="flex-1 overflow-y-auto glass-panel rounded-2xl p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
