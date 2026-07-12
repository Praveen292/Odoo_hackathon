import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const demoAccounts = [
  { email: 'manager@transitops.io', role: 'Fleet Manager' },
  { email: 'driver@transitops.io', role: 'Driver' },
  { email: 'safety@transitops.io', role: 'Safety Officer' },
  { email: 'finance@transitops.io', role: 'Financial Analyst' },
];

export function LoginPage() {
  const { signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('manager@transitops.io');
  const [password, setPassword] = useState('TransitOps123!');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      toast(error, 'error');
    } else {
      toast('Welcome to TransitOps', 'success');
      navigate('/dashboard');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-primary-50 to-accent-50 dark:from-slate-950 dark:from-slate-900 dark:to-slate-950">
      <div className="w-full max-w-md p-4">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-lg shadow-primary-600/30">
            <Navigation className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">TransitOps</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Smart Transport Operations Platform</p>
        </div>

        <div className="card p-6">
          <h2 className="mb-1 text-lg font-semibold text-slate-900 dark:text-white">Sign In</h2>
          <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">Enter your credentials to access the dashboard</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="you@company.com"
                required
              />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pr-10"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 border-t border-slate-200 pt-4 dark:border-slate-800">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Demo Accounts</p>
            <div className="grid grid-cols-2 gap-2">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.email}
                  onClick={() => {
                    setEmail(acc.email);
                    setPassword('TransitOps123!');
                  }}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-left text-xs transition-colors hover:border-primary-400 hover:bg-primary-50 dark:border-slate-700 dark:hover:bg-slate-800"
                >
                  <div className="font-medium text-slate-700 dark:text-slate-200">{acc.role}</div>
                  <div className="text-slate-400">{acc.email}</div>
                </button>
              ))}
            </div>
            <p className="mt-3 text-center text-xs text-slate-400">Password for all accounts: TransitOps123!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
