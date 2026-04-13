"use client";

import { useState, useCallback } from "react";
import { calculate } from "@/utils/calculate";

const TIP_PRESETS = [15, 18, 20] as const;

function fmt(value: number) {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function GratuityCalculator() {
  const [billStr, setBillStr] = useState("0");
  const [tipPercent, setTipPercent] = useState(20);
  const [customPct, setCustomPct] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [numPeople, setNumPeople] = useState(2);
  const [tipOnSubtotal, setTipOnSubtotal] = useState(false);
  const [roundTip, setRoundTip] = useState(false);

  const billCents = parseInt(billStr.replace(/\D/g, "") || "0", 10);
  const billAmount = billCents / 100;
  const activePct = showCustom ? parseFloat(customPct) || 0 : tipPercent;

  const result = calculate({
    billAmount,
    taxAmount: 0,
    tipPercent: activePct,
    numPeople,
    tipOnSubtotal,
    roundTip,
  });

  const handleDigit = useCallback((digit: string) => {
    setBillStr((prev) => {
      const digits = (prev.replace(/\D/g, "") + digit).replace(/^0+/, "") || "0";
      if (parseInt(digits, 10) > 9999999) return prev;
      return digits;
    });
  }, []);

  const handleDouble0 = useCallback(() => {
    setBillStr((prev) => {
      const digits = (prev.replace(/\D/g, "") + "00").replace(/^0+/, "") || "0";
      if (parseInt(digits, 10) > 9999999) return prev;
      return digits;
    });
  }, []);

  const handleBackspace = useCallback(() => {
    setBillStr((prev) => {
      const digits = prev.replace(/\D/g, "");
      return digits.slice(0, -1) || "0";
    });
  }, []);

  const displayBill = fmt(billAmount);
  const showRoundUp = result.totalDue > 0 && result.roundUpTotal > result.totalDue + 0.001;
  const tipEach = numPeople > 1 ? result.tipAmount / numPeople : result.tipAmount;

  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", backgroundColor: "#141312", color: "#e6e1df", fontFamily: "var(--font-inter), system-ui, sans-serif" }}>

      {/* Fixed Header */}
      <header style={{ position: "fixed", top: 0, left: 0, width: "100%", zIndex: 50, display: "flex", justifyContent: "center", alignItems: "center", padding: "0 1.5rem", height: "4rem", backgroundColor: "#141312" }}>
        <h1 style={{ fontFamily: "var(--font-noto-serif), Georgia, serif", fontSize: "1.125rem", letterSpacing: "0.3em", color: "#D4AF37", margin: 0 }}>
          GRATUITY
        </h1>
      </header>

      {/* Scrollable content */}
      <main style={{ paddingTop: "6rem", paddingBottom: "3rem", paddingLeft: "1.5rem", paddingRight: "1.5rem", maxWidth: "32rem", width: "100%", margin: "0 auto", display: "flex", flexDirection: "column" }}>

        {/* Bill Entry */}
        <section style={{ marginBottom: "2rem", textAlign: "right" }}>
          <label style={{ display: "block", fontSize: "0.6875rem", letterSpacing: "0.2em", textTransform: "uppercase" as const, color: "#d0c5af", marginBottom: "0.5rem", fontFamily: "var(--font-inter), system-ui, sans-serif" }}>
            Check Total
          </label>
          <div>
            <div style={{ fontFamily: "var(--font-noto-serif), Georgia, serif", fontSize: "4rem", lineHeight: 1, color: "#e6e1df", letterSpacing: "-0.02em" }}>
              <span style={{ color: "rgba(242,202,80,0.3)", fontWeight: 300 }}>$</span>
              {displayBill}
            </div>
            <div style={{ height: "2px", marginTop: "0.5rem", background: "radial-gradient(ellipse at center, rgba(242,202,80,0.45) 0%, transparent 70%)", opacity: 0.7 }} />
          </div>
        </section>

        {/* Numpad */}
        <section style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1px", backgroundColor: "rgba(77,70,53,0.15)", borderRadius: "0.75rem", overflow: "hidden", marginBottom: "2rem" }}>
          {["1","2","3","4","5","6","7","8","9"].map((d) => (
            <NumpadKey key={d} label={d} onClick={() => handleDigit(d)} />
          ))}
          <NumpadKey label="00" onClick={handleDouble0} dim />
          <NumpadKey label="0" onClick={() => handleDigit("0")} />
          <NumpadKey label={<MaterialIcon name="backspace" />} onClick={handleBackspace} dim />
        </section>

        {/* Controls */}
        <section style={{ display: "flex", flexDirection: "column", gap: "2rem", marginBottom: "2.5rem" }}>

          {/* Subtotal toggle */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.75rem", textTransform: "uppercase" as const, letterSpacing: "0.12em", color: "rgba(208,197,175,0.8)", fontFamily: "var(--font-inter), system-ui, sans-serif" }}>
              Tip on subtotal only
            </span>
            <Toggle active={tipOnSubtotal} onToggle={() => setTipOnSubtotal((v) => !v)} label="Tip on subtotal only" />
          </div>

          {/* Tip % chips */}
          <div style={{ display: "flex", gap: "0.75rem" }}>
            {TIP_PRESETS.map((pct) => {
              const active = !showCustom && tipPercent === pct;
              return (
                <button
                  key={pct}
                  onClick={() => { setTipPercent(pct); setShowCustom(false); }}
                  className={`chip${active ? " chip-active" : ""}`}
                  style={{
                    flex: 1,
                    padding: "0.75rem 0.5rem",
                    borderRadius: "0.75rem",
                    fontSize: "0.875rem",
                    fontWeight: active ? 600 : 500,
                    fontFamily: "var(--font-inter), system-ui, sans-serif",
                    cursor: "pointer",
                    backgroundColor: active ? "transparent" : "#2b2a28",
                    color: active ? "#f2ca50" : "#d0c5af",
                    border: active ? "1px solid rgba(242,202,80,0.65)" : "1px solid transparent",
                  }}>
                  {pct}%
                </button>
              );
            })}
            {showCustom ? (
              <input
                type="number"
                min={0}
                max={100}
                value={customPct}
                onChange={(e) => setCustomPct(e.target.value)}
                placeholder="%"
                autoFocus
                style={{
                  flex: 1,
                  padding: "0.75rem 0.5rem",
                  borderRadius: "0.75rem",
                  fontSize: "0.875rem",
                  fontFamily: "var(--font-inter), system-ui, sans-serif",
                  backgroundColor: "#363433",
                  color: "#f2ca50",
                  border: "1px solid rgba(242,202,80,0.3)",
                  textAlign: "center" as const,
                  outline: "none",
                }}
              />
            ) : (
              <button
                onClick={() => setShowCustom(true)}
                className="chip"
                style={{ flex: 1, padding: "0.75rem 0.5rem", borderRadius: "0.75rem", backgroundColor: "#2b2a28", color: "#d0c5af", cursor: "pointer", border: "1px solid transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <MaterialIcon name="more_horiz" />
              </button>
            )}
          </div>

          {/* People splitter */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(54,52,51,0.6)", backdropFilter: "blur(20px)", padding: "0.25rem", borderRadius: "9999px", border: "1px solid rgba(77,70,53,0.12)" }}>
            <button
              onClick={() => setNumPeople((n) => Math.max(1, n - 1))}
              aria-label="Remove person"
              className="person-btn"
              style={{ width: "3rem", height: "3rem", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "9999px", color: "#d0c5af", cursor: "pointer", background: "none", border: "none" }}>
              <MaterialIcon name="remove" />
            </button>
            <span style={{ fontFamily: "var(--font-noto-serif), Georgia, serif", fontSize: "1.25rem", color: "#e6e1df" }}>
              {numPeople} {numPeople === 1 ? "person" : "people"}
            </span>
            <button
              onClick={() => setNumPeople((n) => Math.min(50, n + 1))}
              aria-label="Add person"
              className="person-btn"
              style={{ width: "3rem", height: "3rem", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "9999px", color: "#d0c5af", cursor: "pointer", background: "none", border: "none" }}>
              <MaterialIcon name="add" />
            </button>
          </div>
        </section>

        {/* Results */}
        <section style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Hero card */}
          <div style={{ padding: "2rem", borderRadius: "1.5rem", backgroundColor: "#1d1b1a", textAlign: "center" }}>
            <label style={{ display: "block", fontSize: "0.625rem", letterSpacing: "0.3em", textTransform: "uppercase" as const, color: "rgba(242,202,80,0.7)", marginBottom: "1rem", fontFamily: "var(--font-inter), system-ui, sans-serif" }}>
              Each Person Pays
            </label>
            <div style={{ fontFamily: "var(--font-noto-serif), Georgia, serif", fontSize: "3.5rem", lineHeight: 1, color: "#e6e1df", letterSpacing: "-0.02em", marginBottom: "0.5rem" }}>
              ${fmt(result.perPerson)}
            </div>
            <div style={{ fontSize: "0.75rem", color: "rgba(208,197,175,0.6)", letterSpacing: "0.1em", textTransform: "uppercase" as const, fontFamily: "var(--font-inter), system-ui, sans-serif" }}>
              Including ${fmt(tipEach)} tip each
            </div>
          </div>

          {/* Tip + Total */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <ResultCard label="Tip Amount" value={`$${fmt(result.tipAmount)}`} />
            <ResultCard label="Total Due"  value={`$${fmt(result.totalDue)}`} />
          </div>
        </section>

        {/* Round tip toggle */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "1.5rem" }}>
          <span style={{ fontSize: "0.75rem", textTransform: "uppercase" as const, letterSpacing: "0.12em", color: "rgba(208,197,175,0.8)", fontFamily: "var(--font-inter), system-ui, sans-serif" }}>
            Round tip to whole dollar
          </span>
          <Toggle active={roundTip} onToggle={() => setRoundTip((v) => !v)} label="Round tip to whole dollar" />
        </div>

        {/* Round-up suggestion */}
        {showRoundUp && (
          <button
            onClick={() => {
              setShowCustom(true);
              setCustomPct(String(result.roundUpTipPercent));
            }}
            className="roundup-btn"
            style={{ marginTop: "1.5rem", width: "100%", padding: "1rem", fontSize: "0.75rem", fontFamily: "var(--font-inter), system-ui, sans-serif", textTransform: "uppercase" as const, letterSpacing: "0.2em", color: "#ffe088", border: "1px solid rgba(242,202,80,0.2)", borderRadius: "9999px", background: "none", cursor: "pointer" }}>
            Round to ${result.roundUpTotal.toFixed(0)}.00 ({result.roundUpTipPercent}%)
          </button>
        )}
      </main>

      {/* Material Symbols + hover animations */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');

        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 200, 'GRAD' 0, 'opsz' 24;
          font-size: 20px;
          line-height: 1;
          user-select: none;
        }

        /* Numpad keys */
        .numpad-key {
          transition: background-color 0.15s, box-shadow 0.15s, color 0.15s;
        }
        .numpad-key:hover {
          background-color: #1d1b1a !important;
          color: #f2ca50 !important;
          box-shadow: inset 0 0 24px rgba(242,202,80,0.07);
        }
        .numpad-key:active {
          background-color: #2b2a28 !important;
          box-shadow: inset 0 0 30px rgba(242,202,80,0.12);
        }

        /* Tip % chips */
        .chip {
          transition: color 0.2s, border-color 0.2s, box-shadow 0.2s, background-color 0.2s;
        }
        .chip:hover:not(.chip-active) {
          color: #f2ca50 !important;
          border-color: rgba(242,202,80,0.3) !important;
          box-shadow: 0 0 14px rgba(242,202,80,0.2);
        }
        .chip-active {
          box-shadow: 0 0 20px rgba(242,202,80,0.3), inset 0 0 20px rgba(242,202,80,0.04);
          animation: chip-pulse 2.5s ease-in-out infinite;
        }
        @keyframes chip-pulse {
          0%, 100% { box-shadow: 0 0 20px rgba(242,202,80,0.3), inset 0 0 20px rgba(242,202,80,0.04); }
          50%       { box-shadow: 0 0 28px rgba(242,202,80,0.45), inset 0 0 24px rgba(242,202,80,0.07); }
        }

        /* +/- people buttons */
        .person-btn {
          transition: color 0.2s, box-shadow 0.2s;
        }
        .person-btn:hover {
          color: #f2ca50 !important;
          box-shadow: 0 0 14px rgba(242,202,80,0.25);
        }

        /* Round-up suggestion */
        .roundup-btn {
          transition: box-shadow 0.2s, background-color 0.2s;
        }
        .roundup-btn:hover {
          box-shadow: 0 0 22px rgba(242,202,80,0.2);
          background-color: rgba(242,202,80,0.04) !important;
        }
      `}</style>
    </div>
  );
}

/* ── Sub-components ─────────────────────────────────────────────────────── */

function MaterialIcon({ name }: { name: string }) {
  return <span className="material-symbols-outlined">{name}</span>;
}

function Toggle({ active, onToggle, label }: { active: boolean; onToggle: () => void; label: string }) {
  return (
    <button
      onClick={onToggle}
      aria-pressed={active}
      aria-label={label}
      style={{
        width: "2.5rem",
        height: "1.25rem",
        borderRadius: "9999px",
        backgroundColor: active ? "#f2ca50" : "#363433",
        border: "1px solid rgba(77,70,53,0.25)",
        position: "relative",
        transition: "background-color 0.25s",
        flexShrink: 0,
        cursor: "pointer",
      }}>
      <div style={{
        position: "absolute",
        top: "0.2rem",
        left: active ? "calc(100% - 0.95rem)" : "0.2rem",
        width: "0.85rem",
        height: "0.85rem",
        borderRadius: "9999px",
        backgroundColor: active ? "#241a00" : "#f2ca50",
        boxShadow: "0 0 8px rgba(242,202,80,0.4)",
        transition: "left 0.25s, background-color 0.25s",
      }} />
    </button>
  );
}

function NumpadKey({ label, onClick, dim = false }: { label: React.ReactNode; onClick: () => void; dim?: boolean }) {
  return (
    <button
      onClick={onClick}
      className="numpad-key"
      style={{
        aspectRatio: "1.5 / 1",
        backgroundColor: "#141312",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "1.25rem",
        fontWeight: 300,
        fontFamily: "var(--font-inter), system-ui, sans-serif",
        color: dim ? "#d0c5af" : "#e6e1df",
        cursor: "pointer",
        border: "none",
        WebkitTapHighlightColor: "transparent",
      }}>
      {label}
    </button>
  );
}

function ResultCard({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ padding: "1.5rem", borderRadius: "1rem", backgroundColor: "#0f0e0d", display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <label style={{ display: "block", fontSize: "0.5625rem", letterSpacing: "0.15em", textTransform: "uppercase" as const, color: "rgba(208,197,175,0.6)", marginBottom: "0.25rem", fontFamily: "var(--font-inter), system-ui, sans-serif" }}>
        {label}
      </label>
      <div style={{ fontFamily: "var(--font-noto-serif), Georgia, serif", fontSize: "1.5rem", color: "#e6e1df" }}>
        {value}
      </div>
    </div>
  );
}
