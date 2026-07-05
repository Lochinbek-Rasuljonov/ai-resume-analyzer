import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload as UploadIcon, X, FileText, Sparkles } from 'lucide-react';
import api from '../services/api';
import { useLang } from '../store/LangContext';

const tg = (window as any).Telegram?.WebApp;

const Upload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t, lang } = useLang();

  const validate = (f: File): string | null => {
    const valid = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!valid.includes(f.type)) return t('errOnlyPdf');
    if (f.size > 10 * 1024 * 1024) return t('errSize');
    return null;
  };

  const pick = (f: File) => {
    const err = validate(f);
    if (err) { setError(err); return; }
    setError(null); setFile(f);
    if (tg?.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
  };

  const handleUpload = async () => {
    if (!file || isUploading) return;
    setIsUploading(true); setProgress(0); setError(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('language', lang);
      await api.post('resumes/', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => setProgress(Math.round((e.loaded * 100) / (e.total || 1))),
      });
      if (tg?.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      navigate('/');
    } catch (e: any) {
      if (tg?.HapticFeedback) tg.HapticFeedback.notificationOccurred('error');
      setError(e.response?.data?.error || t('errUpload'));
      setIsUploading(false);
    }
  };

  const fmt = (b: number) => b > 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${(b / 1024).toFixed(0)} KB`;

  const features = [t('feat1'), t('feat2'), t('feat3'), t('feat4'), t('feat5')];

  return (
    <div style={{ padding: '28px 16px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: 'var(--fg)', marginBottom: 6, letterSpacing: -0.5 }}>{t('uploadTitle')}</h2>
        <p style={{ fontSize: 15, color: 'var(--fg3)' }}>{t('uploadDesc')}</p>
      </motion.div>

      {/* DROP ZONE */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={isDragging ? { opacity: 1, scale: 1.025 } : { opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) pick(f); }}
        whileTap={!isUploading ? { scale: 0.98 } : {}}
        style={{
          border: `2px dashed ${file || isDragging ? 'var(--accent)' : 'var(--border)'}`,
          borderRadius: 22, padding: '44px 24px',
          textAlign: 'center', cursor: isUploading ? 'default' : 'pointer',
          background: file ? 'var(--accent-muted)' : isDragging ? 'rgba(0,122,255,0.04)' : 'var(--surface)',
          transition: 'background 0.2s ease, border-color 0.2s ease',
          boxShadow: 'var(--card-shadow)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
        }}
      >
        <input ref={fileInputRef} type="file" accept=".pdf,.docx" onChange={(e) => e.target.files?.[0] && pick(e.target.files[0])} style={{ display: 'none' }} />

        <AnimatePresence mode="wait">
          {file ? (
            <motion.div key="file" initial={{ opacity: 0, scale: 0.82 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.82 }}
              transition={{ type: 'spring', stiffness: 400, damping: 26 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
              <motion.div initial={{ rotate: -8 }} animate={{ rotate: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                style={{ width: 72, height: 72, borderRadius: 20, background: 'linear-gradient(145deg, var(--accent), #5856d6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 28px rgba(0,122,255,0.32)' }}>
                <FileText size={32} color="#fff" strokeWidth={1.5} />
              </motion.div>
              <div>
                <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--fg)', marginBottom: 4 }}>{file.name}</p>
                <p style={{ fontSize: 13, color: 'var(--fg3)' }}>{fmt(file.size)} · {file.type === 'application/pdf' ? 'PDF' : 'DOCX'}</p>
              </div>
              {!isUploading && (
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={(e) => { e.stopPropagation(); setFile(null); setError(null); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--danger-muted)', color: 'var(--danger)', border: 'none', borderRadius: 999, padding: '7px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                  <X size={13} /> {t('cancel')}
                </motion.button>
              )}
            </motion.div>
          ) : (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <motion.div animate={{ y: [0, -7, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                style={{ width: 72, height: 72, borderRadius: 20, background: 'var(--accent-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <UploadIcon size={30} color="var(--accent)" strokeWidth={1.5} />
              </motion.div>
              <div>
                <p style={{ fontSize: 17, fontWeight: 700, color: 'var(--accent)', marginBottom: 4 }}>{t('selectFile')}</p>
                <p style={{ fontSize: 13, color: 'var(--fg3)' }}>{t('dragHere')}</p>
              </div>
              <div style={{ padding: '6px 14px', borderRadius: 999, background: 'rgba(142,142,147,0.10)' }}>
                <span style={{ fontSize: 12, color: 'var(--fg3)' }}>{t('fileLimit')}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* PROGRESS */}
      <AnimatePresence>
        {isUploading && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            style={{ background: 'var(--surface)', borderRadius: 16, padding: '18px 20px', boxShadow: 'var(--card-shadow)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--fg)' }}>{t('uploading')}</span>
              <span style={{ fontSize: 15, color: 'var(--accent)', fontWeight: 700 }}>{progress}%</span>
            </div>
            <div style={{ height: 6, borderRadius: 99, background: 'var(--bg2)', overflow: 'hidden' }}>
              <motion.div animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }}
                style={{ height: '100%', borderRadius: 99, background: 'linear-gradient(90deg, var(--accent), #5856d6)' }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ERROR */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            style={{ background: 'var(--danger-muted)', border: '1px solid rgba(255,59,48,0.18)', borderRadius: 12, padding: '14px 16px' }}>
            <p style={{ fontSize: 14, color: 'var(--danger)' }}>{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FEATURES */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14, duration: 0.32 }}
        style={{ background: 'var(--surface)', borderRadius: 20, padding: '18px 20px', boxShadow: 'var(--card-shadow)' }}>
        <p style={{ fontSize: 13, color: 'var(--fg3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>{t('aiAnalyzes')}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {features.map((text, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.18 + i * 0.05 }}
              style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, background: 'var(--accent-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
                <Sparkles size={13} color="var(--accent)" />
              </div>
              <span style={{ fontSize: 14, color: 'var(--fg2)', lineHeight: 1.5 }}>{text}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* UPLOAD BUTTON */}
      <AnimatePresence>
        {file && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}>
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: '0 8px 32px rgba(0,122,255,0.36)' }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 22 }}
              onClick={handleUpload} disabled={isUploading}
              style={{
                width: '100%', border: 'none', borderRadius: 16, padding: '16px 24px',
                cursor: isUploading ? 'default' : 'pointer',
                background: 'linear-gradient(135deg, var(--accent), #5856d6)',
                color: '#fff', fontSize: 17, fontWeight: 600, letterSpacing: -0.1,
                boxShadow: '0 4px 20px rgba(0,122,255,0.28)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                opacity: isUploading ? 0.75 : 1,
              }}
            >
              {isUploading ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
                    style={{ width: 18, height: 18, border: '2.5px solid rgba(255,255,255,0.35)', borderTopColor: '#fff', borderRadius: '50%' }} />
                  {t('uploading')}
                </>
              ) : (
                <><Sparkles size={18} /> {t('startAnalysis')}</>
              )}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Upload;
