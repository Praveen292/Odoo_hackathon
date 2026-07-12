import { useEffect, useState, useMemo } from 'react';
import { Download, TrendingUp, DollarSign, Gauge, Route, BarChart3 } from 'lucide-react';
import Papa from 'papaparse';
import {
  fetchVehicles, fetchDrivers, fetchTrips, fetchMaintenance, fetchFuelLogs, fetchExpenses,
} from '../lib/api';
import type { Vehicle, Driver, Trip, Maintenance, FuelLog, Expense } from '../types';
import { Loading, EmptyState } from '../components/ui/Feedback';
import { BarChart, LineChart, DoughnutChart } from '../components/ui/Charts';
import { useToast } from '../context/ToastContext';

const chartColors = ['#2563eb', '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6', '#22c55e'];

export function ReportsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [maintenance, setMaintenance] = useState<Maintenance[]>([]);
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [v, d, t, m, f, e] = await Promise.all([
          fetchVehicles(), fetchDrivers(), fetchTrips(), fetchMaintenance(), fetchFuelLogs(), fetchExpenses(),
        ]);
        setVehicles(v); setDrivers(d); setTrips(t); setMaintenance(m); setFuelLogs(f); setExpenses(e);
      } catch (err) {
        toast(err instanceof Error ? err.message : 'Failed to load report data', 'error');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const stats = useMemo(() => {
    const totalRevenue = trips.filter((t) => t.status === 'Completed').reduce((s, t) => s + Number(t.revenue), 0);
    const totalFuelCost = fuelLogs.reduce((s, f) => s + Number(f.cost), 0);
    const totalMaintenanceCost = maintenance.reduce((s, m) => s + Number(m.cost), 0);
    const totalExpenseCost = expenses.reduce((s, e) => s + Number(e.amount), 0);
    const totalOperationalCost = totalFuelCost + totalMaintenanceCost + totalExpenseCost;
    const activeVehicles = vehicles.filter((v) => v.status === 'On Trip').length;
    const nonRetired = vehicles.filter((v) => v.status !== 'Retired').length;
    const fleetUtilization = nonRetired > 0 ? Math.round((activeVehicles / nonRetired) * 100) : 0;

    const totalDistance = trips.filter((t) => t.status === 'Completed').reduce((s, t) => s + Number(t.planned_distance), 0);
    const totalFuel = fuelLogs.reduce((s, f) => s + Number(f.liters), 0);
    const fuelEfficiency = totalFuel > 0 ? Math.round((totalDistance / totalFuel) * 100) / 100 : 0;

    const vehicleRoi = vehicles.map((v) => {
      const vRevenue = trips.filter((t) => t.vehicle_id === v.id && t.status === 'Completed').reduce((s, t) => s + Number(t.revenue), 0);
      const vFuel = fuelLogs.filter((f) => f.vehicle_id === v.id).reduce((s, f) => s + Number(f.cost), 0);
      const vMaint = maintenance.filter((m) => m.vehicle_id === v.id).reduce((s, m) => s + Number(m.cost), 0);
      const roi = v.acquisition_cost > 0
        ? Math.round(((vRevenue - (vFuel + vMaint)) / Number(v.acquisition_cost)) * 10000) / 100
        : 0;
      return { vehicle: v, revenue: vRevenue, fuelCost: vFuel, maintCost: vMaint, roi };
    });

    const monthLabel = (d: Date) => d.toLocaleString('en-US', { month: 'short' });
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      return { key: `${d.getFullYear()}-${d.getMonth()}`, label: monthLabel(d) };
    });

    const monthlyFuel = last6Months.map((m) => ({
      month: m.label,
      cost: fuelLogs.filter((f) => {
        const d = new Date(f.fuel_date);
        return `${d.getFullYear()}-${d.getMonth()}` === m.key;
      }).reduce((s, f) => s + Number(f.cost), 0),
    }));

    const monthlyRevenue = last6Months.map((m) => ({
      month: m.label,
      revenue: trips.filter((t) => {
        const d = new Date(t.created_at);
        return `${d.getFullYear()}-${d.getMonth()}` === m.key && t.status === 'Completed';
      }).reduce((s, t) => s + Number(t.revenue), 0),
    }));

    const monthlyTrips = last6Months.map((m) => ({
      month: m.label,
      count: trips.filter((t) => {
        const d = new Date(t.created_at);
        return `${d.getFullYear()}-${d.getMonth()}` === m.key;
      }).length,
    }));

    const vehicleStatusDist: Record<string, number> = {};
    vehicles.forEach((v) => { vehicleStatusDist[v.status] = (vehicleStatusDist[v.status] ?? 0) + 1; });

    const maintByType: Record<string, number> = {};
    maintenance.forEach((m) => { maintByType[m.type] = (maintByType[m.type] ?? 0) + Number(m.cost); });

    return {
      totalRevenue, totalFuelCost, totalMaintenanceCost, totalExpenseCost, totalOperationalCost,
      fleetUtilization, fuelEfficiency, vehicleRoi,
      monthlyFuel, monthlyRevenue, monthlyTrips,
      vehicleStatusDist, maintByType,
    };
  }, [vehicles, trips, maintenance, fuelLogs, expenses]);

  const exportCSV = (data: Record<string, unknown>[], filename: string) => {
    const csv = Papa.parse(data, { header: true });
    const blob = new Blob([csv.data], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast('CSV exported', 'success');
  };

  if (loading) return <Loading message="Generating reports..." />;

  const kpiCards = [
    { label: 'Fleet Utilization', value: `${stats.fleetUtilization}%`, icon: Gauge, color: 'text-primary-600', bg: 'bg-primary-50 dark:bg-primary-900/20' },
    { label: 'Fuel Efficiency', value: `${stats.fuelEfficiency} km/L`, icon: Gauge, color: 'text-accent-600', bg: 'bg-accent-50 dark:bg-accent-900/20' },
    { label: 'Total Revenue', value: `$${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-success-600', bg: 'bg-success-50 dark:bg-success-900/20' },
    { label: 'Operational Cost', value: `$${stats.totalOperationalCost.toLocaleString()}`, icon: TrendingUp, color: 'text-warning-600', bg: 'bg-warning-50 dark:bg-warning-900/20' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Reports & Analytics</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Comprehensive fleet performance insights</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="card p-5">
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
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Monthly Fuel Expense</h3>
            <button onClick={() => exportCSV(stats.monthlyFuel, 'monthly-fuel')} className="text-xs text-primary-600 hover:underline">
              <Download className="inline h-3.5 w-3.5" /> CSV
            </button>
          </div>
          <BarChart labels={stats.monthlyFuel.map((d) => d.month)} data={stats.monthlyFuel.map((d) => d.cost)} label="Fuel Cost" color="#2563eb" height={220} />
        </div>

        <div className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Monthly Revenue</h3>
            <button onClick={() => exportCSV(stats.monthlyRevenue, 'monthly-revenue')} className="text-xs text-primary-600 hover:underline">
              <Download className="inline h-3.5 w-3.5" /> CSV
            </button>
          </div>
          <LineChart labels={stats.monthlyRevenue.map((d) => d.month)} datasets={[{ label: 'Revenue', data: stats.monthlyRevenue.map((d) => d.revenue), color: '#22c55e' }]} height={220} />
        </div>

        <div className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Monthly Trips</h3>
            <button onClick={() => exportCSV(stats.monthlyTrips, 'monthly-trips')} className="text-xs text-primary-600 hover:underline">
              <Download className="inline h-3.5 w-3.5" /> CSV
            </button>
          </div>
          <BarChart labels={stats.monthlyTrips.map((d) => d.month)} data={stats.monthlyTrips.map((d) => d.count)} label="Trips" color="#14b8a6" height={220} />
        </div>

        <div className="card p-5">
          <h3 className="mb-4 text-sm font-semibold text-slate-800 dark:text-slate-200">Vehicle Status Distribution</h3>
          {Object.keys(stats.vehicleStatusDist).length > 0 ? (
            <DoughnutChart labels={Object.keys(stats.vehicleStatusDist)} data={Object.values(stats.vehicleStatusDist)} colors={chartColors} height={220} />
          ) : (
            <EmptyState icon={BarChart3} title="No data" />
          )}
        </div>

        <div className="card p-5">
          <h3 className="mb-4 text-sm font-semibold text-slate-800 dark:text-slate-200">Maintenance Cost by Type</h3>
          {Object.keys(stats.maintByType).length > 0 ? (
            <BarChart labels={Object.keys(stats.maintByType)} data={Object.values(stats.maintByType)} label="Cost" color="#f59e0b" height={220} />
          ) : (
            <EmptyState icon={BarChart3} title="No data" />
          )}
        </div>

        <div className="card p-5">
          <h3 className="mb-4 text-sm font-semibold text-slate-800 dark:text-slate-200">Driver Safety Scores</h3>
          {drivers.length > 0 ? (
            <BarChart labels={drivers.map((d) => d.name.split(' ')[0])} data={drivers.map((d) => d.safety_score)} label="Safety Score" color="#8b5cf6" height={220} />
          ) : (
            <EmptyState icon={BarChart3} title="No data" />
          )}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3 dark:border-slate-800">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Vehicle ROI Analysis</h3>
          <button
            onClick={() => exportCSV(stats.vehicleRoi.map((r) => ({
              Vehicle: r.vehicle.registration_number,
              Name: r.vehicle.name,
              Revenue: r.revenue,
              FuelCost: r.fuelCost,
              MaintenanceCost: r.maintCost,
              AcquisitionCost: r.vehicle.acquisition_cost,
              ROI: `${r.roi}%`,
            })), 'vehicle-roi')}
            className="btn-secondary text-xs"
          >
            <Download className="h-3.5 w-3.5" /> Export ROI CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="table-header">Vehicle</th>
                <th className="table-header">Revenue</th>
                <th className="table-header">Fuel Cost</th>
                <th className="table-header">Maintenance Cost</th>
                <th className="table-header">Acquisition Cost</th>
                <th className="table-header">ROI %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {stats.vehicleRoi.map((r) => (
                <tr key={r.vehicle.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <td className="table-cell font-medium text-slate-800 dark:text-slate-100">{r.vehicle.registration_number} — {r.vehicle.name}</td>
                  <td className="table-cell">${r.revenue.toLocaleString()}</td>
                  <td className="table-cell">${r.fuelCost.toLocaleString()}</td>
                  <td className="table-cell">${r.maintCost.toLocaleString()}</td>
                  <td className="table-cell">${Number(r.vehicle.acquisition_cost).toLocaleString()}</td>
                  <td className="table-cell">
                    <span className={r.roi >= 0 ? 'font-medium text-success-600' : 'font-medium text-error-600'}>
                      {r.roi}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
