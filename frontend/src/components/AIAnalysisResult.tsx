import { useState } from "react";
import { MapPin, Calendar, AlertTriangle, Send, ChevronDown, Trash2, Leaf, Construction, Sparkles, Flame, Droplets, Bug, Wind, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { AnalysisResult } from "./CaptureScreen";

interface AIAnalysisResultProps {
  analysisData: AnalysisResult;
  onSubmit: () => void;
  onBack: () => void;
}

const categoryConfig: Record<string, { label: string; icon: typeof Trash2 }> = {
  garbage_dump: { label: "Garbage Dump", icon: Trash2 },
  dustbin_not_cleaned: { label: "Dustbin Not Cleaned", icon: Trash2 },
  burning_garbage: { label: "Burning Garbage", icon: Flame },
  open_manhole: { label: "Open Manhole/Drain", icon: AlertCircle },
  stagnant_water: { label: "Stagnant Water", icon: Droplets },
  dead_animal: { label: "Dead Animal", icon: Bug },
  sewage_overflow: { label: "Sewage Overflow", icon: Droplets },
  sweeping_not_done: { label: "Sweeping Not Done", icon: Wind },
  other: { label: "Other Issue", icon: AlertCircle },
};

const priorityConfig = {
  low: { label: "Low", color: "from-success/20 to-success/10", textColor: "text-success", emoji: "🟡" },
  medium: { label: "Medium", color: "from-warning/20 to-warning/10", textColor: "text-warning", emoji: "🟠" },
  high: { label: "High", color: "from-destructive/20 to-destructive/10", textColor: "text-destructive", emoji: "🔴" },
  critical: { label: "Critical", color: "from-destructive/30 to-destructive/20", textColor: "text-destructive", emoji: "🚨" },
};

export const AIAnalysisResult = ({ analysisData, onSubmit, onBack }: AIAnalysisResultProps) => {
  const [selectedCategory, setSelectedCategory] = useState(analysisData.category);
  const [selectedPriority, setSelectedPriority] = useState(analysisData.priority);
  const [description, setDescription] = useState("");
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reporterName, setReporterName] = useState("");
  const [reporterPhone, setReporterPhone] = useState("");

  const currentCategory = categoryConfig[selectedCategory] || categoryConfig.other;
  const currentPriority = priorityConfig[selectedPriority as keyof typeof priorityConfig] || priorityConfig.medium;
  const CategoryIcon = currentCategory.icon;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.from('reports').insert({
        category: selectedCategory as any,
        priority: selectedPriority as any,
        ai_confidence: analysisData.confidence,
        ai_description: analysisData.description,
        latitude: analysisData.latitude,
        longitude: analysisData.longitude,
        address: analysisData.address,
        before_image_url: analysisData.imageUrl,
        reporter_name: reporterName || null,
        reporter_phone: reporterPhone || null,
      });

      if (error) {
        console.error('Submit error:', error);
        throw error;
      }

      toast({
        title: "Report Submitted! ✨",
        description: "Your report has been sent to city authorities.",
      });
      
      onSubmit();
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: "Submission Failed",
        description: "Could not submit report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-gradient-to-b from-background via-primary/5 to-secondary/10">
      {/* Ambient background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-drift" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-drift" style={{ animationDelay: "-5s" }} />
      </div>

      {/* Header */}
      <div className="relative flex items-center justify-between p-4 glass-panel mx-4 mt-4 rounded-2xl">
        <Button variant="ghost" onClick={onBack} className="rounded-xl hover:bg-white/10">
          ← Back
        </Button>
        <h2 className="font-medium text-foreground/80 tracking-wide">AI Analysis</h2>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-light text-foreground/70">Complete</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* AI Detection Summary */}
        <div className="glass-panel p-6 rounded-3xl space-y-5">
          <div className="flex items-start gap-5">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl blur-lg" />
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center animate-breath">
                <CategoryIcon className="w-8 h-8 text-primary/80" />
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-xl font-light text-foreground/90">{currentCategory.label}</h3>
                <span className="px-3 py-1 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 text-sm font-light text-primary">
                  {Math.round(analysisData.confidence * 100)}% confidence
                </span>
              </div>
              <p className="text-sm text-foreground/50 font-light">
                {analysisData.description}
              </p>
            </div>
          </div>

          {/* Priority Badge */}
          <div className={`flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r ${currentPriority.color}`}>
            <span className="text-2xl">{currentPriority.emoji}</span>
            <div>
              <p className={`font-medium ${currentPriority.textColor}`}>
                {currentPriority.label} Priority
              </p>
              <p className="text-sm text-foreground/50">{analysisData.severity_reason}</p>
            </div>
          </div>

          {/* Change Type */}
          <div className="relative">
            <button
              className="w-full flex items-center justify-between p-4 rounded-2xl glass-card hover:bg-white/10 transition-all duration-300"
              onClick={() => setShowTypeDropdown(!showTypeDropdown)}
            >
              <span className="text-foreground/70 font-light">Change category</span>
              <ChevronDown className={`w-5 h-5 text-foreground/50 transition-transform duration-300 ${showTypeDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {showTypeDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 glass-panel rounded-2xl overflow-hidden z-20 shadow-xl max-h-64 overflow-y-auto">
                {Object.entries(categoryConfig).map(([key, config]) => {
                  const Icon = config.icon;
                  return (
                    <button
                      key={key}
                      className={`w-full flex items-center gap-4 p-4 hover:bg-white/10 transition-colors ${
                        selectedCategory === key ? 'bg-primary/5' : ''
                      }`}
                      onClick={() => {
                        setSelectedCategory(key);
                        setShowTypeDropdown(false);
                      }}
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary/70" />
                      </div>
                      <span className="flex-1 text-left font-light text-foreground/80">{config.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Priority Selection */}
        <div className="space-y-4">
          <label className="text-sm font-light text-foreground/60 tracking-wide">Adjust Priority</label>
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(priorityConfig).map(([key, config]) => (
              <button
                key={key}
                className={`p-4 rounded-2xl transition-all duration-300 ${
                  selectedPriority === key
                    ? `bg-gradient-to-br ${config.color} ring-2 ring-current ${config.textColor}`
                    : 'glass-card hover:bg-white/10'
                }`}
                onClick={() => setSelectedPriority(key)}
              >
                <span className="text-xl block mb-2">{config.emoji}</span>
                <span className="text-xs font-light">{config.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Location */}
        <div className="glass-panel p-5 rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary/20 to-primary/10 flex items-center justify-center">
              <MapPin className="w-6 h-6 text-secondary/80" />
            </div>
            <div className="flex-1">
              <p className="font-light text-foreground/80 line-clamp-2">{analysisData.address}</p>
              <p className="text-sm text-foreground/50 font-light">
                {analysisData.latitude.toFixed(4)}, {analysisData.longitude.toFixed(4)}
              </p>
            </div>
          </div>
        </div>

        {/* Reporter Info (Optional) */}
        <div className="space-y-4">
          <label className="text-sm font-light text-foreground/60 tracking-wide">Your Details (Optional)</label>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Name"
              value={reporterName}
              onChange={(e) => setReporterName(e.target.value)}
              className="p-4 rounded-2xl glass-card border-white/10 bg-transparent placeholder:text-foreground/30 font-light"
            />
            <input
              type="tel"
              placeholder="Phone"
              value={reporterPhone}
              onChange={(e) => setReporterPhone(e.target.value)}
              className="p-4 rounded-2xl glass-card border-white/10 bg-transparent placeholder:text-foreground/30 font-light"
            />
          </div>
        </div>

        {/* Additional Details */}
        <div className="space-y-3">
          <label className="text-sm font-light text-foreground/60 tracking-wide">Additional Notes (Optional)</label>
          <Textarea
            placeholder="Any additional context for city authorities..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-28 resize-none rounded-2xl glass-card border-white/10 bg-transparent 
                     placeholder:text-foreground/30 focus:ring-primary/30 font-light"
          />
        </div>

        {/* Estimated Response */}
        <div className="flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-r from-success/10 to-primary/5 border border-success/20">
          <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
            <Calendar className="w-6 h-6 text-success/80" />
          </div>
          <div className="flex-1">
            <p className="font-light text-success/90">
              Estimated Response: {selectedPriority === 'critical' ? '2-4 hours' : selectedPriority === 'high' ? '4-12 hours' : '24-48 hours'}
            </p>
            <p className="text-sm text-foreground/40 font-light">Based on priority level</p>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="relative p-4">
        <div className="glass-panel p-4 rounded-3xl">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full h-16 rounded-2xl bg-gradient-to-r from-primary/80 to-secondary/80 
                     text-white font-light flex items-center justify-center gap-3
                     hover:from-primary hover:to-secondary transition-all duration-500
                     shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30
                     hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
          >
            {isSubmitting ? (
              <>Submitting...</>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Submit Report
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAnalysisResult;
