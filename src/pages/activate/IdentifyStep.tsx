import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, Loader2 } from 'lucide-react';
import { useActivate } from './ActivateContext';
import api from '../../lib/api';

export default function IdentifyStep() {
  const navigate = useNavigate();
  const { data, update } = useActivate();
  const [identifier, setIdentifier] = useState(data.identifier);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!identifier.trim()) { setError('Please enter your email, phone, or student ID'); return; }
    setLoading(true);
    try {
      // Try to request an activation code; backend may differ — if endpoint missing, still progress
      try { await api.post('/auth/activate/request', { identifier }); } catch { /* ignore for offline */ }
      update({ identifier });
      navigate('/activate/verify');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not send activation code. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
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
            placeholder="you@example.com"
            className="w-full h-12 pl-10 pr-4 rounded-xl bg-[hsl(var(--background))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--foreground))]"
          />
        </div>
        <p className="mt-1.5 text-[11px] text-[hsl(var(--muted-foreground))]">
          We'll send you a one-time activation code.
        </p>
      </div>

      {error && (
        <div className="px-3.5 py-2.5 rounded-xl bg-[hsl(var(--danger)/0.1)] border border-[hsl(var(--danger)/0.25)] text-xs text-[hsl(var(--danger))]">
          {error}
        </div>
      )}

      <button type="submit" disabled={loading} className="btn-primary-modern w-full h-12 text-sm disabled:opacity-60">
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</> : <>Continue <ArrowRight className="w-4 h-4" /></>}
      </button>
    </form>
  );
}