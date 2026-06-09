/* Parallax scrolling effect */

const { useEffect: useEffectPx, useRef: useRefPx } = React;

function useParallax(speed = 0.5) {
  const ref = useRefPx(null);
  
  useEffectPx(() => {
    const onScroll = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const scrolled = window.scrollY;
      const elementTop = rect.top + scrolled;
      const distance = scrolled - (elementTop - window.innerHeight);
      const offset = distance * speed;
      ref.current.style.transform = `translateY(${offset}px)`;
    };
    
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [speed]);
  
  return ref;
}

Object.assign(window, { useParallax });
