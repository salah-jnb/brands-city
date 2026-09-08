import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import logo from '@/assets/logo.jpeg';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const from = (location.state as { from?: string })?.from || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    const result = await login(email, password);

    if (result.success) {
      toast.success('Connexion réussie !');
      navigate(from, { replace: true });
    } else {
      setError(result.error || 'Erreur de connexion');
      toast.error(result.error || 'Erreur de connexion');
    }
  };

  // Demo login for testing without backend
  const handleDemoLogin = () => {
    localStorage.setItem('token', 'demo-token');
    localStorage.setItem('user', JSON.stringify({ id: '1', email: 'demo@brandscity.fr', role: 'user' }));
    toast.success('Connexion démo réussie !');
    window.location.href = from;
  };

  const handleDemoAdminLogin = () => {
    localStorage.setItem('token', 'demo-admin-token');
    localStorage.setItem('user', JSON.stringify({ id: '0', email: 'admin@brandscity.fr', role: 'admin' }));
    toast.success('Connexion admin démo réussie !');
    window.location.href = '/admin';
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="py-6 px-4">
        <Link to="/" className="inline-block">
          <img src={logo} alt="Brands City" className="h-12" />
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
            <div className="text-center mb-8">
              <h1 className="font-display text-3xl text-foreground">Connexion</h1>
              <p className="text-muted-foreground mt-2">
                Connectez-vous à votre compte Brands City
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full btn-glow gap-2" disabled={isLoading}>
                {isLoading ? 'Connexion...' : 'Se connecter'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            {/* Demo buttons */}
            <div className="mt-6 pt-6 border-t border-border space-y-3">
              <p className="text-xs text-center text-muted-foreground mb-3">
                Mode démo (sans backend)
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" size="sm" onClick={handleDemoLogin}>
                  Client démo
                </Button>
                <Button variant="outline" size="sm" onClick={handleDemoAdminLogin}>
                  Admin démo
                </Button>
              </div>
            </div>

            <p className="text-center text-muted-foreground text-sm mt-6">
              Pas encore de compte ?{' '}
              <Link to="/register" className="text-primary hover:underline">
                Créer un compte
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
