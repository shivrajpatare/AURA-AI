import { useState } from "react";

interface FinalCTAProps {
  onStartReport: () => void;
}

export const FinalCTA = ({ onStartReport }: FinalCTAProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section className="relative py-40 overflow-hidden bg-background">
      {/* Twilight gradient background with motion */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/10 dark:via-secondary/5 to-accent/20 dark:to-accent/10 animate-gradient-shift" />
      
      {/* Ocean-like wave effect */}
      <div className="absolute inset-0">
        <svg
          className="absolute bottom-0 w-full h-64 opacity-20 dark:opacity-30"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path
            fill="hsl(var(--secondary))"
            fillOpacity="0.3"
            d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,144C672,139,768,181,864,197.3C960,213,1056,203,1152,176C1248,149,1344,107,1392,85.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            className="animate-breath"
          />
          <path
            fill="hsl(var(--accent))"
            fillOpacity="0.2"
            d="M0,256L48,240C96,224,192,192,288,181.3C384,171,480,181,576,197.3C672,213,768,235,864,229.3C960,224,1056,192,1152,181.3C1248,171,1344,181,1392,186.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            className="animate-breath"
            style={{ animationDelay: '-2s' }}
          />
        </svg>
      </div>

      {/* Floating orbs */}
      <div className="absolute inset-0">
        <div 
          className="absolute w-96 h-96 rounded-full bg-secondary/10 dark:bg-secondary/20 blur-ethereal animate-float"
          style={{ top: '20%', left: '10%' }}
        />
        <div 
          className="absolute w-80 h-80 rounded-full bg-accent/10 dark:bg-accent/20 blur-soft animate-drift"
          style={{ bottom: '20%', right: '15%', animationDelay: '-3s' }}
        />
      </div>

      <div className="container relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-12">
          {/* Headline */}
          <div className="space-y-6">
            <p className="text-lg md:text-xl text-muted-foreground/80 font-light tracking-wide uppercase">
              Be part of the system your city deserves.
            </p>
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-light tracking-wide text-foreground/90">
              Begin the Bloom.
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground font-light max-w-xl mx-auto">
              Join <span className="text-primary font-medium">40,000 citizens</span> already restoring their neighborhoods.
            </p>
          </div>

          {/* CTA Button - Liquid pill */}
          <div className="pt-8">
            <button
              onClick={onStartReport}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="group relative px-16 py-7 rounded-full text-xl font-medium text-primary-foreground dark:text-background
                       transition-all duration-700 ease-out"
              style={{
                background: isHovered
                  ? 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 50%, hsl(var(--accent)) 100%)'
                  : 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%)',
                transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                boxShadow: isHovered
                  ? '0 0 80px hsl(var(--primary) / 0.5), 0 0 120px hsl(var(--secondary) / 0.4)'
                  : '0 20px 60px hsl(var(--primary) / 0.3)',
              }}
            >
              <span className="relative z-10 flex items-center gap-4">
                <span 
                  className="w-3 h-3 rounded-full bg-white transition-all duration-500"
                  style={{
                    transform: isHovered ? 'scale(1.5)' : 'scale(1)',
                    boxShadow: isHovered ? '0 0 20px white' : 'none',
                  }}
                />
                Download the Aura Mirror
              </span>

              {/* Inner glow */}
              <div 
                className="absolute inset-0 rounded-full transition-opacity duration-500"
                style={{
                  background: 'radial-gradient(circle at center, rgba(255,255,255,0.2) 0%, transparent 70%)',
                  opacity: isHovered ? 1 : 0,
                }}
              />
            </button>
          </div>

          {/* Secondary action */}
          <div className="pt-4">
            <button
              onClick={onStartReport}
              className="text-muted-foreground hover:text-foreground font-light text-lg
                       transition-all duration-300 underline underline-offset-4 decoration-muted-foreground/30
                       hover:decoration-primary"
            >
              Or report from your browser →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
