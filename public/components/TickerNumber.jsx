// TickerNumber — animate currency strings digit-by-digit.
// Each digit column scrolls vertically to its new value.
// Non-digit chars (".", ",") render as static punctuation.

const { useMemo } = React;

function TickerDigit({ value, isPunct, punctChar }) {
  if (isPunct) {
    return (
      <span className="ticker-digit punct">
        <span className="ticker-digit-inner"><span>{punctChar}</span></span>
      </span>
    );
  }
  const offset = -value * 1.05;
  return (
    <span className="ticker-digit" aria-hidden="true">
      <span className="ticker-digit-inner" style={{ transform: `translateY(${offset}em)` }}>
        {'0123456789'.split('').map((d) => (<span key={d}>{d}</span>))}
      </span>
    </span>
  );
}

function TickerNumber({ value }) {
  // value: formatted string like "1,234.56"
  const cells = useMemo(() => {
    return value.split('').map((ch, i) => {
      if (/\d/.test(ch)) return { key: i, isPunct: false, value: parseInt(ch, 10) };
      return { key: i, isPunct: true, punctChar: ch };
    });
  }, [value]);

  return (
    <span className="ticker" aria-label={value} key={value.length}>
      {cells.map((c) => (
        <TickerDigit key={c.key} value={c.value} isPunct={c.isPunct} punctChar={c.punctChar} />
      ))}
    </span>
  );
}

window.TickerNumber = TickerNumber;
