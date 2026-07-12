import { supabase } from './supabase';
import type { Trip, Vehicle, Driver } from '../types';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export async function validateTripDispatch(trip: Trip): Promise<ValidationResult> {
  const errors: string[] = [];

  const { data: vehicle } = await supabase
    .from('vehicles')
    .select('*')
    .eq('id', trip.vehicle_id)
    .maybeSingle();
  const v = vehicle as Vehicle | null;

  const { data: driver } = await supabase
    .from('drivers')
    .select('*')
    .eq('id', trip.driver_id)
    .maybeSingle();
  const d = driver as Driver | null;

  if (!v) {
    errors.push('Vehicle not found.');
  } else {
    if (v.status === 'In Shop') errors.push(`Vehicle ${v.registration_number} is in the shop and cannot be dispatched.`);
    if (v.status === 'Retired') errors.push(`Vehicle ${v.registration_number} is retired and cannot be dispatched.`);
    if (v.status === 'On Trip') errors.push(`Vehicle ${v.registration_number} is already on a trip.`);
    if (v.status !== 'Available' && v.status !== 'In Shop' && v.status !== 'Retired' && v.status !== 'On Trip') {
      errors.push(`Vehicle ${v.registration_number} is not available.`);
    }
    if (trip.cargo_weight > v.max_load_capacity) {
      errors.push(`Cargo weight (${trip.cargo_weight} kg) exceeds vehicle capacity (${v.max_load_capacity} kg).`);
    }
  }

  if (!d) {
    errors.push('Driver not found.');
  } else {
    const expiry = new Date(d.license_expiry);
    if (expiry < new Date()) {
      errors.push(`Driver ${d.name}'s license expired on ${d.license_expiry}.`);
    }
    if (d.status === 'Suspended') {
      errors.push(`Driver ${d.name} is suspended and cannot be assigned.`);
    }
    if (d.status === 'On Trip') {
      errors.push(`Driver ${d.name} is already on a trip.`);
    }
  }

  return { valid: errors.length === 0, errors };
}

export async function dispatchTrip(tripId: string): Promise<{ success: boolean; errors: string[] }> {
  const { data: tripData } = await supabase
    .from('trips')
    .select('*')
    .eq('id', tripId)
    .maybeSingle();
  const trip = tripData as Trip | null;
  if (!trip) return { success: false, errors: ['Trip not found.'] };
  if (trip.status !== 'Draft') return { success: false, errors: [`Trip is ${trip.status}, cannot dispatch.`] };

  const validation = await validateTripDispatch(trip);
  if (!validation.valid) return { success: false, errors: validation.errors };

  const { error: tripErr } = await supabase.from('trips').update({ status: 'Dispatched' }).eq('id', tripId);
  if (tripErr) return { success: false, errors: [tripErr.message] };

  const { error: vErr } = await supabase.from('vehicles').update({ status: 'On Trip' }).eq('id', trip.vehicle_id);
  if (vErr) return { success: false, errors: [vErr.message] };

  const { error: dErr } = await supabase.from('drivers').update({ status: 'On Trip' }).eq('id', trip.driver_id);
  if (dErr) return { success: false, errors: [dErr.message] };

  return { success: true, errors: [] };
}

export async function completeTrip(
  tripId: string,
  completion: { finalOdometer: number; fuelConsumed: number; completionDate: string },
): Promise<{ success: boolean; errors: string[] }> {
  const { data: tripData } = await supabase
    .from('trips')
    .select('*')
    .eq('id', tripId)
    .maybeSingle();
  const trip = tripData as Trip | null;
  if (!trip) return { success: false, errors: ['Trip not found.'] };
  if (trip.status !== 'Dispatched') return { success: false, errors: [`Trip is ${trip.status}, cannot complete.`] };

  const { error: tripErr } = await supabase
    .from('trips')
    .update({
      status: 'Completed',
      final_odometer: completion.finalOdometer,
      fuel_consumed: completion.fuelConsumed,
      completion_date: completion.completionDate,
    })
    .eq('id', tripId);
  if (tripErr) return { success: false, errors: [tripErr.message] };

  const { data: vehicle } = await supabase
    .from('vehicles')
    .select('*')
    .eq('id', trip.vehicle_id)
    .maybeSingle();
  const v = vehicle as Vehicle | null;

  if (v && v.status !== 'Retired') {
    await supabase
      .from('vehicles')
      .update({ status: 'Available', current_odometer: completion.finalOdometer })
      .eq('id', trip.vehicle_id);
  }

  await supabase.from('drivers').update({ status: 'Available' }).eq('id', trip.driver_id);

  if (trip.planned_distance && completion.fuelConsumed > 0) {
    const efficiency = Math.round((trip.planned_distance / completion.fuelConsumed) * 100) / 100;
    await supabase.from('fuel_logs').insert({
      vehicle_id: trip.vehicle_id,
      trip_id: tripId,
      liters: completion.fuelConsumed,
      cost: completion.fuelConsumed * 1.5,
      fuel_date: completion.completionDate,
      station: 'Auto-generated on trip completion',
      efficiency,
    });
  }

  return { success: true, errors: [] };
}

