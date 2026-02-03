import { TrendingUp, Users, MapPin, Award } from "lucide-react";

const impactStats = [
  { icon: TrendingUp, value: "5,000+", label: "Reports Resolved", suffix: "this year" },
  { icon: Users, value: "12,000+", label: "Active Citizens", suffix: "and growing" },
  { icon: MapPin, value: "150+", label: "Wards Covered", suffix: "across Bengaluru" },
  { icon: Award, value: "98%", label: "Resolution Rate", suffix: "within 48 hours" },
];

export const ImpactSection = () => {
  return (
    <section id="impact" className="py-20 gradient-hero text-primary-foreground">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Making a Real Difference
          </h2>
          <p className="text-lg text-primary-foreground/80">
            Every report matters. See how our community is transforming city cleanliness, one snapshot at a time.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {impactStats.map((stat, index) => (
            <div
              key={index}
              className="text-center p-6 rounded-2xl bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20"
            >
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
                <stat.icon className="w-7 h-7" />
              </div>
              <p className="text-3xl md:text-4xl font-bold mb-1">{stat.value}</p>
              <p className="font-medium">{stat.label}</p>
              <p className="text-sm text-primary-foreground/70 mt-1">{stat.suffix}</p>
            </div>
          ))}
        </div>

        {/* Testimonial */}
        <div className="mt-16 max-w-3xl mx-auto text-center">
          <blockquote className="text-xl md:text-2xl font-medium italic mb-6">
            "CleanStreets AI has revolutionized how we handle civic complaints. Response time dropped by 60% and citizen satisfaction is at an all-time high."
          </blockquote>
          <div className="flex items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary-foreground/20 flex items-center justify-center font-bold">
              RK
            </div>
            <div className="text-left">
              <p className="font-semibold">Ramesh Kumar</p>
              <p className="text-sm text-primary-foreground/70">Commissioner, BBMP South Zone</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ImpactSection;
