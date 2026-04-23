// BillHero — the big serif check-total readout.
// Tap anywhere to summon the system keyboard via hidden input.
// Shows $ + whole + ".dd" with a blinking caret while focused.

const { useEffect, useRef, useState } = React;

function BillHero({ billStr, setBillStr, focused, setFocused, pulseKey }) {
  const wrapRef = useRef(null);
  const TN = window.TickerNumber;

  const cents = parseInt(billStr.replace(/\D/g, '') || '0', 10);
  const amount = cents / 100;
  const isEmpty = cents === 0;

  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  // Split whole / decimal
  const [wholePart, decPart] = formatted.split('.');

  const handleTap = () => {
    const input = document.getElementById('bill-input');
    if (input) {
      input.focus();
      // mobile Safari sometimes needs a click too
      setTimeout(() => input.focus(), 20);
    }
  };

  // wire the hidden input
  useEffect(() => {
    const input = document.getElementById('bill-input');
    if (!input) return;
    // reflect current value so cursor behaves
    input.value = billStr === '0' ? '' : String(cents);

    const onInput = (e) => {
      const digits = e.target.value.replace(/\D/g, '').slice(0, 9); // cap at 9 digits (~$9.9M)
      setBillStr(digits.length ? digits : '0');
      window.haptics && window.haptics.tick();
    };
    const onFocus = () => setFocused(true);
    const onBlur = () => setFocused(false);
    const onKey = (e) => {
      // catch backspace pulse for empty too
      if (e.key === 'Backspace' || /^[0-9]$/.test(e.key)) {
        window.haptics && window.haptics.tick();
      }
    };

    input.addEventListener('input', onInput);
    input.addEventListener('focus', onFocus);
    input.addEventListener('blur', onBlur);
    input.addEventListener('keydown', onKey);
    return () => {
      input.removeEventListener('input', onInput);
      input.removeEventListener('focus', onFocus);
      input.removeEventListener('blur', onBlur);
      input.removeEventListener('keydown', onKey);
    };
  }, [billStr, cents, setBillStr, setFocused]);

  return (
    <section
      className="bill-hero"
      onClick={handleTap}
      data-screen-label="Bill Hero"
    >
      <label className="bill-eyebrow">Check Total</label>

      <div
        ref={wrapRef}
        className={'bill-amount' + (isEmpty ? ' empty' : '') + (pulseKey ? ' pulse-on-key' : '')}
        key={pulseKey}
      >
        <span className="dollar">$</span>
        <span className="whole">
          <TN value={wholePart} />
        </span>
        <span className="decimal">
          .<TN value={decPart} />
        </span>
        {focused && <span className="bill-caret" />}
      </div>

      <div className="bill-underline" />

      <div className="bill-hint" style={{ opacity: isEmpty && !focused ? 1 : 0 }}>
        Tap to enter amount
      </div>
    </section>
  );
}

window.BillHero = BillHero;