export async function cancelTrip(tripId: string): Promise<{ success: boolean; errors: string[] }> {
  const { data: tripData } = await supabase
    .from('trips')
    .select('*')
    .eq('id', tripId)
    .maybeSingle();
  const trip = tripData as Trip | null;
  if (!trip) return { success: false, errors: ['Trip not found.'] };
  if (trip.status === 'Completed' || trip.status === 'Cancelled') {
    return { success: false, errors: [`Trip is already ${trip.status}.`] };
  }

  const { error: tripErr } = await supabase.from('trips').update({ status: 'Cancelled' }).eq('id', tripId);
  if (tripErr) return { success: false, errors: [tripErr.message] };

  if (trip.vehicle_id) {
    const { data: vehicle } = await supabase.from('vehicles').select('status').eq('id', trip.vehicle_id).maybeSingle();
    const v = vehicle as Pick<Vehicle, 'status'> | null;
    if (v && v.status === 'On Trip') {
      await supabase.from('vehicles').update({ status: 'Available' }).eq('id', trip.vehicle_id);
    }
  }

  if (trip.driver_id) {
    const { data: driver } = await supabase.from('drivers').select('status').eq('id', trip.driver_id).maybeSingle();
    const d = driver as Pick<Driver, 'status'> | null;
    if (d && d.status === 'On Trip') {
      await supabase.from('drivers').update({ status: 'Available' }).eq('id', trip.driver_id);
    }
  }

  return { success: true, errors: [] };
}

export async function createMaintenanceRecord(input: {
  vehicle_id: string;
  type: string;
  description?: string;
  cost: number;
  start_date: string;
}): Promise<{ success: boolean; errors: string[] }> {
  const { data: vehicle } = await supabase
    .from('vehicles')
    .select('*')
    .eq('id', input.vehicle_id)
    .maybeSingle();
  const v = vehicle as Vehicle | null;

  if (!v) return { success: false, errors: ['Vehicle not found.'] };
  if (v.status === 'Retired') return { success: false, errors: ['Cannot create maintenance for a retired vehicle.'] };

  const { data, error } = await supabase
    .from('maintenance')
    .insert({ ...input, status: 'Active' })
    .select()
    .single();
  if (error) return { success: false, errors: [error.message] };

  await supabase.from('vehicles').update({ status: 'In Shop' }).eq('id', input.vehicle_id);

  return { success: true, errors: [] };
}

export async function completeMaintenance(maintenanceId: string): Promise<{ success: boolean; errors: string[] }> {
  const { data: maint } = await supabase
    .from('maintenance')
    .select('*, vehicle:vehicles(*)')
    .eq('id', maintenanceId)
    .maybeSingle();
  const m = maint as (Maintenance & { vehicle: Vehicle | null }) | null;

  if (!m) return { success: false, errors: ['Maintenance record not found.'] };
  if (m.status === 'Completed') return { success: false, errors: ['Maintenance already completed.'] };

  const { error } = await supabase
    .from('maintenance')
    .update({ status: 'Completed', end_date: new Date().toISOString().split('T')[0] })
    .eq('id', maintenanceId);
  if (error) return { success: false, errors: [error.message] };

  if (m.vehicle && m.vehicle.status !== 'Retired') {
    await supabase.from('vehicles').update({ status: 'Available' }).eq('id', m.vehicle_id);
  }

  return { success: true, errors: [] };
}

// Import Maintenance type for the function above
import type { Maintenance } from '../types';
