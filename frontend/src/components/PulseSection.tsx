import { Eye, Heart, Leaf, ArrowRight, Camera } from "lucide-react";
import { useState, useEffect, useRef } from "react";

/* Visual Cue Components */
const WitnessVisual = () => <div className="relative w-16 h-12 mx-auto mb-4 overflow-hidden rounded-lg bg-muted/50 dark:bg-muted/30 border border-border/30">
    {/* Polaroid-style street scene */}
    <div className="absolute inset-1 bg-gradient-to-b from-secondary/40 to-primary/20 rounded">
      {/* Building silhouettes */}
      <div className="absolute bottom-0 left-1 w-3 h-5 bg-foreground/20 rounded-t-sm" />
      <div className="absolute bottom-0 left-5 w-4 h-7 bg-foreground/30 rounded-t-sm" />
      <div className="absolute bottom-0 right-2 w-3 h-4 bg-foreground/20 rounded-t-sm" />
      {/* Scanning line animation */}
      <div className="absolute inset-x-0 h-0.5 bg-primary/60 animate-scan" />
    </div>
    {/* Corner accent */}
    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary/40 rounded-tl-lg" />
  </div>;
const CaptureVisual = () => {
  const [isShuttering, setIsShuttering] = useState(false);
  useEffect(() => {
    const interval = setInterval(() => {
      setIsShuttering(true);
      setTimeout(() => setIsShuttering(false), 300);
    }, 3000);
    return () => clearInterval(interval);
  }, []);
  return <div className="relative w-16 h-12 mx-auto mb-4 flex items-center justify-center">
      {/* Camera body */}
      <div className="relative w-12 h-10 bg-muted/50 dark:bg-muted/30 rounded-lg border border-border/30 flex items-center justify-center">
        {/* Lens */}
        <div className={`w-6 h-6 rounded-full bg-gradient-to-br from-primary/60 to-secondary/60 flex items-center justify-center transition-transform duration-150 ${isShuttering ? 'scale-75' : 'scale-100'}`}>
          <div className={`w-3 h-3 rounded-full bg-background/80 transition-all duration-150 ${isShuttering ? 'scale-0' : 'scale-100'}`} />
        </div>
        {/* Flash */}
        <div className={`absolute -top-1 right-1 w-2 h-1.5 rounded-full transition-all duration-100 ${isShuttering ? 'bg-white shadow-glow' : 'bg-muted-foreground/30'}`} />
      </div>
      {/* Shutter overlay */}
      <div className={`absolute inset-0 bg-white/90 rounded-lg transition-opacity duration-100 pointer-events-none ${isShuttering ? 'opacity-100' : 'opacity-0'}`} />
    </div>;
};
const ConnectVisual = () => <div className="relative w-16 h-12 mx-auto mb-4 flex items-center justify-center">
    {/* Node A */}
    <div className="absolute left-1 w-3 h-3 rounded-full bg-primary/60 animate-pulse" />
    {/* Flowing line */}
    <svg className="w-10 h-4 overflow-visible" viewBox="0 0 40 16">
      <path d="M4 8 Q20 2 36 8 Q20 14 4 8" fill="none" stroke="url(#flowGradient)" strokeWidth="2" strokeLinecap="round" className="animate-flow-path" />
      {/* Animated dots along path */}
      <circle r="2" fill="hsl(var(--primary))">
        <animateMotion dur="2s" repeatCount="indefinite">
          <mpath href="#flowPath" />
        </animateMotion>
      </circle>
      <defs>
        <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
          <stop offset="50%" stopColor="hsl(var(--secondary))" stopOpacity="0.8" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
        </linearGradient>
        <path id="flowPath" d="M4 8 Q20 2 36 8" />
      </defs>
    </svg>
    {/* Node B */}
    <div className="absolute right-1 w-3 h-3 rounded-full bg-secondary/60 animate-pulse" style={{
    animationDelay: '0.5s'
  }} />
  </div>;
