import { type FormEvent, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Eye, EyeOff, Moon, Sun, Loader2, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';
import thilinaLogo from '../assets/logo.png';

export default function LoginPage() {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const u = await login(identifier, password);
      const redirect = searchParams.get('redirect');
      if (u?.role === 'ADMIN') {
        const target = redirect && redirect.startsWith('/')
          ? `/admin/select-institute?redirect=${encodeURIComponent(redirect)}`
          : '/admin/select-institute';
        navigate(target);
      } else if (redirect && redirect.startsWith('/')) {
        navigate(redirect);
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <button
        type="button"
        onClick={toggleTheme}
        className="absolute top-5 right-5 z-20 p-2.5 rounded-xl text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--card))] border border-[hsl(var(--border))] backdrop-blur-md"
        title="Toggle theme"
      >
        {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
      </button>

      <div className="auth-card animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--primary-glow))] shadow-[0_10px_40px_-10px_hsl(var(--primary)/0.6)] mb-4">
            <img src={thilinaLogo} alt="Logo" className="w-10 h-10 object-contain" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[hsl(var(--foreground))]">Welcome back</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1.5">
            Sign in to continue to Thilina Dhananjaya
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[hsl(var(--foreground))] mb-1.5 uppercase tracking-wider">
              Email, Phone or Student ID
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))]" />
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                autoComplete="username"
                placeholder="you@example.com"
                className="w-full h-12 pl-10 pr-4 rounded-xl bg-[hsl(var(--background))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground)/0.6)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[hsl(var(--foreground))] mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))]" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full h-12 pl-10 pr-12 rounded-xl bg-[hsl(var(--background))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground)/0.6)]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] rounded-md"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="px-3.5 py-2.5 rounded-xl bg-[hsl(var(--danger)/0.1)] border border-[hsl(var(--danger)/0.25)] text-xs text-[hsl(var(--danger))] animate-fade-in">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary-modern w-full h-12 text-sm disabled:opacity-60"
          >
            {isLoading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</>
            ) : (
              <>Sign in <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[hsl(var(--border))]" />
          </div>
          <div className="relative flex justify-center">
            <span className="px-3 text-[10px] uppercase tracking-widest font-bold text-[hsl(var(--muted-foreground))] bg-[hsl(var(--card))]">Or</span>
          </div>
        </div>

        <Link
          to="/activate/identify"
          className="flex items-center justify-center gap-2 w-full h-12 rounded-xl border border-[hsl(var(--primary)/0.3)] bg-[hsl(var(--primary)/0.05)] text-sm font-semibold text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.1)]"
        >
          <Sparkles className="w-4 h-4" />
          Activate your account
        </Link>

        <p className="mt-6 text-center text-xs text-[hsl(var(--muted-foreground))]">
          New here?{' '}
          <Link to="/register" className="font-semibold text-[hsl(var(--primary))] hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}