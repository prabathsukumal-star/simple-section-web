import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Check } from 'lucide-react';
import { useActivate } from './ActivateContext';
import { uploadImage } from '../../lib/imageUpload';
import CropImageInput from '../../components/CropImageInput';
import api from '../../lib/api';

export default function ProfileStep() {
  const navigate = useNavigate();
  const { data, update, reset } = useActivate();
  const [fullName, setFullName] = useState(data.fullName);
  const [phone, setPhone] = useState(data.phone);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(data.avatarUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!data.identifier || !data.token) navigate('/activate/identify');
  }, [data.identifier, data.token, navigate]);

  const handleAvatarUpload = async (file?: File) => {
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      const url = await uploadImage(file, 'avatars');
      setAvatarUrl(url);
      update({ avatarUrl: url });
    } catch (err: any) {
      setError(err.message || 'Avatar upload failed');
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!fullName.trim()) { setError('Full name is required'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (password !== confirm) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      await api.post('/auth/activate/complete', {
        identifier: data.identifier,
        token: data.token,
        fullName: fullName.trim(),
        phone: phone.trim(),
        password,
        avatarUrl: avatarUrl || undefined,
      });
      reset();
      navigate('/login?activated=1');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not activate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full h-12 px-4 rounded-xl bg-[hsl(var(--background))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--foreground))]";
  const labelCls = "block text-xs font-semibold text-[hsl(var(--foreground))] mb-1.5 uppercase tracking-wider";

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Avatar */}
      <div>
        <label className={labelCls}>Profile photo <span className="text-[hsl(var(--muted-foreground))] ml-1.5 normal-case tracking-normal text-[10px] font-normal">optional</span></label>
        <div className="flex items-center gap-4">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Preview" className="w-16 h-16 rounded-full object-cover ring-2 ring-[hsl(var(--primary)/0.3)]" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-[hsl(var(--muted))] flex items-center justify-center text-[hsl(var(--muted-foreground))] text-xs">No photo</div>
          )}
          <CropImageInput onFile={handleAvatarUpload} aspectRatio={1} loading={uploading} label="Upload" cropTitle="Crop Profile Photo" />
        </div>
      </div>

      <div>
        <label className={labelCls}>Full name</label>
        <input value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="Your full name" className={inputCls} />
      </div>

      <div>
        <label className={labelCls}>Phone <span className="text-[hsl(var(--muted-foreground))] ml-1.5 normal-case tracking-normal text-[10px] font-normal">optional</span></label>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07X XXX XXXX" className={inputCls} />
      </div>

      <div>
        <label className={labelCls}>New password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Min. 8 characters" className={inputCls} />
      </div>

      <div>
        <label className={labelCls}>Confirm password</label>
        <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required placeholder="Re-enter password" className={inputCls} />
      </div>

      {error && (
        <div className="px-3.5 py-2.5 rounded-xl bg-[hsl(var(--danger)/0.1)] border border-[hsl(var(--danger)/0.25)] text-xs text-[hsl(var(--danger))]">
          {error}
        </div>
      )}

      <button type="submit" disabled={loading || uploading} className="btn-primary-modern w-full h-12 text-sm disabled:opacity-60">
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Activating…</> : <>Complete activation <Check className="w-4 h-4" /></>}
      </button>
    </form>
  );
}