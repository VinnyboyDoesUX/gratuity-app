// CustomTip — type-in % that overrides tier when non-empty.

function CustomTip({ value, onChange }) {
  return (
    <div className="custom-row">
      <span className="custom-label">Custom %</span>
      <label className="custom-input-wrap">
        <input
          className="custom-input"
          type="number"
          inputMode="decimal"
          placeholder="—"
          min="0"
          max="999"
          step="0.5"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <span className="custom-suffix">%</span>
      </label>
    </div>
  );
}

window.CustomTip = CustomTip;
