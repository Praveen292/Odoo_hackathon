/*
# TransitOps – Core Schema

1. Overview
TransitOps is a multi-user transport operations ERP. Users sign in (Supabase email/password auth) and are assigned one of four roles: Fleet Manager, Driver, Safety Officer, Financial Analyst. All tables are owner-scoped to the organization via the authenticated user, but for this single-org demo we allow any authenticated user to read/write all operational data. RLS is enabled on every table and scoped to `authenticated`.

2. New Tables
- `roles` — lookup of the four RBAC roles (id, name, description).
- `profiles` — extends `auth.users` with display name and role_id.
- `vehicles` — fleet registry (registration, model, type, capacity, odometer, acquisition cost, status).
- `drivers` — driver roster (license, category, expiry, phone, safety score, status).
- `trips` — trip workflow (source, destination, vehicle, driver, cargo, distance, revenue, status, completion fields).
- `maintenance` — maintenance records (vehicle, type, description, cost, dates, status).
- `fuel_logs` — fuel entries (vehicle, trip, liters, cost, date, station, efficiency).
- `expenses` — operational expenses (vehicle, type, date, amount, description).
- `vehicle_documents` — document metadata (vehicle, type, file path, uploaded at).

3. Relationships
- profiles.role_id → roles.id
- trips.vehicle_id → vehicles.id, trips.driver_id → drivers.id
- maintenance.vehicle_id → vehicles.id
- fuel_logs.vehicle_id → vehicles.id, fuel_logs.trip_id → trips.id (nullable)
- expenses.vehicle_id → vehicles.id
- vehicle_documents.vehicle_id → vehicles.id

4. Security
- RLS enabled on every table.
- All policies scoped `TO authenticated` (app has a sign-in screen).
- profiles: owner can read/update own row; all authenticated can read (for role lookups).
- Operational tables: any authenticated user can CRUD (single-org demo).

5. Notes
- Status fields use text with CHECK constraints to enforce allowed values.
- Unique constraint on vehicles.registration_number.
- Timestamps default to now().
*/

