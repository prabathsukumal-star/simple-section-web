import { Link, Outlet, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { Moon, Sun, Check, ArrowLeft } from 'lucide-react';
import thilinaLogo from '../../assets/logo.png';

const STEPS = [
  { path: '/activate/identify', label: 'Identify' },
  { path: '/activate/verify',   label: 'Verify' },
  { path: '/activate/profile',  label: 'Profile' },
];

export default function ActivateLayout() {
  const { theme, toggleTheme } = useTheme();
  const { pathname } = useLocation();
  const currentIdx = STEPS.findIndex(s => pathname.startsWith(s.path));

  return (
    <div className="auth-shell">
      <button
        type="button"
        onClick={toggleTheme}
        className="absolute top-5 right-5 z-20 p-2.5 rounded-xl text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--card))] border border-[hsl(var(--border))] backdrop-blur-md"
      >
        {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
      </button>

      <Link
        to="/login"
        className="absolute top-5 left-5 z-20 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--card))] border border-[hsl(var(--border))] backdrop-blur-md"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to login
      </Link>

      <div className="auth-card animate-fade-in-up" style={{ maxWidth: 520 }}>
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--primary-glow))] shadow-[0_10px_40px_-10px_hsl(var(--primary)/0.6)] mb-3">
            <img src={thilinaLogo} alt="Logo" className="w-9 h-9 object-contain" />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[hsl(var(--foreground))]">Activate Your Account</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Complete your profile to get started</p>
        </div>

        {/* Stepper */}
        <div className="flex items-center mb-6">
          {STEPS.map((s, i) => {
            const done = i < currentIdx;
            const active = i === currentIdx;
            return (
              <div key={s.path} className="contents">
                <div className={`step-dot ${active ? 'step-dot--active' : done ? 'step-dot--done' : ''}`}>
                  <div className="step-dot__circle">{done ? <Check className="w-4 h-4" /> : i + 1}</div>
                  <span className={`text-[11px] font-semibold ${active ? 'text-[hsl(var(--primary))]' : 'text-[hsl(var(--muted-foreground))]'}`}>{s.label}</span>
                </div>
                {i < STEPS.length - 1 && <div className={`step-line ${done ? 'step-line--done' : ''}`} />}
              </div>
            );
          })}
        </div>

        <Outlet />
      </div>
    </div>
  );
}