import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Briefcase, Search } from 'lucide-react';
import { Logo } from '../../components/layout/Logo';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { isValidEmail, passwordStrength, errorMessages } from '../../utils/validation';
import { cn } from '../../utils/format';
import { ApiError } from '../../services/apiClient';
import type { Role } from '../../types';

const dashboardPathByRole: Record<Role, string> = {
  JOB_SEEKER: '/seeker/dashboard',
  EMPLOYER: '/employer/dashboard',
  ADMIN: '/admin/dashboard',
};

const strengthColors = ['bg-danger', 'bg-warning', 'bg-secondary', 'bg-success'];

export function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accountType, setAccountType] = useState<'JOB_SEEKER' | 'EMPLOYER'>('JOB_SEEKER');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const strength = passwordStrength(password);

  const validate = () => {
    const next: Record<string, string> = {};
    if (!fullName.trim()) next.fullName = errorMessages.required;
    if (!email) next.email = errorMessages.required;
    else if (!isValidEmail(email)) next.email = errorMessages.invalidEmail;
    if (!password) next.password = errorMessages.required;
    else if (password.length < 8) next.password = errorMessages.passwordLength;
    if (password !== confirmPassword) next.confirmPassword = errorMessages.passwordMismatch;
    if (!agreedToTerms) next.terms = errorMessages.termsRequired;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      const user = await register({ fullName, email, password, role: accountType });
      showToast('Account created successfully. Welcome to HireConnect!', 'success');
      navigate(dashboardPathByRole[user.role], { replace: true });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Something went wrong. Please try again.';
      setErrors({ form: message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-bg dark:bg-bg-dark">
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 py-12">
        <div className="w-full max-w-sm mx-auto">
          <Logo className="mb-8" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create your account</h1>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            Start your journey with HireConnect today.
          </p>

          {errors.form && (
            <div className="mt-5 rounded-lg bg-danger-light text-danger text-sm px-4 py-3">{errors.form}</div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">I am a</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAccountType('JOB_SEEKER')}
                  className={cn(
                    'flex flex-col items-center gap-1.5 rounded-lg border-2 px-4 py-3 text-sm font-medium transition-colors',
                    accountType === 'JOB_SEEKER'
                      ? 'border-primary bg-primary-light text-primary-700'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  )}
                >
                  <Search size={18} />
                  Job Seeker
                </button>
                <button
                  type="button"
                  onClick={() => setAccountType('EMPLOYER')}
                  className={cn(
                    'flex flex-col items-center gap-1.5 rounded-lg border-2 px-4 py-3 text-sm font-medium transition-colors',
                    accountType === 'EMPLOYER'
                      ? 'border-primary bg-primary-light text-primary-700'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  )}
                >
                  <Briefcase size={18} />
                  Employer
                </button>
              </div>
            </div>

            <Input
              label="Full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              icon={<User size={16} />}
              error={errors.fullName}
              placeholder="Jane Doe"
              autoComplete="name"
            />
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail size={16} />}
              error={errors.email}
              placeholder="you@example.com"
              autoComplete="email"
            />
            <div>
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock size={16} />}
                error={errors.password}
                placeholder="At least 8 characters"
                autoComplete="new-password"
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
              {password && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={cn(
                          'h-1.5 flex-1 rounded-full',
                          i <= strength.score ? strengthColors[strength.score] : 'bg-slate-200 dark:bg-slate-700'
                        )}
                      />
                    ))}
                  </div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Password strength: {strength.label}</p>
                </div>
              )}
            </div>
            <Input
              label="Confirm password"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              icon={<Lock size={16} />}
              error={errors.confirmPassword}
              placeholder="Re-enter your password"
              autoComplete="new-password"
            />

            <div>
              <label className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-primary/30"
                />
                <span>
                  I agree to the <span className="text-primary font-medium">Terms of Service</span> and{' '}
                  <span className="text-primary font-medium">Privacy Policy</span>
                </span>
              </label>
              {errors.terms && <p className="mt-1.5 text-xs text-danger">{errors.terms}</p>}
            </div>

            <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
              Create account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 bg-primary-dark relative items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '28px 28px' }} />
        <div className="relative max-w-md text-white">
          <h2 className="text-3xl font-bold text-balance">Build your next great team.</h2>
          <p className="mt-4 text-indigo-100">
            Whether you&apos;re hiring or looking to be hired, HireConnect gets you there faster.
          </p>
        </div>
      </div>
    </div>
  );
}
