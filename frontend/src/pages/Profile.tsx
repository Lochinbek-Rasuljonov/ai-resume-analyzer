import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Zap, Award, Sun, Moon } from 'lucide-react';
import { useAuth } from '../store/hooks';
import { useLang } from '../store/hooks';
import { useTheme } from '../store/hooks';
import { langLabels, type Lang } from '../i18n';
import { tg } from '../telegram';

const LANGS: Lang[] = ['uz', 'kk', 'ru', 'en'];

const openLink = (url: string) => {
  if (tg?.openLink) tg.openLink(url);
  else window.open(url, '_blank', 'noopener');
};

const ListRow: React.FC<{ label: string; sub: string; href: string; accentColor: string; delay?: number }> = ({ label, sub, href, accentColor, delay = 0 }) => {
  const [pressed, setPressed] = React.useState(false);
  return (
    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay }}
      onClick={() => openLink(href)}
      onPointerDown={() => setPressed(true)} onPointerUp={() => setPressed(false)} onPointerLeave={() => setPressed(false)}
      style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', cursor: 'pointer', background: pressed ? 'rgba(0,0,0,0.03)' : 'transparent', transition: 'background 0.12s ease' }}>
      <div style={{ width: 10, height: 10, borderRadius: '50%', flexShrink: 0, background: accentColor, boxShadow: `0 0 8px ${accentColor}` }} />
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--fg)', marginBottom: 2 }}>{label}</p>
        <p style={{ fontSize: 12, color: 'var(--fg3)' }}>{sub}</p>
      </div>
      <ExternalLink size={14} color="var(--fg3)" />
    </motion.div>
  );
};

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { t, lang, setLang } = useLang();
  const { isDark, toggleTheme } = useTheme();

  const techs = ['React', 'TypeScript', 'Django', 'Gemini AI', 'Celery', 'PostgreSQL', 'Docker', 'Nginx'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* DARK HERO */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
        style={{ background: 'linear-gradient(160deg, #0a0a0f 0%, #12122a 50%, #0f0f1e 100%)', padding: '40px 24px 36px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)', width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,122,255,0.20) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -20, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle, rgba(88,86,214,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22, delay: 0.1 }}
          style={{ position: 'relative', display: 'inline-block', marginBottom: 16 }}>
          {user?.photo_url ? (
            <img src={user.photo_url} alt="avatar" style={{ width: 90, height: 90, borderRadius: '50%', objectFit: 'cover', border: '2.5px solid rgba(255,255,255,0.14)', boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)' }} />
          ) : (
            <div style={{ width: 90, height: 90, borderRadius: '50%', background: 'linear-gradient(145deg, #007aff, #5856d6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, fontWeight: 800, color: '#fff', border: '2.5px solid rgba(255,255,255,0.14)', boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}>
              {user?.first_name?.charAt(0) || 'U'}
            </div>
          )}
          <div style={{ position: 'absolute', bottom: 0, right: 0, width: 22, height: 22, borderRadius: '50%', background: 'var(--success)', border: '2px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />
          </div>
        </motion.div>

        <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
          style={{ fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 4, letterSpacing: -0.4 }}>
          {user?.first_name} {user?.last_name}
        </motion.h2>
        {user?.username && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.22 }}
            style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', marginBottom: 22 }}>
            @{user.username}
          </motion.p>
        )}

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26 }}
          style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ background: 'rgba(255,255,255,0.09)', backdropFilter: 'blur(12px)', borderRadius: 999, padding: '7px 16px', display: 'flex', alignItems: 'center', gap: 6, border: '1px solid rgba(255,255,255,0.10)' }}>
            <Zap size={13} color="#ffd60a" fill="#ffd60a" />
            <span style={{ fontSize: 13, color: '#fff', fontWeight: 600 }}>{user?.credits} {t('credits')}</span>
          </div>
          {user?.is_premium && (
            <div style={{ background: 'rgba(255,255,255,0.09)', backdropFilter: 'blur(12px)', borderRadius: 999, padding: '7px 16px', border: '1px solid rgba(255,255,255,0.10)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Award size={13} color="#ffd60a" />
              <span style={{ fontSize: 13, color: '#fff', fontWeight: 600 }}>{t('premium')}</span>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* SETTINGS / CONTENT */}
      <div style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* APPEARANCE */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <p style={{ fontSize: 12, color: 'var(--fg3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 10, paddingLeft: 4 }}>
            {t('appearance')}
          </p>
          <div style={{ background: 'var(--surface)', borderRadius: 20, overflow: 'hidden', boxShadow: 'var(--card-shadow)' }}>
            {/* DARK/LIGHT TOGGLE */}
            <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '0.5px solid var(--separator)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: isDark ? 'rgba(255,159,10,0.12)' : 'rgba(255,204,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {isDark ? <Sun size={17} color="#ff9f0a" /> : <Moon size={17} color="#5856d6" />}
                </div>
                <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--fg)' }}>{isDark ? t('lightMode') : t('darkMode')}</span>
              </div>
              <motion.button whileTap={{ scale: 0.9 }} onClick={toggleTheme}
                style={{
                  width: 50, height: 30, borderRadius: 999, border: 'none', cursor: 'pointer', position: 'relative',
                  background: isDark ? 'var(--accent)' : 'rgba(120,120,128,0.22)',
                  transition: 'background 0.3s ease',
                }}>
                <motion.div animate={{ x: isDark ? 22 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                  style={{ position: 'absolute', top: 3, width: 24, height: 24, borderRadius: '50%', background: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }} />
              </motion.button>
            </div>

            {/* LANGUAGE SELECTOR */}
            <div style={{ padding: '14px 18px' }}>
              <p style={{ fontSize: 13, color: 'var(--fg3)', marginBottom: 12 }}>{t('language')}</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {LANGS.map((l) => (
                  <motion.button key={l} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    onClick={() => setLang(l)}
                    style={{
                      padding: '10px 14px', borderRadius: 12, border: `1.5px solid ${l === lang ? 'var(--accent)' : 'var(--border)'}`,
                      background: l === lang ? 'var(--accent-muted)' : 'transparent',
                      color: l === lang ? 'var(--accent)' : 'var(--fg)',
                      fontSize: 14, fontWeight: l === lang ? 700 : 500, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      transition: 'all 0.2s ease',
                    }}>
                    {langLabels[l]}
                    {l === lang && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }} />}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ABOUT APP */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
          <p style={{ fontSize: 12, color: 'var(--fg3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 10, paddingLeft: 4 }}>{t('aboutDev')}</p>
          <div style={{ background: 'var(--surface)', borderRadius: 20, overflow: 'hidden', boxShadow: 'var(--card-shadow)' }}>
            <div style={{ padding: '20px', display: 'flex', gap: 16, alignItems: 'center', borderBottom: '0.5px solid var(--separator)' }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, flexShrink: 0, background: 'linear-gradient(145deg, #007aff, #5856d6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(0,122,255,0.32)' }}>
                <span style={{ color: '#fff', fontSize: 22, fontWeight: 900 }}>{t('aiLogoText')}</span>
              </div>
              <div>
                <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--fg)', marginBottom: 3 }}>{t('appName')}</p>
                <p style={{ fontSize: 12, color: 'var(--fg3)' }}>Telegram Mini App · v1.0.0</p>
              </div>
            </div>
            <div style={{ padding: '14px 18px', borderBottom: '0.5px solid var(--separator)' }}>
              <p style={{ fontSize: 14, color: 'var(--fg2)', lineHeight: 1.65 }}>{t('appDesc')}</p>
            </div>
            <div style={{ padding: '12px 18px', display: 'flex', flexWrap: 'wrap', gap: 7 }}>
              {techs.map((tech) => (
                <span key={tech} style={{ padding: '5px 11px', borderRadius: 999, background: 'var(--accent-muted)', color: 'var(--accent)', fontSize: 12, fontWeight: 600 }}>{tech}</span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* LINKS */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
          <p style={{ fontSize: 12, color: 'var(--fg3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 10, paddingLeft: 4 }}>{t('contact')}</p>
          <div style={{ background: 'var(--surface)', borderRadius: 20, overflow: 'hidden', boxShadow: 'var(--card-shadow)' }}>
            <ListRow label={t('tgChannel')} sub="@ResumeAnalyzerUZ" href="https://t.me/ResumeAnalyzerUZ" accentColor="var(--accent)" delay={0.26} />
            <div style={{ height: 0.5, background: 'var(--separator)', margin: '0 18px' }} />
            <ListRow label={t('github')} sub="github.com" href="https://github.com" accentColor="var(--fg3)" delay={0.30} />
            <div style={{ height: 0.5, background: 'var(--separator)', margin: '0 18px' }} />
            <ListRow label={t('portfolio')} sub="Dasturchi sahifasi" href="https://t.me/ResumeAnalyzerUZ" accentColor="var(--success)" delay={0.34} />
          </div>
        </motion.div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          style={{ fontSize: 12, color: 'var(--fg3)', textAlign: 'center' }}>
          {t('appName')} · {t('version')} 1.0.0 · © 2024 · {t('rights')}
        </motion.p>
      </div>
    </div>
  );
};

export default Profile;
