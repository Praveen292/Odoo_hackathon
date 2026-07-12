export type RoleName = 'Fleet Manager' | 'Driver' | 'Safety Officer' | 'Financial Analyst';

export type VehicleStatus = 'Available' | 'On Trip' | 'In Shop' | 'Retired';
export type VehicleType = 'Truck' | 'Trailer' | 'Van' | 'Bus' | 'Car' | 'Tanker' | 'Refrigerated';

export type DriverStatus = 'Available' | 'On Trip' | 'Off Duty' | 'Suspended';

export type TripStatus = 'Draft' | 'Dispatched' | 'Completed' | 'Cancelled';

export type MaintenanceStatus = 'Active' | 'Completed';
export type MaintenanceType = 'Preventive' | 'Corrective' | 'Inspection' | 'Major Overhaul' | 'Tire Replacement' | 'Oil Change';

export type ExpenseType = 'Maintenance' | 'Repair' | 'Toll' | 'Parking' | 'Insurance' | 'Other';

export type DocumentType = 'Registration Certificate' | 'Insurance' | 'Pollution Certificate';

export interface Role {
  id: string;
  name: RoleName;
  description: string | null;
}

export interface Profile {
  id: string;
  full_name: string;
  role_id: string | null;
  role?: Role | null;
}

export interface Vehicle {
  id: string;
  registration_number: string;
  name: string;
  model: string;
  type: VehicleType;
  max_load_capacity: number;
  current_odometer: number;
  acquisition_cost: number;
  status: VehicleStatus;
  region: string;
  created_at: string;
  updated_at: string;
}

export interface Driver {
  id: string;
  name: string;
  license_number: string;
  license_category: string;
  license_expiry: string;
  phone_number: string | null;
  safety_score: number;
  status: DriverStatus;
  created_at: string;
  updated_at: string;
}

export interface Trip {
  id: string;
  source: string;
  destination: string;
  vehicle_id: string | null;
  driver_id: string | null;
  cargo_weight: number;
  planned_distance: number;
  revenue: number;
  status: TripStatus;
  final_odometer: number | null;
  fuel_consumed: number | null;
  completion_date: string | null;
  created_at: string;
  updated_at: string;
  vehicle?: Pick<Vehicle, 'id' | 'registration_number' | 'name'> | null;
  driver?: Pick<Driver, 'id' | 'name' | 'license_number'> | null;
}

export interface Maintenance {
  id: string;
  vehicle_id: string | null;
  type: MaintenanceType;
  description: string | null;
  cost: number;
  start_date: string;
  end_date: string | null;
  status: MaintenanceStatus;
  created_at: string;
  updated_at: string;
  vehicle?: Pick<Vehicle, 'id' | 'registration_number' | 'name'> | null;
}

export interface FuelLog {
  id: string;
  vehicle_id: string | null;
  trip_id: string | null;
  liters: number;
  cost: number;
  fuel_date: string;
  station: string | null;
  efficiency: number | null;
  created_at: string;
  vehicle?: Pick<Vehicle, 'id' | 'registration_number' | 'name'> | null;
  trip?: Pick<Trip, 'id' | 'source' | 'destination'> | null;
}

export interface Expense {
  id: string;
  vehicle_id: string | null;
  type: ExpenseType;
  expense_date: string;
  amount: number;
  description: string | null;
  created_at: string;
  vehicle?: Pick<Vehicle, 'id' | 'registration_number' | 'name'> | null;
}

export interface VehicleDocument {
  id: string;
  vehicle_id: string;
  document_type: DocumentType;
  file_path: string;
  file_name: string | null;
  uploaded_at: string;
}
