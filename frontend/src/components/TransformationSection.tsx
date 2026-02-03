import { useState, useRef } from "react";
import { Sparkles } from "lucide-react";

export const TransformationSection = () => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      setSliderPosition(Math.max(0, Math.min(100, x)));
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.touches[0].clientX - rect.left) / rect.width) * 100;
      setSliderPosition(Math.max(0, Math.min(100, x)));
    }
  };

  return (
    <section className="relative py-32 overflow-hidden bg-muted/20 dark:bg-muted/5">
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-20 w-80 h-80 rounded-full bg-primary/10 dark:bg-primary/20 blur-ethereal animate-float" />
        <div className="absolute bottom-20 left-20 w-60 h-60 rounded-full bg-secondary/10 dark:bg-secondary/20 blur-soft animate-drift" />
      </div>

      <div className="container relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-light tracking-wide text-foreground/90 mb-6">
            The Transformation
          </h2>
          <p className="text-lg text-muted-foreground font-light">
            From friction to flow. Drag to reveal the change.
          </p>
        </div>

        {/* Before/After Slider */}
        <div className="max-w-4xl mx-auto">
          <div
            ref={containerRef}
            className="relative aspect-[16/10] rounded-3xl overflow-hidden cursor-ew-resize shadow-ethereal"
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
          >
            {/* Before Image - Messy */}
            <div className="absolute inset-0 bg-gradient-to-br from-muted via-muted/80 to-muted">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-4 p-8">
                  <div className="w-20 h-20 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
                    <span className="text-4xl">🗑️</span>
                  </div>
                  <p className="text-lg text-muted-foreground">Urban friction</p>
                  <div className="flex flex-wrap justify-center gap-2 opacity-60">
                    {['Litter', 'Debris', 'Neglect'].map((tag) => (
                      <span key={tag} className="px-3 py-1 rounded-full bg-muted-foreground/10 text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* After Image - Clean */}
            <div
              className="absolute inset-0 bg-gradient-to-br from-primary-light via-background to-secondary-light"
              style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-4 p-8">
                  <div className="w-20 h-20 mx-auto rounded-full bg-success/20 flex items-center justify-center animate-breath">
                    <Sparkles className="w-10 h-10 text-success" />
                  </div>
                  <p className="text-lg text-foreground">Urban harmony</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {['Clean', 'Vibrant', 'Alive'].map((tag) => (
                      <span key={tag} className="px-3 py-1 rounded-full bg-success/10 text-success text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Liquid Brush Divider */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-primary-foreground dark:from-foreground via-primary to-secondary"
              style={{ 
                left: `${sliderPosition}%`, 
                transform: 'translateX(-50%)',
                boxShadow: '0 0 30px hsl(var(--primary) / 0.5), 0 0 60px hsl(var(--primary) / 0.3)'
              }}
            >
              {/* Handle */}
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-card dark:bg-card shadow-glow flex items-center justify-center border border-border/50">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Insight */}
        <div className="max-w-2xl mx-auto mt-16 text-center">
          <div className="glass-panel p-8">
            <p className="text-lg text-foreground/80 font-light leading-relaxed">
              <span className="text-primary font-medium">Insight:</span> We don't just clean; we optimize. 
              Aura learns where the city "breathes heavy" to prevent clutter before it settles.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TransformationSection;
