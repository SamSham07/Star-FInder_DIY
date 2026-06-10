/* app.jsx — root composition with state + cursor trail */

const { useState: useStateA, useEffect: useEffectA, useRef: useRefA } = React;

// ── One-time confetti burst ──────────────────────────────────────────
function fireConfetti() {
  const COLORS = ['#F7C948','#FF6B9D','#6ECFF5','#FF8A3C','#4ade80','#FFFACD'];
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:99997;';
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  const pieces = Array.from({ length: 120 }, () => ({
    x: Math.random() * canvas.width,
    y: -10 - Math.random() * 200,
    r: 4 + Math.random() * 6,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    vx: (Math.random() - 0.5) * 4,
    vy: 2 + Math.random() * 4,
    spin: (Math.random() - 0.5) * 0.2,
    angle: Math.random() * Math.PI * 2,
    shape: Math.random() > 0.5 ? 'rect' : 'circle',
    opacity: 1,
  }));

  let frame = 0;
  function draw() {
    frame++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    pieces.forEach(p => {
      p.x  += p.vx;
      p.y  += p.vy;
      p.vy += 0.08;
      p.angle += p.spin;
      if (frame > 80) p.opacity -= 0.012;
      if (p.opacity <= 0 || p.y > canvas.height + 20) return;
      alive = true;
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.opacity);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.fillStyle = p.color;
      if (p.shape === 'rect') {
        ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.r / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });
    if (alive) requestAnimationFrame(draw);
    else canvas.remove();
  }
  requestAnimationFrame(draw);
}

