/**
 * ============================================================================
 * MODULE C: Multi-State Rescue Operations Command Center
 * ============================================================================
 * Design Patterns:
 * 1. FACTORY DESIGN PATTERN: Creates distinct tracking instances (Drones vs.
 *    Ambulances vs. Ground Convoys) dynamically from incoming telemetry.
 * 2. BUILDER DESIGN PATTERN: Assembles complex dispatch tasks with custom
 *    loads, fuel, target zones, and specialized equipment counts.
 * 3. STATE PATTERN (INLINE STATE MACHINE): Tracks operational state transitions:
 *    Idle -> En-Route -> On-Scene -> Under-Fire -> Critical-Energy.
 * ============================================================================
 */

export type RescueUnitState = 'Idle' | 'En-Route' | 'On-Scene' | 'Under-Fire' | 'Critical-Energy';

export interface RescueUnit {
  id: string;
  name: string;
  type: 'AMBULANCE' | 'DRONE' | 'FIRE_UNIT' | 'SEARCH_RESCUE';
  lat: number;
  lon: number;
  capacity: number;
  state: RescueUnitState;
  battery: number;
  fuel: number;
  specialEquipment: string[];
  
  transitionTo(newState: RescueUnitState): void;
  getTelemetrySummary(): string;
}

// Concrete Factory Unit - Ambulance
export class AmbulanceUnit implements RescueUnit {
  public id: string;
  public name: string;
  public type: 'AMBULANCE' = 'AMBULANCE';
  public lat: number;
  public lon: number;
  public capacity: number;
  public state: RescueUnitState = 'Idle';
  public battery: number = 98;
  public fuel: number = 85;
  public specialEquipment: string[] = ['Life Support Kit', 'Oxygen Generator'];

  constructor(id: string, name: string, lat: number, lon: number, capacity: number) {
    this.id = id;
    this.name = name;
    this.lat = lat;
    this.lon = lon;
    this.capacity = capacity; // Crew or patient beds
  }

  public transitionTo(newState: RescueUnitState): void {
    console.log(`[Factory Unit: Ambulance] Transitioning ${this.id} from ${this.state} to ${newState}`);
    this.state = newState;
    if (newState === 'Critical-Energy') {
      this.battery = Math.min(10, this.battery);
    }
  }

  public getTelemetrySummary(): string {
    return `Ambulance crew: ${this.capacity} members. Medical fuel level: ${this.fuel}%. State: ${this.state}`;
  }
}

// Concrete Factory Unit - Drone
export class DroneUnit implements RescueUnit {
  public id: string;
  public name: string;
  public type: 'DRONE' = 'DRONE';
  public lat: number;
  public lon: number;
  public capacity: number; // Payload capacity in kg
  public state: RescueUnitState = 'Idle';
  public battery: number = 100;
  public fuel: number = 0; // Electrical drone
  public specialEquipment: string[] = ['Thermal Camera', 'P2P Signal Booster'];

  constructor(id: string, name: string, lat: number, lon: number, capacity: number) {
    this.id = id;
    this.name = name;
    this.lat = lat;
    this.lon = lon;
    this.capacity = capacity;
  }

  public transitionTo(newState: RescueUnitState): void {
    console.log(`[Factory Unit: Drone] Transitioning ${this.id} from ${this.state} to ${newState}`);
    this.state = newState;
    if (newState === 'En-Route') {
      this.battery = Math.max(15, this.battery - 15);
    }
  }

  public getTelemetrySummary(): string {
    return `Autonomous aerial drone. Cargo payload: ${this.capacity}kg. LiPo Battery: ${this.battery}%. State: ${this.state}`;
  }
}

// Concrete Factory Unit - Heavy Fire Truck
export class FireUnit implements RescueUnit {
  public id: string;
  public name: string;
  public type: 'FIRE_UNIT' = 'FIRE_UNIT';
  public lat: number;
  public lon: number;
  public capacity: number;
  public state: RescueUnitState = 'Idle';
  public battery: number = 95;
  public fuel: number = 92;
  public specialEquipment: string[] = ['Water Cannon', 'Hydraulic Spreader'];

