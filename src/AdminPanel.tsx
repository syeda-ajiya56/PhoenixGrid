import { useState, useEffect } from 'react';
import MapView from './MapView';
import {
  SosRequest, DangerZone, Hospital, Department, RescueUnit,
  Alert, MeshNode, AidPackage, MapNode, MapEdge,
  STATUS_COLORS, DEPT_ICONS, UNIT_ICONS, EMERGENCY_ICONS,
  EmergencyType, now, uid, findRoute, INITIAL_AID, INITIAL_MESH,
} from './types';
import { SyncPacket } from './meshSyncEngine';

// ── Shared Badge component ──
function Badge({ text, color }: { text: string; color?: string }) {
  const c = color || STATUS_COLORS[text] || '#849396';
  return (
    <span className="px-2 py-0.5 rounded border text-[10px] font-mono font-bold uppercase tracking-wide"
      style={{ color: c, borderColor: c + '44', background: c + '15' }}>
      {text}
    </span>
  );
}

function StatCard({ label, value, icon, color = '#00e5ff', sub, glassClass = 'glass-card' }: {
  label: string; value: string | number; icon: string; color?: string; sub?: string; glassClass?: string;
}) {
  return (
    <div className={`rounded-xl p-4 flex items-center gap-4 transition-all hover:scale-[1.02] ${glassClass}`}>
      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-lg relative overflow-hidden group"
        style={{ background: color + '20', border: `1px solid ${color}40`, color }}>
        <span className="material-symbols-outlined text-[24px] relative z-10 transition-transform group-hover:scale-110">{icon}</span>
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: `radial-gradient(circle at center, ${color}60 0%, transparent 70%)` }} />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] font-mono text-[#849396] uppercase tracking-wider mb-1">{label}</div>
        <div className="font-bold text-white text-2xl leading-none tracking-tight">{value}</div>
        {sub && <div className="text-[10px] font-mono mt-1" style={{ color }}>{sub}</div>}
      </div>
    </div>
  );
}

// ─── Props from App ───────────────────────────────────────────
interface AdminPanelProps {
  sosRequests: SosRequest[];
  dangerZones: DangerZone[];
  hospitals: Hospital[];
  departments: Department[];
  units: RescueUnit[];
  alerts: Alert[];
  meshNodes: MeshNode[];
  meshPackets: SyncPacket[];
  isBlackout: boolean;
  mapNodes: MapNode[];
  mapEdges: MapEdge[];
  syncStatus: 'online'|'offline'|'syncing';
  onVerifySOS: (id: string) => void;
  onRejectSOS: (id: string) => void;
  onDispatchUnit: (unitId: string, zone: string, sosId?: string) => void;
  onRecallUnit: (unitId: string) => void;
  onAddAlert: (msg: string, level: Alert['level'], source: string) => void;
  onMeshToggle: (online: boolean) => void;
  onMeshBroadcast: (msg: string) => void;
  onUpdateNode: (nodeId: string, updates: Partial<MeshNode>) => void;
  onLogout: () => void;
}

type AdminTab = 'dashboard' | 'sos' | 'map' | 'departments' | 'units' | 'hospitals' | 'mesh' | 'aid';

