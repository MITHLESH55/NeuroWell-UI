import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Target, Brain, Users, Bell, LogOut } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Goals', path: '/goals', icon: Target },
    { name: 'Insights', path: '/insights', icon: Brain },
    { name: 'Community', path: '/community', icon: Users },
    { name: 'Alerts', path: '/alerts', icon: Bell },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col justify-between hidden md:flex">
      <div>
        <div className="h-20 flex items-center px-8 border-b border-gray-50">
          <Link to="/" className="text-2xl font-bold tracking-tighter">
            <span className="text-primary">Neuro</span>Well
          </Link>
        </div>
        <nav className="p-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                  isActive 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-primary' : 'text-gray-400'} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      
      <div className="p-4 border-t border-gray-50">
        <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all w-full font-medium">
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
