"use client";

import { useState, useCallback, useEffect, useMemo } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

type TierKey = "bad" | "decent" | "good" | "unhinged";
type UnhingedStyle = "glitch" | "matrix" | "casino";

// ── Constants ─────────────────────────────────────────────────────────────────

const TIERS = [
  { key: "bad"      as TierKey, label: "Bad",      pct: 10,  glyph: "!",  cls: "t-bad" },
  { key: "decent"   as TierKey, label: "Decent",   pct: 18,  glyph: "·",  cls: "t-decent" },
  { key: "good"     as TierKey, label: "Good",     pct: 25,  glyph: "✦",  cls: "t-good" },
  { key: "unhinged" as TierKey, label: "Unhinged", pct: 100, glyph: "∞",  cls: "t-unhinged" },
] as const;

// ── Haptics ───────────────────────────────────────────────────────────────────

function safe(pattern: number | number[]) {
  if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
    try { navigator.vibrate(pattern); } catch {}
  }
}
const haptics = {
  tick:     () => safe(8),
  soft:     () => safe(12),
  pulse:    () => safe([18, 40, 22]),
  chaos:    () => safe([6, 18, 10, 24, 8, 32, 14, 18, 10, 40, 6, 22]),
  unhinged: () => safe([80, 30, 80, 30, 160]),
};

// ── TickerNumber ──────────────────────────────────────────────────────────────

function TickerDigit({ value, isPunct, punctChar }: { value?: number; isPunct: boolean; punctChar?: string }) {
  if (isPunct) {
    return (
      <span className="ticker-digit punct">
        <span className="ticker-digit-inner"><span>{punctChar}</span></span>
      </span>
    );
  }
  const offset = -(value ?? 0) * 1.05;
  return (
    <span className="ticker-digit" aria-hidden="true">
      <span className="ticker-digit-inner" style={{ transform: `translateY(${offset}em)` }}>
        {"0123456789".split("").map((d) => <span key={d}>{d}</span>)}
      </span>
    </span>
  );
}

function TickerNumber({ value }: { value: string }) {
  const cells = useMemo(() =>
    value.split("").map((ch, i) =>
      /\d/.test(ch)
        ? { key: i, isPunct: false as const, value: parseInt(ch, 10) }
        : { key: i, isPunct: true  as const, punctChar: ch }
    ), [value]);

  return (
    <span className="ticker" aria-label={value} key={value.length}>
      {cells.map(({ key, ...rest }) => <TickerDigit key={key} {...rest} />)}
    </span>
  );
}

// ── UnhingedFX ────────────────────────────────────────────────────────────────

