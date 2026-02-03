import { useState } from "react";
import { ArrowLeft, Zap, Scale, Users, TrendingUp, Shield, MapPin, Sparkles, Send, Lock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { useToast } from "@/hooks/use-toast";

interface CircularNetworkProps {
  onBack: () => void;
}

const CircularNetwork = ({ onBack }: CircularNetworkProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    materialType: "",
    volume: "",
    email: "",
    organization: ""
  });

  const heroReveal = useScrollReveal();
  const statsReveal = useScrollReveal();
  const analyticsReveal = useScrollReveal();
  const formReveal = useScrollReveal();
  const streamsReveal = useScrollReveal();

  const stats = [
    { label: "Active Recovery Streams", value: "847", icon: Zap, color: "text-primary" },
    { label: "Verified Material Volume", value: "2.4M kg", icon: Scale, color: "text-secondary" },
    { label: "Registered Processing Partners", value: "156", icon: Users, color: "text-accent" },
    { label: "Circular Value Generated", value: "₹4.2Cr", icon: TrendingUp, color: "text-success" },
  ];

  const materialStreams = [
    { name: "Rigid & Soft Plastic", percentage: 34, color: "bg-primary" },
    { name: "Organic / Compostable", percentage: 28, color: "bg-success" },
    { name: "Construction Debris", percentage: 18, color: "bg-secondary" },
    { name: "E-Waste & Hazardous", percentage: 12, color: "bg-warning" },
    { name: "Mixed / Unsorted", percentage: 8, color: "bg-muted-foreground" },
  ];

  const availableStreams = [
    { 
      material: "PET Plastic", 
      purity: 94, 
      ward: "Kothrud, Ward 8",
      volume: "1,240 kg",
      value: "₹18,600",
      status: "available"
    },
    { 
      material: "Organic Waste", 
      purity: 89, 
      ward: "Aundh, Ward 12",
      volume: "3,500 kg",
      value: "₹8,750",
      status: "available"
    },
    { 
      material: "HDPE Containers", 
      purity: 91, 
      ward: "Baner, Ward 15",
      volume: "820 kg",
      value: "₹14,350",
      status: "available"
    },
    { 
      material: "Paper & Cardboard", 
      purity: 87, 
      ward: "Wakad, Ward 3",
      volume: "2,100 kg",
      value: "₹6,300",
      status: "pending"
    },
  ];

  const restrictedStreams = [
    { material: "Medical Waste", ward: "Multiple Wards", clearance: "CPCB Required" },
    { material: "Chemical Containers", ward: "MIDC Zone", clearance: "Hazmat License" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Partnership Request Submitted",
      description: "Our team will review your application within 48 hours.",
    });
    setFormData({ materialType: "", volume: "", email: "", organization: "" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-4">
        <div className="container mx-auto">
          <Button 
            variant="glass" 
            size="sm" 
            onClick={onBack}
            className="backdrop-blur-xl"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Aura
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-breath" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-breath" style={{ animationDelay: "1s" }} />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
        </div>

        <div 
          ref={heroReveal.ref}
          className={`container relative z-10 text-center transition-all duration-1000 ${
            heroReveal.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {/* Live Badge */}
          <Badge 
            variant="ai" 
            className="mb-6 px-4 py-2 text-sm font-medium bg-primary/10 border-primary/30"
          >
            <span className="w-2 h-2 rounded-full bg-success animate-pulse mr-2" />
            LIVE MUNICIPAL DATA GRID
          </Badge>

          <h1 className="text-4xl md:text-6xl font-light tracking-tight mb-6">
            <span className="bg-gradient-to-r from-foreground via-primary to-secondary bg-clip-text text-transparent">
              Civic Circular Economy Network
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto font-light leading-relaxed">
            Aura connects AI-verified municipal waste streams with certified processing partners. 
            From street-level detection to industrial recovery — fully traceable, fully intelligent.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button variant="hero" size="lg" className="group">
              <Sparkles className="w-5 h-5 mr-2 group-hover:animate-spin" />
              Request Partnership
            </Button>
            <Button variant="outline" size="lg">
              View Network Stats
            </Button>
          </div>
        </div>
      </section>

      {/* System Health Stats */}
      <section className="py-16 relative">
        <div 
          ref={statsReveal.ref}
          className={`container transition-all duration-1000 ${
            statsReveal.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-light mb-3">
              Network Health Indicators
            </h2>
            <p className="text-muted-foreground font-light">
              Real-time metrics from Aura's municipal integration layer
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {stats.map((stat, index) => (
              <Card 
                key={stat.label}
                className="bg-card/60 backdrop-blur-xl border-border/50 hover:border-primary/30 transition-all duration-500 group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6 text-center">
                  <div className={`w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <p className="text-3xl md:text-4xl font-light text-foreground mb-2">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground font-light uppercase tracking-wider">
                    {stat.label}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Material Stream Analytics */}
      <section className="py-16 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/20 to-transparent" />
        
        <div 
          ref={analyticsReveal.ref}
          className={`container relative z-10 transition-all duration-1000 ${
            analyticsReveal.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-light mb-3">
              Detected Urban Material Streams
            </h2>
            <p className="text-muted-foreground font-light">
              Derived from AI-verified citizen and municipal reports
            </p>
          </div>

          <Card className="max-w-3xl mx-auto bg-card/60 backdrop-blur-xl border-border/50">
            <CardContent className="p-8">
              <div className="space-y-6">
                {materialStreams.map((stream, index) => (
                  <div key={stream.name} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-light text-foreground">{stream.name}</span>
                      <span className="text-muted-foreground">{stream.percentage}%</span>
                    </div>
                    <div className="h-3 bg-muted/30 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${stream.color} rounded-full transition-all duration-1000 ease-out`}
                        style={{ 
                          width: analyticsReveal.isVisible ? `${stream.percentage}%` : "0%",
                          transitionDelay: `${index * 150}ms`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Partner Integration Form */}
      <section className="py-16 relative">
        <div 
          ref={formReveal.ref}
          className={`container transition-all duration-1000 ${
            formReveal.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-light mb-3">
                Partner Integration Request
              </h2>
              <p className="text-muted-foreground font-light">
                Processing partners can request material streams directly sourced from AI-verified urban reports. 
                Aura ensures traceability from detection to processing facility.
              </p>
            </div>

            <Card className="bg-card/60 backdrop-blur-xl border-border/50">
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="organization" className="text-sm font-light">
                        Organization Name
                      </Label>
                      <Input
                        id="organization"
                        placeholder="Enter organization name"
                        value={formData.organization}
                        onChange={(e) => setFormData(prev => ({ ...prev, organization: e.target.value }))}
                        className="bg-background/50 border-border/50"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-light">
                        Organization Contact Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="contact@organization.com"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="bg-background/50 border-border/50"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="materialType" className="text-sm font-light">
                        Material Stream Type
                      </Label>
                      <Select 
                        value={formData.materialType} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, materialType: value }))}
                      >
                        <SelectTrigger className="bg-background/50 border-border/50">
                          <SelectValue placeholder="Select material type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="plastic">Rigid & Soft Plastic</SelectItem>
                          <SelectItem value="organic">Organic / Compostable</SelectItem>
                          <SelectItem value="construction">Construction Debris</SelectItem>
                          <SelectItem value="ewaste">E-Waste</SelectItem>
                          <SelectItem value="mixed">Mixed / Unsorted</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="volume" className="text-sm font-light">
                        Requested Processing Volume (KG)
                      </Label>
                      <Input
                        id="volume"
                        type="number"
                        placeholder="e.g., 5000"
                        value={formData.volume}
                        onChange={(e) => setFormData(prev => ({ ...prev, volume: e.target.value }))}
                        className="bg-background/50 border-border/50"
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" variant="hero" size="lg" className="w-full group">
                    <Send className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
                    Submit Partnership Request
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Available Recovery Streams Grid */}
      <section className="py-16 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/20 to-transparent" />
        
        <div 
          ref={streamsReveal.ref}
          className={`container relative z-10 transition-all duration-1000 ${
            streamsReveal.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-light mb-3">
              Available Recovery Streams
            </h2>
            <p className="text-muted-foreground font-light">
              Live, AI-validated material clusters awaiting certified processing
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {availableStreams.map((stream, index) => (
              <Card 
                key={stream.material}
                className="bg-card/60 backdrop-blur-xl border-border/50 hover:border-primary/50 transition-all duration-300 group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={stream.status === "available" ? "success" : "pending"} className="text-xs">
                      {stream.status === "available" ? "Available" : "Pending Verification"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">AI Purity</span>
                  </div>
                  <CardTitle className="text-lg font-medium">{stream.material}</CardTitle>
                  <CardDescription className="flex items-center gap-1 text-xs">
                    <MapPin className="w-3 h-3" />
                    {stream.ward}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Purity Score */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Purity Score</span>
                      <span className="text-primary font-medium">{stream.purity}%</span>
                    </div>
                    <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                        style={{ width: `${stream.purity}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-2 rounded-lg bg-muted/20">
                      <p className="text-sm font-medium text-foreground">{stream.volume}</p>
                      <p className="text-xs text-muted-foreground">Volume</p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/20">
                      <p className="text-sm font-medium text-success">{stream.value}</p>
                      <p className="text-xs text-muted-foreground">Est. Value</p>
                    </div>
                  </div>

                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all"
                    disabled={stream.status !== "available"}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Request Allocation
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Restricted Streams */}
          <div className="max-w-2xl mx-auto">
            <Card className="bg-card/40 backdrop-blur-xl border-warning/30">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-warning" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-medium">Restricted Material Streams</CardTitle>
                    <CardDescription>
                      Hazardous and high-risk materials require additional regulatory clearance and Aura Platinum verification.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {restrictedStreams.map((stream) => (
                    <div 
                      key={stream.material}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/30"
                    >
                      <div>
                        <p className="font-medium text-sm">{stream.material}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {stream.ward}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs border-warning/50 text-warning">
                        <Shield className="w-3 h-3 mr-1" />
                        {stream.clearance}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border/30">
        <div className="container text-center">
          <p className="text-sm text-muted-foreground font-light">
            © 2025 Aura Circular Economy Network • A civic initiative for sustainable urban management
          </p>
        </div>
      </footer>
    </div>
  );
};

export default CircularNetwork;
