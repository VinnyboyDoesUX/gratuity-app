"use client";

import { useState, useCallback, useRef } from "react";
import { calculate } from "@/utils/calculate";

function fmt(value: number) {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

const MAIN_CHIPS = [
  { label: "Bad",    pct: 15 },
  { label: "Decent", pct: 18 },
  { label: "Good",   pct: 20 },
] as const;

const MORE_CHIPS = [
  { label: "None",     pct: 0  },
  { label: "Amazing",  pct: 30 },
  { label: "Unhinged", pct: 69 },
] as const;

function haptic(ms = 8) {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(ms);
  }
}

export default function GratuityCalculator() {
  const [billInput,  setBillInput]  = useState("");
  const [tipPercent, setTipPercent] = useState(20);
  const [showMore,   setShowMore]   = useState(false);
  const [numPeople,  setNumPeople]  = useState(2);
  const inputRef = useRef<HTMLInputElement>(null);

  const billAmount = parseFloat(billInput) || 0;

  const handleBillChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/[^0-9.]/g, "");
    // enforce single decimal point
    const dot = v.indexOf(".");
    if (dot !== -1) v = v.slice(0, dot + 1) + v.slice(dot + 1).replace(/\./g, "");
    // max 2 decimal places
    if (dot !== -1 && v.length > dot + 3) v = v.slice(0, dot + 3);
    // cap at $99,999
    if (parseFloat(v) > 99999) return;
    setBillInput(v);
  };

  const result = calculate({
    billAmount,
    taxAmount: 0,
    tipPercent,
    numPeople,
    tipOnSubtotal: false,
    roundTip: false,
  });

  const moreActive = MORE_CHIPS.some((c) => c.pct === tipPercent);

  return (
    <div style={{
      minHeight: "100dvh",
      backgroundColor: "#141312",
      color: "#e6e1df",
      fontFamily: "var(--font-inter), system-ui, sans-serif",
    }}>
      <main style={{
        paddingTop: "calc(env(safe-area-inset-top, 0px) + 2.5rem)",
        paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 2rem)",
        paddingLeft: "1.25rem",
        paddingRight: "1.25rem",
        maxWidth: "28rem",
        width: "100%",
        margin: "0 auto",
      }}>

        {/* ── Zone 1: Bill input ───────────────────────────────────── */}
        <div
          style={{ marginBottom: "2.5rem", cursor: "text" }}
          onClick={() => inputRef.current?.focus()}
        >
          <p style={{
            fontSize: "0.5rem",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "rgba(208,197,175,0.35)",
            marginBottom: "0.625rem",
            fontFamily: "var(--font-inter), system-ui, sans-serif",
          }}>
            Bill
          </p>

          <div style={{ display: "flex", alignItems: "baseline" }}>
            <span style={{
              fontFamily: "var(--font-noto-serif), Georgia, serif",
              fontSize: "3rem",
              lineHeight: 1,
              color: "rgba(242,202,80,0.25)",
              fontWeight: 300,
              paddingRight: "0.2rem",
              flexShrink: 0,
            }}>
              $
            </span>
            <input
              ref={inputRef}
              type="text"
              inputMode="decimal"
              pattern="[0-9]*\.?[0-9]{0,2}"
              placeholder="0.00"
              value={billInput}
              onChange={handleBillChange}
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                fontFamily: "var(--font-noto-serif), Georgia, serif",
                fontSize: "3rem",
                lineHeight: 1,
                letterSpacing: "-0.02em",
                color: billInput ? "#e6e1df" : "rgba(230,225,223,0.2)",
                textAlign: "right",
                width: "100%",
                fontVariantNumeric: "tabular-nums",
                WebkitTapHighlightColor: "transparent",
                caretColor: "#f2ca50",
              }}
            />
          </div>

          <div style={{
            height: "1px",
            marginTop: "0.5rem",
            background: "linear-gradient(to right, transparent, rgba(242,202,80,0.12) 30%, rgba(242,202,80,0.28) 55%, transparent)",
          }} />
        </div>

        {/* ── Zone 2: Controls ─────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem", marginBottom: "2.5rem" }}>

          {/* Tip chips */}
          <div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {MAIN_CHIPS.map(({ label, pct }) => {
                const active = tipPercent === pct && !moreActive;
                return (
                  <TipChip
                    key={pct}
                    label={label}
                    pct={pct}
                    active={active}
                    onClick={() => { setTipPercent(pct); setShowMore(false); }}
                  />
                );
              })}

              <button
                onClick={() => { haptic(); setShowMore((v) => !v); }}
                aria-pressed={showMore}
                aria-label="More tip options"
                className={`chip${showMore || moreActive ? " more-open" : ""}`}
                style={{
                  flex: 1,
                  padding: "0.625rem 0.25rem",
                  borderRadius: "0.5rem",
                  backgroundColor: "#1d1b1a",
                  color:  showMore || moreActive ? "#f2ca50" : "#736b58",
                  border: showMore || moreActive
                    ? "1px solid rgba(242,202,80,0.35)"
                    : "1px solid rgba(77,70,53,0.2)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "color 0.2s, border-color 0.2s",
                }}>
                <MaterialIcon name={showMore ? "expand_less" : "more_horiz"} />
              </button>
            </div>

            {/* More row — animated slide */}
            <div style={{
              maxHeight: showMore ? "72px" : "0px",
              overflow: "hidden",
              transition: "max-height 0.26s cubic-bezier(0.4, 0, 0.2, 1)",
            }}>
              <div style={{ display: "flex", gap: "0.5rem", paddingTop: "0.625rem" }}>
                {MORE_CHIPS.map(({ label, pct }) => {
                  const active = tipPercent === pct;
                  return (
                    <TipChip
                      key={pct}
                      label={label}
                      pct={pct}
                      active={active}
                      unhinged={pct === 69}
                      onClick={() => setTipPercent(pct)}
                    />
                  );
                })}
                <div style={{ flex: 1 }} />
              </div>
            </div>
          </div>

          {/* People wheel */}
          <PeopleWheel value={numPeople} onChange={setNumPeople} />
        </div>

        {/* ── Zone 3: Results ──────────────────────────────────────── */}
        <div style={{
          borderRadius: "0.75rem",
          backgroundColor: "#181716",
          border: "1px solid rgba(77,70,53,0.16)",
          overflow: "hidden",
        }}>
          {/* Tip — primary */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "1rem 1.125rem",
            borderBottom: "1px solid rgba(77,70,53,0.14)",
          }}>
            <span style={{
              fontSize: "0.5rem",
              letterSpacing: "0.22em",
              textTransform: "uppercase" as const,
              color: "rgba(242,202,80,0.55)",
              fontFamily: "var(--font-inter), system-ui, sans-serif",
            }}>
              Tip
            </span>
            <span style={{
              fontFamily: "var(--font-noto-serif), Georgia, serif",
              fontSize: "2.25rem",
              lineHeight: 1,
              color: "#e6e1df",
              letterSpacing: "-0.02em",
              fontVariantNumeric: "tabular-nums",
            }}>
              ${fmt(result.tipAmount)}
            </span>
          </div>

          {/* Total — secondary */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0.75rem 1.125rem",
          }}>
            <span style={{
              fontSize: "0.5rem",
              letterSpacing: "0.22em",
              textTransform: "uppercase" as const,
              color: "rgba(208,197,175,0.35)",
              fontFamily: "var(--font-inter), system-ui, sans-serif",
            }}>
              Total
            </span>
            <span style={{
              fontFamily: "var(--font-noto-serif), Georgia, serif",
              fontSize: "1.25rem",
              color: "#a09890",
              fontVariantNumeric: "tabular-nums",
            }}>
              ${fmt(result.totalDue)}
            </span>
          </div>

          {/* Per-person — only when splitting */}
          {numPeople > 1 && (
            <div style={{
              padding: "0 1.125rem 0.75rem",
              display: "flex",
              justifyContent: "flex-end",
            }}>
              <span style={{
                fontSize: "0.5625rem",
                color: "rgba(208,197,175,0.25)",
                letterSpacing: "0.06em",
                fontVariantNumeric: "tabular-nums",
              }}>
                {numPeople} people · ${fmt(result.perPerson)} each
              </span>
            </div>
          )}
        </div>

      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');

        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 200, 'GRAD' 0, 'opsz' 24;
          font-size: 20px;
          line-height: 1;
          user-select: none;
        }

        input::placeholder {
          color: rgba(230,225,223,0.18);
          font-family: var(--font-noto-serif), Georgia, serif;
        }

        .chip {
          transition: color 0.15s, border-color 0.15s, background-color 0.15s;
        }
        .chip:active:not(.chip-active):not(.chip-unhinged-active) {
          color: #f2ca50 !important;
          border-color: rgba(242,202,80,0.3) !important;
        }

        /* ── Aurora wrapper — gold variant ──────────────────────── */
        /*
         * The wrapper is the stacking context (z-index: 0).
         * ::before / ::after sit at z-index: -1 within it (paint step 2).
         * The button child has no z-index so it renders at step 6 — on top.
         * The button's solid #141312 background covers the interior; only
         * the ring extending beyond the button edge is ever visible.
         */
        @property --aurora-pos {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }

        .aurora-wrap {
          position: relative;
          z-index: 0;
        }

        .aurora-gold::before {
          content: '';
          position: absolute;
          inset: -1.5px;
          border-radius: 0.625rem;
          background: conic-gradient(
            from var(--aurora-pos),
            transparent             0deg,
            transparent            80deg,
            rgba(255,220, 80,0.10)  93deg,
            rgba(255,240,140,0.22) 104deg,
            rgba(255,255,220,0.28) 110deg,
            rgba(255,240,140,0.22) 116deg,
            rgba(255,220, 80,0.10) 127deg,
            transparent            140deg,
            transparent            260deg,
            rgba(255,220, 80,0.10) 273deg,
            rgba(255,240,140,0.22) 284deg,
            rgba(255,255,220,0.28) 290deg,
            rgba(255,240,140,0.22) 296deg,
            rgba(255,220, 80,0.10) 307deg,
            transparent            320deg,
            transparent            360deg
          );
          animation: aurora-travel 8s linear infinite;
          pointer-events: none;
          z-index: -1;
        }

        .aurora-gold::after {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: 0.75rem;
          background: conic-gradient(
            from var(--aurora-pos),
            transparent             0deg,
            transparent            78deg,
            rgba(242,180,  0,0.06)  92deg,
            rgba(255,220, 60,0.14) 104deg,
            rgba(255,240,160,0.18) 110deg,
            rgba(255,220, 60,0.14) 116deg,
            rgba(242,180,  0,0.06) 128deg,
            transparent            142deg,
            transparent            258deg,
            rgba(242,180,  0,0.06) 272deg,
            rgba(255,220, 60,0.14) 284deg,
            rgba(255,240,160,0.18) 290deg,
            rgba(255,220, 60,0.14) 296deg,
            rgba(242,180,  0,0.06) 308deg,
            transparent            322deg,
            transparent            360deg
          );
          filter: blur(5px);
          animation: aurora-travel 8s linear infinite;
          pointer-events: none;
          z-index: -1;
        }

        @keyframes aurora-travel {
          from { --aurora-pos: 0deg; }
          to   { --aurora-pos: 360deg; }
        }

        /* ── Aurora wrapper — unhinged (chaos) variant ───────────── */
        @property --chaos-pos {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }

        .aurora-chaos::before {
          content: '';
          position: absolute;
          inset: -1.5px;
          border-radius: 0.625rem;
          background: conic-gradient(
            from var(--chaos-pos),
            transparent             0deg,
            transparent            78deg,
            rgba(255,160, 20,0.10)  90deg,
            rgba(255, 80, 20,0.22) 102deg,
            rgba(255,255,220,0.28) 110deg,
            rgba(255, 40,100,0.22) 118deg,
            rgba(200, 20,140,0.10) 130deg,
            transparent            142deg,
            transparent            258deg,
            rgba(255,160, 20,0.10) 270deg,
            rgba(255, 80, 20,0.22) 282deg,
            rgba(255,255,220,0.28) 290deg,
            rgba(255, 40,100,0.22) 298deg,
            rgba(200, 20,140,0.10) 310deg,
            transparent            322deg,
            transparent            360deg
          );
          animation: chaos-travel 5s linear infinite;
          pointer-events: none;
          z-index: -1;
        }

        .aurora-chaos::after {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: 0.75rem;
          background: conic-gradient(
            from var(--chaos-pos),
            transparent             0deg,
            transparent            76deg,
            rgba(255,140, 20,0.06)  89deg,
            rgba(255, 60, 10,0.14) 102deg,
            rgba(255,200,200,0.18) 110deg,
            rgba(200, 20,120,0.14) 118deg,
            rgba(160,  0,100,0.06) 131deg,
            transparent            144deg,
            transparent            256deg,
            rgba(255,140, 20,0.06) 269deg,
            rgba(255, 60, 10,0.14) 282deg,
            rgba(255,200,200,0.18) 290deg,
            rgba(200, 20,120,0.14) 298deg,
            rgba(160,  0,100,0.06) 311deg,
            transparent            324deg,
            transparent            360deg
          );
          filter: blur(5px);
          animation: chaos-travel 5s linear infinite;
          pointer-events: none;
          z-index: -1;
        }

        @keyframes chaos-travel {
          from { --chaos-pos: 0deg; }
          to   { --chaos-pos: 360deg; }
        }
      `}</style>
    </div>
  );
}

/* ── Sub-components ──────────────────────────────────────────────────────── */

function MaterialIcon({ name }: { name: string }) {
  return <span className="material-symbols-outlined">{name}</span>;
}

function TipChip({
  label, pct, active, unhinged = false, onClick,
}: {
  label: string; pct: number; active: boolean; unhinged?: boolean; onClick: () => void;
}) {
  // Aurora lives on the wrapper, NOT the button. The wrapper creates the stacking
  // context; the button (no z-index) renders at step 6 inside it — above the
  // ::before (step 2) — so the button's solid background covers the interior.
  const wrapClass = active
    ? unhinged ? "aurora-wrap aurora-chaos" : "aurora-wrap aurora-gold"
    : "";

  return (
    <div className={wrapClass} style={{ flex: 1 }}>
      <button
        onClick={() => { haptic(); onClick(); }}
        className="chip"
        style={{
          width: "100%",
          padding: "0.625rem 0.25rem",
          borderRadius: "0.5rem",
          cursor: "pointer",
          border: active
            ? `1px solid ${unhinged ? "rgba(255,100,60,0.35)" : "rgba(242,202,80,0.35)"}`
            : "1px solid rgba(77,70,53,0.2)",
          backgroundColor: active ? "#141312" : "#1d1b1a",
          color: active ? (unhinged ? "#ff8855" : "#f2ca50") : "#736b58",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.2rem",
          fontFamily: "var(--font-inter), system-ui, sans-serif",
          position: "relative",
        }}>
        <span style={{
          fontSize: "0.5rem",
          letterSpacing: "0.14em",
          textTransform: "uppercase" as const,
          fontWeight: 500,
          color: active ? (unhinged ? "#ff8855" : "#f2ca50") : "rgba(208,197,175,0.35)",
        }}>
          {label}
        </span>
        <span style={{
          fontSize: "0.9375rem",
          fontWeight: active ? 600 : 400,
          fontVariantNumeric: "tabular-nums",
        }}>
          {pct}%
        </span>
      </button>
    </div>
  );
}

const ITEM_W = 72; // px per slot in the horizontal wheel

function PeopleWheel({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const dragRef = useRef<{ startX: number; startVal: number } | null>(null);
  const [visualOffset, setVisualOffset] = useState(0);

  const commit = useCallback((rawX: number) => {
    if (!dragRef.current) return;
    const dx = rawX - dragRef.current.startX;          // positive = drag right = more people
    const rawVal = dragRef.current.startVal + dx / ITEM_W;
    const clamped = Math.max(1, Math.min(50, rawVal));
    const rounded = Math.round(clamped);
    if (rounded !== value) {
      haptic(6);
      onChange(rounded);
    }
    setVisualOffset((rounded - clamped) * ITEM_W);     // items slide left as value rises
  }, [value, onChange]);

  const onPointerDown = (e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = { startX: e.clientX, startVal: value };
    setVisualOffset(0);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    commit(e.clientX);
  };

  const onPointerUp = () => {
    dragRef.current = null;
    setVisualOffset(0);
  };

  return (
    <div
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      style={{
        position: "relative",
        height: "52px",
        overflow: "hidden",
        cursor: "ew-resize",
        userSelect: "none",
        touchAction: "none",
        borderRadius: "0.5rem",
        background: "#1d1b1a",
        border: "1px solid rgba(77,70,53,0.2)",
      }}
      aria-label={`${value} ${value === 1 ? "person" : "people"}`}
      role="spinbutton"
      aria-valuenow={value}
      aria-valuemin={1}
      aria-valuemax={50}
    >
      {/* Vertical selection window at center */}
      <div style={{
        position: "absolute",
        top: "0.5rem",
        bottom: "0.5rem",
        left: "50%",
        width: `${ITEM_W}px`,
        transform: "translateX(-50%)",
        borderRadius: "0.3rem",
        background: "rgba(242,202,80,0.04)",
        borderLeft: "1px solid rgba(242,202,80,0.10)",
        borderRight: "1px solid rgba(242,202,80,0.10)",
        pointerEvents: "none",
      }} />

      {([-2, -1, 0, 1, 2] as const).map((offset) => {
        const n = value + offset;
        const valid = n >= 1 && n <= 50;
        const dist = Math.abs(offset);
        const x = offset * ITEM_W + visualOffset;
        return (
          <div
            key={offset}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: `translate(calc(-50% + ${x}px), -50%) scale(${dist === 0 ? 1 : dist === 1 ? 0.78 : 0.62})`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.1rem",
              opacity: valid ? (dist === 0 ? 1 : dist === 1 ? 0.32 : 0.09) : 0,
              transition: dragRef.current ? "none" : "transform 0.18s ease, opacity 0.18s ease",
              pointerEvents: "none",
              whiteSpace: "nowrap",
            }}
          >
            <span style={{
              fontFamily: "var(--font-noto-serif), Georgia, serif",
              fontSize: dist === 0 ? "1rem" : "0.875rem",
              color: dist === 0 ? "#e6e1df" : "#d0c5af",
              lineHeight: 1,
              fontVariantNumeric: "tabular-nums",
            }}>
              {valid ? n : ""}
            </span>
            {dist === 0 && (
              <span style={{
                fontSize: "0.4375rem",
                letterSpacing: "0.16em",
                textTransform: "uppercase" as const,
                color: "rgba(208,197,175,0.4)",
                fontFamily: "var(--font-inter), system-ui, sans-serif",
              }}>
                {n === 1 ? "person" : "people"}
              </span>
            )}
          </div>
        );
      })}

      {/* Left/right edge fades */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "linear-gradient(to right, #1d1b1a 0%, transparent 22%, transparent 78%, #1d1b1a 100%)",
        borderRadius: "0.5rem",
      }} />
    </div>
  );
}

