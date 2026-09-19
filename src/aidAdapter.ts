/**
 * ============================================================================
 * MODULE D: Global Humanitarian Aid Command Center
 * ============================================================================
 * Design Pattern:
 * ADAPTER PATTERN: Translates mismatched polymorphic database contracts coming
 * from external sovereign databases (e.g., metric vs imperial, USD vs local
 * funds, liters vs gallons) into standard uniform PHOENIX GRID data structures.
 * ============================================================================
 */

export interface StandardAidCargo {
  id: string;
  provider: string;
  destinationRegion: string;
  cargoType: 'FOOD' | 'WATER' | 'MEDICAL' | 'POWER_SYSTEM';
  quantityStandardized: number; // Stored uniformly in Metric Tons / Kiloliters
  transitMethod: 'AIR' | 'SEA' | 'LAND';
  progressPercentage: number;
  status: 'PREPARATION' | 'TRANSIT' | 'DELIVERED' | 'DELAYED';
  coordinates: { lat: number; lon: number };
}

// External Database Type 1: Middle-East Agency API Structure
// Uses Gallons, Metric Tons, and Currency in AED/SAR
export interface ME_AidRecord {
  record_id: string;
  donor_country: string;
  recipient_zone: string;
  resource_category: "Food Supplies" | "Hydration Reserves" | "Medical Kits" | "Generators";
  metric_quantity_tons?: number;
  liquid_volume_gallons?: number;
  shipment_route_type: "FLIGHT" | "CARGO_VESSEL" | "CONVOY";
  transit_completion_ratio: number;
  current_lat: number;
  current_lon: number;
}

// External Database Type 2: European Logistics API Structure
// Uses Imperial units (Pounds), Liters, and Euros
export interface EU_AidRecord {
  uuid: string;
  contributor: string;
  target_sector: string;
  supply_type: "Dry Rations" | "Bottled Water" | "Hospital Gear" | "Battery Packs";
  weight_lbs?: number;
  volume_liters?: number;
  vector_path: "AIR_CARRIER" | "OCEAN_FREIGHT" | "TRUCK_CARAVAN";
  status_code: 10 | 20 | 30 | 40; // 10=Prep, 20=Transit, 30=Delivered, 40=Hold
  lat: number;
  lon: number;
}

/**
 * ADAPTER: ME_AidAdapter
 * Adapts Middle-East agency format into PHOENIX GRID Standard format.
 */
export class ME_AidAdapter implements StandardAidCargo {
  public id: string;
  public provider: string;
  public destinationRegion: string;
  public cargoType: 'FOOD' | 'WATER' | 'MEDICAL' | 'POWER_SYSTEM';
  public quantityStandardized: number;
  public transitMethod: 'AIR' | 'SEA' | 'LAND';
  public progressPercentage: number;
  public status: 'PREPARATION' | 'TRANSIT' | 'DELIVERED' | 'DELAYED';
  public coordinates: { lat: number; lon: number };

  constructor(record: ME_AidRecord) {
    this.id = record.record_id;
    this.provider = record.donor_country;
    this.destinationRegion = record.recipient_zone;
    
    // Map cargo category
    switch (record.resource_category) {
      case "Food Supplies":
        this.cargoType = "FOOD";
        this.quantityStandardized = record.metric_quantity_tons || 0;
        break;
      case "Hydration Reserves":
        this.cargoType = "WATER";
        // Convert gallons to kiloliters: 1 Gallon = 0.00378541 Kiloliters
        this.quantityStandardized = (record.liquid_volume_gallons || 0) * 0.00378541;
        break;
      case "Medical Kits":
        this.cargoType = "MEDICAL";
        this.quantityStandardized = record.metric_quantity_tons || 10; // Default estimate
        break;
      case "Generators":
        this.cargoType = "POWER_SYSTEM";
        this.quantityStandardized = record.metric_quantity_tons || 5;
        break;
      default:
        this.cargoType = "FOOD";
        this.quantityStandardized = 0;
    }

    // Map transit method
    this.transitMethod = record.shipment_route_type === "FLIGHT" ? "AIR" : 
                         record.shipment_route_type === "CARGO_VESSEL" ? "SEA" : "LAND";

    // Map status
    this.progressPercentage = Math.round(record.transit_completion_ratio * 100);
    this.status = this.progressPercentage >= 100 ? 'DELIVERED' : 'TRANSIT';
    
    this.coordinates = { lat: record.current_lat, lon: record.current_lon };
  }
}

