import { useState, useRef, useEffect } from "react";
import { Camera, X, RotateCcw, Sparkles, MapPin, Upload, Image, Zap, ZapOff, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { api } from "@/services/api";
import { toast } from "@/hooks/use-toast";

interface CaptureScreenProps {
  onCapture: (analysisData: AnalysisResult) => void;
  onClose: () => void;
}

export interface AnalysisResult {
  imageUrl: string;
  category: string;
  priority: string;
  confidence: number;
  description: string;
  severity_reason: string;
  latitude: number;
  longitude: number;
  address: string;
}

type AIStatus = "ready" | "analyzing" | "error";

const COMMUNITY_MESSAGES = [
  "You're helping keep Pune clean 🌱",
  "3,241 issues resolved this month",
  "Join 12,000+ active citizens",
  "Every report makes a difference ✨",
];

export const CaptureScreen = ({ onCapture, onClose }: CaptureScreenProps) => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiStatus, setAiStatus] = useState<AIStatus>("ready");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [address, setAddress] = useState<string>("Detecting location...");
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [showCaptureFlash, setShowCaptureFlash] = useState(false);
  const [communityMsgIndex, setCommunityMsgIndex] = useState(0);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Rotate community messages
  useEffect(() => {
    const interval = setInterval(() => {
      setCommunityMsgIndex((prev) => (prev + 1) % COMMUNITY_MESSAGES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Initialize camera on mount
  useEffect(() => {
    const startCamera = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          setCameraError("Camera not supported in this browser.");
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraError(null);
      } catch (error) {
        console.error("Error accessing camera:", error);
        setCameraError("Unable to access camera. Please check permissions.");
      }
    };

    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Get user's location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lng: longitude });

          // Reverse geocode to get address (using a simple approach)
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
            );
            const data = await response.json();
            const addr = data.display_name?.split(',').slice(0, 3).join(', ') || 'Location detected';
            setAddress(addr);
          } catch {
            setAddress(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          }
        },
        () => {
          setAddress("Location unavailable");
          // Default to Pune center
          setLocation({ lat: 18.5204, lng: 73.8567 });
        }
      );
    }
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target?.result as string;
        setCapturedImage(imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCapture = () => {
    if (!videoRef.current) {
      // Fallback to simulated capture if video not ready
      setShowCaptureFlash(true);
      setTimeout(() => setShowCaptureFlash(false), 200);
      setCapturedImage("captured");
      return;
    }

    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 720;
    canvas.height = video.videoHeight || 1280;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      setShowCaptureFlash(true);
      setTimeout(() => setShowCaptureFlash(false), 200);
      setCapturedImage("captured");
      return;
    }

    // Capture current frame from video
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);

    setShowCaptureFlash(true);
    setTimeout(() => setShowCaptureFlash(false), 200);
    setCapturedImage(dataUrl);
  };

  const handleAnalyze = async () => {
    if (!capturedImage) return;

    setIsAnalyzing(true);
    setAiStatus("analyzing");
    setAnalysisError(null);

    try {
      let imageUrl = capturedImage;
      let base64Data = capturedImage;

      // If it's a real image (not simulated), upload to storage
      if (capturedImage !== "captured" && capturedImage.startsWith('data:')) {
        // Extract base64 data
        base64Data = capturedImage;

        // Upload to storage
        const fileName = `report_${Date.now()}.jpg`;
        const base64Content = capturedImage.split(',')[1];
        const byteCharacters = atob(base64Content);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/jpeg' });

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('report-images')
          .upload(fileName, blob);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw new Error('Failed to upload image');
        }

        const { data: urlData } = supabase.storage
          .from('report-images')
          .getPublicUrl(fileName);

        imageUrl = urlData.publicUrl;
      }

      // Call Backend API instead of Edge Function
      const { data: analysisData } = await api.post('/reports/analyze', {
        imageBase64: base64Data
      });

      if (!analysisData) throw new Error('No data received');

      setAiStatus("ready");

      // Pass results to parent
      onCapture({
        imageUrl,
        category: analysisData.category,
        priority: analysisData.priority,
        confidence: analysisData.confidence,
        description: analysisData.description,
        severity_reason: analysisData.severity_reason,
        latitude: location?.lat || 18.5204,
        longitude: location?.lng || 73.8567,
        address: address,
      });

    } catch (error) {
      console.error('Error during analysis:', error);
      setAiStatus("error");
      setAnalysisError("We couldn't clearly detect the issue. Try moving closer or improving lighting.");
      toast({
        title: "Analysis Failed",
        description: "Could not analyze the image. Please try again.",
        variant: "destructive",
      });
      setIsAnalyzing(false);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setIsAnalyzing(false);
    setAiStatus("ready");
    setAnalysisError(null);
  };

  const getAIStatusConfig = () => {
    switch (aiStatus) {
      case "analyzing":
        return { color: "bg-amber-500", text: "Analyzing...", icon: "🟡" };
      case "error":
        return { color: "bg-destructive", text: "Detection failed", icon: "🔴" };
      default:
        return { color: "bg-primary", text: "Ready to detect", icon: "🟢" };
    }
  };

  const statusConfig = getAIStatusConfig();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-gradient-to-b from-background via-primary/5 to-secondary/10">
      {/* Ambient background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-drift" />
        <div className="absolute bottom-40 right-10 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-drift" style={{ animationDelay: "-3s" }} />
      </div>

      {/* Close Button - Floating */}
      <button
        onClick={onClose}
        className="absolute top-6 left-6 z-20 p-3 rounded-2xl glass-card hover:bg-white/20 transition-all duration-300"
      >
        <X className="w-5 h-5 text-foreground/70" />
      </button>

      {/* Phone Mockup Frame */}
      <div className="relative animate-fade-in-up" style={{ perspective: '1000px' }}>
        <div className="relative w-[320px] md:w-[360px] transition-transform duration-500 ease-out" style={{ transformStyle: 'preserve-3d' }}>
          {/* Phone Frame - Titanium Style */}
          <div className="relative bg-gradient-to-b from-foreground/95 via-foreground/85 to-foreground/90 dark:from-foreground/80 dark:via-foreground/70 dark:to-foreground/75 rounded-[3rem] p-[3px] shadow-2xl">
            {/* Inner bezel */}
            <div className="relative bg-foreground/95 dark:bg-foreground/85 rounded-[2.85rem] p-2.5">
              {/* Side buttons - Volume */}
              <div className="absolute -left-[2px] top-24 w-[3px] h-8 bg-foreground/80 dark:bg-foreground/70 rounded-l-sm" />
              <div className="absolute -left-[2px] top-36 w-[3px] h-8 bg-foreground/80 dark:bg-foreground/70 rounded-l-sm" />
              {/* Side button - Power */}
              <div className="absolute -right-[2px] top-28 w-[3px] h-12 bg-foreground/80 dark:bg-foreground/70 rounded-r-sm" />

              {/* Phone Screen */}
              <div className="relative bg-background rounded-[2.3rem] overflow-hidden" style={{ aspectRatio: '9/19.5' }}>
                {/* Dynamic Island */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-foreground/95 dark:bg-foreground/90 rounded-full px-4 py-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-foreground/30 dark:bg-background/20" />
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                </div>

                {/* Status Bar */}
                <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-background/90 to-transparent backdrop-blur-sm z-10 flex items-end justify-between px-6 pb-1">
                  <span className="text-[10px] font-medium text-foreground/70">9:41</span>
                  <div className="flex items-center gap-1">
                    {/* Signal bars - align to bottom so they grow upwards like a real network icon */}
                    <div className="flex items-end gap-[2px]">
                      <div className="w-[3px] h-2 bg-foreground/60 rounded-sm" />
                      <div className="w-[3px] h-2.5 bg-foreground/60 rounded-sm" />
                      <div className="w-[3px] h-3 bg-foreground/60 rounded-sm" />
                      <div className="w-[3px] h-3.5 bg-foreground/40 rounded-sm" />
                    </div>
                    <div className="w-5 h-2.5 border border-foreground/50 rounded-sm ml-1 relative">
                      <div className="absolute inset-[1px] bg-primary rounded-[1px]" style={{ width: '70%' }} />
                      <div className="absolute -right-[2px] top-1/2 -translate-y-1/2 w-[2px] h-1 bg-foreground/50 rounded-r-sm" />
                    </div>
                  </div>
                </div>

                {/* App Content */}
                <div className="absolute inset-0 pt-14 pb-6 px-3 flex flex-col">
                  {/* App Header */}
                  <div className="flex items-center justify-between mb-2 px-1">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                        <span className="text-[7px] font-bold text-white">A</span>
                      </div>
                      <div>
                        <p className="text-[8px] font-semibold text-foreground">Aura</p>
                        <p className="text-[6px] text-muted-foreground">Capture Moment</p>
                      </div>
                    </div>
                    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full border transition-colors ${aiStatus === "ready" ? "bg-primary/10 border-primary/20" :
                      aiStatus === "analyzing" ? "bg-amber-500/10 border-amber-500/20" :
                        "bg-destructive/10 border-destructive/20"
                      }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${statusConfig.color} animate-pulse`} />
                      <span className={`text-[7px] font-medium ${aiStatus === "ready" ? "text-primary" :
                        aiStatus === "analyzing" ? "text-amber-600 dark:text-amber-400" :
                          "text-destructive"
                        }`}>{statusConfig.text}</span>
                    </div>
                  </div>

                  {/* Camera Preview Area */}
                  <div className="flex-1 rounded-2xl bg-gradient-to-br from-muted/80 to-muted/40 border border-border/50 relative overflow-hidden">
                    {/* Capture flash animation */}
                    {showCaptureFlash && (
                      <div className="absolute inset-0 bg-white z-30 animate-fade-out" style={{ animationDuration: "200ms" }} />
                    )}

                    {capturedImage ? (
                      <>
                        {capturedImage === "captured" ? (
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/10 flex items-center justify-center">
                            <div className="text-center space-y-2">
                              <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center animate-breath">
                                <Image className="w-6 h-6 text-primary/60" />
                              </div>
                              <p className="text-[8px] text-foreground/60 font-light">Captured</p>
                            </div>
                          </div>
                        ) : (
                          <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
                        )}

                        {/* AI Analysis Overlay */}
                        {isAnalyzing && (
                          <div className="absolute inset-0 bg-background/70 backdrop-blur-md flex items-center justify-center">
                            <div className="text-center space-y-3">
                              <div className="relative w-14 h-14 mx-auto">
                                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 blur-lg animate-pulse-glow" />
                                <div className="relative w-full h-full rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center animate-breath">
                                  <div className="w-10 h-10 rounded-full border-2 border-primary/30 border-t-primary animate-spin" style={{ animationDuration: "2s" }} />
                                  <Sparkles className="absolute w-5 h-5 text-primary animate-pulse" />
                                </div>
                              </div>
                              <p className="text-[9px] font-light text-foreground/70">AI Analyzing...</p>
                            </div>
                          </div>
                        )}

                        {/* Error Recovery Overlay */}
                        {analysisError && !isAnalyzing && (
                          <div className="absolute inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center p-4">
                            <div className="text-center space-y-2">
                              <div className="w-10 h-10 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
                                <span className="text-lg">🔴</span>
                              </div>
                              <p className="text-[8px] text-foreground/70 leading-relaxed">{analysisError}</p>
                              <button
                                onClick={handleRetake}
                                className="text-[7px] text-primary underline"
                              >
                                Try again
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        {/* Live camera preview or fallback guidance */}
                        <div className="absolute inset-0">
                          {cameraError ? (
                            <div className="h-full flex flex-col items-center justify-center text-center px-4 space-y-2">
                              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center mb-1">
                                <Camera className="w-5 h-5 text-destructive" />
                              </div>
                              <p className="text-[8px] text-foreground/70 leading-relaxed">
                                {cameraError}
                              </p>
                              <p className="text-[7px] text-foreground/40 max-w-[160px] mx-auto leading-relaxed">
                                You can still upload a photo from your gallery.
                              </p>
                            </div>
                          ) : (
                            <>
                              <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover"
                              />

                              {/* Overlay guidance */}
                              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                                <div className="text-center space-y-2">
                                  <div className="space-y-1">
                                    <p className="text-[9px] text-background font-medium drop-shadow-sm">
                                      Frame the Issue
                                    </p>
                                    <p className="text-[7px] text-background/80 max-w-[140px] mx-auto leading-relaxed drop-shadow-sm">
                                      Align garbage, waste, or civic issue inside the frame.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Scan overlay corners - functional guides */}
                        <div className="absolute inset-2 pointer-events-none">
                          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-primary/40 rounded-tl-xl" />
                          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-primary/40 rounded-tr-xl" />
                          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-primary/40 rounded-bl-xl" />
                          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-primary/40 rounded-br-xl" />
                        </div>

                        {/* Scanning line animation */}
                        <div className="absolute left-2 right-2 h-[2px] bg-gradient-to-r from-transparent via-primary/60 to-transparent animate-scan" />
                      </>
                    )}
                  </div>

                  {/* Location Badge with Privacy */}
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-2 px-2 py-1.5 rounded-full glass-card mx-auto max-w-[90%]">
                      <MapPin className="w-3 h-3 text-primary/70 flex-shrink-0" />
                      <span className="text-[7px] text-foreground/60 font-light truncate">{address}</span>
                    </div>
                    <div className="flex items-center justify-center gap-1 opacity-60">
                      <Shield className="w-2 h-2 text-foreground/40" />
                      <span className="text-[5px] text-foreground/40">Location shared only for this report</span>
                    </div>
                  </div>

                  {/* Bottom Controls */}
                  <div className="mt-2 px-1">
                    {capturedImage ? (
                      <div className="flex gap-2">
                        <button
                          onClick={handleRetake}
                          disabled={isAnalyzing}
                          className="flex-1 h-9 rounded-xl bg-muted/60 border border-border/50 flex items-center justify-center gap-1 text-foreground/70 disabled:opacity-50"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span className="text-[8px] font-light">Retake</span>
                        </button>
                        <button
                          onClick={handleAnalyze}
                          disabled={isAnalyzing}
                          className="flex-1 h-9 rounded-xl bg-gradient-to-r from-primary/80 to-secondary/80 
                                   text-white flex items-center justify-center gap-1
                                   disabled:opacity-50 shadow-md shadow-primary/20"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span className="text-[8px] font-light">{isAnalyzing ? "Analyzing..." : "Analyze"}</span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          {/* Gallery Upload */}
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-10 h-10 rounded-xl bg-muted/60 border border-border/50 flex flex-col items-center justify-center hover:bg-muted/80 transition-colors gap-0.5"
                          >
                            <Upload className="w-3.5 h-3.5 text-foreground/60" />
                            <span className="text-[5px] text-foreground/40">Gallery</span>
                          </button>

                          {/* Capture Button */}
                          <button
                            onClick={handleCapture}
                            className="relative group"
                          >
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary via-primary to-secondary p-[3px] shadow-lg shadow-primary/30 group-hover:shadow-xl group-hover:shadow-primary/40 transition-shadow group-active:scale-95">
                              <div className="w-full h-full rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                <div className="w-11 h-11 rounded-full bg-white/90 dark:bg-white/80 group-hover:scale-95 transition-transform" />
                              </div>
                            </div>
                          </button>

                          {/* Flash Toggle */}
                          <button
                            onClick={() => setFlashEnabled(!flashEnabled)}
                            className={`w-10 h-10 rounded-xl border flex flex-col items-center justify-center transition-colors gap-0.5 ${flashEnabled
                              ? "bg-primary/20 border-primary/30"
                              : "bg-muted/60 border-border/50 hover:bg-muted/80"
                              }`}
                          >
                            {flashEnabled ? (
                              <Zap className="w-3.5 h-3.5 text-primary" />
                            ) : (
                              <ZapOff className="w-3.5 h-3.5 text-foreground/60" />
                            )}
                            <span className={`text-[5px] ${flashEnabled ? "text-primary" : "text-foreground/40"}`}>
                              Flash
                            </span>
                          </button>
                        </div>

                        {/* Community Motivation */}
                        <div className="text-center h-4 overflow-hidden">
                          <p className="text-[6px] text-foreground/40 animate-fade-in" key={communityMsgIndex}>
                            {COMMUNITY_MESSAGES[communityMsgIndex]}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Home indicator */}
                <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-24 h-1 bg-foreground/30 rounded-full" />
              </div>
            </div>
          </div>

          {/* Glow effect behind phone */}
          <div className="absolute -inset-8 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-3xl -z-10 animate-breath" />
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  );
};

export default CaptureScreen;
