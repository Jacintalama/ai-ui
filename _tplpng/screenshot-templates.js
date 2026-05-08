/**
 * Capture 1280x800 PNG previews of all design templates from the production URL.
 *
 * Usage:
 *   node _tplpng/screenshot-templates.js
 *
 * Requires @playwright/test or playwright installed globally.
 * Screenshots are saved to _tplpng/<key>.png.
 *
 * Note: for templates not yet deployed to production, use
 * capture-local-templates.py instead (spins up a local HTTP server).
 */
const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const BASE_URL = "https://ai-ui.coolestdomain.win/api/template-preview";
const OUT_DIR = path.resolve(__dirname);

const TEMPLATES = [
  // Original 5 — deployed to production
  "landing",
  "portfolio",
  "crud",
  "dashboard",
  "invoice",
  // New design templates — deployed after feat/design-templates merge
  "agency",
  "restaurant",
  "photography",
  "event",
  "real-estate",
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();

  for (const key of TEMPLATES) {
    const url = `${BASE_URL}/${encodeURIComponent(key)}/index.html`;
    console.log(`\n=== ${key} ===\n  loading ${url}`);
    try {
      await page.goto(url, { waitUntil: "networkidle", timeout: 20_000 });
    } catch (e) {
      console.warn(`  WARN: ${e.message}`);
    }
    await page.waitForTimeout(2_000);
    const out = path.join(OUT_DIR, `${key}.png`);
    await page.screenshot({ path: out, fullPage: false });
    const size = fs.statSync(out).size;
    console.log(`  saved ${out} (${size.toLocaleString()} bytes)`);
  }

  await browser.close();
  console.log(`\nDone. ${TEMPLATES.length} screenshots captured.`);
})();
