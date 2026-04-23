// TierSelector — 4 cards: Bad / Decent / Good / Unhinged
// Selecting a tier triggers different haptic patterns and fx.

const TIERS = [
  { key: 'bad',      label: 'Bad',      pct: 10,  glyph: '!',  cls: 't-bad' },
  { key: 'decent',   label: 'Decent',   pct: 18,  glyph: '·',  cls: 't-decent' },
  { key: 'good',     label: 'Good',     pct: 25,  glyph: '✦',  cls: 't-good' },
  { key: 'unhinged', label: 'Unhinged', pct: 100, glyph: '∞',  cls: 't-unhinged' },
];

window.TIERS = TIERS;

function TierSelector({ activeKey, onPick, activePct, useCustom }) {
  return (
    <section className="tier-rail" data-screen-label="Tip Tier Selector">
      <div className="tier-header">
        <span className="tier-eyebrow">Tip Tier</span>
        <span className="tier-pct">
          {useCustom ? 'custom' : activePct + '%'}
        </span>
      </div>
      <div className="tier-grid">
        {TIERS.map((t) => {
          const active = !useCustom && activeKey === t.key;
          return (
            <button
              key={t.key}
              type="button"
              className={'tier-card ' + t.cls + (active ? ' active' : '')}
              onClick={() => onPick(t.key)}
              aria-pressed={active}
            >
              <span className="tier-glyph">{t.glyph}</span>
              <span className="tier-value">{t.pct}%</span>
              <span className="tier-label">{t.label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

window.TierSelector = TierSelector;
