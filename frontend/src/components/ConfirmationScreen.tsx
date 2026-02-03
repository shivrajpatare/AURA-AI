import { CheckCircle, MapPin, Clock, Share2, Home, FileText, Bell, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConfirmationScreenProps {
  onGoHome: () => void;
  onTrackReport: () => void;
}

export const ConfirmationScreen = ({ onGoHome, onTrackReport }: ConfirmationScreenProps) => {
  const reportId = "AUR-2024-00847";

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 
                    bg-gradient-to-b from-background via-primary/5 to-secondary/10 overflow-hidden">
      {/* Ambient background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-success/10 rounded-full blur-3xl animate-drift" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-drift" style={{ animationDelay: "-3s" }} />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-secondary/10 rounded-full blur-3xl animate-drift" style={{ animationDelay: "-6s" }} />
      </div>

      {/* Success Animation */}
      <div className="relative mb-10 animate-fade-in">
        {/* Outer glow rings */}
        <div className="absolute inset-0 w-32 h-32 rounded-full bg-gradient-to-br from-success/30 to-primary/20 blur-2xl animate-pulse-glow" />
        <div className="absolute -inset-4 rounded-full border border-success/20 animate-breath" style={{ animationDuration: "3s" }} />
        <div className="absolute -inset-8 rounded-full border border-success/10 animate-breath" style={{ animationDuration: "4s", animationDelay: "0.5s" }} />
        
        {/* Main success orb */}
        <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-success/80 to-primary/60 flex items-center justify-center shadow-2xl shadow-success/30 animate-breath">
          <CheckCircle className="w-16 h-16 text-white" />
        </div>
      </div>

      {/* Success Message */}
      <div className="text-center space-y-4 mb-10 animate-fade-in" style={{ animationDelay: "0.3s" }}>
        <h1 className="text-3xl font-light tracking-wide text-foreground/90">
          Ripple Sent
        </h1>
        <p className="text-foreground/50 max-w-sm font-light leading-relaxed">
          Your observation has entered the city's flow. The Keepers have been notified and restoration begins soon.
        </p>
      </div>

      {/* Report Card */}
      <div className="w-full max-w-sm glass-panel p-6 rounded-3xl space-y-5 mb-10 animate-fade-in" style={{ animationDelay: "0.5s" }}>
        <div className="flex items-center justify-between">
          <span className="text-sm text-foreground/50 font-light">Flow ID</span>
          <span className="px-4 py-2 rounded-full glass-card font-mono text-sm text-foreground/70">{reportId}</span>
        </div>
        
        <div className="h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
        
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-primary/70" />
            </div>
            <span className="text-sm text-foreground/70 font-light">FC Road, Ward 14, Pune</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-primary/70" />
            </div>
            <span className="text-sm text-foreground/70 font-light">Expected restoration: 24-48 hours</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-primary/70" />
            </div>
            <span className="text-sm text-foreground/70 font-light">You'll sense updates as they flow</span>
          </div>
        </div>
        
        <div className="h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-warning/10 border border-warning/20">
            <div className="w-2 h-2 rounded-full bg-warning animate-pulse" />
            <span className="text-sm text-warning font-light">Awaiting Flow</span>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-full glass-card hover:bg-white/10 transition-all duration-300">
            <Share2 className="w-4 h-4 text-foreground/50" />
            <span className="text-sm text-foreground/50 font-light">Share</span>
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="w-full max-w-sm space-y-4 animate-fade-in" style={{ animationDelay: "0.7s" }}>
        <button
          onClick={onTrackReport}
          className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary/80 to-secondary/80 
                   text-white font-light flex items-center justify-center gap-3
                   hover:from-primary hover:to-secondary transition-all duration-500
                   shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30"
        >
          <FileText className="w-5 h-5" />
          Track This Ripple
        </button>
        <Button
          variant="outline"
          size="lg"
          className="w-full h-14 rounded-2xl border-white/20 bg-white/5 hover:bg-white/10 font-light"
          onClick={onGoHome}
        >
          <Home className="w-5 h-5 mr-2" />
          Return to Flow
        </Button>
      </div>

      {/* Civic Message */}
      <div className="mt-10 flex items-center gap-3 px-6 py-4 rounded-full glass-card animate-fade-in" style={{ animationDelay: "0.9s" }}>
        <Sparkles className="w-5 h-5 text-primary animate-pulse-glow" />
        <p className="text-sm text-foreground/50 font-light">
          Together, 40,000 citizens have restored 5,000+ spaces
        </p>
      </div>
    </div>
  );
};

export default ConfirmationScreen;
