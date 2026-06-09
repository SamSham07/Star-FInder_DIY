/* timeline.jsx — sales counter, product journey timeline, storytelling, president */

const { useState: useStateT, useEffect: useEffectT, useRef: useRefT } = React;

// ----- Inline image-placeholder helper (striped) -----
function Placeholder({ label, w = '100%', h = 220, tone = 'navy' }) {
  const palette = {
    navy: { bg: '#E0F4FC', stripe: 'rgba(45,167,215,0.18)', text: 'rgba(26,40,69,0.55)' }, // sky tinted
    cream: { bg: '#FFF8E7', stripe: 'rgba(247,201,72,0.22)', text: 'rgba(26,40,69,0.55)' }, // cream + amber stripes
    gold: { bg: '#FFF1B8', stripe: 'rgba(247,201,72,0.35)', text: 'rgba(26,40,69,0.65)' } // amber
  }[tone];
  return (
    <div style={{
      width: w, height: h, borderRadius: 12,
      background: `repeating-linear-gradient(135deg, ${palette.bg}, ${palette.bg} 14px, ${palette.stripe} 14px, ${palette.stripe} 28px)`,
      border: `1px dashed ${palette.text}`,
      display: 'grid', placeItems: 'center',
      color: palette.text, fontSize: 11, letterSpacing: '0.18em',
      fontFamily: 'JetBrains Mono, monospace',
      textTransform: 'uppercase',
      position: 'relative', overflow: 'hidden'
    }}>
      <span>{label}</span>
    </div>);

}

// ----- Animated counter -----
function CountUp({ to, duration = 2000, suffix = '' }) {
  const [n, setN] = useStateT(0);
  const ref = useRefT(null);
  useEffectT(() => {
    let start = null,raf;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        const tick = (t) => {
          if (!start) start = t;
          const p = Math.min((t - start) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          setN(Math.round(to * eased));
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        obs.disconnect();
      }
    }, { threshold: 0.4 });
    if (ref.current) obs.observe(ref.current);
    return () => {obs.disconnect();if (raf) cancelAnimationFrame(raf);};
  }, [to, duration]);
  return <span ref={ref}>{n.toLocaleString()}{suffix}</span>;
}

