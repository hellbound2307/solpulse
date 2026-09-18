# SolPulse — نبض سولانا

**Arabic-first Solana token intelligence.** Paste a token mint or wallet address and get a
live, on-chain risk read — in Arabic or English.

Live: **https://hellbound2307.github.io/solpulse/**

---

## Why

The Arabic-speaking crypto market is underserved by tooling. Nearly every token checker is
English-only, so users in MENA are left guessing which token is safe before they buy. SolPulse
gives them the same signal in their own language, on a phone, with no install.

## What it does

**Token check** — paste a mint, get:

| Signal | Source |
|---|---|
| Mint authority (can supply be inflated?) | GoPlus + Solana RPC cross-check |
| Freeze authority (can your balance be frozen?) | GoPlus + Solana RPC cross-check |
| Top-10 holder concentration, with the actual holder list | GoPlus |
| Holder count | GoPlus |
| Price, liquidity depth, 24h change | Jupiter |
| LP locked % | GoPlus |

…rolled into a single 0–100 risk score with plain-language findings.

**Wallet check** — paste an address, get the SOL balance and every non-zero SPL token held.

## Design decisions

- **No backend.** Everything runs in the browser. There is no server to log your address,
  nothing is stored, and there is no key to leak. The whole app is three static files.
- **Three keyless public sources**, each doing what it is best at: GoPlus for security flags,
  Jupiter for market data, Solana RPC for authoritative supply/decimals and a live slot ticker.
- **Conservative scoring.** A token only reaches "low risk" when the dangerous authorities are
  revoked *and* liquidity is deep *and* holdings are distributed. Deep liquidity plus a very
  large holder base can offset an active mint authority (the USDC/USDT shape) — that is the only
  way a live mint authority does not sink the score.
- **Arabic is the default**, not a translation layer bolted on afterwards. Full RTL layout,
  Arabic typography, and an instant AR/EN toggle.

## Risk model

```
start at 100
  mint authority active        −28
  freeze authority active      −22
  top-10 concentration >60%    −25   (>35% → −12)
  liquidity < $20k             −28   (< $200k → −12)
  holders < 100                −15
offset:
  liquidity ≥ $50M and holders ≥ 100k   → floor of 72
  GoPlus trusted token                  → +8

≥70 low risk · 45–69 medium · <45 high
```

## Stack

Vanilla JavaScript, one stylesheet, one HTML file. No framework, no build step, no
dependencies. Deliberately: it loads instantly on a slow mobile connection, which is the
actual environment of the users it is built for.

## Sources

- Solana RPC — `solana-rpc.publicnode.com`
- Jupiter Price API v3 — `lite-api.jup.ag/price/v3`
- Jupiter Token API v2 — `lite-api.jup.ag/tokens/v2/search`
- GoPlus Solana Token Security — `api.gopluslabs.io/api/v1/solana/token_security`

## Disclaimer

Automated analysis of public data. **Not financial advice.** A low score is not a guarantee —
it means the specific on-chain risk signals we check were not present at the time of the query.

## License

MIT
