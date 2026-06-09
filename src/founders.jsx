/* founders.jsx — pixel-art founder profiles, redesigned */

const FoundersSection = ({ lang = 'zh' }) => {
  const language = lang;
  const { useRef: useRefF, useEffect: useEffectF, useState: useStateF } = React;
  const [visible, setVisible] = useStateF([false, false, false]);
  const sectionRef = useRefF(null);

  useEffectF(() => {
    if (!sectionRef.current) return;
    const cards = sectionRef.current.querySelectorAll('.founder-card');
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const idx = Number(e.target.dataset.idx);
          setVisible((prev) => {const n = [...prev];n[idx] = true;return n;});
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });
    cards.forEach((c) => obs.observe(c));
    return () => obs.disconnect();
  }, []);

  const founders = [
  {
    id: 'tang', name: 'Tang', role: 'Former President',
    image: 'src/assets/tang-kai-hoe.png',
    bgColor: '#E0F4FC',
    quotes: {
      zh: '"我的愿景，是希望每一个家庭都有机会拥有属于自己的望远镜。通过 StarFinder，我们希望让天文更贴近日常生活，让孩子在家人的陪伴下探索星空、学习科学，并培养对宇宙的好奇心。即使是家里的阳台或后院，也可以成为孩子开始认识宇宙的小小天文台。"',
      en: '"My vision is for every family to have the opportunity to own a telescope. Through StarFinder, we hope to bring astronomy closer to everyday life, giving children the chance to explore the night sky, learn science, and grow their curiosity together with their families. Even a balcony or backyard can become a small observatory where children begin their journey to discover the universe."',
      ms: '"Visi saya adalah agar setiap keluarga berpeluang memiliki teleskop sendiri. Melalui StarFinder, kami ingin mendekatkan astronomi dengan kehidupan harian, supaya anak-anak dapat mengenali langit malam, mempelajari sains, dan membina rasa ingin tahu bersama keluarga. Balkoni atau halaman rumah anda juga boleh menjadi balai cerap kecil untuk anak-anak meneroka alam semesta."'
    },
    themeLabels: { zh: '家庭天文愿景', en: 'Family Astronomy Vision', ms: 'Visi Astronomi Keluarga' }
  },
  {
    id: 'fongky', name: 'Fongky', role: 'Former President',
    image: 'src/assets/fong-keng-yin.png',
    bgColor: '#D4EDFC',
    quotes: {
      zh: '"当你完成了自制望远镜的一刻，就开始了你的终身旅程。经常用它来观测奇妙的天空从而建立你的天文学知识，并与他人分享。你和你的小小望远镜就是天文大使!"',
      en: '"The moment you have completed your DIY telescope is the beginning of your lifelong journey. Use it as often as possible to observe the wonder in the sky. Start building your knowledge in astronomy and share it with others. You and your tiny telescope are the ambassador of astronomy!"',
      ms: '"Sebaik sahaja anda siap membuat teleskop buatan sendiri, anda memulakan perjalanan seumur hidup anda. Gunakannya dengan sekerap mungkin untuk mencerap keajaiban di langit, membina pengetahuan astronomi anda, dan berkongsi dengan orang lain. Anda dan teleskop kecil anda adalah duta astronomi!"'
    },
    themeLabels: { zh: '学习、分享和探索', en: 'Learn, share and explore', ms: 'Belajar, kongsi dan terokai' }
  },
  {
    id: 'fyenx', name: 'Fyenx', role: 'Current President',
    image: 'src/assets/fyenx-goh.png',
    bgColor: '#F0E8D8',
    quotes: {
      zh: '"最美的星空，是和家人一起欣赏的星空。DIY 望远镜不只是看星星的工具，它也是让孩子和父母一起相处、一起动手、一起提问，并一起发现宇宙奥秘的美好方式。通过 StarFinder，我们希望更多家庭可以一起制作望远镜，把它带回家，并创造属于一家人的美好回忆。"',
      en: '"The night sky becomes even more beautiful when enjoyed together with family. A DIY telescope is more than a tool for looking at stars. It is a meaningful way for children and parents to spend time together, build together, ask questions, and discover the wonders of the universe. Through StarFinder, we hope more families can build a telescope together, bring it home, and create beautiful memories as a family."',
      ms: '"Langit malam menjadi lebih indah apabila dinikmati bersama keluarga. Teleskop DIY bukan sekadar alat untuk melihat bintang, tetapi juga satu pengalaman bermakna untuk anak-anak dan ibu bapa meluangkan masa bersama, membina bersama, bertanya soalan, dan menemui keajaiban alam semesta. Melalui StarFinder, kami berharap lebih banyak keluarga dapat membina teleskop bersama, membawanya pulang, dan mencipta kenangan indah seisi keluarga."'
    },
    themeLabels: { zh: '家庭星空回忆', en: 'Family Sky Memories', ms: 'Kenangan Langit Keluarga' }
  }];


  /* ---- gold sparkles scattered around each character ---- */
  const Sparkles = ({ seed }) => {
    const marks = React.useMemo(() => {
      const rng = (s) => {s = (s * 9301 + 49297) % 233280;return s / 233280;};
      let s = seed;
      // positions hug the upper sides of the character, like the reference
      const spots = [
      { left: 6, top: 14 }, { left: 14, top: 42 }, { left: 2, top: 64 },
      { left: 90, top: 10 }, { left: 84, top: 36 }, { left: 95, top: 58 },
      { left: 24, top: 4 }, { left: 72, top: 2 }];

      return spots.map((p, i) => {
        s = (s + i + 1) * 7;
        return {
          ...p,
          size: 7 + rng(s * 11) * 9,
          delay: rng(s * 13) * 3,
          dur: 2.2 + rng(s * 17) * 2.4,
          star: rng(s * 5) > 0.5
        };
      });
    }, [seed]);

    return (
      <div style={{ position: 'absolute', inset: '-12% -10%', pointerEvents: 'none', zIndex: 2 }}>
        {marks.map((m, i) =>
        <span key={i} style={{
          position: 'absolute', left: `${m.left}%`, top: `${m.top}%`,
          width: m.size, height: m.size,
          color: 'var(--gold-deep)',
          opacity: 0.9,
          animation: `twinkle ${m.dur}s ease-in-out ${m.delay}s infinite`,
          display: 'inline-block', lineHeight: 0
        }}>
            <svg viewBox="0 0 24 24" width={m.size} height={m.size} fill="currentColor" aria-hidden="true">
              {m.star ?
            <path d="M12 0l2.4 8.2L22 10.5l-6.6 4 1.9 8.5L12 18.6 6.7 23l1.9-8.5-6.6-4 7.6-2.3z" /> :
            <path d="M12 2l1.1 8.9L22 12l-8.9 1.1L12 22l-1.1-8.9L2 12l8.9-1.1z" />}
            </svg>
          </span>
        )}
      </div>);

  };

  return (
    <section ref={sectionRef} className="r-section founders-section" style={{

      background: 'transparent',
      position: 'relative', overflow: 'visible', padding: '0 60px 80px'
    }}>
      {/* Background ambient stars removed — global StarryBackground handles this */}

      {/* Section header */}
      <div style={{ textAlign: 'center', marginBottom: 'clamp(32px, 5vw, 56px)', position: 'relative', zIndex: 1 }}>
        <h2 className="display" style={{
          fontSize: 'clamp(28px, 5vw, 48px)', color: 'var(--cream)',
          marginBottom: 12, letterSpacing: '-0.02em'
        }}>
          {language === 'zh' ? '家庭 · 星空 · 梦想' : language === 'en' ? 'Family · Stars · Dreams' : 'Keluarga · Bintang · Impian'}
        </h2>
        <p style={{
          fontSize: 'clamp(14px, 2.5vw, 20px)', color: 'var(--cream-soft)', margin: 0
        }}>
          {language === 'zh' ? '了解推动 StarFinder 发展的先驱们的故事' :
          language === 'en' ? "Meet the pioneers behind StarFinder's mission" :
          'Berkenalan dengan para pelopor di balik misi StarFinder'}
        </p>
      </div>

      {/* Cards grid */}
      <div className="founders-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 'clamp(20px, 2.5vw, 36px)',
        maxWidth: 1200, margin: '0 auto',
        marginTop: 'clamp(150px, 19vw, 210px)',
        position: 'relative', zIndex: 1
      }}>
        {founders.map((f, i) =>
        <div key={f.id} className="founder-card" data-idx={i} style={{
          position: 'relative',
          background: 'var(--navy-1)',
          borderRadius: 18,
          border: '1px solid var(--line)',
          boxShadow: '0 18px 44px rgba(26,40,69,0.10)',
          padding: 'clamp(22px, 2.6vw, 30px)',
          paddingTop: 'clamp(46px, 4vw, 58px)',
          display: 'flex', flexDirection: 'column', gap: 8,
          opacity: 1,
          transform: 'translateY(0)',
        }}>
            {/* Character — stands above the card, feet overlapping the top edge */}
            <div style={{
            position: 'absolute', left: 0, right: 0, top: 0,
            display: 'flex', justifyContent: 'center',
            transform: 'translateY(calc(-100% + 54px))',
            pointerEvents: 'none', zIndex: 3
          }}>
              <div style={{ position: 'relative' }}>
                <Sparkles seed={i * 100 + 7} />
                <img
                src={f.image} alt={f.name}
                style={{
                  position: 'relative', zIndex: 1, display: 'block',
                  height: 'clamp(190px, 23vw, 250px)', width: 'auto',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 14px 18px rgba(26,40,69,0.18))'
                }} />
              
              </div>
            </div>

            {/* Theme label */}
            <span style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '0.07em',
            textTransform: 'uppercase', color: '#D4940A',
            display: 'inline-block'
          }}>{f.themeLabels[language]}</span>

            {/* Name */}
            <h3 style={{
            fontSize: 'clamp(17px, 1.9vw, 21px)', fontWeight: 800,
            color: 'var(--cream)', margin: 0, lineHeight: 1.25, letterSpacing: '-0.01em'
          }}>{f.name}</h3>

            {/* Role */}
            <span style={{
            fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em',
            color: '#D4940A', fontWeight: 600
          }}>{f.role}</span>

            {/* Divider */}
            <div style={{
            width: 36, height: 2, borderRadius: 1,
            background: 'linear-gradient(90deg, var(--gold), transparent)',
            margin: '8px 0 4px'
          }}></div>

            {/* Quote */}
            <p style={{
            fontSize: 'clamp(13px, 1.4vw, 15px)', lineHeight: 1.8,
            color: 'var(--cream-soft)', margin: 0,
            fontStyle: 'italic', textWrap: 'pretty'
          }}>{f.quotes[language]}</p>
          </div>
        )}
      </div>
    </section>);

};

Object.assign(window, { FoundersSection });