// Stats section with animated counter (module scope so it never remounts)
function StatsSection({ lang, salesData }) {
  const t = window.T[lang]?.stats || {};
  const [count, setCount] = useStateA(0);
  const targetCount = salesData?.totalUnits || 920;
  const sectionRef = useRefA(null);
  const celebratedRef = useRefA(false);

  useEffectA(() => {
    let rafId;
    let frame = 0;
    const animate = () => {
      frame++;
      const progress = Math.min(frame / 80, 1);
      const eased = Math.pow(progress, 0.7);
      setCount(Math.floor(eased * targetCount));
      if (progress < 1) rafId = requestAnimationFrame(animate);
    };
    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [targetCount]);

  // One-time celebration on first scroll into view
  useEffectA(() => {
    const key = 'sf_stats_celebrated';
    if (localStorage.getItem(key)) return;
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !celebratedRef.current) {
        celebratedRef.current = true;
        localStorage.setItem(key, '1');
        setTimeout(fireConfetti, 300);
        obs.disconnect();
      }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Real, logged metrics derived from the live sheet
  const states = salesData?.stateCount
    ? Object.entries(salesData.stateCount).sort((a, b) => b[1] - a[1])
    : [];
  const stateLabels = { zh: '个州属', ms: 'negeri', en: 'states' };
  const reachedLabel = { zh: '覆盖州属', ms: 'Negeri dijangkau', en: 'States reached' };
  const topLabel = { zh: '领先州属', ms: 'Negeri teratas', en: 'Top state' };

  return (
    <section ref={sectionRef} style={{
      position: 'relative',
      background: 'linear-gradient(135deg, rgba(247,201,72,0.08) 0%, rgba(45,167,215,0.04) 100%)',
      padding: '88px 28px',
      borderTop: '1px solid var(--line)',
    }}>
      <div style={{
        maxWidth: 860,
        margin: '0 auto',
        textAlign: 'center',
      }}>
        <div style={{
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: '0.18em',
          color: 'var(--gold-text)',
          marginBottom: 28,
          textTransform: 'uppercase',
        }}>
          ✦ {t.social || '社区力量'}
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'clamp(20px, 3vw, 40px)',
          margin: '0 0 20px',
        }}>
          <img src="src/assets/girl-mascot.png?v=2" alt="Girl mascot" style={{
            height: 'clamp(150px, 25vw, 350px)',
            width: 'auto',
          }} />
          <div className="display" style={{
            fontSize: 'clamp(80px, 12vw, 150px)',
            lineHeight: 0.9,
            background: 'linear-gradient(135deg, var(--gold) 0%, var(--orange-2) 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.02em',
          }}>
            {count}+
          </div>
        </div>

        <p style={{
          fontSize: 'clamp(20px, 2.6vw, 28px)',
          fontWeight: 600,
          color: 'var(--cream)',
          margin: '0 auto 14px',
          maxWidth: 640,
          lineHeight: 1.25,
          textWrap: 'balance',
        }}>
          {(t.headline || '已有 {n} 个家庭一起探索星空').replace('{n}', count)}
        </p>

        <p style={{
          fontSize: 16,
          color: 'var(--cream-soft)',
          margin: '0 auto',
          maxWidth: 520,
          lineHeight: 1.6,
        }}>
          {t.sub || '加入我们，一起发现宇宙的奥秘。'}
        </p>

        {/* Real, logged sub-metrics from the live sheet */}
        {states.length > 0 && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: 12,
            marginTop: 40,
          }}>
            {/* States reached pill */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '12px 22px', borderRadius: 999,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid var(--line-strong)',
              minWidth: 160,
            }}>
              <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--blue-1)', lineHeight: 1 }}>{states.length}</span>
              <span style={{ width: 1, height: 20, background: 'var(--line-strong)', flexShrink: 0 }}></span>
              <span style={{ fontSize: 13, color: 'var(--cream-soft)', fontWeight: 500 }}>{reachedLabel[lang] || reachedLabel.en}</span>
            </div>
            {/* Top state pill */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '12px 22px', borderRadius: 999,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid var(--line-strong)',
              minWidth: 160,
            }}>
              <span style={{ fontSize: 13, color: 'var(--cream-soft)', fontWeight: 500, whiteSpace: 'nowrap' }}>{topLabel[lang] || topLabel.en}</span>
              <span style={{ width: 1, height: 20, background: 'var(--line-strong)', flexShrink: 0 }}></span>
              <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--pink)', whiteSpace: 'nowrap' }}>{states[0][0]}</span>
              <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--cream-soft)' }}>{states[0][1]}</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function App() {
  // Default to Chinese; show language modal first time
  const [lang, setLang] = useStateA(() => {
    try { return localStorage.getItem('starFinderLanguage') || null; } catch { return null; }
  });
  const [showLangModal, setShowLangModal] = useStateA(() => !lang);
  const [found, setFound] = useStateA(new Set());
  const [showHeaderBg, setShowHeaderBg] = useStateA(false);
  const [salesData, setSalesData] = useStateA(null);

  // persist lang
  useEffectA(() => {
    if (lang) {
      try { localStorage.setItem('starFinderLanguage', lang); } catch {}
      document.documentElement.lang = lang === 'zh' ? 'zh-CN' : lang === 'ms' ? 'ms' : 'en';
    }
  }, [lang]);

  // Load sales data from Google Sheets on mount
  useEffectA(() => {
    (async () => {
      const data = await window.fetchSalesData();
      if (data) setSalesData(data);
    })();
  }, []);

  const statsRef = useRefA(null);
  useEffectA(() => {
    const onScroll = () => {
      const el = statsRef.current;
      if (!el) return;
      // Show header bg only once the 社区力量 stats section reaches the header
      setShowHeaderBg(el.getBoundingClientRect().top <= 70);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // celestial discovery
  const onDiscover = (id) => {
    setFound(prev => {
      if (prev.has(id)) return prev;
      const n = new Set(prev); n.add(id);
      return n;
    });
  };

  // ----- Cursor trail -----
  const trailRef = useRefA({ last: 0 });
  useEffectA(() => {
    const onMove = (e) => {
      const now = Date.now();
      if (now - trailRef.current.last < 80) return;
      trailRef.current.last = now;
      const star = document.createElement('div');
      star.className = 'cursor-star';
      star.style.left = e.clientX + 'px';
      star.style.top  = e.clientY + 'px';
      const tint = Math.random();
      if (tint < 0.3) star.style.background = 'radial-gradient(circle, #fff 0%, rgba(255,107,157,0.6) 50%, transparent 70%)';
      else if (tint < 0.6) star.style.background = 'radial-gradient(circle, #fff 0%, rgba(45,167,215,0.6) 50%, transparent 70%)';
      document.body.appendChild(star);
      setTimeout(() => star.remove(), 1200);
    };
    if (!matchMedia('(pointer:coarse)').matches) {
      window.addEventListener('mousemove', onMove);
    }
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  // Reduced motion / mobile detection
  const handleSelectLang = (code) => {
    setLang(code);
    setShowLangModal(false);
  };

  // Pick a fallback lang while modal is open
  const activeLang = lang || 'zh';


  return (
    <div>
      {/* Language modal on first load */}
      {showLangModal && (
        <window.LanguageModal onSelect={handleSelectLang} />
      )}

      {/* Header with language switcher */}
      <window.Header lang={activeLang} setLang={setLang} showHeader={showHeaderBg} />

      <window.Hero lang={activeLang} found={found} onDiscover={onDiscover} />

      {/* Tonight's sky — real-time visibility list */}
      <window.TonightSky lang={activeLang} />

      {/* All sections below hero */}
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div id="stats-section" ref={statsRef}>
            <StatsSection lang={activeLang} salesData={salesData} />
          </div>
          <div id="nav-specs" style={{ scrollMarginTop: 70 }}>
            <window.SpecSection lang={activeLang} />
          </div>
          <div id="nav-journey" style={{ scrollMarginTop: 70 }}>
            <window.TimelineSection lang={activeLang} />
          </div>
          <div id="nav-story" style={{ scrollMarginTop: 70 }}>
            <window.StorySection lang={activeLang} />
          </div>
          <window.FoundersSection lang={activeLang} />
          <div id="nav-gallery" style={{ scrollMarginTop: 70 }}>
            <window.GallerySection lang={activeLang} />
          </div>
          <window.MalaysiaMap lang={activeLang} salesData={salesData} />
          
          {/* Workshop module */}
          <div id="nav-workshop" style={{ scrollMarginTop: 70 }}>
            <window.WorkshopSection lang={activeLang} />
          </div>

          {/* Full Survey Form with all PRD fields */}
          <section id="nav-register" style={{ position: 'relative', background: 'var(--navy-0)', padding: '80px 28px', scrollMarginTop: 70 }}>
            <div style={{ maxWidth: 700, margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: 40 }}>
                <div style={{ letterSpacing: '0.3em', color: 'var(--gold)', marginBottom: 14, fontSize: '14px' }}>✦ {window.T[activeLang]?.form?.eyebrow || 'Questionnaire'}</div>
                <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', lineHeight: 1.15, margin: '0 0 20px', fontWeight: 800 }}>{window.T[activeLang]?.form?.title || 'Tell us more about yourself!'}</h2>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  background: 'linear-gradient(135deg, #fff8e1, #fff3f8)',
                  border: '2.5px solid var(--gold)',
                  borderRadius: 0,
                  boxShadow: '5px 5px 0px rgba(247,201,72,0.4)',
                  padding: '14px 22px',
                  width: '100%',
                  textAlign: 'left',
                }}>
                  <span style={{ fontSize: 32, flexShrink: 0 }}>🎁</span>
                  <div>
                    <div style={{ fontSize: 15, color: 'var(--cream)', fontWeight: 600, lineHeight: 1.5 }}>{window.T[activeLang]?.form?.sub || "Fill in your details below and get our FREE 'Introduction of Telescopes & Guide' PDF delivered to you."}</div>
                  </div>
                </div>
              </div>
              
              <FormSurvey lang={activeLang} />
            </div>
          </section>

          <window.Footer lang={activeLang} />
        </div>
      </div>



      {/* Sound toggle — vertical right pane */}
      <SoundToggle lang={activeLang} />

      {/* Language switcher — fixed bottom-left */}
      <LanguageSwitcherBL lang={activeLang} setLang={setLang} />
    </div>
  );
}

function SoundToggle({ lang }) {
  const tracks = [
    'src/assets/audio/bintang-dalam-gelap-1.mp3',
    'src/assets/audio/bintang-dalam-gelap.mp3',
    'src/assets/audio/pelita-di-seberang.mp3',
  ];
  const [on, setOn] = useStateA(false);
  const [vol, setVol] = useStateA(0.15);
  const audioRef = useRefA(null);
  const trackRef = useRefA(0);

  // M5 fix: NO autoplay — audio starts only when user clicks the 🔊 button
  useEffectA(() => {
    const a = new Audio(tracks[0]);
    a.volume = vol;
    a.addEventListener('ended', () => {
      trackRef.current = (trackRef.current + 1) % tracks.length;
      a.src = tracks[trackRef.current];
      a.play().catch(() => {});
    });
    audioRef.current = a;
    return () => { a.pause(); };
  }, []);

  // keep volume in sync
  useEffectA(() => {
    if (audioRef.current) audioRef.current.volume = vol;
  }, [vol]);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (on) {
      a.pause();
      setOn(false);
    } else {
      a.play().then(() => setOn(true)).catch(() => setOn(false));
    }
  };

  const nextTrack = () => {
    const a = audioRef.current;
    if (!a) return;
    trackRef.current = (trackRef.current + 1) % tracks.length;
    a.src = tracks[trackRef.current];
    a.play().then(() => setOn(true)).catch(() => {});
  };

  const tip = lang === 'zh' ? (on ? '关闭背景音乐' : '播放背景音乐') : lang === 'ms' ? (on ? 'Matikan muzik' : 'Mainkan muzik') : (on ? 'Mute music' : 'Play music');
  const nextTip = lang === 'zh' ? '下一首' : lang === 'ms' ? 'Lagu seterusnya' : 'Next track';
  const volLabel = lang === 'zh' ? '音量' : lang === 'ms' ? 'Kelantangan' : 'Volume';

  // column-reverse: first child = bottom, last child = top
  return (
    <div style={{
      position: 'fixed', bottom: 18, right: 14, zIndex: 90,
      display: 'flex', flexDirection: 'column-reverse', alignItems: 'center', gap: 6,
    }}>
      {/* 1. Main toggle — sits at BOTTOM */}
      <button onClick={toggle} title={tip} style={{
        width: 40, height: 40, borderRadius: '50%',
        background: on ? 'rgba(247,201,72,0.90)' : 'rgba(110,207,245,0.45)',
        color: '#1a2845',
        border: `1px solid ${on ? 'rgba(247,201,72,0.7)' : 'rgba(110,207,245,0.6)'}`,
        backdropFilter: 'blur(10px)', cursor: 'pointer',
        fontSize: 17, display: 'grid', placeItems: 'center',
        boxShadow: on ? '0 0 14px rgba(247,201,72,0.45)' : '0 2px 10px rgba(110,207,245,0.25)',
        animation: on ? 'pulseGlow 3s ease-in-out infinite' : 'none',
        flexShrink: 0,
      }}>
        {on ? '🔊' : '🔇'}
      </button>

      {/* 2. Next-track — above toggle */}
      {on && (
        <button onClick={nextTrack} title={nextTip} aria-label={nextTip} style={{
          width: 34, height: 34, borderRadius: '50%',
          background: 'rgba(110,207,245,0.35)', color: '#1a2845',
          border: '1px solid rgba(110,207,245,0.55)',
          backdropFilter: 'blur(10px)', cursor: 'pointer',
          fontSize: 13, display: 'grid', placeItems: 'center',
          flexShrink: 0,
        }}>
          ⏭
        </button>
      )}

      {/* 3. Vertical volume panel — at TOP */}
      {on && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
          padding: '8px 6px 6px', borderRadius: 16,
          background: 'rgba(110,207,245,0.22)', border: '1px solid rgba(110,207,245,0.45)',
          backdropFilter: 'blur(10px)',
        }} data-comment-anchor="58b99a03ed-div-396-9">
          <span style={{ fontSize: 11, lineHeight: 1, opacity: 0.75 }}>🔊</span>
          <div style={{ height: 72, width: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'visible' }}>
            <input
              type="range" min="0" max="1" step="0.01" value={vol}
              onChange={(e) => setVol(parseFloat(e.target.value))}
              aria-label={volLabel}
              style={{
                width: 64, height: 3,
                transform: 'rotate(-90deg)',
                transformOrigin: 'center center',
                accentColor: '#F7C948',
                cursor: 'pointer', display: 'block',
              }}
            />
          </div>
          <span style={{ fontSize: 11, lineHeight: 1, opacity: 0.75 }}>🔈</span>
        </div>
      )}
    </div>
  );
}

