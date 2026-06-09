/* astro.jsx — real-time "visible tonight" info for the hero's celestial objects.
   Uses Paul Schlyter's low-precision ephemeris (Sun, Moon, Mars, Jupiter, Saturn)
   + fixed J2000 coords for the deep-sky objects, evaluated for an observer in
   Kuala Lumpur, Malaysia. Everything is computed from the REAL current date.      */
(function () {
  // Observer: Kuala Lumpur (Malaysia has no DST → fixed UTC+8)
  var OBS = { lat: 3.139, lon: 101.687, tz: 8 };

  var RAD = Math.PI / 180;
  function rev(x) { x = x % 360; return x < 0 ? x + 360 : x; }
  function sin(d) { return Math.sin(d * RAD); }
  function cos(d) { return Math.cos(d * RAD); }
  function atan2(y, x) { return Math.atan2(y, x) / RAD; }
  function asin(x) { return Math.asin(Math.max(-1, Math.min(1, x))) / RAD; }

  // days since 2000 Jan 0.0 UT (JD = 2451543.5 + d)
  function dayNumber(date) {
    var Y = date.getUTCFullYear(), M = date.getUTCMonth() + 1, D = date.getUTCDate();
    var d0 = 367 * Y - Math.floor(7 * (Y + Math.floor((M + 9) / 12)) / 4) +
             Math.floor(275 * M / 9) + D - 730530;
    var ut = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
    return d0 + ut / 24;
  }

  function eccAnom(M, e) {
    var E = M + (180 / Math.PI) * e * sin(M) * (1 + e * cos(M));
    for (var i = 0; i < 8; i++) {
      var dE = (E - (180 / Math.PI) * e * sin(E) - M) / (1 - e * cos(E));
      E -= dE;
      if (Math.abs(dE) < 1e-5) break;
    }
    return E;
  }

  function sunRect(d) {
    var w = 282.9404 + 4.70935e-5 * d;
    var e = 0.016709 - 1.151e-9 * d;
    var M = rev(356.0470 + 0.9856002585 * d);
    var E = M + (180 / Math.PI) * e * sin(M) * (1 + e * cos(M));
    var xv = cos(E) - e, yv = Math.sqrt(1 - e * e) * sin(E);
    var v = atan2(yv, xv), r = Math.sqrt(xv * xv + yv * yv);
    var lon = rev(v + w);
    return { x: r * cos(lon), y: r * sin(lon), M: M, w: w };
  }

  // returns { ra: hours, dec: deg } geocentric, of-date
  function bodyRaDec(name, d) {
    var ecl = 23.4393 - 3.563e-7 * d;
    if (name === 'sun') {
      var s = sunRect(d);
      var xe0 = s.x, ye0 = s.y * cos(ecl), ze0 = s.y * sin(ecl);
      return { ra: rev(atan2(ye0, xe0)) / 15, dec: atan2(ze0, Math.sqrt(xe0 * xe0 + ye0 * ye0)) };
    }
    var EL = {
      moon:    { N: 125.1228 - 0.0529538083 * d, i: 5.1454,            w: 318.0634 + 0.1643573223 * d, a: 60.2666,  e: 0.054900,                M: 115.3654 + 13.0649929509 * d, geo: true },
      mars:    { N: 49.5574 + 2.11081e-5 * d,    i: 1.8497 - 1.78e-8 * d,  w: 286.5016 + 2.92961e-5 * d,  a: 1.523688, e: 0.093405 + 2.516e-9 * d, M: 18.6021 + 0.5240207766 * d },
      jupiter: { N: 100.4542 + 2.76854e-5 * d,   i: 1.3030 - 1.557e-7 * d, w: 273.8777 + 1.64505e-5 * d,  a: 5.20256,  e: 0.048498 + 4.469e-9 * d, M: 19.8950 + 0.0830853001 * d },
      saturn:  { N: 113.6634 + 2.38980e-5 * d,   i: 2.4886 - 1.081e-7 * d, w: 339.3939 + 2.97661e-5 * d,  a: 9.55475,  e: 0.055546 - 9.499e-9 * d, M: 316.9670 + 0.0334442282 * d }
    }[name];
    var N = rev(EL.N), iN = EL.i, w = rev(EL.w), a = EL.a, e = EL.e, M = rev(EL.M);
    var E = eccAnom(M, e);
    var xv = a * (cos(E) - e), yv = a * (Math.sqrt(1 - e * e) * sin(E));
    var v = atan2(yv, xv), r = Math.sqrt(xv * xv + yv * yv);
    var xh = r * (cos(N) * cos(v + w) - sin(N) * sin(v + w) * cos(iN));
    var yh = r * (sin(N) * cos(v + w) + cos(N) * sin(v + w) * cos(iN));
    var zh = r * (sin(v + w) * sin(iN));
    var xg, yg, zg;
    if (EL.geo) { xg = xh; yg = yh; zg = zh; }
    else { var ss = sunRect(d); xg = xh + ss.x; yg = yh + ss.y; zg = zh; }
    var xe = xg, ye = yg * cos(ecl) - zg * sin(ecl), ze = yg * sin(ecl) + zg * cos(ecl);
    return { ra: rev(atan2(ye, xe)) / 15, dec: atan2(ze, Math.sqrt(xe * xe + ye * ye)) };
  }

  // altitude (deg) of a target at a given instant
  function altOf(target, date) {
    var d = dayNumber(date), ra, dec;
    if (target.fixed) { ra = target.ra; dec = target.dec; }
    else { var p = bodyRaDec(target.body, d); ra = p.ra; dec = p.dec; }
    var T = d - 1.5; // JD - 2451545.0
    var gmst = rev(280.46061837 + 360.98564736629 * T);
    var lst = rev(gmst + OBS.lon);
    var H = lst - ra * 15;
    H = ((H + 180) % 360 + 360) % 360 - 180;
    return asin(sin(OBS.lat) * sin(dec) + cos(OBS.lat) * cos(dec) * cos(H));
  }

  // object id → ephemeris target
  var TARGETS = {
    moon:      { body: 'moon' },
    jupiter:   { body: 'jupiter' },
    saturn:    { body: 'saturn' },
    mars:      { body: 'mars' },
    orion:     { fixed: true, ra: 5.6036,  dec: -1.20 },   // Alnilam (belt centre)
    sirius:    { fixed: true, ra: 6.7525,  dec: -16.716 },
    pleiades:  { fixed: true, ra: 3.7833,  dec: 24.117 },
    m42:       { fixed: true, ra: 5.5881,  dec: -5.391 },
    lagoon:    { fixed: true, ra: 18.0653, dec: -24.387 },  // M8 Lagoon Nebula
    andromeda: { fixed: true, ra: 0.7122,  dec: 41.269 }
  };
  var SUN = { body: 'sun' };

  // KL local clock string from a UTC Date (24h)
  function klStr(date) {
    var k = new Date(date.getTime() + OBS.tz * 3600e3);
    var h = k.getUTCHours(), m = k.getUTCMinutes();
    return h + ':' + (m < 10 ? '0' : '') + m;
  }

  // Build the night window (sun < -6°) that contains the upcoming/ongoing midnight,
  // then sample the target across it. Cached per object id + day.
  var cache = {};
  function compute(objId) {
    var now = new Date();
    var key = objId + '|' + Math.floor(now.getTime() / 600000); // refresh every 10 min
    if (cache[key]) return cache[key];

    var target = TARGETS[objId];
    if (!target) return null;

    // anchor: KL local noon of "today" (or yesterday if it's still pre-noon)
    var kl = new Date(now.getTime() + OBS.tz * 3600e3);
    var baseDay = kl.getUTCDate() - (kl.getUTCHours() < 12 ? 1 : 0);
    var startUTC = Date.UTC(kl.getUTCFullYear(), kl.getUTCMonth(), baseDay, 12, 0, 0) - OBS.tz * 3600e3;

    var stepMin = 6, samples = (24 * 60) / stepMin;
    var firstUp = null, lastUp = null, maxAlt = -90, maxTime = null;
    var nightStart = null, nightEnd = null;
    for (var i = 0; i <= samples; i++) {
      var t = new Date(startUTC + i * stepMin * 60000);
      if (altOf(SUN, t) >= -6) continue;            // only stargazing-dark hours
      if (!nightStart) nightStart = t;
      nightEnd = t;
      var a = altOf(target, t);
      if (a > maxAlt) { maxAlt = a; maxTime = t; }
      if (a > 0) { if (!firstUp) firstUp = t; lastUp = t; }
    }

    var altNow = Math.round(altOf(target, now));
    var darkNow = altOf(SUN, now) < -6;              // is it actually dark out right now?
    var res = {
      status: 'not-visible',
      now: klStr(now),
      altNow: altNow,
      upNow: altNow > 0,
      darkNow: darkNow,
      visibleNow: darkNow && altNow > 0              // genuinely observable this minute
    };
    if (firstUp && maxAlt >= 8) {
      var allNight = nightStart && nightEnd &&
        (firstUp.getTime() - nightStart.getTime() < 7 * 60000) &&
        (nightEnd.getTime() - lastUp.getTime() < 7 * 60000);
      res.status = allNight ? 'all-night' : 'visible';
      res.appears = klStr(firstUp);
      res.gone = klStr(lastUp);
      res.best = klStr(maxTime);
      res.bestAlt = Math.round(maxAlt);
    }
    cache[key] = res;
    return res;
  }

  // localized one-liner(s)
  function line(objId, lang) {
    var v = compute(objId);
    if (!v) return null;
    var L = lang || 'en';
    var nowTxt = {
      en: '◷ ' + v.now + ' now · ' + (v.upNow ? v.altNow + '° above horizon' : 'below the horizon'),
      zh: '◷ 现在 ' + v.now + ' · ' + (v.upNow ? '仰角 ' + v.altNow + '°' : '在地平线下'),
      ms: '◷ ' + v.now + ' kini · ' + (v.upNow ? v.altNow + '° atas ufuk' : 'bawah ufuk')
    }[L];
    var main;
    if (v.status === 'not-visible') {
      main = {
        en: '🔭 Tonight: below the horizon — not visible from Malaysia',
        zh: '🔭 今晚：在地平线以下，马来西亚看不到',
        ms: '🔭 Malam ini: di bawah ufuk — tidak kelihatan dari Malaysia'
      }[L];
    } else if (v.status === 'all-night') {
      main = {
        en: '🔭 Tonight: up all night · highest ~' + v.best + ' (' + v.bestAlt + '°)',
        zh: '🔭 今晚：整夜可见 · 约 ' + v.best + ' 最高（' + v.bestAlt + '°）',
        ms: '🔭 Malam ini: sepanjang malam · paling tinggi ~' + v.best + ' (' + v.bestAlt + '°)'
      }[L];
    } else {
      main = {
        en: '🔭 Tonight: up ' + v.appears + '–' + v.gone + ' · highest ' + v.best,
        zh: '🔭 今晚：' + v.appears + '–' + v.gone + ' 可见 · ' + v.best + ' 最高',
        ms: '🔭 Malam ini: ' + v.appears + '–' + v.gone + ' · paling tinggi ' + v.best
      }[L];
    }
    return { main: main, now: nowTxt, appears: v.appears, gone: v.gone, status: v.status };
  }

  // compact always-on label for the hero (short window + live altitude)
  function chip(objId, lang) {
    var v = compute(objId);
    if (!v) return null;
    var L = lang || 'en';
    var label;
    if (v.status === 'not-visible') {
      label = { en: 'not up tonight', zh: '今晚看不到', ms: 'tiada malam ini' }[L];
    } else if (v.status === 'all-night') {
      label = { en: 'up all night', zh: '整夜可见', ms: 'sepanjang malam' }[L];
    } else {
      label = v.appears + '–' + v.gone;
    }
    return { label: label, upNow: v.upNow, altNow: v.altNow, status: v.status };
  }

  window.getViewing = line;
  window.getViewingChip = chip;
  window.getViewingData = compute;
})();
