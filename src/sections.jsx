/* sections.jsx — clean sections without duplicates */
const { useState: useStateS, useEffect: useEffectS, useMemo: useMemoS } = React;

// ===== Malaysia map — state bubbles from live Google Sheets data =====
function MalaysiaMap({ lang, salesData }) {
  const t = window.T[lang].map;
  const [hovered, setHovered] = useStateS(null);

  const liveBubbles = useMemoS(
    () => salesData ? window.buildStateBubbles(salesData.stateCount) : [],
    [salesData]
  );

  const fallbackBubbles = useMemoS(() => {
    const byState = {};
    (window.MY_CITIES || []).forEach((c) => {
      byState[c.state === 'KL' ? 'Kuala Lumpur' : c.state] =
      (byState[c.state === 'KL' ? 'Kuala Lumpur' : c.state] || 0) + c.sold;
    });
    return window.buildStateBubbles(byState);
  }, []);

  const bubbles = liveBubbles.length > 0 ? liveBubbles : fallbackBubbles;
  const isLive = liveBubbles.length > 0;
  const maxSold = Math.max(1, ...bubbles.map((b) => b.sold));
  const totalSold = bubbles.reduce((sum, b) => sum + b.sold, 0);
  const familiesWord = lang === 'zh' ? '台' : lang === 'ms' ? 'unit' : 'units';

  return (
    <section style={{ position: 'relative', background: 'var(--navy-1)', padding: "50px 28px" }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 50 }}>
          <div className="mono" style={{ letterSpacing: '0.3em', color: 'var(--gold-text)', marginBottom: 14, fontSize: "14px" }}>✦ {t.eyebrow}</div>
          <h2 className="display" style={{ lineHeight: 1.1, margin: '0 0 14px', fontSize: "38px" }}>{t.title}</h2>
          <p style={{ fontSize: 16, color: 'rgba(26,40,69,0.65)', maxWidth: 660, margin: '0 auto' }}>{t.sub}</p>
        </div>
        <div className="r-stack" style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 40, alignItems: 'start' }}>
          {/* ── Native SVG distribution map (no external embed) ── */}
          {/* ── Looker Studio embedded report (iframe renders ~square for a good map fit; wrapper crops the report's blank bottom) ── */}
          <div className="map-iframe-wrap" style={{ position: 'relative', aspectRatio: '4 / 3', borderRadius: 20, overflow: 'hidden', boxShadow: '0 20px 60px rgba(26,40,69,0.15)', background: '#fff' }}>
            <iframe
              width="600" height="450"
              src="https://lookerstudio.google.com/embed/reporting/81491214-49e4-46e6-ae3b-a10d06f766db"
              frameBorder="0"
              style={{ border: 0, position: 'absolute', top: 0, left: 0, width: '100%', height: '133.33%' }}
              allowFullScreen
              sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox">
            </iframe>
            <div className="mono" style={{
              position: 'absolute', top: 14, left: 14,
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '6px 12px', borderRadius: 999,
              background: 'rgba(13,27,46,0.55)', backdropFilter: 'blur(8px)',
              fontSize: 11, color: '#fff', letterSpacing: '0.05em', pointerEvents: 'none'
            }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: isLive ? '#4ade80' : '#fbbf24', boxShadow: `0 0 8px ${isLive ? '#4ade80' : '#fbbf24'}`, animation: 'pulseGlow 2s infinite' }}></span>
              {isLive ?
              lang === 'zh' ? '实时数据' : lang === 'ms' ? 'Data Langsung' : 'Live Data' :
              lang === 'zh' ? '离线数据' : lang === 'ms' ? 'Data Luar Talian' : 'Cached'}
            </div>
          </div>

          {/* Mobile fallback — iframe hidden on small screens */}
          <a className="map-mobile-link" href="https://datastudio.google.com/reporting/81491214-49e4-46e6-ae3b-a10d06f766db" target="_blank" rel="noopener noreferrer" style={{
            display: 'none', alignItems: 'center', justifyContent: 'center', gap: 10,
            padding: '18px 24px', borderRadius: 16,
            background: 'rgba(255,250,205,0.06)',
            border: '1px solid rgba(255,250,205,0.18)',
            color: 'rgba(255,250,205,0.85)', fontSize: 15, fontWeight: 600,
            textDecoration: 'none', textAlign: 'center'
          }}>
            🗺️ {lang === 'zh' ? '查看完整分布地图 ↗' : lang === 'ms' ? 'Lihat peta pengedaran penuh ↗' : 'View full distribution map ↗'}
          </a>

          {/* ── State ranking list ── */}
          <div>
            <div className="mono" style={{ letterSpacing: '0.15em', color: 'var(--cream-soft)', textTransform: 'uppercase', marginBottom: 4, fontSize: "14px" }}>
              {lang === 'zh' ? '各州销售' : lang === 'ms' ? 'Jualan Mengikut Negeri' : 'Sales by State'}
            </div>
            <div style={{ marginBottom: 18, color: "rgba(2, 8, 21, 0.55)", fontSize: "20px" }}>
              {'Total : '}{totalSold} {familiesWord} · {bubbles.length} {lang === 'zh' ? '个州属' : lang === 'ms' ? 'negeri' : 'states'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {bubbles.map((b) => {
                const pct = b.sold / maxSold * 100;
                const isHover = hovered === b.state;
                return (
                  <div key={b.state}
                  onMouseEnter={() => setHovered(b.state)}
                  onMouseLeave={() => setHovered(null)}
                  style={{ cursor: 'pointer', padding: '10px 14px', borderRadius: 12, background: isHover ? 'rgba(247,201,72,0.12)' : 'rgba(26,40,69,0.03)', border: `1px solid ${isHover ? 'var(--gold)' : 'var(--line)'}`, transition: 'all 0.18s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--cream)' }}>{b.label}</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--gold-text)' }}>{b.sold}</span>
                    </div>
                    <div style={{ height: 5, borderRadius: 3, background: 'rgba(26,40,69,0.08)', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', borderRadius: 3, background: isHover ? 'var(--gold)' : 'var(--pink)', transition: 'width 0.4s ease, background 0.2s' }}></div>
                    </div>
                  </div>);

              })}
            </div>
          </div>
        </div>
      </div>
    </section>);

}