export default function AdminPanel(props: AdminPanelProps) {
  const { sosRequests, dangerZones, hospitals, departments, units, alerts, meshNodes, meshPackets, isBlackout, mapNodes, mapEdges, syncStatus, onVerifySOS, onRejectSOS, onDispatchUnit, onRecallUnit, onAddAlert, onMeshBroadcast, onMeshToggle, onUpdateNode, onLogout } = props;

  const [tab, setTab] = useState<AdminTab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [routeFrom, setRouteFrom] = useState('K1');
  const [routeTo, setRouteTo] = useState('K3');
  const [activePath, setActivePath] = useState<string[]>([]);
  const [meshOnline, setMeshOnline] = useState(true);
  const [demoInput, setDemoInput] = useState('');
  const [demoReplyInput, setDemoReplyInput] = useState('');
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [d1Wifi, setD1Wifi] = useState(false);
  const [d1Ble, setD1Ble] = useState(true);
  const [d2Wifi, setD2Wifi] = useState(false);
  const [d2Ble, setD2Ble] = useState(true);
  const [device1Log, setDevice1Log] = useState<{sender:string, msg:string, inbound?:boolean}[]>([]);
  const [device2Log, setDevice2Log] = useState<{sender:string, msg:string, inbound?:boolean}[]>([]);
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [sysOpsLog, setSysOpsLog] = useState<{ts:string, text:string, color:string}[]>([
    {ts: now(), text: 'SYSTEM INITIALIZED. WAITING FOR TRANSMISSIONS...', color: '#849396'}
  ]);
  const [aidPackages] = useState(INITIAL_AID);
  const [dispatchModal, setDispatchModal] = useState<{ unitId: string; zone: string } | null>(null);
  const [selectedSosForDispatch, setSelectedSosForDispatch] = useState<string>('');

  const pendingSOS = sosRequests.filter(r => r.status === 'pending');
  const activeSOS  = sosRequests.filter(r => r.status === 'verified' || r.status === 'dispatched');
  const criticalAlerts = alerts.filter(a => a.level === 'critical');
  const deployedUnits  = units.filter(u => u.status === 'En-Route' || u.status === 'On-Scene');
  const alertedDepts   = departments.filter(d => d.status !== 'NORMAL');

  // Close dispatch modal on Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setDispatchModal(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleFindRoute = () => {
    const path = findRoute(mapNodes, mapEdges, routeFrom, routeTo, dangerZones);
    setActivePath(path);
  };

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMsg.trim()) return;
    onAddAlert(broadcastMsg.trim(), 'info', 'BROADCAST');
    setBroadcastMsg('');
  };

  const handleDemoTransmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoInput.trim() || isTransmitting) return;

    const payload = demoInput.trim();
    setDemoInput('');
    setIsTransmitting(true);
    
    setDevice1Log(p => [...p, {sender: 'USER', msg: payload, inbound: false}]);
    
    const addSysLog = (text: string, color: string = '#00e5ff') => {
      setSysOpsLog(p => [...p, {ts: now(), text, color}]);
    };

    addSysLog('[SYS] ENCRYPTING PAYLOAD: AES-256...', '#849396');
    
    setTimeout(() => {
      // If Device 1 has Wi-Fi, shortcut directly to HQ
      if (d1Wifi) {
        addSysLog('[NET] ACTIVE WI-FI DETECTED. BYPASSING MESH.', '#3ce36a');
        setTimeout(() => {
          addSysLog('[SYS] PACKET DELIVERED DIRECTLY TO COMMAND HQ.', '#3ce36a');
          onMeshBroadcast(payload);
          setIsTransmitting(false);
        }, 500);
        return;
      }

      // No Wi-Fi, try BLE
      if (!d1Ble) {
        addSysLog('[ERR] BLUETOOTH ADAPTER OFFLINE. NO CONNECTION AVAILABLE.', '#FF4444');
        setIsTransmitting(false);
        return;
      }

      addSysLog('[BLE] SCANNING FOR NEARBY BLUETOOTH PEERS...', '#FF9F00');
      
      setTimeout(() => {
        if (!d2Ble) {
          addSysLog('[ERR] NO PEERS RESPONDING TO BLE BEACON.', '#FF4444');
          setIsTransmitting(false);
          return;
        }

        addSysLog('[NET] PEER DETECTED: [RELAY-01] (Signal: 84%)', '#3ce36a');
        
        setTimeout(() => {
          addSysLog('[SYS] INITIATING HANDSHAKE...', '#849396');
          
          setTimeout(() => {
            addSysLog('[NET] CONNECTION ESTABLISHED. TRANSMITTING DATA...', '#00daf3');
            
            setTimeout(() => {
              // Appears on Device 2
              setDevice2Log(p => [...p, {sender: 'VICTIM-04', msg: payload, inbound: true}]);
              addSysLog('[RELAY] PACKET RECEIVED BY [RELAY-01]', '#3ce36a');
              
              setTimeout(() => {
                if (d2Wifi) {
                   addSysLog('[NET] RELAY HAS ACTIVE WI-FI. ROUTING DIRECTLY TO HQ...', '#3ce36a');
                   setTimeout(() => {
                     addSysLog('[SYS] PACKET DELIVERED TO COMMAND HQ.', '#3ce36a');
                     onMeshBroadcast(payload);
                     setIsTransmitting(false);
                   }, 500);
                   return;
                }

                if (!meshOnline) {
                  addSysLog('[ERR] GATEWAY OFFLINE. NO INTERNET DETECTED.', '#FF4444');
                  addSysLog('[SYS] PACKET MOVED TO STORE-AND-FORWARD QUEUE.', '#FF9F00');
                  onMeshBroadcast(payload); // Queue it in engine
                  setIsTransmitting(false);
                } else {
                  addSysLog('[NET] CONNECTING TO SATELLITE GATEWAY...', '#adc6ff');
                  
                  setTimeout(() => {
                    addSysLog('[SYS] PACKET DELIVERED TO COMMAND HQ.', '#3ce36a');
                    onMeshBroadcast(payload);
                    setIsTransmitting(false);
                  }, 600);
                }
              }, 600);
            }, 500);
          }, 400);
        }, 500);
      }, 750);
    }, 400);
  };

  const handleDemoReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoReplyInput.trim() || isTransmitting) return;

    const payload = demoReplyInput.trim();
    setDemoReplyInput('');
    setIsTransmitting(true);
    
    setDevice2Log(p => [...p, {sender: 'USER', msg: payload, inbound: false}]);
    
    const addSysLog = (text: string, color: string = '#00e5ff') => {
      setSysOpsLog(p => [...p, {ts: now(), text, color}]);
    };

    addSysLog('[SYS] PREPARING REVERSE ROUTE PAYLOAD...', '#849396');
    
    setTimeout(() => {
      if (!d2Ble) {
        addSysLog('[ERR] RELAY BLUETOOTH ADAPTER OFFLINE. CANNOT INITIATE P2P.', '#FF4444');
        setIsTransmitting(false);
        return;
      }
      
      addSysLog('[BLE] CONNECTING BACK TO [VICTIM-04] VIA P2P...', '#FF9F00');
      
      setTimeout(() => {
        if (!d1Ble) {
           addSysLog('[ERR] [VICTIM-04] IS UNREACHABLE. HANDSHAKE TIMEOUT.', '#FF4444');
           setIsTransmitting(false);
           return;
        }

        addSysLog('[NET] REVERSE HANDSHAKE SUCCESSFUL.', '#3ce36a');
        
        setTimeout(() => {
          // Appears on Device 1
          setDevice1Log(p => [...p, {sender: 'RELAY-01', msg: payload, inbound: true}]);
          addSysLog('[VICTIM] ACKNOWLEDGEMENT RECEIVED BY [VICTIM-04]', '#00daf3');
          setIsTransmitting(false);
        }, 600);
      }, 750);
    }, 400);
  };

  const navItems: Array<{ id: AdminTab; icon: string; label: string; badge?: number }> = [
    { id:'dashboard',   icon:'dashboard',         label:'Dashboard',     badge: pendingSOS.length > 0 ? pendingSOS.length : undefined },
    { id:'sos',         icon:'crisis_alert',       label:'SOS Requests',  badge: pendingSOS.length },
    { id:'map',         icon:'map',                label:'Tactical Map'  },
    { id:'departments', icon:'corporate_fare',     label:'Departments',   badge: alertedDepts.length || undefined },
    { id:'units',       icon:'directions_run',     label:'Field Units'   },
    { id:'hospitals',   icon:'local_hospital',     label:'Hospitals'     },
    { id:'mesh',        icon:'hub',                label:'Mesh Network'  },
    { id:'aid',         icon:'inventory_2',        label:'Aid Pipeline'  },
  ];

  const SEVERITY_COLOR: Record<string, string> = { LOW:'#3ce36a', MEDIUM:'#FF9F00', HIGH:'#FF9F00', CRITICAL:'#FF4444' };

  return (
    <div className="h-screen w-screen flex bg-[#0e1320] text-[#dee2f5] overflow-hidden">

      {/* ── Sidebar ── */}
      <aside className={`flex flex-col bg-[#090e1b] border-r border-[#3b494c]/30 shrink-0 transition-all duration-300 ${sidebarOpen ? 'w-[220px]' : 'w-[52px]'}`}>

        {/* Brand */}
        <div className="h-16 border-b border-[#3b494c]/30 flex items-center gap-3 px-4 shrink-0 bg-[#090e1b]/80 backdrop-blur">
          <div className="w-8 h-8 rounded-lg bg-[#00e5ff]/15 border border-[#00e5ff]/30 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(0,229,255,0.2)]">
            <span className="material-symbols-outlined text-[#00e5ff]" style={{ fontSize: '18px' }}>shield</span>
          </div>
          {sidebarOpen && (
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-black tracking-tighter text-[#00e5ff] leading-tight glow-cyan truncate">PHOENIX GRID</div>
              <div className="text-[9px] font-mono text-[#849396] uppercase tracking-[0.1em] truncate">Admin Command</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-2 space-y-0.5 overflow-y-auto overflow-x-hidden">
          {navItems.map(item => (
            <button key={item.id} onClick={() => setTab(item.id)}
              className={`w-full flex items-center gap-3 py-2.5 px-3 border-l-[3px] text-left transition-all relative ${
                tab === item.id
                  ? 'text-[#00e5ff] border-[#00e5ff] bg-[#00e5ff]/10'
                  : 'text-[#849396] border-transparent hover:text-[#dee2f5] hover:bg-[#1a1f2d]/60'
              }`}>
              <span className="material-symbols-outlined shrink-0" style={{ fontSize: '18px' }}>{item.icon}</span>
              {sidebarOpen && (
                <div className="flex items-center justify-between flex-1 min-w-0">
                  <span className="font-mono text-[10px] uppercase tracking-wider truncate">{item.label}</span>
                  {item.badge != null && item.badge > 0 && (
                    <span className="ml-1 bg-[#FF4444] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center shrink-0">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
              {!sidebarOpen && item.badge != null && item.badge > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#FF4444] rounded-full" />
              )}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className={`border-t border-[#3b494c]/30 p-3 flex ${sidebarOpen ? 'justify-between' : 'justify-center'} items-center`}>
          {sidebarOpen && <span className="text-[9px] font-mono text-[#849396]">PHX-ADMIN</span>}
          <button onClick={onLogout} className="p-1 text-[#849396] hover:text-[#FF4444] transition-colors" title="Logout">
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>logout</span>
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <header className="h-16 border-b border-[#3b494c]/30 bg-[#090e1b]/80 backdrop-blur-md flex items-center justify-between px-6 shrink-0 relative z-20 shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(v => !v)}
              className="w-8 h-8 rounded-lg bg-[#1a1f2d] border border-[#3b494c]/40 flex items-center justify-center hover:border-[#00e5ff]/50 hover:bg-[#00e5ff]/5 transition-all text-[#849396] hover:text-[#00e5ff]">
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{sidebarOpen ? 'menu_open' : 'menu'}</span>
            </button>
            <h1 className="text-sm font-bold text-white uppercase tracking-wider">
              {navItems.find(n => n.id === tab)?.label}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {/* Sync Status Badge */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-mono font-bold transition-all ${
              syncStatus === 'online' ? 'text-[#3ce36a] border-[#3ce36a]/30 bg-[#3ce36a]/10 shadow-[0_0_10px_rgba(60,227,106,0.15)]' :
              syncStatus === 'syncing' ? 'text-[#00daf3] border-[#00daf3]/30 bg-[#00daf3]/10 shadow-[0_0_10px_rgba(0,218,243,0.15)] animate-pulse' :
              'text-[#FF4444] border-[#FF4444]/30 bg-[#FF4444]/10 shadow-[0_0_10px_rgba(255,68,68,0.15)]'
            }`}>
              {syncStatus === 'syncing' ? (
                <span className="material-symbols-outlined animate-spin" style={{ fontSize: '14px' }}>sync</span>
              ) : syncStatus === 'online' ? (
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>wifi</span>
              ) : (
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>wifi_off</span>
              )}
              {syncStatus === 'online' ? 'P2P ONLINE' : syncStatus === 'syncing' ? 'SYNCING...' : 'P2P OFFLINE'}
            </div>

            {pendingSOS.length > 0 && (
              <button onClick={() => setTab('sos')}
                className="flex items-center gap-2 px-4 py-1.5 rounded-full border text-[10px] font-mono font-bold text-white border-[#FF4444]/60 bg-[#FF4444]/20 shadow-[0_0_15px_rgba(255,68,68,0.3)] hover:bg-[#FF4444]/30 transition-colors animate-pulse">
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>crisis_alert</span>
                {pendingSOS.length} PENDING SOS
              </button>
            )}
            
            {/* Admin Avatar */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#00e5ff] to-[#007acc] p-[2px] shadow-[0_0_15px_rgba(0,229,255,0.3)]">
              <div className="w-full h-full rounded-full bg-[#090e1b] flex items-center justify-center">
                <span className="material-symbols-outlined text-[#00e5ff]" style={{ fontSize: '16px' }}>shield_person</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto relative isolate">

          {/* ── DASHBOARD ── */}
          {tab === 'dashboard' && (
            <div className="p-6 space-y-6 animate-fade-in relative min-h-full overflow-hidden">
              {/* Futuristic 3D Background Image */}
              <div 
                className="absolute inset-0 z-0 opacity-55 pointer-events-none bg-cover bg-center bg-no-repeat mix-blend-screen"
                style={{ backgroundImage: 'url(/futuristic_dashboard_bg.png)' }}
              />
              <div className="absolute inset-0 z-0 opacity-70 pointer-events-none bg-gradient-to-b from-[#070b18]/90 via-transparent to-[#070b18]/90" />
              
              <div className="relative z-10 space-y-6">
                {/* Stats row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard label="Pending SOS"    value={pendingSOS.length}    icon="crisis_alert"    color="#FF4444"  sub="awaiting review" glassClass="glass-card-red" />
                  <StatCard label="Active Danger"  value={dangerZones.length}   icon="warning"         color="#FF9F00"  sub="zones on map"    glassClass="glass-card-orange" />
                  <StatCard label="Deployed Units" value={deployedUnits.length} icon="directions_run"  color="#00daf3"  sub={`/ ${units.length} total`} glassClass="glass-card-cyan" />
                  <StatCard label="Alerts Sent"    value={alerts.length}        icon="notifications"   color="#3ce36a"  sub="this session"    glassClass="glass-card-green" />
                </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Incoming SOS panel */}
                <div className="lg:col-span-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
                    <span className="text-[10px] font-mono text-[#849396] uppercase tracking-wider flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#FF4444]" style={{ fontSize: '14px' }}>crisis_alert</span>
                      Incoming SOS Queue
                    </span>
                    <button onClick={() => setTab('sos')} className="text-[9px] font-mono text-[#00e5ff] hover:underline uppercase">View All</button>
                  </div>
                  <div className="divide-y divide-[#3b494c]/20 max-h-[280px] overflow-y-auto">
                    {pendingSOS.length === 0 ? (
                      <div className="p-6 text-center text-[11px] font-mono text-[#3b494c]">No pending SOS requests</div>
                    ) : pendingSOS.slice(0, 5).map(req => (
                      <div key={req.id} className="px-4 py-3 hover:bg-[#00e5ff]/3 transition-colors">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined" style={{ fontSize: '16px', color: SEVERITY_COLOR[req.severity] }}>
                              {EMERGENCY_ICONS[req.type]}
                            </span>
                            <span className="font-bold text-white text-xs">{req.type.toUpperCase()}</span>
                            <Badge text={req.severity} color={SEVERITY_COLOR[req.severity]} />
                          </div>
                          <div className="flex gap-1.5">
                            <button onClick={() => onVerifySOS(req.id)}
                              className="px-2.5 py-1 bg-[#3ce36a]/10 border border-[#3ce36a]/40 text-[#3ce36a] font-mono text-[9px] uppercase rounded hover:bg-[#3ce36a]/20 transition-all active:scale-95">
                              Verify
                            </button>
                            <button onClick={() => onRejectSOS(req.id)}
                              className="px-2.5 py-1 bg-[#FF4444]/10 border border-[#FF4444]/40 text-[#FF4444] font-mono text-[9px] uppercase rounded hover:bg-[#FF4444]/20 transition-all active:scale-95">
                              Reject
                            </button>
                          </div>
                        </div>
                        <div className="text-[11px] text-[#dee2f5]">{req.description}</div>
                        <div className="flex gap-3 mt-1 text-[9px] font-mono text-[#849396]">
                          <span>📍 {req.location}</span>
                          <span>👤 {req.submittedBy}</span>
                          <span>🕐 {req.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Live Alerts panel */}
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                  <div className="px-4 py-3 border-b border-white/10 bg-white/5">
                    <span className="text-[10px] font-mono text-[#849396] uppercase tracking-wider flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#FF9F00]" style={{ fontSize: '14px' }}>notifications_active</span>
                      System Alerts
                    </span>
                  </div>
                  <div className="divide-y divide-[#3b494c]/20 max-h-[280px] overflow-y-auto">
                    {alerts.slice(0, 15).map(a => (
                      <div key={a.id} className="px-3 py-2.5">
                        <div className="flex justify-between text-[9px] font-mono mb-0.5"
                          style={{ color: a.level === 'critical' ? '#FF4444' : a.level === 'warn' ? '#FF9F00' : '#00daf3' }}>
                          <span className="uppercase font-bold">{a.source}</span>
                          <span className="text-[#849396]">{a.time}</span>
                        </div>
                        <div className="text-[10px] text-[#dee2f5] leading-tight">{a.msg}</div>
                      </div>
                    ))}
                    {alerts.length === 0 && (
                      <div className="p-6 text-center text-[11px] font-mono text-[#3b494c]">No alerts yet</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Dept status row */}
              <div>
                <div className="text-[10px] font-mono text-[#849396] uppercase tracking-wider mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined" style={{ fontSize: '13px', color: '#adc6ff' }}>corporate_fare</span>
                  Department Status Overview
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                  {(['fire','police','rescue','ambulance'] as const).map(type => {
                    const depts = departments.filter(d => d.type === type);
                    const alerted = depts.filter(d => d.status !== 'NORMAL');
                    return (
                      <div key={type} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-3 flex items-center gap-3 shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:bg-white/10 transition-all">
                        <span className="material-symbols-outlined" style={{ fontSize: '20px', color: alerted.length > 0 ? '#FF9F00' : '#3ce36a' }}>
                          {DEPT_ICONS[type]}
                        </span>
                        <div>
                          <div className="text-[9px] font-mono text-[#849396] uppercase">{type}</div>
                          <div className="text-sm font-bold text-white">{depts.length} Stations</div>
                          {alerted.length > 0 && (
                            <div className="text-[9px] font-mono text-[#FF9F00]">{alerted.length} on alert</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                </div>
              </div>
            </div>
          )}

          {/* ── SOS REQUESTS ── */}
          {tab === 'sos' && (
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#FF4444]" style={{ fontSize: '18px' }}>crisis_alert</span>
                  Emergency SOS Requests
                </h2>
                <div className="flex gap-2 text-[9px] font-mono">
                  <span className="px-2 py-1 rounded bg-[#FF9F00]/10 border border-[#FF9F00]/30 text-[#FF9F00]">{pendingSOS.length} PENDING</span>
                  <span className="px-2 py-1 rounded bg-[#3ce36a]/10 border border-[#3ce36a]/30 text-[#3ce36a]">{activeSOS.length} ACTIVE</span>
                  <span className="px-2 py-1 rounded bg-[#849396]/10 border border-[#849396]/30 text-[#849396]">{sosRequests.filter(r=>r.status==='rejected').length} REJECTED</span>
                </div>
              </div>
              <div className="space-y-3">
                {sosRequests.length === 0 && (
                  <div className="text-center py-12 text-[11px] font-mono text-[#3b494c]">
                    No SOS requests received yet. Waiting for citizen reports...
                  </div>
                )}
                {sosRequests.map(req => {
                  const dispatchedUnitsForReq = units.filter(u => u.zone === req.location && (u.status === 'En-Route' || u.status === 'On-Scene'));
                  return (
                  <div key={req.id} className={`glass-card rounded-xl p-5 transition-all hover:scale-[1.01] ${
                    req.status === 'pending'    ? 'border border-[#FF9F00]/50 shadow-[0_0_20px_rgba(255,159,0,0.1)]' :
                    req.status === 'verified'   ? 'border border-[#3ce36a]/40 shadow-[0_0_20px_rgba(60,227,106,0.1)]' :
                    req.status === 'dispatched' ? 'border border-[#00daf3]/40 shadow-[0_0_20px_rgba(0,218,243,0.1)]' :
                    'border border-[#3b494c]/30 opacity-60'
                  }`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded flex items-center justify-center"
                          style={{ background: SEVERITY_COLOR[req.severity] + '20', color: SEVERITY_COLOR[req.severity] }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{EMERGENCY_ICONS[req.type]}</span>
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm flex items-center gap-2">
                            {req.type.toUpperCase()}
                            <Badge text={req.severity} color={SEVERITY_COLOR[req.severity]} />
                          </div>
                          <div className="text-[9px] font-mono text-[#849396]">ID: {req.id} · {req.time}</div>
                        </div>
                      </div>
                      <Badge text={req.status} />
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3 text-[11px] font-mono">
                      <div><span className="text-[#849396] block text-[9px] uppercase">Location</span>{req.location}</div>
                      <div><span className="text-[#849396] block text-[9px] uppercase">Reporter</span>{req.submittedBy}</div>
                      <div><span className="text-[#849396] block text-[9px] uppercase">Phone</span>{req.phone}</div>
                      <div><span className="text-[#849396] block text-[9px] uppercase">Coords</span>{req.lat.toFixed(3)}, {req.lon.toFixed(3)}</div>
                    </div>
                    <div className="text-[11px] text-[#dee2f5] mb-3 bg-[#090e1b]/50 rounded p-2 border border-[#3b494c]/30">
                      "{req.description}"
                    </div>

                    {req.status === 'pending' && (
                      <div className="flex gap-3 flex-wrap mt-4">
                        <button onClick={() => onVerifySOS(req.id)}
                          className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-[#3ce36a]/10 to-[#3ce36a]/20 border border-[#3ce36a]/40 text-[#3ce36a] font-mono text-[10px] font-bold uppercase rounded-lg hover:from-[#3ce36a]/20 hover:to-[#3ce36a]/30 transition-all active:scale-95 shadow-[0_0_15px_rgba(60,227,106,0.15)]">
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>verified</span>
                          Verify & Alert All Depts
                        </button>
                        <button onClick={() => onRejectSOS(req.id)}
                          className="flex items-center gap-2 px-5 py-2 bg-[#FF4444]/10 border border-[#FF4444]/40 text-[#FF4444] font-mono text-[10px] font-bold uppercase rounded-lg hover:bg-[#FF4444]/20 transition-all active:scale-95">
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>cancel</span>
                          Reject (False Alarm)
                        </button>
                        <button
                          onClick={() => {
                            const available = units.filter(u => u.status === 'Idle' || u.status === 'Standby');
                            if (available.length) {
                              setDispatchModal({ unitId: available[0].id, zone: req.location });
                              setSelectedSosForDispatch(req.id);
                            }
                          }}
                          className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-[#00e5ff]/10 to-[#00daf3]/20 border border-[#00daf3]/40 text-[#00daf3] font-mono text-[10px] font-bold uppercase rounded-lg hover:from-[#00e5ff]/20 hover:to-[#00daf3]/30 transition-all active:scale-95 shadow-[0_0_15px_rgba(0,218,243,0.15)]">
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>send</span>
                          Dispatch Specific Unit
                        </button>
                      </div>
                    )}
                    {req.status === 'verified' && (
                      <div className="mt-4 p-3 rounded-lg bg-[#3ce36a]/10 border border-[#3ce36a]/30 text-[10px] font-mono text-[#3ce36a] flex items-center gap-3 shadow-[0_0_10px_rgba(60,227,106,0.1)]">
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check_circle</span>
                        Verified: Danger zone generated, departments alerted, automated routing adjusted
                      </div>
                    )}
                    {req.status === 'dispatched' && (
                      <div className="mt-4 p-3 rounded-lg bg-[#00daf3]/10 border border-[#00daf3]/30 text-[10px] font-mono text-[#00daf3] flex flex-col gap-2 shadow-[0_0_10px_rgba(0,218,243,0.1)]">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined animate-pulse" style={{ fontSize: '18px' }}>local_shipping</span>
                          <span className="font-bold">Units En-Route to Scene</span>
                        </div>
                        {dispatchedUnitsForReq.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-1 pl-7">
                            {dispatchedUnitsForReq.map(u => (
                              <span key={u.id} className="px-2 py-1 rounded bg-[#00daf3]/20 border border-[#00daf3]/40 text-white flex items-center gap-1">
                                {u.name} ({u.type}) <span className="text-[#00daf3]">ETA: {u.eta}</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )})}
              </div>
            </div>
          )}

          {/* ── MAP ── */}
          {tab === 'map' && (
            <div className="h-full flex overflow-hidden" style={{ height: 'calc(100vh - 56px)' }}>
              <div className="flex-1 relative">
                <MapView
                  nodes={mapNodes} edges={mapEdges}
                  dangerZones={dangerZones} hospitals={hospitals}
                  units={units} activePath={activePath} isAdmin
                />
                {/* Route panel overlay */}
                <div className="absolute top-3 right-3 z-[1000] w-72 bg-[#090e1b]/95 backdrop-blur border border-[#3b494c]/50 rounded-lg p-3 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                  <div className="text-[9px] font-mono text-[#849396] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#00e5ff]" style={{ fontSize: '12px' }}>route</span>
                    Safe Route Finder
                  </div>
                  <div className="space-y-2">
                    {/* From */}
                    <div className="text-[8px] font-mono text-[#849396]">FROM — YOUR LOCATION</div>
                    <select value={routeFrom} onChange={e => setRouteFrom(e.target.value)}
                      className="w-full bg-[#1a1f2d] border border-[#3b494c]/50 rounded px-2 py-1.5 text-[10px] text-white font-mono focus:outline-none focus:border-[#00e5ff]/60">
                      {mapNodes.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
                    </select>
                    {/* To — grouped */}
                    <div className="text-[8px] font-mono text-[#849396]">TO — EMERGENCY DESTINATION</div>
                    <select value={routeTo} onChange={e => setRouteTo(e.target.value)}
                      className="w-full bg-[#1a1f2d] border border-[#3b494c]/50 rounded px-2 py-1.5 text-[10px] text-white font-mono focus:outline-none focus:border-[#00e5ff]/60">
                      <optgroup label="🏥 Hospitals">
                        {mapNodes.filter(n => n.type === 'HOSPITAL').map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
                      </optgroup>
                      <optgroup label="🔥 Fire Stations">
                        {mapNodes.filter(n => n.type === 'FIRE_STATION').map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
                      </optgroup>
                      <optgroup label="🚔 Police">
                        {mapNodes.filter(n => n.type === 'POLICE').map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
                      </optgroup>
                      <optgroup label="⚡ Command">
                        {mapNodes.filter(n => n.type === 'COMMAND').map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
                      </optgroup>
                    </select>
                    <button onClick={handleFindRoute}
                      className="w-full py-2 bg-[#00e5ff] text-[#001f24] font-mono text-[10px] font-bold uppercase rounded hover:bg-[#00daf3] active:scale-95 transition-all">
                      {dangerZones.length > 0 ? '⚡ Recalculate Safe Route' : 'Calculate Route'}
                    </button>
                    {activePath.length > 0 && (
                      <div className="bg-[#001a10] rounded border border-[#3ce36a]/30 p-2">
                        <div className="text-[8px] font-mono text-[#3ce36a] mb-1 uppercase flex items-center gap-1">
                          <span>✓</span> {activePath.length} waypoints · avoiding {dangerZones.length} danger zone{dangerZones.length !== 1 ? 's' : ''}
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

                {/* Bottom data strip — Hospitals + Services Live */}
                <div className="absolute bottom-0 left-0 right-0 z-[1000] bg-[#090e1b]/95 backdrop-blur border-t border-[#3b494c]/40 px-3 py-2 overflow-x-auto">
                  <div className="flex gap-3 min-w-max">
                    {hospitals.slice(0, 5).map(h => {
                      const c = h.status === 'NORMAL' ? '#3ce36a' : h.status === 'ALERT' ? '#FF9F00' : '#FF4444';
                      return (
                        <div key={h.id} className="bg-[#1a1f2d] border border-[#3b494c]/40 rounded-lg px-3 py-1.5 flex items-center gap-2 shrink-0 min-w-[200px]">
                          <span className="material-symbols-outlined text-[#adc6ff]" style={{ fontSize: '16px' }}>local_hospital</span>
                          <div>
                            <div className="text-white text-[10px] font-bold truncate">{h.name}</div>
                            <div className="text-[8px] font-mono text-[#849396]">Beds: <span style={{ color: c }}>{h.availableBeds}</span>/{h.totalBeds} · ICU: <span style={{ color: c }}>{h.icuAvailable}</span>/{h.icuBeds} · <span style={{ color: c }}>{h.status}</span></div>
                          </div>
                        </div>
                      );
                    })}
                    {/* Ambulance count */}
                    <div className="bg-[#1a1f2d] border border-[#3b494c]/40 rounded-lg px-3 py-1.5 flex items-center gap-2 shrink-0">
                      <span className="material-symbols-outlined text-[#00daf3]" style={{ fontSize: '16px' }}>local_shipping</span>
                      <div>
                        <div className="text-white text-[10px] font-bold">Ambulances</div>
                        <div className="text-[8px] font-mono text-[#849396]">Ready: <span className="text-[#3ce36a]">{units.filter(u => u.type === 'AMBULANCE' && (u.status === 'Idle' || u.status === 'Standby')).length}</span> · Deployed: <span className="text-[#00daf3]">{units.filter(u => u.type === 'AMBULANCE' && u.status === 'En-Route').length}</span></div>
                      </div>
                    </div>
                    {/* Fire trucks */}
                    <div className="bg-[#1a1f2d] border border-[#3b494c]/40 rounded-lg px-3 py-1.5 flex items-center gap-2 shrink-0">
                      <span className="material-symbols-outlined text-[#FF9F00]" style={{ fontSize: '16px' }}>local_fire_department</span>
                      <div>
                        <div className="text-white text-[10px] font-bold">Fire Trucks</div>
                        <div className="text-[8px] font-mono text-[#849396]">Ready: <span className="text-[#3ce36a]">{units.filter(u => u.type === 'FIRE_TRUCK' && (u.status === 'Idle' || u.status === 'Standby')).length}</span> · Deployed: <span className="text-[#FF9F00]">{units.filter(u => u.type === 'FIRE_TRUCK' && u.status === 'En-Route').length}</span></div>
                      </div>
                    </div>
                    {/* Police */}
                    <div className="bg-[#1a1f2d] border border-[#3b494c]/40 rounded-lg px-3 py-1.5 flex items-center gap-2 shrink-0">
                      <span className="material-symbols-outlined text-[#7c83fd]" style={{ fontSize: '16px' }}>local_police</span>
                      <div>
                        <div className="text-white text-[10px] font-bold">Police Units</div>
                        <div className="text-[8px] font-mono text-[#849396]">Ready: <span className="text-[#3ce36a]">{units.filter(u => u.type === 'POLICE' && (u.status === 'Idle' || u.status === 'Standby')).length}</span> · Deployed: <span className="text-[#7c83fd]">{units.filter(u => u.type === 'POLICE' && u.status === 'En-Route').length}</span></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Broadcast overlay */}
                <div className="absolute bottom-14 right-3 z-[1000] w-64 bg-[#090e1b]/95 backdrop-blur border border-[#3b494c]/50 rounded-lg p-3">
                  <div className="text-[9px] font-mono text-[#849396] uppercase tracking-wider mb-2">Broadcast Message</div>
                  <form onSubmit={handleBroadcast} className="flex gap-2">
                    <input value={broadcastMsg} onChange={e => setBroadcastMsg(e.target.value)} placeholder="Type broadcast..."
                      className="flex-1 bg-[#1a1f2d] border border-[#3b494c]/50 rounded px-2 py-1.5 text-[10px] text-white font-mono focus:outline-none focus:border-[#00e5ff]/60 min-w-0" />
                    <button type="submit"
                      className="px-2 py-1.5 bg-[#00e5ff] text-[#001f24] font-mono text-[9px] font-bold uppercase rounded hover:bg-[#00daf3] active:scale-95 transition-all">
                      SEND
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* ── DEPARTMENTS ── */}
          {tab === 'departments' && (
            <div className="p-4 space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-[#00e5ff]" style={{ fontSize: '16px' }}>corporate_fare</span>
                Department Command Status
              </h2>
              {(['fire','police','rescue','ambulance'] as const).map(type => {
                const depts = departments.filter(d => d.type === type);
                const totalUnits = depts.reduce((s, d) => s + d.totalUnits, 0);
                const availUnits = depts.reduce((s, d) => s + d.availableUnits, 0);
                const color = type === 'fire' ? '#FF9F00' : type === 'police' ? '#7c83fd' : type === 'rescue' ? '#3ce36a' : '#00daf3';
                return (
                  <div key={type} className="bg-[#1a1f2d] border border-[#3b494c]/40 rounded-lg overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-[#3b494c]/30 bg-[#252a38]/60">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined" style={{ fontSize: '20px', color }}>{DEPT_ICONS[type]}</span>
                        <div>
                          <span className="font-bold text-white text-sm capitalize">{type} Department</span>
                          <span className="ml-3 text-[9px] font-mono text-[#849396]">{depts.length} stations · {availUnits}/{totalUnits} units available</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {depts.some(d => d.status !== 'NORMAL') && (
                          <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold text-[#FF9F00] border border-[#FF9F00]/40 bg-[#FF9F00]/10 animate-pulse">ON ALERT</span>
                        )}
                      </div>
                    </div>
                    <div className="divide-y divide-[#3b494c]/20">
                      {depts.map(d => (
                        <div key={d.id} className={`px-4 py-3 flex items-center justify-between ${d.status !== 'NORMAL' ? 'bg-[#FF9F00]/3' : ''}`}>
                          <div>
                            <div className="text-sm font-medium text-white">{d.name}</div>
                            <div className="text-[9px] font-mono text-[#849396]">{d.city} · {d.availableUnits}/{d.totalUnits} units ready</div>
                            {d.alertMsg && <div className="text-[10px] font-mono text-[#FF9F00] mt-0.5">⚠ {d.alertMsg}</div>}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-right">
                              <div className="w-20 h-1.5 bg-[#3b494c]/30 rounded-full overflow-hidden">
                                <div className="h-full rounded-full" style={{ width: `${(d.availableUnits/d.totalUnits)*100}%`, background: color }} />
                              </div>
                            </div>
                            <Badge text={d.status} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── FIELD UNITS ── */}
          {tab === 'units' && (
            <div className="p-6 animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#00e5ff]/15 flex items-center justify-center border border-[#00e5ff]/30 shadow-[0_0_15px_rgba(0,229,255,0.2)]">
                    <span className="material-symbols-outlined text-[#00e5ff]" style={{ fontSize: '18px' }}>directions_run</span>
                  </div>
                  Field Units Fleet
                </h2>
                <div className="flex gap-3 text-[10px] font-mono">
                  <span className="px-3 py-1.5 rounded-full bg-[#00daf3]/10 border border-[#00daf3]/30 text-[#00daf3] shadow-[0_0_10px_rgba(0,218,243,0.1)]">{deployedUnits.length} DEPLOYED</span>
                  <span className="px-3 py-1.5 rounded-full bg-[#3ce36a]/10 border border-[#3ce36a]/30 text-[#3ce36a] shadow-[0_0_10px_rgba(60,227,106,0.1)]">{units.filter(u=>u.status==='Idle'||u.status==='Standby').length} AVAILABLE</span>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
                {units.map(unit => (
                  <div key={unit.id} className={`glass-card rounded-xl p-5 border transition-all hover:scale-[1.02] ${
                    unit.status === 'Critical' ? 'border-[#FF4444]/50 shadow-[0_0_20px_rgba(255,68,68,0.15)]' :
                    unit.status === 'En-Route' || unit.status === 'On-Scene' ? 'border-[#00daf3]/40 shadow-[0_0_20px_rgba(0,218,243,0.15)]' :
                    'border-[#3b494c]/40 hover:border-[#00e5ff]/30'
                  }`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#090e1b]/50 border border-[#3b494c]/50">
                          <span className="material-symbols-outlined text-[20px]" style={{ color: STATUS_COLORS[unit.status] || '#849396' }}>
                            {UNIT_ICONS[unit.type]}
                          </span>
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm">{unit.name}</div>
                          <div className="text-[10px] font-mono text-[#849396] uppercase">{unit.type} · {unit.crew > 0 ? `${unit.crew} crew` : 'Unmanned'}</div>
                        </div>
                      </div>
                      <Badge text={unit.status} />
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-[11px] font-mono mb-4 bg-[#090e1b]/40 rounded-lg p-2.5 border border-[#3b494c]/30">
                      <div><span className="text-[#849396] block mb-1">Target Zone</span><span className="text-white truncate block">{unit.zone}</span></div>
                      <div><span className="text-[#849396] block mb-1">ETA</span><span style={{ color: STATUS_COLORS[unit.status] }} className="font-bold text-sm block">{unit.eta || '--'}</span></div>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-3 text-[10px] font-mono">
                        <span className="text-[#849396] w-14">Battery</span>
                        <div className="flex-1 h-1.5 bg-[#3b494c]/40 rounded-full overflow-hidden">
                          <div className="h-full rounded-full progress-glow" style={{ width:`${unit.battery}%`, background: unit.battery>50?'#3ce36a':unit.battery>25?'#FF9F00':'#FF4444', color: unit.battery>50?'#3ce36a':unit.battery>25?'#FF9F00':'#FF4444' }} />
                        </div>
                        <span className="text-[#849396] w-8 text-right font-bold">{unit.battery}%</span>
                      </div>
                      {unit.type !== 'DRONE' && (
                        <div className="flex items-center gap-3 text-[10px] font-mono">
                          <span className="text-[#849396] w-14">Fuel</span>
                          <div className="flex-1 h-1.5 bg-[#3b494c]/40 rounded-full overflow-hidden">
                            <div className="h-full rounded-full progress-glow" style={{ width:`${unit.fuel}%`, background: unit.fuel>50?'#3ce36a':unit.fuel>25?'#FF9F00':'#FF4444', color: unit.fuel>50?'#3ce36a':unit.fuel>25?'#FF9F00':'#FF4444' }} />
                          </div>
                          <span className="text-[#849396] w-8 text-right font-bold">{unit.fuel}%</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {(unit.status === 'Idle' || unit.status === 'Standby') ? (
                        <button onClick={() => setDispatchModal({ unitId: unit.id, zone: '' })}
                          className="flex-1 py-2 bg-gradient-to-r from-[#00e5ff]/10 to-[#00daf3]/20 border border-[#00e5ff]/40 text-[#00e5ff] font-mono text-[10px] font-bold uppercase rounded-lg hover:from-[#00e5ff]/20 hover:to-[#00daf3]/30 transition-all active:scale-95 shadow-[0_0_15px_rgba(0,229,255,0.15)]">
                          Dispatch Unit
                        </button>
                      ) : (unit.status === 'En-Route' || unit.status === 'On-Scene') ? (
                        <button onClick={() => onRecallUnit(unit.id)}
                          className="flex-1 py-2 bg-gradient-to-r from-[#FF9F00]/10 to-[#FF9F00]/20 border border-[#FF9F00]/40 text-[#FF9F00] font-mono text-[10px] font-bold uppercase rounded-lg hover:from-[#FF9F00]/20 hover:to-[#FF9F00]/30 transition-all active:scale-95 shadow-[0_0_15px_rgba(255,159,0,0.15)]">
                          Recall to Base
                        </button>
                      ) : (
                        <button disabled className="flex-1 py-2 bg-[#1a1f2d] border border-[#3b494c]/30 text-[#849396] font-mono text-[10px] uppercase rounded-lg opacity-50 cursor-not-allowed">
                          Unavailable
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── HOSPITALS ── */}
          {tab === 'hospitals' && (
            <div className="p-4">
              <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#adc6ff]" style={{ fontSize: '16px' }}>local_hospital</span>
                Hospital Capacity & Alert Status
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {hospitals.map(h => {
                  const bedPct = Math.round((h.availableBeds / h.totalBeds) * 100);
                  const icuPct = Math.round((h.icuAvailable / h.icuBeds) * 100);
                  return (
                    <div key={h.id} className={`bg-[#1a1f2d] border rounded-lg p-4 ${
                      h.status === 'CRITICAL' ? 'border-[#FF4444]/50 bg-[#FF4444]/4' :
                      h.status === 'ALERT'    ? 'border-[#FF9F00]/50 bg-[#FF9F00]/4' :
                      'border-[#3b494c]/40'
                    }`}>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="font-bold text-white text-sm">{h.name}</div>
                          <div className="text-[9px] font-mono text-[#849396]">{h.city}</div>
                        </div>
                        <Badge text={h.status} />
                      </div>
                      {h.alertMsg && (
                        <div className="mb-3 px-3 py-2 rounded bg-[#FF9F00]/10 border border-[#FF9F00]/30 text-[10px] font-mono text-[#FF9F00]">
                          ⚠ {h.alertMsg}
                        </div>
                      )}
                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between text-[9px] font-mono mb-1">
                            <span className="text-[#849396]">General Beds</span>
                            <span className="text-white">{h.availableBeds} / {h.totalBeds} available ({bedPct}%)</span>
                          </div>
                          <div className="h-2 bg-[#3b494c]/30 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width:`${bedPct}%`, background: bedPct>50?'#3ce36a':bedPct>25?'#FF9F00':'#FF4444' }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-[9px] font-mono mb-1">
                            <span className="text-[#849396]">ICU Beds</span>
                            <span className="text-white">{h.icuAvailable} / {h.icuBeds} available ({icuPct}%)</span>
                          </div>
                          <div className="h-2 bg-[#3b494c]/30 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width:`${icuPct}%`, background: icuPct>40?'#adc6ff':icuPct>20?'#FF9F00':'#FF4444' }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── MESH NETWORK — CYBER TACTICAL UI ── */}
          {tab === 'mesh' && (
            <div className="p-6 h-[calc(100vh-80px)] flex flex-col gap-6 animate-fade-in font-mono bg-[#050914] relative overflow-hidden">
              {/* Background Scanner Effect */}
              <div className="absolute top-0 left-0 w-full h-[2px] bg-[#00e5ff]/20 animate-[scan_3s_linear_infinite]" style={{ boxShadow: '0 0 20px #00e5ff' }} />

              {/* Top Control Bar */}
              <div className="flex items-center justify-between bg-[#0a0f1d] border border-[#00e5ff]/30 p-4 rounded-lg shadow-[0_0_15px_rgba(0,229,255,0.1)] shrink-0 z-10">
                <div>
                  <h2 className="text-xl font-bold text-[#00e5ff] tracking-widest flex items-center gap-3 drop-shadow-[0_0_8px_#00e5ff]">
                    <span className="material-symbols-outlined">settings_input_antenna</span>
                    TACTICAL MESH COMMS
                  </h2>
                  <p className="text-[10px] text-[#00daf3]/60 mt-1 uppercase tracking-widest">
                    {meshOnline ? '> SECURE SATELLITE UPLINK ACTIVE' : '> WARNING: GLOBAL BLACKOUT DETECTED. P2P RELAY MODE ENGAGED.'}
                  </p>
                </div>
                <button onClick={() => { setMeshOnline(v => { onMeshToggle(!v); return !v; }); }}
                  className={`px-6 py-3 border text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${
                    meshOnline
                      ? 'bg-[#00e5ff]/10 text-[#00e5ff] border-[#00e5ff]/50 hover:bg-[#00e5ff]/20 hover:shadow-[0_0_20px_rgba(0,229,255,0.4)]'
                      : 'bg-[#FF4444]/10 text-[#FF4444] border-[#FF4444] animate-pulse shadow-[0_0_20px_rgba(255,68,68,0.4)]'
                  }`}>
                  <span className="material-symbols-outlined">{meshOnline ? 'satellite_alt' : 'portable_wifi_off'}</span>
                  {meshOnline ? 'SEVER CONNECTION (SIMULATE BLACKOUT)' : 'RESTORE CONNECTION'}
                </button>
              </div>

              {/* Main 3-Column Interface */}
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0 z-10">
                
                {/* ── DEVICE 1: VICTIM NODE ── */}
                <div className="flex flex-col bg-[#0a0f1d] border border-[#3b494c] rounded-lg relative overflow-hidden">
                  <div className="bg-[#131b2f] border-b border-[#3b494c] p-3 flex justify-between items-center">
                    <span className="text-[10px] text-[#849396]">DEVICE: [VICTIM-04]</span>
                    <div className="flex gap-2">
                      <button onClick={() => setD1Wifi(!d1Wifi)} className={`material-symbols-outlined text-[16px] transition-colors hover:scale-110 ${d1Wifi ? 'text-[#3ce36a]' : 'text-[#FF4444]'}`} title="Toggle Wi-Fi">
                        {d1Wifi ? 'wifi' : 'signal_wifi_off'}
                      </button>
                      <button onClick={() => setD1Ble(!d1Ble)} className={`material-symbols-outlined text-[16px] transition-colors hover:scale-110 ${d1Ble ? 'text-[#00e5ff]' : 'text-[#849396]'}`} title="Toggle Bluetooth">
                        {d1Ble ? 'bluetooth' : 'bluetooth_disabled'}
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex-1 p-4 overflow-y-auto flex flex-col justify-end gap-3">
                    {device1Log.length === 0 && <div className="text-[#3b494c] text-[10px] text-center">NO TRANSMISSIONS YET.</div>}
                    {device1Log.map((log, i) => (
                      <div key={i} className={`p-2 rounded max-w-[85%] text-[11px] ${
                        log.inbound 
                          ? 'self-start bg-[#3ce36a]/10 border border-[#3ce36a]/40 text-[#3ce36a]' 
                          : 'self-end bg-[#00e5ff]/10 border border-[#00e5ff]/40 text-[#00e5ff] shadow-[0_0_10px_rgba(0,229,255,0.1)]'
                      }`}>
                        <div className="text-[8px] opacity-50 mb-1">{log.inbound ? `RX_INBOUND FROM [${log.sender}]` : 'TX_OUTBOUND'}</div>
                        {log.msg}
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleDemoTransmit} className="p-3 border-t border-[#3b494c] bg-[#050914] flex gap-2">
                    <span className="text-[#00e5ff] mt-2">{'>'}</span>
                    <input value={demoInput} onChange={e => setDemoInput(e.target.value)} disabled={isTransmitting}
                      placeholder="ENTER SOS PAYLOAD..."
                      className="flex-1 bg-transparent text-[#00e5ff] text-xs focus:outline-none placeholder-[#3b494c]" />
                    <button type="submit" disabled={isTransmitting || !demoInput.trim()}
                      className="text-[#00e5ff] disabled:opacity-30 hover:text-[#fff] transition-colors">
                      <span className="material-symbols-outlined">send</span>
                    </button>
                  </form>
                </div>

                {/* ── DEVICE 2: RELAY NODE ── */}
                <div className="flex flex-col bg-[#0a0f1d] border border-[#3b494c] rounded-lg relative overflow-hidden">
                  <div className="bg-[#131b2f] border-b border-[#3b494c] p-3 flex justify-between items-center">
                    <span className="text-[10px] text-[#849396]">DEVICE: [RELAY-01]</span>
                    <div className="flex gap-2">
                      <button onClick={() => setD2Wifi(!d2Wifi)} className={`material-symbols-outlined text-[16px] transition-colors hover:scale-110 ${d2Wifi ? 'text-[#3ce36a]' : 'text-[#FF4444]'}`} title="Toggle Wi-Fi">
                        {d2Wifi ? 'wifi' : 'signal_wifi_off'}
                      </button>
                      <button onClick={() => setD2Ble(!d2Ble)} className={`material-symbols-outlined text-[16px] transition-colors hover:scale-110 ${d2Ble ? 'text-[#00e5ff]' : 'text-[#849396]'}`} title="Toggle Bluetooth">
                        {d2Ble ? 'bluetooth' : 'bluetooth_disabled'}
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex-1 p-4 overflow-y-auto flex flex-col justify-end gap-3">
                    {device2Log.length === 0 && <div className="text-[#3b494c] text-[10px] text-center">LISTENING FOR BLE ADVERTISEMENTS...</div>}
                    {device2Log.map((log, i) => (
                      <div key={i} className={`p-2 rounded max-w-[85%] text-[11px] ${
                        log.inbound 
                          ? 'self-start bg-[#3ce36a]/10 border border-[#3ce36a]/40 text-[#3ce36a]' 
                          : 'self-end bg-[#00e5ff]/10 border border-[#00e5ff]/40 text-[#00e5ff] shadow-[0_0_10px_rgba(0,229,255,0.1)]'
                      }`}>
                        <div className="text-[8px] opacity-50 mb-1">{log.inbound ? `RX_INBOUND FROM [${log.sender}]` : 'TX_OUTBOUND_REPLY'}</div>
                        {log.msg}
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleDemoReply} className="p-3 border-t border-[#3b494c] bg-[#050914] flex gap-2">
                    <span className="text-[#3ce36a] mt-2">{'>'}</span>
                    <input value={demoReplyInput} onChange={e => setDemoReplyInput(e.target.value)} disabled={isTransmitting}
                      placeholder="REPLY TO VICTIM..."
                      className="flex-1 bg-transparent text-[#3ce36a] text-xs focus:outline-none placeholder-[#3b494c]" />
                    <button type="submit" disabled={isTransmitting || !demoReplyInput.trim()}
                      className="text-[#3ce36a] disabled:opacity-30 hover:text-[#fff] transition-colors">
                      <span className="material-symbols-outlined">reply</span>
                    </button>
                  </form>
                </div>

                {/* ── TERMINAL: SYSTEM OPS ── */}
                <div className="flex flex-col bg-[#050914] border border-[#00daf3]/50 rounded-lg relative overflow-hidden shadow-[0_0_20px_rgba(0,218,243,0.1)]">
                  <div className="bg-[#00daf3]/10 border-b border-[#00daf3]/50 p-3 flex justify-between items-center">
                    <span className="text-[10px] text-[#00daf3] font-bold tracking-widest">SYSTEM_OPS // LIVE_FEED</span>
                    <span className="w-2 h-2 rounded-full bg-[#00daf3] animate-ping" />
                  </div>
                  
                  <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-1 text-[10px]">
                    {sysOpsLog.map((log, i) => (
                      <div key={i} className="flex gap-3 leading-relaxed">
                        <span className="text-[#3b494c] shrink-0">[{log.ts}]</span>
                        <span style={{ color: log.color }}>{log.text}</span>
                      </div>
                    ))}
                    {isTransmitting && (
                      <div className="flex gap-3 leading-relaxed animate-pulse">
                        <span className="text-[#3b494c] shrink-0">[{now()}]</span>
                        <span className="text-[#00daf3]">_</span>
                      </div>
                    )}
                  </div>

                  {/* Queue Display */}
                  <div className="p-3 border-t border-[#00daf3]/50 bg-[#00daf3]/5 flex justify-between items-center">
                    <span className="text-[10px] text-[#00daf3]">STORE-AND-FORWARD QUEUE:</span>
                    <span className={`text-xs font-bold ${meshPackets.length > 0 ? 'text-[#FF9F00] animate-pulse' : 'text-[#3ce36a]'}`}>
                      [{meshPackets.length} PENDING]
                    </span>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ── AID ── */}
          {tab === 'aid' && (
            <div className="p-4">
              <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#00e5ff]" style={{ fontSize: '16px' }}>inventory_2</span>
                Aid Logistics Pipeline
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {aidPackages.map(pkg => (
                  <div key={pkg.id} className="bg-[#1a1f2d] border border-[#3b494c]/40 rounded-lg p-4 hover:border-[#00e5ff]/20 transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-bold text-white text-sm">{pkg.provider} → {pkg.dest}</div>
                        <div className="text-[9px] font-mono text-[#849396]">{pkg.type} · {pkg.qty} MT · {pkg.method}</div>
                      </div>
                      <Badge text={pkg.status} />
                    </div>
                    <div className="h-2 bg-[#3b494c]/30 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width:`${pkg.progress}%`,
                        background: pkg.status==='DELIVERED'?'#3ce36a':pkg.status==='QUEUED'?'#849396':'#00daf3' }} />
                    </div>
                    <div className="text-[9px] font-mono text-[#849396] text-right mt-1">{pkg.progress}%</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="h-7 border-t border-[#3b494c]/20 bg-[#090e1b]/60 flex items-center justify-between px-4 shrink-0">
          <span className="text-[8px] font-mono text-[#3b494c] uppercase tracking-wider">Phoenix Grid Admin · v2.0</span>
          <span className="text-[8px] font-mono text-[#3b494c]">© 2026 All Rights Reserved</span>
        </footer>
      </div>

      {/* ── Dispatch Modal ── */}
      {dispatchModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) { setDispatchModal(null); setSelectedSosForDispatch(''); } }}
        >
          <div className="bg-[#1a1f2d] border border-[#00e5ff]/30 rounded-xl p-6 w-[380px] shadow-[0_0_40px_rgba(0,229,255,0.2)]">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#00e5ff]" style={{ fontSize: '18px' }}>send</span>
              Dispatch Unit
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-[9px] font-mono text-[#849396] uppercase mb-1 block">Select Unit</label>
                <select value={dispatchModal.unitId}
                  onChange={e => setDispatchModal(p => p ? { ...p, unitId: e.target.value } : null)}
                  className="w-full bg-[#090e1b] border border-[#3b494c]/50 rounded px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#00e5ff]/60">
                  {units.filter(u => u.status === 'Idle' || u.status === 'Standby').map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.type})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[9px] font-mono text-[#849396] uppercase mb-1 block">Target Zone</label>
                <input value={dispatchModal.zone}
                  onChange={e => setDispatchModal(p => p ? { ...p, zone: e.target.value } : null)}
                  placeholder="e.g. Gulberg Lahore, Sector B-4"
                  className="w-full bg-[#090e1b] border border-[#3b494c]/50 rounded px-3 py-2 text-xs text-white font-mono placeholder-[#3b494c] focus:outline-none focus:border-[#00e5ff]/60" />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => {
                if (dispatchModal.zone) {
                  onDispatchUnit(dispatchModal.unitId, dispatchModal.zone, selectedSosForDispatch || undefined);
                  setDispatchModal(null);
                  setSelectedSosForDispatch('');
                }
              }}
                className="flex-1 py-2.5 bg-[#00e5ff] text-[#001f24] font-mono text-xs font-bold uppercase rounded hover:bg-[#00daf3] active:scale-95 transition-all">
                Dispatch Now
              </button>
              <button onClick={() => { setDispatchModal(null); setSelectedSosForDispatch(''); }}
                className="flex-1 py-2.5 bg-[#3b494c]/30 border border-[#3b494c]/50 text-[#849396] font-mono text-xs uppercase rounded hover:bg-[#3b494c]/50 active:scale-95 transition-all">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
