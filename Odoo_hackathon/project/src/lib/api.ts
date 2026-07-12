import { supabase } from '../lib/supabase';
import type {
  Vehicle, Driver, Trip, Maintenance, FuelLog, Expense, VehicleDocument,
} from '../types';

// ============ Vehicles ============
export async function fetchVehicles() {
  const { data, error } = await supabase.from('vehicles').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data as Vehicle[];
}

export async function createVehicle(input: Omit<Vehicle, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase.from('vehicles').insert(input).select().single();
  if (error) throw error;
  return data as Vehicle;
}

export async function updateVehicle(id: string, updates: Partial<Vehicle>) {
  const { data, error } = await supabase.from('vehicles').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data as Vehicle;
}

export async function deleteVehicle(id: string) {
  const { error } = await supabase.from('vehicles').delete().eq('id', id);
  if (error) throw error;
}

// ============ Drivers ============
export async function fetchDrivers() {
  const { data, error } = await supabase.from('drivers').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data as Driver[];
}

export async function createDriver(input: Omit<Driver, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase.from('drivers').insert(input).select().single();
  if (error) throw error;
  return data as Driver;
}

export async function updateDriver(id: string, updates: Partial<Driver>) {
  const { data, error } = await supabase.from('drivers').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data as Driver;
}

export async function deleteDriver(id: string) {
  const { error } = await supabase.from('drivers').delete().eq('id', id);
  if (error) throw error;
}