// Gallery
const GALLERY_SETS = {
  sky: ['assets/gallery/sky/001.jpg', 'assets/gallery/sky/002.jpg', 'assets/gallery/sky/003.jpg', 'assets/gallery/sky/004.jpg'],
  building: ['assets/gallery/building/000.jpg', 'assets/gallery/building/001.jpg', 'assets/gallery/building/002.jpg', 'assets/gallery/building/003.jpg', 'assets/gallery/building/004.jpg', 'assets/gallery/building/005.jpg', 'assets/gallery/building/006.jpg', 'assets/gallery/building/007.jpg', 'assets/gallery/building/008.jpg', 'assets/gallery/building/009.jpg', 'assets/gallery/building/010.jpg', 'assets/gallery/building/011.jpg', 'assets/gallery/building/012.jpg', 'assets/gallery/building/013.jpg', 'assets/gallery/building/014.jpg', 'assets/gallery/building/015.jpg', 'assets/gallery/building/016.jpg', 'assets/gallery/building/017.jpg', 'assets/gallery/building/018.jpg', 'assets/gallery/building/019.jpg', 'assets/gallery/building/020.jpg', 'assets/gallery/building/021.jpg', 'assets/gallery/building/022.jpg', 'assets/gallery/building/023.jpg', 'assets/gallery/building/024.jpg', 'assets/gallery/building/025.jpg', 'assets/gallery/building/026.jpg', 'assets/gallery/building/027.jpg', 'assets/gallery/building/028.jpg', 'assets/gallery/building/029.jpg', 'assets/gallery/building/030.jpg', 'assets/gallery/building/031.jpg'],
  diy: ['assets/gallery/diy/001.jpg', 'assets/gallery/diy/002.jpg', 'assets/gallery/diy/003.jpg', 'assets/gallery/diy/004.png', 'assets/gallery/diy/005.png', 'assets/gallery/diy/006.png', 'assets/gallery/diy/007.png', 'assets/gallery/diy/008.jpg', 'assets/gallery/diy/009.jpg', 'assets/gallery/diy/010.jpg', 'assets/gallery/diy/011.jpg', 'assets/gallery/diy/012.jpg', 'assets/gallery/diy/013.jpg', 'assets/gallery/diy/014.jpg', 'assets/gallery/diy/015.jpg', 'assets/gallery/diy/016.jpg', 'assets/gallery/diy/017.jpg', 'assets/gallery/diy/018.jpg', 'assets/gallery/diy/019.jpg', 'assets/gallery/diy/020.jpg'],
  events: ['assets/gallery/events/001.jpg', 'assets/gallery/events/002.jpg', 'assets/gallery/events/003.jpg', 'assets/gallery/events/004.jpg', 'assets/gallery/events/005.jpg', 'assets/gallery/events/006.jpg', 'assets/gallery/events/009.jpg', 'assets/gallery/events/010.jpg', 'assets/gallery/events/011.jpg', 'assets/gallery/events/012.jpg', 'assets/gallery/events/013.jpg', 'assets/gallery/events/014.jpg', 'assets/gallery/events/015.jpg', 'assets/gallery/events/016.jpg', 'assets/gallery/events/017.jpg', 'assets/gallery/events/018.jpg', 'assets/gallery/events/019.jpg', 'assets/gallery/events/020.jpg', 'assets/gallery/events/021.jpg', 'assets/gallery/events/022.jpg', 'assets/gallery/events/023.jpg', 'assets/gallery/events/024.jpg', 'assets/gallery/events/025.jpg', 'assets/gallery/events/026.jpg', 'assets/gallery/events/027.jpg', 'assets/gallery/events/028.jpg', 'assets/gallery/events/029.jpg', 'assets/gallery/events/030.jpg', 'assets/gallery/events/031.jpg', 'assets/gallery/events/032.jpg', 'assets/gallery/events/033.jpg', 'assets/gallery/events/034.jpg', 'assets/gallery/events/035.jpg', 'assets/gallery/events/036.jpg', 'assets/gallery/events/037.jpg', 'assets/gallery/events/038.jpg', 'assets/gallery/events/039.jpg', 'assets/gallery/events/040.jpg', 'assets/gallery/events/041.jpg', 'assets/gallery/events/042.jpg', 'assets/gallery/events/043.jpg', 'assets/gallery/events/044.jpg', 'assets/gallery/events/045.jpg', 'assets/gallery/events/046.jpg', 'assets/gallery/events/049.jpg', 'assets/gallery/events/050.jpg', 'assets/gallery/events/051.jpg', 'assets/gallery/events/052.jpg', 'assets/gallery/events/053.jpg', 'assets/gallery/events/054.jpg', 'assets/gallery/events/055.jpg', 'assets/gallery/events/056.jpg', 'assets/gallery/events/057.jpg'],
  family: ['assets/gallery/family/001.jpg', 'assets/gallery/family/002.png', 'assets/gallery/family/003.png', 'assets/gallery/family/004.jpg', 'assets/gallery/family/005.jpg', 'assets/gallery/family/ChatGPT Image May 31, 2026, 01_20_40 AM.png'],
  observation: ['assets/gallery/observation/001.jpg', 'assets/gallery/observation/002.jpg', 'assets/gallery/observation/003.jpg', 'assets/gallery/observation/004.jpg', 'assets/gallery/observation/005.jpg', 'assets/gallery/observation/006.jpg', 'assets/gallery/observation/007.jpg', 'assets/gallery/observation/026.jpg', 'assets/gallery/observation/043.jpg', 'assets/gallery/observation/054.jpg', 'assets/gallery/observation/056.jpg', 'assets/gallery/observation/057.jpg']
};

