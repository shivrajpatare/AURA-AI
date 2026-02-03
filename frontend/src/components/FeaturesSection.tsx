import { Recycle, Users, TrendingUp, Shield, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FeaturesSectionProps {
  onStartReport: () => void;
}

const features = [
  {
    icon: Sparkles,
    title: "AI-Powered Detection",
    description: "Our AI instantly identifies waste type and severity from your photo, ensuring accurate routing to the right department.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: TrendingUp,
    title: "Real-Time Tracking",
    description: "Follow your report from submission to resolution. Get notified at every step of the cleanup process.",
    color: "bg-secondary/10 text-secondary",
  },
  {
    icon: Users,
    title: "Community Impact",
    description: "See how your neighborhood is improving. Compare stats across wards and celebrate collective achievements.",
    color: "bg-accent/10 text-accent",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "Your identity stays protected. Reports are anonymized while ensuring accountability from officials.",
    color: "bg-success/10 text-success",
  },
];

export const FeaturesSection = ({ onStartReport }: FeaturesSectionProps) => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How CleanStreets AI Works
          </h2>
          <p className="text-lg text-muted-foreground">
            Effortless civic participation powered by artificial intelligence. Report in seconds, track in real-time.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="civic-card p-6 space-y-4 group hover:-translate-y-1 transition-transform"
            >
              <div className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center transition-transform group-hover:scale-110`}>
                <feature.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-semibold">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* How It Works Steps */}
        <div className="civic-card p-8 md:p-12">
          <h3 className="text-2xl font-bold text-center mb-10">3 Simple Steps to a Cleaner City</h3>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Step
              number={1}
              title="Snap a Photo"
              description="Point your camera at any street waste or cleanliness issue. Our AI-ready interface guides you."
            />
            <Step
              number={2}
              title="AI Analyzes"
              description="Instant detection of waste type, severity, and optimal routing to the right municipal department."
            />
            <Step
              number={3}
              title="Track Resolution"
              description="Get real-time updates as officials respond. See your report go from pending to resolved."
            />
          </div>

          <div className="text-center mt-10">
            <Button variant="hero" size="xl" onClick={onStartReport}>
              <Recycle className="w-5 h-5" />
              Start Your First Report
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

const Step = ({ number, title, description }: { number: number; title: string; description: string }) => (
  <div className="text-center space-y-4">
    <div className="relative inline-flex">
      <div className="w-16 h-16 rounded-full gradient-hero flex items-center justify-center text-2xl font-bold text-primary-foreground shadow-glow">
        {number}
      </div>
    </div>
    <h4 className="text-xl font-semibold">{title}</h4>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

export default FeaturesSection;
