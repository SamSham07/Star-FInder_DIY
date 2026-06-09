/* tonight.jsx — "What you can see tonight" list, below the hero.
   Real-time visibility for each celestial object, computed for Malaysia. */

const { useState: useStateTN, useEffect: useEffectTN, useMemo: useMemoTN } = React;

function TonightSky({ lang }) {
  // re-tick every minute so times / altitudes stay live
  const [tick, setTick] = useStateTN(0);
  useEffectTN(() => {
    const id = setInterval(() => setTick((n) => n + 1), 60000);
    return () => clearInterval(id);
  }, []);

  const copy = {
    eyebrow: { zh: '今晚的星空', en: "Tonight's sky", ms: 'Langit malam ini' },
    title:   { zh: '今晚可以看到什么', en: 'What you can see tonight', ms: 'Apa yang boleh dilihat malam ini' },
    sub:     { zh: '吉隆坡实时星象 · 更新于 ', en: 'Live for Kuala Lumpur · updated ', ms: 'Langsung untuk Kuala Lumpur · dikemas kini ' },
    highest: { zh: '最高 ', en: 'highest ', ms: 'paling tinggi ' },
    allNight:{ zh: '整夜可见', en: 'Up all night', ms: 'Sepanjang malam' },
    below:   { zh: '今晚在地平线下', en: 'Below the horizon tonight', ms: 'Di bawah ufuk malam ini' },
    belowShort: { zh: '今晚不可见', en: 'Not up tonight', ms: 'Tiada malam ini' },
    nowUp:   { zh: '现在', en: 'now', ms: 'kini' },
  };
  // short labels for the caption strip so nothing truncates
  const SHORT = {
    andromeda: { en: 'Andromeda', zh: '仙女座', ms: 'Andromeda' },
    m42:       { en: 'Orion Nebula', zh: 'M42 星云', ms: 'Nebula Orion' },
    lagoon:    { en: 'Lagoon Nebula', zh: 'M8 礁湖星云', ms: 'Nebula Lagoon' },
    orion:     { en: "Orion's Belt", zh: '猎户腰带', ms: 'Tali Orion' },
  };
  const L = (m) => m[lang] || m.en;

  const rows = useMemoTN(() => {
    const list = (window.CELESTIAL || []).map((obj) => {
      const d = window.getViewingData ? window.getViewingData(obj.id) : null;
      return { obj, d };
    }).filter((r) => r.d);
    // order: up now → visible/all-night (by rise time) → below horizon
    const rank = (r) => {
      if (r.d.visibleNow) return 0;
      if (r.d.status === 'not-visible') return 3;
      return 1;
    };
    return list.sort((a, b) => {
      const ra = rank(a), rb = rank(b);
      if (ra !== rb) return ra - rb;
      return (a.d.appears || '99:99').localeCompare(b.d.appears || '99:99');
    });
  }, [lang, tick]);

  const nowStr = rows[0] && rows[0].d ? rows[0].d.now : '';

  return (
    <section style={{
      position: 'relative', background: 'var(--navy-0)',
      padding: '18px 28px 32px', borderTop: '1px solid var(--line)',
    }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <div style={{
          display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: '6px 12px',
          marginBottom: 12,
        }}>
          <span style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '0.14em',
            color: 'var(--gold-text)', textTransform: 'uppercase',
          }}>
            ✦ {L(copy.title)}
          </span>
          <span className="mono" style={{ fontSize: 11, color: 'var(--ink-mute)' }}>
            {L(copy.sub)}{nowStr}
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(212px, 1fr))',
          gap: '0 24px',
        }}>
          {rows.map(({ obj, d }) => {
            const name = (SHORT[obj.id] && (SHORT[obj.id][lang] || SHORT[obj.id].en)) || obj[lang]?.name || obj.en?.name || obj.id;
            const dim = d.status === 'not-visible';
            return (
              <div key={obj.id} style={{
                display: 'flex', alignItems: 'center', gap: 9,
                padding: '8px 0', minWidth: 0,
                borderBottom: '1px solid var(--line)',
                opacity: dim ? 0.5 : 1,
              }}>
                <span style={{ fontSize: 15, width: 19, textAlign: 'center', flexShrink: 0, filter: dim ? 'grayscale(0.6)' : 'none' }}>{obj.emoji}</span>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--cream)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0, flexShrink: 1 }}>{name}</span>
                <span className="mono" style={{
                  fontSize: 11, fontWeight: 600, flexShrink: 0, marginLeft: 8,
                  display: 'flex', alignItems: 'center', gap: 5,
                  color: dim ? 'var(--ink-mute)' : 'var(--cream-soft)',
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {d.status === 'not-visible' ? (
                    <span style={{ fontWeight: 500 }}>↓ {L(copy.belowShort)}</span>
                  ) : d.visibleNow ? (
                    <React.Fragment>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#15915f', boxShadow: '0 0 5px rgba(21,145,95,0.6)', flexShrink: 0 }} />
                      <span style={{ color: '#15915f' }}>{L(copy.nowUp)} {d.altNow}°</span>
                    </React.Fragment>
                  ) : d.status === 'all-night' ? (
                    <span>{L(copy.allNight)}</span>
                  ) : (
                    <span>{d.appears}<span style={{ color: 'var(--ink-mute)', margin: '0 2px' }}>–</span>{d.gone}</span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { TonightSky });