  constructor(id: string, name: string, lat: number, lon: number, capacity: number) {
    this.id = id;
    this.name = name;
    this.lat = lat;
    this.lon = lon;
    this.capacity = capacity;
  }

  public transitionTo(newState: RescueUnitState): void {
    this.state = newState;
  }

  public getTelemetrySummary(): string {
    return `Heavy fire suppression vehicle. Tank capacity: ${this.capacity}00L. Diesel: ${this.fuel}%. State: ${this.state}`;
  }
}

// Concrete Factory Unit - Search & Rescue Team
export class SearchRescueUnit implements RescueUnit {
  public id: string;
  public name: string;
  public type: 'SEARCH_RESCUE' = 'SEARCH_RESCUE';
  public lat: number;
  public lon: number;
  public capacity: number;
  public state: RescueUnitState = 'Idle';
  public battery: number = 90;
  public fuel: number = 100;
  public specialEquipment: string[] = ['Sonar Scanner', 'Rope Access Kit'];

  constructor(id: string, name: string, lat: number, lon: number, capacity: number) {
    this.id = id;
    this.name = name;
    this.lat = lat;
    this.lon = lon;
    this.capacity = capacity;
  }

  public transitionTo(newState: RescueUnitState): void {
    this.state = newState;
  }

  public getTelemetrySummary(): string {
    return `Special forces squad. Size: ${this.capacity} operators. Communications: ${this.battery}% battery. State: ${this.state}`;
  }
}

/**
 * FACTORY PATTERN: RescueUnitFactory
 */
export class RescueUnitFactory {
  public static createUnit(
    type: 'AMBULANCE' | 'DRONE' | 'FIRE_UNIT' | 'SEARCH_RESCUE',
    id: string,
    name: string,
    lat: number,
    lon: number,
    capacity: number
  ): RescueUnit {
    switch (type) {
      case 'AMBULANCE':
        return new AmbulanceUnit(id, name, lat, lon, capacity);
      case 'DRONE':
        return new DroneUnit(id, name, lat, lon, capacity);
      case 'FIRE_UNIT':
        return new FireUnit(id, name, lat, lon, capacity);
      case 'SEARCH_RESCUE':
        return new SearchRescueUnit(id, name, lat, lon, capacity);
      default:
        throw new Error(`Unknown tracking unit type requested: ${type}`);
    }
  }
}

/**
 * BUILDER PATTERN: DispatchTaskBuilder
 * Assembles multi-parameter target task profiles for field units.
 */
export interface DispatchTask {
  id: string;
  targetZone: string;
  etaMinutes: number;
  medicalKitsNeeded: number;
  batteriesAssigned: number;
  specialRequirements: string;
  dangerLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export class DispatchTaskBuilder {
  private taskId: string = `TASK-${Date.now()}`;
  private targetZone: string = "Sector 7G North";
  private etaMinutes: number = 15;
  private medicalKitsNeeded: number = 2;
  private batteriesAssigned: number = 1;
  private specialRequirements: string = "Standard dispatch route";
  private dangerLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';

  public setTargetZone(zone: string): this {
    this.targetZone = zone;
    return this;
  }

  public setEta(minutes: number): this {
    this.etaMinutes = minutes;
    return this;
  }

  public setMedicalKits(count: number): this {
    this.medicalKitsNeeded = count;
    return this;
  }

  public setBatteries(count: number): this {
    this.batteriesAssigned = count;
    return this;
  }

  public setRequirements(req: string): this {
    this.specialRequirements = req;
    return this;
  }

  public setDangerLevel(level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'): this {
    this.dangerLevel = level;
    return this;
  }

  public build(): DispatchTask {
    return {
      id: this.taskId,
      targetZone: this.targetZone,
      etaMinutes: this.etaMinutes,
      medicalKitsNeeded: this.medicalKitsNeeded,
      batteriesAssigned: this.batteriesAssigned,
      specialRequirements: this.specialRequirements,
      dangerLevel: this.dangerLevel
    };
  }
}
