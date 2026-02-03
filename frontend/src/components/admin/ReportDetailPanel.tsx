import { useState, useRef, useEffect } from "react";
import { X, MapPin, Clock, Tag, AlertTriangle, Users, CheckCircle, Play, Image as ImageIcon, Plus, ThumbsDown, ThumbsUp, MessageSquare, Navigation } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import type { MapReport } from "./AdminMapPanel";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { TILE_LAYER_URL, TILE_LAYER_ATTRIBUTION, createPriorityIcon, selectedMarkerIcon } from "@/components/map/mapUtils";

interface ReportDetailPanelProps {
  report: MapReport | null;
  onClose: () => void;
  onUpdateStatus: (reportId: string, newStatus: string, additionalData?: Record<string, any>) => void;
  categoryLabels: Record<string, string>;
}

const priorityConfig = {
  critical: { label: "Critical", variant: "destructive" as const, color: "text-destructive" },
  high: { label: "High", variant: "destructive" as const, color: "text-destructive" },
  medium: { label: "Medium", variant: "warning" as const, color: "text-warning" },
  low: { label: "Low", variant: "secondary" as const, color: "text-amber-500" },
};

const statusConfig = {
  pending: { label: "Pending", color: "bg-warning/10 text-warning" },
  in_progress: { label: "In Progress", color: "bg-secondary/10 text-secondary" },
  resolved: { label: "Resolved", color: "bg-success/10 text-success" },
  duplicate: { label: "Duplicate", color: "bg-muted text-muted-foreground" },
};

