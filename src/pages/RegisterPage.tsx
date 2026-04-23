import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { uploadImage } from '../lib/imageUpload';
import CropImageInput from '../components/CropImageInput';
import { Moon, Sun, Loader2, ArrowRight, Check } from 'lucide-react';

const steps = ['Account', 'Profile', 'Confirm'];

export default function RegisterPage() {
  const { register } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarName, setAvatarName] = useState('');
  const [form, setForm] = useState({ email: '', password: '', confirm: '', fullName: '', phone: '', school: '' });

  const update = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const nextStep = (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    if (step === 0) {
      if (form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
      if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    }
    if (step < 2) setStep(s => s + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      await register({
        email: form.email,
        password: form.password,
        fullName: form.fullName,
        phone: form.phone.trim(),
        school: form.school.trim(),
        avatarUrl: avatarUrl || undefined,
      });
      navigate('/dashboard');
    } catch (err: any) { setError(err.response?.data?.message || 'Registration failed.'); setStep(0); }
    finally { setLoading(false); }
  };

  const handleAvatarUpload = async (file?: File) => {
    if (!file) return;
    setError('');
    setUploadingAvatar(true);
    try {
      const url = await uploadImage(file, 'avatars');
      setAvatarUrl(url);
      setAvatarName(file.name);
    } catch (err: any) {
      setError(err.message || 'Avatar upload failed');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const inputCls = "w-full h-12 px-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground)/0.5)] text-sm";

  const Field = ({ label, type = 'text', value, onChange, placeholder, required = false, hint }: any) => (
    <div>
      <label className="block text-xs font-semibold text-[hsl(var(--foreground))] mb-1.5 uppercase tracking-wider">
        {label}{!required && <span className="text-[hsl(var(--muted-foreground))] ml-1.5 normal-case tracking-normal text-[10px] font-normal">optional</span>}
      </label>
      <input type={type} value={value} onChange={(e: any) => onChange(e.target.value)} placeholder={placeholder} required={required} className={inputCls} />
      {hint && <p className="text-[11px] text-[hsl(var(--muted-foreground))] mt-1">{hint}</p>}
    </div>
  );

  return (
    <div className="auth-shell">
      <button
        type="button"
        onClick={toggleTheme}
        className="absolute top-5 right-5 z-20 p-2.5 rounded-xl text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--card))] border border-[hsl(var(--border))] backdrop-blur-md"
      >
        {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
      </button>

      <div className="auth-card animate-fade-in-up" style={{ maxWidth: 520 }}>
        <div className="text-center mb-6">
          <h1 className="text-2xl font-extrabold tracking-tight text-[hsl(var(--foreground))]">Create your account</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1.5">Join Thilina Dhananjaya LMS</p>
        </div>

        {/* Stepper */}
        <div className="flex items-center mb-6">
          {steps.map((s, i) => (
            <div key={s} className="contents">
              <div className={`step-dot ${i === step ? 'step-dot--active' : i < step ? 'step-dot--done' : ''}`}>
                <div className="step-dot__circle">
                  {i < step ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-[11px] font-semibold ${i === step ? 'text-[hsl(var(--primary))]' : 'text-[hsl(var(--muted-foreground))]'}`}>{s}</span>
              </div>
              {i < steps.length - 1 && <div className={`step-line ${i < step ? 'step-line--done' : ''}`} />}
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-4 px-3.5 py-2.5 rounded-xl bg-[hsl(var(--danger)/0.1)] border border-[hsl(var(--danger)/0.25)] text-xs text-[hsl(var(--danger))]">
            {error}
          </div>
        )}

        {step === 0 && (
          <form onSubmit={nextStep} className="space-y-4">
            <Field label="Email address" type="email" value={form.email} onChange={(v: string) => update('email', v)} placeholder="you@example.com" required />
            <Field label="Password" type="password" value={form.password} onChange={(v: string) => update('password', v)} placeholder="Min. 8 characters" required hint="At least 8 characters" />
            <Field label="Confirm password" type="password" value={form.confirm} onChange={(v: string) => update('confirm', v)} placeholder="Re-enter password" required />
            <button type="submit" className="btn-primary-modern w-full h-12 text-sm">
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {step === 1 && (
          <form onSubmit={nextStep} className="space-y-4">
            <Field label="Full name" value={form.fullName} onChange={(v: string) => update('fullName', v)} placeholder="Your full name" required />
            <Field label="Phone number" type="tel" value={form.phone} onChange={(v: string) => update('phone', v)} placeholder="07X XXX XXXX" />
            <Field label="School / Institute" value={form.school} onChange={(v: string) => update('school', v)} placeholder="Your school name" />
            <div>
              <label className="block text-xs font-semibold text-[hsl(var(--foreground))] mb-1.5 uppercase tracking-wider">
                Profile photo <span className="text-[hsl(var(--muted-foreground))] ml-1.5 normal-case tracking-normal text-[10px] font-normal">optional</span>
              </label>
              <div className="flex items-center flex-wrap gap-2">
                <CropImageInput onFile={handleAvatarUpload} aspectRatio={1} loading={uploadingAvatar} label="Upload Avatar" cropTitle="Crop Profile Photo" />
                <span className="text-[11px] text-[hsl(var(--muted-foreground))]">JPEG/PNG/WebP up to 5MB</span>
              </div>
              {avatarName && <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1.5">Selected: {avatarName}</p>}
              {avatarUrl && <img src={avatarUrl} alt="Avatar preview" className="mt-2 w-16 h-16 rounded-full object-cover ring-2 ring-[hsl(var(--primary)/0.3)]" />}
            </div>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setStep(0)} className="flex-1 h-12 rounded-xl border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] text-sm font-semibold hover:bg-[hsl(var(--muted))]">Back</button>
              <button type="submit" className="btn-primary-modern flex-1 h-12 text-sm">
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
            <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.4)] p-4 space-y-2">
              {[['Email', form.email], ['Name', form.fullName], ...(form.phone ? [['Phone', form.phone]] : []), ...(form.school ? [['School', form.school]] : [])].map(([k, v]) => (
                <div key={k} className="flex justify-between items-center text-sm py-1.5 border-b border-[hsl(var(--border))] last:border-0">
                  <span className="text-[hsl(var(--muted-foreground))]">{k}</span>
                  <span className="font-semibold text-[hsl(var(--foreground))]">{v}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(1)} className="flex-1 h-12 rounded-xl border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] text-sm font-semibold hover:bg-[hsl(var(--muted))]">Back</button>
              <button type="submit" disabled={loading || uploadingAvatar} className="btn-primary-modern flex-1 h-12 text-sm disabled:opacity-60">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating…</> : <>Create account <Check className="w-4 h-4" /></>}
              </button>
            </div>
          </form>
        )}

        <p className="mt-6 text-center text-xs text-[hsl(var(--muted-foreground))]">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-[hsl(var(--primary))] hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