// ----- Product Journey Timeline -----
function TimelineSection({ lang }) {
  const t = window.T[lang].journey;
  const N = t.items.length;
  const [active, setActive] = useStateT(0);
  const progress = N > 1 ? active / (N - 1) : 0;
  const touchRef = useRefT({ startX: 0, startY: 0 });

  const jumpTo = (i) => setActive(Math.min(N - 1, Math.max(0, i)));

  // Swipe gesture handlers for mobile
  const handleTouchStart = (e) => {
    touchRef.current.startX = e.touches[0].clientX;
    touchRef.current.startY = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const deltaX = touchRef.current.startX - endX;
    const deltaY = Math.abs(touchRef.current.startY - endY);

    // Only trigger if horizontal swipe is stronger than vertical (>30px delta, and 2x more horizontal than vertical)
    if (Math.abs(deltaX) > 30 && Math.abs(deltaX) > deltaY * 2) {
      if (deltaX > 0) {
        // Swiped left → next
        jumpTo(active + 1);
      } else {
        // Swiped right → prev
        jumpTo(active - 1);
      }
    }
  };

  return (
    <section id="timeline" style={{
      position: 'relative',
      background: 'var(--navy-0)', padding: "50px 28px"

    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div className="mono" style={{ letterSpacing: '0.3em', color: 'var(--gold-text)', marginBottom: 12, fontSize: "14px" }}>
            ✦ {t.eyebrow}
          </div>
          <h2 className="display" style={{ fontSize: 'clamp(28px, 3.6vw, 46px)', lineHeight: 1.1, margin: '0 0 10px' }}>
            {t.title}
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(26,40,69,0.65)', maxWidth: 680, margin: '0 auto' }}>{t.sub}</p>
        </div>

        {/* Horizontal timeline rail */}
        <div style={{ position: 'relative', marginTop: 36 }}>
          <div style={{
            position: 'absolute', top: 16, left: '6%', right: '6%', height: 2,
            background: 'linear-gradient(90deg, var(--blue-1) 0%, var(--gold) 50%, var(--pink) 100%)',
            opacity: 0.30
          }} />
          <div style={{
            position: 'absolute', top: 16, left: '6%', height: 2,
            width: `${progress * 88}%`,
            background: 'linear-gradient(90deg, var(--gold), var(--pink))',
            boxShadow: '0 0 12px var(--gold)',
            transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)'
          }} />

          <div className="r-tl-rail" style={{
            display: 'grid', gridTemplateColumns: `repeat(${N}, 1fr)`, gap: 20,
            padding: '0 4%'
          }}>
            {t.items.map((m, i) => {
              const isActive = i === active;
              return (
                <button key={i} onClick={() => jumpTo(i)} style={{
                  background: 'transparent', border: 'none', textAlign: 'center',
                  color: 'var(--cream)', padding: 0, cursor: 'pointer'
                }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: '50%',
                    background: isActive ? 'linear-gradient(135deg, var(--gold), var(--pink))' : 'var(--navy-2)',
                    border: `2px solid ${isActive ? 'var(--gold)' : 'var(--line-strong)'}`,
                    margin: '0 auto 18px', display: 'grid', placeItems: 'center',
                    boxShadow: isActive ? '0 0 22px rgba(247,201,72,0.6)' : 'none',
                    transition: 'all 0.4s', position: 'relative', zIndex: 1,
                    transform: isActive ? 'scale(1.12)' : 'scale(1)'
                  }}>
                    <span style={{ fontSize: 14, color: isActive ? 'var(--navy-1)' : 'var(--gold)', fontWeight: 700 }}>
                      {i === 0 ? '✦' : i === N - 1 ? '◆' : '●'}
                    </span>
                  </div>
                  <div className="mono" style={{
                    fontSize: 11, letterSpacing: '0.18em',
                    color: isActive ? 'var(--gold)' : 'rgba(26,40,69,0.4)',
                    marginBottom: 4, transition: 'color 0.3s'
                  }}>{m.year}</div>
                  <div className="display r-tl-title" style={{
                    fontSize: 16, lineHeight: 1.2,
                    color: isActive ? 'var(--cream)' : 'rgba(26,40,69,0.45)',
                    transition: 'color 0.3s'
                  }}>{m.title}</div>
                </button>);

            })}
          </div>
        </div>

        {/* Active milestone detail */}
        <div style={{ marginTop: 'clamp(36px, 5vh, 56px)' }} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
          <div className="glass" style={{ padding: 'clamp(28px, 3vh, 44px) clamp(28px, 2.5vw, 48px)', borderRadius: 20, display: 'flex', flexDirection: 'column', minHeight: 200 }}>
            <div className="mono" style={{ fontSize: 11, color: 'var(--gold-text)', letterSpacing: '0.2em', marginBottom: 12 }}>
              MILESTONE {active + 1} / {N} · {t.items[active].year}
            </div>
            <div key={active + '-title'} className="display" style={{ fontSize: 28, lineHeight: 1.1, marginBottom: 14, animation: 'fadeIn 0.45s ease-out' }}>
              {t.items[active].title}
            </div>
            <p key={active + '-body'} style={{ fontSize: 15, lineHeight: 1.65, color: 'rgba(26,40,69,0.8)', animation: 'fadeIn 0.55s ease-out' }}>
              {t.items[active].body}
            </p>

            {/* Prev / Next controls */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 24, gap: 12 }}>
              <button className="tl-nav-btn" onClick={() => jumpTo(active - 1)} disabled={active === 0} style={{
                ...tlNavBtn, opacity: active === 0 ? 0.35 : 1, cursor: active === 0 ? 'default' : 'pointer'
              }}>← {lang === 'zh' ? '上一个' : lang === 'ms' ? 'Sebelum' : 'Prev'}</button>
              <div style={{ display: 'flex', gap: 6 }}>
                {t.items.map((_, i) =>
                <button key={i} onClick={() => jumpTo(i)} aria-label={`Go to milestone ${i + 1}`} style={{
                  width: i === active ? 26 : 8, height: 8, borderRadius: 4, border: 'none', padding: 0,
                  background: i === active ? 'var(--gold)' : 'rgba(26,40,69,0.18)',
                  cursor: 'pointer', transition: 'all 0.3s'
                }} />
                )}
              </div>
              <button className="tl-nav-btn" onClick={() => jumpTo(active + 1)} disabled={active === N - 1} style={{
                ...tlNavBtn, opacity: active === N - 1 ? 0.35 : 1, cursor: active === N - 1 ? 'default' : 'pointer'
              }}>{lang === 'zh' ? '下一个' : lang === 'ms' ? 'Seterusnya' : 'Next'} →</button>
            </div>
          </div>
        </div>
      </div>
    </section>);

}

const tlNavBtn = {
  padding: '10px 18px', borderRadius: 999,
  background: 'transparent', border: '1px solid var(--line-strong)',
  color: 'var(--cream)', fontSize: 13, fontWeight: 600,
  fontFamily: 'inherit', whiteSpace: 'nowrap'
};

