import L from "leaflet";

// Shared marker icons with organic styling
export const createStatusIcon = (status: string) => {
  const colors = {
    pending: { color: "hsl(38, 92%, 50%)", glow: "hsl(25, 95%, 53%)" },
    in_progress: { color: "hsl(199, 89%, 48%)", glow: "hsl(217, 91%, 60%)" },
    resolved: { color: "hsl(152, 76%, 36%)", glow: "hsl(160, 84%, 39%)" },
  };

  const { color, glow } = colors[status as keyof typeof colors] || colors.pending;

  return L.divIcon({
    className: "custom-marker",
    html: `<div style="
      background: linear-gradient(135deg, ${color}, ${glow});
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 3px solid rgba(255,255,255,0.9);
      box-shadow: 0 4px 20px ${color}40, 0 0 30px ${color}20;
      animation: breath 3s ease-in-out infinite;
    "></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
};

export const createPriorityIcon = (priority: string) => {
  const colors = {
    critical: { color: "hsl(0, 84%, 60%)", glow: "hsl(0, 84%, 50%)" },
    high: { color: "hsl(0, 84%, 60%)", glow: "hsl(0, 84%, 50%)" },
    medium: { color: "hsl(38, 92%, 50%)", glow: "hsl(25, 95%, 53%)" },
    low: { color: "hsl(48, 96%, 53%)", glow: "hsl(45, 93%, 47%)" },
  };

  const { color, glow } = colors[priority as keyof typeof colors] || colors.low;

  return L.divIcon({
    className: "custom-marker",
    html: `<div style="
      background: linear-gradient(135deg, ${color}, ${glow});
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 3px solid rgba(255,255,255,0.9);
      box-shadow: 0 4px 20px ${color}40, 0 0 30px ${color}20;
      animation: breath 3s ease-in-out infinite;
    "></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
};

export const selectedMarkerIcon = L.divIcon({
  className: "custom-marker-selected",
  html: `<div style="
    background: linear-gradient(135deg, hsl(152, 76%, 36%), hsl(199, 89%, 48%));
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 4px solid white;
    box-shadow: 0 4px 30px hsl(152, 76%, 36%, 0.6), 0 0 50px hsl(152, 76%, 36%, 0.4);
    animation: pulse-selected 1.5s ease-in-out infinite;
  "></div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -18],
});

export const createClusterIcon = (count: number) => {
  let size = 44;
  if (count > 10) size = 54;
  if (count > 25) size = 64;

  return L.divIcon({
    html: `<div style="
      background: linear-gradient(135deg, hsl(152, 76%, 36%), hsl(199, 89%, 48%));
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 400;
      font-size: ${size / 2.5}px;
      border: 3px solid rgba(255,255,255,0.9);
      box-shadow: 0 4px 20px rgba(0,0,0,0.15), 0 0 40px hsl(152, 76%, 36%, 0.2);
      font-family: 'Plus Jakarta Sans', sans-serif;
    ">${count}</div>`,
    className: "custom-cluster-icon",
    iconSize: L.point(size, size),
  });
};

// Pune center coordinates
export const PUNE_CENTER: [number, number] = [18.5204, 73.8567];
export const DEFAULT_ZOOM = 12;

// Light tile layer (matches public map)
export const TILE_LAYER_URL = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
export const TILE_LAYER_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

// Shared map styles
export const mapStyles = `
  @keyframes breath {
    0%, 100% { transform: scale(1); opacity: 0.9; }
    50% { transform: scale(1.05); opacity: 1; }
  }
  @keyframes pulse-selected {
    0%, 100% { transform: scale(1); box-shadow: 0 4px 30px hsl(152, 76%, 36%, 0.6); }
    50% { transform: scale(1.1); box-shadow: 0 4px 40px hsl(152, 76%, 36%, 0.8); }
  }
  .aura-popup .leaflet-popup-content-wrapper {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.5);
  }
  .aura-popup .leaflet-popup-tip {
    background: rgba(255, 255, 255, 0.95);
  }
`;
