import { useState } from 'react';
import MapView from './MapView';
import {
  SosRequest, DangerZone, Hospital, Department, Alert, RescueUnit,
  MapNode, MapEdge, EmergencyType, EMERGENCY_ICONS,
  STATUS_COLORS, findRoute, now, uid,
} from './types';

interface UserPanelProps {
  sosRequests: SosRequest[];
  dangerZones: DangerZone[];
  hospitals: Hospital[];
  departments: Department[];
  units: RescueUnit[];
  alerts: Alert[];
  mapNodes: MapNode[];
  mapEdges: MapEdge[];
  currentUser: string;
  onSubmitSOS: (req: Omit<SosRequest, 'id' | 'status' | 'time'>) => void;
  onLogout: () => void;
}

type UserTab = 'map' | 'sos' | 'alerts' | 'hospitals';

const EMERGENCY_TYPES: Array<{ type: EmergencyType; label: string; icon: string; color: string }> = [
  { type:'earthquake', label:'Earthquake',  icon:'crisis_alert',          color:'#FF4444' },
  { type:'bombing',    label:'Bombing',     icon:'local_fire_department', color:'#FF4444' },
  { type:'fire',       label:'Fire',        icon:'local_fire_department', color:'#FF9F00' },
  { type:'flood',      label:'Flood',       icon:'water',                 color:'#5b9bd5' },
  { type:'medical',    label:'Medical',     icon:'local_hospital',        color:'#adc6ff' },
  { type:'accident',   label:'Accident',    icon:'car_crash',             color:'#FF9F00' },
  { type:'chemical',   label:'Chemical',    icon:'science',               color:'#c084fc' },
  { type:'other',      label:'Other',       icon:'warning',               color:'#849396' },
];

const SEVERITY_OPTS = [
  { val:'LOW',      label:'Low — Situation under partial control',  color:'#3ce36a' },
  { val:'MEDIUM',   label:'Medium — Assistance needed urgently',    color:'#FF9F00' },
  { val:'HIGH',     label:'High — Multiple casualties',             color:'#FF9F00' },
  { val:'CRITICAL', label:'Critical — Mass casualty / imminent',    color:'#FF4444' },
];

