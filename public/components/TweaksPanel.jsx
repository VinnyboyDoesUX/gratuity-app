// TweaksPanel — edit-mode surface. Lets the user pick the unhinged style
// and the accent tier-value color. Only shown when edit mode is active.

function TweaksPanel({ open, onClose, unhingedStyle, setUnhingedStyle }) {
  if (!open) return null;

  const stopClick = (e) => e.stopPropagation();

  return (
    <div className="tweaks-scrim" onClick={onClose}>
      <div className="tweaks-sheet" onClick={stopClick} role="dialog" aria-label="Tweaks">
        <div className="tweaks-grip" />
        <div className="tweaks-title">Tweaks</div>

        <div className="tweak-group">
          <span className="tweak-group-label">Unhinged Style</span>
          <div className="tweak-options">
            {[
              { k: 'glitch', label: 'Glitch' },
              { k: 'matrix', label: 'Matrix' },
              { k: 'casino', label: 'Casino' },
            ].map((o) => (
              <button
                key={o.k}
                className={'tweak-opt' + (unhingedStyle === o.k ? ' active' : '')}
                onClick={() => setUnhingedStyle(o.k)}
              >{o.label}</button>
            ))}
          </div>
        </div>

        <div style={{textAlign:'center', fontSize:'0.6875rem', letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--g-fg-dim)', marginTop: '1rem'}}>
          Tap Unhinged to preview
        </div>
      </div>
    </div>
  );
}

window.TweaksPanel = TweaksPanel;