/**
 * ADAPTER: EU_AidAdapter
 * Adapts European logistics format into PHOENIX GRID Standard format.
 */
export class EU_AidAdapter implements StandardAidCargo {
  public id: string;
  public provider: string;
  public destinationRegion: string;
  public cargoType: 'FOOD' | 'WATER' | 'MEDICAL' | 'POWER_SYSTEM';
  public quantityStandardized: number;
  public transitMethod: 'AIR' | 'SEA' | 'LAND';
  public progressPercentage: number;
  public status: 'PREPARATION' | 'TRANSIT' | 'DELIVERED' | 'DELAYED';
  public coordinates: { lat: number; lon: number };

  constructor(record: EU_AidRecord) {
    this.id = record.uuid;
    this.provider = record.contributor;
    this.destinationRegion = record.target_sector;

    // Map supply type
    switch (record.supply_type) {
      case "Dry Rations":
        this.cargoType = "FOOD";
        // Convert lbs to Metric Tons: 1 lb = 0.000453592 Tons
        this.quantityStandardized = (record.weight_lbs || 0) * 0.000453592;
        break;
      case "Bottled Water":
        this.cargoType = "WATER";
        // Convert liters to kiloliters: 1 Liter = 0.001 Kiloliters
        this.quantityStandardized = (record.volume_liters || 0) * 0.001;
        break;
      case "Hospital Gear":
        this.cargoType = "MEDICAL";
        this.quantityStandardized = (record.weight_lbs || 0) * 0.000453592;
        break;
      case "Battery Packs":
        this.cargoType = "POWER_SYSTEM";
        this.quantityStandardized = (record.weight_lbs || 0) * 0.000453592;
        break;
      default:
        this.cargoType = "FOOD";
        this.quantityStandardized = 0;
    }

    // Map transit vector
    this.transitMethod = record.vector_path === "AIR_CARRIER" ? "AIR" :
                         record.vector_path === "OCEAN_FREIGHT" ? "SEA" : "LAND";

    // Map status code
    switch (record.status_code) {
      case 10:
        this.status = "PREPARATION";
        this.progressPercentage = 5;
        break;
      case 20:
        this.status = "TRANSIT";
        this.progressPercentage = 45;
        break;
      case 30:
        this.status = "DELIVERED";
        this.progressPercentage = 100;
        break;
      case 40:
        this.status = "DELAYED";
        this.progressPercentage = 60;
        break;
      default:
        this.status = "PREPARATION";
        this.progressPercentage = 0;
    }

    this.coordinates = { lat: record.lat, lon: record.lon };
  }
}

/**
 * Client-facing registry compiling and standardizing aid routes.
 */
export function getStandardizedAidCargo(): StandardAidCargo[] {
  // Mock external DB records
  const meRecords: ME_AidRecord[] = [
    {
      record_id: "ME-991",
      donor_country: "UAE",
      recipient_zone: "Palestine",
      resource_category: "Medical Kits",
      metric_quantity_tons: 85,
      shipment_route_type: "FLIGHT",
      transit_completion_ratio: 0.65,
      current_lat: 27.5,
      current_lon: 43.1
    },
    {
      record_id: "ME-312",
      donor_country: "Saudi Arabia",
      recipient_zone: "Sudan",
      resource_category: "Hydration Reserves",
      liquid_volume_gallons: 250000,
      shipment_route_type: "CARGO_VESSEL",
      transit_completion_ratio: 0.35,
      current_lat: 19.2,
      current_lon: 39.8
    }
  ];

  const euRecords: EU_AidRecord[] = [
    {
      uuid: "EU-77A",
      contributor: "Germany",
      target_sector: "Turkey",
      supply_type: "Battery Packs",
      weight_lbs: 44000, // ~20 tons
      vector_path: "TRUCK_CARAVAN",
      status_code: 20,
      lat: 41.0082,
      lon: 28.9784
    },
    {
      uuid: "EU-12X",
      contributor: "United Kingdom",
      target_sector: "Syria",
      supply_type: "Dry Rations",
      weight_lbs: 98000,
      vector_path: "AIR_CARRIER",
      status_code: 30,
      lat: 35.5130,
      lon: 38.0000
    }
  ];

  // Map mismatching structures standardly!
  const results: StandardAidCargo[] = [];
  meRecords.forEach(r => results.push(new ME_AidAdapter(r)));
  euRecords.forEach(r => results.push(new EU_AidAdapter(r)));
  return results;
}
