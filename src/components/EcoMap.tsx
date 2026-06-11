import { useEffect, useRef } from "react";

export interface MapPoint {
  id: string;
  lat: number;
  lng: number;
  title: string;
  category: string;
  severity: string;
  status: string;
  location_name: string;
}

const SEVERITY_COLOR: Record<string, string> = {
  low: "#16a34a",
  medium: "#eab308",
  high: "#f97316",
  critical: "#dc2626",
};

const SEVERITY_LABEL: Record<string, { kk: string; ru: string }> = {
  low: { kk: "Төмен", ru: "Низкая" },
  medium: { kk: "Орташа", ru: "Средняя" },
  high: { kk: "Жоғары", ru: "Высокая" },
  critical: { kk: "Аса қауіпті", ru: "Критическая" },
};

export function EcoMap({ points, height = 520, center = [43.85, 51.5], zoom = 8, lang = "kk" }: {
  points: MapPoint[];
  height?: number;
  center?: [number, number];
  zoom?: number;
  lang?: "kk" | "ru";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const layerRef = useRef<any>(null);

  useEffect(() => {
    let canceled = false;
    (async () => {
      if (!ref.current) return;
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");
      if (canceled || !ref.current) return;
      if (!mapRef.current) {
        mapRef.current = L.map(ref.current, { scrollWheelZoom: false }).setView(center, zoom);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap",
          maxZoom: 18,
        }).addTo(mapRef.current);
      }
      if (layerRef.current) {
        layerRef.current.clearLayers();
      } else {
        layerRef.current = L.layerGroup().addTo(mapRef.current);
      }
      points.forEach((p) => {
        const color = SEVERITY_COLOR[p.severity] ?? "#64748b";
        const marker = L.circleMarker([p.lat, p.lng], {
          radius: p.severity === "critical" ? 12 : p.severity === "high" ? 10 : 8,
          color: "#fff",
          weight: 2,
          fillColor: color,
          fillOpacity: 0.95,
        }).bindPopup(
          `<div style="font-family:Inter,sans-serif;min-width:200px">
            <div style="font-weight:700;margin-bottom:4px">${escapeHtml(p.title)}</div>
            <div style="font-size:12px;color:#64748b;margin-bottom:6px">${escapeHtml(p.location_name)}</div>
            <div style="display:flex;gap:4px;flex-wrap:wrap">
              <span style="background:${color};color:#fff;font-size:10px;padding:2px 6px;border-radius:999px;font-weight:600">${escapeHtml((SEVERITY_LABEL[p.severity] ?? SEVERITY_LABEL.low)[lang]).toUpperCase()}</span>
              <span style="background:#f1f5f9;color:#475569;font-size:10px;padding:2px 6px;border-radius:999px;font-weight:600">${escapeHtml(p.status)}</span>
            </div>
          </div>`
        );
        layerRef.current.addLayer(marker);
      });
    })();
    return () => {
      canceled = true;
    };
  }, [points, center, zoom]);

  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        layerRef.current = null;
      }
    };
  }, []);

  return <div ref={ref} style={{ height, width: "100%" }} className="rounded-3xl overflow-hidden border border-foreground/10 bg-secondary" />;
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
}