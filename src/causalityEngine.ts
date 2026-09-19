/**
 * ============================================================================
 * MODULE B: Causality & Ripple-Effect Prediction Engine
 * ============================================================================
 * Design Patterns:
 * 1. COMPOSITE PATTERN: Models city infrastructure as a tree of dependent units
 *    (Parent composite units, children nodes, and leaf units).
 * 2. BRIDGE PATTERN: Decouples infrastructure asset abstractions from actual
 *    physical tracking implementations (Static facilities vs. Mobile assets).
 * ============================================================================
 */

// --- BRIDGE PATTERN: Decouple physical tracking implementation ---
export interface TrackingImplementor {
  getTrackingType(): string;
  updateCoordinates(lat: number, lon: number): string;
  getSignalStatus(): string;
}

export class StaticFacilityTracker implements TrackingImplementor {
  private lastChecked: number = Date.now();

  public getTrackingType(): string {
    return "Telemetry Static Base Station";
  }

  public updateCoordinates(lat: number, lon: number): string {
    return `Static Facility Anchored at Coordinates: ${lat.toFixed(4)}N, ${lon.toFixed(4)}E. Last scan: ${new Date(this.lastChecked).toLocaleTimeString()}`;
  }

  public getSignalStatus(): string {
    return "HARDWIRED METRO NETWORK ROUTE";
  }
}

export class MobileAssetTracker implements TrackingImplementor {
  private batteryPct: number = 88;

  public getTrackingType(): string {
    return "Real-Time Telemetry Mobile Beacon (BLE/GPS)";
  }

  public updateCoordinates(lat: number, lon: number): string {
    this.batteryPct = Math.max(10, this.batteryPct - Math.floor(Math.random() * 2));
    return `Mobile asset tracking coordinates: ${lat.toFixed(4)}N, ${lon.toFixed(4)}E. Current Battery: ${this.batteryPct}%`;
  }

  public getSignalStatus(): string {
    return "PEER-TO-PEER MESH RADIO FREQUENCY (433MHz)";
  }
}


// --- COMPOSITE PATTERN: Hierarchical tree network of dependent units ---
export interface InfrastructureComponent {
  id: string;
  name: string;
  type: string;
  status: 'OPERATIONAL' | 'DAMAGED' | 'CRITICAL' | 'DESTROYED';
  latitude: number;
  longitude: number;
  
  // Bridge pattern link
  tracker: TrackingImplementor;

  getStatus(): 'OPERATIONAL' | 'DAMAGED' | 'CRITICAL' | 'DESTROYED';
  setStatus(status: 'OPERATIONAL' | 'DAMAGED' | 'CRITICAL' | 'DESTROYED'): void;
  getDownstreamCascadeCount(): number;
  calculateRippleImpacts(affectedIds: string[]): void;
  getChildren(): InfrastructureComponent[];
}

export class InfrastructureLeaf implements InfrastructureComponent {
  public id: string;
  public name: string;
  public type: string;
  public status: 'OPERATIONAL' | 'DAMAGED' | 'CRITICAL' | 'DESTROYED' = 'OPERATIONAL';
  public latitude: number;
  public longitude: number;
  public tracker: TrackingImplementor;

  constructor(id: string, name: string, type: string, lat: number, lon: number, tracker: TrackingImplementor) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.latitude = lat;
    this.longitude = lon;
    this.tracker = tracker;
  }

  public getStatus(): 'OPERATIONAL' | 'DAMAGED' | 'CRITICAL' | 'DESTROYED' {
    return this.status;
  }

  public setStatus(status: 'OPERATIONAL' | 'DAMAGED' | 'CRITICAL' | 'DESTROYED'): void {
    this.status = status;
  }

  public getDownstreamCascadeCount(): number {
    return 0; // Leaf component has no children
  }

  public calculateRippleImpacts(affectedIds: string[]): void {
    if (this.status === 'DESTROYED' || this.status === 'CRITICAL') {
      affectedIds.push(this.id);
    }
  }

  public getChildren(): InfrastructureComponent[] {
    return [];
  }
}

export class InfrastructureComposite implements InfrastructureComponent {
  public id: string;
  public name: string;
  public type: string;
  public status: 'OPERATIONAL' | 'DAMAGED' | 'CRITICAL' | 'DESTROYED' = 'OPERATIONAL';
  public latitude: number;
  public longitude: number;
  public tracker: TrackingImplementor;
  
  private children: InfrastructureComponent[] = [];

  constructor(id: string, name: string, type: string, lat: number, lon: number, tracker: TrackingImplementor) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.latitude = lat;
    this.longitude = lon;
    this.tracker = tracker;
  }

  public add(component: InfrastructureComponent): void {
    this.children.push(component);
  }

  public getChildren(): InfrastructureComponent[] {
    return this.children;
  }

  public getStatus(): 'OPERATIONAL' | 'DAMAGED' | 'CRITICAL' | 'DESTROYED' {
    return this.status;
  }

  public setStatus(status: 'OPERATIONAL' | 'DAMAGED' | 'CRITICAL' | 'DESTROYED'): void {
    this.status = status;
    // Cascade failure to downstream children!
    if (status === 'DESTROYED' || status === 'CRITICAL') {
      this.children.forEach(child => {
        // Child transitions automatically to critical/damaged based on dependency
        child.setStatus(status === 'DESTROYED' ? 'CRITICAL' : 'DAMAGED');
      });
    }
  }

  public getDownstreamCascadeCount(): number {
    let count = this.children.length;
    this.children.forEach(child => {
      count += child.getDownstreamCascadeCount();
    });
    return count;
  }

  public calculateRippleImpacts(affectedIds: string[]): void {
    if (this.status === 'DESTROYED' || this.status === 'CRITICAL' || this.status === 'DAMAGED') {
      affectedIds.push(this.id);
    }
    this.children.forEach(child => {
      child.calculateRippleImpacts(affectedIds);
    });
  }
}

// Helper to seed a simulation tree for Lahore Sector 7G
export function seedInfrastructureGraph(): InfrastructureComposite {
  const staticTracker = new StaticFacilityTracker();
  const mobileTracker = new MobileAssetTracker();

  // Root Component: Power Generation Plant (Composite)
  const powerPlant = new InfrastructureComposite("INF-ROOT", "Sector 7G Power Generation Plant", "Power Plant", 31.5204, 74.3587, staticTracker);

  // Substation Distribution Node (Composite)
  const substation = new InfrastructureComposite("INF-SUB", "Lahore Substation Distribution Node", "Substation", 31.5225, 74.3600, staticTracker);
  powerPlant.add(substation);

  // Sector Communication Tower (Composite)
  const commTower = new InfrastructureComposite("INF-TOW", "Sector Communication Tower G7", "Communication Tower", 31.5175, 74.3550, staticTracker);
  substation.add(commTower);

  // Safe Zone Medical Hub (Leaf Node)
  const medicalHub = new InfrastructureLeaf("INF-MED", "Safe Zone Civil Medical Hub", "Medical Hub", 31.5160, 74.3520, mobileTracker);
  // Sector Relief Center (Leaf Node)
  const reliefCenter = new InfrastructureLeaf("INF-REL", "Lahore Sector Relief Center", "Relief Center", 31.5150, 74.3510, staticTracker);
  
  commTower.add(medicalHub);
  commTower.add(reliefCenter);

  return powerPlant;
}
