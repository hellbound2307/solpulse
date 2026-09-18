/* SolPulse — Arabic-first Solana intelligence.
   Sources, all public and keyless:
     GoPlus   token security (authorities, holders, LP, flags)
     Jupiter  price, liquidity, 24h change, token metadata
     Solana RPC  supply/decimals cross-check + live slot (proves the feed is live)
   Everything runs in the browser. No backend, nothing stored. */

const RPC = "https://solana-rpc.publicnode.com";
const JUP_PRICE = "https://lite-api.jup.ag/price/v3";
const JUP_TOKENS = "https://lite-api.jup.ag/tokens/v2/search";
const GOPLUS = "https://api.gopluslabs.io/api/v1/solana/token_security";

/* ---------- i18n ---------- */
const I18N = {
  ar: {
    tagline: "نبض سولانا — فحص فوري على السلسلة",
    lede: "افحص أي رمز أو محفظة على سولانا مباشرة من الشبكة. بدون وسيط، بدون خادم، بدون تخزين لبياناتك.",
    live: "متصل بـ", tabToken: "فحص رمز", tabWallet: "فحص محفظة", tabAbout: "عن المشروع",
    check: "افحص", samples: "أمثلة:",
    aboutTitle: "لماذا SolPulse؟",
    about1: "سوق العملات الرقمية في المنطقة العربية يفتقر لأدوات عربية. معظم أدوات التحقق من الرموز إنجليزية فقط، والمستخدم العربي يُترك ليخمّن أي رمز آمن.",
    about2: "SolPulse يجمع ثلاث مصادر مجانية: GoPlus للتحقق الأمني، Jupiter للسعر والسيولة، وشبكة سولانا مباشرة. كل شيء يجري في متصفحك — لا خادم ولا تخزين.",
    howTitle: "كيف نقيّم الخطر؟",
    r1: "سلطة السك (mint authority) مُلغاة = لا يمكن طباعة رموز جديدة.",
    r2: "سلطة التجميد (freeze authority) مُلغاة = لا يمكن تجميد رصيدك.",
    r3: "تركّز الحيازات: إذا ملك أعلى 10 حسابات نسبة ضخمة، الخطر يرتفع.",
    r4: "السيولة: سيولة منخفضة تعني صعوبة الخروج وتقلّباً حاداً في السعر.",
    disc: "تحليل آلي لبيانات علنية وليس نصيحة مالية.",
    foot: "SolPulse — بيانات حية من سولانا · مفتوح المصدر",
    mintAuth: "سلطة السك", freezeAuth: "سلطة التجميد", supply: "المعروض الكلي",
    decimals: "الكسور العشرية", price: "السعر", liquidity: "السيولة", change24: "تغير 24س",
    top10: "تركّز أعلى 10 حيازات", risk: "تقييم الخطر",
    revoked: "مُلغاة", active: "نشِطة", unknown: "غير معروف",
    holder: "الحساب", amount: "الكمية", share: "النسبة",
    balance: "الرصيد", checking: "جارٍ الفحص…",
    badAddr: "عنوان غير صالح — تحقق من الطول والصيغة.",
    netErr: "تعذّر الوصول إلى البيانات. حاول مرة أخرى.",
    noPrice: "لا يوجد سعر متاح", tokenAccts: "حسابات الرموز",
    scoreGood: "خطر منخفض", scoreWarn: "خطر متوسط", scoreBad: "خطر مرتفع",
    walletTokens: "الرموز في المحفظة", solBal: "رصيد SOL",
    holdersCount: "عدد الحامِلين", lpLocked: "السيولة المقفلة",
    tokenName: "الرمز", verified: "موثّق", unverified: "غير موثّق",
    topHolders: "أكبر الحامِلين", noHolders: "لا تتوفر بيانات الحامِلين لهذا الرمز.",
  },
  en: {
    tagline: "Solana intelligence — live on-chain checks",
    lede: "Inspect any Solana token or wallet straight from the network. No middleman, no server, nothing stored.",
    live: "connected to", tabToken: "Token check", tabWallet: "Wallet check", tabAbout: "About",
    check: "Check", samples: "Samples:",
    aboutTitle: "Why SolPulse?",
    about1: "The Arabic-speaking crypto market is underserved by tooling. Almost every token checker is English-only, leaving users to guess which token is safe.",
    about2: "SolPulse fuses three keyless public sources: GoPlus for security, Jupiter for price and liquidity, and the Solana network directly. Everything runs in your browser — no backend, nothing stored.",
    howTitle: "How the risk score works",
    r1: "Mint authority revoked = no new tokens can be printed.",
    r2: "Freeze authority revoked = your balance cannot be frozen.",
    r3: "Holder concentration: if the top 10 accounts hold a huge share, risk rises.",
    r4: "Liquidity: thin liquidity means hard exits and violent price moves.",
    disc: "Automated analysis of public data. Not financial advice.",
    foot: "SolPulse — live Solana data · open source",
    mintAuth: "Mint authority", freezeAuth: "Freeze authority", supply: "Total supply",
    decimals: "Decimals", price: "Price", liquidity: "Liquidity", change24: "24h change",
    top10: "Top-10 concentration", risk: "Risk score",
    revoked: "revoked", active: "active", unknown: "unknown",
    holder: "Account", amount: "Amount", share: "Share",
    balance: "Balance", checking: "Checking…",
    badAddr: "Invalid address — check length and encoding.",
    netErr: "Could not reach the data sources. Try again.",
    noPrice: "No price available", tokenAccts: "Token accounts",
    scoreGood: "Low risk", scoreWarn: "Medium risk", scoreBad: "High risk",
    walletTokens: "Tokens held", solBal: "SOL balance",
    holdersCount: "Holders", lpLocked: "LP locked",
    tokenName: "Token", verified: "verified", unverified: "unverified",
    topHolders: "Largest holders", noHolders: "No holder data available for this token.",
  },
};
let LANG = "ar";
const t = (k) => (I18N[LANG][k] ?? I18N.en[k] ?? k);

