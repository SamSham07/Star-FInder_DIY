/* Glassmorphism card component with frosted glass effect */

function GlassCard({ children, style = {} }) {
  return (
    <div style={{
      background: 'rgba(15, 29, 48, 0.7)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      border: '1px solid rgba(255, 250, 205, 0.15)',
      borderRadius: 16,
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      ...style,
    }}>
      {children}
    </div>
  );
}

Object.assign(window, { GlassCard });