// ── Fixed bottom-left language switcher ─────────────────────────────
function LanguageSwitcherBL({ lang, setLang }) {
  const [open, setOpen] = useStateA(false);
  const options = [
    { code: 'zh', short: '简中', full: '简体中文' },
    { code: 'en', short: 'EN',   full: 'English' },
    { code: 'ms', short: 'BM',   full: 'Bahasa Malaysia' },
  ];
  const current = options.find(o => o.code === lang) || options[0];

  useEffectA(() => {
    if (!open) return;
    const close = (e) => {
      if (!e.target.closest?.('[data-langbl]')) setOpen(false);
    };
    const t = setTimeout(() => document.addEventListener('click', close), 50);
    return () => { clearTimeout(t); document.removeEventListener('click', close); };
  }, [open]);

  return (
    <div data-langbl="" style={{ position: 'fixed', bottom: 22, left: 22, zIndex: 90 }}>
      {/* Options — appear above pill */}
      {open && (
        <div style={{
          position: 'absolute', bottom: 'calc(100% + 8px)', left: 0,
          background: 'rgba(8,18,34,0.97)',
          border: '1px solid rgba(255,250,205,0.18)',
          borderRadius: 14, overflow: 'hidden',
          boxShadow: '0 12px 32px rgba(0,0,0,0.40)',
          backdropFilter: 'blur(14px)', minWidth: 168,
        }}>
          {options.map((o, i) => (
            <button key={o.code}
              onClick={() => { setLang(o.code); setOpen(false); }}
              style={{
                display: 'block', width: '100%',
                padding: '11px 16px', textAlign: 'left',
                background: o.code === lang ? 'rgba(247,201,72,0.16)' : 'transparent',
                borderTop: i === 0 ? 'none' : '1px solid rgba(255,250,205,0.07)',
                borderRight: 'none', borderBottom: 'none', borderLeft: 'none',
                color: o.code === lang ? '#F7C948' : 'rgba(255,250,205,0.82)',
                fontSize: 14, fontWeight: o.code === lang ? 700 : 400,
                cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(247,201,72,0.12)'}
              onMouseLeave={e => e.currentTarget.style.background = o.code === lang ? 'rgba(247,201,72,0.16)' : 'transparent'}>
              {o.code === lang && <span style={{ marginRight: 6 }}>✓</span>}{o.full}
            </button>
          ))}
        </div>
      )}
      {/* Pill button */}
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(v => !v); }}
        style={{
          padding: '9px 14px', borderRadius: 999,
          background: 'rgba(8,18,34,0.88)',
          border: '1px solid rgba(255,250,205,0.22)',
          color: '#FFFACD', fontSize: 13, fontWeight: 600,
          backdropFilter: 'blur(12px)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 7,
          boxShadow: '0 6px 18px rgba(0,0,0,0.25)',
        }}>
        🌐 <span>{current.short}</span>
        <span style={{ fontSize: 9, opacity: 0.55 }}>{open ? '▲' : '▼'}</span>
      </button>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
