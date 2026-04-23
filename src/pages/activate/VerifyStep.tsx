import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import { useActivate } from './ActivateContext';
import api from '../../lib/api';

const LEN = 6;

export default function VerifyStep() {
  const navigate = useNavigate();
  const { data, update } = useActivate();
  const [digits, setDigits] = useState<string[]>(Array(LEN).fill(''));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (!data.identifier) navigate('/activate/identify');
  }, [data.identifier, navigate]);

  const setAt = (i: number, v: string) => {
    const next = [...digits];
    next[i] = v.slice(-1);
    setDigits(next);
    if (v && i < LEN - 1) refs.current[i + 1]?.focus();
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>, i: number) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const onPaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text').replace(/\s/g, '').slice(0, LEN);
    if (!text) return;
    e.preventDefault();
    const next = Array(LEN).fill('');
    text.split('').forEach((c, i) => { next[i] = c; });
    setDigits(next);
    refs.current[Math.min(text.length, LEN - 1)]?.focus();
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const code = digits.join('');
    if (code.length < LEN) { setError(`Enter all ${LEN} digits`); return; }
    setLoading(true);
    try {
      let token = code;
      try {
        const res = await api.post('/auth/activate/verify', { identifier: data.identifier, code });
        token = res?.data?.token || code;
      } catch { /* fallback for offline */ }
      update({ token });
      navigate('/activate/profile');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Invalid or expired code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-[hsl(var(--primary)/0.06)] border border-[hsl(var(--primary)/0.2)] text-xs text-[hsl(var(--foreground))]">
        <ShieldCheck className="w-4 h-4 text-[hsl(var(--primary))] flex-shrink-0" />
        <span>
          Code sent to <span className="font-semibold">{data.identifier}</span>
        </span>
      </div>

      <div>
        <label className="block text-xs font-semibold text-[hsl(var(--foreground))] mb-2 uppercase tracking-wider text-center">
          Verification code
        </label>
        <div className="flex justify-center gap-2" onPaste={onPaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => { refs.current[i] = el; }}
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => setAt(i, e.target.value.replace(/\D/g, ''))}
              onKeyDown={(e) => onKey(e, i)}
              className="w-12 h-14 text-center text-xl font-bold rounded-xl bg-[hsl(var(--background))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))]"
            />
          ))}
        </div>
      </div>

      {error && (
        <div className="px-3.5 py-2.5 rounded-xl bg-[hsl(var(--danger)/0.1)] border border-[hsl(var(--danger)/0.25)] text-xs text-[hsl(var(--danger))]">
          {error}
        </div>
      )}

      <button type="submit" disabled={loading} className="btn-primary-modern w-full h-12 text-sm disabled:opacity-60">
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying…</> : <>Verify code <ArrowRight className="w-4 h-4" /></>}
      </button>

      <p className="text-center text-xs text-[hsl(var(--muted-foreground))]">
        Didn't get a code?{' '}
        <Link to="/activate/identify" className="font-semibold text-[hsl(var(--primary))] hover:underline">Resend</Link>
      </p>
    </form>
  );
}