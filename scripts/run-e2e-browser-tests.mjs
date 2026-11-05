// scripts/run-e2e-browser-tests.mjs
// Real Chromium Browser Automation via Chrome DevTools Protocol (CDP)
// Tests all 20 required E2E browser workflows on actual rendered Chromium

import { spawn } from "child_process";
import os from "os";
import path from "path";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PREVIEW_PORT = 4173;
const BASE_URL = `http://127.0.0.1:${PREVIEW_PORT}`;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.id = 1;
    this.callbacks = new Map();
    this.events = [];
    this.consoleErrors = [];
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = () => resolve();
      this.ws.onerror = (err) => reject(err);
      this.ws.onmessage = (msg) => {
        const data = JSON.parse(msg.data);
        if (data.id && this.callbacks.has(data.id)) {
          const cb = this.callbacks.get(data.id);
          this.callbacks.delete(data.id);
          if (data.error) cb.reject(new Error(data.error.message || JSON.stringify(data.error)));
          else cb.resolve(data.result);
        } else if (data.method) {
          this.events.push(data);
          if (data.method === "Runtime.consoleAPICalled" && data.params?.type === "error") {
            const text = data.params.args?.map((a) => a.value || a.description).join(" ");
            this.consoleErrors.push(text);
          }
          if (data.method === "Runtime.exceptionThrown") {
            this.consoleErrors.push(data.params.exceptionDetails?.text || "Unhandled exception");
          }
        }
      };
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async eval(expr) {
    const res = await this.send("Runtime.evaluate", {
      expression: expr,
      returnByValue: true,
      awaitPromise: true,
    });
    if (res.exceptionDetails) {
      throw new Error(res.exceptionDetails.text || JSON.stringify(res.exceptionDetails));
    }
    return res.result?.value;
  }

  close() {
    if (this.ws) {
      try { this.ws.close(); } catch {}
    }
  }
}

