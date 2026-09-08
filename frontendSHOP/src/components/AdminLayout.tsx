import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  ArrowLeft,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import logo from '@/assets/logo.jpeg';
import { useState, useEffect } from 'react';

const adminNavItems = [
  { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { path: '/admin/products', icon: Package, label: 'Produits' },
  { path: '/admin/orders', icon: ShoppingBag, label: 'Commandes' },
];

const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin, isAuthenticated } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate('/login');
    }
  }, [isAuthenticated, isAdmin, navigate]);

  if (!isAdmin) {
    return null;
  }

  const isActive = (path: string, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-sidebar-border">
            <Link to="/admin" className="flex items-center gap-2">
              <img src={logo} alt="Brands City" className="h-10" />
              <span className="font-display text-xl text-sidebar-foreground">Admin</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {adminNavItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                      ${
                        isActive(item.path, item.exact)
                          ? 'bg-sidebar-accent text-sidebar-primary'
                          : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                      }
                    `}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Back to Store */}
          <div className="p-4 border-t border-sidebar-border">
            <Link to="/">
              <Button variant="outline" className="w-full gap-2">
                <ArrowLeft className="h-4 w-4" />
                Retour au site
              </Button>
            </Link>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-30 bg-card border-b border-border p-4 flex items-center justify-between">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-secondary/50 rounded-lg"
          >
            {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <img src={logo} alt="Brands City" className="h-8" />
          <div className="w-10" /> {/* Spacer */}
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
