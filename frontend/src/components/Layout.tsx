import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, FileText, User, Sun, Moon, Globe } from 'lucide-react';
import { useLang } from '../store/hooks';
import { useTheme } from '../store/hooks';
import { langLabels, type Lang } from '../i18n';
import { Logo } from './Logo';
import { tg } from '../telegram';

const LANGS: Lang[] = ['uz', 'kk', 'ru', 'en'];

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, lang, setLang } = useLang();
  const { isDark, toggleTheme } = useTheme();
  const [showLangMenu, setShowLangMenu] = useState(false);

  const navItems = [
    { path: '/', label: t('navHome'), Icon: Home },
    { path: '/upload', label: t('navAnalyze'), Icon: FileText },
    { path: '/profile', label: t('navProfile'), Icon: User },
  ];

  const activeIdx = navItems.findIndex(n =>
    n.path === '/' ? location.pathname === '/' : location.pathname.startsWith(n.path)
  );

  useEffect(() => {
    if (!tg) return;
    tg.ready(); tg.expand();
  }, []);

  useEffect(() => {
    if (!tg) return;
    if (location.pathname !== '/') { tg.BackButton.show(); tg.BackButton.onClick(() => navigate(-1)); }
    else { tg.BackButton.hide(); }
  }, [location.pathname, navigate]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100svh', maxWidth: 480, margin: '0 auto', background: 'var(--bg)', transition: 'background 0.3s ease' }}>

      {/* ── HEADER ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'var(--header-bg)',
        backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '0.5px solid var(--separator)',
        padding: '0 16px',
        height: 52,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Logo size={28} />
          <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--fg)', letterSpacing: -0.2 }}>
            {t('appName')}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {/* Language picker */}
          <div style={{ position: 'relative' }}>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowLangMenu(v => !v)}
              style={{
                width: 36, height: 36, border: 'none', borderRadius: 10,
                background: showLangMenu ? 'var(--accent-muted)' : 'transparent',
                color: showLangMenu ? 'var(--accent)' : 'var(--fg3)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.2s, color 0.2s',
              }}
            >
              <Globe size={18} strokeWidth={1.8} />
            </motion.button>

            <AnimatePresence>
              {showLangMenu && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={() => setShowLangMenu(false)}
                    style={{ position: 'fixed', inset: 0, zIndex: 200 }}
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -6 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                    style={{
                      position: 'absolute', top: '110%', right: 0, zIndex: 201,
                      background: 'var(--surface)', borderRadius: 14,
                      boxShadow: '0 4px 30px rgba(0,0,0,0.18)', overflow: 'hidden',
                      border: '0.5px solid var(--border)', minWidth: 140,
                    }}
                  >
                    {LANGS.map((l, i) => (
                      <motion.button
                        key={l}
                        whileHover={{ background: 'var(--accent-muted)' }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => { setLang(l); setShowLangMenu(false); }}
                        style={{
                          width: '100%', padding: '12px 16px', border: 'none',
                          background: l === lang ? 'var(--accent-muted)' : 'transparent',
                          color: l === lang ? 'var(--accent)' : 'var(--fg)',
                          fontSize: 15, fontWeight: l === lang ? 600 : 400,
                          textAlign: 'left', cursor: 'pointer',
                          borderTop: i === 0 ? 'none' : '0.5px solid var(--separator)',
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        }}
                      >
                        {langLabels[l]}
                        {l === lang && <span style={{ fontSize: 16, color: 'var(--accent)' }}>✓</span>}
                      </motion.button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Theme toggle */}
          <motion.button
            whileTap={{ scale: 0.88, rotate: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            onClick={toggleTheme}
            style={{
              width: 36, height: 36, border: 'none', borderRadius: 10,
              background: 'transparent', color: 'var(--fg3)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'color 0.2s',
            }}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={isDark ? 'sun' : 'moon'}
                initial={{ rotate: -30, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 30, opacity: 0 }}
                transition={{ duration: 0.22 }}
                style={{ display: 'flex' }}
              >
                {isDark ? <Sun size={18} strokeWidth={1.8} /> : <Moon size={18} strokeWidth={1.8} />}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        </div>
      </header>

      {/* ── CONTENT ── */}
      <main style={{ flex: 1, overflowY: 'auto', paddingBottom: 82 }}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ── BOTTOM TAB BAR ── */}
      <nav style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 480,
        background: 'var(--nav-bg)',
        backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)',
        borderTop: '0.5px solid var(--separator)',
        display: 'flex',
        paddingBottom: 'env(safe-area-inset-bottom, 4px)',
        zIndex: 100,
      }}>
        {navItems.map(({ path, label, Icon }, i) => {
          const isActive = i === activeIdx;
          return (
            <motion.button
              key={path}
              whileTap={{ scale: 0.86 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              onClick={() => {
                if (tg?.HapticFeedback) tg.HapticFeedback.selectionChanged();
                navigate(path);
              }}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                padding: '10px 4px 8px', border: 'none', background: 'transparent',
                cursor: 'pointer', gap: 3, position: 'relative',
                color: isActive ? 'var(--accent)' : 'var(--fg3)',
                transition: 'color 0.22s ease',
              }}
            >
              {isActive && (
                <motion.div
                  layoutId="tab-line"
                  style={{
                    position: 'absolute', top: 0, width: 32, height: 2.5,
                    borderRadius: '0 0 3px 3px', background: 'var(--accent)',
                  }}
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <motion.div animate={{ scale: isActive ? 1.08 : 1 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
                <Icon size={23} strokeWidth={isActive ? 2.2 : 1.6} />
              </motion.div>
              <span style={{ fontSize: 10, fontWeight: isActive ? 600 : 400, letterSpacing: 0.1 }}>{label}</span>
            </motion.button>
          );
        })}
      </nav>
    </div>
  );
};

export default Layout;
