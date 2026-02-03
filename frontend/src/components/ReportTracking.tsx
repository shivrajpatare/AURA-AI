import { useState, useEffect, useRef } from "react";
import { ArrowLeft, MapPin, Clock, CheckCircle, AlertCircle, Truck, MessageSquare, ChevronRight, Sparkles, RefreshCw, ThumbsUp, ThumbsDown, List, Map as MapIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { reportService, Report } from "@/services/reportService";

interface ReportTrackingProps {
  onBack: () => void;
}

const categoryLabels: Record<string, string> = {
  garbage_dump: "Garbage Dump",
  dustbin_not_cleaned: "Dustbin Not Cleaned",
  burning_garbage: "Burning Garbage",
  open_manhole: "Open Manhole/Drain",
  stagnant_water: "Stagnant Water",
  dead_animal: "Dead Animal",
  sewage_overflow: "Sewage Overflow",
  sweeping_not_done: "Sweeping Not Done",
  other: "Other Issue",
};

export const ReportTracking = ({ onBack }: ReportTrackingProps) => {
  /*
     ReportTracking Component
     - Handles authentication check
     - Fetches user reports OR searches by Report ID
     - Displays list of reports
     - Shows detailed view with embedded map
  */

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [searchId, setSearchId] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  // Refs for maps
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  const detailMapContainer = useRef<HTMLDivElement>(null);
  const detailMapInstance = useRef<L.Map | null>(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        const data = await reportService.getUserReports(session.user.id);
        setReports(data);
      } else {
        // Not logged in: Do nothing
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast({
        title: "Error",
        description: "Could not load reports",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const searchReportById = async () => {
    if (!searchId.trim()) return;
    setLoading(true);
    try {
      const data = await reportService.getReportById(searchId.trim());

      if (data) {
        setReports([data]); // Show as list of 1
        setSelectedReport(data); // Auto-open detail
      } else {
        toast({ title: "Not Found", description: "Report ID not found", variant: "destructive" });
      }
    } catch (err) {
      console.error("Search error", err);
      toast({ title: "Error", description: "Could not find report", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Main Map Effect (for List View)
  useEffect(() => {
    if (viewMode === "map" && !selectedReport && mapContainer.current && !mapInstance.current) {
      mapInstance.current = L.map(mapContainer.current).setView([18.5204, 73.8567], 13);

      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; OpenStreetMap &copy; CARTO'
      }).addTo(mapInstance.current);

      const markers = L.layerGroup().addTo(mapInstance.current);

      return () => {
        // Cleanup handled by ref check or separate effect if needed
      };
    }
  }, [viewMode, selectedReport]);

  // Update Markers for Main Map
  useEffect(() => {
    if (viewMode === "map" && !selectedReport && mapInstance.current) {
      // Clear layers
      mapInstance.current.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          mapInstance.current?.removeLayer(layer);
        }
      });

      const bounds = L.latLngBounds([]);

      reports.forEach(report => {
        const color = report.status === 'resolved' ? '#10b981' : report.status === 'in_progress' ? '#3b82f6' : '#f59e0b';
        const icon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        });

        const marker = L.marker([report.latitude, report.longitude], { icon })
          .addTo(mapInstance.current!)
          .bindPopup(`${categoryLabels[report.category] || report.category}`);

        marker.on('click', () => setSelectedReport(report));
        bounds.extend([report.latitude, report.longitude]);
      });

      if (reports.length > 0) {
        mapInstance.current.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [reports, viewMode, selectedReport]);

  // Detail Map Effect
  useEffect(() => {
    if (selectedReport && detailMapContainer.current) {
      // Destroy existing if any (to prevent conflicts)
      if (detailMapInstance.current) {
        detailMapInstance.current.remove();
        detailMapInstance.current = null;
      }

      const map = L.map(detailMapContainer.current, {
        zoomControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        touchZoom: false
      }).setView([selectedReport.latitude, selectedReport.longitude], 15);

      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png").addTo(map);

      detailMapInstance.current = map;

      const color = selectedReport.status === 'resolved' ? '#10b981' : selectedReport.status === 'in_progress' ? '#3b82f6' : '#f59e0b';
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3); animation: pulse 2s infinite;"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      L.marker([selectedReport.latitude, selectedReport.longitude], { icon }).addTo(map);

      return () => {
        map.remove();
        detailMapInstance.current = null;
      };
    }
  }, [selectedReport]);


  const handleFeedback = async (reportId: string, verified: boolean) => {
    try {
      const { error } = await supabase.rpc('submit_report_feedback', {
        report_id: reportId,
        verified: verified,
        feedback: feedbackText || null
      });

      if (error) throw error;

      toast({
        title: "Feedback Submitted",
        description: verified ? "Thank you for confirming!" : "We'll follow up on this.",
      });

      fetchReports();
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-warning/10 border border-warning/20">
            <span className="w-2 h-2 rounded-full bg-warning animate-pulse" />
            <span className="text-sm text-warning font-medium">Pending</span>
          </span>
        );
      case "in_progress":
        return (
          <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            <span className="text-sm text-secondary font-medium">In Progress</span>
          </span>
        );
      case "resolved":
        return (
          <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/20">
            <span className="w-2 h-2 rounded-full bg-success" />
            <span className="text-sm text-success font-medium">Resolved</span>
          </span>
        );
      default:
        return null;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <AlertCircle className="w-6 h-6 text-warning" />;
      case "in_progress": return <Truck className="w-6 h-6 text-secondary" />;
      case "resolved": return <CheckCircle className="w-6 h-6 text-success" />;
      default: return <Clock className="w-6 h-6 text-foreground/40" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const config: Record<string, { label: string; className: string }> = {
      low: { label: "Low", className: "bg-success/10 text-success" },
      medium: { label: "Medium", className: "bg-warning/10 text-warning" },
      high: { label: "High", className: "bg-destructive/10 text-destructive" },
      critical: { label: "Critical", className: "bg-destructive/20 text-destructive" },
    };
    const p = config[priority] || config.medium;
    return <span className={`px-3 py-1 rounded-full text-xs font-medium ${p.className}`}>{p.label}</span>;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (selectedReport) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-sm overflow-y-auto animate-in slide-in-from-right duration-300">
        <div className="sticky top-0 z-10 p-4 bg-background/80 backdrop-blur-md border-b border-white/5">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setSelectedReport(null)} className="rounded-full hover:bg-white/10">
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div className="flex-1">
              <h2 className="font-semibold text-lg">Report Details</h2>
              <p className="text-xs text-muted-foreground font-mono">ID: {selectedReport.id.slice(0, 8)}...</p>
            </div>
            {getStatusBadge(selectedReport.status)}
          </div>
        </div>

        <div className="max-w-2xl mx-auto w-full p-4 space-y-6 pb-20">
          {/* Detail Map */}
          <div className="rounded-2xl overflow-hidden border border-white/10 h-48 relative shadow-lg">
            <div ref={detailMapContainer} className="w-full h-full" />
            <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur px-2 py-1 rounded text-xs text-muted-foreground pointer-events-none z-[400]">
              {selectedReport.latitude.toFixed(4)}, {selectedReport.longitude.toFixed(4)}
            </div>
          </div>

          {/* Info Card */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-medium text-foreground">{categoryLabels[selectedReport.category] || selectedReport.category}</h3>
                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {selectedReport.address}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              {getPriorityBadge(selectedReport.priority)}
            </div>

            {selectedReport.ai_description && (
              <div className="bg-white/5 p-3 rounded-xl text-sm text-foreground/80 leading-relaxed border border-white/5">
                <Sparkles className="w-3 h-3 text-primary inline mr-2" />
                {selectedReport.ai_description}
              </div>
            )}
          </div>

          {/* Evidence Images */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <span className="text-sm text-muted-foreground ml-1">Reported Issue</span>
              <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/20 aspect-video">
                <img src={selectedReport.before_image_url} alt="Before" className="w-full h-full object-cover" />
              </div>
            </div>
            {selectedReport.status === 'resolved' && selectedReport.after_image_url && (
              <div className="space-y-2 animate-fade-in">
                <span className="text-sm text-success ml-1">Resolution</span>
                <div className="rounded-2xl overflow-hidden border border-success/20 bg-success/5 aspect-video relative">
                  <img src={selectedReport.after_image_url} alt="After" className="w-full h-full object-cover" />
                  <div className="absolute bottom-2 right-2 bg-success text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Verified
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="glass-panel p-6 rounded-2xl">
            <h4 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">Updates</h4>
            <div className="relative pl-6 space-y-8 border-l border-white/10 ml-2">

              {/* Step 1: Submitted */}
              <div className="relative">
                <span className="absolute -left-[31px] w-4 h-4 rounded-full bg-primary border-4 border-background" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Issue Reported</span>
                  <span className="text-xs text-muted-foreground">{formatDate(selectedReport.created_at)}</span>
                </div>
              </div>

              {/* Step 2: In Progress */}
              {selectedReport.status !== 'pending' && (
                <div className="relative animate-fade-in">
                  <span className={`absolute -left-[31px] w-4 h-4 rounded-full border-4 border-background ${selectedReport.status === 'in_progress' ? 'bg-secondary animate-pulse' : 'bg-primary'}`} />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Processing</span>
                    <span className="text-xs text-muted-foreground">Team assigned</span>
                  </div>
                </div>
              )}

              {/* Step 3: Resolved */}
              {selectedReport.status === 'resolved' && (
                <div className="relative animate-fade-in">
                  <span className="absolute -left-[31px] w-4 h-4 rounded-full bg-success border-4 border-background" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-success">Resolved</span>
                    <span className="text-xs text-muted-foreground">{selectedReport.resolved_at ? formatDate(selectedReport.resolved_at) : 'Completed'}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Resolved Interaction */}
          {selectedReport.status === 'resolved' && selectedReport.citizen_verified === null && (
            <div className="glass-panel p-6 rounded-2xl space-y-4 border border-primary/20 bg-primary/5">
              <h4 className="font-medium">Confirm Resolution</h4>
              <p className="text-sm text-muted-foreground">Does the "After" image look correct?</p>
              <div className="flex gap-3">
                <Button onClick={() => handleFeedback(selectedReport.id, true)} className="flex-1 bg-success hover:bg-success/90">
                  <ThumbsUp className="w-4 h-4 mr-2" /> RESTORED
                </Button>
                <Button onClick={() => handleFeedback(selectedReport.id, false)} variant="outline" className="flex-1 border-destructive text-destructive hover:bg-destructive/10">
                  <ThumbsDown className="w-4 h-4 mr-2" /> NOT FIXED
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gradient-to-br from-background via-background to-secondary/5">
      {/* Header */}
      <div className="relative z-10 p-4 border-b border-white/5 bg-background/50 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto w-full flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-xl font-semibold tracking-tight">Track Reports</h1>
            </div>

            <div className="flex bg-white/5 rounded-lg p-1">
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-md px-3"
              >
                <List className="w-4 h-4 mr-2" /> List
              </Button>
              <Button
                variant={viewMode === 'map' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('map')}
                className="rounded-md px-3"
              >
                <MapIcon className="w-4 h-4 mr-2" /> Map
              </Button>
            </div>
          </div>

          {/* Search Bar for Unauthenticated Users (or specific lookup) */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter Report ID to track specific issue..."
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none placeholder:text-muted-foreground"
            />
            <Button onClick={searchReportById} disabled={!searchId} variant="secondary" className="rounded-xl">
              Track
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden relative">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <p className="text-sm text-muted-foreground animate-pulse">Locating reports...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center max-w-md mx-auto">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
              <Sparkles className="w-10 h-10 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No Reports Found</h3>
            <p className="text-muted-foreground mb-6">
              We couldn't find any reports linked to your account. If you reported anonymously, enter the <b>Report ID</b> above.
            </p>
          </div>
        ) : (
          <>
            {viewMode === 'list' ? (
              <div className="h-full overflow-y-auto p-4 max-w-4xl mx-auto w-full space-y-3 pb-20">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    onClick={() => setSelectedReport(report)}
                    className="group flex gap-4 p-4 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
                  >
                    <div className="w-20 h-20 rounded-xl bg-black/20 overflow-hidden shrink-0 border border-white/5">
                      <img src={report.before_image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium text-foreground truncate pr-2">{categoryLabels[report.category] || report.category}</h3>
                          {getStatusBadge(report.status)}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 truncate">{report.address}</p>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">{formatDate(report.created_at)}</span>
                        <span className="text-xs font-mono text-primary/50 group-hover:text-primary transition-colors">View Details →</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div ref={mapContainer} className="w-full h-full bg-secondary/5" />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ReportTracking;
