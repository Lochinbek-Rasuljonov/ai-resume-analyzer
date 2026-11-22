import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import { Plus, ChevronRight, Clock, CheckCircle2, AlertCircle, Loader2, Zap, FileText } from 'lucide-react';
import { useAuth } from '../store/hooks';
import { useLang } from '../store/hooks';
import api from '../services/api';
import { tg } from '../telegram';


const stagger: { container: Variants; item: Variants } = {
  container: { hidden: {}, show: { transition: { staggerChildren: 0.07 } } },
  item: {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 380, damping: 28 } },
  },
};

const ScoreBar: React.FC<{ score: number }> = ({ score }) => {
  const c = score >= 75 ? 'var(--success)' : score >= 50 ? 'var(--warning)' : 'var(--danger)';
  return (
    <div style={{ height: 3, borderRadius: 99, background: 'var(--bg2)', overflow: 'hidden', marginTop: 4 }}>
      <motion.div
        initial={{ width: 0 }} animate={{ width: `${score}%` }}
        transition={{ duration: 0.9, ease: [0.32, 0.72, 0, 1] }}
        style={{ height: '100%', borderRadius: 99, background: c }}
      />
    </div>
  );
};

interface ResumeItem {
  id: number;
  original_filename: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  uploaded_at: string;
  analysis: { ats_score: number } | null;
}

