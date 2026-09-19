import { useState, useEffect, useRef } from 'react';
import AdminPanel from './AdminPanel';
import UserPanel from './UserPanel';
import LandingPage from './LandingPage';
import {
  Role, SosRequest, DangerZone, Hospital, Department, RescueUnit,
  Alert, MeshNode, MapNode, MapEdge,
  INITIAL_HOSPITALS, INITIAL_DEPARTMENTS, INITIAL_UNITS,
  MAP_NODES, MAP_EDGES, INITIAL_MESH,
  now, uid, EMERGENCY_ICONS,
} from './types';
import { MeshNetworkManager, SyncPacket } from './meshSyncEngine';

// Backend API URL
const API_BASE = 'http://localhost:8081/api';

export default function App() {
  // ── Auth ──────────────────────────────────────────────────
  const [isAuth, setIsAuth]         = useState(false);
  const [showLanding, setShowLanding] = useState(true);
  const [role, setRole]             = useState<Role>('user');
  const [currentUser, setCurrentUser] = useState('');
  const [displayName, setDisplayName] = useState('');

  // Login/Signup form
  const [isSignup, setSignup]       = useState(false);
  const [loginUser, setLoginUser]   = useState('');
  const [loginPass, setLoginPass]   = useState('');
  const [loginDisplay, setLoginDisplay] = useState('');
  const [loginErr,  setLoginErr]    = useState('');
  const [showPass,  setShowPass]    = useState(false);
  const [isLoading, setIsLoading]   = useState(false);

  // ── Shared emergency state ────────────────────────────────
  const [sosRequests, setSosRequests]     = useState<SosRequest[]>([]);
  const [dangerZones, setDangerZones]     = useState<DangerZone[]>([]);
  const [hospitals,   setHospitals]       = useState<Hospital[]>(INITIAL_HOSPITALS);
  const [departments, setDepartments]     = useState<Department[]>(INITIAL_DEPARTMENTS);
  const [units,       setUnits]           = useState<RescueUnit[]>(INITIAL_UNITS);
  const [alerts,      setAlerts]          = useState<Alert[]>([
    { id: uid(), msg: 'Phoenix Grid operational — all systems nominal', level: 'info',     time: now(), source: 'System'   },
    { id: uid(), msg: 'P2P mesh network online — 4 nodes active',       level: 'info',     time: now(), source: 'Mesh Net'  },
    { id: uid(), msg: 'PDMA weather advisory: monitor flood zones',      level: 'warn',     time: now(), source: 'PDMA'     },
  ]);
  const [meshNodes,   setMeshNodes]       = useState<MeshNode[]>(INITIAL_MESH);
  const [meshPackets, setMeshPackets]     = useState<SyncPacket[]>([]);
  const [isBlackout,  setIsBlackout]      = useState(false);
  const [mapNodes]                        = useState<MapNode[]>(MAP_NODES);
  const [mapEdges]                        = useState<MapEdge[]>(MAP_EDGES);
  const [syncStatus, setSyncStatus]       = useState<'online'|'offline'|'syncing'>('offline');

  // ── Mesh Engine Singleton ──────────────────────────────────
  const meshManagerRef = useRef(MeshNetworkManager.getInstance());

  // Sync mesh engine state → React UI
  useEffect(() => {
    const manager = meshManagerRef.current;
    const listener = () => {
      setMeshPackets([...manager.packetQueue]);
    };
    manager.addListener(listener);
  }, []);

  // ── Live Mesh Simulation — battery drain, signal flicker ──
  useEffect(() => {
    setMeshNodes(prev => prev.map(node => {
      // Blackout mode → gateways go offline, signal drops heavily
      if (isBlackout && node.id.includes('00')) {
        return { ...node, signal: 0, status: 'OFFLINE' as const, lastSeen: now() };
      } else if (!isBlackout && node.id.includes('00')) {
        return { ...node, signal: 100, status: 'ONLINE' as const, lastSeen: 'LIVE' };
      }
      return node;
    }));
  }, [isBlackout]);

  const handleUpdateNode = (nodeId: string, updates: Partial<MeshNode>) => {
    setMeshNodes(prev => prev.map(n => n.id === nodeId ? { ...n, ...updates } : n));
  };

  // ── Mesh Broadcast Handler ─────────────────────────────────
  const handleMeshBroadcast = (msg: string) => {
    const manager = meshManagerRef.current;
    manager.sendPacket(msg, currentUser || 'ADMIN');
    setMeshPackets([...manager.packetQueue]);
    const activeCount = meshNodes.filter(n => n.status !== 'OFFLINE').length;
    addAlert(`📡 MESH P2P: "${msg}" → relayed through ${activeCount} active nodes (${manager.packetQueue.length} queued)`, 'info', 'Mesh Net');
  };

  // ── Blackout Toggle Handler ────────────────────────────────
  const handleMeshToggle = (online: boolean) => {
    const manager = meshManagerRef.current;
    setIsBlackout(!online);
    manager.setConnectionMode(online);
    if (online) {
      const flushed = manager.packetQueue.length;
      setMeshPackets([]);
      addAlert(`🟢 NETWORK RESTORED: Internet re-established. ${flushed} queued mesh packets synced to server. All nodes reconnecting...`, 'info', 'Mesh Net');
    } else {
      addAlert(`🔴 BLACKOUT DETECTED: Cell towers & internet DOWN. Mesh P2P activated — users connecting via Bluetooth/WiFi Direct relay. Store-and-forward mode enabled.`, 'critical', 'Mesh Net');
    }
  };

  // Restore session
  useEffect(() => {
    const saved = sessionStorage.getItem('phx_session');
    if (saved) {
      const s = JSON.parse(saved);
      setIsAuth(true); setRole(s.role); setCurrentUser(s.user); setDisplayName(s.display);
      setShowLanding(false);
    }
  }, []);

  // ── P2P Sync Polling (Local Hotspot) ──────────────────────
  const stateRef = useRef({ sosRequests, dangerZones, units, hospitals });
  useEffect(() => {
    stateRef.current = { sosRequests, dangerZones, units, hospitals };
  }, [sosRequests, dangerZones, units, hospitals]);

  const syncStatusRef = useRef<'online'|'offline'|'syncing'>('offline');
  const setSyncSafe = (s: 'online'|'offline'|'syncing') => {
    if (syncStatusRef.current !== s) {
      syncStatusRef.current = s;
      setSyncStatus(s);
    }
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const { sosRequests: s, dangerZones: d, units: u, hospitals: h } = stateRef.current;
        const payload = { timestamp: Date.now(), sosRequests: s, dangerZones: d, units: u, hospitals: h };
        setSyncSafe('syncing');
        const res = await fetch(`${API_BASE}/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(2000),
        });
        if (res.ok) {
          setSyncSafe('online');
          const pollRes = await fetch(`${API_BASE}/sync`, { signal: AbortSignal.timeout(2000) });
          const data = await pollRes.json();
          if (data && data.sosRequests && data.sosRequests.length > s.length) {
            setSosRequests(data.sosRequests);
            setDangerZones(data.dangerZones);
            setUnits(data.units);
            setHospitals(data.hospitals);
          }
        } else {
          setSyncSafe('offline');
        }
      } catch { setSyncSafe('offline'); }
    }, 10000); // poll every 10s instead of 3s
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Login handler ─────────────────────────────────────────
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginErr('');

    try {
      const endpoint = isSignup ? `${API_BASE}/auth/signup` : `${API_BASE}/auth/login`;
      const payload = isSignup 
        ? { username: loginUser, password: loginPass, displayName: loginDisplay, city: 'Lahore' }
        : { username: loginUser, password: loginPass };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        setIsAuth(true); 
        setRole(data.role as Role);
        setCurrentUser(data.user); 
        setDisplayName(data.display);
        sessionStorage.setItem('phx_session', JSON.stringify({ role: data.role, user: data.user, display: data.display }));
      } else {
        setLoginErr(data.message || 'Authentication failed.');
      }
    } catch (err) {
      setLoginErr('Could not connect to Phoenix Server. Ensure backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuth(false); sessionStorage.removeItem('phx_session');
    setLoginUser(''); setLoginPass(''); setLoginErr(''); setLoginDisplay('');
    setShowLanding(true);
  };

  // ── Alert helper ──────────────────────────────────────────
  const addAlert = (msg: string, level: Alert['level'], source: string) => {
    setAlerts(prev => [{ id: uid(), msg, level, time: now(), source }, ...prev.slice(0, 49)]);
  };

  // ── Helper: Calculate ETA based on distance ───────────────
  const calculateETA = (lat1: number, lon1: number, lat2: number, lon2: number): string => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distKm = R * c;
    
    // Assume average emergency response speed is 60 km/h (1 km/min)
    // Add 2 mins base dispatch time
    const totalMins = Math.max(1, Math.round(distKm * 1.0)) + 2;
    const secs = Math.floor(Math.random() * 60);
    return `${totalMins}:${String(secs).padStart(2, '0')}`;
  };

  // ── SOS submission (from user) ────────────────────────────
  const handleSubmitSOS = (reqData: Omit<SosRequest, 'id' | 'status' | 'time'>) => {
    const newReq: SosRequest = { ...reqData, id: uid(), status: 'pending', time: now() };
    setSosRequests(prev => [newReq, ...prev]);
    addAlert(`NEW SOS: ${reqData.type.toUpperCase()} at ${reqData.location} — severity ${reqData.severity}`, 'critical', `Citizen: ${reqData.submittedBy}`);

    // ── Persist to SQL Server (fire-and-forget) ──────────
    fetch(`${API_BASE}/sos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: newReq.id,
        type: newReq.type,
        severity: newReq.severity,
        location: newReq.location,
        phone: reqData.phone || '',
        description: newReq.description,
        status: 'pending',
        submittedBy: newReq.submittedBy,
        lat: newReq.lat,
        lon: newReq.lon,
      }),
    }).then(r => {
      if (r.ok) console.log('[SOS] Saved to SQL:', newReq.id);
      else console.warn('[SOS] SQL save failed (offline mode)');
    }).catch(() => console.warn('[SOS] Backend unreachable — running in offline mode'));
  };

  // ── Admin verifies SOS → triggers full chain ──────────────
  const handleVerifySOS = (sosId: string) => {
    const req = sosRequests.find(r => r.id === sosId);
    if (!req) return;

    // 1. Update SOS status
    setSosRequests(prev => prev.map(r => r.id === sosId ? { ...r, status: 'verified' } : r));

    // 2. Add danger zone to map
    const newZone: DangerZone = {
      id: uid(),
      lat: req.lat, lon: req.lon,
      radius: req.severity === 'CRITICAL' ? 2000 : req.severity === 'HIGH' ? 1200 : 600,
      type: req.type,
      description: req.description,
      verifiedAt: now(),
      severity: req.severity,
    };
    setDangerZones(prev => [...prev, newZone]);

    // 3. Alert ALL hospitals — reduce available beds
    setHospitals(prev => prev.map(h => {
      const bedsDrop = req.severity === 'CRITICAL' ? 40 : req.severity === 'HIGH' ? 20 : 10;
      const icuDrop  = req.severity === 'CRITICAL' ? 5  : req.severity === 'HIGH' ? 3  : 1;
      const newBeds  = Math.max(0, h.availableBeds - bedsDrop);
      const newIcu   = Math.max(0, h.icuAvailable  - icuDrop);
      const newStatus: Hospital['status'] = newBeds < 80 ? 'CRITICAL' : newBeds < 150 ? 'ALERT' : 'NORMAL';
      return {
        ...h,
        availableBeds: newBeds,
        icuAvailable:  newIcu,
        status: newStatus,
        alertMsg: `EMERGENCY ALERT: ${req.type.toUpperCase()} at ${req.location}. Prepare for mass casualties. ${bedsDrop} beds reserved.`,
      };
    }));

    // 4. Alert ALL departments
    setDepartments(prev => prev.map(d => ({
      ...d,
      status: 'ALERT',
      availableUnits: Math.max(0, d.availableUnits - (req.severity === 'CRITICAL' ? 3 : 1)),
      alertMsg: `DEPLOY: ${req.type.toUpperCase()} emergency at ${req.location}. Severity: ${req.severity}. Respond immediately.`,
    })));

    // 5. Broadcast alerts for each department type
    const deptMessages = [
      { dept: 'Fire Brigade',     msg: `🔥 FIRE ALERT: ${req.type} incident at ${req.location}. Deploy fire response units immediately.` },
      { dept: 'Police Command',   msg: `🚔 POLICE ALERT: Secure perimeter at ${req.location}. ${req.description}` },
      { dept: 'Rescue 1122',      msg: `🚑 RESCUE ALERT: Mass casualty event at ${req.location}. Severity: ${req.severity}. Deploy all available units.` },
      { dept: 'Ambulance Service',msg: `🚨 AMBULANCE ALERT: Medical emergency at ${req.location}. All available ambulances to scene.` },
      { dept: 'All Hospitals',    msg: `🏥 HOSPITAL ALERT: Prepare emergency wards. ${req.type.toUpperCase()} at ${req.location}. Expect incoming casualties.` },
    ];
    deptMessages.forEach(dm => addAlert(dm.msg, 'critical', dm.dept));

    // 6. Auto-Dispatch Units
    const reqTypes: Record<string, string[]> = {
      fire: ['FIRE_TRUCK', 'RESCUE'],
      medical: ['AMBULANCE'],
      bombing: ['POLICE', 'AMBULANCE', 'RESCUE', 'FIRE_TRUCK'],
      accident: ['AMBULANCE', 'POLICE'],
      earthquake: ['RESCUE', 'DRONE', 'AMBULANCE'],
      flood: ['RESCUE', 'DRONE'],
      chemical: ['RESCUE', 'FIRE_TRUCK', 'AMBULANCE'],
      other: ['POLICE', 'RESCUE']
    };
    const neededTypes = reqTypes[req.type] || ['RESCUE'];
    const maxDispatch = (req.severity === 'CRITICAL' || req.severity === 'HIGH') ? 8 : 2;

    setUnits(prev => {
      let dispatchedCount = 0;
      return prev.map(u => {
        if ((u.status === 'Idle' || u.status === 'Standby') && neededTypes.includes(u.type) && dispatchedCount < maxDispatch) {
          dispatchedCount++;
          const calculatedEta = calculateETA(u.lat, u.lon, req.lat, req.lon);
          return {
            ...u,
            status: 'En-Route',
            zone: req.location,
            lat: req.lat,
            lon: req.lon,
            eta: calculatedEta
          };
        }
        return u;
      });
    });

    // 7. Route recalculation alert
    addAlert(`⚡ ROUTES RECALCULATED: ${req.location} marked as danger zone. Safe routes updated — avoid affected area.`, 'warn', 'Route Engine');

    // 8. General verified alert
    addAlert(`✅ SOS VERIFIED: ${req.type.toUpperCase()} at ${req.location} confirmed. Danger zone active. Auto-dispatched response teams.`, 'critical', 'Admin CMD');

    // 9. Persist status change to SQL Server ──────────────
    fetch(`${API_BASE}/sos/${sosId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'verified' }),
    }).then(r => r.ok && console.log('[SOS] Verified in SQL:', sosId))
      .catch(() => console.warn('[SOS] SQL update failed (offline)'));
  };

  // ── Admin rejects SOS ─────────────────────────────────────
  const handleRejectSOS = (sosId: string) => {
    setSosRequests(prev => prev.map(r => r.id === sosId ? { ...r, status: 'rejected' } : r));
    addAlert(`SOS report rejected by admin — insufficient evidence or duplicate report.`, 'info', 'Admin CMD');

    // Persist to SQL
    fetch(`${API_BASE}/sos/${sosId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'rejected' }),
    }).then(r => r.ok && console.log('[SOS] Rejected in SQL:', sosId))
      .catch(() => console.warn('[SOS] SQL reject failed (offline)'));
  };

  // ── Admin recalls unit (false alarm) ─────────────────────
  const handleRecallUnit = (unitId: string) => {
    const unit = units.find(u => u.id === unitId);
    if (!unit) return;
    setUnits(prev => prev.map(u => u.id === unitId
      ? { ...u, status: 'Standby', zone: 'Base', eta: '--' }
      : u
    ));
    addAlert(`↩ UNIT RECALLED: ${unit.name} (${unit.type}) returned to base — false alarm or mission complete.`, 'info', 'Dispatch CMD');

    // Persist recall + false alarm flag to SQL
    fetch(`${API_BASE}/dispatch/unit/${encodeURIComponent(unitId)}/recall`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isFalseAlarm: true }),
    }).then(r => r.ok && console.log('[Dispatch] Recall saved to SQL:', unitId))
      .catch(() => console.warn('[Dispatch] SQL recall failed (offline)'));
  };

  // ── Admin dispatches unit ─────────────────────────────────
  const handleDispatchUnit = (unitId: string, zone: string, sosId?: string) => {
    const unit = units.find(u => u.id === unitId);
    if (!unit) return;
    
    let destLat = unit.lat;
    let destLon = unit.lon;
    let calculatedEta = `${Math.floor(Math.random() * 15) + 3}:${String(Math.floor(Math.random() * 59)).padStart(2,'0')}`;
    
    if (sosId) {
      const sos = sosRequests.find(r => r.id === sosId);
      if (sos) {
        destLat = sos.lat;
        destLon = sos.lon;
        calculatedEta = calculateETA(unit.lat, unit.lon, destLat, destLon);
      }
    }

    setUnits(prev => prev.map(u => u.id === unitId
      ? { ...u, status: 'En-Route', zone, lat: destLat, lon: destLon, eta: calculatedEta }
      : u
    ));
    if (sosId) {
      setSosRequests(prev => prev.map(r => r.id === sosId ? { ...r, status: 'dispatched' } : r));
      // Update SOS status in SQL
      fetch(`${API_BASE}/sos/${sosId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'dispatched' }),
      }).catch(() => {});
    }
    addAlert(`🚀 UNIT DISPATCHED: ${unit.name} (${unit.type}) → ${zone}. ETA: ${calculatedEta}`, 'warn', 'Dispatch CMD');

    // Save dispatch record to SQL Server ─────────────────
    const dispatchId = uid();
    fetch(`${API_BASE}/dispatch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: dispatchId,
        sosId: sosId || null,
        unitId: unit.id,
        unitName: unit.name,
        unitType: unit.type,
        zone,
        eta: calculatedEta,
        dispatchedBy: currentUser,
        isFalseAlarm: false,
      }),
    }).then(r => r.ok && console.log('[Dispatch] Saved to SQL:', dispatchId))
      .catch(() => console.warn('[Dispatch] SQL save failed (offline)'));
  };

  // ── Render Logic ──────────────────────────────────────────
  if (!isAuth && showLanding) {
    return <LandingPage onLaunchCommandCenter={() => setShowLanding(false)} />;
  }

  // ── Login Screen ──────────────────────────────────────────
  if (!isAuth && !showLanding) {
    return (
      <div className="h-screen w-screen bg-[#0e1320] flex items-center justify-center relative p-4">
        {/* Back to landing */}
        <button onClick={() => setShowLanding(true)} className="absolute top-6 left-6 flex items-center gap-2 text-[#849396] hover:text-white transition-colors font-mono text-sm z-10">
          <span className="material-symbols-outlined">arrow_back</span> Return to Grid
        </button>

        {/* Grid bg */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'linear-gradient(#00e5ff 1px,transparent 1px),linear-gradient(90deg,#00e5ff 1px,transparent 1px)',
          backgroundSize: '36px 36px'
        }} />
        {/* Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] opacity-8 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse,#00e5ff,transparent 70%)' }} />

        <div className="relative w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 bg-[#00e5ff]/10 border border-[#00e5ff]/25 shadow-[0_0_40px_rgba(0,229,255,0.15)]">
              <span className="material-symbols-outlined text-4xl text-[#00e5ff]" style={{ fontVariationSettings: "'FILL' 1" }}>emergency_share</span>
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-[#00e5ff] drop-shadow-[0_0_20px_rgba(0,229,255,0.5)]">
              PHOENIX GRID
            </h1>
            <p className="text-[11px] font-mono text-[#849396] uppercase tracking-[0.25em] mt-2">
              Tactical Emergency Response System
            </p>
          </div>

          {/* Login/Signup card */}
          <div className="bg-[#0e1320] border border-[#3b494c]/50 rounded-2xl p-8 shadow-[0_0_60px_rgba(0,0,0,0.5)]">
            
            {/* Toggle */}
            <div className="flex rounded-lg bg-[#161b29] p-1 mb-6 border border-[#3b494c]/30">
              <button onClick={() => { setSignup(false); setLoginErr(''); }}
                className={`flex-1 py-2 text-xs font-mono font-bold uppercase rounded-md transition-all ${!isSignup ? 'bg-[#00e5ff] text-[#001f24] shadow-[0_0_10px_rgba(0,229,255,0.3)]' : 'text-[#849396] hover:text-white'}`}>
                Login
              </button>
              <button onClick={() => { setSignup(true); setLoginErr(''); }}
                className={`flex-1 py-2 text-xs font-mono font-bold uppercase rounded-md transition-all ${isSignup ? 'bg-[#00e5ff] text-[#001f24] shadow-[0_0_10px_rgba(0,229,255,0.3)]' : 'text-[#849396] hover:text-white'}`}>
                Sign Up
              </button>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              {isSignup && (
                <div>
                  <label className="block text-[10px] font-mono text-[#849396] uppercase tracking-wider mb-1.5">Display Name</label>
                  <input type="text" value={loginDisplay} onChange={e => setLoginDisplay(e.target.value)} placeholder="Full Name"
                    className="w-full bg-[#161b29] border border-[#3b494c]/60 rounded-xl px-4 py-3 text-sm text-white font-mono placeholder-[#3b494c] focus:outline-none focus:border-[#00e5ff]/60 focus:shadow-[0_0_0_3px_rgba(0,229,255,0.08)] transition-all" required={isSignup} />
                </div>
              )}
              <div>
                <label className="block text-[10px] font-mono text-[#849396] uppercase tracking-wider mb-1.5">Username</label>
                <input type="text" value={loginUser} onChange={e => setLoginUser(e.target.value)} placeholder="Enter username" autoComplete="username"
                  className="w-full bg-[#161b29] border border-[#3b494c]/60 rounded-xl px-4 py-3 text-sm text-white font-mono placeholder-[#3b494c] focus:outline-none focus:border-[#00e5ff]/60 focus:shadow-[0_0_0_3px_rgba(0,229,255,0.08)] transition-all" required />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-[#849396] uppercase tracking-wider mb-1.5">Password</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} value={loginPass} onChange={e => setLoginPass(e.target.value)} placeholder="••••••••" autoComplete="current-password"
                    className="w-full bg-[#161b29] border border-[#3b494c]/60 rounded-xl px-4 py-3 pr-11 text-sm text-white font-mono placeholder-[#3b494c] focus:outline-none focus:border-[#00e5ff]/60 focus:shadow-[0_0_0_3px_rgba(0,229,255,0.08)] transition-all" required />
                  <button type="button" onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#849396] hover:text-[#dee2f5] transition-colors">
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{showPass ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>

              {loginErr && (
                <div className="flex items-start gap-2 bg-[#FF4444]/10 border border-[#FF4444]/30 rounded-xl px-4 py-3 text-[11px] font-mono text-[#FF4444]">
                  <span className="material-symbols-outlined shrink-0" style={{ fontSize: '14px', marginTop:'2px' }}>error</span>
                  <div>{loginErr}</div>
                </div>
              )}

              <button type="submit" disabled={isLoading}
                className={`w-full py-3.5 text-[#001f24] font-mono font-black text-sm uppercase tracking-[0.15em] rounded-xl transition-all shadow-[0_0_25px_rgba(0,229,255,0.35)] mt-2 flex items-center justify-center gap-2 ${
                  isLoading ? 'bg-[#00e5ff]/50 cursor-not-allowed' : 'bg-[#00e5ff] hover:bg-[#00daf3] active:scale-[0.98]'
                }`}>
                {isLoading ? (
                  <><span className="material-symbols-outlined animate-spin" style={{ fontSize:'16px' }}>refresh</span> Processing...</>
                ) : (
                  isSignup ? 'Register Citizen Account' : 'Authenticate & Enter'
                )}
              </button>
            </form>


          </div>
        </div>
      </div>
    );
  }

  // ── Route to correct panel ────────────────────────────────
  if (role === 'admin') {
    return (
      <AdminPanel
        sosRequests={sosRequests}
        dangerZones={dangerZones}
        hospitals={hospitals}
        departments={departments}
        units={units}
        alerts={alerts}
        meshNodes={meshNodes}
        meshPackets={meshPackets}
        isBlackout={isBlackout}
        mapNodes={mapNodes}
        mapEdges={mapEdges}
        syncStatus={syncStatus}
        onVerifySOS={handleVerifySOS}
        onRejectSOS={handleRejectSOS}
        onDispatchUnit={handleDispatchUnit}
        onRecallUnit={handleRecallUnit}
        onAddAlert={addAlert}
        onMeshBroadcast={handleMeshBroadcast}
        onMeshToggle={handleMeshToggle}
        onUpdateNode={handleUpdateNode}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <UserPanel
      sosRequests={sosRequests}
      dangerZones={dangerZones}
      hospitals={hospitals}
      departments={departments}
      units={units}
      alerts={alerts}
      mapNodes={mapNodes}
      mapEdges={mapEdges}
      currentUser={currentUser}
      onSubmitSOS={handleSubmitSOS}
      onLogout={handleLogout}
    />
  );
}