// ============ Trips ============
export async function fetchTrips() {
  const { data, error } = await supabase
    .from('trips')
    .select('*, vehicle:vehicles(id, registration_number, name), driver:drivers(id, name, license_number)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Trip[];
}

export async function createTrip(input: Omit<Trip, 'id' | 'created_at' | 'updated_at' | 'vehicle' | 'driver'>) {
  const { data, error } = await supabase.from('trips').insert(input).select().single();
  if (error) throw error;
  return data as Trip;
}

export async function updateTrip(id: string, updates: Partial<Trip>) {
  const { data, error } = await supabase.from('trips').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data as Trip;
}

export async function deleteTrip(id: string) {
  const { error } = await supabase.from('trips').delete().eq('id', id);
  if (error) throw error;
}

// ============ Maintenance ============
export async function fetchMaintenance() {
  const { data, error } = await supabase
    .from('maintenance')
    .select('*, vehicle:vehicles(id, registration_number, name)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Maintenance[];
}

export async function createMaintenance(input: Omit<Maintenance, 'id' | 'created_at' | 'updated_at' | 'vehicle'>) {
  const { data, error } = await supabase.from('maintenance').insert(input).select().single();
  if (error) throw error;
  return data as Maintenance;
}

export async function updateMaintenance(id: string, updates: Partial<Maintenance>) {
  const { data, error } = await supabase.from('maintenance').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data as Maintenance;
}

export async function deleteMaintenance(id: string) {
  const { error } = await supabase.from('maintenance').delete().eq('id', id);
  if (error) throw error;
}

// ============ Fuel Logs ============
export async function fetchFuelLogs() {
  const { data, error } = await supabase
    .from('fuel_logs')
    .select('*, vehicle:vehicles(id, registration_number, name), trip:trips(id, source, destination)')
    .order('fuel_date', { ascending: false });
  if (error) throw error;
  return data as FuelLog[];
}

export async function createFuelLog(input: Omit<FuelLog, 'id' | 'created_at' | 'vehicle' | 'trip'>) {
  const { data, error } = await supabase.from('fuel_logs').insert(input).select().single();
  if (error) throw error;
  return data as FuelLog;
}

export async function updateFuelLog(id: string, updates: Partial<FuelLog>) {
  const { data, error } = await supabase.from('fuel_logs').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data as FuelLog;
}

export async function deleteFuelLog(id: string) {
  const { error } = await supabase.from('fuel_logs').delete().eq('id', id);
  if (error) throw error;
}

// ============ Expenses ============
export async function fetchExpenses() {
  const { data, error } = await supabase
    .from('expenses')
    .select('*, vehicle:vehicles(id, registration_number, name)')
    .order('expense_date', { ascending: false });
  if (error) throw error;
  return data as Expense[];
}

export async function createExpense(input: Omit<Expense, 'id' | 'created_at' | 'vehicle'>) {
  const { data, error } = await supabase.from('expenses').insert(input).select().single();
  if (error) throw error;
  return data as Expense;
}

export async function updateExpense(id: string, updates: Partial<Expense>) {
  const { data, error } = await supabase.from('expenses').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data as Expense;
}

export async function deleteExpense(id: string) {
  const { error } = await supabase.from('expenses').delete().eq('id', id);
  if (error) throw error;
}

// ============ Vehicle Documents ============
export async function fetchDocuments() {
  const { data, error } = await supabase
    .from('vehicle_documents')
    .select('*, vehicle:vehicles(id, registration_number, name)')
    .order('uploaded_at', { ascending: false });
  if (error) throw error;
  return data as (VehicleDocument & { vehicle: Pick<Vehicle, 'id' | 'registration_number' | 'name'> | null })[];
}

export async function createDocument(input: Omit<VehicleDocument, 'id' | 'uploaded_at'>) {
  const { data, error } = await supabase.from('vehicle_documents').insert(input).select().single();
  if (error) throw error;
  return data as VehicleDocument;
}

export async function deleteDocument(id: string) {
  const { error } = await supabase.from('vehicle_documents').delete().eq('id', id);
  if (error) throw error;
}

// ============ Dashboard KPIs ============
export interface DashboardKPIs {
  activeVehicles: number;
  availableVehicles: number;
  inMaintenanceVehicles: number;
  activeTrips: number;
  pendingTrips: number;
  driversOnDuty: number;
  fleetUtilization: number;
  vehicleStatusDist: Record<string, number>;
  fuelCostTrend: { month: string; cost: number }[];
  tripsPerMonth: { month: string; count: number }[];
  operationalCost: { month: string; cost: number }[];
  recentTrips: Trip[];
  recentMaintenance: Maintenance[];
  recentFuel: FuelLog[];
  expiringDrivers: Driver[];
}

export async function fetchDashboardKPIs(): Promise<DashboardKPIs> {
  const [vehicles, drivers, trips, maintenance, fuelLogs, expenses] = await Promise.all([
    fetchVehicles(),
    fetchDrivers(),
    fetchTrips(),
    fetchMaintenance(),
    fetchFuelLogs(),
    fetchExpenses(),
  ]);

  const activeVehicles = vehicles.filter((v) => v.status === 'On Trip').length;
  const availableVehicles = vehicles.filter((v) => v.status === 'Available').length;
  const inMaintenanceVehicles = vehicles.filter((v) => v.status === 'In Shop').length;
  const activeTrips = trips.filter((t) => t.status === 'Dispatched').length;
  const pendingTrips = trips.filter((t) => t.status === 'Draft').length;
  const driversOnDuty = drivers.filter((d) => d.status === 'On Trip' || d.status === 'Available').length;
  const fleetUtilization = vehicles.length > 0
    ? Math.round((activeVehicles / (vehicles.filter(v => v.status !== 'Retired').length || 1)) * 100)
    : 0;

  const vehicleStatusDist: Record<string, number> = {};
  vehicles.forEach((v) => {
    vehicleStatusDist[v.status] = (vehicleStatusDist[v.status] ?? 0) + 1;
  });

  const monthLabel = (d: Date) => d.toLocaleString('en-US', { month: 'short' });
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    return { key: `${d.getFullYear()}-${d.getMonth()}`, label: monthLabel(d) };
  });

  const fuelCostTrend = last6Months.map((m) => {
    const cost = fuelLogs
      .filter((f) => {
        const d = new Date(f.fuel_date);
        return `${d.getFullYear()}-${d.getMonth()}` === m.key;
      })
      .reduce((sum, f) => sum + Number(f.cost), 0);
    return { month: m.label, cost };
  });

  const tripsPerMonth = last6Months.map((m) => {
    const count = trips.filter((t) => {
      const d = new Date(t.created_at);
      return `${d.getFullYear()}-${d.getMonth()}` === m.key;
    }).length;
    return { month: m.label, count };
  });

  const operationalCost = last6Months.map((m) => {
    const fuel = fuelLogs.filter((f) => {
      const d = new Date(f.fuel_date);
      return `${d.getFullYear()}-${d.getMonth()}` === m.key;
    }).reduce((s, f) => s + Number(f.cost), 0);
    const maint = maintenance.filter((mt) => {
      const d = new Date(mt.start_date);
      return `${d.getFullYear()}-${d.getMonth()}` === m.key;
    }).reduce((s, mt) => s + Number(mt.cost), 0);
    const exp = expenses.filter((e) => {
      const d = new Date(e.expense_date);
      return `${d.getFullYear()}-${d.getMonth()}` === m.key;
    }).reduce((s, e) => s + Number(e.amount), 0);
    return { month: m.label, cost: fuel + maint + exp };
  });

  const recentTrips = trips.slice(0, 5);
  const recentMaintenance = maintenance.slice(0, 5);
  const recentFuel = fuelLogs.slice(0, 5);

  const now = new Date();
  const expiringDrivers = drivers.filter((d) => {
    const expiry = new Date(d.license_expiry);
    const diff = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 30 && diff >= -365;
  });

  return {
    activeVehicles, availableVehicles, inMaintenanceVehicles,
    activeTrips, pendingTrips, driversOnDuty, fleetUtilization,
    vehicleStatusDist, fuelCostTrend, tripsPerMonth, operationalCost,
    recentTrips, recentMaintenance, recentFuel, expiringDrivers,
  };
}
