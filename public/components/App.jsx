// App — the main shell. Wires tiers, custom tip, unhinged fx, tweaks.

const { useState: useS, useEffect: useE, useRef: useR, useCallback: useCb, useMemo: useM } = React;

// Tweak defaults — persistable via edit-mode-set-keys
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "unhingedStyle": "glitch"
}/*EDITMODE-END*/;

function App() {
  const [billStr, setBillStr] = useS('0');
  const [focused, setFocused] = useS(false);
  const [activeTier, setActiveTier] = useS('decent'); // bad | decent | good | unhinged
  const [customPct, setCustomPct] = useS('');
  const [pulseKey, setPulseKey] = useS(0);
  const [tweaksOpen, setTweaksOpen] = useS(false);
  const [unhingedStyle, setUnhingedStyle] = useS(TWEAK_DEFAULTS.unhingedStyle);
  const [editMode, setEditMode] = useS(false);

  const cents = parseInt(billStr.replace(/\D/g, '') || '0', 10);
  const billAmount = cents / 100;

  const tierPct = useM(() => {
    const t = (window.TIERS || []).find(x => x.key === activeTier);
    return t ? t.pct : 18;
  }, [activeTier]);

  const customNum = parseFloat(customPct);
  const useCustom = customPct !== '' && !isNaN(customNum) && customNum >= 0;
  const activePct = useCustom ? customNum : tierPct;

  // Unhinged mode is only when selected tier is unhinged AND not overridden by custom
  const isUnhinged = activeTier === 'unhinged' && !useCustom;

  // Math
  const tipAmount = Math.round(billAmount * activePct) / 100;
  const totalDue = billAmount + tipAmount;

  // Pulse on keypress — bumps key, re-triggering css animation
  useE(() => {
    setPulseKey((k) => k + 1);
  }, [billStr]);

  // Pick tier -> haptics
  const handlePick = useCb((key) => {
    setActiveTier(key);
    setCustomPct(''); // picking a tier overrides custom
    if (key === 'unhinged') {
      window.haptics && window.haptics.unhinged();
    } else if (key === 'good') {
      window.haptics && window.haptics.pulse();
    } else {
      window.haptics && window.haptics.soft();
    }
  }, []);

  // When user types custom %, soft haptic
  const handleCustom = useCb((v) => {
    setCustomPct(v);
    window.haptics && window.haptics.tick();
  }, []);

  // Edit-mode protocol — register listener FIRST, then announce
  useE(() => {
    const handler = (ev) => {
      const d = ev.data || {};
      if (d.type === '__activate_edit_mode') {
        setEditMode(true);
        setTweaksOpen(true);
      } else if (d.type === '__deactivate_edit_mode') {
        setEditMode(false);
        setTweaksOpen(false);
      }
    };
    window.addEventListener('message', handler);
    // announce availability
    try {
      window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    } catch (e) {}
    return () => window.removeEventListener('message', handler);
  }, []);

  // Persist unhinged style changes
  const changeUnhinged = useCb((v) => {
    setUnhingedStyle(v);
    try {
      window.parent.postMessage({
        type: '__edit_mode_set_keys',
        edits: { unhingedStyle: v },
      }, '*');
    } catch (e) {}
    window.haptics && window.haptics.chaos();
  }, []);

  // Auto-open keyboard on first load (mobile)
  useE(() => {
    const input = document.getElementById('bill-input');
    if (!input) return;
    // Only auto-focus if there's room (desktop) — don't force on mobile to avoid annoyance
    const t = setTimeout(() => {
      if (!document.activeElement || document.activeElement === document.body) {
        input.focus({ preventScroll: true });
      }
    }, 400);
    return () => clearTimeout(t);
  }, []);

  const shellCls =
    'shell tier-' + (isUnhinged ? 'unhinged' : (useCustom ? 'decent' : activeTier));

  const BillHero = window.BillHero;
  const TierSelector = window.TierSelector;
  const CustomTip = window.CustomTip;
  const Summary = window.Summary;
  const UnhingedFX = window.UnhingedFX;
  const TweaksPanel = window.TweaksPanel;

  return (
    <div className={shellCls}>
      <div className="shell-inner" style={{display:'flex',flexDirection:'column',flex:1,minHeight:'100dvh'}}>
        <header className="header" data-screen-label="Header">
          <button
            type="button"
            className="header-btn"
            onClick={() => {
              setBillStr('0');
              setCustomPct('');
              window.haptics && window.haptics.soft();
            }}
            aria-label="Clear"
            title="Clear"
          >
            <span style={{fontFamily:'var(--g-font-display)',fontSize:'1rem',fontStyle:'italic'}}>×</span>
          </button>
          <span className="header-mark">GRATUITY</span>
          <button
            type="button"
            className={'header-btn' + (tweaksOpen ? ' active' : '')}
            onClick={() => setTweaksOpen(v => !v)}
            aria-label="Tweaks"
            title="Tweaks"
          >
            <span style={{fontFamily:'var(--g-font-display)',fontSize:'1rem',letterSpacing:'0.08em'}}>⋯</span>
          </button>
        </header>

        <BillHero
          billStr={billStr}
          setBillStr={setBillStr}
          focused={focused}
          setFocused={setFocused}
          pulseKey={pulseKey}
        />

        <TierSelector
          activeKey={activeTier}
          onPick={handlePick}
          activePct={activePct}
          useCustom={useCustom}
        />

        <CustomTip value={customPct} onChange={handleCustom} />

        <Summary tipAmount={tipAmount} totalDue={totalDue} />
      </div>

      <UnhingedFX active={isUnhinged} style={unhingedStyle} />

      <TweaksPanel
        open={tweaksOpen}
        onClose={() => setTweaksOpen(false)}
        unhingedStyle={unhingedStyle}
        setUnhingedStyle={changeUnhinged}
      />
    </div>
  );
}

window.App = App;
