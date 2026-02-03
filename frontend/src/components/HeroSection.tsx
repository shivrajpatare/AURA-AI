import { Camera, MapPin, TrendingUp, Shield, CheckCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface HeroSectionProps {
  onStartReport: () => void;
}

export const HeroSection = ({ onStartReport }: HeroSectionProps) => {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
      
      {/* Decorative Elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
      
      <div className="container relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-fade-in-up">
            <Badge variant="ai" className="w-fit">
              <Sparkles className="w-3 h-3 mr-1" />
              AI-Powered Civic Platform
            </Badge>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-balance">
              Keep Your City Clean & Beautiful
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-lg text-balance">
              Report street waste with a single photo. Our AI instantly analyzes and routes your report to the right city officials for swift action.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="xl" onClick={onStartReport}>
                <Camera className="w-5 h-5" />
                Snap & Report
              </Button>
              <Button variant="outline" size="xl">
                <MapPin className="w-5 h-5" />
                View Reports Map
              </Button>
            </div>
            
            {/* Trust Indicators */}
            <div className="flex flex-wrap gap-6 pt-4">
              <TrustIndicator icon={CheckCircle} label="5,000+ Reports Resolved" />
              <TrustIndicator icon={TrendingUp} label="98% Resolution Rate" />
              <TrustIndicator icon={Shield} label="Privacy Protected" />
            </div>
          </div>
          
          {/* Right Content - Phone Mockup */}
          <div className="relative lg:flex justify-center hidden">
            <PhoneMockup />
          </div>
        </div>
      </div>
    </section>
  );
};

const TrustIndicator = ({ icon: Icon, label }: { icon: React.ElementType; label: string }) => (
  <div className="flex items-center gap-2 text-muted-foreground">
    <Icon className="w-5 h-5 text-success" />
    <span className="text-sm font-medium">{label}</span>
  </div>
);

const PhoneMockup = () => (
  <div className="relative">
    {/* Glow Effect */}
    <div className="absolute inset-0 bg-primary/20 rounded-[3rem] blur-2xl scale-90" />
    
    {/* Phone Frame */}
    <div className="relative bg-foreground rounded-[2.5rem] p-2 shadow-2xl">
      <div className="bg-card rounded-[2rem] overflow-hidden w-72 h-[580px]">
        {/* Status Bar */}
        <div className="bg-foreground/5 px-6 py-3 flex justify-between items-center">
          <span className="text-xs font-medium">9:41</span>
          <div className="flex gap-1">
            <div className="w-4 h-2 bg-foreground/60 rounded-sm" />
            <div className="w-4 h-2 bg-foreground/40 rounded-sm" />
            <div className="w-6 h-3 bg-success rounded-sm" />
          </div>
        </div>
        
        {/* App Content Preview */}
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Good morning</p>
              <p className="font-semibold">Report Issues</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Camera className="w-5 h-5 text-primary" />
            </div>
          </div>
          
          {/* Camera Preview Area */}
          <div className="relative bg-muted rounded-2xl h-48 overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center ai-pulse">
                  <Camera className="w-8 h-8 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">Tap to capture</p>
              </div>
            </div>
            {/* AI Scan Line */}
            <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent animate-scan-line" />
          </div>
          
          {/* Recent Reports */}
          <div className="space-y-3">
            <p className="text-sm font-medium">Recent Reports</p>
            <MiniReportCard status="resolved" location="MG Road" time="2h ago" />
            <MiniReportCard status="progress" location="Koramangala" time="5h ago" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

const MiniReportCard = ({ status, location, time }: { status: string; location: string; time: string }) => (
  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
    <div className={`w-2 h-2 rounded-full ${status === 'resolved' ? 'bg-success' : 'bg-secondary'}`} />
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium truncate">{location}</p>
      <p className="text-xs text-muted-foreground">{time}</p>
    </div>
    <Badge variant={status as "resolved" | "progress"} className="text-[10px] px-2 py-0.5">
      {status === 'resolved' ? 'Resolved' : 'In Progress'}
    </Badge>
  </div>
);

export default HeroSection;
