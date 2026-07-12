import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Truck, Route, Users, Gauge, Fuel, Wrench, TrendingUp, Clock, AlertTriangle,
} from 'lucide-react';
import { fetchDashboardKPIs, type DashboardKPIs } from '../lib/api';
import { Loading, EmptyState, Badge } from '../components/ui/Feedback';
import { BarChart, LineChart, DoughnutChart } from '../components/ui/Charts';

const chartColors = ['#2563eb', '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6', '#22c55e'];

export function DashboardPage() {
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({ type: '', status: '', region: '' });

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDashboardKPIs();
      setKpis(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <Loading message="Loading dashboard..." />;
  if (error) return <div className="card p-6 text-error-600">{error}</div>;
  if (!kpis) return null;

  const cards = [
    { label: 'Active Vehicles', value: kpis.activeVehicles, icon: Truck, color: 'text-primary-600', bg: 'bg-primary-50 dark:bg-primary-900/20' },
    { label: 'Available Vehicles', value: kpis.availableVehicles, icon: Truck, color: 'text-success-600', bg: 'bg-success-50 dark:bg-success-900/20' },
    { label: 'In Maintenance', value: kpis.inMaintenanceVehicles, icon: Wrench, color: 'text-warning-600', bg: 'bg-warning-50 dark:bg-warning-900/20' },
    { label: 'Active Trips', value: kpis.activeTrips, icon: Route, color: 'text-primary-600', bg: 'bg-primary-50 dark:bg-primary-900/20' },
    { label: 'Pending Trips', value: kpis.pendingTrips, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { label: 'Drivers On Duty', value: kpis.driversOnDuty, icon: Users, color: 'text-accent-600', bg: 'bg-accent-50 dark:bg-accent-900/20' },
    { label: 'Fleet Utilization', value: `${kpis.fleetUtilization}%`, icon: Gauge, color: 'text-primary-600', bg: 'bg-primary-50 dark:bg-primary-900/20' },
  ];

  const statusLabels = Object.keys(kpis.vehicleStatusDist);
  const statusValues = Object.values(kpis.vehicleStatusDist);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Real-time fleet operations overview</p>
        </div>
        <div className="flex gap-2">
          <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })} className="input w-auto">
            <option value="">All Types</option>
            <option value="Truck">Truck</option>
            <option value="Van">Van</option>
            <option value="Bus">Bus</option>
            <option value="Tanker">Tanker</option>
            <option value="Refrigerated">Refrigerated</option>
          </select>
          <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="input w-auto">
            <option value="">All Status</option>
            <option value="Available">Available</option>
            <option value="On Trip">On Trip</option>
            <option value="In Shop">In Shop</option>
            <option value="Retired">Retired</option>
          </select>
          <select value={filters.region} onChange={(e) => setFilters({ ...filters, region: e.target.value })} className="input w-auto">
            <option value="">All Regions</option>
            <option value="North">North</option>
            <option value="South">South</option>
            <option value="East">East</option>
            <option value="West">West</option>
            <option value="Central">Central</option>
          </select>
        </div>
      </div>

      {kpis.expiringDrivers.length > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-warning-200 bg-warning-50 px-4 py-3 dark:border-warning-800 dark:bg-warning-900/20">
          <AlertTriangle className="h-5 w-5 shrink-0 text-warning-600" />
          <div>
            <p className="text-sm font-medium text-warning-800 dark:text-warning-400">
              {kpis.expiringDrivers.length} driver license(s) expiring within 30 days
            </p>
            <p className="text-xs text-warning-600 dark:text-warning-500">
              {kpis.expiringDrivers.map((d) => `${d.name} (${d.license_expiry})`).join(', ')}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="card p-4">
              <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${card.bg}`}>
                <Icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{card.value}</p>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{card.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <h3 className="mb-4 text-sm font-semibold text-slate-800 dark:text-slate-200">Vehicle Status Distribution</h3>
          {statusValues.length > 0 ? (
            <DoughnutChart labels={statusLabels} data={statusValues} colors={chartColors} height={220} />
          ) : (
            <EmptyState icon={Truck} title="No vehicles" />
          )}
        </div>

        <div className="card p-5">
          <h3 className="mb-4 text-sm font-semibold text-slate-800 dark:text-slate-200">Fuel Cost Trend (6 months)</h3>
          <LineChart
            labels={kpis.fuelCostTrend.map((d) => d.month)}
            datasets={[{ label: 'Fuel Cost', data: kpis.fuelCostTrend.map((d) => d.cost), color: '#2563eb' }]}
            height={220}
          />
        </div>

        <div className="card p-5">
          <h3 className="mb-4 text-sm font-semibold text-slate-800 dark:text-slate-200">Trips Per Month</h3>
          <BarChart labels={kpis.tripsPerMonth.map((d) => d.month)} data={kpis.tripsPerMonth.map((d) => d.count)} label="Trips" color="#14b8a6" height={220} />
        </div>

        <div className="card p-5">
          <h3 className="mb-4 text-sm font-semibold text-slate-800 dark:text-slate-200">Operational Cost (6 months)</h3>
          <LineChart
            labels={kpis.operationalCost.map((d) => d.month)}
            datasets={[{ label: 'Total Cost', data: kpis.operationalCost.map((d) => d.cost), color: '#f59e0b' }]}
            height={220}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Recent Trips</h3>
            <Link to="/trips" className="text-xs text-primary-600 hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {kpis.recentTrips.length > 0 ? kpis.recentTrips.map((t) => (
              <div key={t.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{t.source} → {t.destination}</p>
                  <p className="text-xs text-slate-400">{t.vehicle?.registration_number ?? 'N/A'}</p>
                </div>
                <Badge status={t.status}>{t.status}</Badge>
              </div>
            )) : <EmptyState icon={Route} title="No trips" />}
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Recent Maintenance</h3>
            <Link to="/maintenance" className="text-xs text-primary-600 hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {kpis.recentMaintenance.length > 0 ? kpis.recentMaintenance.map((m) => (
              <div key={m.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{m.type}</p>
                  <p className="text-xs text-slate-400">{m.vehicle?.registration_number ?? 'N/A'}</p>
                </div>
                <Badge status={m.status}>{m.status}</Badge>
              </div>
            )) : <EmptyState icon={Wrench} title="No maintenance" />}
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Recent Fuel Logs</h3>
            <Link to="/fuel" className="text-xs text-primary-600 hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {kpis.recentFuel.length > 0 ? kpis.recentFuel.map((f) => (
              <div key={f.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{f.liters} L</p>
                  <p className="text-xs text-slate-400">{f.vehicle?.registration_number ?? 'N/A'}</p>
                </div>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">${f.cost}</span>
              </div>
            )) : <EmptyState icon={Fuel} title="No fuel logs" />}
          </div>
        </div>
      </div>
    </div>
  );
}
