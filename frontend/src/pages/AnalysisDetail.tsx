import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart2, Lightbulb, FileText, Copy, Check } from 'lucide-react';
import api from '../services/api';
import { useLang } from '../store/LangContext';

type Tab = 'overview' | 'tips' | 'docs';

const ScoreCircle: React.FC<{ score: number; label: string }> = ({ score, label }) => {
  const c = score >= 75 ? 'var(--success)' : score >= 50 ? 'var(--warning)' : 'var(--danger)';
  const r = 30, circ = 2 * Math.PI * r;
  return (
    <div style={{ background: 'var(--surface)', borderRadius: 16, padding: '16px 10px', textAlign: 'center', boxShadow: 'var(--card-shadow)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <svg width="76" height="76" viewBox="0 0 76 76">
        <circle cx="38" cy="38" r={r} fill="none" stroke="var(--bg2)" strokeWidth="6" />
        <motion.circle cx="38" cy="38" r={r} fill="none" stroke={c} strokeWidth="6" strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - (score / 100) * circ }}
          transition={{ duration: 1.2, ease: [0.32, 0.72, 0, 1] }}
          style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
        />
        <text x="38" y="38" dominantBaseline="middle" textAnchor="middle" fill={c} style={{ fontSize: 18, fontWeight: 700 }}>{score}</text>
      </svg>
      <span style={{ fontSize: 10, color: 'var(--fg3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', lineHeight: 1.3 }}>{label}</span>
    </div>
  );
};

const CopyBtn: React.FC<{ text: string; label: string; copiedLabel: string }> = ({ text, label, copiedLabel }) => {
  const [copied, setCopied] = useState(false);
  return (
    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.94 }}
      onClick={async () => { await navigator.clipboard.writeText(text).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 2200); }}
      style={{ display: 'flex', alignItems: 'center', gap: 6, background: copied ? 'var(--success-muted)' : 'var(--accent-muted)', color: copied ? 'var(--success)' : 'var(--accent)', border: 'none', borderRadius: 999, padding: '7px 13px', cursor: 'pointer', fontSize: 12, fontWeight: 600, transition: 'background 0.2s, color 0.2s' }}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span key={String(copied)} initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }} transition={{ duration: 0.15 }} style={{ display: 'flex' }}>
          {copied ? <Check size={12} /> : <Copy size={12} />}
        </motion.span>
      </AnimatePresence>
      {copied ? copiedLabel : label}
    </motion.button>
  );
};

const AnalysisDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const { t } = useLang();

  const tabs: { key: Tab; label: string; Icon: React.ElementType }[] = [
    { key: 'overview', label: t('analysis'), Icon: BarChart2 },
    { key: 'tips', label: t('tips'), Icon: Lightbulb },
    { key: 'docs', label: t('docs'), Icon: FileText },
  ];

  const { data: analysis, isLoading, error } = useQuery({
    queryKey: ['analysis', id],
    queryFn: async () => (await api.get(`analysis/${id}/`)).data,
  });

  if (isLoading) return (
    <div style={{ padding: '28px 16px', display: 'flex', flexDirection: 'column', gap: 18 }}>
      {[60, 140, 80].map((h, i) => (
        <motion.div key={i} animate={{ opacity: [0.35, 0.8, 0.35] }} transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.2 }}
          style={{ height: h, borderRadius: 18, background: 'var(--bg2)' }} />
      ))}
    </div>
  );

  if (error || !analysis) return (
    <div style={{ padding: 40, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      <div style={{ width: 64, height: 64, borderRadius: 20, background: 'var(--danger-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <FileText size={28} color="var(--danger)" strokeWidth={1.5} />
      </div>
      <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--fg)' }}>{t('notFound')}</h3>
      <p style={{ fontSize: 14, color: 'var(--fg3)' }}>{t('notFoundDesc')}</p>
    </div>
  );

  return (
    <div>
      {/* ATS HERO */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        style={{ background: 'linear-gradient(140deg, var(--accent) 0%, #5856d6 100%)', padding: '32px 24px 28px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.72)', marginBottom: 14, fontWeight: 500 }}>{t('atsScore')}</p>
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
          style={{ fontSize: 84, fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: -4, marginBottom: 4 }}>
          {analysis.ats_score}
        </motion.div>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)' }}>/ 100</p>
        <div style={{ height: 6, borderRadius: 99, background: 'rgba(255,255,255,0.18)', marginTop: 20, overflow: 'hidden' }}>
          <motion.div initial={{ width: 0 }} animate={{ width: `${analysis.ats_score}%` }} transition={{ duration: 1.1, ease: [0.32, 0.72, 0, 1], delay: 0.2 }}
            style={{ height: '100%', borderRadius: 99, background: '#fff' }} />
        </div>
      </motion.div>

      {/* TABS */}
      <div style={{ padding: '14px 16px 0', position: 'sticky', top: 52, zIndex: 50, background: 'var(--bg)' }}>
        <div style={{ display: 'flex', padding: 4, background: 'rgba(118,118,128,0.12)', borderRadius: 12 }}>
          {tabs.map(({ key, label, Icon }) => {
            const active = key === activeTab;
            return (
              <motion.button key={key} whileTap={{ scale: 0.95 }} onClick={() => setActiveTab(key)}
                style={{
                  flex: 1, padding: '8px 6px', border: 'none', borderRadius: 9,
                  background: active ? 'var(--surface)' : 'transparent',
                  color: active ? 'var(--fg)' : 'var(--fg3)',
                  cursor: 'pointer', fontSize: 12, fontWeight: active ? 600 : 500,
                  boxShadow: active ? 'var(--card-shadow)' : 'none',
                  transition: 'all 0.2s ease',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                }}>
                <Icon size={13} strokeWidth={active ? 2.3 : 1.7} />
                {label}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* TAB CONTENT */}
      <div style={{ padding: '16px 16px 36px' }}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={activeTab} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
            style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* OVERVIEW */}
            {activeTab === 'overview' && <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <ScoreCircle score={analysis.professionalism_score} label={t('professionalism')} />
                <ScoreCircle score={analysis.grammar_score} label={t('grammar')} />
                <ScoreCircle score={analysis.readability_score} label={t('readability')} />
                <ScoreCircle score={analysis.ats_score} label="ATS" />
              </div>

              {analysis.missing_skills?.length > 0 && (
                <div style={{ background: 'var(--surface)', borderRadius: 18, padding: '16px 18px', boxShadow: 'var(--card-shadow)' }}>
                  <p style={{ fontSize: 12, color: 'var(--fg3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>{t('missingSkills')}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {analysis.missing_skills.map((s: string, i: number) => (
                      <motion.span key={i} initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.04 * i }}
                        style={{ padding: '6px 12px', borderRadius: 999, background: 'var(--warning-muted)', color: 'var(--warning)', fontSize: 13, fontWeight: 600 }}>
                        {s}
                      </motion.span>
                    ))}
                  </div>
                </div>
              )}

              {analysis.experience_analysis && (
                <div style={{ background: 'var(--surface)', borderRadius: 18, padding: '16px 18px', boxShadow: 'var(--card-shadow)' }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--fg)', marginBottom: 10 }}>{t('workExp')}</p>
                  <p style={{ fontSize: 14, color: 'var(--fg2)', lineHeight: 1.65 }}>{analysis.experience_analysis}</p>
                </div>
              )}

              {analysis.education_analysis && (
                <div style={{ background: 'var(--surface)', borderRadius: 18, padding: '16px 18px', boxShadow: 'var(--card-shadow)' }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--fg)', marginBottom: 10 }}>{t('education')}</p>
                  <p style={{ fontSize: 14, color: 'var(--fg2)', lineHeight: 1.65 }}>{analysis.education_analysis}</p>
                </div>
              )}

              {analysis.keyword_matching && Object.keys(analysis.keyword_matching).length > 0 && (
                <div style={{ background: 'var(--surface)', borderRadius: 18, padding: '16px 18px', boxShadow: 'var(--card-shadow)' }}>
                  <p style={{ fontSize: 12, color: 'var(--fg3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>{t('keywords')}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {Object.entries(analysis.keyword_matching).map(([k, v]: [string, any]) => {
                      const strong = v === 'Strong' || v === 'Kuchli';
                      return (
                        <span key={k} style={{ padding: '5px 12px', borderRadius: 999, background: strong ? 'var(--success-muted)' : 'var(--accent-muted)', color: strong ? 'var(--success)' : 'var(--accent)', fontSize: 12, fontWeight: 600 }}>
                          {k}: {v}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </>}

            {/* TIPS */}
            {activeTab === 'tips' && <>
              {(analysis.suggested_improvements?.length > 0) ? (
                <div style={{ background: 'var(--surface)', borderRadius: 18, overflow: 'hidden', boxShadow: 'var(--card-shadow)' }}>
                  <div style={{ padding: '14px 18px', borderBottom: '0.5px solid var(--separator)' }}>
                    <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--fg)' }}>{t('improvements')}</p>
                  </div>
                  {analysis.suggested_improvements.map((imp: string, i: number) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.055 }}
                      style={{ display: 'flex', gap: 14, padding: '14px 18px', borderTop: i === 0 ? 'none' : '0.5px solid var(--separator)' }}>
                      <div style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, background: 'var(--accent-muted)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>{i + 1}</div>
                      <p style={{ fontSize: 14, color: 'var(--fg2)', lineHeight: 1.6 }}>{imp}</p>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '48px 24px', background: 'var(--surface)', borderRadius: 18, boxShadow: 'var(--card-shadow)' }}>
                  <p style={{ fontSize: 17, fontWeight: 700, color: 'var(--fg)', marginBottom: 8 }}>{t('perfect')}</p>
                  <p style={{ fontSize: 14, color: 'var(--fg3)' }}>{t('noImprovements')}</p>
                </div>
              )}

              {analysis.interview_tips?.length > 0 && (
                <div style={{ background: 'var(--surface)', borderRadius: 18, overflow: 'hidden', boxShadow: 'var(--card-shadow)' }}>
                  <div style={{ padding: '14px 18px', borderBottom: '0.5px solid var(--separator)' }}>
                    <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--fg)' }}>{t('interviewTips')}</p>
                  </div>
                  {analysis.interview_tips.map((tip: string, i: number) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.055 }}
                      style={{ padding: '14px 18px', borderTop: i === 0 ? 'none' : '0.5px solid var(--separator)' }}>
                      <p style={{ fontSize: 14, color: 'var(--fg2)', lineHeight: 1.6 }}>{tip}</p>
                    </motion.div>
                  ))}
                </div>
              )}
            </>}

            {/* DOCS */}
            {activeTab === 'docs' && <>
              {[
                { key: 'improved_resume_text', label: t('improvedResume') },
                { key: 'cover_letter', label: t('coverLetter') },
                { key: 'linkedin_summary', label: t('linkedinSummary') },
              ].map(({ key, label }) => analysis[key] && (
                <motion.div key={key} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  style={{ background: 'var(--surface)', borderRadius: 18, overflow: 'hidden', boxShadow: 'var(--card-shadow)' }}>
                  <div style={{ padding: '14px 18px', borderBottom: '0.5px solid var(--separator)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--fg)' }}>{label}</p>
                    <CopyBtn text={analysis[key]} label={t('copy')} copiedLabel={t('copied')} />
                  </div>
                  <div style={{ padding: '14px 18px', maxHeight: 260, overflowY: 'auto', background: 'rgba(0,0,0,0.015)' }}>
                    <p style={{ fontSize: 13, color: 'var(--fg2)', lineHeight: 1.68, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'inherit' }}>
                      {analysis[key]}
                    </p>
                  </div>
                </motion.div>
              ))}
            </>}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AnalysisDetail;
