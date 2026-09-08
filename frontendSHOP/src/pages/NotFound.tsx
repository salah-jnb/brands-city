import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Oops! Page non trouvée</p>
        <Link to="/" className="inline-flex items-center gap-2 text-primary underline hover:text-primary/90">
          <ArrowLeft className="h-4 w-4" />
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
