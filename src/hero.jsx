/* hero.jsx — language modal, header, starry hero, celestial objects, time-based greeting */

const { useState, useEffect, useRef, useMemo, useCallback } = React;

// -- 5-phase sky cycle (PRD spec). Hero only — rest of the page stays bright.
function useSkyTheme(override) {
  const [hour, setHour] = useState(() => new Date().getHours());
  useEffect(() => {
    const id = setInterval(() => setHour(new Date().getHours()), 60_000);
    return () => clearInterval(id);
  }, []);
  let auto;
  if (hour >= 6 && hour < 11) auto = 'morning';else
  if (hour >= 11 && hour < 15) auto = 'noon';else
  if (hour >= 15 && hour < 18) auto = 'afternoon';else
  if (hour >= 18 && hour < 20) auto = 'evening';else
  auto = 'night';
  const key = override || auto;

  const presets = {
    morning: { grad: 'linear-gradient(180deg, #6FC5EC 0%, #A9DCF1 32%, #DCEFF6 58%, #FFE9B8 82%, #FFD27A 100%)', starOpacity: 0.06, meteors: false, sun: true, inkOnDark: false, label: 'morning · 早晨' },
    noon: { grad: 'linear-gradient(180deg, #B6E5F8 0%, #6ECFF5 55%, #2DA7D7 100%)', starOpacity: 0.04, meteors: false, sun: true, inkOnDark: false, label: 'noon · 正午' },
    afternoon: { grad: 'linear-gradient(180deg, #FFD7A0 0%, #FFB3C9 50%, #6ECFF5 100%)', starOpacity: 0.10, meteors: false, sun: true, inkOnDark: false, label: 'afternoon · 下午' },
    evening: { grad: 'linear-gradient(180deg, #4a3a78 0%, #c75c8e 40%, #FFB3C9 80%, #FFE5C2 100%)', starOpacity: 0.45, meteors: true, sun: false, inkOnDark: true, label: 'evening · 黄昏' },
    night: { grad: 'linear-gradient(180deg, #050b18 0%, #0b192c 45%, #16305e 100%)', starOpacity: 1.0, meteors: true, sun: false, inkOnDark: true, label: 'night · 夜晚' }
  };
  return { hour, key, auto, isOverridden: !!override, ...presets[key] };
}

// ----- Sky phase switcher (click to cycle, bottom-corner placement) -----
function SkyPhaseSwitcher({ skyKey, auto, isOverridden, onSet, onReset, inkOnDark }) {
  const phases = [
  { id: 'morning', icon: '🌅', label: '早晨 Morning' },
  { id: 'noon', icon: '☀️', label: '正午 Noon' },
  { id: 'afternoon', icon: '🌤️', label: '下午 Afternoon' },
  { id: 'evening', icon: '🌆', label: '黄昏 Evening' },
  { id: 'night', icon: '🌙', label: '夜晚 Night' }];

  const current = phases.find((p) => p.id === skyKey) || phases[0];
  const idx = phases.indexOf(current);
  const next = phases[(idx + 1) % phases.length];

  const fg = inkOnDark ? '#FFFACD' : '#1a2845';
  const muted = inkOnDark ? 'rgba(255,250,205,0.62)' : 'rgba(26,40,69,0.55)';
  const bg = inkOnDark ? 'rgba(11,25,44,0.55)' : 'rgba(255,255,255,0.72)';
  const border = inkOnDark ? 'rgba(255,250,205,0.22)' : 'rgba(26,40,69,0.14)';

  return (
    <div style={{
      position: 'absolute', top: 92, right: 16, zIndex: 110,
      display: 'flex', alignItems: 'center', gap: 6
    }}>
      {isOverridden &&
      <button
        onClick={onReset}
        title="Resume live time"
        style={{
          width: 28, height: 28, borderRadius: '50%',
          border: `1px solid ${border}`, background: bg,
          color: fg, fontSize: 11, cursor: 'pointer',
          backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          display: 'grid', placeItems: 'center'
        }}>↻</button>
      }
      <button
        onClick={() => onSet(next.id)}
        title={`Click to switch to ${next.label}`}
        style={{
          width: 32, height: 32, borderRadius: '50%',
          border: `1px solid ${border}`, background: bg,
          cursor: 'pointer',
          backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          boxShadow: '0 6px 18px rgba(26,40,69,0.12)',
          display: 'grid', placeItems: 'center',
          fontFamily: 'inherit', padding: 0
        }}>
        <span style={{
          width: 23, height: 23, borderRadius: '50%',
          background: '#FFC928',
          display: 'grid', placeItems: 'center', fontSize: 13, lineHeight: 1,
          boxShadow: '0 3px 8px rgba(247,201,72,0.5)'
        }}>{current.icon}</span>
      </button>
    </div>);

}

function greetingFor(hour, lang) {
  const g = window.T[lang].greeting;
  if (hour >= 5 && hour < 11) return g.morning;
  if (hour >= 11 && hour < 14) return g.noon;
  if (hour >= 14 && hour < 18) return g.afternoon;
  if (hour >= 18 && hour < 20) return g.evening;
  if (hour >= 20 || hour < 1) return g.night;
  return g.late;
}