export const ReportDetailPanel = ({
  report,
  onClose,
  onUpdateStatus,
  categoryLabels,
}: ReportDetailPanelProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [afterImage, setAfterImage] = useState<File | null>(null);
  const [adminLocation, setAdminLocation] = useState<[number, number] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  // Get Admin Location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setAdminLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => console.log("Location access denied", error),
        { enableHighAccuracy: true }
      );
    }
  }, []);

  // Initialize/Update Map
  useEffect(() => {
    if (!report || !mapContainerRef.current) return;

    // cleanup previous map
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false
    });

    L.tileLayer(TILE_LAYER_URL, { maxZoom: 18 }).addTo(map);

    const reportLatLng: [number, number] = [report.latitude, report.longitude];

    // Add Report Marker
    L.marker(reportLatLng, { icon: createPriorityIcon(report.priority) }).addTo(map);

    // Add Admin Marker and Route Line if available
    let bounds = L.latLngBounds([reportLatLng]);

    if (adminLocation) {
      // Admin Marker (Blue dot)
      const adminIcon = L.divIcon({
        className: 'admin-marker',
        html: '<div style="background-color: #3b82f6; width: 16px; height: 16px; border: 3px solid white; border-radius: 50%; box-shadow: 0 4px 10px rgba(0,0,0,0.3);"></div>',
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });
      L.marker(adminLocation, { icon: adminIcon }).addTo(map);

      // Draw Route Line (Updates dynamically)
      L.polyline([adminLocation, reportLatLng], {
        color: '#3b82f6',
        weight: 4,
        opacity: 0.7,
        dashArray: '10, 10'
      }).addTo(map);

      bounds.extend(adminLocation);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else {
      map.setView(reportLatLng, 15);
    }

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [report, adminLocation]);

  if (!report) return null;

  const priority = priorityConfig[report.priority as keyof typeof priorityConfig] || priorityConfig.low;
  const status = statusConfig[report.status as keyof typeof statusConfig] || statusConfig.pending;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleAfterImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAfterImage(file);
    }
  };

  const handleResolve = async () => {
    if (!report) return;

    setIsUploading(true);
    let after_image_url = null;

    try {
      if (afterImage) {
        const fileName = `resolved_${report.id}_${Date.now()}.jpg`;
        const { data, error } = await supabase.storage
          .from('report-images')
          .upload(fileName, afterImage);

        if (error) throw error;

        const { data: urlData } = supabase.storage
          .from('report-images')
          .getPublicUrl(fileName);

        after_image_url = urlData.publicUrl;
      }

      onUpdateStatus(report.id, 'resolved', { after_image_url });
      setAfterImage(null);
    } catch (error) {
      console.error('Error uploading evidence:', error);
      toast({
        title: "Upload Failed",
        description: "Could not upload evidence image. Status not updated.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const openNavigation = () => {
    // Universal Google Maps URL works on Android, iOS, and Web
    const url = `https://www.google.com/maps/dir/?api=1&destination=${report.latitude},${report.longitude}&travelmode=driving`;
    window.open(url, '_blank');
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md z-50 animate-slide-in-right">
        <div className="h-full glass-panel rounded-l-2xl overflow-hidden flex flex-col shadow-2xl shadow-black/50">
          {/* Header */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <div>
              <h2 className="font-medium text-foreground/90 tracking-wide">Report Details</h2>
              <p className="text-xs text-foreground/50 font-light font-mono">{report.id.slice(0, 8)}...</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl hover:bg-white/10">
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto">
            {/* Map & Route Visualization */}
            <div className="relative h-48 w-full bg-secondary/5 border-b border-white/10">
              <div ref={mapContainerRef} className="absolute inset-0 z-0 opacity-80" />
              <div className="absolute bottom-3 right-3 z-10">
                <Button
                  size="sm"
                  onClick={openNavigation}
                  className="rounded-full shadow-xl bg-blue-600 hover:bg-blue-700 text-white border-none"
                >
                  <Navigation className="w-3 h-3 mr-2" />
                  Start Navigation
                </Button>
              </div>
              {!adminLocation && (
                <div className="absolute top-3 left-3 z-10 bg-black/50 backdrop-blur text-white px-2 py-1 rounded-md text-[10px]">
                  Locating you...
                </div>
              )}
            </div>

            {/* Image Preview */}
            <div className="p-5 border-b border-white/10">
              <h4 className="text-xs font-medium text-foreground/50 mb-3">SITE PHOTO</h4>
              {report.before_image_url ? (
                <AspectRatio ratio={16 / 9} className="rounded-xl overflow-hidden bg-black/20 shadow-md">
                  <img
                    src={report.before_image_url}
                    alt="Report image"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                </AspectRatio>
              ) : (
                <AspectRatio ratio={16 / 9} className="rounded-xl overflow-hidden bg-white/5 flex items-center justify-center">
                  <div className="text-center">
                    <ImageIcon className="w-12 h-12 text-foreground/20 mx-auto mb-2" />
                    <p className="text-sm text-foreground/30">No image available</p>
                  </div>
                </AspectRatio>
              )}
            </div>

            {/* Category & Priority */}
            <div className="p-5 border-b border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <Tag className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-foreground/50 font-light">AI Detected Category</p>
                    <p className="font-medium text-foreground/90">
                      {categoryLabels[report.category] || report.category}
                    </p>
                  </div>
                </div>
                <Badge variant={priority.variant} className="text-xs">
                  {priority.label} Priority
                </Badge>
              </div>

              {/* AI Description */}
              {report.ai_description && (
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                  <p className="text-xs text-primary/70 mb-1 font-medium">AI Analysis</p>
                  <p className="text-sm text-foreground/70 font-light leading-relaxed">
                    {report.ai_description}
                  </p>
                </div>
              )}

              {/* Current Status */}
              <div className="flex items-center gap-3">
                <span className={`px-4 py-2 rounded-full text-sm font-light ${status.color}`}>
                  {status.label}
                </span>
              </div>
            </div>

            {/* Location Text */}
            <div className="p-5 border-b border-white/10">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary/20 to-blue-500/20 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-secondary" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-foreground/50 font-light mb-1">Issue Location</p>
                  <p className="text-sm text-foreground/80 font-light">{report.address || 'Address not available'}</p>
                  <p className="text-xs text-foreground/40 font-mono mt-2 flex items-center gap-1 cursor-pointer hover:text-primary transition-colors" onClick={openNavigation}>
                    <Navigation className="w-3 h-3" />
                    {report.latitude?.toFixed(6)}, {report.longitude?.toFixed(6)}
                    <span className="ml-1 text-primary">(Click to Navigate)</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Time Reported */}
            <div className="p-5 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-warning/20 to-orange-500/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-xs text-foreground/50 font-light">Time Reported</p>
                  <p className="text-sm text-foreground/80 font-light">{formatDate(report.created_at)}</p>
                </div>
              </div>
            </div>

            {/* Resolved Info (After Image & Feedback) */}
            {report.status === 'resolved' && (
              <div className="p-5 border-b border-white/10 space-y-5">
                {report.after_image_url && (
                  <div className="space-y-2">
                    <p className="text-xs text-success font-medium">Resolution Evidence</p>
                    <AspectRatio ratio={16 / 9} className="rounded-xl overflow-hidden bg-black/20">
                      <img
                        src={report.after_image_url}
                        alt="Resolution evidence"
                        className="w-full h-full object-cover"
                      />
                    </AspectRatio>
                  </div>
                )}

                {report.citizen_verified !== undefined && report.citizen_verified !== null && (
                  <div className={`p-4 rounded-xl border ${report.citizen_verified ? 'bg-success/5 border-success/20' : 'bg-destructive/5 border-destructive/20'
                    }`}>
                    <div className="flex items-center gap-2 mb-2">
                      {report.citizen_verified ? (
                        <ThumbsUp className="w-4 h-4 text-success" />
                      ) : (
                        <ThumbsDown className="w-4 h-4 text-destructive" />
                      )}
                      <p className={`text-sm font-medium ${report.citizen_verified ? 'text-success' : 'text-destructive'}`}>
                        Citizen {report.citizen_verified ? 'Verified' : 'Contested'}
                      </p>
                    </div>
                    {report.citizen_feedback && (
                      <div className="flex gap-2">
                        <MessageSquare className="w-3 h-3 text-foreground/30 mt-1 shrink-0" />
                        <p className="text-xs text-foreground/60 italic font-light leading-relaxed">
                          "{report.citizen_feedback}"
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons - Fixed at bottom */}
          <div className="p-5 border-t border-white/10 space-y-3 bg-background/50 backdrop-blur-xl">
            {report.status === 'pending' && (
              <>
                <Button
                  onClick={() => onUpdateStatus(report.id, 'in_progress')}
                  className="w-full rounded-xl bg-gradient-to-r from-secondary to-blue-500 hover:shadow-lg hover:shadow-secondary/30 transition-all"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Assign & Navigate
                </Button>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => onUpdateStatus(report.id, 'in_progress')}
                    variant="outline"
                    className="w-full rounded-xl"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start
                  </Button>
                  <Button
                    onClick={openNavigation}
                    variant="secondary"
                    className="w-full rounded-xl bg-blue-600/10 text-blue-600 hover:bg-blue-600/20 border border-blue-600/20"
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    Map
                  </Button>
                </div>
              </>
            )}

            {report.status === 'in_progress' && (
              <div className="space-y-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleAfterImageUpload}
                />

                {!afterImage ? (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-32 rounded-2xl border-2 border-dashed border-white/10 hover:border-success/30 hover:bg-success/5 transition-all flex flex-col items-center justify-center gap-2 group"
                  >
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-success/10 transition-colors">
                      <Plus className="w-5 h-5 text-foreground/40 group-hover:text-success" />
                    </div>
                    <span className="text-xs text-foreground/40 font-light group-hover:text-success/70">
                      Upload Proof of Resolution (optional)
                    </span>
                  </button>
                ) : (
                  <div className="relative rounded-2xl overflow-hidden group">
                    <AspectRatio ratio={16 / 9}>
                      <img
                        src={URL.createObjectURL(afterImage)}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </AspectRatio>
                    <button
                      onClick={() => setAfterImage(null)}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 backdrop-blur-md rounded-lg text-white hover:bg-black/80 transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                      <p className="text-[10px] text-white/80 text-center font-light">Ready to upload</p>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleResolve}
                  disabled={isUploading}
                  className="w-full rounded-xl bg-gradient-to-r from-success to-emerald-500 hover:shadow-lg hover:shadow-success/30 transition-all font-light"
                >
                  {isUploading ? (
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  )}
                  {isUploading ? "Uploading Evidence..." : "Mark Resolved"}
                </Button>
              </div>
            )}

            {report.status === 'resolved' && (
              <div className="text-center py-4">
                <CheckCircle className="w-12 h-12 text-success mx-auto mb-2" />
                <p className="text-sm text-success font-medium">Issue Resolved</p>
                <p className="text-xs text-foreground/50 font-light">This report has been closed</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ReportDetailPanel;
