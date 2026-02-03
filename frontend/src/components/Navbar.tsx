import { Leaf, Menu, X, User, LayoutDashboard, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface NavbarProps {
  onTrackReports: () => void;
  onAdminDashboard: () => void;
  onMapView: () => void;
}

export const Navbar = ({ onTrackReports, onAdminDashboard, onMapView }: NavbarProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center">
              <Leaf className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <span className="font-bold text-lg">CleanStreets</span>
              <span className="text-primary font-semibold">AI</span>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              How It Works
            </a>
            <a href="#impact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Our Impact
            </a>

            <Button variant="ghost" size="sm" onClick={onTrackReports}>
              <User className="w-4 h-4" />
              My Reports
            </Button>
            <Button variant="outline" size="sm" onClick={onAdminDashboard}>
              <LayoutDashboard className="w-4 h-4" />
              Admin
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Nav */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-2 border-t border-border animate-fade-in">
            <a href="#features" className="block px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
              How It Works
            </a>
            <a href="#impact" className="block px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
              Our Impact
            </a>

            <Button variant="ghost" className="w-full justify-start" onClick={() => { onTrackReports(); setIsOpen(false); }}>
              <User className="w-4 h-4" />
              My Reports
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => { onAdminDashboard(); setIsOpen(false); }}>
              <LayoutDashboard className="w-4 h-4" />
              Admin Dashboard
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
