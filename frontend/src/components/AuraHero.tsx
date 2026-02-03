import { useEffect, useRef, useState } from "react";
import auraLeafIcon from "@/assets/aura-leaf-icon.png";

interface AuraHeroProps {
  onStartReport: () => void;
}

export const AuraHero = ({ onStartReport }: AuraHeroProps) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        setMousePos({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    };

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Background - Ethereal Gradient with Motion */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5 dark:from-primary/10 dark:via-background dark:to-secondary/10 animate-gradient-shift" />
      
      {/* Animated Orbs with Parallax */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute w-[600px] h-[600px] rounded-full bg-primary/20 dark:bg-primary/30 blur-ethereal animate-drift transition-transform duration-100"
          style={{
            top: '10%',
            left: '10%',
            transform: `translateY(${scrollY * 0.15}px)`,
          }} 
        />
        <div 
          className="absolute w-[500px] h-[500px] rounded-full bg-secondary/20 dark:bg-secondary/30 blur-ethereal animate-float transition-transform duration-100"
          style={{
            bottom: '10%',
            right: '10%',
            animationDelay: '-2s',
            transform: `translateY(${scrollY * 0.25}px)`,
          }} 
        />
        <div 
          className="absolute w-[400px] h-[400px] rounded-full bg-primary/15 dark:bg-primary/25 blur-soft animate-breath transition-transform duration-100"
          style={{
            top: '50%',
            left: '50%',
            transform: `translate(-50%, calc(-50% + ${scrollY * 0.1}px))`,
          }} 
        />
      </div>

      {/* Floating Lens Effect - follows cursor */}
      <div className="absolute w-80 h-80 rounded-full pointer-events-none transition-all duration-700 ease-out" style={{
      left: mousePos.x - 160,
      top: mousePos.y - 160,
      background: 'radial-gradient(circle, hsl(var(--primary) / 0.15) 0%, transparent 70%)',
      filter: 'blur(30px)'
    }} />

      {/* Content */}
      <div className="container relative z-10">
        <div className="flex flex-col items-center justify-center">
          {/* Text Content */}
          <div className="max-w-3xl text-center space-y-8">
            {/* Main Headline */}
            <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-light tracking-wide text-foreground/90">
                Your city,
                <br />
                <span className="font-medium bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-breath">
                  breathing deeper.
                </span>
              </h1>
            </div>

            {/* Sub-headline */}
            <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <p className="text-xl md:text-2xl text-muted-foreground font-light leading-relaxed max-w-2xl mx-auto">
                Aura turns your perspective into progress. A single photo ripples through 
                the city's nervous system to restore beauty in real-time.
              </p>
            </div>

            {/* CTA Icon */}
            <div className="pt-8 animate-fade-in-up flex flex-col items-center gap-4" style={{ animationDelay: '0.6s' }}>
              <button 
                onClick={onStartReport} 
                className="group relative w-28 h-28 transition-all duration-700 ease-out hover:scale-110"
              >
                <img 
                  src={auraLeafIcon} 
                  alt="Begin the Bloom" 
                  className="w-full h-full object-contain drop-shadow-lg transition-all duration-500 group-hover:drop-shadow-2xl"
                />
                <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
              </button>
              <span className="text-lg font-medium text-foreground/80">
                Begin the Bloom
              </span>
            </div>

            {/* Trust indicator */}
            <div className="animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
              <p className="text-sm text-muted-foreground/70 font-light">
                Join 40,000 citizens shaping a cleaner tomorrow
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default AuraHero;