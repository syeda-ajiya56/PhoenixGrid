// ─── All shared types and initial data for Phoenix Grid ───────

export type Role = 'admin' | 'user';
export type EmergencyType = 'earthquake' | 'bombing' | 'fire' | 'flood' | 'medical' | 'accident' | 'chemical' | 'other';
export type SosStatus = 'pending' | 'verified' | 'rejected' | 'dispatched';
export type NodeStatus = 'OPERATIONAL' | 'DAMAGED' | 'DESTROYED';
export type EdgeStatus = 'CLEAR' | 'DANGEROUS' | 'BLOCKED';
export type UnitStatus = 'Idle' | 'En-Route' | 'On-Scene' | 'Critical' | 'Standby';
export type DeptType = 'fire' | 'police' | 'rescue' | 'ambulance' | 'hospital';
export type MeshStatus = 'ONLINE' | 'OFFLINE' | 'SYNCED';

export interface SosRequest {
  id: string;
  type: EmergencyType;
  description: string;
  lat: number;
  lon: number;
  location: string;
  submittedBy: string;
  phone: string;
  time: string;
  status: SosStatus;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface DangerZone {
  id: string;
  lat: number;
  lon: number;
  radius: number;
  type: EmergencyType;
  description: string;
  verifiedAt: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface Hospital {
  id: string;
  name: string;
  lat: number;
  lon: number;
  totalBeds: number;
  availableBeds: number;
  icuBeds: number;
  icuAvailable: number;
  status: 'NORMAL' | 'ALERT' | 'CRITICAL';
  alertMsg?: string;
  city: string;
}

export interface Department {
  id: string;
  name: string;
  type: DeptType;
  lat: number;
  lon: number;
  totalUnits: number;
  availableUnits: number;
  status: 'NORMAL' | 'ALERT' | 'DEPLOYED';
  alertMsg?: string;
  city: string;
}

export interface RescueUnit {
  id: string;
  name: string;
  type: 'AMBULANCE' | 'FIRE_TRUCK' | 'POLICE' | 'DRONE' | 'RESCUE';
  deptId: string;
  status: UnitStatus;
  zone: string;
  eta: string;
  battery: number;
  fuel: number;
  lat: number;
  lon: number;
  crew: number;
}

export interface MapNode {
  id: string;
  name: string;
  lat: number;
  lon: number;
  type: 'HOSPITAL' | 'SAFE_ZONE' | 'FIRE_STATION' | 'COMMAND' | 'POLICE' | 'INTERSECTION';
  status: NodeStatus;
}

export interface MapEdge {
  id: string;
  from: string;
  to: string;
  distance: number;
  status: EdgeStatus;
}

export interface Alert {
  id: string;
  msg: string;
  level: 'info' | 'warn' | 'critical';
  time: string;
  source: string;
}

export interface MeshNode {
  id: string;
  name: string;
  battery: number;
  signal: number;
  status: MeshStatus;
  lastSeen: string;
}

export interface AidPackage {
  id: string;
  provider: string;
  dest: string;
  type: string;
  qty: number;
  method: string;
  progress: number;
  status: 'IN-TRANSIT' | 'DELIVERED' | 'QUEUED';
}

// ─── INITIAL DATA ─────────────────────────────────────────────

export const INITIAL_HOSPITALS: Hospital[] = [
  // Pakistan Major Cities
  { id:'H1', name:'PIMS Islamabad',                 city:'Islamabad', lat:33.7040, lon:73.0570, totalBeds:700, availableBeds:260, icuBeds:70,  icuAvailable:18, status:'NORMAL' },
  { id:'H2', name:'Lahore General Hospital',        city:'Lahore',    lat:31.5497, lon:74.3436, totalBeds:600, availableBeds:180, icuBeds:60,  icuAvailable:14, status:'NORMAL' },
  { id:'H3', name:'Hayatabad Medical Complex',      city:'Peshawar',  lat:34.0052, lon:71.4814, totalBeds:400, availableBeds:140, icuBeds:40,  icuAvailable:10, status:'NORMAL' },
  { id:'H4', name:'Bolan Medical Complex',          city:'Quetta',    lat:30.1978, lon:67.0099, totalBeds:350, availableBeds:120, icuBeds:35,  icuAvailable:8,  status:'NORMAL' },
  { id:'H5', name:'Nishtar Hospital',               city:'Multan',    lat:30.1940, lon:71.4686, totalBeds:500, availableBeds:200, icuBeds:50,  icuAvailable:12, status:'NORMAL' },
  // Karachi Deep Dive
  { id:'H6', name:'Jinnah Hospital (JPMC)',         city:'Karachi',   lat:24.8532, lon:67.0427, totalBeds:1100,availableBeds:400, icuBeds:120, icuAvailable:30, status:'NORMAL' },
  { id:'H7', name:'Aga Khan University Hospital',   city:'Karachi',   lat:24.8930, lon:67.0734, totalBeds:720, availableBeds:210, icuBeds:100, icuAvailable:45, status:'NORMAL' },
  { id:'H8', name:'Dr. Ruth Pfau Civil Hospital',   city:'Karachi',   lat:24.8615, lon:67.0084, totalBeds:1900,availableBeds:600, icuBeds:150, icuAvailable:50, status:'NORMAL' },
  { id:'H9', name:'Liaquat National Hospital',      city:'Karachi',   lat:24.8920, lon:67.0680, totalBeds:700, availableBeds:180, icuBeds:80,  icuAvailable:20, status:'NORMAL' },
  { id:'H10',name:'Indus Hospital Korangi',         city:'Karachi',   lat:24.8213, lon:67.1218, totalBeds:300, availableBeds:50,  icuBeds:40,  icuAvailable:5,  status:'ALERT' },
  { id:'H11',name:'Ziauddin Hospital Clifton',      city:'Karachi',   lat:24.8138, lon:67.0111, totalBeds:400, availableBeds:120, icuBeds:60,  icuAvailable:15, status:'NORMAL' },
  { id:'H12',name:'Abbasi Shaheed Hospital',        city:'Karachi',   lat:24.9195, lon:67.0343, totalBeds:850, availableBeds:280, icuBeds:90,  icuAvailable:25, status:'NORMAL' },
  { id:'H13',name:'South City Hospital',            city:'Karachi',   lat:24.8140, lon:67.0250, totalBeds:250, availableBeds:80,  icuBeds:30,  icuAvailable:10, status:'NORMAL' },
  { id:'H14',name:'National Medical Centre',        city:'Karachi',   lat:24.8700, lon:67.0600, totalBeds:300, availableBeds:110, icuBeds:35,  icuAvailable:12, status:'NORMAL' },
  { id:'H15',name:'Shaukat Khanum Lahore',          city:'Lahore',    lat:31.4697, lon:74.2728, totalBeds:300, availableBeds:90,  icuBeds:45,  icuAvailable:14, status:'NORMAL' },
];

export const INITIAL_DEPARTMENTS: Department[] = [
  { id:'D1', name:'Karachi Fire Brigade Central',   type:'fire',      city:'Karachi',   lat:24.8600, lon:67.0100, totalUnits:20, availableUnits:15, status:'NORMAL' },
  { id:'D2', name:'Gulshan Fire Station',           type:'fire',      city:'Karachi',   lat:24.9300, lon:67.0900, totalUnits:10, availableUnits:8,  status:'NORMAL' },
  { id:'D3', name:'Lahore Fire HQ',                 type:'fire',      city:'Lahore',    lat:31.5400, lon:74.3500, totalUnits:15, availableUnits:12, status:'NORMAL' },
  { id:'D4', name:'Karachi Police HQ (Saddar)',     type:'police',    city:'Karachi',   lat:24.8580, lon:67.0200, totalUnits:60, availableUnits:40, status:'NORMAL' },
  { id:'D5', name:'DHA Police Station',             type:'police',    city:'Karachi',   lat:24.8100, lon:67.0500, totalUnits:25, availableUnits:20, status:'NORMAL' },
  { id:'D6', name:'Edhi Central Base KHI',          type:'ambulance', city:'Karachi',   lat:24.8700, lon:67.0300, totalUnits:40, availableUnits:30, status:'NORMAL' },
  { id:'D7', name:'Chhipa Ambulance HQ KHI',        type:'ambulance', city:'Karachi',   lat:24.8550, lon:67.0350, totalUnits:35, availableUnits:25, status:'NORMAL' },
  { id:'D8', name:'Rescue 1122 KHI',                type:'rescue',    city:'Karachi',   lat:24.8900, lon:67.0800, totalUnits:20, availableUnits:15, status:'NORMAL' },
  { id:'D9', name:'Rescue 1122 LHR',                type:'rescue',    city:'Lahore',    lat:31.5204, lon:74.3587, totalUnits:30, availableUnits:22, status:'NORMAL' },
  { id:'D10',name:'Aman Ambulance Base',            type:'ambulance', city:'Karachi',   lat:24.8300, lon:67.0900, totalUnits:15, availableUnits:10, status:'NORMAL' },
  { id:'D11',name:'Korangi Fire Brigade',           type:'fire',      city:'Karachi',   lat:24.8300, lon:67.1200, totalUnits:10, availableUnits:7,  status:'NORMAL' },
  { id:'D12',name:'SITE Fire Station',              type:'fire',      city:'Karachi',   lat:24.9000, lon:67.0150, totalUnits:12, availableUnits:9,  status:'NORMAL' },
  { id:'D13',name:'Clifton Police Station',         type:'police',    city:'Karachi',   lat:24.8150, lon:67.0200, totalUnits:30, availableUnits:22, status:'NORMAL' },
  { id:'D14',name:'Shahrah-e-Faisal Police',        type:'police',    city:'Karachi',   lat:24.8620, lon:67.0700, totalUnits:40, availableUnits:28, status:'NORMAL' },
  { id:'D15',name:'Malir Cantt Police',             type:'police',    city:'Karachi',   lat:24.9000, lon:67.1900, totalUnits:35, availableUnits:25, status:'NORMAL' },
  { id:'D16',name:'Korangi Police Station',         type:'police',    city:'Karachi',   lat:24.8213, lon:67.1218, totalUnits:25, availableUnits:18, status:'NORMAL' },
];

export const INITIAL_UNITS: RescueUnit[] = [
  // Edhi Ambulances (Karachi)
  { id:'U1',  name:'EDHI-AMB-01', type:'AMBULANCE',  deptId:'D6', status:'Idle',     zone:'Saddar',         eta:'N/A',   battery:100, fuel:95,  lat:24.860, lon:67.020, crew:2 },
  { id:'U2',  name:'EDHI-AMB-02', type:'AMBULANCE',  deptId:'D6', status:'Idle',     zone:'Tariq Road',     eta:'N/A',   battery:100, fuel:90,  lat:24.873, lon:67.059, crew:2 },
  { id:'U3',  name:'EDHI-AMB-03', type:'AMBULANCE',  deptId:'D6', status:'Idle',     zone:'Gulshan',        eta:'N/A',   battery:100, fuel:85,  lat:24.930, lon:67.090, crew:2 },
  { id:'U4',  name:'EDHI-AMB-04', type:'AMBULANCE',  deptId:'D6', status:'Idle',     zone:'Malir',          eta:'N/A',   battery:100, fuel:100, lat:24.895, lon:67.185, crew:2 },
  // Chhipa Ambulances (Karachi)
  { id:'U5',  name:'CHP-AMB-01',  type:'AMBULANCE',  deptId:'D7', status:'Idle',     zone:'Clifton',        eta:'N/A',   battery:100, fuel:92,  lat:24.815, lon:67.020, crew:2 },
  { id:'U6',  name:'CHP-AMB-02',  type:'AMBULANCE',  deptId:'D7', status:'Idle',     zone:'DHA',            eta:'N/A',   battery:100, fuel:88,  lat:24.805, lon:67.050, crew:2 },
  // Aman Ambulances (Karachi)
  { id:'U7',  name:'AMAN-AMB-01', type:'AMBULANCE',  deptId:'D10',status:'Idle',     zone:'Korangi',        eta:'N/A',   battery:100, fuel:95,  lat:24.825, lon:67.120, crew:3 },
  // Lahore Ambulances
  { id:'U8',  name:'RES1122-LHR', type:'AMBULANCE',  deptId:'D9', status:'Idle',     zone:'Gulberg',        eta:'N/A',   battery:100, fuel:80,  lat:31.510, lon:74.320, crew:3 },
  // Fire Trucks (Karachi)
  { id:'U9',  name:'FIRE-KHI-01', type:'FIRE_TRUCK', deptId:'D1', status:'Idle',     zone:'Saddar',         eta:'N/A',   battery:100, fuel:90,  lat:24.860, lon:67.010, crew:6 },
  { id:'U10', name:'FIRE-KHI-02', type:'FIRE_TRUCK', deptId:'D1', status:'Idle',     zone:'SITE Area',      eta:'N/A',   battery:100, fuel:85,  lat:24.900, lon:67.015, crew:6 },
  { id:'U11', name:'FIRE-KHI-03', type:'FIRE_TRUCK', deptId:'D2', status:'Idle',     zone:'Gulshan',        eta:'N/A',   battery:100, fuel:95,  lat:24.930, lon:67.090, crew:5 },
  // Rescue & Police (Karachi)
  { id:'U12', name:'POL-KHI-01',  type:'POLICE',     deptId:'D4', status:'Idle',     zone:'Clifton',        eta:'N/A',   battery:100, fuel:80,  lat:24.815, lon:67.020, crew:4 },
  { id:'U13', name:'POL-KHI-02',  type:'POLICE',     deptId:'D4', status:'Idle',     zone:'Saddar',         eta:'N/A',   battery:100, fuel:88,  lat:24.858, lon:67.020, crew:4 },
  { id:'U14', name:'RES-KHI-01',  type:'RESCUE',     deptId:'D8', status:'Idle',     zone:'Jauhar',         eta:'N/A',   battery:100, fuel:92,  lat:24.915, lon:67.120, crew:8 },
  // Drones
  { id:'U15', name:'DRONE-KHI-1', type:'DRONE',      deptId:'D8', status:'Idle',     zone:'DHA Base',       eta:'N/A',   battery:100, fuel:100, lat:24.800, lon:67.060, crew:0 },
  { id:'U16', name:'DRONE-KHI-2', type:'DRONE',      deptId:'D8', status:'Idle',     zone:'North KHI Base', eta:'N/A',   battery:100, fuel:100, lat:24.950, lon:67.050, crew:0 },
  { id:'U17', name:'DRONE-LHR-1', type:'DRONE',      deptId:'D9', status:'Idle',     zone:'LHR Base',       eta:'N/A',   battery:100, fuel:100, lat:31.520, lon:74.360, crew:0 },
];

export const MAP_NODES: MapNode[] = [
  // Pakistan Level
  { id:'N1', name:'Islamabad HQ',            lat:33.7294, lon:73.0931, type:'COMMAND',      status:'OPERATIONAL' },
  { id:'N2', name:'Lahore Base',             lat:31.5204, lon:74.3587, type:'SAFE_ZONE',    status:'OPERATIONAL' },
  { id:'N3', name:'Peshawar Hub',            lat:34.0151, lon:71.5249, type:'INTERSECTION', status:'DAMAGED'     },
  { id:'N4', name:'Quetta Relief',           lat:30.1798, lon:66.9750, type:'SAFE_ZONE',    status:'OPERATIONAL' },
  { id:'N5', name:'Multan Hub',              lat:30.1575, lon:71.5249, type:'INTERSECTION', status:'OPERATIONAL' },
  { id:'N6', name:'Hyderabad Checkpoint',    lat:25.3960, lon:68.3578, type:'INTERSECTION', status:'OPERATIONAL' },
  
  // Karachi Intra-City Level
  { id:'K1', name:'Karachi Command HQ',      lat:24.8607, lon:67.0011, type:'COMMAND',      status:'OPERATIONAL' },
  { id:'K2', name:'Jinnah Hospital (JPMC)',  lat:24.8532, lon:67.0427, type:'HOSPITAL',     status:'OPERATIONAL' },
  { id:'K3', name:'Aga Khan Hospital',       lat:24.8930, lon:67.0734, type:'HOSPITAL',     status:'OPERATIONAL' },
  { id:'K4', name:'Civil Hospital',          lat:24.8615, lon:67.0084, type:'HOSPITAL',     status:'OPERATIONAL' },
  { id:'K5', name:'Saddar Intersection',     lat:24.8580, lon:67.0200, type:'INTERSECTION', status:'OPERATIONAL' },
  { id:'K6', name:'DHA Phase 5',             lat:24.8050, lon:67.0550, type:'SAFE_ZONE',    status:'OPERATIONAL' },
  { id:'K7', name:'Gulshan-e-Iqbal',         lat:24.9300, lon:67.0900, type:'SAFE_ZONE',    status:'OPERATIONAL' },
  { id:'K8', name:'Korangi Industrial',      lat:24.8213, lon:67.1218, type:'INTERSECTION', status:'OPERATIONAL' },
  { id:'K9', name:'Malir Cantonment',        lat:24.8950, lon:67.1850, type:'SAFE_ZONE',    status:'OPERATIONAL' },
  { id:'K10',name:'SITE Area',               lat:24.9000, lon:67.0150, type:'FIRE_STATION', status:'OPERATIONAL' },
  { id:'K11',name:'Clifton Block 2',         lat:24.8150, lon:67.0200, type:'POLICE',       status:'OPERATIONAL' },
  { id:'K12',name:'Liaquat National Hosp',   lat:24.8935, lon:67.0750, type:'HOSPITAL',     status:'OPERATIONAL' },
  { id:'K13',name:'South City Hospital',     lat:24.8140, lon:67.0250, type:'HOSPITAL',     status:'OPERATIONAL' },
  { id:'K14',name:'Shahrah-e-Faisal Police', lat:24.8620, lon:67.0700, type:'POLICE',       status:'OPERATIONAL' },
  { id:'K15',name:'Korangi Fire Brigade',    lat:24.8300, lon:67.1200, type:'FIRE_STATION', status:'OPERATIONAL' },
  { id:'K16',name:'Malir Cantt Police',      lat:24.9000, lon:67.1900, type:'POLICE',       status:'OPERATIONAL' },
  { id:'K17',name:'Tariq Road (Civilian)',   lat:24.8730, lon:67.0590, type:'SAFE_ZONE',    status:'OPERATIONAL' },
  { id:'K18',name:'Nazimabad Base',          lat:24.9100, lon:67.0300, type:'SAFE_ZONE',    status:'OPERATIONAL' },
];

export const MAP_EDGES: MapEdge[] = [
  // Pakistan Edges
  { id:'E1', from:'N1', to:'N2',  distance:380,  status:'CLEAR'     }, // ISB-LHR
  { id:'E2', from:'N2', to:'N5',  distance:340,  status:'CLEAR'     }, // LHR-MUL
  { id:'E3', from:'N5', to:'N6',  distance:500,  status:'CLEAR'     }, // MUL-HYD
  { id:'E4', from:'N6', to:'K1',  distance:160,  status:'CLEAR'     }, // HYD-KHI
  { id:'E5', from:'N1', to:'N3',  distance:180,  status:'DANGEROUS' }, // ISB-PES
  { id:'E6', from:'N4', to:'N5',  distance:450,  status:'CLEAR'     }, // QUE-MUL
  
  // Karachi Intra-City Edges
  { id:'K_E1', from:'K1', to:'K4',   distance:1.5, status:'CLEAR'     }, // HQ to Civil
  { id:'K_E2', from:'K4', to:'K5',   distance:2.0, status:'CLEAR'     }, // Civil to Saddar
  { id:'K_E3', from:'K5', to:'K2',   distance:3.5, status:'CLEAR'     }, // Saddar to JPMC
  { id:'K_E4', from:'K2', to:'K6',   distance:6.0, status:'CLEAR'     }, // JPMC to DHA
  { id:'K_E5', from:'K6', to:'K11',  distance:4.5, status:'CLEAR'     }, // DHA to Clifton
  { id:'K_E6', from:'K2', to:'K3',   distance:5.5, status:'CLEAR'     }, // JPMC to Aga Khan
  { id:'K_E7', from:'K3', to:'K7',   distance:4.0, status:'CLEAR'     }, // Aga Khan to Gulshan
  { id:'K_E8', from:'K7', to:'K9',   distance:12.0,status:'CLEAR'     }, // Gulshan to Malir
  { id:'K_E9', from:'K6', to:'K8',   distance:8.0, status:'DANGEROUS' }, // DHA to Korangi
  { id:'K_E10',from:'K1', to:'K10',  distance:6.5, status:'CLEAR'     }, // HQ to SITE
  { id:'K_E11',from:'K10',to:'K7',   distance:10.0,status:'CLEAR'     }, // SITE to Gulshan
  
  // New Karachi Edges
  { id:'K_E12',from:'K3', to:'K12',  distance:0.5, status:'CLEAR'     }, // Aga Khan to Liaquat Nat
  { id:'K_E13',from:'K11',to:'K13',  distance:1.2, status:'CLEAR'     }, // Clifton to South City
  { id:'K_E14',from:'K2', to:'K14',  distance:3.0, status:'CLEAR'     }, // JPMC to Sh-e-Faisal
  { id:'K_E15',from:'K8', to:'K15',  distance:2.0, status:'CLEAR'     }, // Korangi to Fire Brigade
  { id:'K_E16',from:'K9', to:'K16',  distance:1.5, status:'CLEAR'     }, // Malir Cantt to Police
  { id:'K_E17',from:'K5', to:'K17',  distance:4.0, status:'CLEAR'     }, // Saddar to Tariq Road
  { id:'K_E18',from:'K10',to:'K18',  distance:3.5, status:'CLEAR'     }, // SITE to Nazimabad
];

export const INITIAL_MESH: MeshNode[] = [
  { id:'PHX-00', name:'Gateway Alpha KHI',     battery:98, signal:100, status:'ONLINE',  lastSeen:'LIVE'   },
  { id:'PHX-01', name:'Relay Bravo Saddar',    battery:76, signal:82,  status:'SYNCED',  lastSeen:'0:02s'  },
  { id:'PHX-02', name:'Relay Charlie DHA',     battery:54, signal:61,  status:'SYNCED',  lastSeen:'0:08s'  },
  { id:'PHX-03', name:'Gateway Delta LHR',     battery:23, signal:40,  status:'OFFLINE', lastSeen:'2:14m'  },
  { id:'PHX-04', name:'Relay Echo ISB',        battery:88, signal:95,  status:'ONLINE',  lastSeen:'LIVE'   },
];

export const INITIAL_AID: AidPackage[] = [
  { id:'A1', provider:'UNHCR',   dest:'Quetta',    type:'Medical Supplies',    qty:12.5, method:'Air',    progress:72,  status:'IN-TRANSIT' },
  { id:'A2', provider:'WFP',     dest:'Multan',    type:'Food Rations',        qty:40.0, method:'Ground', progress:100, status:'DELIVERED'  },
  { id:'A3', provider:'RedCross',dest:'Peshawar',  type:'Emergency Kits',      qty:8.2,  method:'Air',    progress:15,  status:'QUEUED'     },
  { id:'A4', provider:'NDMA',    dest:'Karachi',   type:'Water Purification',  qty:3.0,  method:'Ground', progress:55,  status:'IN-TRANSIT' },
  { id:'A5', provider:'WHO',     dest:'Islamabad', type:'Vaccine Cold Chain',  qty:1.2,  method:'Air',    progress:88,  status:'IN-TRANSIT' },
];

// ─── Helper: Dijkstra shortest path (avoids BLOCKED, avoids danger zones) ──
export function findRoute(
  nodes: MapNode[],
  edges: MapEdge[],
  fromId: string,
  toId: string,
  dangerZones: DangerZone[] = []
): string[] {
  // Edges near danger zones get penalized
  const isNearDanger = (lat: number, lon: number) =>
    dangerZones.some(dz => {
      const d = Math.sqrt(Math.pow(dz.lat - lat, 2) + Math.pow(dz.lon - lon, 2));
      return d < 0.5;
    });

  const dist: Record<string, number> = {};
  const prev: Record<string, string> = {};
  const queue = new Set<string>();
  nodes.forEach(n => { dist[n.id] = Infinity; queue.add(n.id); });
  dist[fromId] = 0;

  while (queue.size > 0) {
    let u = [...queue].reduce((a, b) => dist[a] < dist[b] ? a : b);
    if (u === toId) break;
    queue.delete(u);

    edges
      .filter(e => (e.from === u || e.to === u) && e.status !== 'BLOCKED')
      .forEach(e => {
        const v = e.from === u ? e.to : e.from;
        if (!queue.has(v)) return;
        const toNode = nodes.find(n => n.id === v);
        const dangerPenalty = toNode && isNearDanger(toNode.lat, toNode.lon) ? 5000 : 0;
        const edgePenalty = e.status === 'DANGEROUS' ? 1000 : 0;
        const alt = dist[u] + e.distance + edgePenalty + dangerPenalty;
        if (alt < dist[v]) { dist[v] = alt; prev[v] = u; }
      });
  }

  const path: string[] = [];
  let cur: string | undefined = toId;
  while (cur) { path.unshift(cur); cur = prev[cur]; }
  return path.length > 1 ? path : [];
}

// ─── Color maps ───────────────────────────────────────────────
export const STATUS_COLORS: Record<string, string> = {
  OPERATIONAL:'#3ce36a', CLEAR:'#3ce36a',   NORMAL:'#3ce36a',
  DAMAGED:'#FF9F00',     DANGEROUS:'#FF9F00','En-Route':'#FF9F00',  ALERT:'#FF9F00',
  DESTROYED:'#FF4444',   BLOCKED:'#FF4444',  Critical:'#FF4444',    CRITICAL:'#FF4444',
  ONLINE:'#3ce36a',      SYNCED:'#00daf3',   OFFLINE:'#849396',
  Standby:'#adc6ff',     'On-Scene':'#00daf3',Idle:'#849396',
  'IN-TRANSIT':'#00daf3',DELIVERED:'#3ce36a',QUEUED:'#849396',
  pending:'#FF9F00',     verified:'#3ce36a', rejected:'#FF4444',    dispatched:'#00daf3',
  LOW:'#3ce36a',         MEDIUM:'#FF9F00',   HIGH:'#FF9F00',        DEPLOYED:'#FF4444',
};

export const EMERGENCY_ICONS: Record<EmergencyType, string> = {
  earthquake:'crisis_alert', bombing:'local_fire_department', fire:'local_fire_department',
  flood:'water', medical:'local_hospital', accident:'car_crash',
  chemical:'science', other:'warning',
};

export const DEPT_ICONS: Record<DeptType, string> = {
  fire:'local_fire_department', police:'local_police',
  rescue:'emergency', ambulance:'ambulance', hospital:'local_hospital',
};

export const UNIT_ICONS: Record<string, string> = {
  AMBULANCE:'ambulance', FIRE_TRUCK:'local_fire_department',
  POLICE:'local_police', DRONE:'flight_takeoff', RESCUE:'emergency',
};

export function now(): string {
  const d = new Date();
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')}`;
}
export function uid(): string {
  return Math.random().toString(36).slice(2, 9).toUpperCase();
}
