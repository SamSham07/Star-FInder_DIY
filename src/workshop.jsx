/* workshop.jsx — DIY Workshop: reads CSV directly (CORS-safe), writes via Apps Script no-cors POST */

const { useState: useStateW, useEffect: useEffectW } = React;

const WS_SHEET_ID  = '1D5z5qnsotUl_YpUbRdyzbjci0kBzXYAhfZw_enjdFC4';
const SIGNUP_API   = 'https://script.google.com/macros/s/AKfycbwhVGWBkI7hGk9B6g_GzG5tmOSxcrAaHC-nJf7udt7CSMjxsDq2wvDBsRRVk8WbJu15/exec';
const DEFAULT_CAPACITY = 30;

const scheduleCSV = () => `https://docs.google.com/spreadsheets/d/${WS_SHEET_ID}/gviz/tq?tqx=out:csv&sheet=DIY-Workshop%20Schedule`;
const signupCSV   = () => `https://docs.google.com/spreadsheets/d/${WS_SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Sign-up%20list%20from%20website`;

/* ── date helpers ── */
function wsParse(v) {
  if (v instanceof Date && !isNaN(v)) return v;
  if (typeof v === 'string' && v.trim()) {
    const s = v.trim();
    const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (m) return new Date(parseInt(m[3]), parseInt(m[2]) - 1, parseInt(m[1]));
    const d = new Date(s); if (!isNaN(d)) return d;
  }
  return null;
}
function isoDay(v) {
  const d = wsParse(v); if (!d) return null;
  return d.getFullYear() + '-' + ('0' + (d.getMonth()+1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
}
function fmtDay(iso)       { try { return new Date(iso + 'T12:00:00').getDate(); }  catch(e) { return '--'; } }
function fmtFullDate(iso, lang) {
  try {
    const d = new Date(iso + 'T12:00:00');
    const locale = lang==='zh' ? 'zh-CN' : lang==='ms' ? 'ms-MY' : 'en-GB';
    return d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
  } catch(e) { return iso; }
}
function fmtMonYear(iso, lang) {
  try {
    const d = new Date(iso + 'T12:00:00');
    const locale = lang==='zh' ? 'zh-CN' : lang==='ms' ? 'ms-MY' : 'en-GB';
    return d.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
  } catch(e) { return ''; }
}

/* ── process rows from CSV ── */
function buildSessions(schedRows, signRows) {
  if (!schedRows.length) return [];

  /* find column keys by fuzzy header match */
  const headers  = Object.keys(schedRows[0]);
  const findKey  = (needles) => headers.find(h => needles.some(n => h.toLowerCase().includes(n))) || null;
  const dateKey  = findKey(['date']);
  const venueKey = findKey(['location','venue','place']);
  const capKey   = findKey(['recruitment','max recruitment','capacity','seat','max']);
  const startKey = findKey(['start time','start']);
  const endKey   = findKey(['end time','end']);

  const signHeaders = signRows.length ? Object.keys(signRows[0]) : [];
  const sessKey  = signHeaders.find(h => h.toLowerCase().includes('date') || h.toLowerCase().includes('session')) || (signHeaders[1] || '');

  /* count sign-ups per session date */
  const taken = {};
  signRows.forEach(r => {
    const k = isoDay(r[sessKey]);
    if (k) taken[k] = (taken[k] || 0) + 1;
  });

  const today = new Date(); today.setHours(0, 0, 0, 0);

  return schedRows
    .map(r => {
      const d = wsParse(r[dateKey]); if (!d) return null;
      const k   = isoDay(d);
      const cap = (capKey && parseInt(r[capKey], 10) > 0) ? parseInt(r[capKey], 10) : DEFAULT_CAPACITY;
      const t   = taken[k] || 0;
      const start = startKey ? String(r[startKey] || '').trim() : '';
      const end   = endKey   ? String(r[endKey]   || '').trim() : '';
      const time  = start && end ? `${start} – ${end}` : (start || '');
      return { iso: k, when: d.getTime(), venue: String(r[venueKey] || '').trim(), time, capacity: cap, taken: t, left: Math.max(0, cap - t) };
    })
    .filter(Boolean)
    .filter(s => s.when >= today.getTime())
    .sort((a, b) => a.when - b.when)
    .slice(0, 2);
}


/* ── ICS calendar download ── */
function downloadICS(s, lang) {
  const parts = (s.time || '').split('\u2013').map(t => t.trim());
  const startStr = parts[0] || '19:00';
  const endStr   = parts[1] || '21:00';
  const [sh, sm] = startStr.split(':').map(Number);
  const [eh, em] = endStr.split(':').map(Number);
  const d   = new Date(s.iso + 'T12:00:00');
  const y   = d.getFullYear();
  const mo  = ('0'+(d.getMonth()+1)).slice(-2);
  const dy  = ('0'+d.getDate()).slice(-2);
  const pad = n => ('0'+n).slice(-2);
  const dtStart = y+mo+dy+'T'+pad(sh)+pad(sm)+'00';
  const dtEnd   = y+mo+dy+'T'+pad(eh)+pad(em)+'00';
  const title = lang==='zh' ? 'StarFinder DIY \u671b\u8fdc\u955c\u5de5\u4f5c\u574a'
              : lang==='ms' ? 'Bengkel Teleskop DIY StarFinder'
              : 'StarFinder DIY Telescope Workshop';
  const desc  = lang==='zh' ? '\u4eb2\u624b\u7ec4\u88c5\u671b\u8fdc\u955c\uff0c\u5b8c\u6210\u540e\u514d\u8d39\u5e26\u56de\u5bb6\uff01'
              : lang==='ms' ? 'Bina teleskop DIY anda sendiri. Bawa pulang percuma!'
              : 'Build your own DIY telescope.';
  const ics = [
    'BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//StarFinder//Workshop//EN',
    'BEGIN:VEVENT',
    'UID:starfinder-'+s.iso+'@starfinder.my',
    'DTSTART;TZID=Asia/Kuala_Lumpur:'+dtStart,
    'DTEND;TZID=Asia/Kuala_Lumpur:'+dtEnd,
    'SUMMARY:'+title,
    'LOCATION:'+(s.venue||'Around Klang Valley, Malaysia'),
    'DESCRIPTION:'+desc,
    'END:VEVENT','END:VCALENDAR'
  ].join('\r\n');
  const blob = new Blob([ics], { type:'text/calendar;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = 'StarFinder-Workshop-'+s.iso+'.ics'; a.click();
  URL.revokeObjectURL(url);
}

function WorkshopSection({ lang }) {
  const t = window.T[lang]?.workshop || {};

  const [sessions,   setSessions]   = useStateW([]);
  const [loading,    setLoading]    = useStateW(true);
  const [expanded,   setExpanded]   = useStateW(null);
  const [form,       setForm]       = useStateW({ name: '', email: '', contact: '' });
  const [submitting, setSubmitting] = useStateW(false);
  const [submitted,  setSubmitted]  = useStateW({});     // { [iso]: { name, session } }

  const loadData = () => {
    setLoading(true);
    const parse = window.parseCSV || ((text) => {
      /* minimal fallback CSV parser */
      const lines = text.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g,'').trim());
      return lines.slice(1).map(line => {
        const vals = line.split(',').map(v => v.replace(/^"|"$/g,'').trim());
        const row = {}; headers.forEach((h, i) => { row[h] = vals[i] || ''; });
        return row;
      }).filter(r => Object.values(r).some(v => v));
    });

    Promise.all([
      fetch(scheduleCSV()).then(r => r.text()),
      fetch(signupCSV()).then(r => r.text()).catch(() => ''),
    ])
    .then(([sCsv, rCsv]) => {
      const schedRows = parse(sCsv);
      const signRows  = rCsv ? parse(rCsv) : [];
      setSessions(buildSessions(schedRows, signRows));
      setLoading(false);
    })
    .catch(err => {
      console.error('Workshop data load failed:', err);
      setLoading(false);
    });
  };

  useEffectW(() => { loadData(); }, []);

  const submit = (iso, e) => {
    e.preventDefault();
    setSubmitting(true);

    /* Hidden iframe form submission — bypasses CORS entirely */
    const frameName = 'sf-' + Date.now();
    const iframe = document.createElement('iframe');
    iframe.name = frameName;
    iframe.style.cssText = 'position:absolute;width:0;height:0;border:0;left:-9999px';
    document.body.appendChild(iframe);

    const f = document.createElement('form');
    f.method = 'GET';
    f.action = SIGNUP_API;
    f.target = frameName;
    const fields = { action:'signup', name:form.name, email:form.email, contact:"'"+form.contact, session:iso };
    Object.entries(fields).forEach(([k,v]) => {
      const inp = document.createElement('input');
      inp.type = 'hidden'; inp.name = k; inp.value = v;
      f.appendChild(inp);
    });
    document.body.appendChild(f);
    f.submit();
    setTimeout(() => { try{ document.body.removeChild(f); document.body.removeChild(iframe); }catch(err){} }, 6000);

    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(p => ({ ...p, [iso]: true }));
      setForm({ name:'', email:'', contact:'' });
      setExpanded(null);
      setTimeout(loadData, 4000);
    }, 1200);
  };

  /* labels */
  const L = {
    loading:    lang==='zh' ? '正在读取日程…'          : lang==='ms' ? 'Memuatkan jadual…'              : 'Loading schedule…',
    noSessions: lang==='zh' ? '即将公布下一场日期，敬请留意。'  : lang==='ms' ? 'Tarikh akan datang akan diumumkan.' : 'Upcoming session dates will be announced soon.',
    notifyBtn:  lang==='zh' ? '加入通知名单 →'         : lang==='ms' ? 'Daftar minat →'                : 'Notify me →',
    sessionTag: (n) => lang==='zh' ? `第 ${n} 场` : lang==='ms' ? `Sesi ${n}` : `Session ${n}`,
    full:       lang==='zh' ? '名额已满'               : lang==='ms' ? 'Penuh'                         : 'Full',
    taken:      lang==='zh' ? '已登记'                 : lang==='ms' ? 'mendaftar'                     : 'registered',
    avail:      lang==='zh' ? '剩余名额'               : lang==='ms' ? 'Baki tempat'                   : 'Available',
    leftPre:    lang==='zh' ? '还剩 '                 : lang==='ms' ? ''                               : '',
    leftSuf:    lang==='zh' ? ' 个空位'                : lang==='ms' ? ' lagi'                         : ' left',
    seatStatus: lang==='zh' ? '报名情况' : lang==='ms' ? 'Pendaftaran' : 'Sign-ups',
    almostFull: (n) => lang==='zh' ? `仅剩 ${n} 个名额，从速报名！` : lang==='ms' ? `Tinggal ${n} tempat sahaja!` : `Only ${n} seats left!`,
    spotsLeft:  (n) => lang==='zh' ? `还有 ${n} 个名额` : lang==='ms' ? `${n} tempat tersedia` : `${n} seats available`,
    locLabel:   lang==='zh' ? '地点：'   : lang==='ms' ? 'Lokasi:'  : 'Location:',
    timeLabel:  lang==='zh' ? '时间：'   : lang==='ms' ? 'Masa:'    : 'Time:',
    nameLbl:    lang==='zh' ? '姓名'                  : lang==='ms' ? 'Nama'                          : 'Name',
    emailLbl:   lang==='zh' ? '电邮'                  : lang==='ms' ? 'Emel'                          : 'Email',
    contactLbl: lang==='zh' ? '联系电话'               : lang==='ms' ? 'No. Telefon'                   : 'Contact / Phone',
    cancel:     lang==='zh' ? '取消'                  : lang==='ms' ? 'Batal'                         : 'Cancel',
    confirm:    lang==='zh' ? '确认报名'               : lang==='ms' ? 'Sahkan Pendaftaran'             : 'Confirm Sign-up',
    sending:    lang==='zh' ? '提交中…'               : lang==='ms' ? 'Menghantar…'                   : 'Submitting…',
    success:    lang==='zh' ? '✓ 已登记！我们会尽快联系您。'  : lang==='ms' ? '✓ Berjaya! Kami akan hubungi anda.' : "✓ Registered! We'll be in touch soon.",
    availlbl:   lang==='zh' ? '剩余名额'               : lang==='ms' ? 'Baki tempat'                   : 'Available',
  };

  const inputStyle = {
    width: '100%', boxSizing: 'border-box',
    padding: '10px 12px', borderRadius: 0,
    border: '2px solid var(--cream)',
    background: '#fff',
    color: 'var(--cream)', fontSize: 14, outline: 'none',
  };

  return (
    <section style={{
      position: 'relative',
      background: '#00C9FC',
      padding: '20px 28px 56px',
      borderTop: '1px solid var(--line)',
      overflow: 'hidden',
    }}>
      <div style={{ maxWidth: 1180, margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* ── Section header ── */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div className="mono" style={{ letterSpacing: '0.3em', color: 'var(--gold-text)', marginBottom: 10, fontSize: 14 }}>
            ✦ {t.eyebrow}
          </div>
          <h2 className="display" style={{ fontSize: 'clamp(28px, 4vw, 52px)', lineHeight: 1.08, margin: 0, textWrap: 'balance', color: 'var(--cream)' }}>
            {t.title}
          </h2>
        </div>

        {/* ── Schedule card ── */}
        <div style={{
          borderRadius: 0, background: '#f0f8ff',
          border: '4px solid var(--cream)',
          boxShadow: '10px 10px 0px rgba(26,40,69,0.3)',
          padding: 'clamp(24px, 4vw, 44px)',
        }}>
          {/* header row */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
            <div>
              <div className="mono" style={{ letterSpacing: '0.22em', color: 'var(--gold-text)', fontSize: 12, marginBottom: 8, textTransform: 'uppercase' }}>
                ✦ {t.scheduleEyebrow}
              </div>
              <h3 className="display" style={{ fontSize: 'clamp(20px, 2.6vw, 30px)', margin: 0, lineHeight: 1.1, color: 'var(--cream)', fontWeight: 900 }}>
                {t.scheduleTitle}
              </h3>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              {[
                { label: t.audienceLabel, value: t.audienceValue, color: 'var(--pink)' },
                { label: t.durationLabel, value: t.durationValue, color: 'var(--blue-deep)' },
              ].filter(m => m.value).map((m, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '8px 16px', background: '#fff', border: '3px solid var(--cream)', borderRadius: 0, boxShadow: '4px 4px 0 rgba(26,40,69,0.25)' }}>
                  <span className="mono" style={{ fontSize: 10, letterSpacing: '0.08em', color: 'rgba(26,40,69,0.5)', textTransform: 'uppercase' }}>{m.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: m.color }}>{m.value}</span>
                </div>
              ))}
              {/* Price badge — prominent */}
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
                padding: '8px 20px',
                background: 'linear-gradient(135deg, #1a9e5c 0%, #16c172 100%)',
                border: '3px solid var(--cream)', borderRadius: 0,
                boxShadow: '5px 5px 0 rgba(26,40,69,0.35)',
              }}>
                <span className="mono" style={{ fontSize: 10, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>
                  {lang === 'zh' ? '费用' : lang === 'ms' ? 'Yuran' : 'Fee'}
                </span>
                <span style={{ fontSize: 22, fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: '-0.01em' }}>RM 150</span>
              </div>
            </div>
          </div>

          {/* loading */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '48px 0', color: 'rgba(26,40,69,0.4)', fontSize: 15 }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>🔭</div>
              {L.loading}
            </div>
          )}

          {/* no upcoming */}
          {!loading && sessions.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>📅</div>
              <div style={{ fontSize: 16, color: 'rgba(26,40,69,0.65)', lineHeight: 1.65, maxWidth: 460, margin: '0 auto', textWrap: 'pretty' }}>
                {L.noSessions}
              </div>
              <a href="#nav-register" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 20,
                padding: '12px 22px', borderRadius: 12,
                background: 'linear-gradient(135deg, var(--pink), var(--gold))',
                color: 'var(--navy-1)', fontWeight: 700, fontSize: 15, textDecoration: 'none',
              }}>{L.notifyBtn}</a>
            </div>
          )}

          {/* session cards */}
          {!loading && sessions.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: sessions.length === 1 ? 'minmax(0,520px)' : 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: 36,
              alignItems: 'start',
              justifyContent: sessions.length === 1 ? 'center' : 'stretch',
            }}>
              {sessions.map((s, i) => {
                const open   = s.left > 0;
                const isExp  = expanded === s.iso;
                const isDone = !!(submitted[s.iso]);
                const pct    = s.capacity > 0 ? Math.min(100, Math.round(s.taken / s.capacity * 100)) : 0;

                return (
                  <div key={s.iso} style={{
                    borderRadius: 18,
                    background: open ? '#fffbef' : '#f5f5f5',
                    border: `4px solid ${open ? 'var(--gold)' : 'rgba(26,40,69,0.2)'}`,
                    borderRadius: 0,
                    boxShadow: open ? '8px 8px 0px rgba(247,201,72,0.55)' : '6px 6px 0px rgba(26,40,69,0.18)',
                    overflow: 'hidden',
                  }}>

                    <div style={{ padding: '24px 24px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                      {/* tag + status */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                        <span className="mono" style={{ fontSize: 12, letterSpacing: '0.12em', color: 'rgba(26,40,69,0.6)', textTransform: 'uppercase' }}>
                          {L.sessionTag(i + 1)}
                        </span>
                        <span style={{
                          fontSize: 11.5, fontWeight: 700, padding: '5px 12px', borderRadius: 0,
                          background: open ? 'var(--gold)' : 'rgba(26,40,69,0.08)',
                          color: open ? 'var(--cream)' : 'rgba(26,40,69,0.5)',
                        }}>
                          {open ? t.statusOpen : L.full}
                        </span>
                      </div>

                      {/* date — single compact line */}
                      <div className="display" style={{ fontSize: 'clamp(22px, 2.8vw, 30px)', fontWeight: 800, color: 'var(--cream)', lineHeight: 1.1, letterSpacing: '-0.01em' }}>
                        {fmtFullDate(s.iso, lang)}
                      </div>

                      {/* location + time */}
                      <div style={{ display: 'grid', gap: 6, fontSize: 14, color: 'rgba(26,40,69,0.7)' }}>
                        {s.venue && (
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                            <span style={{ fontWeight: 700, color: 'var(--cream)', flexShrink: 0, minWidth: 64 }}>{L.locLabel}</span>
                            <span style={{ lineHeight: 1.45 }}>{s.venue}</span>
                          </div>
                        )}
                        {s.time && (
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                            <span style={{ fontWeight: 700, color: 'var(--cream)', flexShrink: 0, minWidth: 64 }}>{L.timeLabel}</span>
                            <span style={{ lineHeight: 1.45 }}>{s.time}</span>
                          </div>
                        )}
                      </div>

                      {/* seat status + pixel bar */}
                      {s.capacity > 0 && (() => {
                        const nearlyFull = s.left > 0 && s.left <= Math.max(3, Math.ceil(s.capacity * 0.2));
                        const filledBlocks = Math.min(12, Math.round((s.taken / s.capacity) * 12));
                        return (
                          <div style={{ marginTop: 2 }}>
                            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 7 }}>
                              <span style={{ fontSize: 12.5, fontWeight: 700, color: 'rgba(26,40,69,0.6)' }}>{L.seatStatus}</span>
                              <span style={{ fontSize: 14, fontWeight: 800, color: nearlyFull ? 'var(--pink)' : 'var(--cream)' }}>
                                {s.taken} / {s.capacity}
                              </span>
                            </div>
                            <div style={{ display: 'flex', gap: 3 }}>
                              {Array.from({ length: 12 }).map((_, bi) => {
                                const filled = bi < filledBlocks;
                                return (
                                  <div key={bi} style={{
                                    flex: 1, height: 12,
                                    background: filled ? (nearlyFull ? 'var(--pink)' : '#FF1493') : 'rgba(26,40,69,0.08)',
                                    border: '1.5px solid var(--cream)',
                                  }}></div>
                                );
                              })}
                            </div>
                            <div style={{ fontSize: 12, fontWeight: 700, marginTop: 6, color: nearlyFull ? 'var(--pink)' : 'rgb(22,163,74)' }}>
                              {nearlyFull ? L.almostFull(s.left) : L.spotsLeft(s.left)}
                            </div>
                          </div>
                        );
                      })()}

                      {/* CTA */}
                      {open && !isDone && (
                        <button onClick={() => setExpanded(isExp ? null : s.iso)} style={{
                          width: '100%', padding: '13px 18px', borderRadius: 12,
                          background: isExp ? 'rgba(26,40,69,0.04)' : 'linear-gradient(135deg, var(--pink), var(--gold))',
                          color: isExp ? 'rgba(26,40,69,0.55)' : '#fff',
                          border: isExp ? '2px solid rgba(26,40,69,0.25)' : '2px solid var(--cream)',
                          borderRadius: 0,
                          boxShadow: isExp ? 'none' : '4px 4px 0px var(--cream)',
                          fontWeight: 700, fontSize: 15, cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s',
                        }}
                          onMouseEnter={e => { if(!isExp){ e.currentTarget.style.transform='translate(3px, 3px)'; e.currentTarget.style.boxShadow='1px 1px 0px var(--cream)'; }}}
                          onMouseLeave={e => { e.currentTarget.style.transform='translate(0,0)'; e.currentTarget.style.boxShadow=isExp?'none':'4px 4px 0px var(--cream)'; }}
                        >
                          {isExp ? L.cancel : t.cta}
                        </button>
                      )}

                      {/* success confirmation */}
                      {isDone && (() => {
                        const reg = submitted[s.iso];
                        return (
                          <div style={{
                            padding: '18px 18px', borderRadius: 0, marginTop: 4,
                            background: 'rgba(34,197,94,0.08)',
                            border: '3px solid rgb(34,197,94)',
                            boxShadow: '4px 4px 0px rgba(34,197,94,0.35)',
                            display: 'flex',
                            alignItems: 'center',
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', width: '100%' }}>
                              <div style={{ fontSize: 15, fontWeight: 800, color: 'rgb(22,163,74)' }}>
                                ✅ {lang==='zh'?'报名成功！':lang==='ms'?'Berjaya mendaftar!':'Register success.'}
                              </div>
                              <button onClick={() => downloadICS(s, lang)} style={{
                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                padding: '8px 14px', borderRadius: 0, cursor: 'pointer',
                                background: 'var(--gold)', color: 'var(--cream)',
                                border: '2px solid var(--cream)',
                                boxShadow: '3px 3px 0px var(--cream)',
                                fontWeight: 700, fontSize: 13,
                                transition: 'transform 0.12s, box-shadow 0.12s',
                              }}
                                onMouseEnter={e=>{e.currentTarget.style.transform='translate(2px,2px)';e.currentTarget.style.boxShadow='1px 1px 0px var(--cream)';}}
                                onMouseLeave={e=>{e.currentTarget.style.transform='translate(0,0)';e.currentTarget.style.boxShadow='3px 3px 0px var(--cream)';}}
                              >
                                📅 {lang==='zh'?'加入日历':lang==='ms'?'Tambah ke Kalendar':'Add to Calendar'}
                              </button>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* ── expand form ── */}
                    {isExp && !isDone && (
                      <form onSubmit={(e) => submit(s.iso, e)} style={{
                        padding: '20px 24px 24px',
                        borderTop: '1px solid var(--line-strong)',
                        display: 'grid', gap: 14,
                        background: 'rgba(255,255,255,0.55)',
                      }}>
                        {[
                          { label: L.nameLbl,    key: 'name',    type: 'text',  req: true  },
                          { label: L.emailLbl,   key: 'email',   type: 'email', req: true  },
                          { label: L.contactLbl, key: 'contact', type: 'tel',   req: false },
                        ].map(f => (
                          <div key={f.key}>
                            <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(26,40,69,0.6)', display: 'block', marginBottom: 5 }}>
                              {f.label}{f.req ? ' *' : ''}
                            </label>
                            <input
                              type={f.type} required={f.req}
                              value={form[f.key]}
                              onChange={ev => setForm(p => ({ ...p, [f.key]: ev.target.value }))}
                              style={inputStyle}
                            />
                          </div>
                        ))}
                        <button type="submit" disabled={submitting} style={{
                          padding: '12px 18px', borderRadius: 10, marginTop: 4,
                          background: 'var(--gold)', color: 'var(--cream)',
                          border: '2px solid var(--cream)',
                          borderRadius: 0,
                          boxShadow: submitting ? 'none' : '4px 4px 0px var(--cream)',
                          fontWeight: 700, fontSize: 15,
                          cursor: submitting ? 'not-allowed' : 'pointer',
                          opacity: submitting ? 0.65 : 1,
                          transition: 'transform 0.15s, box-shadow 0.15s',
                        }}
                          onMouseEnter={e => { if(!submitting){ e.currentTarget.style.transform='translate(3px,3px)'; e.currentTarget.style.boxShadow='1px 1px 0px var(--cream)'; }}}
                          onMouseLeave={e => { e.currentTarget.style.transform='translate(0,0)'; e.currentTarget.style.boxShadow=submitting?'none':'4px 4px 0px var(--cream)'; }}
                        >
                          {submitting ? L.sending : L.confirm}
                        </button>
                      </form>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* footnote */}
          {!loading && (
            <p className="mono" style={{ fontSize: 12, color: 'rgba(26,40,69,0.5)', margin: '22px 0 0', lineHeight: 1.55, fontStyle: 'italic' }}>
              {t.scheduleNote}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { WorkshopSection, buildSessions, scheduleCSV, signupCSV, fmtFullDate });
