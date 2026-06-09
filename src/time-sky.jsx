/* Time-based sky background */

function getTimeBasedSky() {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 7) {
    // Early morning
    return {
      bg: 'linear-gradient(180deg, #87CEEB 0%, #FFB6C1 50%, #FFD700 100%)',
      starOpacity: 0.1,
      label: 'dawn',
    };
  } else if (hour >= 7 && hour < 11) {
    // Morning
    return {
      bg: 'linear-gradient(180deg, #87CEEB 0%, #E0F6FF 100%)',
      starOpacity: 0,
      label: 'morning',
    };
  } else if (hour >= 11 && hour < 15) {
    // Noon
    return {
      bg: 'linear-gradient(180deg, #1E90FF 0%, #87CEEB 100%)',
      starOpacity: 0,
      label: 'noon',
    };
  } else if (hour >= 15 && hour < 18) {
    // Afternoon
    return {
      bg: 'linear-gradient(180deg, #87CEEB 0%, #FFD700 50%, #FF8C00 100%)',
      starOpacity: 0.1,
      label: 'afternoon',
    };
  } else if (hour >= 18 && hour < 20) {
    // Dusk
    return {
      bg: 'linear-gradient(180deg, #FF8C00 0%, #8B008B 50%, #0B192C 100%)',
      starOpacity: 0.5,
      label: 'dusk',
    };
  } else if (hour >= 20 && hour < 22) {
    // Evening
    return {
      bg: 'linear-gradient(180deg, #1a2b4d 0%, #0f1d2d 100%)',
      starOpacity: 1,
      label: 'evening',
    };
  } else {
    // Night
    return {
      bg: 'linear-gradient(180deg, #0a1420 0%, #0f1d30 100%)',
      starOpacity: 1,
      label: 'night',
    };
  }
}

function getDynamicGreeting(lang) {
  const hour = new Date().getHours();
  const greetings = window.T[lang]?.greeting || {};
  
  if (hour >= 5 && hour < 12) return greetings.morning;
  if (hour >= 12 && hour < 15) return greetings.noon;
  if (hour >= 15 && hour < 18) return greetings.afternoon;
  if (hour >= 18 && hour < 22) return greetings.evening;
  return greetings.night || greetings.late;
}

Object.assign(window, { getTimeBasedSky, getDynamicGreeting });
