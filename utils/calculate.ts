export interface TipInputs {
  /** Raw bill amount in dollars (as entered) */
  billAmount: number;
  /** Tax amount in dollars (used when tipOnSubtotal is true) */
  taxAmount: number;
  /** Tip percentage (e.g. 20 for 20%) */
  tipPercent: number;
  /** Number of people splitting the bill */
  numPeople: number;
  /** When true, tip is calculated on (bill - tax) instead of full bill */
  tipOnSubtotal: boolean;
  /** When true, round tip up/down to nearest whole dollar */
  roundTip: boolean;
}

export interface TipResult {
  /** Amount the tip is calculated on */
  tipBase: number;
  /** Raw (unrounded) tip amount */
  tipRaw: number;
  /** Tip amount after optional rounding */
  tipAmount: number;
  /** Total bill including tip */
  totalDue: number;
  /** Amount each person pays — always rounded up to nearest cent */
  perPerson: number;
  /** Effective tip percentage on full bill (post-rounding) */
  effectiveTipPercent: number;
  /** Nearest whole-dollar total above current total */
  roundUpTotal: number;
  /** Effective tip % if rounding up to roundUpTotal */
  roundUpTipPercent: number;
}

/**
 * Round a value up to the nearest cent (2 decimal places).
 * Uses banker-safe integer arithmetic to avoid floating-point drift.
 */
function ceilCent(value: number): number {
  return Math.ceil(Math.round(value * 1000) / 10) / 100;
}

/**
 * Round a dollar amount to the nearest whole dollar.
 * direction: "up" | "down" | "nearest"
 */
function roundDollar(value: number, direction: "up" | "down" | "nearest"): number {
  if (direction === "up") return Math.ceil(value);
  if (direction === "down") return Math.floor(value);
  return Math.round(value);
}

export function calculate(inputs: TipInputs): TipResult {
  const { billAmount, taxAmount, tipPercent, numPeople, tipOnSubtotal, roundTip } = inputs;

  // Clamp to sensible bounds
  const bill = Math.max(0, billAmount);
  const tax = Math.max(0, Math.min(taxAmount, bill));
  const pct = Math.max(0, tipPercent);
  const people = Math.max(1, Math.round(numPeople));

  // Base amount on which tip is calculated
  const tipBase = tipOnSubtotal ? bill - tax : bill;

  // Raw tip (two-decimal precision)
  const tipRaw = Math.round(tipBase * pct) / 100;

  // Optionally round tip to nearest whole dollar
  const tipAmount = roundTip ? roundDollar(tipRaw, "nearest") : tipRaw;

  // Total = bill + tip (bill already includes tax when present)
  const totalDue = bill + tipAmount;

  // Per-person: always round UP to nearest cent
  const perPerson = people > 0 ? ceilCent(totalDue / people) : 0;

  // Effective tip % relative to tipBase, shown to one decimal
  const effectiveTipPercent =
    tipBase > 0 ? Math.round((tipAmount / tipBase) * 1000) / 10 : 0;

  // Round-up suggestion: next whole dollar above totalDue
  const roundUpTotal = Math.ceil(totalDue);
  const roundUpTipAmount = roundUpTotal - bill;
  const roundUpTipPercent =
    tipBase > 0 ? Math.round((roundUpTipAmount / tipBase) * 1000) / 10 : 0;

  return {
    tipBase,
    tipRaw,
    tipAmount,
    totalDue,
    perPerson,
    effectiveTipPercent,
    roundUpTotal,
    roundUpTipPercent,
  };
}
