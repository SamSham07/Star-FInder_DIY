/* Full Survey Form with all PRD fields */

const { useState: useStateSurvey } = React;

const SURVEY_API = 'https://script.google.com/macros/s/AKfycbwhVGWBkI7hGk9B6g_GzG5tmOSxcrAaHC-nJf7udt7CSMjxsDq2wvDBsRRVk8WbJu15/exec';

function FormSurvey({ lang }) {
  const t = window.T[lang]?.form || {};
  const [data, setData] = useStateSurvey({
    name: '', city: '', email: '',
    reasons: [], love: 0, drivers: [], discovery: '', content: [], notification: [], events: []
  });
  const [submitted, setSubmitted] = useStateSurvey(false);
  const [submitting, setSubmitting] = useStateSurvey(false);

  const toggle = (field, val) => {
    setData((prev) => {
      const arr = prev[field] || [];
      if (arr.includes(val)) {
        return { ...prev, [field]: arr.filter((v) => v !== val) };
      } else {
        return { ...prev, [field]: [...arr, val] };
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);

    /* Hidden iframe GET submission — same technique as workshop sign-up */
    const frameName = 'sf-survey-' + Date.now();
    const iframe = document.createElement('iframe');
    iframe.name = frameName;
    iframe.style.cssText = 'position:absolute;width:0;height:0;border:0;left:-9999px';
    document.body.appendChild(iframe);

    const f = document.createElement('form');
    f.method = 'GET';
    f.action = SURVEY_API;
    f.target = frameName;

    const fields = {
      action:       'questionnaire',
      sheet:        'Questionnaire',
      name:         data.name,
      city:         data.city,
      email:        data.email,
      reasons:      (data.reasons || []).join(', '),
      love:         data.love,
      drivers:      (data.drivers || []).join(', '),
      discovery:    data.discovery,
      content:      (data.content || []).join(', '),
      notification: (data.notification || []).join(', '),
      events:       (data.events || []).join(', '),
      timestamp:    new Date().toISOString(),
    };

    Object.entries(fields).forEach(([k, v]) => {
      const inp = document.createElement('input');
      inp.type = 'hidden'; inp.name = k; inp.value = v;
      f.appendChild(inp);
    });

    document.body.appendChild(f);
    f.submit();
    setTimeout(() => { try { document.body.removeChild(f); document.body.removeChild(iframe); } catch(err) {} }, 6000);

    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      setData({ name: '', city: '', email: '', reasons: [], love: 0, drivers: [], discovery: '', content: [], notification: [], events: [] });
    }, 1200);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 24 }}>
      {/* Basic Info */}
      <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--cream)', display: 'block', marginBottom: 6 }}>
            {t.city || 'Which Town or City you are living?'}
          </label>
          <input type="text" required value={data.city} onChange={(e) => setData((prev) => ({ ...prev, city: e.target.value }))}
          style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--line-strong)', background: 'rgba(255,255,255,0.05)', color: 'var(--cream)', fontSize: 14 }} />
      </div>

      <div>
        <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--cream)', display: 'block', marginBottom: 6 }}>
          {t.email || 'Email'}
        </label>
        <input type="email" required value={data.email} onChange={(e) => setData((prev) => ({ ...prev, email: e.target.value }))}
        style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--line-strong)', background: 'rgba(255,255,255,0.05)', color: 'var(--cream)', fontSize: 14 }} />
      </div>

      {/* Reasons */}
      <div>
        <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--cream)', display: 'block', marginBottom: 12 }}>
          {t.reasonsLabel || 'Main reason for your interest?'}
        </label>
        <div style={{ display: 'grid', gap: 8 }}>
          {(t.reasons || []).map((reason, i) =>
          <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14 }}>
              <input type="checkbox" checked={data.reasons.includes(reason)} onChange={() => toggle('reasons', reason)}
            style={{ width: 18, height: 18, accentColor: 'var(--gold)' }} />
              <span style={{ color: 'var(--cream-soft)' }}>{reason}</span>
            </label>
          )}
        </div>
      </div>

      {/* Astronomy Love - Radio buttons (1-5) */}
      <div>
        <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--cream)', display: 'block', marginBottom: 12 }}>
          {t.loveLabel || 'How would you rate your love for astronomy?'}
        </label>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          {[1, 2, 3, 4, 5].map((val) =>
          <label key={val} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <input
              type="radio"
              name="love"
              value={val}
              checked={data.love === val}
              onChange={() => setData((prev) => ({ ...prev, love: val }))}
              style={{ cursor: 'pointer', accentColor: 'var(--gold)', width: 20, height: 20 }} />
            
              <span style={{ fontSize: 15, fontWeight: 600, color: data.love === val ? 'var(--gold)' : 'var(--cream)' }}>{val}</span>
            </label>
          )}
        </div>
        <div style={{ fontSize: 12, color: 'var(--cream-soft)', marginTop: 10, display: 'flex', justifyContent: 'space-between', maxWidth: 280 }}>
          <span>{t.loveLow || 'Not interested'}</span>
          <span>{t.loveHigh || 'Very passionate'}</span>
        </div>
      </div>

      {/* Drivers */}
      <div>
        <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--cream)', display: 'block', marginBottom: 12 }}>
          {t.driversLabel || 'What draws you interested in astronomy? (multi-select)'}
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 8 }}>
          {(t.drivers || []).map((driver, i) =>
          <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12 }}>
              <input type="checkbox" checked={data.drivers.includes(driver)} onChange={() => toggle('drivers', driver)}
            style={{ width: 16, height: 16, accentColor: 'var(--gold)' }} />
              <span style={{ color: 'var(--cream-soft)' }}>{driver}</span>
            </label>
          )}
        </div>
      </div>

      {/* Discovery Channel */}
      <div>
        <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--cream)', display: 'block', marginBottom: 12 }}>
          {t.discoveryLabel || 'How did you discover Star-Finder?'}
        </label>
        <div style={{ display: 'grid', gap: 8 }}>
          {(t.discovery || ['Friends', 'Family', 'Public event', 'Facebook', 'Instagram', 'Website', 'Internet search', 'Newspaper', 'Radio', 'Telescope vendors', 'ChatGPT', 'Other']).map((option, i) =>
          <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13 }}>
              <input type="radio" name="discovery" value={option} checked={data.discovery === option} onChange={(e) => setData((prev) => ({ ...prev, discovery: e.target.value }))}
            style={{ width: 16, height: 16, accentColor: 'var(--gold)' }} />
              <span style={{ color: 'var(--cream-soft)' }}>{option}</span>
            </label>
          )}
        </div>
      </div>

      {/* Content Sources */}
      <div>
        <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--cream)', display: 'block', marginBottom: 12 }}>
          {t.contentLabel || 'Where do you get astronomy content? (multi-select)'}
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8 }}>
          {(t.content || ['SPACE.com', 'NASA.gov', 'Sky & Telescope', 'YouTube', 'Facebook', 'Instagram', 'WhatsApp', 'Books/Magazines', 'Blogs', 'TikTok', 'LinkedIn', 'Discord', 'Reddit', 'Telegram', '小红书']).map((source, i) =>
          <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 11 }}>
              <input type="checkbox" checked={data.content.includes(source)} onChange={() => toggle('content', source)}
            style={{ width: 14, height: 14, accentColor: 'var(--gold)' }} />
              <span style={{ color: 'var(--cream-soft)' }}>{source}</span>
            </label>
          )}
        </div>
      </div>

      {/* Notification Channels */}
      <div>
        <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--cream)', display: 'block', marginBottom: 12 }}>
          {t.notificationLabel || 'Preferred notification channels. (multi-select)'}
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8 }}>
          {(t.notification || ['Facebook', 'Instagram', 'WhatsApp', 'Telegram', 'Email', 'Website', '小红书', 'TikTok']).map((channel, i) =>
          <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12 }}>
              <input type="checkbox" checked={data.notification.includes(channel)} onChange={() => toggle('notification', channel)}
            style={{ width: 16, height: 16, accentColor: 'var(--gold)' }} />
              <span style={{ color: 'var(--cream-soft)' }}>{channel}</span>
            </label>
          )}
        </div>
      </div>

      {/* Top Events */}
      <div>
        <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--cream)', display: 'block', marginBottom: 12 }}>
          {t.eventsLabel || "Top 3 events you'd like? (max 3)"}
        </label>
        <div style={{ display: 'grid', gap: 8 }}>
          {(t.events || []).map((event, i) =>
          <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14 }}>
              <input type="checkbox" checked={data.events.includes(event)} onChange={() => toggle('events', event)}
            disabled={data.events.length >= 3 && !data.events.includes(event)}
            style={{ width: 18, height: 18, accentColor: 'var(--gold)', opacity: data.events.length >= 3 && !data.events.includes(event) ? 0.5 : 1 }} />
              <span style={{ color: 'var(--cream-soft)' }}>{event}</span>
            </label>
          )}
        </div>
        <div style={{ fontSize: 12, color: 'var(--cream-soft)', marginTop: 8 }}>{data.events.length}/3 selected</div>
      </div>

      {/* Submit */}
      <button type="submit" className="pixel-cta" disabled={submitting} style={{
        padding: '12px 24px', borderRadius: 8, background: 'var(--gold)', color: 'var(--navy-1)',
        border: 'none', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', marginTop: 12, fontSize: "18px",
        opacity: submitting ? 0.65 : 1,
      }}>
        {submitting ? 'Submitting…' : (t.submit || 'Submit')}
      </button>

      {/* Success */}
      {submitted &&
      <div style={{ padding: '16px', borderRadius: 8, background: 'rgba(168, 230, 207, 0.15)', border: '1px solid rgba(168, 230, 207, 0.5)', color: '#A8E6CF', fontSize: 14 }}>
          ✓ {t.success || 'Thank you! Check your email for your free PDF guide.'}
        </div>
      }
    </form>
  );
}