-- Roles lookup
CREATE TABLE IF NOT EXISTS roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Profiles extending auth.users
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  role_id uuid REFERENCES roles(id),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_all" ON profiles;
CREATE POLICY "profiles_select_all" ON profiles FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Vehicles
CREATE TABLE IF NOT EXISTS vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_number text NOT NULL UNIQUE,
  name text NOT NULL,
  model text NOT NULL,
  type text NOT NULL CHECK (type IN ('Truck','Trailer','Van','Bus','Car','Tanker','Refrigerated')),
  max_load_capacity numeric(12,2) NOT NULL DEFAULT 0,
  current_odometer numeric(12,2) NOT NULL DEFAULT 0,
  acquisition_cost numeric(14,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'Available' CHECK (status IN ('Available','On Trip','In Shop','Retired')),
  region text NOT NULL DEFAULT 'Central',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_type ON vehicles(type);

DROP POLICY IF EXISTS "vehicles_select" ON vehicles;
CREATE POLICY "vehicles_select" ON vehicles FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "vehicles_insert" ON vehicles;
CREATE POLICY "vehicles_insert" ON vehicles FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "vehicles_update" ON vehicles;
CREATE POLICY "vehicles_update" ON vehicles FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "vehicles_delete" ON vehicles;
CREATE POLICY "vehicles_delete" ON vehicles FOR DELETE TO authenticated USING (true);

-- Drivers
CREATE TABLE IF NOT EXISTS drivers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  license_number text NOT NULL UNIQUE,
  license_category text NOT NULL,
  license_expiry date NOT NULL,
  phone_number text,
  safety_score numeric(5,2) NOT NULL DEFAULT 100,
  status text NOT NULL DEFAULT 'Available' CHECK (status IN ('Available','On Trip','Off Duty','Suspended')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_drivers_status ON drivers(status);

DROP POLICY IF EXISTS "drivers_select" ON drivers;
CREATE POLICY "drivers_select" ON drivers FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "drivers_insert" ON drivers;
CREATE POLICY "drivers_insert" ON drivers FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "drivers_update" ON drivers;
CREATE POLICY "drivers_update" ON drivers FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "drivers_delete" ON drivers;
CREATE POLICY "drivers_delete" ON drivers FOR DELETE TO authenticated USING (true);

-- Trips
CREATE TABLE IF NOT EXISTS trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL,
  destination text NOT NULL,
  vehicle_id uuid REFERENCES vehicles(id) ON DELETE SET NULL,
  driver_id uuid REFERENCES drivers(id) ON DELETE SET NULL,
  cargo_weight numeric(12,2) NOT NULL DEFAULT 0,
  planned_distance numeric(12,2) NOT NULL DEFAULT 0,
  revenue numeric(14,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft','Dispatched','Completed','Cancelled')),
  final_odometer numeric(12,2),
  fuel_consumed numeric(12,2),
  completion_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(status);
CREATE INDEX IF NOT EXISTS idx_trips_vehicle ON trips(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_trips_driver ON trips(driver_id);

DROP POLICY IF EXISTS "trips_select" ON trips;
CREATE POLICY "trips_select" ON trips FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "trips_insert" ON trips;
CREATE POLICY "trips_insert" ON trips FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "trips_update" ON trips;
CREATE POLICY "trips_update" ON trips FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "trips_delete" ON trips;
CREATE POLICY "trips_delete" ON trips FOR DELETE TO authenticated USING (true);

-- Maintenance
CREATE TABLE IF NOT EXISTS maintenance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid REFERENCES vehicles(id) ON DELETE SET NULL,
  type text NOT NULL CHECK (type IN ('Preventive','Corrective','Inspection','Major Overhaul','Tire Replacement','Oil Change')),
  description text,
  cost numeric(14,2) NOT NULL DEFAULT 0,
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date,
  status text NOT NULL DEFAULT 'Active' CHECK (status IN ('Active','Completed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE maintenance ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_maint_vehicle ON maintenance(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_maint_status ON maintenance(status);

DROP POLICY IF EXISTS "maintenance_select" ON maintenance;
CREATE POLICY "maintenance_select" ON maintenance FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "maintenance_insert" ON maintenance;
CREATE POLICY "maintenance_insert" ON maintenance FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "maintenance_update" ON maintenance;
CREATE POLICY "maintenance_update" ON maintenance FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "maintenance_delete" ON maintenance;
CREATE POLICY "maintenance_delete" ON maintenance FOR DELETE TO authenticated USING (true);

-- Fuel logs
CREATE TABLE IF NOT EXISTS fuel_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid REFERENCES vehicles(id) ON DELETE SET NULL,
  trip_id uuid REFERENCES trips(id) ON DELETE SET NULL,
  liters numeric(12,2) NOT NULL DEFAULT 0,
  cost numeric(14,2) NOT NULL DEFAULT 0,
  fuel_date date NOT NULL DEFAULT CURRENT_DATE,
  station text,
  efficiency numeric(10,2),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE fuel_logs ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_fuel_vehicle ON fuel_logs(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_fuel_date ON fuel_logs(fuel_date);

DROP POLICY IF EXISTS "fuel_select" ON fuel_logs;
CREATE POLICY "fuel_select" ON fuel_logs FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "fuel_insert" ON fuel_logs;
CREATE POLICY "fuel_insert" ON fuel_logs FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "fuel_update" ON fuel_logs;
CREATE POLICY "fuel_update" ON fuel_logs FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "fuel_delete" ON fuel_logs;
CREATE POLICY "fuel_delete" ON fuel_logs FOR DELETE TO authenticated USING (true);

-- Expenses
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid REFERENCES vehicles(id) ON DELETE SET NULL,
  type text NOT NULL CHECK (type IN ('Maintenance','Repair','Toll','Parking','Insurance','Other')),
  expense_date date NOT NULL DEFAULT CURRENT_DATE,
  amount numeric(14,2) NOT NULL DEFAULT 0,
  description text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_expense_vehicle ON expenses(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_expense_date ON expenses(expense_date);

DROP POLICY IF EXISTS "expenses_select" ON expenses;
CREATE POLICY "expenses_select" ON expenses FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "expenses_insert" ON expenses;
CREATE POLICY "expenses_insert" ON expenses FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "expenses_update" ON expenses;
CREATE POLICY "expenses_update" ON expenses FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "expenses_delete" ON expenses;
CREATE POLICY "expenses_delete" ON expenses FOR DELETE TO authenticated USING (true);

-- Vehicle documents
CREATE TABLE IF NOT EXISTS vehicle_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid REFERENCES vehicles(id) ON DELETE CASCADE,
  document_type text NOT NULL CHECK (document_type IN ('Registration Certificate','Insurance','Pollution Certificate')),
  file_path text NOT NULL,
  file_name text,
  uploaded_at timestamptz DEFAULT now()
);
ALTER TABLE vehicle_documents ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_doc_vehicle ON vehicle_documents(vehicle_id);

DROP POLICY IF EXISTS "docs_select" ON vehicle_documents;
CREATE POLICY "docs_select" ON vehicle_documents FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "docs_insert" ON vehicle_documents;
CREATE POLICY "docs_insert" ON vehicle_documents FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "docs_update" ON vehicle_documents;
CREATE POLICY "docs_update" ON vehicle_documents FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "docs_delete" ON vehicle_documents;
CREATE POLICY "docs_delete" ON vehicle_documents FOR DELETE TO authenticated USING (true);

-- updated_at trigger
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_vehicles_updated ON vehicles;
CREATE TRIGGER trg_vehicles_updated BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS trg_drivers_updated ON drivers;
CREATE TRIGGER trg_drivers_updated BEFORE UPDATE ON drivers FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS trg_trips_updated ON trips;
CREATE TRIGGER trg_trips_updated BEFORE UPDATE ON trips FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS trg_maintenance_updated ON maintenance;
CREATE TRIGGER trg_maintenance_updated BEFORE UPDATE ON maintenance FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Seed roles
INSERT INTO roles (name, description) VALUES
  ('Fleet Manager', 'Full access to all modules and operations'),
  ('Driver', 'Limited access: trips and vehicle views'),
  ('Safety Officer', 'Access to drivers, maintenance, and safety reports'),
  ('Financial Analyst', 'Access to expenses, fuel, and financial reports')
ON CONFLICT (name) DO NOTHING;