function GallerySection({ lang }) {
  const t = window.T[lang].gallery;
  const [tab, setTab] = useStateS(0);
  const [lightboxIdx, setLightboxIdx] = useStateS(null);
  const items = useMemoS(() => {
    const { sky, building, diy, events, family, observation } = GALLERY_SETS;
    switch (tab) {
      case 1:return building;
      case 2:return sky;
      case 3:return diy;
      case 4:return family;
      case 5:return observation;
      case 6:return events;
      default:return [...sky, ...building, ...diy, ...family, ...observation, ...events];
    }
  }, [tab]);
  const goPrev = () => setLightboxIdx((i) => (i - 1 + items.length) % items.length);
  const goNext = () => setLightboxIdx((i) => (i + 1) % items.length);

  // Keyboard navigation for lightbox
  useEffectS(() => {
    if (lightboxIdx === null) return;
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') {e.preventDefault();goPrev();}
      if (e.key === 'ArrowRight') {e.preventDefault();goNext();}
      if (e.key === 'Escape') {setLightboxIdx(null);}
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxIdx]);

  // Touch swipe for lightbox
  const touchStartX = React.useRef(null);
  const onTouchStart = (e) => {touchStartX.current = e.touches[0].clientX;};
  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) {dx < 0 ? goNext() : goPrev();}
    touchStartX.current = null;
  };

  // Lock body scroll when lightbox is open
  useEffectS(() => {
    if (lightboxIdx !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {document.body.style.overflow = '';};
  }, [lightboxIdx]);

  return (
    <section style={{ position: 'relative', background: 'linear-gradient(180deg, var(--navy-1) 0%, var(--navy-0) 100%)', padding: "50px 28px" }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div className="mono" style={{ letterSpacing: '0.3em', color: 'var(--gold-text)', marginBottom: 14, fontSize: "14px" }}>✦ {t.eyebrow}</div>
          <h2 className="display" style={{ fontSize: 'clamp(30px, 4vw, 52px)', lineHeight: 1.1, margin: '0 0 14px' }}>{t.title}</h2>
          <p style={{ fontSize: 16, color: 'rgba(26,40,69,0.65)' }}>{t.sub}</p>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 36 }}>
          {t.tabs.map((tabLabel, i) =>
          <button key={i} onClick={() => setTab(i)} style={{ padding: '10px 18px', borderRadius: 999, border: `1px solid ${tab === i ? 'var(--gold)' : 'var(--line-strong)'}`, background: tab === i ? 'var(--gold)' : 'transparent', color: tab === i ? 'var(--navy-1)' : 'var(--cream)', fontWeight: 600, fontSize: 13, fontFamily: 'inherit', transition: 'all 0.2s', cursor: 'pointer' }}>{tabLabel}</button>
          )}
        </div>
        <div className="r-gallery" style={{ columnCount: 4, columnGap: 16, marginBottom: 36 }}>
          {items.map((src, i) =>
          <div key={src + i} style={{ breakInside: 'avoid', marginBottom: 16 }}>
              <button onClick={() => setLightboxIdx(i)} style={{ display: 'block', width: '100%', padding: 0, border: 'none', borderRadius: 12, overflow: 'hidden', cursor: 'zoom-in', background: 'var(--navy-2)', boxShadow: '0 6px 18px rgba(26,40,69,0.10)', transition: 'transform 0.25s ease' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                <img src={src} loading="lazy" alt="" style={{ display: 'block', width: '100%', height: 'auto' }} />
              </button>
            </div>
          )}
        </div>
        {lightboxIdx !== null &&
        ReactDOM.createPortal(
          <div onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} onClick={(e) => {if (e.target === e.currentTarget) setLightboxIdx(null);}} style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(12px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
            <button onClick={() => setLightboxIdx(null)} style={{ position: 'fixed', top: 16, right: 16, width: 48, height: 48, zIndex: 100000, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.15)', color: '#fff', cursor: 'pointer', fontSize: 22, display: 'grid', placeItems: 'center', padding: 0 }}>✕</button>
            {/* Photo counter */}
            <div style={{ position: 'fixed', top: 22, left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.7)', fontSize: 14, fontFamily: 'monospace', letterSpacing: '0.08em', zIndex: 100000, pointerEvents: 'none' }}>
              {lightboxIdx + 1} / {items.length}
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '60px 16px 80px' }}>
              <img src={items[lightboxIdx]} alt="" style={{ maxWidth: 'min(92vw, 1000px)', maxHeight: 'calc(100vh - 160px)', objectFit: 'contain', borderRadius: 10, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }} />
            </div>
            <button onClick={(e) => {e.stopPropagation();goPrev();}} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: 22, cursor: 'pointer', display: 'grid', placeItems: 'center', transition: 'background 0.2s', zIndex: 100001 }}>‹</button>
            <button onClick={(e) => {e.stopPropagation();goNext();}} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: 22, cursor: 'pointer', display: 'grid', placeItems: 'center', transition: 'background 0.2s', zIndex: 100001 }}>›</button>
          </div>,
          document.body)
        }
        <div style={{ marginTop: 36, textAlign: 'center' }}>
          <a href="#" className="pixel-cta" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 24px', borderRadius: 999, background: 'rgba(255,107,157,0.12)', border: '1px solid rgba(255,107,157,0.4)', color: 'var(--pink-light)', fontWeight: 600, fontSize: 15, textDecoration: 'none' }}>📷 {t.cta}</a>
        </div>
      </div>
    </section>);

}

