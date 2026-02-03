import { useState, useEffect, useRef } from "react";
import { ArrowLeft, MapPin, Filter, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";
import {
  createStatusIcon,
  createClusterIcon,
  PUNE_CENTER,
  DEFAULT_ZOOM,
  TILE_LAYER_URL,
  TILE_LAYER_ATTRIBUTION,
  mapStyles,
} from "@/components/map/mapUtils";

interface IssuesMapProps {
  onBack: () => void;
}

const statusIcons = {
  pending: createStatusIcon("pending"),
  progress: createStatusIcon("in_progress"),
  resolved: createStatusIcon("resolved"),
};

// Mock data - Pune area reports
const mockReports = [
  { id: "AUR-00847", location: "FC Road, Shivajinagar", type: "Street Friction", status: "pending", date: "Today, 10:30 AM", lat: 18.5285, lng: 73.8410, severity: "high" },
  { id: "AUR-00832", location: "Koregaon Park", type: "Construction Residue", status: "progress", date: "Yesterday", lat: 18.5362, lng: 73.8939, severity: "medium" },
  { id: "AUR-00798", location: "Kothrud, Paud Road", type: "Organic Matter", status: "resolved", date: "2 days ago", lat: 18.5074, lng: 73.8077, severity: "low" },
  { id: "AUR-00815", location: "Viman Nagar", type: "Street Friction", status: "pending", date: "Today, 8:15 AM", lat: 18.5679, lng: 73.9143, severity: "high" },
  { id: "AUR-00820", location: "Hinjewadi Phase 1", type: "Construction Residue", status: "progress", date: "Yesterday", lat: 18.5912, lng: 73.7380, severity: "medium" },
  { id: "AUR-00788", location: "Aundh, ITI Road", type: "Organic Matter", status: "resolved", date: "3 days ago", lat: 18.5590, lng: 73.8077, severity: "low" },
  { id: "AUR-00795", location: "Hadapsar, Magarpatta", type: "Street Friction", status: "pending", date: "Today, 9:00 AM", lat: 18.5089, lng: 73.9260, severity: "high" },
  { id: "AUR-00810", location: "Baner Road", type: "Construction Residue", status: "progress", date: "2 days ago", lat: 18.5590, lng: 73.7868, severity: "medium" },
  { id: "AUR-00778", location: "Kalyani Nagar", type: "Street Friction", status: "resolved", date: "4 days ago", lat: 18.5463, lng: 73.9020, severity: "high" },
  { id: "AUR-00825", location: "Sinhagad Road", type: "Organic Matter", status: "pending", date: "Today, 7:45 AM", lat: 18.4818, lng: 73.8223, severity: "low" },
  { id: "AUR-00830", location: "Wakad", type: "Construction Residue", status: "progress", date: "Yesterday", lat: 18.5998, lng: 73.7603, severity: "medium" },
  { id: "AUR-00785", location: "Camp, MG Road", type: "Street Friction", status: "resolved", date: "5 days ago", lat: 18.5167, lng: 73.8803, severity: "high" },
];

type StatusFilter = "all" | "pending" | "progress" | "resolved";

export const IssuesMap = ({ onBack }: IssuesMapProps) => {
  const [filter, setFilter] = useState<StatusFilter>("all");
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);

  const filteredReports = filter === "all" 
    ? mockReports 
    : mockReports.filter(r => r.status === filter);

  const statusCounts = {
    all: mockReports.length,
    pending: mockReports.filter(r => r.status === "pending").length,
    progress: mockReports.filter(r => r.status === "progress").length,
    resolved: mockReports.filter(r => r.status === "resolved").length,
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current).setView(PUNE_CENTER, DEFAULT_ZOOM);
    
    L.tileLayer(TILE_LAYER_URL, {
      attribution: TILE_LAYER_ATTRIBUTION,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update markers when filter changes
  useEffect(() => {
    if (!mapRef.current) return;

    if (clusterGroupRef.current) {
      mapRef.current.removeLayer(clusterGroupRef.current);
    }

    const markers = L.markerClusterGroup({
      chunkedLoading: true,
      iconCreateFunction: (cluster) => createClusterIcon(cluster.getChildCount()),
    });

    filteredReports.forEach((report) => {
      const marker = L.marker([report.lat, report.lng], {
        icon: statusIcons[report.status as keyof typeof statusIcons],
      });
      
      const popupContent = `
        <div style="min-width: 200px; padding: 8px; font-family: 'Plus Jakarta Sans', sans-serif;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <span style="font-family: monospace; font-size: 11px; color: hsl(0, 0%, 45%);">${report.id}</span>
            <span style="
              background: linear-gradient(135deg, ${report.status === 'pending' ? 'hsl(38, 92%, 50%), hsl(25, 95%, 53%)' : report.status === 'progress' ? 'hsl(199, 89%, 48%), hsl(217, 91%, 60%)' : 'hsl(152, 76%, 36%), hsl(160, 84%, 39%)'});
              color: white;
              padding: 4px 12px;
              border-radius: 9999px;
              font-size: 10px;
              font-weight: 400;
            ">${report.status === 'progress' ? 'In Flow' : report.status === 'pending' ? 'Awaiting' : 'Restored'}</span>
          </div>
          <h3 style="font-weight: 500; font-size: 15px; margin-bottom: 6px; color: hsl(0, 0%, 20%);">${report.type}</h3>
          <div style="display: flex; align-items: center; gap: 6px; color: hsl(0, 0%, 45%); font-size: 12px; margin-bottom: 10px;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            ${report.location}
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px; padding-top: 8px; border-top: 1px solid hsl(0, 0%, 90%);">
            <span style="color: hsl(0, 0%, 55%);">${report.date}</span>
            <span style="
              background: ${report.severity === 'high' ? 'hsl(0, 84%, 60%, 0.1)' : report.severity === 'medium' ? 'hsl(38, 92%, 50%, 0.1)' : 'hsl(152, 76%, 36%, 0.1)'};
              color: ${report.severity === 'high' ? 'hsl(0, 84%, 60%)' : report.severity === 'medium' ? 'hsl(38, 92%, 50%)' : 'hsl(152, 76%, 36%)'};
              padding: 3px 10px;
              border-radius: 8px;
              font-weight: 500;
            ">${report.severity}</span>
          </div>
        </div>
      `;
      
      marker.bindPopup(popupContent, {
        className: 'aura-popup',
      });
      markers.addLayer(marker);
    });

    mapRef.current.addLayer(markers);
    clusterGroupRef.current = markers;

  }, [filteredReports]);

  const filterLabels = {
    all: "All Ripples",
    pending: "Awaiting",
    progress: "In Flow",
    resolved: "Restored"
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gradient-to-b from-background to-primary/5">
      {/* Header */}
      <div className="relative p-4 z-[1001]">
        <div className="glass-panel rounded-2xl px-5 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-xl hover:bg-white/10">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h2 className="font-medium text-foreground/80 tracking-wide">City Flow Map</h2>
            <p className="text-sm text-foreground/50 font-light">{filteredReports.length} ripples in Pune</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full glass-card">
            <Sparkles className="w-4 h-4 text-primary animate-pulse-glow" />
            <span className="text-sm font-light text-foreground/60">Live</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="relative px-4 pb-4 z-[1001]">
        <div className="glass-card rounded-2xl p-3 flex items-center gap-3 overflow-x-auto">
          <Filter className="w-4 h-4 text-foreground/40 shrink-0 ml-2" />
          {(["all", "pending", "progress", "resolved"] as StatusFilter[]).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`shrink-0 px-4 py-2 rounded-xl text-sm font-light transition-all duration-300 ${
                filter === status
                  ? 'bg-gradient-to-r from-primary/80 to-secondary/80 text-white shadow-lg shadow-primary/20'
                  : 'glass-card hover:bg-white/10 text-foreground/60'
              }`}
            >
              {filterLabels[status]}
              <span className={`ml-2 ${filter === status ? 'text-white/70' : 'text-foreground/40'}`}>
                ({statusCounts[status]})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        <div ref={mapContainerRef} className="h-full w-full" />

        {/* Legend */}
        <div className="absolute bottom-6 left-4 bg-background/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 z-[1000] shadow-xl">
          <h4 className="text-xs font-medium text-foreground/70 mb-3 tracking-wide">Status Legend</h4>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-warning to-orange-500 shadow-lg shadow-warning/40" />
              <span className="text-foreground/70 font-light">Awaiting</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-secondary to-blue-500 shadow-lg shadow-secondary/40" />
              <span className="text-foreground/70 font-light">In Flow</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-success to-emerald-500 shadow-lg shadow-success/40" />
              <span className="text-foreground/70 font-light">Restored</span>
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 z-[1000] shadow-xl min-w-[180px]">
          <h4 className="text-xs font-medium text-foreground/70 mb-3 tracking-wide">Overview</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 rounded-xl bg-warning/10 border border-warning/20">
              <div className="text-2xl font-light text-warning">{statusCounts.pending}</div>
              <div className="text-xs text-foreground/50 font-light mt-1">Awaiting</div>
            </div>
            <div className="text-center p-3 rounded-xl bg-secondary/10 border border-secondary/20">
              <div className="text-2xl font-light text-secondary">{statusCounts.progress}</div>
              <div className="text-xs text-foreground/50 font-light mt-1">In Flow</div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom popup styles */}
      <style>{mapStyles}</style>
    </div>
  );
};

export default IssuesMap;