const navBtn = {
  padding: '10px 18px', borderRadius: 999,
  background: 'transparent', border: '1px solid var(--line-strong)',
  color: 'var(--cream)', fontSize: 13, fontWeight: 600,
  cursor: 'pointer', fontFamily: 'inherit'
};

// ----- Storytelling section -----
function StorySection({ lang }) {
  const t = window.T[lang].story;
  return (
    <section style={{
      position: 'relative',
      background: 'linear-gradient(180deg, var(--navy-0) 0%, var(--navy-1) 100%)', padding: "50px 28px"
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div className="r-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: 60, alignItems: 'center' }}>
          <div>
            <window.FamilyCarousel lang={lang} />
          </div>
          <div>
            <div className="mono" style={{ letterSpacing: '0.3em', color: 'var(--gold)', marginBottom: 14, fontSize: "14px" }}>
              ✦ {t.eyebrow}
            </div>
            <h2 className="display" style={{ fontSize: 'clamp(30px, 4vw, 52px)', lineHeight: 1.1, margin: '0 0 28px' }}>
              {t.title}
            </h2>
            <p style={paragraphStyle}>{t.p1}</p>
            <p style={paragraphStyle}>{t.p2}</p>
            <p style={paragraphStyle}>{t.p3}</p>

            <blockquote style={{
              borderLeft: '3px solid var(--gold)', padding: '8px 20px',
              margin: '32px 0 24px',
              fontSize: 20, lineHeight: 1.45,
              color: 'var(--gold)', fontStyle: 'italic'
            }}>
              "{t.quote}"
            </blockquote>

            <a href="#form" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              color: 'var(--pink-light)', fontWeight: 600, fontSize: 15,
              textDecoration: 'none'
            }}>{t.cta}</a>
          </div>
        </div>
      </div>
    </section>);

}

const paragraphStyle = {
  fontSize: 16, lineHeight: 1.75, color: 'rgba(26,40,69,0.78)',
  marginBottom: 16, textWrap: 'pretty'
};

// ----- President / Pioneer sharing -----
function PresidentSection({ lang }) {
  const t = window.T[lang].pres;
  return (
    <section style={{
      position: 'relative', padding: '100px 28px',
      background: 'var(--navy-1)'
    }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <div className="glass" style={{
          borderRadius: 28, padding: '48px',
          display: 'grid', gridTemplateColumns: '280px 1fr', gap: 44, alignItems: 'center',
          position: 'relative', overflow: 'hidden'
        }}>
          {/* corner glow */}
          <div style={{
            position: 'absolute', top: -60, right: -60, width: 280, height: 280, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(247,201,72,0.18), transparent 70%)',
            pointerEvents: 'none'
          }} />

          <div style={{ position: 'relative' }}>
            <Placeholder label="PORTRAIT · FOUNDER" h={280} tone="navy" />
            <div style={{
              position: 'absolute', bottom: -8, right: -8,
              padding: '6px 10px', borderRadius: 6,
              background: 'var(--gold)', color: 'var(--navy-1)',
              fontSize: 11, fontWeight: 700
            }} className="mono">SINCE 2015</div>
          </div>

          <div style={{ position: 'relative' }}>
            <div className="mono" style={{ fontSize: 11, letterSpacing: '0.3em', color: 'var(--gold-text)', marginBottom: 12 }}>
              ✦ {t.eyebrow}
            </div>
            <div className="display" style={{ fontSize: 30, lineHeight: 1.1, marginBottom: 4 }}>
              {t.name}
            </div>
            <div style={{ fontSize: 13, color: 'rgba(26,40,69,0.55)', marginBottom: 22 }}>{t.title}</div>

            <div style={{
              fontSize: 18, lineHeight: 1.55, color: 'var(--cream)',
              fontStyle: 'italic', marginBottom: 18
            }}>{t.quote}</div>

            <p style={{ fontSize: 14, lineHeight: 1.7, color: 'rgba(26,40,69,0.65)', marginBottom: 22 }}>
              {t.bio}
            </p>

            <div style={{ display: 'flex', gap: 10 }}>
              {['Facebook', 'Instagram', 'MOAA'].map((s) =>
              <a key={s} href="#" style={{
                padding: '8px 14px', borderRadius: 999,
                border: '1px solid var(--line-strong)',
                fontSize: 12, color: 'var(--cream)', textDecoration: 'none',
                fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.08em'
              }}>{s} ↗</a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>);

}

Object.assign(window, {
  TimelineSection, StorySection, PresidentSection,
  Placeholder, CountUp
});