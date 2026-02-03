import { useEffect, useRef } from "react";
import { MapPin, AlertTriangle, Sparkles } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";
import {
  createPriorityIcon,
  selectedMarkerIcon,
  createClusterIcon,
  PUNE_CENTER,
  DEFAULT_ZOOM,
  TILE_LAYER_URL,
  TILE_LAYER_ATTRIBUTION,
  mapStyles,
} from "@/components/map/mapUtils";

export interface MapReport {
  id: string;
  category: string;
  priority: string;
  status: string;
  address: string;
  latitude: number;
  longitude: number;
  created_at: string;
  before_image_url?: string;
  after_image_url?: string;
  ai_description?: string;
  citizen_verified?: boolean | null;
  citizen_feedback?: string | null;
}

interface AdminMapPanelProps {
  reports: MapReport[];
  selectedReportId: string | null;
  onSelectReport: (report: MapReport) => void;
  showHighPriorityOnly: boolean;
  onToggleHighPriority: (value: boolean) => void;
}

export const AdminMapPanel = ({
  reports,
  selectedReportId,
  onSelectReport,
  showHighPriorityOnly,
  onToggleHighPriority,
}: AdminMapPanelProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.MarkerClusterGroup | null>(null);
  const markerMapRef = useRef<Map<string, L.Marker>>(new Map());

  const activeReports = reports.filter(r => r.status !== 'resolved');
  const displayReports = showHighPriorityOnly
    ? activeReports.filter(r => r.priority === 'high' || r.priority === 'critical')
    : activeReports;

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
    }).setView(PUNE_CENTER, DEFAULT_ZOOM);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Use same light tile layer as public map for consistency
    L.tileLayer(TILE_LAYER_URL, {
      attribution: TILE_LAYER_ATTRIBUTION,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update markers when reports or filter changes
  useEffect(() => {
    if (!mapRef.current) return;

    if (markersRef.current) {
      mapRef.current.removeLayer(markersRef.current);
    }
    markerMapRef.current.clear();

    const clusterGroup = L.markerClusterGroup({
      chunkedLoading: true,
      iconCreateFunction: (cluster) => createClusterIcon(cluster.getChildCount()),
    });

    displayReports.forEach((report) => {
      if (!report.latitude || !report.longitude) return;

      const isSelected = report.id === selectedReportId;
      const marker = L.marker([report.latitude, report.longitude], {
        icon: isSelected ? selectedMarkerIcon : createPriorityIcon(report.priority),
      });

      marker.on('click', () => onSelectReport(report));
      clusterGroup.addLayer(marker);
      markerMapRef.current.set(report.id, marker);
    });

    mapRef.current.addLayer(clusterGroup);
    markersRef.current = clusterGroup;
  }, [displayReports, selectedReportId, onSelectReport]);

  // Zoom to selected report
  useEffect(() => {
    if (!mapRef.current || !selectedReportId) return;

    const selectedReport = reports.find(r => r.id === selectedReportId);
    if (selectedReport?.latitude && selectedReport?.longitude) {
      mapRef.current.flyTo([selectedReport.latitude, selectedReport.longitude], 16, {
        duration: 0.8,
      });

      const marker = markerMapRef.current.get(selectedReportId);
      if (marker) {
        marker.setIcon(selectedMarkerIcon);
      }
    }
  }, [selectedReportId, reports]);

  return (
    <div className="h-full flex flex-col glass-panel rounded-2xl overflow-hidden">
      {/* Map Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary/20 to-primary/20 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <h3 className="font-medium text-foreground/90 tracking-wide">Live City Issue Map</h3>
            <p className="text-xs text-foreground/50 font-light">{displayReports.length} active issues</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-card">
            <Sparkles className="w-3 h-3 text-success animate-pulse" />
            <span className="text-xs font-light text-foreground/60">Live</span>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        <div ref={mapContainerRef} className="h-full w-full" />

        {/* Legend Overlay */}
        <div className="absolute top-4 left-4 glass-panel rounded-xl p-3 z-[1000]">
          <h4 className="text-xs font-medium text-foreground/60 mb-2">Priority</h4>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-full bg-destructive shadow-lg shadow-destructive/30" />
              <span className="text-foreground/60 font-light">High/Critical</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-full bg-warning shadow-lg shadow-warning/30" />
              <span className="text-foreground/60 font-light">Medium</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-full bg-amber-400 shadow-lg shadow-amber-400/30" />
              <span className="text-foreground/60 font-light">Low</span>
            </div>
          </div>
        </div>

        {/* Filter Toggle */}
        <div className="absolute top-4 right-4 glass-panel rounded-xl p-3 z-[1000]">
          <div className="flex items-center gap-2">
            <Switch
              id="high-priority-filter"
              checked={showHighPriorityOnly}
              onCheckedChange={onToggleHighPriority}
            />
            <Label htmlFor="high-priority-filter" className="text-xs text-foreground/60 font-light cursor-pointer">
              High Priority Only
            </Label>
          </div>
        </div>

        {/* Active Issues Counter */}
        <div className="absolute bottom-4 left-4 glass-panel rounded-xl px-4 py-2 z-[1000]">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-warning" />
            <span className="text-sm font-medium text-foreground/80">
              {activeReports.filter(r => r.priority === 'high' || r.priority === 'critical').length}
            </span>
            <span className="text-xs text-foreground/50 font-light">critical issues</span>
          </div>
        </div>
      </div>

      {/* Custom styles */}
      <style>{mapStyles}</style>
    </div>
  );
};

export default AdminMapPanel;