// ----- Language selection modal -----
function LanguageModal({ onSelect }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.85) 0%, rgba(255,248,231,0.94) 100%)',
      backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
      display: 'grid', placeItems: 'center', padding: 24,
      animation: 'fadeIn 0.4s ease-out'
    }}>
      <div style={{
        position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none'
      }}>
        <StarsLayer count={140} opacity={0.7} />
      </div>
      <div className="glass" style={{
        position: 'relative', borderRadius: 24, padding: '40px 36px 36px',
        width: 'min(440px, 100%)', textAlign: 'center',
        boxShadow: '0 30px 80px rgba(26,40,69,0.18), inset 0 1px 0 rgba(26,40,69,0.05)'
      }}>
        <img src="assets/logo.png" alt="Star-Finder"
        style={{
          width: 110, height: 110,
          margin: '0 auto 18px', display: 'block',
          filter: 'drop-shadow(0 0 28px rgba(247,201,72,0.45))', objectFit: 'contain' }} />
        <div className="display" style={{ fontSize: 26, lineHeight: 1.15, marginBottom: 6 }}>
          选择您的语言
        </div>
        <div style={{ fontSize: 13, color: 'rgba(26,40,69,0.55)', marginBottom: 28 }}>
          Choose your language · Pilih bahasa anda
        </div>
        <div style={{ display: 'grid', gap: 12 }}>
          {[
          { code: 'zh', label: '简体中文', sub: 'Simplified Chinese' },
          { code: 'en', label: 'English', sub: 'English' },
          { code: 'ms', label: 'Bahasa Malaysia', sub: 'Malay' }].
          map((o) =>
          <button key={o.code} onClick={() => onSelect(o.code)} style={{
            padding: '16px 20px', borderRadius: 14,
            border: '1px solid var(--line-strong)',
            background: 'rgba(26,40,69,0.04)',
            color: 'var(--cream)', fontSize: 17, fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            transition: 'all 0.2s', textAlign: 'left'
          }}
          onMouseEnter={(e) => {e.currentTarget.style.background = 'rgba(247,201,72,0.12)';e.currentTarget.style.borderColor = 'var(--gold)';e.currentTarget.style.transform = 'translateY(-1px)';}}
          onMouseLeave={(e) => {e.currentTarget.style.background = 'rgba(26,40,69,0.04)';e.currentTarget.style.borderColor = 'var(--line-strong)';e.currentTarget.style.transform = 'translateY(0)';}}>
              <span>{o.label}</span>
              <span style={{ fontSize: 11, color: 'rgba(26,40,69,0.4)' }} className="mono">{o.sub}</span>
            </button>
          )}
        </div>
        <div style={{ marginTop: 26, fontSize: 11, color: 'rgba(26,40,69,0.35)' }}>
          家家拥有一台望远镜 · A telescope in every home
        </div>
      </div>
    </div>);

}