const isRunning = (r: ResumeItem) => r.status === 'PROCESSING' || r.status === 'PENDING';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useLang();

  const { data: resumes = [], isLoading } = useQuery({
    queryKey: ['resumes'],
    queryFn: async () => (await api.get<ResumeItem[]>('resumes/')).data,
    refetchInterval: (q) => (q.state.data?.some(isRunning) ? 3000 : false),
  });

  const completed = resumes.filter((r) => r.status === 'COMPLETED').length;
  const pending = resumes.filter(isRunning).length;

  const statusMap: Record<string, { label: string; Icon: React.ElementType; color: string; bg: string }> = {
    COMPLETED: { label: t('statusCompleted'), Icon: CheckCircle2, color: 'var(--success)', bg: 'var(--success-muted)' },
    PROCESSING: { label: t('statusProcessing'), Icon: Loader2, color: 'var(--accent)', bg: 'var(--accent-muted)' },
    PENDING: { label: t('statusPending'), Icon: Clock, color: 'var(--fg3)', bg: 'rgba(142,142,147,0.10)' },
    FAILED: { label: t('statusFailed'), Icon: AlertCircle, color: 'var(--danger)', bg: 'var(--danger-muted)' },
  };

  return (
    <div style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 26 }}>

      {/* HERO */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
        style={{
          background: 'linear-gradient(140deg, var(--accent) 0%, #5856d6 100%)',
          borderRadius: 22, padding: '28px 24px', position: 'relative', overflow: 'hidden',
          boxShadow: '0 8px 40px rgba(0,122,255,0.26)',
        }}
      >
        <div style={{ position: 'absolute', top: -50, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -40, left: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative' }}>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.72)', marginBottom: 4, fontWeight: 500 }}>{t('welcome')}</p>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 18, letterSpacing: -0.5 }}>
            {user?.first_name} {user?.last_name}
          </h1>
          <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
            <div style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(10px)', borderRadius: 999, padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Zap size={13} color="#fff" fill="#fff" />
              <span style={{ fontSize: 13, color: '#fff', fontWeight: 600 }}>{user?.credits} {t('credits')}</span>
            </div>
            {user?.is_premium && (
              <div style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(10px)', borderRadius: 999, padding: '6px 14px' }}>
                <span style={{ fontSize: 13, color: '#fff', fontWeight: 600 }}>{t('premium')}</span>
              </div>
            )}
          </div>
          <motion.button
            whileHover={{ scale: 1.03, boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 22 }}
            onClick={() => { if (tg?.HapticFeedback) tg.HapticFeedback.impactOccurred('medium'); navigate('/upload'); }}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              background: '#fff', borderRadius: 14, border: 'none',
              padding: '14px 20px', width: '100%', cursor: 'pointer',
              color: 'var(--accent)', fontSize: 17, fontWeight: 600, letterSpacing: -0.1,
              boxShadow: '0 2px 12px rgba(0,0,0,0.14)',
            }}
          >
            <Plus size={19} strokeWidth={2.6} />
            {t('startNew')}
          </motion.button>
        </div>
      </motion.div>

      {/* STATS */}
      {resumes.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, duration: 0.3 }}
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          {[{ label: t('total'), value: resumes.length }, { label: t('done'), value: completed }, { label: t('inProgress'), value: pending }].map((s) => (
            <div key={s.label} style={{ background: 'var(--surface)', borderRadius: 16, padding: '16px 10px', textAlign: 'center', boxShadow: 'var(--card-shadow)' }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--accent)', letterSpacing: -1 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'var(--fg3)', marginTop: 3, fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </motion.div>
      )}

      {/* LIST */}
      <div>
        <p style={{ fontSize: 13, color: 'var(--fg3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, paddingLeft: 4 }}>
          {t('resumeListTitle')}
        </p>

        {isLoading ? (
          <div style={{ background: 'var(--surface)', borderRadius: 20, overflow: 'hidden', boxShadow: 'var(--card-shadow)' }}>
            {[0, 1, 2].map((i) => (
              <motion.div key={i} animate={{ opacity: [0.35, 0.85, 0.35] }} transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.18 }}
                style={{ display: 'flex', gap: 14, padding: '16px 20px', borderTop: i === 0 ? 'none' : '0.5px solid var(--separator)' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--bg2)', flexShrink: 0 }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ height: 14, borderRadius: 6, background: 'var(--bg2)', width: '65%' }} />
                  <div style={{ height: 11, borderRadius: 5, background: 'var(--bg2)', width: '40%' }} />
                </div>
              </motion.div>
            ))}
          </div>
        ) : resumes.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
            style={{ background: 'var(--surface)', borderRadius: 20, padding: '48px 24px', textAlign: 'center', boxShadow: 'var(--card-shadow)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: 'var(--accent-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={28} color="var(--accent)" strokeWidth={1.5} />
            </div>
            <div>
              <p style={{ fontSize: 17, fontWeight: 700, color: 'var(--fg)', marginBottom: 6 }}>{t('noResumes')}</p>
              <p style={{ fontSize: 14, color: 'var(--fg3)', lineHeight: 1.55, maxWidth: 220, margin: '0 auto' }}>{t('noResumesDesc')}</p>
            </div>
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={() => navigate('/upload')}
              style={{ marginTop: 4, padding: '12px 24px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,122,255,0.30)' }}>
              {t('uploadFirst')}
            </motion.button>
          </motion.div>
        ) : (
          <motion.div variants={stagger.container} initial="hidden" animate="show"
            style={{ background: 'var(--surface)', borderRadius: 20, overflow: 'hidden', boxShadow: 'var(--card-shadow)' }}>
            {resumes.map((resume, i) => {
              const sc = statusMap[resume.status] || statusMap.PENDING;
              const StatusIcon = sc.Icon;
              const clickable = resume.status === 'COMPLETED';
              return (
                <motion.div key={resume.id} variants={stagger.item}
                  whileHover={clickable ? { backgroundColor: 'rgba(0,0,0,0.025)', x: 1 } : {}}
                  whileTap={clickable ? { scale: 0.985 } : {}}
                  onClick={() => { if (!clickable) return; if (tg?.HapticFeedback) tg.HapticFeedback.impactOccurred('light'); navigate(`/analysis/${resume.id}`); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: '15px 20px',
                    borderTop: i === 0 ? 'none' : '0.5px solid var(--separator)',
                    cursor: clickable ? 'pointer' : 'default',
                    opacity: resume.status === 'FAILED' ? 0.5 : 1,
                  }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: clickable ? 'var(--accent-muted)' : 'rgba(142,142,147,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText size={20} color={clickable ? 'var(--accent)' : 'var(--fg3)'} strokeWidth={1.5} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--fg)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 3 }}>
                      {resume.original_filename || 'Rezyume'}
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--fg3)' }}>
                      {new Date(resume.uploaded_at).toLocaleDateString('uz-UZ', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                    {clickable && resume.analysis?.ats_score != null && <ScoreBar score={resume.analysis.ats_score} />}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5, flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 999, background: sc.bg }}>
                      <StatusIcon size={11} color={sc.color} strokeWidth={2.2}
                        style={resume.status === 'PROCESSING' ? { animation: 'spin 1s linear infinite' } : undefined} />
                      <span style={{ fontSize: 11, color: sc.color, fontWeight: 600 }}>{sc.label}</span>
                    </div>
                    {clickable && <ChevronRight size={14} color="var(--fg3)" />}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
};

export default Dashboard;
