import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const MainLayout = () => {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