// Spec — restructured: left product card + right specs/includes/see
function SpecSection({ lang }) {
  const t = window.T[lang].spec || {};
  const specs = t.specs || [];
  const includes = t.includes || [];
  const see = t.see || [];

  return (
    <section style={{ position: 'relative', background: 'var(--navy-0)', padding: '60px 28px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* Eyebrow + Title */}
        <div style={{ textAlign: 'center', marginBottom: 50 }}>
          <div className="mono" style={{ letterSpacing: '0.3em', color: 'var(--gold-text)', marginBottom: 14, fontSize: '14px' }}>✦ {t.eyebrow || '产品规格'}</div>
          <h2 className="display" style={{ fontSize: 'clamp(30px, 4vw, 52px)', lineHeight: 1.1, margin: '0 0 10px' }}>{t.title || 'Product Specifications'}</h2>
          <p style={{ fontSize: 16, color: 'var(--cream-soft)', margin: 0 }}>{t.sub || ''}</p>
        </div>

        {/* Two-column layout */}
        <div className="r-stack" style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 48, alignItems: 'start', lineHeight: "1", margin: "0px" }}>

          {/* ── LEFT: Product Card ── */}
          <div>
            {/* Image frame */}
            {(() => {
              const productImgs = ['src/assets/product-main.png', 'src/assets/product-alt1.png', 'src/assets/product-alt2.png', 'src/assets/product-alt3.png'];
              const [activeImg, setActiveImg] = React.useState(productImgs[0]);
              return (
                <>
                  <div style={{
                    borderRadius: 16,
                    border: '1px solid var(--line-strong)',
                    background: 'rgba(255,255,255,0.04)',
                    marginBottom: 12,
                    overflow: 'hidden',
                    aspectRatio: '4 / 3'
                  }}>
                    <img src={activeImg} alt="Star-Finder DIY Telescope" style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'opacity 0.3s ease'
                    }} />
                  </div>
                  {/* Thumbnail strip */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 24 }}>
                    {productImgs.map((src) =>
                    <button key={src} onClick={() => setActiveImg(src)} style={{
                      padding: 0,
                      border: activeImg === src ? '2px solid var(--gold)' : '1px solid var(--line-strong)',
                      borderRadius: 10,
                      background: activeImg === src ? 'rgba(247,201,72,0.08)' : 'rgba(255,255,255,0.04)',
                      cursor: 'pointer',
                      opacity: activeImg === src ? 1 : 0.6,
                      transition: 'all 0.2s',
                      aspectRatio: '4 / 3',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {if (activeImg !== src) e.currentTarget.style.opacity = '0.85';}}
                    onMouseLeave={(e) => {if (activeImg !== src) e.currentTarget.style.opacity = '0.6';}}>
                        <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </button>
                    )}
                  </div>
                </>);

            })()}

            {/* — What Can You See Together — (moved up under product) */}
            <div>
              <h3 className="display" style={{
                fontSize: 'clamp(18px, 2vw, 24px)',
                color: 'var(--gold-text)',
                margin: '0 0 6px',
                fontWeight: 700
              }}>
                {t.seeTitle || 'What Can You See Together?'}
              </h3>
              <div style={{ height: 2, background: 'linear-gradient(90deg, var(--gold), transparent)', marginBottom: 20, borderRadius: 2 }} />

              <div className="r-2col" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 14 }}>
                {see.map((item, i) =>
                <div key={i} style={{
                  padding: '20px 16px',
                  borderRadius: 14,
                  border: '1px solid var(--line-strong)',
                  background: 'rgba(255,255,255,0.04)',
                  textAlign: 'center',
                  transition: 'border-color 0.2s, background 0.2s', lineHeight: "1"
                }}
                onMouseEnter={(e) => {e.currentTarget.style.borderColor = 'var(--gold)';e.currentTarget.style.background = 'rgba(247,201,72,0.06)';}}
                onMouseLeave={(e) => {e.currentTarget.style.borderColor = 'var(--line-strong)';e.currentTarget.style.background = 'rgba(255,255,255,0.04)';}}>
                    <div style={{ fontSize: 32, marginBottom: 10 }}>{item.emoji}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--cream)', lineHeight: 1.35 }}>{item.label}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── RIGHT: Specs + Includes + See ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 40, width: '100%', lineHeight: "0.5" }}>

            {/* Product name (moved above Technical Specifications) */}
            <h3 className="display" style={{
              fontSize: 28,
              width: '100%',
              whiteSpace: 'nowrap',
              margin: '0 0 12px',
              color: 'var(--cream)',
              fontWeight: 800,
              lineHeight: 1.05
            }}>
              {t.productName || 'Star-Finder DIY Telescope'}
            </h3>

            {/* — Technical Specifications — */}
            <div style={{ width: "100%", textAlign: "left" }}>
              <h3 className="display" style={{
                fontSize: 'clamp(18px, 2vw, 24px)',
                color: 'var(--gold-text)',
                margin: '0 0 6px',
                fontWeight: 700
              }}>
                {t.specTitle || 'Technical Specifications'}
              </h3>
              <div style={{ height: 2, background: 'linear-gradient(90deg, var(--gold), transparent)', marginBottom: 20, borderRadius: 2 }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {specs.map((spec, i) =>
                <div key={i} style={{
                  display: 'grid',
                  gridTemplateColumns: '28px 1fr auto',
                  gap: 10,
                  alignItems: 'center',

                  borderBottom: i < specs.length - 1 ? '1px solid var(--line)' : 'none', lineHeight: "1", padding: "5px 0px", height: "40px"
                }}>
                    <span style={{ fontSize: 16, textAlign: 'center', opacity: 0.85 }}>{spec.icon || '•'}</span>
                    <span style={{ fontSize: 15, color: 'var(--cream)', fontWeight: 500 }}>{spec.k}</span>
                    <span style={{ fontSize: 15, color: 'var(--cream)', fontWeight: 700, textAlign: 'right' }}>{spec.v}</span>
                  </div>
                )}
              </div>
            </div>

            {/* — Package Includes — */}
            <div>
              <h3 className="display" style={{
                fontSize: 'clamp(18px, 2vw, 24px)',
                color: 'var(--gold-text)',
                margin: '0 0 6px',
                fontWeight: 700, width: "100%", height: "24px"
              }}>
                {t.includesTitle || 'Package Includes'}
              </h3>
              <div style={{ height: 2, background: 'linear-gradient(90deg, var(--gold), transparent)', marginBottom: 20, borderRadius: 2 }} />

              <div style={{
                padding: '22px 24px',
                borderRadius: 14,
                background: 'linear-gradient(135deg, rgba(247,201,72,0.05) 0%, rgba(45,167,215,0.03) 100%)',
                border: '1px solid var(--line)'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
                  {includes.map((item, i) =>
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{
                      width: 22, height: 22, borderRadius: 6,
                      background: 'rgba(247,201,72,0.15)',
                      display: 'grid', placeItems: 'center',
                      fontSize: 13, color: 'var(--gold)', fontWeight: 700, flexShrink: 0
                    }}>✓</span>
                      <span style={{ fontSize: 15, color: 'var(--cream)', fontWeight: 600 }}>{item}</span>
                    </div>
                  )}
                  <p style={{
                    margin: '8px 0 0',
                    fontSize: 13,
                    fontStyle: 'italic',
                    color: 'var(--cream-soft)',
                    opacity: 0.75
                  }}>
                    {lang === 'zh' ? '*三脚架，不包括' :
                    lang === 'ms' ? '*Tripod tidak termasuk' :
                    '*Tripod not included'}
                  </p>
                </div>
              </div>
            </div>

            {/* Tagline + CTA + Sessions — grouped to avoid parent gap: 40 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <p style={{
                margin: 0,

                color: 'var(--gold-text)',
                fontWeight: 600, fontSize: "16px", height: "15px"
              }}>
                {t.tagline || 'Build Together, Explore Together'}
              </p>

              {/* Workshop CTA — build & take one home at a session */}
              <a href="#nav-workshop" className="pixel-cta" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',

                padding: '16px 28px',
                borderRadius: 14,
                background: 'linear-gradient(135deg, var(--pink), var(--gold))',
                color: 'var(--navy-1)',


                textDecoration: 'none',
                boxShadow: '0 8px 28px rgba(255,107,157,0.32)',
                transition: 'transform 0.2s, box-shadow 0.2s', gap: "8px", fontWeight: "700", lineHeight: "0", fontSize: "16px"
              }}
              onMouseEnter={(e) => {e.currentTarget.style.transform = 'translateY(-2px)';e.currentTarget.style.boxShadow = '0 12px 36px rgba(255,107,157,0.42)';}}
              onMouseLeave={(e) => {e.currentTarget.style.transform = 'translateY(0)';e.currentTarget.style.boxShadow = '0 8px 28px rgba(255,107,157,0.32)';}}>
                {t.buyLabel || '📅 Join a workshop to build yours'}
              </a>

              <UpcomingSessionsTeaser lang={lang} />
            </div>

          </div>
        </div>
      </div>
    </section>);

}