// ----- Static random stars layer -----
function StarsLayer({ count = 200, opacity = 1, parallax = 0, mouse = null }) {
  // Deterministic seeded random so layout is stable on re-renders
  const stars = useMemo(() => {
    let seed = 42 + count;
    const rnd = () => {seed = (seed * 9301 + 49297) % 233280;return seed / 233280;};
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: rnd() * 100,
      y: rnd() * 100,
      size: 0.6 + rnd() * 2.2,
      delay: rnd() * 6,
      dur: 2 + rnd() * 4,
      bright: rnd()
    }));
  }, [count]);

  const tx = mouse ? (mouse.x - 0.5) * parallax : 0;
  const ty = mouse ? (mouse.y - 0.5) * parallax : 0;

  return (
    <div style={{ position: 'absolute', inset: 0, opacity, transform: `translate(${tx}px, ${ty}px)`, transition: 'transform 0.6s ease-out' }}>
      {stars.map((s) =>
      <div key={s.id} style={{
        position: 'absolute',
        left: `${s.x}%`, top: `${s.y}%`,
        width: s.size, height: s.size,
        borderRadius: '50%',
        background: s.bright > 0.85 ? '#FFF8E7' : '#e8f0ff',
        boxShadow: s.bright > 0.85 ? `0 0 ${4 + s.size * 2}px rgba(247,201,72,0.6)` : `0 0 ${2 + s.size}px rgba(255,255,255,0.4)`,
        animation: `twinkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
        opacity: 0.4 + s.bright * 0.6
      }} />
      )}
    </div>);

}

// ----- Meteor sprinkler -----
function Meteors({ active }) {
  const [meteors, setMeteors] = useState([]);
  useEffect(() => {
    if (!active) return;
    let id = 0;
    const spawn = () => {
      // Random downward travel direction; the streak is aligned to it so the
      // bright head leads and the faint tail trails behind.
      const dist = 520 + Math.random() * 380;
      const deg = 20 + Math.random() * 140; // 20°..160° — always heading down, varied left/right
      const rad = deg * Math.PI / 180;
      const dxv = Math.cos(rad) * dist; // + = rightward, - = leftward
      const dyv = Math.sin(rad) * dist; // always downward
      const goingRight = dxv >= 0;
      const m = {
        id: id++,
        top: Math.random() * 34, // enter from the upper sky
        left: goingRight ? Math.random() * 44 : 56 + Math.random() * 44, // start opposite to travel so it crosses the view
        dx: dxv,
        dy: dyv,
        angle: deg, // bar follows the velocity; head (white) leads
        dur: 1.5 + Math.random() * 1.3
      };
      setMeteors((prev) => [...prev.slice(-3), m]);
      setTimeout(() => setMeteors((prev) => prev.filter((x) => x.id !== m.id)), (m.dur + 0.5) * 1000);
    };
    const timer = setInterval(spawn, 5500 + Math.random() * 3500);
    spawn();
    return () => clearInterval(timer);
  }, [active]);

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {meteors.map((m) =>
      <div key={m.id} style={{
        position: 'absolute',
        top: `${m.top}%`, left: `${m.left}%`,
        width: 140, height: 1.5,
        background: 'linear-gradient(90deg, transparent, rgba(247,201,72,0.9), white)',
        filter: 'drop-shadow(0 0 6px rgba(247,201,72,0.8))',
        '--angle': `${m.angle}deg`, '--dx': `${m.dx}px`, '--dy': `${m.dy}px`,
        animation: `meteorFly ${m.dur}s linear forwards`,
        transformOrigin: '0 0'
      }} />
      )}
    </div>);

}

// ----- A celestial object (clickable, with tooltip) -----
function CelestialObject({ obj, lang, x, y, size = 60, found, onDiscover, selectedId, onSelectObject }) {
  const [hover, setHover] = useState(false);
  const open = selectedId === obj.id;

  const content = obj[lang];

  const renderVisual = () => {
    const baseShadow = found ? '0 0 30px rgba(247,201,72,0.7)' : '0 0 20px rgba(255,255,255,0.35)';
    switch (obj.type) {
      case 'moon':
        return <MoonSVG size={size} />;
      case 'planet':
        if (obj.id === 'jupiter') return <JupiterSVG size={size} />;
        if (obj.id === 'saturn') return <SaturnSVG size={size} />;
        if (obj.id === 'mars') return <MarsSVG size={size} />;
        return null;
      case 'belt':return <OrionBeltSVG size={size} />;
      case 'star':return <SiriusSVG size={size} />;
      case 'cluster':return <PleiadesSVG size={size} />;
      case 'nebula':
        if (obj.id === 'lagoon') return <LagoonNebulaSVG size={size} />;
        return <NebulaSVG size={size} />;
      case 'galaxy':return <AndromedaSVG size={size} />;
      default:return null;
    }
  };

  // close on outside click
  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (!e.target.closest?.('[data-celestial-id="' + obj.id + '"]')) onSelectObject(null);
    };
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [open, obj.id, onSelectObject]);

  return (
    <div
      data-celestial-id={obj.id}
      style={{
        position: 'absolute',
        left: `${x}%`, top: `${y}%`,
        transform: 'translate(-50%, -50%)',
        cursor: 'pointer',
        animation: `float ${4 + obj.id.length % 4}s ease-in-out infinite`,
        animationDelay: `${obj.id.length * 0.2 % 2}s`,
        zIndex: hover || open ? 50 : 10
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={(e) => {e.stopPropagation();onSelectObject(open ? null : obj.id);if (!found) onDiscover(obj.id);}}
      onKeyDown={(e) => {if (e.key === 'Enter' || e.key === ' ') {e.preventDefault();e.stopPropagation();onSelectObject(open ? null : obj.id);if (!found) onDiscover(obj.id);}}}
      role="button"
      tabIndex={0}
      aria-label={content.name}>
      
      <div style={{
        transition: 'transform 0.3s ease',
        transform: hover ? 'scale(1.18)' : found ? 'scale(1.05)' : 'scale(1)',
        filter: found ? 'drop-shadow(0 0 12px rgba(247,201,72,0.7))' : hover ? 'drop-shadow(0 0 12px rgba(255,255,255,0.5))' : 'drop-shadow(0 0 6px rgba(255,255,255,0.25))'
      }}>
        {renderVisual()}
      </div>
      {/* invisible larger hit area */}
      <div style={{ position: 'absolute', inset: -20, borderRadius: '50%' }} />

      {open &&
      <div onClick={(e) => e.stopPropagation()} style={{
        position: 'absolute',
        ...(y > 55 ?
        { bottom: `calc(100% + 14px)`, top: 'auto' } :
        { top: `calc(100% + 14px)`, bottom: 'auto' }),
        ...(x > 75 ?
        { right: '50%', left: 'auto', transform: 'translateX(50%)' } :
        x < 25 ?
        { left: '50%', right: 'auto', transform: 'translateX(-50%)' } :
        { left: '50%', right: 'auto', transform: 'translateX(-50%)' }),
        width: 280, padding: '14px 16px',
        borderRadius: 14,
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(16px)',
        border: '1px solid var(--gold)',
        boxShadow: '0 12px 36px rgba(26,40,69,0.18), 0 0 20px rgba(247,201,72,0.25)',
        color: 'var(--cream)', textAlign: 'left',
        animation: 'fadeIn 0.25s ease-out',
        zIndex: 60
      }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 32, height: 32, display: 'grid', placeItems: 'center' }}>
              <span style={{ fontSize: 22 }}>{obj.emoji}</span>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--gold)' }} className="mono">{obj.type.toUpperCase()}</div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{content.name}</div>
            </div>
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.5, color: 'rgba(26,40,69,0.85)' }}>{content.fact}</div>
          {(() => {
          const v = window.getViewing && window.getViewing(obj.id, lang);
          if (!v) return null;
          return (
            <div style={{
              marginTop: 10, padding: '8px 10px', borderRadius: 9,
              background: 'rgba(45,167,215,0.10)',
              border: '1px solid rgba(45,167,215,0.28)'
            }}>
                <div className="mono" style={{ fontSize: 11, lineHeight: 1.45, fontWeight: 600,
                color: v.status === 'not-visible' ? 'rgba(26,40,69,0.55)' : '#1c6f93' }}>
                  {v.main}
                </div>
                <div className="mono" style={{ fontSize: 10, marginTop: 3, color: 'rgba(26,40,69,0.50)' }}>
                  {v.appears && v.gone ? `${v.appears}–${v.gone}` : v.now}
                </div>
              </div>);

        })()}
          <div style={{ marginTop: 10, fontSize: 11, color: 'var(--gold)', fontWeight: 600 }} className="mono">
            {found ? '✓ DISCOVERED' : '+ NEW DISCOVERY'}
          </div>
        </div>
      }
    </div>);

}

// ====== Celestial SVGs (lightweight, original) ======

// Current lunar phase as a fraction 0..1 (0 = new, 0.5 = full), from the date.
function getMoonPhase(date = new Date()) {
  const synodic = 29.530588853;
  const knownNew = Date.UTC(2000, 0, 6, 18, 14, 0); // reference new moon
  const days = (date.getTime() - knownNew) / 86400000;
  let p = days % synodic / synodic;
  if (p < 0) p += 1;
  // Don't fold - keep full 0-1 range so moonShadowPoints works correctly
  return p;
}

// Build the unlit-region polygon for a moon of radius r centred at (cx,cy).
function moonShadowPoints(cx, cy, r, phase, N = 48) {
  const a = 2 * Math.PI * phase;
  const rx = Math.cos(a) * r; // terminator half-width (signed)
  const limbSign = phase < 0.5 ? -1 : 1; // dark limb: waxing→left, waning→right
  // Terminator sits on the opposite side of the dark limb for crescents and on
  // the same side for gibbous phases; -limbSign*rx encodes both correctly so a
  // gibbous moon reads mostly-lit (thin dark sliver) instead of inverted.
  const pts = [];
  for (let i = 0; i <= N; i++) {// dark limb, top → bottom
    const t = i / N * Math.PI;
    pts.push([cx + limbSign * r * Math.sin(t), cy - r * Math.cos(t)]);
  }
  for (let i = N; i >= 0; i--) {// terminator, bottom → top
    const t = i / N * Math.PI;
    pts.push([cx - limbSign * rx * Math.sin(t), cy - r * Math.cos(t)]);
  }
  return pts.map((p) => p.map((n) => n.toFixed(2)).join(',')).join(' ');
}

// ----- DIY telescope illustration — modelled on the real product:
//        white refractor tube, black eyepiece, chrome focuser, white rings,
//        blue "Solar Viewer" sticker, aluminium tripod -----
function TelescopeSVG({ size = 84 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="scopeWhite" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="0.55" stopColor="#F4F6FA" />
          <stop offset="1" stopColor="#CFD6E2" />
        </linearGradient>
        <linearGradient id="scopeChrome" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F4F6F9" />
          <stop offset="0.5" stopColor="#C2C8D2" />
          <stop offset="1" stopColor="#9BA3B0" />
        </linearGradient>
      </defs>

      {/* tripod legs (aluminium) */}
      <g strokeLinecap="round">
        <g stroke="#B6BECB" strokeWidth="5">
          <line x1="50" y1="61" x2="32" y2="94" />
          <line x1="50" y1="61" x2="68" y2="94" />
          <line x1="50" y1="61" x2="50" y2="91" />
        </g>
        <g stroke="#8B93A1" strokeWidth="1.4">
          <line x1="50" y1="61" x2="32" y2="94" />
          <line x1="50" y1="61" x2="68" y2="94" />
          <line x1="50" y1="61" x2="50" y2="91" />
        </g>
      </g>
      <g fill="#2A3346">
        <circle cx="32" cy="94" r="2.6" />
        <circle cx="68" cy="94" r="2.6" />
        <circle cx="50" cy="91" r="2.6" />
      </g>
      {/* black pan/tilt head */}
      <rect x="43" y="52" width="14" height="11" rx="2.5" fill="#2A3346" />
      <circle cx="50" cy="52" r="3" fill="#454F63" />

      {/* tube — long profile (option D), facing left */}
      <g transform="translate(100,0) scale(-1,1)">
        <g transform="rotate(-14 50 50)">
          {/* black eyepiece */}
          <rect x="4" y="44" width="12" height="11" rx="2.5" fill="#1C2230" />
          {/* chrome focuser collar */}
          <rect x="16" y="42.5" width="7" height="14" rx="2" fill="url(#scopeChrome)" stroke="#8B93A1" strokeWidth="0.8" />
          {/* long white barrel */}
          <rect x="21" y="41" width="62" height="17" rx="8.5" fill="url(#scopeWhite)" stroke="#3A4254" strokeWidth="1.3" />
          {/* soft cylinder shading */}
          <rect x="24" y="52.5" width="56" height="3.6" rx="1.8" fill="#B9C1CE" opacity="0.5" />
          <rect x="25" y="43.5" width="52" height="2.4" rx="1.2" fill="#FFFFFF" opacity="0.9" />
          {/* white mounting rings */}
          <rect x="38" y="39.5" width="5" height="20" rx="2" fill="#FBFCFE" stroke="#C2C8D2" strokeWidth="0.9" />
          <rect x="56" y="39.5" width="5" height="20" rx="2" fill="#FBFCFE" stroke="#C2C8D2" strokeWidth="0.9" />
          {/* blue "Solar Viewer" sticker */}
          <ellipse cx="49" cy="46.5" rx="6.5" ry="3.8" fill="#1559B0" stroke="#0E3F86" strokeWidth="0.7" />
          {/* front white lens hood */}
          <rect x="78" y="38.5" width="9" height="22" rx="3.5" fill="url(#scopeWhite)" stroke="#3A4254" strokeWidth="1.3" />
          {/* open objective (dark interior) */}
          <ellipse cx="87" cy="49.5" rx="2.4" ry="9.5" fill="#11161F" />
          <ellipse cx="87" cy="49.5" rx="1.2" ry="6.4" fill="#2E3954" />
        </g>
      </g>
    </svg>);

}

function MoonSVG({ size = 60 }) {
  const phase = getMoonPhase();
  const shadow = moonShadowPoints(30, 30, 27, phase);
  return (
    <svg width={size} height={size} viewBox="0 0 60 60">
      <defs>
        <radialGradient id="moonG" cx="35%" cy="30%">
          <stop offset="0%" stopColor="#FFF8E7" />
          <stop offset="70%" stopColor="#e8d9a8" />
          <stop offset="100%" stopColor="#9a8a5d" />
        </radialGradient>
        <clipPath id="moonClip"><circle cx="30" cy="30" r="26" /></clipPath>
        <filter id="moonShadowBlur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.1" />
        </filter>
        <radialGradient id="moonShadowG" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#0a1020" stopOpacity="0.62" />
          <stop offset="100%" stopColor="#0a1020" stopOpacity="0.5" />
        </radialGradient>
      </defs>
      <g clipPath="url(#moonClip)">
        <circle cx="30" cy="30" r="26" fill="url(#moonG)" />
        <circle cx="22" cy="22" r="3" fill="#b8a878" opacity="0.6" />
        <circle cx="38" cy="28" r="2" fill="#b8a878" opacity="0.5" />
        <circle cx="32" cy="40" r="2.5" fill="#b8a878" opacity="0.5" />
        <circle cx="20" cy="36" r="1.5" fill="#b8a878" opacity="0.5" />
        <circle cx="42" cy="38" r="1.8" fill="#b8a878" opacity="0.45" />
        {/* light rim sits UNDER the shadow so only the lit limb shows it */}
        <circle cx="30" cy="30" r="25.6" fill="none" stroke="rgba(255,248,231,0.30)" strokeWidth="0.9" />
        {/* shadow cast by the current lunar phase — softened + fading */}
        <polygon points={shadow} fill="url(#moonShadowG)" filter="url(#moonShadowBlur)" />
      </g>
      {/* dark outer border — matches the shadow on the dark limb */}
      <circle cx="30" cy="30" r="26" fill="none" stroke="rgba(10,16,32,0.45)" strokeWidth="0.75" />
    </svg>);

}

function JupiterSVG({ size = 60 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60">
      <defs>
        <radialGradient id="jupG" cx="40%" cy="40%">
          <stop offset="0%" stopColor="#ffd9a8" />
          <stop offset="100%" stopColor="#a66332" />
        </radialGradient>
        <clipPath id="jupClip"><circle cx="30" cy="30" r="24" /></clipPath>
      </defs>
      <circle cx="30" cy="30" r="24" fill="url(#jupG)" />
      <g clipPath="url(#jupClip)" opacity="0.55">
        <rect x="6" y="18" width="48" height="2.5" fill="#7a4a1f" />
        <rect x="6" y="24" width="48" height="3" fill="#c98a4a" />
        <rect x="6" y="30" width="48" height="2" fill="#7a4a1f" />
        <rect x="6" y="35" width="48" height="3.5" fill="#c98a4a" />
        <rect x="6" y="42" width="48" height="2" fill="#7a4a1f" />
        <ellipse cx="36" cy="33" rx="5" ry="2.5" fill="#c14a3a" />
      </g>
    </svg>);

}

function SaturnSVG({ size = 60 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60">
      <defs>
        <radialGradient id="satG" cx="40%" cy="40%">
          <stop offset="0%" stopColor="#fff2c2" />
          <stop offset="100%" stopColor="#d4a155" />
        </radialGradient>
      </defs>
      <ellipse cx="30" cy="32" rx="26" ry="6" fill="none" stroke="#c9b380" strokeWidth="2.2" opacity="0.85" transform="rotate(-18 30 32)" />
      <ellipse cx="30" cy="32" rx="22" ry="4.5" fill="none" stroke="#f0d68a" strokeWidth="1.4" opacity="0.7" transform="rotate(-18 30 32)" />
      <circle cx="30" cy="30" r="14" fill="url(#satG)" />
      <ellipse cx="30" cy="32" rx="26" ry="6" fill="none" stroke="#c9b380" strokeWidth="2.2" opacity="0.85" transform="rotate(-18 30 32)" strokeDasharray="0 28 60" />
    </svg>);

}

function MarsSVG({ size = 60 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60">
      <defs>
        <radialGradient id="marsG" cx="40%" cy="35%">
          <stop offset="0%" stopColor="#ff9d6c" />
          <stop offset="100%" stopColor="#8a2f1a" />
        </radialGradient>
      </defs>
      <circle cx="30" cy="30" r="22" fill="url(#marsG)" />
      <circle cx="30" cy="12" r="3" fill="#ffe5cc" opacity="0.85" />
      <circle cx="30" cy="48" r="2.5" fill="#ffe5cc" opacity="0.6" />
      <circle cx="22" cy="32" r="2" fill="#5a1a0a" opacity="0.6" />
      <circle cx="38" cy="36" r="2.5" fill="#5a1a0a" opacity="0.5" />
    </svg>);

}

function OrionBeltSVG({ size = 80 }) {
  const s = size;
  return (
    <svg width={s} height={s * 0.4} viewBox="0 0 100 40">
      <line x1="12" y1="32" x2="88" y2="8" stroke="#ffd700" strokeWidth="0.6" strokeDasharray="2 3" opacity="0.55" />
      {[{ x: 15, y: 30, r: 5 }, { x: 50, y: 20, r: 6 }, { x: 85, y: 10, r: 5 }].map((p, i) =>
      <g key={i}>
          <circle cx={p.x} cy={p.y} r={p.r * 1.8} fill="#fff" opacity="0.18" />
          <circle cx={p.x} cy={p.y} r={p.r} fill="#fff" />
          <circle cx={p.x} cy={p.y} r={p.r * 0.5} fill="#fffacd" />
        </g>
      )}
    </svg>);

}

function SiriusSVG({ size = 60 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60">
      <defs>
        <radialGradient id="sirG" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="40%" stopColor="#cfe9ff" />
          <stop offset="100%" stopColor="rgba(135,206,235,0)" />
        </radialGradient>
      </defs>
      <circle cx="30" cy="30" r="28" fill="url(#sirG)" />
      <g stroke="#fff" strokeWidth="0.8" opacity="0.7">
        <line x1="30" y1="2" x2="30" y2="58" />
        <line x1="2" y1="30" x2="58" y2="30" />
      </g>
      <circle cx="30" cy="30" r="6" fill="#fff" />
    </svg>);

}

function PleiadesSVG({ size = 60 }) {
  // Real Pleiades cluster: 7 brightest stars (M45) — Alcyone (center, brightest),
  // Atlas, Electra, Maia, Merope, Taygeta, Pleione — embedded in blue reflection nebulosity.
  const pts = [
  { x: 33, y: 32, r: 3.4, name: 'Alcyone' },
  { x: 40, y: 38, r: 2.8, name: 'Atlas' },
  { x: 21, y: 36, r: 3.0, name: 'Electra' },
  { x: 24, y: 22, r: 2.4, name: 'Maia' },
  { x: 35, y: 22, r: 2.4, name: 'Merope' },
  { x: 18, y: 28, r: 2.2, name: 'Taygeta' },
  { x: 43, y: 32, r: 2.0, name: 'Pleione' },
  { x: 28, y: 42, r: 1.6, name: 'Celaeno' }];

  return (
    <svg width={size} height={size} viewBox="0 0 60 60">
      <defs>
        <radialGradient id="pleiNeb" cx="50%" cy="55%">
          <stop offset="0%" stopColor="#bcdcff" stopOpacity="0.55" />
          <stop offset="55%" stopColor="#6fa8e0" stopOpacity="0.28" />
          <stop offset="100%" stopColor="rgba(45,167,215,0)" />
        </radialGradient>
        <radialGradient id="pleiStar" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="60%" stopColor="#dbeaff" />
          <stop offset="100%" stopColor="rgba(190,220,255,0)" />
        </radialGradient>
      </defs>
      {/* blue reflection nebulosity */}
      <ellipse cx="30" cy="32" rx="26" ry="20" fill="url(#pleiNeb)" />
      <ellipse cx="30" cy="32" rx="18" ry="14" fill="url(#pleiNeb)" opacity="0.7" />
      {/* nebular wisps along each star */}
      {pts.slice(0, 7).map((p, i) =>
      <ellipse key={'w' + i} cx={p.x} cy={p.y} rx={p.r * 3.2} ry={p.r * 1.2}
      fill="#9ec7ee" opacity="0.18" transform={`rotate(${i * 23 % 180} ${p.x} ${p.y})`} />
      )}
      {/* stars */}
      {pts.map((p, i) =>
      <g key={i}>
          <circle cx={p.x} cy={p.y} r={p.r * 2.4} fill="url(#pleiStar)" opacity="0.85" />
          <circle cx={p.x} cy={p.y} r={p.r} fill="#ffffff" />
          {/* diffraction spike on brightest */}
          {p.r >= 2.8 &&
        <g stroke="#fff" strokeWidth="0.4" opacity="0.7">
              <line x1={p.x - p.r * 4} y1={p.y} x2={p.x + p.r * 4} y2={p.y} />
              <line x1={p.x} y1={p.y - p.r * 4} x2={p.x} y2={p.y + p.r * 4} />
            </g>
        }
        </g>
      )}
    </svg>);

}

function NebulaSVG({ size = 80 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80">
      <defs>
        <radialGradient id="nebG" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#ffb6c1" />
          <stop offset="40%" stopColor="#9370db" stopOpacity="0.7" />
          <stop offset="80%" stopColor="#4169e1" stopOpacity="0.4" />
          <stop offset="100%" stopColor="rgba(65,105,225,0)" />
        </radialGradient>
      </defs>
      <ellipse cx="40" cy="40" rx="36" ry="28" fill="url(#nebG)" transform="rotate(-22 40 40)" />
      <circle cx="36" cy="42" r="2" fill="#fff" />
      <circle cx="48" cy="36" r="1.5" fill="#fff" />
      <circle cx="42" cy="50" r="1" fill="#fff" />
      <circle cx="30" cy="32" r="1.2" fill="#fff" />
    </svg>);

}

// M8 Lagoon — pink/red emission nebula with a bright glowing core and a dark dust lane
function LagoonNebulaSVG({ size = 80 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80">
      <defs>
        <radialGradient id="lagG" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#ffd9e6" />
          <stop offset="35%" stopColor="#ff6f91" stopOpacity="0.78" />
          <stop offset="75%" stopColor="#c0306b" stopOpacity="0.4" />
          <stop offset="100%" stopColor="rgba(192,48,107,0)" />
        </radialGradient>
        <radialGradient id="lagCore" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#fffbea" />
          <stop offset="100%" stopColor="rgba(255,221,160,0)" />
        </radialGradient>
      </defs>
      <ellipse cx="40" cy="40" rx="36" ry="26" fill="url(#lagG)" transform="rotate(18 40 40)" />
      {/* bright core */}
      <circle cx="44" cy="38" r="11" fill="url(#lagCore)" />
      {/* dark lagoon dust lane */}
      <path d="M20 50 Q38 30 60 34" stroke="#5a1733" strokeWidth="3" fill="none" opacity="0.35" transform="rotate(18 40 40)" />
      {/* embedded young stars */}
      <circle cx="44" cy="38" r="1.6" fill="#fff" />
      <circle cx="34" cy="44" r="1.1" fill="#fff" />
      <circle cx="52" cy="34" r="1" fill="#fff" />
      <circle cx="38" cy="32" r="0.9" fill="#fff" />
    </svg>);

}

function AndromedaSVG({ size = 80 }) {
  return (
    <svg width={size} height={size * 0.55} viewBox="0 0 100 55">
      <defs>
        <radialGradient id="galG" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="30%" stopColor="#e6e6fa" />
          <stop offset="100%" stopColor="rgba(178,160,225,0)" />
        </radialGradient>
      </defs>
      <g transform="rotate(-18 50 27)">
        <ellipse cx="50" cy="27" rx="48" ry="9" fill="url(#galG)" opacity="0.7" />
        <ellipse cx="50" cy="27" rx="30" ry="5" fill="url(#galG)" />
        <circle cx="50" cy="27" r="6" fill="#fff" />
        <circle cx="50" cy="27" r="3" fill="#fffacd" />
      </g>
    </svg>);

}

// ====== Header ======

function Header({ lang, setLang, onOpenLangPicker, showHeader }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 900);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Close mobile menu when user clicks outside the header
  useEffect(() => {
    if (!menuOpen) return;
    const close = (e) => {
      if (!e.target.closest?.('.site-header')) setMenuOpen(false);
    };
    const t = setTimeout(() => document.addEventListener('click', close), 50);
    return () => {clearTimeout(t);document.removeEventListener('click', close);};
  }, [menuOpen]);
  const menu = window.T[lang]?.nav?.menu || ['Home', 'Journey', 'Our Story', 'Gallery', 'Specs', 'Register'];
  // B1 fix: ZH menu order is [Home, Specs, Journey, Story, Gallery, Register]
  //         EN/MS order is   [Home, Journey, Story, Gallery, Specs, Register]
  const targets = lang === 'zh' ?
  [null, 'nav-workshop', 'nav-journey', 'nav-story', 'nav-gallery', 'nav-register'] :
  [null, 'nav-journey', 'nav-story', 'nav-gallery', 'nav-workshop', 'nav-register'];

  const goTo = (id) => {
    setMenuOpen(false);
    const targetY = id ? document.getElementById(id)?.getBoundingClientRect().top + window.scrollY - 70 : 0;
    if (targetY == null || isNaN(targetY)) return;
    const startY = window.scrollY;
    const dist = targetY - startY;
    const dur = 600;
    const t0 = performance.now();
    const step = (now) => {
      const p = Math.min((now - t0) / dur, 1);
      const ease = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      window.scrollTo(0, startY + dist * ease);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const linkColor = showHeader ? 'var(--cream)' : '#ffffff';
  const linkShadow = showHeader ? 'none' : '0 1px 6px rgba(0,0,0,0.4)';

  return (
    <header className="site-header" style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,

      display: 'flex',
      background: showHeader || menuOpen ? 'linear-gradient(180deg, rgba(110,207,245,0.92), rgba(110,207,245,0))' : 'transparent',
      transition: 'background 0.3s', lineHeight: "1.2", justifyContent: "space-between", alignItems: "center", padding: "18px 28px", opacity: "1", fontWeight: "500", height: "80px"
    }} data-comment-anchor="b2073a1d52-header-561-5">
      <button onClick={() => goTo(null)} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}>
        <img src="assets/logo.png" alt="Star-Finder 寻星天文学会" className="hdr-logo"
        style={{

          filter: 'drop-shadow(0 0 14px rgba(247,201,72,0.45)) drop-shadow(0 4px 14px rgba(26,40,69,0.15))', objectFit: "contain", width: "80px", height: "80px" }} data-comment-anchor="74af13386d-img-468-9" />
        <div>
          <div className="display" style={{ lineHeight: 1, letterSpacing: '-0.01em', color: showHeader ? 'var(--cream)' : '#ffffff', textShadow: showHeader ? 'none' : '0 1px 8px rgba(0,0,0,0.4)', fontWeight: "800", fontSize: "25px" }}>DIY Telescope</div>
          <div className="mono" style={{ color: showHeader ? 'var(--cream)' : 'rgba(255,255,255,0.85)', textShadow: showHeader ? 'none' : '0 1px 6px rgba(0,0,0,0.4)', marginTop: 4, fontSize: "12px", letterSpacing: "1.2px" }}>STAR-FINDER ASTRONOMICAL SOCIETY</div>
        </div>
      </button>

      {/* Desktop nav */}
      {!isMobile &&
      <nav style={{ display: 'flex', alignItems: 'center', gap: 26 }}>
          {menu.map((item, i) =>
        <button key={i} onClick={() => goTo(targets[i])}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: linkColor, textShadow: linkShadow, fontSize: 15, fontWeight: 600, fontFamily: 'inherit', padding: '4px 2px', transition: 'color 0.2s', whiteSpace: 'nowrap' }}
        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--gold)'}
        onMouseLeave={(e) => e.currentTarget.style.color = linkColor}>
              {item}
            </button>
        )}
        </nav>
      }

      {/* Right cluster: hamburger only — language switcher lives at bottom-left */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {isMobile &&
        <button onClick={(e) => {e.stopPropagation();setMenuOpen(!menuOpen);}} aria-label="Menu"
        style={{ width: 42, height: 42, borderRadius: 8, background: 'rgba(255,255,255,0.16)', border: '1px solid rgba(255,255,255,0.3)', cursor: 'pointer', display: 'grid', placeItems: 'center', padding: 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: 18 }}>
              <span style={{ height: 2, background: linkColor, borderRadius: 2, transition: 'transform 0.25s', transform: menuOpen ? 'translateY(6px) rotate(45deg)' : 'none' }}></span>
              <span style={{ height: 2, background: linkColor, borderRadius: 2, opacity: menuOpen ? 0 : 1, transition: 'opacity 0.2s' }}></span>
              <span style={{ height: 2, background: linkColor, borderRadius: 2, transition: 'transform 0.25s', transform: menuOpen ? 'translateY(-6px) rotate(-45deg)' : 'none' }}></span>
            </div>
          </button>
        }
      </div>

      {/* Mobile dropdown panel */}
      {isMobile && menuOpen &&
      <nav style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'rgba(10,20,32,0.97)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,250,205,0.12)', boxShadow: '0 16px 40px rgba(0,0,0,0.4)', display: 'flex', flexDirection: 'column', padding: '8px 0' }}>
          {/* Explicit close row */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '4px 16px 4px' }}>
            <button onClick={() => setMenuOpen(false)} aria-label="Close menu" style={{
            background: 'none', border: '1px solid rgba(255,250,205,0.2)', color: 'rgba(255,250,205,0.75)',
            fontSize: 18, cursor: 'pointer', width: 34, height: 34, borderRadius: 8,
            display: 'grid', placeItems: 'center', lineHeight: 1
          }}>✕</button>
          </div>
          {menu.map((item, i) =>
        <button key={i} onClick={() => goTo(targets[i])}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#FFFACD', fontSize: 16, fontWeight: 500, fontFamily: 'inherit', padding: '14px 28px', textAlign: 'left', transition: 'background 0.2s' }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(247,201,72,0.12)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'none'}>
              {item}
            </button>
        )}
        </nav>
      }
    </header>);

}

const iconBtnStyle = {
  width: 32, height: 32, borderRadius: '50%',
  display: 'grid', placeItems: 'center',
  border: '1px solid var(--line-strong)',
  background: 'rgba(26,40,69,0.04)',
  color: 'var(--cream)',
  textDecoration: 'none'
};

// ====== Hero section ======

function Hero({ lang, found, onDiscover }) {
  const t = window.T[lang].hero;
  const [skyOverride, setSkyOverride] = useState(null);
  const sky = useSkyTheme(skyOverride);
  const [greeting, setGreeting] = useState(() => greetingFor(new Date().getHours(), lang));
  const [selectedId, setSelectedId] = useState(null);
  useEffect(() => {
    setGreeting(greetingFor(new Date().getHours(), lang));
    const timer = setInterval(() => setGreeting(greetingFor(new Date().getHours(), lang)), 60000);
    return () => clearInterval(timer);
  }, [lang]);

  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });
  const heroRef = useRef(null);

  const onMouseMove = (e) => {
    const r = heroRef.current.getBoundingClientRect();
    setMouse({ x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height });
  };

  // celestial object placements (avoiding the middle text)
  const placements = {
    moon: { x: 7, y: 15, size: 78 },
    jupiter: { x: 86, y: 18, size: 56 },
    saturn: { x: 82, y: 70, size: 60 },
    mars: { x: 14, y: 78, size: 44 },
    orion: { x: 88, y: 42, size: 84 },
    sirius: { x: 6, y: 50, size: 36 },
    pleiades: { x: 28, y: 14, size: 42 },
    m42: { x: 70, y: 86, size: 70 },
    lagoon: { x: 16, y: 58, size: 62 },
    andromeda: { x: 38, y: 88, size: 78 }
  };

  const objects = window.CELESTIAL;

  // text colours flip when the sky is dark (evening / night)
  const inkOnDark = sky.inkOnDark;
  const headText = inkOnDark ? '#FFFACD' : 'var(--cream)';
  const headTextMute = inkOnDark ? 'rgba(255,250,205,0.78)' : 'rgba(26,40,69,0.55)';

  return (
    <section ref={heroRef} className="rocket-cursor" onMouseMove={onMouseMove} style={{
      position: 'relative', minHeight: '100vh', overflow: 'hidden',
      background: sky.grad,
      paddingTop: 80, paddingBottom: 80,
      zIndex: 2
    }}>
      {/* layered stars w/ parallax */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: sky.starOpacity }}>
        <StarsLayer count={120} opacity={0.5} parallax={10} mouse={mouse} />
        <StarsLayer count={80} opacity={0.8} parallax={22} mouse={mouse} />
        <StarsLayer count={40} opacity={1.0} parallax={40} mouse={mouse} />
      </div>

      {/* nebula glow blobs */}
      <div style={{
        position: 'absolute', top: '20%', left: '60%', width: 400, height: 400,
        background: 'radial-gradient(circle, rgba(255,107,157,0.18), transparent 60%)',
        filter: 'blur(40px)', pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', bottom: '0%', left: '10%', width: 500, height: 500,
        background: 'radial-gradient(circle, rgba(45,167,215,0.22), transparent 60%)',
        filter: 'blur(50px)', pointerEvents: 'none'
      }} />

      {/* meteors */}
      {sky.meteors && <Meteors active={true} />}

      {/* sun in day */}
      {sky.sun &&
      <div style={{
        position: 'absolute', top: 180, right: '18%',
        width: 120, height: 120, borderRadius: '50%',
        background: 'radial-gradient(circle, #fff7d6, #ffb703 70%, transparent)',
        filter: 'drop-shadow(0 0 40px rgba(247,201,72,0.5))',
        animation: 'float 6s ease-in-out infinite',
        pointerEvents: 'none'
      }} />
      }

      {/* sky phase switcher — manual override */}
      <SkyPhaseSwitcher
        skyKey={sky.key}
        auto={sky.auto}
        isOverridden={sky.isOverridden}
        onSet={(k) => setSkyOverride(k === sky.auto ? null : k)}
        onReset={() => setSkyOverride(null)}
        inkOnDark={sky.inkOnDark} />

      {/* celestial objects */}
      {objects.map((obj) => {
        const p = placements[obj.id];
        if (!p) return null;
        return (
          <CelestialObject
            key={obj.id} obj={obj} lang={lang}
            x={p.x} y={p.y} size={p.size}
            found={found.has(obj.id)}
            onDiscover={onDiscover}
            selectedId={selectedId}
            onSelectObject={setSelectedId} />);


      })}

      {/* center content */}
      <div style={{
        position: 'relative', zIndex: 5,
        maxWidth: 980, margin: '0 auto', padding: '60px 28px',
        textAlign: 'center'
      }}>
        <div className="mono" style={{
          letterSpacing: '0.3em', color: 'var(--gold)',
          marginBottom: 18, opacity: 0.85, fontSize: 11
        }}>{t.kicker}</div>

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 10,
          padding: '8px 16px', borderRadius: 999,
          background: inkOnDark ? 'rgba(255,250,205,0.10)' : 'rgba(255,107,157,0.12)',
          border: `1px solid ${inkOnDark ? 'rgba(255,250,205,0.25)' : 'rgba(255,107,157,0.35)'}`,
          color: inkOnDark ? '#FFFACD' : 'var(--pink)', fontSize: 13,
          marginBottom: 24
        }}>
          <span style={{ fontWeight: 700, fontSize: "15px" }}>{greeting[0]}</span>
          <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'currentColor', opacity: 0.5 }} />
          <span style={{ color: headText, opacity: 0.92, fontSize: "15px" }} data-comment-anchor="1e9dcefc3a-span-733-11">{greeting[1]}</span>
        </div>

        <h1 className="display" style={{
          fontSize: 'clamp(40px, 6.5vw, 84px)', lineHeight: 1.05, margin: '0 0 20px',
          color: headText, textShadow: inkOnDark ? '0 6px 30px rgba(0,0,0,0.45)' : '0 6px 30px rgba(26,40,69,0.18)'
        }}>
          {lang === 'zh' ?
          <>
              <span style={{ color: '#FFC928', textShadow: '0 3px 0 rgba(26,40,69,0.18), 0 6px 16px rgba(247,201,72,0.35)' }}>家家</span>拥有一台望远镜，
              <br />
              <span style={{ color: '#FFC928', textShadow: '0 3px 0 rgba(26,40,69,0.18), 0 6px 16px rgba(247,201,72,0.35)' }}>一起</span>探索夜空的神秘 <span style={{ display: 'inline-block', animation: 'float 3s ease-in-out infinite' }}>🔭</span>
            </> :

          <>
              {t.headline1}<br />
              <span style={{ color: '#FFC928', textShadow: '0 3px 0 rgba(26,40,69,0.18), 0 6px 16px rgba(247,201,72,0.35)' }}>{t.headline2}</span> <span style={{ display: 'inline-block', animation: 'float 3s ease-in-out infinite' }}>🔭</span>
            </>
          }
        </h1>

        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginTop: 6, width: '100%' }}>
          <a href="#nav-workshop" className="pixel-cta" style={{
            padding: '15px 30px', borderRadius: 999,
            background: 'linear-gradient(135deg, var(--pink), var(--gold))',
            color: 'var(--navy-1)', fontWeight: 700,
            textDecoration: 'none', whiteSpace: 'nowrap',
            display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: "20px"
          }}>{t.cta}</a>
          <a href="#nav-story" className="pixel-cta" style={{
            padding: '15px 28px', borderRadius: 999,
            background: 'transparent',
            color: headText, fontWeight: 600,
            textDecoration: 'none', whiteSpace: 'nowrap',
            border: `1px solid ${inkOnDark ? 'rgba(255,250,205,0.35)' : 'var(--line-strong)'}`,
            display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: "20px"
          }}>{t.ctaSecondary}</a>
        </div>

        {/* Discovery tracker — Game Energy Bar */}
        {(() => {
          const total = objects.length;
          const done = found.size;
          const complete = done === total;
          return (
            <div style={{
              marginTop: 50, display: 'inline-flex', alignItems: 'center', gap: 14,
              padding: '12px 18px', borderRadius: 18,
              background: 'rgba(255,255,255,0.40)',
              border: '3px solid var(--gold)',
              backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
              boxShadow: '0 8px 0 rgba(247,201,72,0.16), 0 14px 28px rgba(26,40,69,0.12)',
              maxWidth: '92vw', flexWrap: 'wrap', justifyContent: 'center'
            }}>
              <span style={{ fontSize: 26, lineHeight: 1, animation: 'float 3s ease-in-out infinite' }}>🔭</span>

              <div style={{ display: 'flex', gap: 5 }}>
                {objects.map((o, i) => {
                  const got = found.has(o.id);
                  return (
                    <span key={o.id} style={{
                      width: 26, height: 26,
                      clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
                      background: got ? 'linear-gradient(180deg, var(--gold), #e0a92e)' : 'rgba(26,40,69,0.22)',
                      filter: got ? 'drop-shadow(0 0 5px rgba(247,201,72,0.8))' : 'none',
                      transform: got ? 'scale(1.1) rotate(0deg)' : 'scale(0.85)',
                      transition: 'all 0.35s cubic-bezier(0.34,1.56,0.64,1)'
                    }} />);

                })}
              </div>

              <span style={{
                fontWeight: 800, fontSize: 18, fontFamily: 'inherit', color: 'var(--navy-1)', whiteSpace: 'nowrap'
              }}>
                <span style={{ color: '#d99a1f' }}>{done}</span>/{total}
              </span>

              {complete &&
              <span style={{
                padding: '5px 12px', borderRadius: 999,
                background: 'linear-gradient(90deg, var(--gold), var(--pink))',
                color: 'var(--navy-1)', fontWeight: 800, fontSize: 13,
                whiteSpace: 'nowrap', animation: 'pulseGlow 2s ease-in-out infinite'
              }}>🎉 {lang === 'zh' ? '观星大师！' : lang === 'ms' ? 'Pakar Bintang!' : 'Star Master!'}</span>
              }
            </div>);

        })()}

        <div style={{ marginTop: 26, color: headTextMute, letterSpacing: '0.04em', fontSize: "15px", margin: "5px 0px 0px" }}>
          ↑ {t.tipSummon}
        </div>
      </div>

      {/* bottom wavy divider */}
      <div style={{ position: 'absolute', bottom: -1, left: 0, right: 0, lineHeight: 0 }} className="wave-divider">
        <svg viewBox="0 0 1200 100" preserveAspectRatio="none">
          <path d="M0,40 C300,90 600,0 900,50 C1050,75 1150,30 1200,55 L1200,100 L0,100 Z" fill="var(--navy-0)" />
        </svg>
      </div>
    </section>);

}

Object.assign(window, {
  LanguageModal, Header, Hero, StarsLayer, Meteors
});