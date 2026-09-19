import { useEffect, useRef, useCallback } from 'react';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapNode, MapEdge, DangerZone, Hospital, RescueUnit,
  STATUS_COLORS, findRoute
} from './types';

interface MapViewProps {
  nodes: MapNode[];
  edges: MapEdge[];
  dangerZones: DangerZone[];
  hospitals: Hospital[];
  units: RescueUnit[];
  activePath: string[];
  isAdmin?: boolean;
  onNodeClick?: (nodeId: string) => void;
}

const NODE_COLORS: Record<string, string> = {
  COMMAND: '#00e5ff', HOSPITAL: '#adc6ff', SAFE_ZONE: '#3ce36a',
  FIRE_STATION: '#FF9F00', POLICE: '#7c83fd', INTERSECTION: '#849396',
};
const DANGER_COLORS: Record<string, string> = {
  earthquake: '#FF4444', bombing: '#FF4444', fire: '#FF9F00',
  flood: '#5b9bd5', medical: '#adc6ff', accident: '#FF9F00',
  chemical: '#c084fc', other: '#FF4444',
};

export default function MapView({ nodes, edges, dangerZones, hospitals, units, activePath, isAdmin, onNodeClick }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layersRef = useRef<L.Layer[]>([]);

  const clearLayers = useCallback(() => {
    if (!mapRef.current) return;
    layersRef.current.forEach(l => { try { mapRef.current!.removeLayer(l); } catch {} });
    layersRef.current = [];
  }, []);

  const addLayer = useCallback((layer: L.Layer) => {
    if (!mapRef.current) return;
    layer.addTo(mapRef.current);
    layersRef.current.push(layer);
  }, []);

  // ── Draw all map layers ──
  const drawAll = useCallback(() => {
    if (!mapRef.current) return;
    clearLayers();

    // 1. Danger zones (large red circles with pulse)
    dangerZones.forEach(dz => {
      const color = DANGER_COLORS[dz.type] || '#FF4444';
      const circle = L.circle([dz.lat, dz.lon], {
        radius: dz.radius,
        color, fillColor: color,
        fillOpacity: 0.15, weight: 2, dashArray: '6,4',
        opacity: 0.8,
      });
      circle.bindPopup(`
        <div style="font-family:JetBrains Mono,monospace;padding:12px;min-width:180px;color:#dee2f5">
          <div style="color:#FF4444;font-weight:700;font-size:13px;margin-bottom:6px">⚠ DANGER ZONE</div>
          <div style="margin-bottom:3px"><b>Type:</b> ${dz.type.toUpperCase()}</div>
          <div style="margin-bottom:3px"><b>Severity:</b> <span style="color:${color}">${dz.severity}</span></div>
          <div style="margin-bottom:3px"><b>Info:</b> ${dz.description}</div>
          <div style="color:#849396;font-size:10px">Verified: ${dz.verifiedAt}</div>
        </div>
      `);
      addLayer(circle);

      // Inner pulse marker
      const icon = L.divIcon({
        html: `<div style="width:16px;height:16px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 0 12px ${color};animation:ping 1.5s ease-in-out infinite;"></div>`,
        className: '', iconSize: [16, 16], iconAnchor: [8, 8],
      });
      const marker = L.marker([dz.lat, dz.lon], { icon });
      addLayer(marker);
    });

    // 2. Edges
    edges.forEach(edge => {
      const f = nodes.find(n => n.id === edge.from);
      const t = nodes.find(n => n.id === edge.to);
      if (!f || !t) return;
      const inRoute = activePath.length >= 2 &&
        activePath.includes(edge.from) && activePath.includes(edge.to) &&
        Math.abs(activePath.indexOf(edge.from) - activePath.indexOf(edge.to)) === 1;

      const color = inRoute ? '#00e5ff'
        : edge.status === 'BLOCKED' ? '#FF4444'
        : edge.status === 'DANGEROUS' ? '#FF9F00'
        : '#3b494c';
      const poly = L.polyline([[f.lat, f.lon], [t.lat, t.lon]], {
        color, weight: inRoute ? 5 : 2,
        dashArray: edge.status === 'BLOCKED' ? '8,6' : edge.status === 'DANGEROUS' ? '5,4' : undefined,
        opacity: inRoute ? 1 : 0.5,
      });
      if (inRoute || isAdmin) {
        poly.bindTooltip(
          `${f.name.split(' ')[0]} → ${t.name.split(' ')[0]}  (${edge.distance} km · ${edge.status})`,
          { sticky: true, className: 'map-tip' }
        );
      }
      addLayer(poly);
    });

    // 3. Route start/end rings
    if (activePath.length >= 2) {
      [activePath[0], activePath[activePath.length - 1]].forEach((id, i) => {
        const nd = nodes.find(n => n.id === id);
        if (!nd) return;
        const ring = L.circleMarker([nd.lat, nd.lon], {
          radius: 18, fillColor: 'transparent',
          color: i === 0 ? '#3ce36a' : '#00e5ff',
          weight: 2.5, fillOpacity: 0, dashArray: '4,3',
        });
        addLayer(ring);
      });
    }

    // 4. Map nodes
    nodes.forEach(node => {
      const c = node.status === 'OPERATIONAL'
        ? (NODE_COLORS[node.type] || '#849396')
        : node.status === 'DAMAGED' ? '#FF9F00' : '#FF4444';
      const inRoute = activePath.includes(node.id);
      const circle = L.circleMarker([node.lat, node.lon], {
        radius: inRoute ? 13 : 9,
        fillColor: c, color: inRoute ? '#fff' : '#090e1b',
        weight: inRoute ? 3 : 1.5, fillOpacity: 0.9,
      });
      circle.bindPopup(`
        <div style="font-family:JetBrains Mono,monospace;padding:12px;min-width:170px;color:#dee2f5">
          <div style="color:${c};font-weight:700;font-size:12px;margin-bottom:6px">${node.name}</div>
          <div><b>Type:</b> ${node.type}</div>
          <div><b>Status:</b> <span style="color:${STATUS_COLORS[node.status] || '#849396'}">${node.status}</span></div>
          <div style="color:#849396;font-size:10px;margin-top:4px">${node.lat.toFixed(4)}°N, ${node.lon.toFixed(4)}°E</div>
        </div>
      `);
      if (onNodeClick) circle.on('click', () => onNodeClick(node.id));
      addLayer(circle);
    });

    // 5. Hospitals
    hospitals.forEach(h => {
      const c = h.status === 'NORMAL' ? '#adc6ff' : h.status === 'ALERT' ? '#FF9F00' : '#FF4444';
      const icon = L.divIcon({
        html: `<div style="background:${c}22;border:2px solid ${c};border-radius:6px;width:22px;height:22px;display:flex;align-items:center;justify-content:center;color:${c};font-weight:900;font-size:12px">H</div>`,
        className: '', iconSize: [22, 22], iconAnchor: [11, 11],
      });
      const m = L.marker([h.lat, h.lon], { icon });
      m.bindPopup(`
        <div style="font-family:JetBrains Mono,monospace;padding:12px;min-width:200px;color:#dee2f5">
          <div style="color:#adc6ff;font-weight:700;font-size:12px;margin-bottom:6px">🏥 ${h.name}</div>
          <div style="margin-bottom:3px">Available Beds: <span style="color:${h.availableBeds < 50 ? '#FF9F00' : '#3ce36a'}">${h.availableBeds}</span>/${h.totalBeds}</div>
          <div style="margin-bottom:3px">ICU Available: <span style="color:${h.icuAvailable < 5 ? '#FF4444' : '#3ce36a'}">${h.icuAvailable}</span>/${h.icuBeds}</div>
          <div>Status: <span style="color:${c}">${h.status}</span></div>
          ${h.alertMsg ? `<div style="color:#FF9F00;margin-top:6px;font-size:10px">⚠ ${h.alertMsg}</div>` : ''}
        </div>
      `);
      addLayer(m);
    });

    // 6. Rescue units
    // Admins see all active units. Citizens only see deployed units to track SOS response.
    units.filter(u => 
      isAdmin ? (u.status !== 'Idle' && u.status !== 'Standby') 
              : (u.status === 'En-Route' || u.status === 'On-Scene')
    ).forEach(unit => {
      const c = STATUS_COLORS[unit.status] || '#849396';
      const icon = L.divIcon({
        html: `<div style="background:#090e1b;border:2px solid ${c};border-radius:4px;padding:2px 5px;font-size:9px;font-family:monospace;color:${c};white-space:nowrap">${unit.name}</div>`,
        className: '', iconSize: [70, 18], iconAnchor: [35, 9],
      });
      const m = L.marker([unit.lat, unit.lon], { icon });
      m.bindTooltip(`${unit.name} · ${unit.status} · ${unit.zone}`, { className: 'map-tip' });
      addLayer(m);
    });
  }, [nodes, edges, dangerZones, hospitals, units, activePath, isAdmin, addLayer, clearLayers, onNodeClick]);

  // ── Init map ──
  useEffect(() => {
    if (!containerRef.current) return;
    // Guard: if container already has a leaflet instance attached, skip
    if ((containerRef.current as any)._leaflet_id) return;
    if (mapRef.current) {
      drawAll();
      return;
    }
    const map = L.map(containerRef.current, { zoomControl: false })
      .setView([30.5, 70.0], 5);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '© CartoDB', maxZoom: 18,
    }).addTo(map);

    L.control.zoom({ position: 'topright' }).addTo(map);

    // Offline fallback tile error handler
    map.on('tileerror', () => {
      // tiles failed - map still works with nodes drawn
    });

    mapRef.current = map;
    drawAll();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Redraw when data changes — debounced so rapid prop updates don't thrash Leaflet
  useEffect(() => {
    if (!mapRef.current) return;
    const t = setTimeout(() => drawAll(), 100);
    return () => clearTimeout(t);
  }, [drawAll]);

  // Auto-zoom to route when activePath changes
  useEffect(() => {
    if (!mapRef.current || !activePath || activePath.length === 0) return;
    const bounds = L.latLngBounds(
      activePath.map(id => {
        const nd = nodes.find(n => n.id === id);
        return nd ? [nd.lat, nd.lon] as [number, number] : null;
      }).filter(Boolean) as [number, number][]
    );
    if (bounds.isValid()) {
      mapRef.current.fitBounds(bounds, { padding: [50, 50], animate: true, duration: 1.0 });
    }
  }, [activePath, nodes]);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />

      {/* Map legend */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-[#090e1b]/90 backdrop-blur border border-[#3b494c]/50 rounded-lg p-3 pointer-events-none">
        <div className="text-[9px] font-mono text-[#849396] uppercase tracking-wider mb-2">Legend</div>
        <div className="space-y-1.5">
          {[
            ['#00e5ff', 'Active Route'],
            ['#3ce36a', 'Safe / Operational'],
            ['#FF9F00', 'Dangerous / Alert'],
            ['#FF4444', 'Blocked / Danger Zone'],
            ['#adc6ff', 'Hospital'],
            ['#3b494c', 'Inactive'],
          ].map(([c, l]) => (
            <div key={l} className="flex items-center gap-2">
              <div className="w-5 h-1.5 rounded-full shrink-0" style={{ background: c }} />
              <span className="text-[9px] font-mono text-[#849396]">{l}</span>
            </div>
          ))}
          {dangerZones.length > 0 && (
            <div className="flex items-center gap-2 mt-1 pt-1 border-t border-[#3b494c]/40">
              <div className="w-4 h-4 rounded-full border-2 border-dashed border-[#FF4444] shrink-0" />
              <span className="text-[9px] font-mono text-[#FF4444]">{dangerZones.length} Danger Zone{dangerZones.length > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      </div>

      {/* Live City Status Overlay */}
      <div className="absolute top-3 left-3 z-[1000] bg-[#090e1b]/95 backdrop-blur border border-[#3b494c]/50 rounded-lg p-3 pointer-events-none w-64 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        <div className="text-[9px] font-mono text-[#849396] uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[#adc6ff]" style={{ fontSize: '14px' }}>monitoring</span>
          Live City Status
        </div>
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
             <div className="bg-[#1a1f2d] p-1.5 rounded border border-[#3b494c]/30">
               <div className="text-[8px] font-mono text-[#849396]">GENERAL BEDS</div>
               <div className="text-white text-xs font-bold">{hospitals.reduce((s,h)=>s+h.availableBeds,0)} <span className="text-[9px] font-normal text-[#849396]">AVAIL</span></div>
             </div>
             <div className="bg-[#1a1f2d] p-1.5 rounded border border-[#3b494c]/30">
               <div className="text-[8px] font-mono text-[#849396]">ICU BEDS</div>
               <div className="text-[#adc6ff] text-xs font-bold">{hospitals.reduce((s,h)=>s+h.icuAvailable,0)} <span className="text-[9px] font-normal text-[#849396]">AVAIL</span></div>
             </div>
          </div>
          <div className="bg-[#1a1f2d] p-1.5 rounded border border-[#3b494c]/30 flex justify-between items-center">
             <div className="text-[9px] font-mono text-[#849396]">AMBULANCES (IDLE)</div>
             <div className="text-[#00daf3] text-xs font-bold">{units.filter(u=>u.type==='AMBULANCE' && (u.status==='Idle'||u.status==='Standby')).length} READY</div>
          </div>
        </div>
      </div>

      {/* Inline keyframe for ping animation */}
      <style>{`
        @keyframes ping {
          0%   { transform: scale(1);   opacity: 0.9; box-shadow: 0 0 0 0 currentColor; }
          70%  { transform: scale(1.4); opacity: 0.4; }
          100% { transform: scale(1);   opacity: 0.9; }
        }
      `}</style>
    </div>
  );
}