export default function UserPanel(props: UserPanelProps) {
  const { sosRequests, dangerZones, hospitals, departments, units, alerts, mapNodes, mapEdges, currentUser, onSubmitSOS, onLogout } = props;

  const [tab, setTab] = useState<UserTab>('map');
  const [sosOpen, setSosOpen] = useState(false);
  const [sosStep, setSosStep] = useState<1|2|3>(1);
  const [sosType, setSosType] = useState<EmergencyType | null>(null);
  const [sosDesc, setSosDesc] = useState('');
  const [sosLocation, setSosLocation] = useState('');
  const [sosPhone, setSosPhone] = useState('');
  const [sosSeverity, setSosSeverity] = useState<'LOW'|'MEDIUM'|'HIGH'|'CRITICAL'>('HIGH');
  const [routeFrom, setRouteFrom] = useState('K1');
  const [routeTo, setRouteTo] = useState('K3');
  const [routeFromCustom, setRouteFromCustom] = useState('');
  const [routeFromMode, setRouteFromMode] = useState<'select'|'custom'>('select');
  const [activePath, setActivePath] = useState<string[]>([]);
  const [sosSubmitted, setSosSubmitted] = useState(false);

  const myRequests = sosRequests.filter(r => r.submittedBy === currentUser);
  const verifiedAlerts = alerts.filter(a => a.level !== 'info' || a.source === 'Admin HQ');
  const criticalAlerts = alerts.filter(a => a.level === 'critical');
  const nearbyHospitals = hospitals.filter(h => h.availableBeds > 0);

  const handleFindRoute = () => {
    const path = findRoute(mapNodes, mapEdges, routeFrom, routeTo, dangerZones);
    setActivePath(path);
  };

  const resetSOS = () => {
    setSosType(null); setSosDesc(''); setSosLocation('');
    setSosPhone(''); setSosSeverity('HIGH'); setSosStep(1); setSosSubmitted(false);
  };

  const handleSubmitSOS = () => {
    if (!sosType || !sosDesc || !sosLocation) return;
    // Get approximate coords from a nearby node
    const nearNode = mapNodes[Math.floor(Math.random() * mapNodes.length)];
    onSubmitSOS({
      type: sosType,
      description: sosDesc,
      lat: nearNode.lat + (Math.random() - 0.5) * 0.05,
      lon: nearNode.lon + (Math.random() - 0.5) * 0.05,
      location: sosLocation,
      submittedBy: currentUser,
      phone: sosPhone || 'N/A',
      severity: sosSeverity,
    });
    setSosSubmitted(true);
    setSosStep(3);
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0e1320] text-[#dee2f5] overflow-hidden">

      {/* Top bar */}
      <header className="h-16 border-b border-[#3b494c]/30 bg-[#090e1b]/80 backdrop-blur-md flex items-center justify-between px-6 shrink-0 relative z-20 shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-lg bg-[#3ce36a]/15 border border-[#3ce36a]/30 flex items-center justify-center shadow-[0_0_15px_rgba(60,227,106,0.2)]">
            <span className="material-symbols-outlined text-[#3ce36a]" style={{ fontSize: '18px' }}>person</span>
          </div>
          <div>
            <div className="text-[13px] font-black tracking-tighter text-[#3ce36a] leading-tight glow-green truncate">PHOENIX GRID</div>
            <div className="text-[9px] font-mono text-[#849396] uppercase tracking-[0.1em] truncate">Citizen Portal · <span className="text-[#dee2f5]">{currentUser}</span></div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* SOS Button — always visible */}
          <button onClick={() => { setSosOpen(true); setSosStep(1); resetSOS(); }}
            className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-[#FF4444] to-[#cc0000] text-white font-mono text-[11px] font-black uppercase tracking-wider rounded-lg hover:from-[#ff2222] hover:to-[#aa0000] active:scale-95 transition-all shadow-[0_0_20px_rgba(255,68,68,0.5)] animate-pulse border border-[#FF4444]/50">
            <span className="material-symbols-outlined" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>emergency</span>
            SOS EMERGENCY
          </button>

          {criticalAlerts.length > 0 && (
            <button onClick={() => setTab('alerts')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded border text-[9px] font-mono font-bold text-[#FF4444] border-[#FF4444]/40 bg-[#FF4444]/10 animate-pulse">
              <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>warning</span>
              {criticalAlerts.length} ALERT
            </button>
          )}

          {dangerZones.length > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded border text-[9px] font-mono font-bold text-[#FF9F00] border-[#FF9F00]/40 bg-[#FF9F00]/10">
              <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>location_off</span>
              {dangerZones.length} Danger Zone{dangerZones.length > 1 ? 's' : ''}
            </div>
          )}

          <button onClick={onLogout} className="p-1.5 text-[#849396] hover:text-[#FF4444] transition-colors" title="Logout">
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>logout</span>
          </button>
        </div>
      </header>

      {/* Tab bar */}
      <div className="border-b border-[#3b494c]/30 bg-[#090e1b]/60 flex items-center px-6 shrink-0 shadow-[0_2px_10px_rgba(0,0,0,0.2)]">
        {[
          { id:'map' as UserTab,       label:'Tactical Map',   icon:'map' },
          { id:'alerts' as UserTab,    label:'Alerts',         icon:'notifications_active', badge: criticalAlerts.length },
          { id:'hospitals' as UserTab, label:'Services',       icon:'local_hospital' },
          { id:'sos' as UserTab,       label:'My SOS Reports', icon:'crisis_alert', badge: myRequests.filter(r=>r.status==='pending').length },
        ].map(item => (
          <button key={item.id} onClick={() => setTab(item.id)}
            className={`flex items-center gap-1.5 px-4 py-3 border-b-2 font-mono text-[10px] uppercase tracking-wider transition-all relative ${
              tab === item.id
                ? 'text-[#3ce36a] border-[#3ce36a]'
                : 'text-[#849396] border-transparent hover:text-[#dee2f5]'
            }`}>
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>{item.icon}</span>
            {item.label}
            {item.badge != null && item.badge > 0 && (
              <span className="bg-[#FF4444] text-white text-[8px] font-bold px-1 py-0.5 rounded-full min-w-[16px] text-center">{item.badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <main className="flex-1 overflow-hidden">

        {/* ── MAP TAB ── */}
        {tab === 'map' && (
          <div className="h-full flex flex-col overflow-hidden">
            {/* Map + side panel row */}
            <div className="flex flex-1 min-h-0 overflow-hidden">
              <div className="flex-1 relative">
                <MapView
                  nodes={mapNodes} edges={mapEdges}
                  dangerZones={dangerZones} hospitals={hospitals}
                  units={units.filter(u => u.status === 'En-Route' || u.status === 'On-Scene')}
                  activePath={activePath}
                  isAdmin={false}
                />
              </div>

            {/* Side panel */}
            <div className="w-[260px] shrink-0 border-l border-[#3b494c]/30 bg-[#090e1b] flex flex-col overflow-hidden">
              {/* Danger zone warning */}
              {dangerZones.length > 0 && (
                <div className="p-3 border-b border-[#FF4444]/30 bg-[#FF4444]/8">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-[#FF4444]" style={{ fontSize: '14px' }}>warning</span>
                    <span className="text-[10px] font-mono font-bold text-[#FF4444] uppercase">Active Danger Zones</span>
                  </div>
                  {dangerZones.map(dz => (
                    <div key={dz.id} className="text-[10px] font-mono text-[#dee2f5] mb-1 pl-2 border-l-2 border-[#FF4444]/50">
                      <span className="text-[#FF9F00] font-bold">{dz.type.toUpperCase()}</span> — {dz.description}
                    </div>
                  ))}
                </div>
              )}

              {/* Safe route finder */}
              <div className="p-3 border-b border-[#3b494c]/30">
                <div className="text-[9px] font-mono text-[#849396] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[#3ce36a]" style={{ fontSize: '12px' }}>route</span>
                  Safe Route Finder
                  {dangerZones.length > 0 && <span className="text-[#FF9F00] text-[8px]">(avoids {dangerZones.length} danger zones)</span>}
                </div>
                <div className="space-y-2">
                  {/* From: toggle custom / select */}
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-[9px] font-mono text-[#849396] flex-1">FROM</span>
                    <button onClick={() => setRouteFromMode(m => m === 'select' ? 'custom' : 'select')}
                      className="text-[8px] font-mono text-[#00e5ff] hover:underline px-1">
                      {routeFromMode === 'select' ? '✏ Type Location' : '≡ Pick from Map'}
                    </button>
                  </div>
                  {routeFromMode === 'select' ? (
                    <select value={routeFrom} onChange={e => setRouteFrom(e.target.value)}
                      className="w-full bg-[#1a1f2d] border border-[#3b494c]/50 rounded px-2 py-1.5 text-[10px] text-white font-mono focus:outline-none focus:border-[#3ce36a]/60">
                      {mapNodes.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
                    </select>
                  ) : (
                    <input
                      value={routeFromCustom}
                      onChange={e => setRouteFromCustom(e.target.value)}
                      placeholder="e.g. My Home, Civil Hospital, DHA Phase 4..."
                      className="w-full bg-[#1a1f2d] border border-[#3ce36a]/40 rounded px-2 py-1.5 text-[10px] text-white font-mono focus:outline-none focus:border-[#3ce36a]/80 placeholder-[#3b494c]"
                    />
                  )}
                  {/* To: emergency services */}
                  <div className="text-[9px] font-mono text-[#849396] pt-1">TO — EMERGENCY DESTINATION</div>
                  <select value={routeTo} onChange={e => setRouteTo(e.target.value)}
                    className="w-full bg-[#1a1f2d] border border-[#3b494c]/50 rounded px-2 py-1.5 text-[10px] text-white font-mono focus:outline-none focus:border-[#3ce36a]/60">
                    <optgroup label="🏥 Hospitals">
                      {mapNodes.filter(n => n.type === 'HOSPITAL').map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
                    </optgroup>
                    <optgroup label="🔥 Fire Stations">
                      {mapNodes.filter(n => n.type === 'FIRE_STATION').map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
                    </optgroup>
                    <optgroup label="🚔 Police Stations">
                      {mapNodes.filter(n => n.type === 'POLICE').map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
                    </optgroup>
                    <optgroup label="⚡ Command HQ">
                      {mapNodes.filter(n => n.type === 'COMMAND').map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
                    </optgroup>
                  </select>
                  <button onClick={handleFindRoute}
                    className="w-full py-2 bg-[#3ce36a] text-[#001f24] font-mono text-[10px] font-bold uppercase rounded hover:bg-[#4df57a] active:scale-95 transition-all shadow-[0_0_10px_rgba(60,227,106,0.3)]">
                    Calculate Route
                  </button>
                  {activePath.length > 0 && (
                    <div className="bg-[#001a10] rounded border border-[#3ce36a]/30 p-2">
                      <div className="text-[8px] font-mono text-[#3ce36a] mb-1.5 uppercase flex items-center gap-1">
                        <span>✓</span> {activePath.length} waypoints · avoiding {dangerZones.length} danger zones
                      </div>
                      {activePath.map((id, i) => {
                        const nd = mapNodes.find(n => n.id === id);
                        return (
                          <div key={id} className="flex items-center gap-1.5 text-[10px] font-mono text-[#dee2f5] mb-0.5">
                            <span className={`w-4 shrink-0 font-bold ${i === 0 ? 'text-[#3ce36a]' : i === activePath.length - 1 ? 'text-[#00e5ff]' : 'text-[#849396]'}`}>#{i+1}</span>
                            <span className="truncate">{nd?.name}</span>
                            {i < activePath.length - 1 && <span className="text-[#3b494c] text-[8px] ml-auto">→</span>}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Dept / Hospital quick-info cards */}
              <div className="p-3 border-b border-[#3b494c]/30">
                <div className="text-[9px] font-mono text-[#849396] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[#adc6ff]" style={{ fontSize: '12px' }}>corporate_fare</span>
                  Live Services Near You
                </div>
                <div className="space-y-1.5">
                  {/* Hospitals */}
                  {hospitals.slice(0, 3).map(h => {
                    const c = h.status === 'NORMAL' ? '#3ce36a' : h.status === 'ALERT' ? '#FF9F00' : '#FF4444';
                    return (
                      <div key={h.id} className="bg-[#1a1f2d] rounded border border-[#3b494c]/40 p-2 flex items-center gap-2">
                        <span style={{ color: '#adc6ff', fontSize: '16px' }} className="material-symbols-outlined shrink-0">local_hospital</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-white text-[10px] font-bold truncate">{h.name}</div>
                          <div className="text-[9px] font-mono text-[#849396]">{h.city} · Beds: <span style={{ color: c }}>{h.availableBeds}</span> avail · ICU: <span style={{ color: c }}>{h.icuAvailable}</span></div>
                        </div>
                        <span style={{ color: c }} className="text-[8px] font-mono font-bold shrink-0">{h.status}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* My SOS status */}
              <div className="flex-1 p-3 overflow-y-auto">
                <div className="text-[9px] font-mono text-[#849396] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[#FF9F00]" style={{ fontSize: '12px' }}>crisis_alert</span>
                  My SOS Status
                </div>
                {myRequests.length === 0 ? (
                  <div className="text-[10px] font-mono text-[#3b494c] text-center py-4">No active SOS reports</div>
                ) : (
                  <div className="space-y-2">
                    {myRequests.map(req => (
                      <div key={req.id} className={`rounded border p-2.5 text-[10px] font-mono ${
                        req.status === 'verified' ? 'border-[#3ce36a]/40 bg-[#3ce36a]/8' :
                        req.status === 'pending'  ? 'border-[#FF9F00]/40 bg-[#FF9F00]/8' :
                        req.status === 'dispatched'?'border-[#00daf3]/40 bg-[#00daf3]/8' :
                        'border-[#3b494c]/30 bg-[#1a1f2d]'
                      }`}>
                        <div className="flex justify-between mb-1">
                          <span className="font-bold text-white">{req.type.toUpperCase()}</span>
                          <span className="text-[8px]" style={{ color: STATUS_COLORS[req.status] }}>{req.status.toUpperCase()}</span>
                        </div>
                        <div className="text-[#849396]">{req.location}</div>
                        <div className="text-[#849396] mt-0.5">{req.time}</div>
                        {req.status === 'verified' && (
                          <div className="text-[#3ce36a] mt-1">✓ Admin verified — help is coming</div>
                        )}
                        {req.status === 'dispatched' && (
                          <div className="text-[#00daf3] mt-1">🚑 Units dispatched to your location</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>{/* end row */}

          {/* ── BOTTOM SERVICES STRIP ── */}
          <div className="shrink-0 bg-[#090e1b]/80 backdrop-blur-md border-t border-[#3b494c]/40 px-4 py-3 overflow-x-auto shadow-[0_-4px_20px_rgba(0,0,0,0.3)] relative z-20">
            <div className="flex gap-4 min-w-max items-stretch">
              {/* Hospitals quick cards */}
              {hospitals.slice(0, 4).map(h => {
                const c = h.status === 'NORMAL' ? '#3ce36a' : h.status === 'ALERT' ? '#FF9F00' : '#FF4444';
                return (
                  <div key={h.id} className="glass-card rounded-lg px-4 py-2 flex items-center gap-3 shrink-0 border border-[#3b494c]/40 hover:border-[#00e5ff]/30 transition-all hover:scale-[1.02]">
                    <span className="material-symbols-outlined text-[#adc6ff]" style={{ fontSize: '18px' }}>local_hospital</span>
                    <div>
                      <div className="text-white text-[11px] font-bold leading-tight max-w-[150px] truncate mb-1">{h.name}</div>
                      <div className="text-[9px] font-mono text-[#849396]">Beds: <span style={{ color: c }} className="font-bold">{h.availableBeds}</span>/{h.totalBeds} · ICU: <span style={{ color: c }} className="font-bold">{h.icuAvailable}</span> · <span style={{ color: c }} className="font-bold">{h.status}</span></div>
                    </div>
                  </div>
                );
              })}
              {/* Divider */}
              <div className="w-px bg-[#3b494c]/40 shrink-0 self-stretch mx-1" />
              {/* Ambulances */}
              <div className="glass-card rounded-lg px-4 py-2 flex items-center gap-3 shrink-0 border border-[#00daf3]/30 shadow-[0_0_10px_rgba(0,218,243,0.1)]">
                <span className="material-symbols-outlined text-[#00daf3]" style={{ fontSize: '18px' }}>local_shipping</span>
                <div>
                  <div className="text-white text-[11px] font-bold mb-1">Ambulances</div>
                  <div className="text-[9px] font-mono text-[#849396]">Ready: <span className="text-[#3ce36a] font-bold">{units.filter(u => u.type === 'AMBULANCE' && (u.status === 'Idle' || u.status === 'Standby')).length}</span> · Out: <span className="text-[#00daf3] font-bold">{units.filter(u => u.type === 'AMBULANCE' && u.status === 'En-Route').length}</span></div>
                </div>
              </div>
              {/* Fire */}
              <div className="glass-card rounded-lg px-4 py-2 flex items-center gap-3 shrink-0 border border-[#FF9F00]/30 shadow-[0_0_10px_rgba(255,159,0,0.1)]">
                <span className="material-symbols-outlined text-[#FF9F00]" style={{ fontSize: '18px' }}>local_fire_department</span>
                <div>
                  <div className="text-white text-[11px] font-bold mb-1">Fire Units</div>
                  <div className="text-[9px] font-mono text-[#849396]">Ready: <span className="text-[#3ce36a] font-bold">{departments.filter(d => d.type === 'fire').reduce((s,d) => s + d.availableUnits, 0)}</span> · Total: <span className="text-[#FF9F00] font-bold">{departments.filter(d => d.type === 'fire').reduce((s,d) => s + d.totalUnits, 0)}</span></div>
                </div>
              </div>
              {/* Police */}
              <div className="glass-card rounded-lg px-4 py-2 flex items-center gap-3 shrink-0 border border-[#7c83fd]/30 shadow-[0_0_10px_rgba(124,131,253,0.1)]">
                <span className="material-symbols-outlined text-[#7c83fd]" style={{ fontSize: '18px' }}>local_police</span>
                <div>
                  <div className="text-white text-[11px] font-bold mb-1">Police Units</div>
                  <div className="text-[9px] font-mono text-[#849396]">Ready: <span className="text-[#3ce36a] font-bold">{departments.filter(d => d.type === 'police').reduce((s,d) => s + d.availableUnits, 0)}</span> · Total: <span className="text-[#7c83fd] font-bold">{departments.filter(d => d.type === 'police').reduce((s,d) => s + d.totalUnits, 0)}</span></div>
                </div>
              </div>
              {/* Rescue */}
              <div className="glass-card rounded-lg px-4 py-2 flex items-center gap-3 shrink-0 border border-[#3ce36a]/30 shadow-[0_0_10px_rgba(60,227,106,0.1)]">
                <span className="material-symbols-outlined text-[#3ce36a]" style={{ fontSize: '18px' }}>emergency_share</span>
                <div>
                  <div className="text-white text-[11px] font-bold mb-1">Rescue Teams</div>
                  <div className="text-[9px] font-mono text-[#849396]">Ready: <span className="text-[#3ce36a] font-bold">{departments.filter(d => d.type === 'rescue').reduce((s,d) => s + d.availableUnits, 0)}</span> · Total: <span className="text-[#3ce36a] font-bold">{departments.filter(d => d.type === 'rescue').reduce((s,d) => s + d.totalUnits, 0)}</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}


        {/* ── ALERTS TAB ── */}
        {tab === 'alerts' && (
          <div className="p-4 max-w-3xl mx-auto">
            <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#FF9F00]" style={{ fontSize: '16px' }}>notifications_active</span>
              Emergency Alerts & Broadcasts
            </h2>

            {dangerZones.length > 0 && (
              <div className="mb-4 p-4 bg-[#FF4444]/10 border border-[#FF4444]/40 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-[#FF4444] text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                  <div>
                    <div className="font-bold text-[#FF4444] text-sm">⚠ ACTIVE DANGER ZONES IN YOUR AREA</div>
                    <div className="text-[10px] font-mono text-[#849396]">These zones have been verified by admin command</div>
                  </div>
                </div>
                <div className="space-y-2">
                  {dangerZones.map(dz => (
                    <div key={dz.id} className="bg-[#090e1b]/60 border border-[#FF4444]/30 rounded p-3">
                      <div className="flex justify-between items-start">
                        <div className="font-bold text-[#FF4444] text-xs uppercase">{dz.type} Emergency</div>
                        <span className="text-[9px] font-mono text-[#849396]">{dz.verifiedAt}</span>
                      </div>
                      <div className="text-[11px] text-[#dee2f5] mt-1">{dz.description}</div>
                      <div className="text-[9px] font-mono text-[#FF9F00] mt-1">📍 Near: {dz.lat.toFixed(3)}°N, {dz.lon.toFixed(3)}°E</div>
                      <div className="text-[9px] font-mono text-[#849396] mt-1">⚠ Affected radius: {dz.radius}m — Use safe routes on the map</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              {alerts.length === 0 && (
                <div className="text-center py-12 text-[11px] font-mono text-[#3b494c]">No alerts received yet</div>
              )}
              {alerts.map(a => (
                <div key={a.id} className={`rounded-lg border p-3.5 ${
                  a.level === 'critical' ? 'bg-[#FF4444]/8 border-[#FF4444]/40' :
                  a.level === 'warn'     ? 'bg-[#FF9F00]/8 border-[#FF9F00]/40' :
                  'bg-[#00daf3]/5 border-[#00daf3]/30'
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined" style={{ fontSize: '14px', color: a.level === 'critical' ? '#FF4444' : a.level === 'warn' ? '#FF9F00' : '#00daf3' }}>
                        {a.level === 'critical' ? 'warning' : a.level === 'warn' ? 'info' : 'campaign'}
                      </span>
                      <span className="text-[9px] font-mono font-bold uppercase" style={{ color: a.level === 'critical' ? '#FF4444' : a.level === 'warn' ? '#FF9F00' : '#00daf3' }}>
                        {a.source}
                      </span>
                    </div>
                    <span className="text-[9px] font-mono text-[#849396]">{a.time}</span>
                  </div>
                  <div className="text-[11px] text-[#dee2f5] leading-snug">{a.msg}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SERVICES / HOSPITALS TAB ── */}
        {tab === 'hospitals' && (
          <div className="p-6 overflow-y-auto h-full animate-fade-in">
            {/* Hospitals section */}
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#adc6ff]/15 flex items-center justify-center border border-[#adc6ff]/30 shadow-[0_0_15px_rgba(173,198,255,0.2)]">
                <span className="material-symbols-outlined text-[#adc6ff]" style={{ fontSize: '18px' }}>local_hospital</span>
              </div>
              Hospitals & Capacity
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
              {hospitals.map(h => {
                const bedPct = Math.round((h.availableBeds / h.totalBeds) * 100);
                return (
                  <div key={h.id} className={`glass-card rounded-xl p-5 border transition-all hover:scale-[1.02] ${
                    h.status === 'CRITICAL' ? 'border-[#FF4444]/50 shadow-[0_0_20px_rgba(255,68,68,0.15)]' :
                    h.status === 'ALERT'    ? 'border-[#FF9F00]/50 shadow-[0_0_20px_rgba(255,159,0,0.15)]' :
                    'border-[#3b494c]/40 hover:border-[#00e5ff]/30'
                  }`}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-bold text-white text-sm">🏥 {h.name}</div>
                        <div className="text-[9px] font-mono text-[#849396]">{h.city}</div>
                      </div>
                      <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded border"
                        style={{ color: STATUS_COLORS[h.status], borderColor: STATUS_COLORS[h.status]+'44', background: STATUS_COLORS[h.status]+'15' }}>
                        {h.status}
                      </span>
                    </div>
                    {h.alertMsg && (
                      <div className="mb-2 text-[10px] font-mono text-[#FF9F00] bg-[#FF9F00]/10 rounded px-2 py-1.5 border border-[#FF9F00]/30">
                        ⚠ {h.alertMsg}
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-3 text-[11px] font-mono mb-3">
                      <div>
                        <div className="text-[8px] text-[#849396] uppercase mb-0.5">General Beds</div>
                        <div className="font-bold" style={{ color: bedPct > 30 ? '#3ce36a' : '#FF9F00' }}>
                          {h.availableBeds} <span className="text-[#849396] font-normal">/ {h.totalBeds}</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-[8px] text-[#849396] uppercase mb-0.5">ICU Available</div>
                        <div className="font-bold" style={{ color: h.icuAvailable > 3 ? '#adc6ff' : '#FF4444' }}>
                          {h.icuAvailable} <span className="text-[#849396] font-normal">/ {h.icuBeds}</span>
                        </div>
                      </div>
                    </div>
                    <div className="h-1.5 bg-[#3b494c]/30 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width:`${bedPct}%`, background: bedPct>50?'#3ce36a':bedPct>25?'#FF9F00':'#FF4444' }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Emergency Departments section */}
            {(['fire','police','ambulance','rescue'] as const).map(type => {
              const depts = departments.filter(d => d.type === type);
              if (depts.length === 0) return null;
              const totalUnits = depts.reduce((s, d) => s + d.totalUnits, 0);
              const availUnits = depts.reduce((s, d) => s + d.availableUnits, 0);
              const typeColor = type === 'fire' ? '#FF9F00' : type === 'police' ? '#7c83fd' : type === 'rescue' ? '#3ce36a' : '#00daf3';
              const typeIcon  = type === 'fire' ? 'local_fire_department' : type === 'police' ? 'local_police' : type === 'rescue' ? 'emergency_share' : 'local_shipping';
              const typeLabel = type === 'fire' ? '🔥 Fire Brigades' : type === 'police' ? '🚔 Police Stations' : type === 'rescue' ? '🆘 Rescue Teams' : '🚑 Ambulance Services';
              return (
                <div key={type} className="mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold flex items-center gap-2" style={{ color: typeColor }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>{typeIcon}</span>
                      {typeLabel}
                    </h3>
                    <div className="text-[9px] font-mono text-[#849396]">
                      <span style={{ color: typeColor }}>{availUnits}</span>/{totalUnits} units ready
                    </div>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {depts.map(d => {
                      const avPct = Math.round((d.availableUnits / d.totalUnits) * 100);
                      const dc = d.status === 'NORMAL' ? '#3ce36a' : d.status === 'ALERT' ? '#FF9F00' : '#FF4444';
                      return (
                        <div key={d.id} className="glass-card border border-[#3b494c]/40 rounded-xl p-4 hover:border-[#3b494c]/70 hover:scale-[1.02] transition-all">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-[12px] font-bold text-white truncate pr-2">{d.name}</div>
                            <span className="text-[9px] font-mono font-bold shrink-0 px-2 py-0.5 rounded border" style={{ color: dc, borderColor: dc+'44', background: dc+'15' }}>{d.status}</span>
                          </div>
                          <div className="text-[9px] font-mono text-[#849396] mb-1.5">{d.city}</div>
                          {d.alertMsg && (
                            <div className="text-[8px] font-mono text-[#FF9F00] mb-1.5 leading-tight">⚠ {d.alertMsg}</div>
                          )}
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1 bg-[#3b494c]/30 rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-all" style={{ width:`${avPct}%`, background: typeColor }} />
                            </div>
                            <span className="text-[9px] font-mono" style={{ color: typeColor }}>
                              {d.availableUnits}/{d.totalUnits}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── MY SOS REPORTS ── */}
        {tab === 'sos' && (
          <div className="p-4 max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-[#FF4444]" style={{ fontSize: '16px' }}>crisis_alert</span>
                My Emergency Reports
              </h2>
              <button onClick={() => { setSosOpen(true); setSosStep(1); resetSOS(); }}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#FF4444] text-white font-mono text-[10px] font-bold uppercase rounded-lg hover:bg-[#ff2222] active:scale-95 transition-all shadow-[0_0_15px_rgba(255,68,68,0.4)]">
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>add</span>
                New SOS
              </button>
            </div>
            {myRequests.length === 0 ? (
              <div className="text-center py-16">
                <span className="material-symbols-outlined text-[#3b494c] text-5xl block mb-3">crisis_alert</span>
                <div className="text-[11px] font-mono text-[#3b494c]">No emergency reports submitted</div>
                <div className="text-[10px] font-mono text-[#3b494c] mt-1">Press SOS button in case of emergency</div>
              </div>
            ) : (
              <div className="space-y-4">
                {myRequests.map(req => {
                  const dispatchedUnitsForReq = units.filter(u => u.zone === req.location && (u.status === 'En-Route' || u.status === 'On-Scene'));
                  return (
                  <div key={req.id} className={`glass-card rounded-xl p-5 border transition-all ${
                    req.status === 'pending'    ? 'border-[#FF9F00]/50 shadow-[0_0_20px_rgba(255,159,0,0.1)]' :
                    req.status === 'verified'   ? 'border-[#3ce36a]/40 shadow-[0_0_20px_rgba(60,227,106,0.1)]' :
                    req.status === 'dispatched' ? 'border-[#00daf3]/40 shadow-[0_0_20px_rgba(0,218,243,0.1)]' :
                    'border-[#3b494c]/30 opacity-70'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-bold text-white text-base flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-[#FF4444]/20 flex items-center justify-center">
                          <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#FF4444' }}>{EMERGENCY_ICONS[req.type]}</span>
                        </div>
                        {req.type.toUpperCase()} Emergency
                      </div>
                      <span className="text-[10px] font-mono font-bold px-3 py-1 rounded border"
                        style={{ color: STATUS_COLORS[req.status], borderColor: STATUS_COLORS[req.status]+'44', background: STATUS_COLORS[req.status]+'15' }}>
                        {req.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-[12px] text-[#dee2f5] mb-4 bg-[#090e1b]/40 rounded-lg p-3 border border-[#3b494c]/30">"{req.description}"</div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[10px] font-mono text-[#849396] mb-2">
                      <div><span className="block text-[8px] uppercase">Location</span><span className="text-white">{req.location}</span></div>
                      <div><span className="block text-[8px] uppercase">Time</span><span className="text-white">{req.time}</span></div>
                      <div><span className="block text-[8px] uppercase">Severity</span><span className="text-white">{req.severity}</span></div>
                      <div><span className="block text-[8px] uppercase">Report ID</span><span className="text-white">{req.id}</span></div>
                    </div>
                    {req.status === 'pending' && (
                      <div className="mt-4 text-[11px] font-mono text-[#FF9F00] flex items-center gap-2 bg-[#FF9F00]/10 p-2 rounded-lg border border-[#FF9F00]/30 shadow-[0_0_10px_rgba(255,159,0,0.1)]">
                        <span className="material-symbols-outlined animate-spin" style={{ fontSize: '16px' }}>sync</span>
                        Waiting for admin verification...
                      </div>
                    )}
                    {req.status === 'verified' && (
                      <div className="mt-4 text-[11px] font-mono text-[#3ce36a] flex items-center gap-2 bg-[#3ce36a]/10 p-2 rounded-lg border border-[#3ce36a]/30 shadow-[0_0_10px_rgba(60,227,106,0.1)]">
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>verified</span>
                        Verified by admin — emergency services alerted, routing updated
                      </div>
                    )}
                    {req.status === 'dispatched' && (
                      <div className="mt-4 text-[11px] font-mono text-[#00daf3] flex flex-col gap-2 bg-[#00daf3]/10 p-3 rounded-lg border border-[#00daf3]/30 shadow-[0_0_10px_rgba(0,218,243,0.1)]">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined animate-pulse" style={{ fontSize: '18px' }}>local_shipping</span>
                          <span className="font-bold">Units Dispatched to your location</span>
                        </div>
                        {dispatchedUnitsForReq.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-1 pl-6">
                            {dispatchedUnitsForReq.map(u => (
                              <span key={u.id} className="px-2 py-1 rounded bg-[#00daf3]/20 border border-[#00daf3]/40 text-white flex items-center gap-1 text-[9px]">
                                {u.name} ({u.type}) <span className="text-[#00daf3]">ETA: {u.eta}</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    {req.status === 'rejected' && (
                      <div className="mt-4 text-[11px] font-mono text-[#849396] flex items-center gap-2 bg-[#849396]/10 p-2 rounded-lg border border-[#849396]/30">
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>cancel</span>
                        Report was rejected by admin as a false alarm
                      </div>
                    )}
                  </div>
                )})}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── SOS Modal ── */}
      {sosOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#090e1b]/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="glass-card border border-[#FF4444]/50 rounded-2xl w-full max-w-[500px] shadow-[0_0_60px_rgba(255,68,68,0.3)] overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-b from-[#FF4444]/10 to-transparent pointer-events-none" />

            {/* Modal header */}
            <div className="border-b border-[#FF4444]/30 px-6 py-4 flex items-center justify-between relative z-10 bg-[#FF4444]/10 backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF4444] to-[#cc0000] flex items-center justify-center animate-pulse shadow-[0_0_20px_rgba(255,68,68,0.5)]">
                  <span className="material-symbols-outlined text-white" style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>emergency</span>
                </div>
                <div>
                  <div className="font-black text-[#FF4444] text-sm tracking-wider">EMERGENCY SOS</div>
                  <div className="text-[9px] font-mono text-[#849396]">Step {sosStep} of 3{sosSubmitted ? ' · Submitted' : ''}</div>
                </div>
              </div>
              {!sosSubmitted && (
                <button onClick={() => setSosOpen(false)} className="text-[#849396] hover:text-white transition-colors">
                  <span className="material-symbols-outlined">close</span>
                </button>
              )}
            </div>

            {/* Progress bar */}
            <div className="h-1 bg-[#3b494c]/40 w-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#FF4444] to-[#FF9F00] transition-all duration-300 shadow-[0_0_10px_rgba(255,68,68,0.5)]" style={{ width: `${(sosStep / 3) * 100}%` }} />
            </div>

            {/* Modal Body */}
            <div className="p-6 relative z-10 bg-[#090e1b]/60 backdrop-blur-sm">
              {/* Step 1: Type selection */}
              {sosStep === 1 && (
                <div>
                  <h3 className="text-lg font-bold text-white mb-4">Select Emergency Type</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {EMERGENCY_TYPES.map(type => (
                      <button key={type.type}
                        onClick={() => { setSosType(type.type); setSosStep(2); }}
                        className="flex flex-col items-center justify-center gap-3 p-4 rounded-xl border border-[#3b494c]/50 bg-[#090e1b]/50 hover:bg-[#1a1f2d]/80 hover:scale-105 active:scale-95 transition-all group shadow-[0_4px_15px_rgba(0,0,0,0.2)]">
                        <div className="w-14 h-14 rounded-full flex items-center justify-center transition-all group-hover:scale-110 shadow-lg"
                          style={{ background: type.color + '20', color: type.color, boxShadow: `0 0 15px ${type.color}30` }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>{type.icon}</span>
                        </div>
                        <span className="text-[11px] font-bold text-[#dee2f5] uppercase tracking-wider">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Details */}
              {sosStep === 2 && (
                <div className="animate-fade-in">
                  <div className="mb-5">
                    <h3 className="text-lg font-bold text-white">Emergency Details</h3>
                    <p className="text-[10px] font-mono text-[#849396]">Provide accurate information to help dispatchers.</p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-mono text-[#00e5ff] uppercase mb-2 block tracking-wider">Severity Level</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {SEVERITY_OPTS.map(opt => (
                          <button key={opt.val} onClick={() => setSosSeverity(opt.val as any)}
                            className={`px-3 py-2.5 rounded-lg border text-left flex items-start gap-2.5 transition-all group ${
                              sosSeverity === opt.val
                                ? 'bg-opacity-20 shadow-[0_0_15px_rgba(0,0,0,0.3)] scale-[1.02]'
                                : 'bg-[#090e1b]/60 border-[#3b494c]/40 text-[#849396] hover:bg-[#1a1f2d]/80 hover:border-white/20'
                            }`}
                            style={sosSeverity === opt.val ? { borderColor: opt.color, backgroundColor: opt.color+'25', color: opt.color, boxShadow: `0 0 20px ${opt.color}40` } : {}}>
                            <span className="material-symbols-outlined shrink-0 mt-0.5 transition-transform group-hover:scale-110" style={{ fontSize: '16px' }}>
                              {sosSeverity === opt.val ? 'radio_button_checked' : 'radio_button_unchecked'}
                            </span>
                            <span className="text-[10px] font-bold leading-tight">{opt.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-mono text-[#00e5ff] uppercase mb-1.5 block tracking-wider">Location / Address</label>
                        <div className="relative group">
                          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#849396] group-focus-within:text-[#00e5ff] transition-colors" style={{ fontSize: '16px' }}>location_on</span>
                          <input value={sosLocation} onChange={e => setSosLocation(e.target.value)}
                            placeholder="e.g. Near Civic Center"
                            className="w-full bg-[#090e1b]/80 border border-[#3b494c]/50 rounded-lg pl-9 pr-4 py-2.5 text-xs text-white font-mono placeholder-[#3b494c] focus:outline-none focus:border-[#00e5ff] focus:ring-1 focus:ring-[#00e5ff] focus:shadow-[0_0_15px_rgba(0,229,255,0.3)] transition-all" />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-mono text-[#00e5ff] uppercase mb-1.5 block tracking-wider">Contact Number <span className="text-[#849396] lowercase">(optional)</span></label>
                        <div className="relative group">
                          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#849396] group-focus-within:text-[#00e5ff] transition-colors" style={{ fontSize: '16px' }}>phone</span>
                          <input type="tel" value={sosPhone} onChange={e => setSosPhone(e.target.value.replace(/[^0-9+\-\s()]/g, ''))}
                            placeholder="e.g. 0300-1234567"
                            className="w-full bg-[#090e1b]/80 border border-[#3b494c]/50 rounded-lg pl-9 pr-4 py-2.5 text-xs text-white font-mono placeholder-[#3b494c] focus:outline-none focus:border-[#00e5ff] focus:ring-1 focus:ring-[#00e5ff] focus:shadow-[0_0_15px_rgba(0,229,255,0.3)] transition-all" />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-[10px] font-mono text-[#00e5ff] uppercase mb-1.5 block tracking-wider">Describe the Situation</label>
                      <textarea value={sosDesc} onChange={e => setSosDesc(e.target.value)}
                        placeholder="What exactly is happening? Are there casualties? Any specific dangers?"
                        className="w-full bg-[#090e1b]/80 border border-[#3b494c]/50 rounded-lg px-4 py-3 text-xs text-white font-mono placeholder-[#3b494c] focus:outline-none focus:border-[#00e5ff] focus:ring-1 focus:ring-[#00e5ff] focus:shadow-[0_0_15px_rgba(0,229,255,0.3)] transition-all h-20 resize-none" />
                    </div>
                  </div>
                  <div className="mt-5 flex gap-3">
                    <button onClick={() => setSosStep(1)}
                      className="flex-1 py-3 bg-[#090e1b]/50 border border-[#3b494c]/50 text-[#849396] font-mono text-[11px] font-bold uppercase tracking-wider rounded-lg hover:text-white transition-all">
                      Back
                    </button>
                    <button onClick={() => setSosStep(3)} disabled={!sosLocation || !sosDesc}
                      className="flex-[2] py-3 bg-gradient-to-r from-[#FF4444] to-[#cc0000] text-white font-mono text-[11px] font-bold uppercase tracking-wider rounded-lg hover:from-[#ff2222] hover:to-[#aa0000] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,68,68,0.3)]">
                      Review & Submit
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Review */}
              {sosStep === 3 && !sosSubmitted && (
                <div className="animate-fade-in">
                  <div className="mb-5">
                    <h3 className="text-lg font-bold text-white">Confirm SOS Request</h3>
                    <p className="text-[10px] font-mono text-[#849396]">Review details before transmission.</p>
                  </div>
                  <div className="bg-gradient-to-br from-[#FF4444]/10 to-[#cc0000]/5 border border-[#FF4444]/30 rounded-xl p-5 mb-5 shadow-[inset_0_0_20px_rgba(255,68,68,0.05)] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF4444]/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                    
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-[12px] font-mono mb-4 relative z-10">
                      <div><span className="block text-[#FF4444] text-[9px] font-bold uppercase tracking-widest mb-0.5">Emergency Type</span><span className="font-bold text-white flex items-center gap-1.5"><span className="material-symbols-outlined text-[14px]">{EMERGENCY_ICONS[sosType!] || 'warning'}</span>{sosType?.toUpperCase()}</span></div>
                      <div><span className="block text-[#FF4444] text-[9px] font-bold uppercase tracking-widest mb-0.5">Severity</span><span className="font-bold px-2 py-0.5 rounded-sm bg-black/20 border" style={{ color: SEVERITY_OPTS.find(o=>o.val===sosSeverity)?.color, borderColor: SEVERITY_OPTS.find(o=>o.val===sosSeverity)?.color+'40' }}>{sosSeverity}</span></div>
                      <div><span className="block text-[#FF4444] text-[9px] font-bold uppercase tracking-widest mb-0.5">Location</span><span className="text-white truncate block" title={sosLocation}>{sosLocation}</span></div>
                      <div><span className="block text-[#FF4444] text-[9px] font-bold uppercase tracking-widest mb-0.5">Contact Phone</span><span className="text-white">{sosPhone}</span></div>
                    </div>
                    <div className="relative z-10 bg-black/20 p-3 rounded-lg border border-white/5"><span className="block text-[#FF4444] text-[9px] font-bold uppercase tracking-widest mb-1">Description</span><span className="text-[#dee2f5] italic text-xs">"{sosDesc}"</span></div>
                  </div>
                  <div className="text-[10px] font-mono text-[#FF9F00] flex items-start gap-2 bg-[#FF9F00]/10 p-3 rounded-xl border border-[#FF9F00]/30 shadow-[0_0_15px_rgba(255,159,0,0.1)]">
                    <span className="material-symbols-outlined shrink-0" style={{ fontSize: '18px' }}>warning</span>
                    <p className="leading-tight mt-0.5">This is an official emergency report. False alarms are penalized under the law. Submitting will immediately alert command centers.</p>
                  </div>
                  <div className="mt-6 flex gap-3">
                    <button onClick={() => setSosStep(2)}
                      className="flex-1 py-2.5 bg-[#090e1b]/50 border border-[#3b494c]/50 text-[#849396] font-mono text-[11px] font-bold uppercase tracking-wider rounded-lg hover:text-white hover:bg-[#1a1f2d] transition-all">
                      Modify
                    </button>
                    <button onClick={handleSubmitSOS}
                      className="flex-[2] py-2.5 bg-gradient-to-r from-[#FF4444] to-[#cc0000] text-white font-mono text-[11px] font-bold uppercase tracking-wider rounded-lg hover:from-[#ff2222] hover:to-[#aa0000] transition-all hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(255,68,68,0.4)] relative overflow-hidden group">
                      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined animate-pulse" style={{ fontSize: '18px' }}>cell_tower</span>
                        TRANSMIT REPORT
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Confirmation */}
              {sosStep === 3 && sosSubmitted && (
                <div className="py-12 text-center animate-fade-in">
                  <div className="w-24 h-24 rounded-full bg-[#3ce36a]/20 border-2 border-[#3ce36a] text-[#3ce36a] flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(60,227,106,0.3)] relative">
                    <div className="absolute inset-0 rounded-full border-2 border-[#3ce36a] animate-ping opacity-50"></div>
                    <span className="material-symbols-outlined" style={{ fontSize: '48px' }}>check_circle</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">SOS TRANSMITTED</h3>
                  <p className="text-[12px] font-mono text-[#849396] mb-8">Command Center and Emergency Departments have been alerted. Please stay safe, help is on the way.</p>
                  <button onClick={() => { setSosOpen(false); setSosSubmitted(false); setTab('sos'); }}
                    className="px-8 py-3 bg-[#3ce36a]/10 border border-[#3ce36a]/50 text-[#3ce36a] font-mono text-[12px] font-bold uppercase tracking-wider rounded-lg hover:bg-[#3ce36a]/20 transition-all shadow-[0_0_15px_rgba(60,227,106,0.2)]">
                    Track Status
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
