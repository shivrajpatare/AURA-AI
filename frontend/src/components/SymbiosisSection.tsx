import { useEffect, useState } from "react";

const generateHeatPoints = () => {
  return Array.from({ length: 30 }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 20 + Math.random() * 40,
    opacity: 0.2 + Math.random() * 0.4,
    delay: Math.random() * 3,
  }));
};

export const SymbiosisSection = () => {
  const [heatPoints] = useState(generateHeatPoints);
  const [counters, setCounters] = useState({
    carbon: 0,
    space: 0,
    reports: 0,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setCounters((prev) => ({
        carbon: prev.carbon + Math.random() * 2,
        space: prev.space + Math.random() * 5,
        reports: prev.reports + (Math.random() > 0.7 ? 1 : 0),
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section id="impact" className="relative py-32 overflow-hidden bg-background">
      {/* Watercolor Heat Map Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5 dark:from-primary/10 dark:via-background dark:to-secondary/10" />
      
      <div className="absolute inset-0">
        {heatPoints.map((point, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-pulse-glow"
            style={{
              left: `${point.x}%`,
              top: `${point.y}%`,
              width: `${point.size}px`,
              height: `${point.size}px`,
              background: `radial-gradient(circle, hsl(var(--primary) / ${point.opacity}) 0%, transparent 70%)`,
              animationDelay: `${point.delay}s`,
              filter: 'blur(20px)',
            }}
          />
        ))}
      </div>

      <div className="container relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl md:text-5xl font-light tracking-wide text-foreground/90 mb-6">
            The Symbiosis
          </h2>
          <p className="text-xl text-muted-foreground font-light leading-relaxed">
            You aren't a reporter; you're a vital cell in the city's immune system.
          </p>
        </div>

        {/* Gratitude Counters */}
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <GratitudeCounter
            value={counters.carbon.toFixed(1)}
            unit="kg"
            label="Carbon Diverted"
            icon="🌿"
          />
          <GratitudeCounter
            value={counters.space.toFixed(0)}
            unit="m²"
            label="Space Reclaimed"
            icon="✨"
          />
          <GratitudeCounter
            value={Math.floor(counters.reports + 847).toLocaleString()}
            unit=""
            label="Active Contributors"
            icon="🤝"
          />
        </div>

        {/* Rising Bubbles - Real-time indicator */}
        <div className="relative h-40 mt-16">
          <div className="absolute inset-0 flex items-end justify-center gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Bubble key={i} delay={i * 0.5} />
            ))}
          </div>
        </div>

        {/* Community Message */}
        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground/70 font-light">
            Real-time contributions from citizens across Pune
          </p>
        </div>
      </div>
    </section>
  );
};

const GratitudeCounter = ({
  value,
  unit,
  label,
  icon,
}: {
  value: string;
  unit: string;
  label: string;
  icon: string;
}) => (
  <div className="glass-panel p-8 text-center group hover:shadow-glow transition-all duration-500">
    <div className="text-4xl mb-4">{icon}</div>
    <div className="flex items-baseline justify-center gap-1 mb-2">
      <span className="text-4xl md:text-5xl font-light text-foreground/90 tabular-nums">
        {value}
      </span>
      {unit && (
        <span className="text-xl text-muted-foreground">{unit}</span>
      )}
    </div>
    <p className="text-muted-foreground font-light">{label}</p>
  </div>
);

const Bubble = ({ delay }: { delay: number }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const show = () => {
      setVisible(true);
      setTimeout(() => setVisible(false), 3000);
    };

    const initialTimeout = setTimeout(show, delay * 1000);
    const interval = setInterval(show, 5000 + delay * 1000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [delay]);

  if (!visible) return null;

  return (
    <div
      className="w-3 h-3 rounded-full bg-gradient-to-t from-primary/60 to-secondary/60 animate-bubble-rise"
      style={{ animationDelay: `${delay * 0.1}s` }}
    />
  );
};

export default SymbiosisSection;
