// UnhingedFX — the chaos overlay. Three styles: glitch, matrix, casino.
// Only renders when activeTier === 'unhinged'.

const { useMemo: useMemoFX } = React;

function UnhingedFX({ active, style }) {
  if (!active) return null;

  if (style === 'matrix') {
    const cols = useMemoFX(() => {
      const arr = [];
      const chars = '$¢€£¥0123456789%∞';
      const count = 14;
      for (let i = 0; i < count; i++) {
        let s = '';
        const len = 16 + Math.floor(Math.random() * 18);
        for (let j = 0; j < len; j++) s += chars[Math.floor(Math.random()*chars.length)] + '\n';
        arr.push({
          left: (i / count) * 100 + (Math.random() * 4 - 2),
          duration: 4 + Math.random() * 6,
          delay: -Math.random() * 6,
          text: s,
          opacity: 0.35 + Math.random() * 0.5,
        });
      }
      return arr;
    }, []);
    return (
      <div className="fx-layer" aria-hidden="true">
        {cols.map((c, i) => (
          <div
            key={i}
            className="matrix-col"
            style={{
              left: c.left + '%',
              animationDuration: c.duration + 's',
              animationDelay: c.delay + 's',
              opacity: c.opacity,
            }}
          >{c.text}</div>
        ))}
        <div className="fx-scanlines" />
        <div className="fx-vignette" />
      </div>
    );
  }

  if (style === 'casino') {
    const coins = useMemoFX(() => {
      const arr = [];
      for (let i = 0; i < 26; i++) {
        arr.push({
          left: Math.random() * 100,
          duration: 2.4 + Math.random() * 3,
          delay: -Math.random() * 5,
          size: 10 + Math.random() * 16,
        });
      }
      return arr;
    }, []);
    return (
      <div className="fx-layer" aria-hidden="true">
        {coins.map((c, i) => (
          <div
            key={i}
            className="coin"
            style={{
              left: c.left + '%',
              width: c.size, height: c.size,
              animationDuration: c.duration + 's',
              animationDelay: c.delay + 's',
            }}
          />
        ))}
        <div className="fx-vignette" />
      </div>
    );
  }

  // glitch (default)
  return (
    <div className="fx-layer" aria-hidden="true">
      <div className="glitch-bar b1" />
      <div className="glitch-bar b2" />
      <div className="glitch-bar b3" />
      <div className="glitch-bar b4" />
      <div className="fx-scanlines" />
      <div className="fx-invert-burst" />
      <div className="fx-vignette" />
    </div>
  );
}

window.UnhingedFX = UnhingedFX;