function UnhingedFX({ active, style }: { active: boolean; style: UnhingedStyle }) {
  const cols = useMemo(() => {
    if (!active || style !== "matrix") return [];
    const chars = "$¢€£¥0123456789%∞";
    return Array.from({ length: 14 }, (_, i) => {
      let s = "";
      const len = 16 + Math.floor(Math.random() * 18);
      for (let j = 0; j < len; j++) s += chars[Math.floor(Math.random() * chars.length)] + "\n";
      return {
        left: (i / 14) * 100 + (Math.random() * 4 - 2),
        duration: 4 + Math.random() * 6,
        delay: -Math.random() * 6,
        text: s,
        opacity: 0.35 + Math.random() * 0.5,
      };
    });
  }, [active, style]);

  const coins = useMemo(() => {
    if (!active || style !== "casino") return [];
    return Array.from({ length: 26 }, () => ({
      left: Math.random() * 100,
      duration: 2.4 + Math.random() * 3,
      delay: -Math.random() * 5,
      size: 10 + Math.random() * 16,
    }));
  }, [active, style]);

  if (!active) return null;

  if (style === "matrix") {
    return (
      <div className="fx-layer" aria-hidden="true">
        {cols.map((c, i) => (
          <div key={i} className="matrix-col" style={{
            left: c.left + "%",
            animationDuration: c.duration + "s",
            animationDelay: c.delay + "s",
            opacity: c.opacity,
          }}>{c.text}</div>
        ))}
        <div className="fx-scanlines" />
        <div className="fx-vignette" />
      </div>
    );
  }

  if (style === "casino") {
    return (
      <div className="fx-layer" aria-hidden="true">
        {coins.map((c, i) => (
          <div key={i} className="coin" style={{
            left: c.left + "%",
            width: c.size,
            height: c.size,
            animationDuration: c.duration + "s",
            animationDelay: c.delay + "s",
          }} />
        ))}
        <div className="fx-vignette" />
      </div>
    );
  }

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

// ── TweaksPanel ───────────────────────────────────────────────────────────────

function TweaksPanel({ open, onClose, unhingedStyle, setUnhingedStyle }: {
  open: boolean;
  onClose: () => void;
  unhingedStyle: UnhingedStyle;
  setUnhingedStyle: (s: UnhingedStyle) => void;
}) {
  if (!open) return null;
  return (
    <div className="tweaks-scrim" onClick={onClose}>
      <div className="tweaks-sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Tweaks">
        <div className="tweaks-grip" />
        <div className="tweaks-title">Tweaks</div>
        <div className="tweak-group">
          <span className="tweak-group-label">Unhinged Style</span>
          <div className="tweak-options">
            {(["glitch", "matrix", "casino"] as const).map((k) => (
              <button
                key={k}
                className={"tweak-opt" + (unhingedStyle === k ? " active" : "")}
                onClick={() => setUnhingedStyle(k)}
              >
                {k.charAt(0).toUpperCase() + k.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div style={{ textAlign: "center", fontSize: "0.6875rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--g-fg-dim)", marginTop: "1rem" }}>
          Tap Unhinged to preview
        </div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function GratuityCalculator() {
  const [billStr,      setBillStr]      = useState("0");
  const [focused,      setFocused]      = useState(false);
  const [activeTier,   setActiveTier]   = useState<TierKey>("decent");
  const [customPct,    setCustomPct]    = useState("");
  const [pulseKey,     setPulseKey]     = useState(0);
  const [tweaksOpen,   setTweaksOpen]   = useState(false);
  const [unhingedStyle, setUnhingedStyle] = useState<UnhingedStyle>("glitch");

  const cents      = parseInt(billStr.replace(/\D/g, "") || "0", 10);
  const billAmount = cents / 100;

  const tierPct   = TIERS.find((t) => t.key === activeTier)?.pct ?? 18;
  const customNum = parseFloat(customPct);
  const useCustom = customPct !== "" && !isNaN(customNum) && customNum >= 0;
  const activePct = useCustom ? customNum : tierPct;
  const isUnhinged = activeTier === "unhinged" && !useCustom;

  const tipAmount = Math.round(billAmount * activePct) / 100;
  const totalDue  = billAmount + tipAmount;

  useEffect(() => { setPulseKey((k) => k + 1); }, [billStr]);

  // Wire the hidden system-keyboard input
  useEffect(() => {
    const input = document.getElementById("bill-input") as HTMLInputElement | null;
    if (!input) return;
    input.value = billStr === "0" ? "" : String(cents);

    const onInput = (e: Event) => {
      const digits = (e.target as HTMLInputElement).value.replace(/\D/g, "").slice(0, 9);
      setBillStr(digits.length ? digits : "0");
      haptics.tick();
    };
    const onFocus = () => setFocused(true);
    const onBlur  = () => setFocused(false);
    const onKey   = (e: KeyboardEvent) => {
      if (e.key === "Backspace" || /^[0-9]$/.test(e.key)) haptics.tick();
    };

    input.addEventListener("input", onInput);
    input.addEventListener("focus", onFocus);
    input.addEventListener("blur",  onBlur);
    input.addEventListener("keydown", onKey);
    return () => {
      input.removeEventListener("input", onInput);
      input.removeEventListener("focus", onFocus);
      input.removeEventListener("blur",  onBlur);
      input.removeEventListener("keydown", onKey);
    };
  }, [billStr, cents]);

  const handleTap = () => {
    const input = document.getElementById("bill-input") as HTMLInputElement | null;
    if (input) { input.focus(); setTimeout(() => input.focus(), 20); }
  };

  const handlePick = useCallback((key: TierKey) => {
    setActiveTier(key);
    setCustomPct("");
    if (key === "unhinged") haptics.unhinged();
    else if (key === "good") haptics.pulse();
    else haptics.soft();
  }, []);

  const handleCustom = useCallback((v: string) => {
    setCustomPct(v);
    haptics.tick();
  }, []);

  const formatted = billAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const [wholePart, decPart] = formatted.split(".");
  const isEmpty = cents === 0;

  const tipFormatted   = tipAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const totalFormatted = totalDue.toLocaleString("en-US",  { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const shellCls = "shell tier-" + (isUnhinged ? "unhinged" : useCustom ? "decent" : activeTier);

  return (
    <div className={shellCls}>
      {/* Hidden system-keyboard input */}
      <input
        id="bill-input"
        type="tel"
        inputMode="decimal"
        autoComplete="off"
        style={{ position: "fixed", opacity: 0, pointerEvents: "none", top: 0, left: 0, width: "1px", height: "1px" }}
      />

      <div className="shell-inner" style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: "100dvh" }}>

        {/* Header */}
        <header className="header">
          <button
            type="button"
            className="header-btn"
            onClick={() => { setBillStr("0"); setCustomPct(""); haptics.soft(); }}
            aria-label="Clear"
            title="Clear"
          >
            <span style={{ fontFamily: "var(--g-font-display)", fontSize: "1rem", fontStyle: "italic" }}>×</span>
          </button>
          <span className="header-mark">GRATUITY</span>
          <button
            type="button"
            className={"header-btn" + (tweaksOpen ? " active" : "")}
            onClick={() => setTweaksOpen((v) => !v)}
            aria-label="Tweaks"
            title="Tweaks"
          >
            <span style={{ fontFamily: "var(--g-font-display)", fontSize: "1rem", letterSpacing: "0.08em" }}>⋯</span>
          </button>
        </header>

        {/* Bill Hero */}
        <section className="bill-hero" onClick={handleTap} data-screen-label="Bill Hero">
          <label className="bill-eyebrow">Check Total</label>
          <div
            className={"bill-amount" + (isEmpty ? " empty" : "") + (pulseKey ? " pulse-on-key" : "")}
            key={pulseKey}
          >
            <span className="dollar">$</span>
            <span className="whole"><TickerNumber value={wholePart} /></span>
            <span className="decimal">.<TickerNumber value={decPart} /></span>
            {focused && <span className="bill-caret" />}
          </div>
          <div className="bill-underline" />
          <div className="bill-hint" style={{ opacity: isEmpty && !focused ? 1 : 0 }}>
            Tap to enter amount
          </div>
        </section>

        {/* Tier Selector */}
        <section className="tier-rail" data-screen-label="Tip Tier Selector">
          <div className="tier-header">
            <span className="tier-eyebrow">Tip Tier</span>
            <span className="tier-pct">{useCustom ? "custom" : activePct + "%"}</span>
          </div>
          <div className="tier-grid">
            {TIERS.map((t) => {
              const active = !useCustom && activeTier === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  className={"tier-card " + t.cls + (active ? " active" : "")}
                  onClick={() => handlePick(t.key)}
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

        {/* Custom Tip */}
        <div className="custom-row">
          <span className="custom-label">Custom %</span>
          <label className="custom-input-wrap">
            <input
              className="custom-input"
              type="number"
              inputMode="decimal"
              placeholder="—"
              min={0}
              max={999}
              step={0.5}
              value={customPct}
              onChange={(e) => handleCustom(e.target.value)}
            />
            <span className="custom-suffix">%</span>
          </label>
        </div>

        {/* Summary */}
        <section className="summary" data-screen-label="Summary">
          <div className="summary-card s-tip">
            <span className="s-label">Tip Amount</span>
            <span className="s-value">
              <span className="sd">$</span>
              <TickerNumber value={tipFormatted} />
            </span>
          </div>
          <div className="summary-card s-total">
            <span className="s-label">Total Due</span>
            <span className="s-value">
              <span className="sd">$</span>
              <TickerNumber value={totalFormatted} />
            </span>
          </div>
        </section>

      </div>

      <UnhingedFX active={isUnhinged} style={unhingedStyle} />

      <TweaksPanel
        open={tweaksOpen}
        onClose={() => setTweaksOpen(false)}
        unhingedStyle={unhingedStyle}
        setUnhingedStyle={(s) => { setUnhingedStyle(s); haptics.chaos(); }}
      />
    </div>
  );
}