// ===== Upcoming Sessions Teaser (below CTA button in SpecSection) =====
function UpcomingSessionsTeaser({ lang }) {
  const [sessions, setSessions] = useStateS([]);
  const [loaded, setLoaded] = useStateS(false);

  useEffectS(() => {
    const parse = window.parseCSV;
    if (!parse || !window.buildSessions || !window.scheduleCSV) return;
    Promise.all([
    fetch(window.scheduleCSV()).then((r) => r.text()),
    fetch(window.signupCSV()).then((r) => r.text()).catch(() => '')]
    ).then(([sCsv, rCsv]) => {
      const s = window.buildSessions(parse(sCsv), rCsv ? parse(rCsv) : []);
      setSessions(s.slice(0, 2));
      setLoaded(true);
    }).catch(() => setLoaded(true));
  }, []);

  if (!loaded || sessions.length === 0) return null;

  const seatsLabel = (n) => lang === 'zh' ? `剩 ${n} 位` : lang === 'ms' ? `${n} tempat lagi` : `${n} seats left`;
  const fullLabel = lang === 'zh' ? '名额已满' : lang === 'ms' ? 'Penuh' : 'Full';

  return (
    <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8, lineHeight: "1" }}>
      {sessions.map((s) => {
        const open = s.left > 0;
        const dateStr = window.fmtFullDate ? window.fmtFullDate(s.iso, lang) : s.iso;
        const dateLabel = lang === 'zh' ? '日期' : lang === 'ms' ? 'Tarikh' : 'Date';
        return (
          <div key={s.iso} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16, fontSize: "15px" }}>
            <span style={{ fontWeight: 400, fontSize: "15px", color: "rgb(133, 133, 133)" }}>
              <span style={{ fontWeight: 600, color: "rgb(133, 133, 133)" }}>{dateLabel} :</span>  {dateStr}
            </span>
            <span style={{ ...{ color: open ? '#444' : '#999', fontWeight: 400, flexShrink: 0, fontSize: "15px" }, color: "rgb(133, 133, 133)" }}>
              {open ? seatsLabel(s.left) : fullLabel}
            </span>
          </div>);

      })}
    </div>);

}

// Stubs
function StatsSection() {return null;}
function FormSection() {return null;}

// ===== Section 4: Story / "Why we built this telescope" =====
const STORY_PHOTOS = [
'uploads/backyard.png',
'uploads/Family-d4d788f6.jpg',
'uploads/family_buiding-35317de3.png'];


