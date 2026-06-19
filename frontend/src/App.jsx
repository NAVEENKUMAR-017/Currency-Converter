import { useEffect, useMemo, useState, useCallback } from "react";
import { api } from "./api";
import RollingNumber from "./RollingNumber";
import Sparkline from "./Sparkline";
import "./index.css";

const POPULAR = ["USD", "EUR", "GBP", "JPY", "INR", "AUD", "CAD", "CHF", "CNY", "SGD"];

const CURRENCY_LABELS = {
  USD: "US Dollar", EUR: "Euro", GBP: "British Pound", JPY: "Japanese Yen",
  INR: "Indian Rupee", AUD: "Australian Dollar", CAD: "Canadian Dollar",
  CHF: "Swiss Franc", CNY: "Chinese Yuan", SGD: "Singapore Dollar",
};

function formatAmount(n) {
  if (!Number.isFinite(n)) return "0.00";
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function App() {
  const [allCurrencies, setAllCurrencies] = useState(null);
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("EUR");
  const [amount, setAmount] = useState("1");
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);

  useEffect(() => {
    api.currencies().then(setAllCurrencies).catch(() => setAllCurrencies(null));
  }, []);

  const runConvert = useCallback(async () => {
    const numeric = parseFloat(amount);
    if (!Number.isFinite(numeric) || numeric < 0) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.convert(from, to, numeric);
      setResult(data);
      setUpdatedAt(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [from, to, amount]);

  useEffect(() => {
    const t = setTimeout(runConvert, 350);
    return () => clearTimeout(t);
  }, [runConvert]);

  useEffect(() => {
    api
      .history(from, to, 7)
      .then((data) => setHistory(data.series || []))
      .catch(() => setHistory([]));
  }, [from, to]);

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  const displayValue = useMemo(() => {
    if (result && Number.isFinite(result.result)) return formatAmount(result.result);
    return "0.00";
  }, [result]);

  const currencyOptions = useMemo(() => {
    if (allCurrencies) {
      return Object.entries(allCurrencies).map(([code, name]) => ({ code, name }));
    }
    return POPULAR.map((code) => ({ code, name: CURRENCY_LABELS[code] || code }));
  }, [allCurrencies]);

  return (
    <div className="page">
      <div className="grain" />

      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">¤</span>
          <span className="brand-name">Tickr</span>
        </div>
        <div className="topbar-meta">
          {updatedAt && (
            <span className="updated-pill">
              <span className="pulse-dot" />
              live · updated {updatedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
        </div>
      </header>

      <main className="layout">
        <section className="hero">
          <p className="eyebrow">Exchange rate, right now</p>
          <h1 className="hero-rate">
            <RollingNumber value="1.00" className="hero-rate-from" />
            <span className="hero-code">{from}</span>
            <span className="hero-eq">=</span>
            <RollingNumber
              value={result ? (result.rate ?? 0).toFixed(4) : "0.0000"}
              className="hero-rate-to"
            />
            <span className="hero-code">{to}</span>
          </h1>
          <Sparkline series={history} />
        </section>

        <section className="converter-card">
          <div className="field-row">
            <div className="field">
              <label htmlFor="amount">Amount</label>
              <input
                id="amount"
                type="number"
                min="0"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="amount-input"
              />
            </div>

            <div className="field">
              <label htmlFor="from">From</label>
              <select id="from" value={from} onChange={(e) => setFrom(e.target.value)}>
                {currencyOptions.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} — {c.name}
                  </option>
                ))}
              </select>
            </div>

            <button className="swap-btn" onClick={swap} aria-label="Swap currencies" title="Swap currencies">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M7 10L3 6L7 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 6H17C19.2091 6 21 7.79086 21 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M17 14L21 18L17 22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 18H7C4.79086 18 3 16.2091 3 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <div className="field">
              <label htmlFor="to">To</label>
              <select id="to" value={to} onChange={(e) => setTo(e.target.value)}>
                {currencyOptions.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} — {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="result-strip">
            <span className="result-label">Converted amount</span>
            <div className="result-amount">
              <span className="result-code">{to}</span>
              <RollingNumber value={displayValue} className="result-number" />
            </div>
          </div>

          {error && <p className="error-msg">{error}</p>}
          {loading && <p className="loading-msg">Refreshing rate…</p>}

          <div className="quick-row">
            {POPULAR.filter((c) => c !== from).slice(0, 6).map((c) => (
              <button
                key={c}
                className={`chip ${to === c ? "chip-active" : ""}`}
                onClick={() => setTo(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </section>
      </main>

      <footer className="footer">
        <span>Rates via Frankfurter (ECB reference rates) · refreshed every 10 minutes</span>
      </footer>
    </div>
  );
}
