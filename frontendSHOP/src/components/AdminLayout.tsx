import React, { useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import logo from '@/assets/logo.jpeg';
import { attachAdminManifest, registerAdminServiceWorker } from '@/lib/pwa';

const adminNavItems = [
  { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { path: '/admin/products', icon: Package, label: 'Produits' },
  { path: '/admin/orders', icon: ShoppingBag, label: 'Commandes' },
];

const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      navigate('/login');
    }
  }, [isAuthenticated, isAdmin, isLoading, navigate]);

  // PWA : le manifeste et le service worker ne concernent que l'espace admin
  useEffect(() => {
    if (!isAdmin) return;
    const detach = attachAdminManifest();
    registerAdminServiceWorker();
    return detach;
  }, [isAdmin]);

  if (!isAdmin) {
    return null;
  }

  const isActive = (path: string, exact = false) =>
    exact ? location.pathname === path : location.pathname.startsWith(path);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar (écran large uniquement) */}
      <aside className="hidden lg:flex w-64 flex-shrink-0 sticky top-0 h-screen flex-col bg-sidebar border-r border-sidebar-border">
        <div className="p-6 border-b border-sidebar-border">
          <Link to="/admin" className="flex items-center gap-2">
            <img src={logo} alt="Brands City" className="h-10" />
            <span className="font-display text-xl text-sidebar-foreground">Admin</span>
          </Link>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {adminNavItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive(item.path, item.exact)
                      ? 'bg-sidebar-accent text-sidebar-primary'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <Link to="/">
            <Button variant="outline" className="w-full gap-2">
              <ArrowLeft className="h-4 w-4" />
              Retour au site
            </Button>
          </Link>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* En-tête mobile */}
        <header className="lg:hidden sticky top-0 z-30 bg-card/95 backdrop-blur border-b border-border px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] flex items-center justify-between">
          <Link to="/admin" className="flex items-center gap-2">
            <img src={logo} alt="Brands City" className="h-8" />
            <span className="font-display text-lg text-foreground">Admin</span>
          </Link>
          <Link
            to="/"
            className="flex items-center gap-1.5 h-10 px-3 rounded-lg text-sm text-muted-foreground hover:bg-secondary/50"
          >
            <ArrowLeft className="h-4 w-4" />
            Site
          </Link>
        </header>

        {/* Contenu : marge basse pour ne pas passer sous la barre d'onglets */}
        <main className="flex-1 p-4 pb-28 lg:p-8 lg:pb-8">
          <Outlet />
        </main>
      </div>

      {/* Barre d'onglets mobile : navigation au pouce */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-card/95 backdrop-blur border-t border-border pb-[env(safe-area-inset-bottom)]">
        <ul className="grid grid-cols-3">
          {adminNavItems.map((item) => {
            const active = isActive(item.path, item.exact);
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  aria-current={active ? 'page' : undefined}
                  className={`flex flex-col items-center justify-center gap-1 h-16 text-xs font-medium transition-colors ${
                    active ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  <item.icon className={`h-6 w-6 ${active ? 'stroke-[2.5]' : ''}`} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default AdminLayout;