function StorySection({ lang }) {
  const t = window.T[lang]?.story || {};
  const [active, setActive] = useStateS(0);
  const [paused, setPaused] = useStateS(false);
  const timerRef = React.useRef(null);

  // Auto-advance every 4s unless paused
  useEffectS(() => {
    if (paused) return;
    timerRef.current = setInterval(() => {
      setActive((i) => (i + 1) % STORY_PHOTOS.length);
    }, 4000);
    return () => clearInterval(timerRef.current);
  }, [paused]);

  const goTo = (idx) => {
    setActive(idx);
    setPaused(true);
    clearInterval(timerRef.current);
    // resume after 8s of inactivity
    timerRef.current = setTimeout(() => setPaused(false), 8000);
  };

  const prev = () => goTo((active - 1 + STORY_PHOTOS.length) % STORY_PHOTOS.length);
  const next = () => goTo((active + 1) % STORY_PHOTOS.length);

  // Touch swipe for story carousel
  const storyTouchX = React.useRef(null);
  const onStoryTouchStart = (e) => {storyTouchX.current = e.touches[0].clientX;};
  const onStoryTouchEnd = (e) => {
    if (storyTouchX.current === null) return;
    const dx = e.changedTouches[0].clientX - storyTouchX.current;
    if (Math.abs(dx) > 40) {dx < 0 ? next() : prev();}
    storyTouchX.current = null;
  };

  return (
    <section style={{
      position: 'relative',
      background: 'var(--navy-1)',
      padding: 'clamp(48px, 8vw, 72px) clamp(16px, 3vw, 28px)',
      borderTop: '1px solid var(--line)',
      overflow: 'hidden'
    }}>

      {/* Subtle stars */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {[
        { top: '6%', left: '52%', size: 2, gold: true },
        { top: '14%', left: '96%', size: 2, gold: false },
        { top: '40%', left: '98%', size: 3, gold: true },
        { top: '80%', left: '97%', size: 2, gold: false },
        { top: '90%', left: '55%', size: 2, gold: true }].
        map((s, i) =>
        <div key={i} style={{
          position: 'absolute', top: s.top, left: s.left,
          width: s.size, height: s.size, borderRadius: '50%',
          background: s.gold ? 'var(--gold)' : 'var(--blue-1)',
          opacity: 0.3,
          animation: `twinkle ${2.5 + i * 0.5}s ease-in-out ${i * 0.4}s infinite`
        }} />
        )}
      </div>

      <div className="r-stack" style={{
        maxWidth: 1160,
        margin: '0 auto',
        position: 'relative',
        zIndex: 1,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 'clamp(32px, 5vw, 72px)',
        alignItems: 'center'
      }}>

        {/* ── LEFT: Photo Carousel ── */}
        <div className="story-photo" style={{ position: 'relative' }}>

          {/* 5:4 frame */}
          <div onTouchStart={onStoryTouchStart} onTouchEnd={onStoryTouchEnd} style={{
            position: 'relative',
            aspectRatio: '4 / 5',
            borderRadius: 20,
            overflow: 'hidden',
            boxShadow: '0 24px 64px rgba(0,0,0,0.45)',
            background: 'var(--navy-2)'
          }}>
            {STORY_PHOTOS.map((src, i) =>
            <img
              key={src}
              src={src}
              alt=""
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
                opacity: i === active ? 1 : 0,
                transition: 'opacity 0.75s cubic-bezier(0.4,0,0.2,1)',
                pointerEvents: 'none',
                userSelect: 'none'
              }} />

            )}

            {/* Gradient overlay at bottom */}
            <div style={{
              position: 'absolute',
              bottom: 0, left: 0, right: 0,
              height: '40%',
              background: 'linear-gradient(to top, rgba(13,27,46,0.72) 0%, transparent 100%)',
              pointerEvents: 'none'
            }} />

            {/* Prev / Next arrows */}
            {[
            { dir: 'prev', label: '‹', action: prev, side: { left: 14 } },
            { dir: 'next', label: '›', action: next, side: { right: 14 } }].
            map(({ dir, label, action, side }) =>
            <button key={dir} onClick={action} aria-label={dir} style={{
              position: 'absolute',
              top: '50%',
              transform: 'translateY(-50%)',
              ...side,
              width: 40, height: 40,
              borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.28)',
              background: 'rgba(13,27,46,0.55)',
              backdropFilter: 'blur(8px)',
              color: '#fff',
              fontSize: 22,
              cursor: 'pointer',
              display: 'grid',
              placeItems: 'center',
              padding: 0,
              transition: 'background 0.2s, border-color 0.2s',
              lineHeight: 1
            }}
            onMouseEnter={(e) => {e.currentTarget.style.background = 'rgba(247,201,72,0.28)';e.currentTarget.style.borderColor = 'rgba(247,201,72,0.6)';}}
            onMouseLeave={(e) => {e.currentTarget.style.background = 'rgba(13,27,46,0.55)';e.currentTarget.style.borderColor = 'rgba(255,255,255,0.28)';}}>
                {label}
              </button>
            )}

            {/* Caption on photo */}
            <div style={{
              position: 'absolute',
              bottom: 36,
              left: 20,
              right: 20,
              pointerEvents: 'none',
              zIndex: 2
            }}>
              <p style={{
                margin: 0,
                fontSize: 14,
                fontWeight: 600,
                color: 'var(--gold)',
                fontStyle: 'italic',
                lineHeight: 1.4,
                textShadow: '0 1px 6px rgba(0,0,0,0.6)',
                transition: 'opacity 0.5s ease'
              }}>
                {t.captions && t.captions[active] || ''}
              </p>
            </div>

            {/* Dot indicators */}
            <div style={{
              position: 'absolute',
              bottom: 14,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: 8
            }}>
              {STORY_PHOTOS.map((_, i) =>
              <button key={i} onClick={() => goTo(i)} aria-label={`Photo ${i + 1}`} style={{
                width: i === active ? 22 : 8,
                height: 8,
                borderRadius: 999,
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                background: i === active ? 'var(--gold)' : 'rgba(255,255,255,0.4)',
                transition: 'width 0.35s ease, background 0.25s ease'
              }} />
              )}
            </div>
          </div>

          {/* Photo counter below */}
          <div className="mono" style={{
            marginTop: 12,
            fontSize: 12,
            color: 'rgba(255,250,205,0.35)',
            letterSpacing: '0.12em',
            textAlign: 'center'
          }}>
            {String(active + 1).padStart(2, '0')} / {String(STORY_PHOTOS.length).padStart(2, '0')}
          </div>
        </div>

        {/* ── RIGHT: Text content ── */}
        <div className="story-text">

          {/* Eyebrow */}
          <div className="mono" style={{
            letterSpacing: '0.3em',
            color: 'var(--gold-text)',
            fontSize: 13,
            marginBottom: 18,
            textTransform: 'uppercase'
          }}>
            ✦ {t.eyebrow || '我们的初心'}
          </div>

          {/* Title */}
          <h2 className="display" style={{
            fontSize: 'clamp(24px, 3.2vw, 44px)',
            lineHeight: 1.15,
            margin: '0 0 32px',
            color: 'var(--cream)',
            textWrap: 'pretty'
          }}>
            {t.title || '为什么我们创造这台望远镜？'}
          </h2>

          {/* Body paragraphs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {[t.p1, t.p2, t.p3, t.p4].filter(Boolean).map((para, i) =>
            <p key={i} style={{
              margin: 0,
              fontSize: 'clamp(14px, 1.3vw, 17px)',
              lineHeight: 1.85,
              color: 'var(--cream-soft)',
              textWrap: 'pretty'
            }}>
                {para}
              </p>
            )}
          </div>

          {/* Pull quote */}
          {t.quote &&
          <div style={{
            margin: '32px 0 0',
            padding: '20px 24px',
            borderLeft: '4px solid var(--pink)',
            background: 'rgba(255,107,157,0.06)',
            borderRadius: '0 12px 12px 0'
          }}>
              <p style={{
              margin: 0,
              fontSize: 'clamp(14px, 1.4vw, 17px)',
              fontWeight: 700,
              color: 'var(--pink)',
              lineHeight: 1.6,
              fontStyle: 'italic'
            }}>
                {t.quote}
              </p>
            </div>
          }

          {/* Tagline + CTA */}
          <div style={{ marginTop: 36 }}>
            <div style={{
              fontSize: 'clamp(14px, 1.4vw, 17px)',
              fontWeight: 700,
              color: 'var(--pink)',
              marginBottom: 22
            }}>
              {lang === 'zh' ? '让每个家庭都能一起仰望星空 ✨' :
              lang === 'ms' ? 'Biar setiap keluarga boleh menatap langit bersama ✨' :
              'Let every family look up at the stars together ✨'}
            </div>
            <a href="#nav-register" className="pixel-cta" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '13px 26px',
              borderRadius: 999,
              background: 'var(--pink)',
              color: '#fff',
              fontWeight: 700,
              fontSize: 15,
              textDecoration: 'none',
              boxShadow: '0 6px 24px rgba(255,107,157,0.32)',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseEnter={(e) => {e.currentTarget.style.transform = 'translateY(-2px)';e.currentTarget.style.boxShadow = '0 10px 32px rgba(255,107,157,0.42)';}}
            onMouseLeave={(e) => {e.currentTarget.style.transform = 'translateY(0)';e.currentTarget.style.boxShadow = '0 6px 24px rgba(255,107,157,0.32)';}}>
              {t.cta || '一起成为故事的一部分 →'}
            </a>
          </div>

        </div>
      </div>
    </section>);

}

