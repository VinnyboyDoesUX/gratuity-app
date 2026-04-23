// Summary — two inset wells showing Tip + Total, with ticker digits.

function Summary({ tipAmount, totalDue }) {
  const TN = window.TickerNumber;
  const tip = tipAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const total = totalDue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <section className="summary" data-screen-label="Summary">
      <div className="summary-card s-tip">
        <span className="s-label">Tip Amount</span>
        <span className="s-value">
          <span className="sd">$</span>
          <TN value={tip} />
        </span>
      </div>
      <div className="summary-card s-total">
        <span className="s-label">Total Due</span>
        <span className="s-value">
          <span className="sd">$</span>
          <TN value={total} />
        </span>
      </div>
    </section>
  );
}

window.Summary = Summary;
