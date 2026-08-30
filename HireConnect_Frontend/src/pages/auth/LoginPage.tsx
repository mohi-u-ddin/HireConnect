import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Info } from 'lucide-react';
import { Logo } from '../../components/layout/Logo';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { isValidEmail, errorMessages } from '../../utils/validation';
import { DEMO_ACCOUNTS } from '../../data/mock/users';
import { ApiError } from '../../services/apiClient';
import type { Role } from '../../types';

const dashboardPathByRole: Record<Role, string> = {
  JOB_SEEKER: '/seeker/dashboard',
  EMPLOYER: '/employer/dashboard',
  ADMIN: '/admin/dashboard',
};

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const validate = () => {
    const next: typeof errors = {};
    if (!email) next.email = errorMessages.required;
    else if (!isValidEmail(email)) next.email = errorMessages.invalidEmail;
    if (!password) next.password = errorMessages.required;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    setErrors({});
    try {
      const user = await login({ email, password });
      showToast(`Welcome back, ${user.fullName.split(' ')[0]}.`, 'success');
      const from = (location.state as { from?: string } | null)?.from;
      navigate(from ?? dashboardPathByRole[user.role], { replace: true });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Something went wrong. Please try again.';
      setErrors({ form: message });
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemo = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setErrors({});
  };

  return (
    <div className="min-h-screen flex bg-bg dark:bg-bg-dark">
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 py-12">
        <div className="w-full max-w-sm mx-auto">
          <Logo className="mb-8" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome back</h1>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">Log in to continue your job search or hiring.</p>

          {errors.form && (
            <div className="mt-5 rounded-lg bg-danger-light text-danger text-sm px-4 py-3">{errors.form}</div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
            <Input
              label="Email address"
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail size={16} />}
              error={errors.email}
              placeholder="you@example.com"
              autoComplete="email"
            />
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock size={16} />}
              error={errors.password}
              placeholder="Enter your password"
              autoComplete="current-password"
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-primary/30"
                />
                Remember me
              </label>
              <Link to="/forgot-password" className="text-sm font-medium text-primary hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
              Log in
            </Button>
          </form>

          <div className="mt-6 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-4">
            <p className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 mb-2.5">
              <Info size={13} />
              Demo accounts (click to autofill)
            </p>
            <div className="grid grid-cols-3 gap-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => fillDemo(acc.email, acc.password)}
                  className="text-xs font-medium text-center py-2 rounded-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-primary hover:text-primary transition-colors bg-white dark:bg-slate-900"
                >
                  {acc.label}
                </button>
              ))}
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 bg-primary-dark relative items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '28px 28px' }} />
        <div className="relative max-w-md text-white">
          <h2 className="text-3xl font-bold text-balance">Find your next opportunity.</h2>
          <p className="mt-4 text-primary-100 text-indigo-100">
            Join thousands of professionals discovering roles at companies that are hiring right now.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4">
            {[
              ['10K+', 'Active Jobs'],
              ['4K+', 'Companies'],
              ['25K+', 'Job Seekers'],
              ['8K+', 'Successful Hires'],
            ].map(([value, label]) => (
              <div key={label} className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-sm text-indigo-100">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
