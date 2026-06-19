const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

async function request(path, params = {}) {
  const url = new URL(`${BASE_URL}${path}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) url.searchParams.set(key, value);
  });

  const res = await fetch(url.toString());
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res.json();
}

export const api = {
  currencies: () => request("/api/currencies"),
  rates: (base) => request("/api/rates", { base }),
  convert: (from, to, amount) => request("/api/convert", { from, to, amount }),
  history: (from, to, days = 7) => request("/api/history", { from, to, days }),
};