function Footer({ lang }) {
  const t = window.T?.[lang]?.footer || {};
  const links = t.links || ['About', 'Facebook', 'Instagram', 'MOAA', 'Contact'];
  const [logoLightboxOpen, setLogoLightboxOpen] = useStateS(false);

  const stars = useMemoS(() => Array.from({ length: 38 }, (_, i) => ({
    left: (i * 37 + 11) % 100,
    top: (i * 53 + 19) % 100,
    size: 1 + i % 3 * 0.6,
    gold: i % 5 === 0,
    dur: 2.5 + i % 3,
    delay: i * 0.37 % 3
  })), []);

  return (
    <footer className="rocket-cursor" style={{
      background: 'linear-gradient(180deg, #0d1b2e 0%, #06101c 100%)',
      color: '#FFFACD',
      padding: 'clamp(56px, 7vw, 96px) 28px 44px',
      position: 'relative',
      overflow: 'hidden',
      borderTop: '1px solid rgba(255,250,205,0.07)'
    }} data-comment-anchor="1561df1058-footer-176-27">

      {/* Star field */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {stars.map((s, i) =>
        <div key={i} style={{
          position: 'absolute',
          left: `${s.left}%`, top: `${s.top}%`,
          width: s.size, height: s.size,
          borderRadius: '50%',
          background: s.gold ? '#F7C948' : '#FFFACD',
          opacity: 0.28,
          animation: `twinkle ${s.dur}s ease-in-out ${s.delay}s infinite`
        }} />
        )}
      </div>

      {(() => {
        const tagBig = lang === 'zh' ? '家家拥有\n一台望远镜。' : lang === 'ms' ? 'SEBUAH TELESKOP\nDI SETIAP RUMAH.' : 'A TELESCOPE\nIN EVERY HOME.';
        const societyLabel = lang === 'zh' ? '学会' : lang === 'ms' ? 'Persatuan' : 'Society';
        const connectLabel = lang === 'zh' ? '连接' : lang === 'ms' ? 'Hubungi' : 'Connect';
        const Arrow = () => <span aria-hidden="true" className="mono" style={{ fontSize: '0.78em', color: '#F7C948', marginLeft: 5, verticalAlign: 'top' }}>↗</span>;
        const FootLink = ({ label, href, ext, mail }) =>
        <a href={href} target={mail ? undefined : '_blank'} rel="noopener noreferrer" style={{
          color: 'rgba(255,250,205,0.58)', textDecoration: 'none', fontSize: 15.5,
          display: 'inline-flex', alignItems: 'baseline', width: 'fit-content', transition: 'color 0.18s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = '#FFFACD'}
        onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,250,205,0.58)'}>
            {label}{ext && <Arrow />}
          </a>;
        const ColHead = ({ children }) =>
        <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', color: 'rgba(255,250,205,0.92)', marginBottom: 20 }}>{children}</div>;
        const SocialLink = ({ label, href, Icon }) =>
        <a href={href} target="_blank" rel="noopener noreferrer" style={{
          color: 'rgba(255,250,205,0.58)', textDecoration: 'none', fontSize: 15.5,
          display: 'inline-flex', alignItems: 'center', gap: 10, width: 'fit-content', transition: 'color 0.18s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = '#FFFACD'}
        onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,250,205,0.58)'}>
            <span style={{
            width: 30, height: 30, borderRadius: 8, flexShrink: 0,
            background: 'rgba(255,250,205,0.07)', border: '1px solid rgba(255,250,205,0.13)',
            display: 'grid', placeItems: 'center'
          }}>
              <Icon size={16} color="#F7C948" />
            </span>
            {label}<Arrow />
          </a>;

        return (
          <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative', zIndex: 1 }}>

          {/* Top grid: logo + tagline | link columns */}
          <div className="r-footer" style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0,1.7fr) 1fr 1fr',
              gap: '48px 56px',
              alignItems: 'start',
              paddingTop: 16
            }}>

            {/* Brand col: logo mark on top, big tagline below */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
                <button onClick={() => setLogoLightboxOpen(true)} style={{
                    background: 'none', border: 'none', padding: 0, cursor: 'zoom-in',
                    width: 84, height: 84, display: 'grid', placeItems: 'center', flexShrink: 0
                  }} aria-label="View Star-Finder logo">
                  <img src="assets/logo.png" alt="Star-Finder" style={{
                      width: 84, height: 84, objectFit: 'contain',
                      filter: 'drop-shadow(0 0 18px rgba(247,201,72,0.40))',
                      transition: 'transform 0.2s, filter 0.2s'
                    }}
                    onMouseEnter={(e) => {e.currentTarget.style.transform = 'scale(1.06)';e.currentTarget.style.filter = 'drop-shadow(0 0 24px rgba(247,201,72,0.62))';}}
                    onMouseLeave={(e) => {e.currentTarget.style.transform = 'scale(1)';e.currentTarget.style.filter = 'drop-shadow(0 0 18px rgba(247,201,72,0.40))';}} />
                </button>
                <div>
                  <div className="display" style={{ fontSize: 15, fontWeight: 800, color: 'rgba(239,233,180,0.95)', lineHeight: 1.15 }}>
                    Star-Finder Astronomical Society
                  </div>
                  <div className="mono" style={{ fontSize: 14, color: 'rgba(250,224,0,0.82)', letterSpacing: '0.13em', marginTop: 3 }}>
                    寻星天文学会
                  </div>
                </div>
              </div>

              {/* Big tagline below the logo */}
              <h2 className="display" style={{
                  margin: 0,
                  fontSize: 'clamp(28px, 3.1vw, 48px)',
                  lineHeight: 1.04,
                  letterSpacing: lang === 'zh' ? '0.01em' : '-0.01em',
                  color: 'rgba(255,250,205,0.34)',
                  whiteSpace: 'pre-line',
                  textWrap: 'balance'
                }}>
                {tagBig}
              </h2>
            </div>

            {/* Society col */}
            <div>
              <ColHead>{societyLabel}</ColHead>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <FootLink label={links[0] || 'About'} href="https://www.starfinder.org.my/" ext />
                <FootLink label="MOAA Portal" href="https://moaa.starfinder.org.my/" ext />
                <FootLink label={links[4] || 'Contact'} href="mailto:info@starfinder.org.my" mail />
              </div>
            </div>

            {/* Connect col */}
            <div>
              <ColHead>{connectLabel}</ColHead>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <SocialLink label="Facebook" href="https://www.facebook.com/mystarfinder?mibextid=ZbWKwL" Icon={window.FacebookIcon} />
                <SocialLink label="Instagram" href="https://www.instagram.com/starfinder_astronomical/" Icon={window.InstagramIcon} />
              </div>
            </div>
          </div>

          {/* Bottom row: meta */}
          <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
              flexWrap: 'wrap', gap: 'clamp(20px, 3vw, 48px)', marginTop: 'clamp(48px, 7vw, 96px)'
            }}>
            <div style={{ fontSize: 13.5, color: 'rgba(255,250,205,0.42)', letterSpacing: '0.02em' }}>
              Malaysia
            </div>
            <div style={{ fontSize: 13.5, color: 'rgba(255,250,205,0.42)' }}>
              {t.rights || '© 2025 Star-Finder Astronomical Society'}
            </div>
          </div>
        </div>);
      })()}

      {/* Logo lightbox modal */}
      {logoLightboxOpen && ReactDOM.createPortal(
        <div onClick={() => setLogoLightboxOpen(false)} style={{
          position: 'fixed', inset: 0, zIndex: 99999,
          background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(12px)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '20px'
        }}>
          <button onClick={() => setLogoLightboxOpen(false)} style={{
            position: 'fixed', top: 16, right: 16,
            width: 48, height: 48, zIndex: 100000,
            borderRadius: '50%', border: '1px solid rgba(255,255,255,0.3)',
            background: 'rgba(255,255,255,0.15)', color: '#fff',
            cursor: 'pointer', fontSize: 22,
            display: 'grid', placeItems: 'center', padding: 0
          }}>✕</button>
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center',
            justifyContent: 'center', width: '100%'
          }}>
            <img src="assets/logo.png" alt="Star-Finder Logo" style={{
              maxWidth: 'min(90vw, 600px)', maxHeight: '85vh',
              objectFit: 'contain', borderRadius: 14,
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
            }} onClick={(e) => e.stopPropagation()} />
          </div>
        </div>,
        document.body
      )}
    </footer>);

}

Object.assign(window, { MalaysiaMap, GallerySection, SpecSection, StatsSection, StorySection, FormSection, Footer });