const TransformVisual = () => {
  const [sliderPos, setSliderPos] = useState(30);
  useEffect(() => {
    const interval = setInterval(() => {
      setSliderPos(prev => prev === 30 ? 70 : 30);
    }, 2000);
    return () => clearInterval(interval);
  }, []);
  return <div className="relative w-16 h-12 mx-auto mb-4 rounded-lg overflow-hidden border border-border/30">
      {/* Before (dirty) */}
      <div className="absolute inset-0 bg-gradient-to-br from-muted-foreground/30 to-muted-foreground/10">
        <div className="absolute bottom-1 left-1 w-2 h-2 rounded-sm bg-muted-foreground/40" />
        <div className="absolute bottom-2 left-4 w-1.5 h-1.5 rounded-sm bg-muted-foreground/30" />
      </div>
      {/* After (clean) - clips based on slider */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 transition-all duration-700 ease-in-out" style={{
      clipPath: `inset(0 ${100 - sliderPos}% 0 0)`
    }}>
        <Leaf className="absolute bottom-1 left-2 w-3 h-3 text-primary/60" />
      </div>
      {/* Slider handle */}
      <div className="absolute top-0 bottom-0 w-0.5 bg-white shadow-md transition-all duration-700 ease-in-out" style={{
      left: `${sliderPos}%`
    }}>
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2 h-4 bg-white rounded-full shadow-md" />
      </div>
    </div>;
};
const visualComponents = [WitnessVisual, CaptureVisual, ConnectVisual, TransformVisual];
export const PulseSection = () => {
  const [visibleCards, setVisibleCards] = useState<boolean[]>([false, false, false, false]);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  useEffect(() => {
    const observers = cardsRef.current.map((card, index) => {
      if (!card) return null;
      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCards(prev => {
            const newState = [...prev];
            newState[index] = true;
            return newState;
          });
          observer.unobserve(card);
        }
      }, {
        threshold: 0.2,
        rootMargin: "0px 0px -50px 0px"
      });
      observer.observe(card);
      return observer;
    });
    return () => {
      observers.forEach(observer => observer?.disconnect());
    };
  }, []);
  const journey = [{
    icon: Eye,
    step: "01",
    title: "Witness",
    subtitle: "See what others overlook",
    description: "That overflowing bin. The faded park bench. The forgotten corner where weeds meet litter. You notice what the city has forgotten.",
    impact: "Every observation is an act of care"
  }, {
    icon: Camera,
    step: "02",
    title: "Capture",
    subtitle: "One photo, infinite data",
    description: "Aura's AI instantly decodes the scene—material types, environmental risk, optimal cleanup approach. What takes humans hours, happens in seconds.",
    impact: "AI-powered precision routing"
  }, {
    icon: Heart,
    step: "03",
    title: "Connect",
    subtitle: "Your voice reaches the right ears",
    description: "No bureaucratic maze. No lost reports. Your observation flows directly to local Keepers who are equipped, trained, and ready to act.",
    impact: "Direct line to action"
  }, {
    icon: Leaf,
    step: "04",
    title: "Transform",
    subtitle: "Watch your impact bloom",
    description: "Track resolution in real-time. See the before and after. Celebrate with your community as spaces are restored to their natural beauty.",
    impact: "Visible, measurable change"
  }];
  return <section id="pulse" className="relative py-32 overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background dark:via-muted/10" />
      
      {/* Floating orbs */}
      <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-primary/10 dark:bg-primary/5 blur-3xl animate-drift" />
      <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-secondary/10 dark:bg-secondary/5 blur-3xl animate-float" />

      <div className="container relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 dark:bg-primary/20 text-primary text-sm font-medium mb-6">
            <Leaf className="w-4 h-4" />
            The Journey
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-wide text-foreground mb-6">
            From <span className="text-primary font-medium">Observation</span> to{" "}
            <span className="text-secondary font-medium">Restoration</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground font-light leading-relaxed">
            Every clean street starts with someone who cared enough to notice. 
            Here's how your awareness becomes the city's transformation.
          </p>
        </div>

        {/* Journey Cards */}
        <div className="relative">
          {/* Connection line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent -translate-y-1/2" />
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4">
            {journey.map((item, index) => {
            const VisualCue = visualComponents[index];
            return <div key={index} ref={el => {
              cardsRef.current[index] = el;
            }} className={`group relative transition-all duration-700 ease-out ${visibleCards[index] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{
              transitionDelay: `${index * 150}ms`
            }}>
                  {/* Card */}
                  <div className="glass-panel p-8 h-full transition-all duration-500 hover:shadow-glow group-hover:-translate-y-2">
                    {/* Visual Cue */}
                    <VisualCue />
                    
                    {/* Step number */}
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-5xl font-extralight text-primary/30 dark:text-primary/20">
                        {item.step}
                      </span>
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 dark:from-primary/30 dark:to-secondary/30 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                        <item.icon className="w-7 h-7 text-primary" />
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className="text-2xl font-medium text-foreground mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-primary/80 dark:text-primary font-medium mb-4">
                      {item.subtitle}
                    </p>
                    <p className="text-muted-foreground font-light leading-relaxed mb-6">
                      {item.description}
                    </p>

                    {/* Impact badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 dark:bg-success/20 text-success text-xs font-medium">
                      <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                      {item.impact}
                    </div>
                  </div>

                  {/* Arrow connector (not on last item) */}
                  {index < journey.length - 1 && <div className="hidden lg:flex absolute top-1/2 -right-2 z-10 w-4 h-4 items-center justify-center">
                      <ArrowRight className="w-4 h-4 text-muted-foreground/50" />
                    </div>}
                </div>;
          })}
          </div>
        </div>

        {/* Problem Statement Callout */}
        <div className="mt-20 max-w-4xl mx-auto">
          <div className="glass-card rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 dark:from-primary/10 dark:to-secondary/10" />
            
            <div className="relative z-10">
              <h3 className="text-2xl md:text-3xl font-medium text-foreground mb-4">
                Why This Matters
              </h3>
              <p className="text-lg text-muted-foreground font-light leading-relaxed mb-6 max-w-2xl mx-auto">Urban waste isn't just an eyesore it's a symptom of disconnection between citizens and their city. Traditional reporting is slow, frustrating, and often ignored. Aura bridges that gap, turning passive frustration into active restoration.<span className="text-foreground font-medium"> Aura bridges that gap</span>, 
                turning passive frustration into active restoration.
              </p>
              
              {/* Stats */}
              <div className="pt-6 border-t border-border/50">
                <span className="inline-block px-3 py-1 mb-4 text-xs font-medium text-muted-foreground/70 bg-muted/50 dark:bg-muted/30 rounded-full">
                  Projected Impact · Based on Civic Tech Benchmarks
                </span>
                <div className="grid grid-cols-3 gap-4 md:gap-8">
                  <div>
                    <div className="text-3xl md:text-4xl font-light text-primary mb-1">72%</div>
                    <div className="text-xs md:text-sm text-muted-foreground">Faster Resolution</div>
                  </div>
                  <div>
                    <div className="text-3xl md:text-4xl font-light text-secondary mb-1">3x</div>
                    <div className="text-xs md:text-sm text-muted-foreground">More Reports Acted On</div>
                  </div>
                  <div>
                    <div className="text-3xl md:text-4xl font-light text-accent mb-1">89%</div>
                    <div className="text-xs md:text-sm text-muted-foreground">Citizen Satisfaction</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default PulseSection;