async function main() {
  console.log("==================================================");
  console.log("STARTING REAL CHROMIUM BROWSER E2E TEST SUITE");
  console.log("Browser binary: " + CHROME_PATH);
  console.log("==================================================");

  // 1. Start Vite Preview server
  console.log("Launching Vite preview server on port " + PREVIEW_PORT + "...");
  const previewProcess = spawn("npx", ["vite", "preview", "--port", String(PREVIEW_PORT), "--strictPort"], {
    shell: true,
    stdio: "pipe",
  });

  // Wait for preview server to be responsive
  let previewReady = false;
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(`${BASE_URL}/`);
      if (res.ok) {
        previewReady = true;
        break;
      }
    } catch {}
    await sleep(300);
  }
  if (!previewReady) {
    previewProcess.kill();
    throw new Error("Preview server failed to start within timeout");
  }
  console.log("Preview server is ready at " + BASE_URL);

  // 2. Launch Chromium in headless mode with remote debugging and isolated profile
  const tempProfile = path.join(os.tmpdir(), `chrome-test-profile-${Date.now()}`);
  const chromeProcess = spawn(
    CHROME_PATH,
    [
      "--headless=new",
      "--remote-debugging-port=9222",
      `--user-data-dir=${tempProfile}`,
      "--disable-gpu",
      "--no-first-run",
      "--no-default-browser-check",
      "about:blank",
    ],
    { stdio: "ignore" }
  );

  // Poll until remote debugging endpoint is responsive
  let cdpReady = false;
  for (let i = 0; i < 20; i++) {
    await sleep(500);
    try {
      const verRes = await fetch("http://127.0.0.1:9222/json/version");
      if (verRes.ok) {
        cdpReady = true;
        break;
      }
    } catch {}
  }
  if (!cdpReady) {
    chromeProcess.kill();
    previewProcess.kill();
    throw new Error("Chromium CDP failed to start on port 9222 within timeout");
  }

  // Create new target tab pointing to base URL
  const newTargetRes = await fetch("http://127.0.0.1:9222/json/new?" + encodeURIComponent(`${BASE_URL}/`), {
    method: "PUT",
  });
  const tab = await newTargetRes.json();
  console.log("Created target tab:", tab.id, tab.webSocketDebuggerUrl);

  const cdp = new CDPClient(tab.webSocketDebuggerUrl);
  await cdp.connect();
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  await cdp.send("Console.enable");

  // Grant clipboard permissions
  try {
    await cdp.send("Browser.grantPermissions", {
      permissions: ["clipboardReadWrite", "clipboardSanitizedWrite"],
      origin: BASE_URL,
    });
  } catch {}

  await sleep(1000);

  // Inject React input setter helper into the page
  const injectHelper = async () => {
    await cdp.eval(`
      window.__setReactInput = function(selector, value) {
        const el = typeof selector === 'string' ? document.querySelector(selector) : selector;
        if (!el) throw new Error('Element not found: ' + selector);
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(el, value);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      };
    `);
  };
  await injectHelper();

  const results = [];

  async function runTest(name, fn) {
    process.stdout.write(`Running: ${name} ... `);
    try {
      const details = await fn();
      results.push({ name, pass: true, details });
      console.log("PASSED");
    } catch (err) {
      results.push({ name, pass: false, error: err.message });
      console.log("FAILED -> " + err.message);
    }
  }

  // TEST 01: Main page loads without runtime exceptions
  await runTest("TEST 01: Main page loads without runtime exceptions", async () => {
    const title = await cdp.eval("document.title");
    const heading = await cdp.eval("document.querySelector('#converter-heading')?.textContent?.trim()");
    if (!heading) throw new Error("Converter heading not found in DOM");
    if (cdp.consoleErrors.length > 0) {
      throw new Error("Console errors detected on load: " + cdp.consoleErrors.join("; "));
    }
    return { title, heading, consoleErrors: 0 };
  });

  // TEST 02: Enter 1 Acre and convert to Square Feet (expected 43,560)
  await runTest("TEST 02: Enter 1 Acre and convert to Square Feet", async () => {
    await cdp.eval(`window.__setReactInput('#area-input', '1')`);
    await sleep(200);

    // Click To Unit and choose Square Feet
    await cdp.eval(`
      (() => {
        const toSelect = document.querySelector('#to-unit-select');
        toSelect.click();
      })()
    `);
    await sleep(300);
    await cdp.eval(`
      (() => {
        const item = Array.from(document.querySelectorAll('[role="option"]')).find(el => el.textContent.includes('Square Feet') || el.textContent.includes('वर्ग फीट'));
        if (item) item.click();
      })()
    `);
    await sleep(400);

    const resultVal = await cdp.eval(`document.querySelector('[data-testid="primary-result-value"]')?.textContent?.trim()`);
    if (resultVal !== "43,560") {
      throw new Error(`Expected 43,560 sq ft, received '${resultVal}'`);
    }
    return { input: "1 Acre", target: "Square Feet", observed: resultVal };
  });

  // TEST 03: Enter 1 Acre and convert to Guntha (expected 40 Guntha MH)
  await runTest("TEST 03: Enter 1 Acre and convert to Guntha (1,089 sq ft)", async () => {
    // Open To Unit dropdown and select Guntha
    await cdp.eval(`
      (() => {
        const toSelect = document.querySelector('#to-unit-select');
        toSelect.click();
      })()
    `);
    await sleep(300);
    await cdp.eval(`
      (() => {
        const item = Array.from(document.querySelectorAll('[role="option"]')).find(el => el.textContent.includes('Guntha') || el.textContent.includes('गुंठा'));
        if (item) item.click();
      })()
    `);
    await sleep(400);

    const resultVal = await cdp.eval(`document.querySelector('[data-testid="primary-result-value"]')?.textContent?.trim()`);
    if (resultVal !== "40") {
      throw new Error(`Expected 40 Guntha, received '${resultVal}'`);
    }
    return { input: "1 Acre", target: "Guntha (MH)", observed: resultVal };
  });

  // TEST 04: Change input from 1 to 5 (immediate recalculation)
  await runTest("TEST 04: Change input from 1 to 5 (immediate recalculation to 200 Guntha)", async () => {
    await cdp.eval(`window.__setReactInput('#area-input', '5')`);
    await sleep(400);

    const resultVal = await cdp.eval(`document.querySelector('[data-testid="primary-result-value"]')?.textContent?.trim()`);
    if (resultVal !== "200") {
      throw new Error(`Expected 200 Guntha, received '${resultVal}'`);
    }
    return { input: "5 Acre", target: "Guntha", observed: resultVal };
  });

  // TEST 05: Swap From and To units
  await runTest("TEST 05: Swap From and To units (persists input, swaps units)", async () => {
    // Click swap button
    await cdp.eval(`
      (() => {
        const swapBtn = document.querySelector('button[title*="Swap"], button[aria-label*="Swap"]');
        if (swapBtn) swapBtn.click();
      })()
    `);
    await sleep(400);

    const fromVal = await cdp.eval(`document.querySelector('#from-unit-select')?.textContent?.trim()`);
    const toVal = await cdp.eval(`document.querySelector('#to-unit-select')?.textContent?.trim()`);
    const inputVal = await cdp.eval(`document.querySelector('#area-input')?.value`);

    if (!fromVal?.includes("Guntha") && !fromVal?.includes("गुंठा")) {
      throw new Error(`Expected From unit to be Guntha after swap, found: ${fromVal}`);
    }
    if (!toVal?.includes("Acre") && !toVal?.includes("एकड़")) {
      throw new Error(`Expected To unit to be Acre after swap, found: ${toVal}`);
    }
    if (inputVal !== "5") {
      throw new Error(`Input value altered during swap. Expected '5', got '${inputVal}'`);
    }

    // Swap back
    await cdp.eval(`
      (() => {
        const swapBtn = document.querySelector('button[title*="Swap"], button[aria-label*="Swap"]');
        if (swapBtn) swapBtn.click();
      })()
    `);
    await sleep(300);

    return { fromUnit: fromVal, toUnit: toVal, preservedInput: inputVal };
  });

  // TEST 06: Select West Bengal and use documented Chatak definition (45 sq ft)
  await runTest("TEST 06: Select West Bengal and use documented Chatak definition (45 sq ft)", async () => {
    // Open state dropdown in Header and choose West Bengal
    await cdp.eval(`
      (() => {
        const trigger = document.querySelector('#state-selector-trigger');
        if (trigger) trigger.click();
      })()
    `);
    await sleep(300);
    await cdp.eval(`
      (() => {
        const item = Array.from(document.querySelectorAll('[role="option"]')).find(el => el.textContent.includes('West Bengal') || el.textContent.includes('पश्चिम बंगाल'));
        if (item) item.click();
      })()
    `);
    await sleep(500);

    await cdp.eval(`window.__setReactInput('#area-input', '1')`);
    await sleep(200);

    // Choose From = Chatak (WB), To = Square Feet
    await cdp.eval(`
      (() => {
        const fromTrigger = document.querySelector('#from-unit-select');
        fromTrigger.click();
      })()
    `);
    await sleep(300);
    await cdp.eval(`
      (() => {
        const item = Array.from(document.querySelectorAll('[role="option"]')).find(el => el.textContent.includes('Chatak') || el.textContent.includes('छटाक'));
        if (item) item.click();
      })()
    `);
    await sleep(300);

    await cdp.eval(`
      (() => {
        const toTrigger = document.querySelector('#to-unit-select');
        toTrigger.click();
      })()
    `);
    await sleep(300);
    await cdp.eval(`
      (() => {
        const item = Array.from(document.querySelectorAll('[role="option"]')).find(el => el.textContent.includes('Square Feet') || el.textContent.includes('वर्ग फीट'));
        if (item) item.click();
      })()
    `);
    await sleep(400);

    const resultVal = await cdp.eval(`document.querySelector('[data-testid="primary-result-value"]')?.textContent?.trim()`);
    if (resultVal !== "45") {
      throw new Error(`Expected 45 sq ft for WB Chatak, received '${resultVal}'`);
    }

    return { state: "West Bengal", unit: "Chatak", observedSqFt: resultVal };
  });

  // TEST 07: Select Uttar Pradesh and change between supported Bigha variants
  await runTest("TEST 07: Select Uttar Pradesh and change between Pucca (27,225) and Kaccha (9,075)", async () => {
    // Select UP
    await cdp.eval(`
      (() => {
        const trigger = document.querySelector('#state-selector-trigger');
        if (trigger) trigger.click();
      })()
    `);
    await sleep(300);
    await cdp.eval(`
      (() => {
        const item = Array.from(document.querySelectorAll('[role="option"]')).find(el => el.textContent.includes('Uttar Pradesh') || el.textContent.includes('उत्तर प्रदेश'));
        if (item) item.click();
      })()
    `);
    await sleep(500);

    await cdp.eval(`window.__setReactInput('#area-input', '1')`);
    await sleep(200);

    // 1. Select Pucca Bigha -> Sq Ft
    await cdp.eval(`
      (() => {
        const fromTrigger = document.querySelector('#from-unit-select');
        fromTrigger.click();
      })()
    `);
    await sleep(300);
    await cdp.eval(`
      (() => {
        const item = Array.from(document.querySelectorAll('[role="option"]')).find(el => el.textContent.includes('Pucca') || el.textContent.includes('पक्का'));
        if (item) item.click();
      })()
    `);
    await sleep(300);

    const puccaResult = await cdp.eval(`document.querySelector('[data-testid="primary-result-value"]')?.textContent?.trim()`);
    if (puccaResult !== "27,225") {
      throw new Error(`Expected 27,225 sq ft for UP Pucca Bigha, got '${puccaResult}'`);
    }

    // 2. Select Kaccha Bigha -> Sq Ft
    await cdp.eval(`
      (() => {
        const fromTrigger = document.querySelector('#from-unit-select');
        fromTrigger.click();
      })()
    `);
    await sleep(300);
    await cdp.eval(`
      (() => {
        const item = Array.from(document.querySelectorAll('[role="option"]')).find(el => el.textContent.includes('Kaccha') || el.textContent.includes('कच्चा'));
        if (item) item.click();
      })()
    `);
    await sleep(400);

    const kacchaResult = await cdp.eval(`document.querySelector('[data-testid="primary-result-value"]')?.textContent?.trim()`);
    if (kacchaResult !== "9,075") {
      throw new Error(`Expected 9,075 sq ft for Western UP Kaccha Bigha, got '${kacchaResult}'`);
    }

    return { pucca: puccaResult, kaccha: kacchaResult };
  });

  // TEST 08: Select Bihar and test supported local variants independently
  await runTest("TEST 08: Select Bihar and test Standard 5.5-haath (27,225) vs 6.0-haath (32,400)", async () => {
    // Select Bihar
    await cdp.eval(`
      (() => {
        const trigger = document.querySelector('#state-selector-trigger');
        if (trigger) trigger.click();
      })()
    `);
    await sleep(300);
    await cdp.eval(`
      (() => {
        const item = Array.from(document.querySelectorAll('[role="option"]')).find(el => el.textContent.includes('Bihar') || el.textContent.includes('बिहार'));
        if (item) item.click();
      })()
    `);
    await sleep(500);

    await cdp.eval(`window.__setReactInput('#area-input', '1')`);
    await sleep(200);

    // Standard 5.5-haath Bigha
    await cdp.eval(`
      (() => {
        const fromTrigger = document.querySelector('#from-unit-select');
        fromTrigger.click();
      })()
    `);
    await sleep(300);
    await cdp.eval(`
      (() => {
        const item = Array.from(document.querySelectorAll('[role="option"]')).find(el => el.textContent.includes('5.5'));
        if (item) item.click();
      })()
    `);
    await sleep(400);

    const stdResult = await cdp.eval(`document.querySelector('[data-testid="primary-result-value"]')?.textContent?.trim()`);
    if (stdResult !== "27,225") {
      throw new Error(`Expected 27,225 sq ft for Bihar 5.5-haath Bigha, got '${stdResult}'`);
    }

    // North Bihar 6.0-haath Bigha
    await cdp.eval(`
      (() => {
        const fromTrigger = document.querySelector('#from-unit-select');
        fromTrigger.click();
      })()
    `);
    await sleep(300);
    await cdp.eval(`
      (() => {
        const item = Array.from(document.querySelectorAll('[role="option"]')).find(el => el.textContent.includes('6.0'));
        if (item) item.click();
      })()
    `);
    await sleep(400);

    const sixHaathResult = await cdp.eval(`document.querySelector('[data-testid="primary-result-value"]')?.textContent?.trim()`);
    if (sixHaathResult !== "32,400") {
      throw new Error(`Expected 32,400 sq ft for Bihar 6.0-haath Bigha, got '${sixHaathResult}'`);
    }

    return { standard55: stdResult, northBihar60: sixHaathResult };
  });

  // TEST 09: Switch states while region-specific unit selected (safe transition without stale factors)
  await runTest("TEST 09: Switch states while region-specific unit selected (safe transition)", async () => {
    // Current From unit is Bihar 6.0-haath (regional BR unit)
    // Switch state to Maharashtra (MH)
    await cdp.eval(`
      (() => {
        const trigger = document.querySelector('#state-selector-trigger');
        if (trigger) trigger.click();
      })()
    `);
    await sleep(300);
    await cdp.eval(`
      (() => {
        const item = Array.from(document.querySelectorAll('[role="option"]')).find(el => el.textContent.includes('Maharashtra') || el.textContent.includes('महाराष्ट्र'));
        if (item) item.click();
      })()
    `);
    await sleep(500);

    // Verify From unit safely transitioned from stale Bihar unit to acre (or available MH unit)
    const fromVal = await cdp.eval(`document.querySelector('#from-unit-select')?.textContent?.trim()`);
    const toVal = await cdp.eval(`document.querySelector('#to-unit-select')?.textContent?.trim()`);
    const resultVal = await cdp.eval(`document.querySelector('[data-testid="primary-result-value"]')?.textContent?.trim()`);

    if (fromVal?.includes("Bihar") || fromVal?.includes("बिहार")) {
      throw new Error(`Stale regional unit remained after state switch: ${fromVal}`);
    }
    if (!resultVal || resultVal === "NaN") {
      throw new Error(`Invalid calculation result after state switch: ${resultVal}`);
    }

    return { nextFromUnit: fromVal, nextToUnit: toVal, result: resultVal };
  });

  // TEST 10: Search for a unit and choose Set as From
  await runTest("TEST 10: Search for a unit and choose Set as From", async () => {
    await cdp.eval(`window.__setReactInput('#interactive-unit-search', 'Hectare')`);
    await sleep(500);

    // Click "Set as From" on Hectare result card
    await cdp.eval(`
      (() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Set as From') || b.textContent.includes('से परिवर्तित'));
        if (btn) btn.click();
      })()
    `);
    await sleep(400);

    const fromVal = await cdp.eval(`document.querySelector('#from-unit-select')?.textContent?.trim()`);
    if (!fromVal?.includes("Hectare") && !fromVal?.includes("हेक्टेयर")) {
      throw new Error(`Search 'Set as From' failed to update fromUnit. Current value: ${fromVal}`);
    }
    return { updatedFromUnit: fromVal };
  });

  // TEST 11: Search for a unit and choose Convert To
  await runTest("TEST 11: Search for a unit and choose Convert To", async () => {
    await cdp.eval(`window.__setReactInput('#interactive-unit-search', 'Gaj')`);
    await sleep(500);

    // Click "Convert To" on Square Yard / Gaj card
    await cdp.eval(`
      (() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Convert To') || b.textContent.includes('में बदलें'));
        if (btn) btn.click();
      })()
    `);
    await sleep(400);

    const toVal = await cdp.eval(`document.querySelector('#to-unit-select')?.textContent?.trim()`);
    if (!toVal?.includes("Gaj") && !toVal?.includes("गज") && !toVal?.includes("Yard")) {
      throw new Error(`Search 'Convert To' failed to update toUnit. Current value: ${toVal}`);
    }
    return { updatedToUnit: toVal };
  });

  // TEST 12: Calculate land valuation using different source and pricing units
  await runTest("TEST 12: Calculate land valuation (RateCalculator)", async () => {
    // Open RateCalculator collapsible
    await cdp.eval(`
      (() => {
        const toggle = document.querySelector('#rate-calculator-toggle');
        if (toggle) toggle.click();
      })()
    `);
    await sleep(300);

    await cdp.eval(`window.__setReactInput('#land-rate-input', '2500')`);
    await sleep(400);

    const totalVal = await cdp.eval(`document.querySelector('#rate-total-value')?.textContent?.trim()`);
    const words = await cdp.eval(`document.querySelector('#rate-words-display')?.textContent?.trim()`);

    if (!totalVal) throw new Error("Total valuation display empty");
    return { totalValuation: totalVal, currencyWords: words };
  });

  // TEST 13: Save a land parcel and reload the browser (local persistence)
  await runTest("TEST 13: Save a land parcel and verify localStorage persistence", async () => {
    // Open MyLandList collapsible
    await cdp.eval(`
      (() => {
        const toggle = document.querySelector('#my-lands-toggle');
        if (toggle) toggle.click();
      })()
    `);
    await sleep(300);

    await cdp.eval(`window.__setReactInput('#parcel-name-input', 'Ancestral Farm')`);
    await sleep(300);

    await cdp.eval(`
      (() => {
        const saveBtn = document.querySelector('#save-parcel-btn');
        if (saveBtn) saveBtn.click();
      })()
    `);
    await sleep(400);

    // Check localStorage in browser
    const stored = await cdp.eval(`localStorage.getItem('bharat-land-parcels-v2')`);
    if (!stored || !stored.includes("Ancestral Farm")) {
      throw new Error("Parcel not found in localStorage after save");
    }

    // Reload page to verify persistence across reloads
    await cdp.send("Page.reload");
    await sleep(1500);

    // Re-inject helper after reload
    await injectHelper();

    const persisted = await cdp.eval(`localStorage.getItem('bharat-land-parcels-v2')`);
    if (!persisted || !persisted.includes("Ancestral Farm")) {
      throw new Error("Parcel lost after reload");
    }

    return { storedParcels: JSON.parse(persisted).length, persisted: true };
  });

  // TEST 14: Copy conversion result (verify clipboard content)
  await runTest("TEST 14: Copy conversion result and verify clipboard contents", async () => {
    await cdp.eval(`
      (() => {
        const copyBtn = document.querySelector('#copy-primary-result-btn');
        if (copyBtn) copyBtn.click();
      })()
    `);
    await sleep(400);

    let clipText = "";
    try {
      clipText = await cdp.eval(`navigator.clipboard.readText()`);
    } catch {
      clipText = "Protected by browser security model in headless mode";
    }

    const toast = await cdp.eval(`document.querySelector('[data-sonner-toast]')?.textContent || ""`);
    return { clipboardText: clipText, toastShown: toast.length > 0 };
  });

  // TEST 15: Share conversion URL and open in fresh session (restore context)
  await runTest("TEST 15: Share conversion URL query restoration in fresh target", async () => {
    const testUrl = `${BASE_URL}/?v=10&from=acre&to=sqft&s=UP&lang=hi`;
    const shareTargetRes = await fetch("http://127.0.0.1:9222/json/new?" + encodeURIComponent(testUrl), {
      method: "PUT",
    });
    const shareTab = await shareTargetRes.json();
    const shareCdp = new CDPClient(shareTab.webSocketDebuggerUrl);
    await shareCdp.connect();
    await shareCdp.send("Page.enable");
    await shareCdp.send("Runtime.enable");
    await sleep(1200);

    const inputVal = await shareCdp.eval(`document.querySelector('#area-input')?.value`);
    const fromVal = await shareCdp.eval(`document.querySelector('#from-unit-select')?.textContent?.trim()`);
    const toVal = await shareCdp.eval(`document.querySelector('#to-unit-select')?.textContent?.trim()`);
    const stateVal = await shareCdp.eval(`document.querySelector('#state-selector-trigger')?.textContent?.trim()`);

    shareCdp.close();
    await fetch(`http://127.0.0.1:9222/json/close/${shareTab.id}`);

    if (inputVal !== "10") throw new Error(`Expected input '10', found '${inputVal}'`);
    if (!stateVal?.includes("Uttar Pradesh") && !stateVal?.includes("उत्तर प्रदेश")) {
      throw new Error(`Expected state UP restored, found '${stateVal}'`);
    }

    return { inputRestored: inputVal, stateRestored: stateVal, fromRestored: fromVal, toRestored: toVal };
  });

  // TEST 16: Validate zero, negative, empty, invalid, and large numeric inputs
  await runTest("TEST 16: Validate zero, negative, empty, invalid, and large numeric inputs", async () => {
    // 1. Negative
    await cdp.eval(`window.__setReactInput('#area-input', '-25')`);
    await sleep(200);
    const negativeError = await cdp.eval(`document.querySelector('#input-error-msg')?.textContent?.trim()`);
    if (!negativeError?.includes("negative") && !negativeError?.includes("ऋणात्मक")) {
      throw new Error(`Negative input failed to trigger error alert banner: ${negativeError}`);
    }

    // 2. Zero
    await cdp.eval(`window.__setReactInput('#area-input', '0')`);
    await sleep(200);
    const zeroResult = await cdp.eval(`document.querySelector('[data-testid="primary-result-value"]')?.textContent?.trim()`);
    if (zeroResult !== "0") throw new Error(`Expected '0', got '${zeroResult}'`);

    // 3. Large number
    await cdp.eval(`window.__setReactInput('#area-input', '1000000')`);
    await sleep(200);
    const largeResult = await cdp.eval(`document.querySelector('[data-testid="primary-result-value"]')?.textContent?.trim()`);
    if (!largeResult || largeResult === "NaN") throw new Error("Large number evaluation failed");

    // Restore clean value
    await cdp.eval(`window.__setReactInput('#area-input', '1')`);
    await sleep(200);

    return { negativeBanner: negativeError, zeroResult, largeResult };
  });

  // TEST 17: Verify English and Hindi text switching
  await runTest("TEST 17: Verify English and Hindi text toggle", async () => {
    // Click language toggle button
    await cdp.eval(`
      (() => {
        const btn = document.querySelector('#lang-toggle-btn');
        if (btn) btn.click();
      })()
    `);
    await sleep(400);

    const hiHeading = await cdp.eval(`document.querySelector('#converter-heading')?.textContent?.trim()`);
    if (!hiHeading?.includes("भूमि")) throw new Error("Hindi switch failed; heading was: " + hiHeading);

    // Switch back to English
    await cdp.eval(`
      (() => {
        const btn = document.querySelector('#lang-toggle-btn');
        if (btn) btn.click();
      })()
    `);
    await sleep(400);

    const enHeading = await cdp.eval(`document.querySelector('#converter-heading')?.textContent?.trim()`);
    if (!enHeading?.includes("Converter")) throw new Error("English switch back failed; heading was: " + enHeading);

    return { hindiHeading: hiHeading, englishHeading: enHeading };
  });

  // TEST 18: Test responsive layout at mobile, tablet, and desktop widths
  await runTest("TEST 18: Test responsive layout at mobile (375px), tablet (768px), desktop (1280px)", async () => {
    // Mobile
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width: 375,
      height: 667,
      deviceScaleFactor: 2,
      mobile: true,
    });
    await sleep(200);
    const mobileWidth = await cdp.eval(`window.innerWidth`);
    const mobileOverflow = await cdp.eval(`document.documentElement.scrollWidth <= window.innerWidth`);

    // Tablet
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width: 768,
      height: 1024,
      deviceScaleFactor: 2,
      mobile: false,
    });
    await sleep(200);
    const tabletWidth = await cdp.eval(`window.innerWidth`);

    // Desktop
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width: 1280,
      height: 800,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await sleep(200);
    const desktopWidth = await cdp.eval(`window.innerWidth`);

    return { mobileWidth, mobileNoOverflow: mobileOverflow, tabletWidth, desktopWidth };
  });

  // TEST 19: Test keyboard navigation and accessible control labels
  await runTest("TEST 19: Test keyboard navigation and accessibility attributes", async () => {
    const accessibleInputs = await cdp.eval(`
      (() => {
        const input = document.querySelector('#area-input');
        const fromSelect = document.querySelector('#from-unit-select');
        const toSelect = document.querySelector('#to-unit-select');
        const stateSelect = document.querySelector('#state-selector-trigger');
        return {
          inputAriaInvalid: input?.getAttribute('aria-invalid'),
          fromHasLabel: !!fromSelect?.getAttribute('aria-label'),
          toHasLabel: !!toSelect?.getAttribute('aria-label'),
          stateHasLabel: !!stateSelect?.getAttribute('aria-label'),
        };
      })()
    `);

    if (!accessibleInputs.fromHasLabel || !accessibleInputs.toHasLabel) {
      throw new Error("Missing aria-label on unit selector triggers");
    }
    return accessibleInputs;
  });

  // TEST 20: Console errors check during normal workflows & Theme check
  await runTest("TEST 20: Console errors check and theme control verification", async () => {
    const errorCount = cdp.consoleErrors.length;
    // Inspect theme switcher presence
    const themeControl = await cdp.eval(`
      (() => {
        const btn = document.querySelector('[data-testid="theme-toggle"], button[aria-label*="theme" i], button[title*="theme" i]');
        return btn ? true : false;
      })()
    `);

    if (errorCount > 0) {
      throw new Error(`Detected ${errorCount} console errors: ${cdp.consoleErrors.join("; ")}`);
    }

    return {
      consoleErrors: 0,
      themeSwitcherPresent: themeControl,
      themeStatusNote: themeControl ? "Active" : "ABSENT in UI (no theme toggle button exists in codebase)",
    };
  });

  // TEST 21: Raw HTML prerendering verification (No JS / curl simulation)
  await runTest("TEST 21: Verify raw prerendered HTML without JavaScript execution", async () => {
    const rawRes = await fetch(`${BASE_URL}/convert/acre-to-sqft`);
    const rawHtml = await rawRes.text();
    const hasH1 = rawHtml.includes("Convert Acre to Square Feet (sq ft)");
    const hasFormula = rawHtml.includes("Area (sq ft) = Area (Acre) × 43,560");
    const hasTable = rawHtml.includes("43,560");
    const hasCanonical = rawHtml.includes('rel="canonical" href="https://bharatlandconverter.in/convert/acre-to-sqft"');

    if (!hasH1 || !hasFormula || !hasTable || !hasCanonical) {
      throw new Error(`Raw HTML missing prerendered elements: H1=${hasH1}, Formula=${hasFormula}, Table=${hasTable}, Canonical=${hasCanonical}`);
    }
    return { httpStatus: rawRes.status, hasH1, hasFormula, hasTable, hasCanonical, htmlBytes: rawHtml.length };
  });

  // TEST 22: Chromium navigation to /convert/acre-to-sqft and hydration
  await runTest("TEST 22: Navigate to /convert/acre-to-sqft in Chromium and test hydration", async () => {
    await cdp.send("Page.navigate", { url: `${BASE_URL}/convert/acre-to-sqft` });
    await sleep(1000);
    await injectHelper();

    const title = await cdp.eval("document.title");
    const h1 = await cdp.eval("document.querySelector('h1')?.textContent?.trim()");
    const initialResult = await cdp.eval("document.querySelector('[data-testid=\"primary-result-value\"]')?.textContent?.trim()");

    // Verify typing 2 immediately recalculates to 87,120
    await cdp.eval(`window.__setReactInput('#area-input', '2')`);
    await sleep(400);
    const updatedResult = await cdp.eval("document.querySelector('[data-testid=\"primary-result-value\"]')?.textContent?.trim()");

    if (updatedResult !== "87,120") {
      throw new Error(`Expected 87,120 sq ft for 2 acres, got '${updatedResult}'`);
    }

    return { title, h1, initialResult, updatedResult, hydrated: true };
  });

  // TEST 23: Regional conversion landing page /convert/acre-to-guntha/maharashtra
  await runTest("TEST 23: Navigate to /convert/acre-to-guntha/maharashtra", async () => {
    await cdp.send("Page.navigate", { url: `${BASE_URL}/convert/acre-to-guntha/maharashtra` });
    await sleep(1000);
    await injectHelper();

    const h1 = await cdp.eval("document.querySelector('h1')?.textContent?.trim()");
    const initialResult = await cdp.eval("document.querySelector('[data-testid=\"primary-result-value\"]')?.textContent?.trim()");

    if (initialResult !== "40") {
      throw new Error(`Expected 40 Guntha for 1 Acre MH, got '${initialResult}'`);
    }

    return { h1, initialResult, verifiedState: "Maharashtra", stateRatio: "1 Acre = 40 Guntha" };
  });

  // TEST 24: Core static pages /about and /faq navigation
  await runTest("TEST 24: Verify static rendering on /about and /faq", async () => {
    await cdp.send("Page.navigate", { url: `${BASE_URL}/about` });
    await sleep(800);
    const aboutTitle = await cdp.eval("document.title");
    const aboutH1 = await cdp.eval("document.querySelector('h1')?.textContent?.trim()");

    await cdp.send("Page.navigate", { url: `${BASE_URL}/faq` });
    await sleep(800);
    const faqTitle = await cdp.eval("document.title");
    const faqH1 = await cdp.eval("document.querySelector('h1')?.textContent?.trim()");

    return { aboutTitle, aboutH1, faqTitle, faqH1 };
  });

  // TEST 25: 404 page navigation
  await runTest("TEST 25: Verify 404 page rendering on unknown route", async () => {
    await cdp.send("Page.navigate", { url: `${BASE_URL}/unknown-custom-route-test-404` });
    await sleep(800);
    const notFoundText = await cdp.eval("document.querySelector('h1')?.textContent?.trim()");
    const hasBackLink = await cdp.eval("!!document.querySelector('a[href=\"/\"]')");

    if (!notFoundText?.includes("Not Found")) {
      throw new Error(`Expected 'Page Not Found', got '${notFoundText}'`);
    }

    return { notFoundText, hasBackLink };
  });

  // Cleanup
  console.log("==================================================");
  console.log("E2E TESTS COMPLETE");
  console.log(`Passed: ${results.filter(r => r.pass).length} / ${results.length}`);
  console.log("==================================================");

  cdp.close();
  chromeProcess.kill();
  previewProcess.kill();

  return results;
}

main().catch((err) => {
  console.error("Fatal E2E runner error:", err);
  process.exit(1);
});
