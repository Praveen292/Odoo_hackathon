import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon, LogOut, Search, Bell, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import type { RoleName } from '../../types';

interface TopbarProps {
  onMobileMenu?: () => void;
  expiringCount?: number;
}

export function Topbar({ onMobileMenu, expiringCount = 0 }: TopbarProps) {
  const { profile, roleName, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const roleColors: Record<RoleName, string> = {
    'Fleet Manager': 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400',
    Driver: 'bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-400',
    'Safety Officer': 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400',
    'Financial Analyst': 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400',
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
      <div className="flex items-center gap-3">
        {onMobileMenu && (
          <button onClick={onMobileMenu} className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden">
            <Menu className="h-5 w-5" />
          </button>
        )}
        <div className="relative hidden sm:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            className="w-64 rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm dark:border-slate-700 dark:bg-slate-800"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {expiringCount > 0 && (
          <div className="relative" title={`${expiringCount} driver license(s) expiring soon`}>
            <button className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-error-500 text-[10px] font-bold text-white">
                {expiringCount}
              </span>
            </button>
          </div>
        )}

        <button onClick={toggleTheme} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-sm font-semibold text-white">
              {profile?.full_name?.charAt(0) ?? 'U'}
            </div>
            <div className="hidden text-left sm:block">
              <div className="text-sm font-medium text-slate-800 dark:text-slate-100">{profile?.full_name ?? 'User'}</div>
              {roleName && (
                <span className={`mt-0.5 inline-block rounded px-1.5 py-0.5 text-[10px] font-medium ${roleColors[roleName]}`}>
                  {roleName}
                </span>
              )}
            </div>
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full z-20 mt-2 w-48 rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-800 dark:bg-slate-800">
                <div className="border-b border-slate-200 px-4 py-2 dark:border-slate-700">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{profile?.full_name}</p>
                  <p className="text-xs text-slate-500">{roleName}</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
