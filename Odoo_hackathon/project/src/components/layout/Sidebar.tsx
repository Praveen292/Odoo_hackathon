import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Truck,
  Users,
  Route,
  Wrench,
  Fuel,
  Receipt,
  BarChart3,
  FileText,
  ChevronLeft,
  ChevronRight,
  Navigation,
} from 'lucide-react';
import { canAccess, type ModuleKey } from '../../lib/rbac';
import type { RoleName } from '../../types';

const navItems: { key: ModuleKey; label: string; icon: typeof Truck; path: string }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { key: 'vehicles', label: 'Vehicles', icon: Truck, path: '/vehicles' },
  { key: 'drivers', label: 'Drivers', icon: Users, path: '/drivers' },
  { key: 'trips', label: 'Trips', icon: Route, path: '/trips' },
  { key: 'maintenance', label: 'Maintenance', icon: Wrench, path: '/maintenance' },
  { key: 'fuel', label: 'Fuel Logs', icon: Fuel, path: '/fuel' },
  { key: 'expenses', label: 'Expenses', icon: Receipt, path: '/expenses' },
  { key: 'documents', label: 'Documents', icon: FileText, path: '/documents' },
  { key: 'reports', label: 'Reports', icon: BarChart3, path: '/reports' },
];

export function Sidebar({ role }: { role: RoleName | null }) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const items = navItems.filter((item) => canAccess(item.key, role));

  return (
    <aside
      className={`${
        collapsed ? 'w-16' : 'w-64'
      } shrink-0 border-r border-slate-200 bg-white transition-all duration-200 dark:border-slate-800 dark:bg-slate-900`}
    >
      <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4 dark:border-slate-800">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white">
            <Navigation className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div>
              <span className="block text-sm font-bold text-slate-900 dark:text-white">TransitOps</span>
              <span className="block text-xs text-slate-500">Transport ERP</span>
            </div>
          )}
        </Link>
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="rounded-md p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      <nav className="flex flex-col gap-1 p-3">
        {items.map((item) => {
          const active = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.key}
              to={item.path}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
