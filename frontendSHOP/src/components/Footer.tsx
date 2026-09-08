import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, MapPin, Phone } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="font-display text-2xl text-foreground">Brands City</h3>
            <p className="text-muted-foreground text-sm">
              Votre destination premium pour les sneakers les plus tendances. 
              Authenticité garantie sur toutes nos paires.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Navigation</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Accueil
                </Link>
              </li>
              <li>
                <Link to="/?brand=Nike" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Nike
                </Link>
              </li>
              <li>
                <Link to="/?brand=Adidas" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Adidas
                </Link>
              </li>
              <li>
                <Link to="/?brand=Puma" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Puma
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Service Client</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/orders" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Suivi de commande
                </Link>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Retours & Échanges
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Guide des tailles
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-muted-foreground text-sm">
                <MapPin className="h-4 w-4 text-primary" />
                123 Rue du Commerce, Paris
              </li>
              <li className="flex items-center gap-2 text-muted-foreground text-sm">
                <Phone className="h-4 w-4 text-primary" />
                +33 1 23 45 67 89
              </li>
              <li className="flex items-center gap-2 text-muted-foreground text-sm">
                <Mail className="h-4 w-4 text-primary" />
                contact@brandscity.fr
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-sm">
            © 2024 Brands City. Tous droits réservés.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
              Mentions légales
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
              CGV
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
              Confidentialité
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