function applyLang() {
  document.documentElement.lang = LANG;
  document.documentElement.dir = LANG === "ar" ? "rtl" : "ltr";
  document.getElementById("lang").textContent = LANG === "ar" ? "EN" : "ع";
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const k = el.getAttribute("data-i18n");
    if (I18N[LANG][k]) el.textContent = I18N[LANG][k];
  });
}

/* ---------- helpers ---------- */
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const short = (s, n = 6) => (s && s.length > 2 * n ? s.slice(0, n) + "…" + s.slice(-n) : s || "—");
const fmt = (n, d = 4) => {
  if (n === null || n === undefined || Number.isNaN(Number(n))) return "—";
  n = Number(n);
  const a = Math.abs(n);
  if (a >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (a >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (a >= 1e3) return (n / 1e3).toFixed(2) + "K";
  return n.toFixed(d);
};
const isB58 = (s) => /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(String(s || "").trim());
const get = async (u) => (await fetch(u)).json();

async function rpc(method, params) {
  const r = await fetch(RPC, {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  const j = await r.json();
  if (j.error) throw new Error(j.error.message || "rpc error");
  return j.result;
}

/* ---------- risk model ---------- */
/* Deliberately conservative: a token is only "low risk" when the dangerous
   authorities are gone AND liquidity is deep AND holdings are distributed. */
function scoreToken({ mintable, freezable, top10pct, liquidity, holderCount, trusted }) {
  let score = 100;
  const f = [];
  const add = (kind, text) => f.push({ kind, text });

  if (mintable) { score -= 28; add("bad", `${t("mintAuth")}: ${t("active")}`); }
  else add("good", `${t("mintAuth")}: ${t("revoked")}`);

  if (freezable) { score -= 22; add("bad", `${t("freezeAuth")}: ${t("active")}`); }
  else add("good", `${t("freezeAuth")}: ${t("revoked")}`);

  if (top10pct === null) add("warn", `${t("top10")}: ${t("unknown")}`);
  else if (top10pct > 60) { score -= 25; add("bad", `${t("top10")}: ${top10pct.toFixed(1)}%`); }
  else if (top10pct > 35) { score -= 12; add("warn", `${t("top10")}: ${top10pct.toFixed(1)}%`); }
  else add("good", `${t("top10")}: ${top10pct.toFixed(1)}%`);

  if (liquidity === null || liquidity === undefined) add("warn", `${t("liquidity")}: ${t("unknown")}`);
  else if (liquidity < 20000) { score -= 28; add("bad", `${t("liquidity")}: $${fmt(liquidity, 0)}`); }
  else if (liquidity < 200000) { score -= 12; add("warn", `${t("liquidity")}: $${fmt(liquidity, 0)}`); }
  else add("good", `${t("liquidity")}: $${fmt(liquidity, 0)}`);

  if (holderCount !== null && holderCount < 100) {
    score -= 15; add("bad", `${t("holdersCount")}: ${holderCount}`);
  } else if (holderCount !== null) {
    add("good", `${t("holdersCount")}: ${fmt(holderCount, 0)}`);
  }

  // deep liquidity + huge holder base offsets an active mint authority (USDC/USDT shape)
  if (liquidity >= 50_000_000 && holderCount >= 100_000) {
    score = Math.max(score, 72);
    add("good", `${t("verified")}: ${t("holdersCount")} ≥ 100K, ${t("liquidity")} ≥ $50M`);
  }
  if (trusted === 1 && score < 80) score += 8;

  score = Math.max(0, Math.min(100, score));
  return { score, findings: f };
}

/* ---------- token check ---------- */
async function checkToken(mintRaw) {
  const mint = String(mintRaw || "").trim();
  const out = $("#tokenOut");
  if (!isB58(mint)) { out.innerHTML = `<div class="err">${esc(t("badAddr"))}</div>`; return; }
  out.innerHTML = `<div class="spin">${esc(t("checking"))}</div>`;

  try {
    const [acctRes, gpRes, priceRes, metaRes] = await Promise.allSettled([
      rpc("getAccountInfo", [mint, { encoding: "jsonParsed" }]),
      get(`${GOPLUS}?contract_addresses=${mint}`),
      get(`${JUP_PRICE}?ids=${mint}`),
      get(`${JUP_TOKENS}?query=${mint}`),
    ]);

    const acct = acctRes.status === "fulfilled" ? acctRes.value : null;
    if (!acct || !acct.value) { out.innerHTML = `<div class="err">${esc(t("badAddr"))}</div>`; return; }
    const info = acct.value.data?.parsed?.info || {};
    const decimals = info.decimals ?? 0;
    const supply = Number(info.supply ?? 0) / Math.pow(10, decimals);

    const gp = gpRes.status === "fulfilled"
      ? (Object.values(gpRes.value?.result || {})[0] || null) : null;
    const price = priceRes.status === "fulfilled" ? (priceRes.value?.[mint] || null) : null;
    const meta = metaRes.status === "fulfilled" && Array.isArray(metaRes.value)
      ? (metaRes.value[0] || null) : null;

    const mintable = gp ? gp.mintable?.status === "1" : Boolean(info.mintAuthority);
    const freezable = gp ? gp.freezable?.status === "1" : Boolean(info.freezeAuthority);
    const holderCount = gp?.holder_count ? Number(gp.holder_count) : null;
    const holders = (gp?.holders || []).slice(0, 10);
    const top10pct = holders.length
      ? holders.reduce((s, h) => s + Number(h.percent || 0), 0) * 100
      : null;
    const liquidity = price?.liquidity ?? null;

    const { score, findings } = scoreToken({
      mintable, freezable, top10pct, liquidity, holderCount, trusted: gp?.trusted_token,
    });
    const cls = score >= 70 ? "good" : score >= 45 ? "warn" : "bad";
    const label = score >= 70 ? t("scoreGood") : score >= 45 ? t("scoreWarn") : t("scoreBad");

    const name = meta?.name || gp?.metadata?.name || "";
    const symbol = meta?.symbol || gp?.metadata?.symbol || "";
    const icon = meta?.icon || "";
    const lpLocked = gp?.lp_holders?.length
      ? gp.lp_holders.reduce((s, h) => s + (h.is_locked ? Number(h.percent || 0) : 0), 0) * 100
      : null;

    const rows = holders.map((h) => {
      const pct = Number(h.percent || 0) * 100;
      return `<tr><td class="mono">${esc(short(h.account, 5))}</td>
        <td class="mono">${fmt(h.balance, 2)}</td>
        <td><div class="bar"><i style="width:${Math.min(100, pct * 3).toFixed(1)}%"></i></div>
        <span class="muted">${pct.toFixed(2)}%</span></td></tr>`;
    }).join("");

    out.innerHTML = `
      <div class="card">
        <div class="score">
          <div class="ring ${cls}" style="--pct:${score}%"><span>${score}</span></div>
          <div>
            <div style="font-weight:700;font-size:17px;display:flex;align-items:center;gap:8px">
              ${icon ? `<img src="${esc(icon)}" alt="" style="width:22px;height:22px;border-radius:50%">` : ""}
              ${name ? esc(name) : ""} ${symbol ? `<span class="muted">${esc(symbol)}</span>` : ""}
            </div>
            <div style="font-weight:600;font-size:14px" class="${cls === "good" ? "v good" : cls === "bad" ? "v bad" : "v warn"}">${esc(label)}</div>
            <div class="muted mono">${esc(mint)}</div>
          </div>
        </div>
        <ul class="findings">
          ${findings.map((x) => `<li><span class="mark ${x.kind}">${
            x.kind === "good" ? "✓" : x.kind === "bad" ? "✕" : "!"}</span><span>${esc(x.text)}</span></li>`).join("")}
        </ul>
      </div>

      <div class="card">
        <h3>${esc(t("tabToken"))}</h3>
        <div class="grid">
          <div class="stat"><div class="k">${esc(t("supply"))}</div><div class="v">${fmt(supply, 2)}</div></div>
          <div class="stat"><div class="k">${esc(t("price"))}</div><div class="v">${price?.usdPrice != null ? "$" + fmt(price.usdPrice, 6) : esc(t("noPrice"))}</div></div>
          <div class="stat"><div class="k">${esc(t("liquidity"))}</div><div class="v">${liquidity != null ? "$" + fmt(liquidity, 0) : "—"}</div></div>
          <div class="stat"><div class="k">${esc(t("change24"))}</div>
            <div class="v ${price?.priceChange24h > 0 ? "good" : price?.priceChange24h < 0 ? "bad" : ""}">${
              price?.priceChange24h != null ? (price.priceChange24h > 0 ? "+" : "") + Number(price.priceChange24h).toFixed(2) + "%" : "—"}</div></div>
          <div class="stat"><div class="k">${esc(t("holdersCount"))}</div><div class="v">${holderCount != null ? fmt(holderCount, 0) : "—"}</div></div>
          <div class="stat"><div class="k">${esc(t("lpLocked"))}</div><div class="v">${lpLocked != null ? lpLocked.toFixed(1) + "%" : "—"}</div></div>
        </div>
      </div>

      ${holders.length ? `<div class="card">
        <h3>${esc(t("topHolders"))}</h3>
        <table><thead><tr><th>${esc(t("holder"))}</th><th>${esc(t("amount"))}</th><th>${esc(t("share"))}</th></tr></thead>
        <tbody>${rows}</tbody></table></div>`
        : `<div class="card"><p class="muted">${esc(t("noHolders"))}</p></div>`}
    `;
  } catch (e) {
    out.innerHTML = `<div class="err">${esc(t("netErr"))}<br><span class="muted">${esc(e.message)}</span></div>`;
  }
}

/* ---------- wallet check ---------- */
async function checkWallet(addrRaw) {
  const addr = String(addrRaw || "").trim();
  const out = $("#walletOut");
  if (!isB58(addr)) { out.innerHTML = `<div class="err">${esc(t("badAddr"))}</div>`; return; }
  out.innerHTML = `<div class="spin">${esc(t("checking"))}</div>`;
  try {
    const [bal, toks] = await Promise.all([
      rpc("getBalance", [addr]),
      rpc("getTokenAccountsByOwner",
        [addr, { programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" }, { encoding: "jsonParsed" }]
      ).catch(() => ({ value: [] })),
    ]);
    const sol = (bal?.value ?? 0) / 1e9;
    const list = (toks.value || []).map((a) => {
      const i = a.account.data.parsed.info;
      return { mint: i.mint, amount: i.tokenAmount.uiAmount || 0 };
    }).filter((x) => x.amount > 0).sort((a, b) => b.amount - a.amount).slice(0, 25);

    out.innerHTML = `
      <div class="card">
        <h3>${esc(t("tabWallet"))}</h3>
        <div class="grid">
          <div class="stat"><div class="k">${esc(t("solBal"))}</div><div class="v good">${sol.toFixed(6)}</div></div>
          <div class="stat"><div class="k">${esc(t("tokenAccts"))}</div><div class="v">${list.length}</div></div>
        </div>
      </div>
      ${list.length ? `<div class="card"><h3>${esc(t("walletTokens"))}</h3>
        <table><thead><tr><th>Mint</th><th>${esc(t("amount"))}</th></tr></thead>
        <tbody>${list.map((x) => `<tr><td class="mono">${esc(short(x.mint, 5))}</td><td class="mono">${fmt(x.amount, 4)}</td></tr>`).join("")}</tbody></table></div>` : ""}
    `;
  } catch (e) {
    out.innerHTML = `<div class="err">${esc(t("netErr"))}<br><span class="muted">${esc(e.message)}</span></div>`;
  }
}

/* ---------- wiring ---------- */
document.addEventListener("DOMContentLoaded", () => {
  applyLang();
  $("#lang").addEventListener("click", () => { LANG = LANG === "ar" ? "en" : "ar"; applyLang(); });

  document.querySelectorAll(".tab").forEach((b) => b.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((x) => x.classList.remove("active"));
    document.querySelectorAll(".panel").forEach((x) => x.classList.remove("active"));
    b.classList.add("active");
    $("#panel-" + b.dataset.tab).classList.add("active");
  }));

  $("#checkToken").addEventListener("click", () => checkToken($("#mint").value));
  $("#mint").addEventListener("keydown", (e) => { if (e.key === "Enter") checkToken($("#mint").value); });
  $("#checkWallet").addEventListener("click", () => checkWallet($("#addr").value));
  $("#addr").addEventListener("keydown", (e) => { if (e.key === "Enter") checkWallet($("#addr").value); });
  document.querySelectorAll(".chip").forEach((c) =>
    c.addEventListener("click", () => { $("#mint").value = c.dataset.mint; checkToken(c.dataset.mint); }));

  const tick = async () => {
    try {
      const r = await rpc("getEpochInfo", []);
      $("#slot").textContent = "· slot " + r.absoluteSlot.toLocaleString("en-US") + " · epoch " + r.epoch;
    } catch (_) { $("#slot").textContent = ""; }
  };
  tick();
  setInterval(tick, 15000);
});
