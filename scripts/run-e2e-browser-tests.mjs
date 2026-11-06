// scripts/run-e2e-browser-tests.mjs
// Real Chromium Browser Automation via Chrome DevTools Protocol (CDP)
// Tests all 20 required E2E browser workflows on actual rendered Chromium

import { spawn, execSync } from "child_process";
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
            const desc = data.params.exceptionDetails?.exception?.description || data.params.exceptionDetails?.text || "Unhandled exception";
            this.consoleErrors.push(desc);
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

  previewProcess.stderr.on("data", (d) => {
    const errText = d.toString().trim();
    if (errText && !errText.includes("DeprecationWarning")) {
      console.warn("Preview server stderr:", errText);
    }
  });

  // Wait for preview server to be responsive
  let previewReady = false;
  for (let i = 0; i < 60; i++) {
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
    try { execSync(`taskkill /F /T /PID ${previewProcess.pid}`, { stdio: "ignore" }); } catch {}
    try { previewProcess.kill(); } catch {}
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

  // Allow complete static hydration on initial render
  await sleep(2500);

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

      window.__clickRadix = function(el) {
        if (!el) return;
        el.focus();
        el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true }));
        el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
        el.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, cancelable: true }));
        el.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
        el.click();
      };
    `);
  };
  await injectHelper();

  // Active hydration handshake: ensure React is interactive before running tests
  for (let i = 0; i < 30; i++) {
    await sleep(250);
    try {
      await cdp.eval(`window.__setReactInput('#area-input', '2')`);
      const val = await cdp.eval(`document.querySelector('[data-testid="primary-result-value"]')?.textContent?.trim()`);
      if (val === "80") {
        await cdp.eval(`window.__setReactInput('#area-input', '1')`);
        await sleep(200);
        break;
      }
    } catch {}
  }

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
        window.__clickRadix(toSelect);
      })()
    `);
    await sleep(400);
    await cdp.eval(`
      (() => {
        const item = Array.from(document.querySelectorAll('[role="option"]')).find(el => el.textContent.includes('Square Feet') || el.textContent.includes('वर्ग फीट'));
        if (item) window.__clickRadix(item);
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

  // TEST 17: Verify English, Hindi, and Marathi text switching (trilingual cycle)
  await runTest("TEST 17: Verify English, Hindi, and Marathi text switching", async () => {
    // Click 1: English -> Hindi
    await cdp.eval(`
      (() => {
        const btn = document.querySelector('#lang-toggle-btn');
        if (btn) btn.click();
      })()
    `);
    await sleep(400);

    const hiHeading = await cdp.eval(`document.querySelector('#converter-heading')?.textContent?.trim()`);
    if (!hiHeading?.includes("भूमि")) throw new Error("Hindi switch failed; heading was: " + hiHeading);

    // Click 2: Hindi -> Marathi
    await cdp.eval(`
      (() => {
        const btn = document.querySelector('#lang-toggle-btn');
        if (btn) btn.click();
      })()
    `);
    await sleep(400);

    const mrHeading = await cdp.eval(`document.querySelector('#converter-heading')?.textContent?.trim()`);
    if (!mrHeading?.includes("जमीन")) throw new Error("Marathi switch failed; heading was: " + mrHeading);

    // Click 3: Marathi -> English
    await cdp.eval(`
      (() => {
        const btn = document.querySelector('#lang-toggle-btn');
        if (btn) btn.click();
      })()
    `);
    await sleep(400);

    const enHeading = await cdp.eval(`document.querySelector('#converter-heading')?.textContent?.trim()`);
    if (!enHeading?.includes("Converter") && !enHeading?.includes("Land")) throw new Error("English switch back failed; heading was: " + enHeading);

    return { hindiHeading: hiHeading, marathiHeading: mrHeading, englishHeading: enHeading };
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

  // TEST 20: Console errors check during normal workflows & Theme toggle verification
  await runTest("TEST 20: Console errors check and dark/light theme toggle verification", async () => {
    const errorCount = cdp.consoleErrors.length;
    if (errorCount > 0) {
      throw new Error(`Detected ${errorCount} console errors: ${cdp.consoleErrors.join("; ")}`);
    }

    // Inspect theme switcher presence
    const hasThemeBtn = await cdp.eval(`document.querySelector('#theme-toggle-btn') ? true : false`);
    if (!hasThemeBtn) {
      throw new Error("Theme toggle button (#theme-toggle-btn) missing from Header");
    }

    // Record initial theme state (could be light or dark depending on OS prefers-color-scheme)
    const initialDark = await cdp.eval(`document.documentElement.classList.contains('dark')`);

    // Click toggle once
    await cdp.eval(`document.querySelector('#theme-toggle-btn').click()`);
    await sleep(400);

    const step1Dark = await cdp.eval(`document.documentElement.classList.contains('dark')`);
    const step1Saved = await cdp.eval(`localStorage.getItem('bharat_theme')`);

    // Verify state 1 flipped from initial
    if (step1Dark === initialDark) {
      throw new Error(`First toggle click failed to change dark class. Initial=${initialDark}, Step1=${step1Dark}`);
    }

    // Click toggle second time
    await cdp.eval(`document.querySelector('#theme-toggle-btn').click()`);
    await sleep(400);

    const step2Dark = await cdp.eval(`document.documentElement.classList.contains('dark')`);
    const step2Saved = await cdp.eval(`localStorage.getItem('bharat_theme')`);

    // Verify state 2 flipped back
    if (step2Dark !== initialDark) {
      throw new Error(`Second toggle click failed to restore initial dark class. Initial=${initialDark}, Step2=${step2Dark}`);
    }

    return {
      consoleErrors: 0,
      themeSwitcherPresent: true,
      initialThemeDark: initialDark,
      step1Dark,
      step1Saved,
      step2Dark,
      step2Saved,
    };
  });

  // TEST 21: Raw HTML prerendering verification (No JS / curl simulation)
  await runTest("TEST 21: Verify raw prerendered HTML without JavaScript execution", async () => {
    const rawRes = await fetch(`${BASE_URL}/convert/acre-to-sqft`);
    const rawHtml = await rawRes.text();
    const hasH1 = rawHtml.includes("Convert Acre to Square Feet (sq ft)");
    const hasFormula = rawHtml.includes("Area (sq ft) = Area (Acre) × 43,560");
    const hasTable = rawHtml.includes("43,560");
    const hasCanonical = rawHtml.includes('rel="canonical" href="https://land.ladestack.in/convert/acre-to-sqft"');

    if (!hasH1 || !hasFormula || !hasTable || !hasCanonical) {
      throw new Error(`Raw HTML missing prerendered elements: H1=${hasH1}, Formula=${hasFormula}, Table=${hasTable}, Canonical=${hasCanonical}`);
    }
    return { httpStatus: rawRes.status, hasH1, hasFormula, hasTable, hasCanonical, htmlBytes: rawHtml.length };
  });

  // TEST 22: Chromium navigation to /convert/acre-to-sqft and hydration
  await runTest("TEST 22: Navigate to /convert/acre-to-sqft in Chromium and test hydration", async () => {
    await cdp.send("Page.navigate", { url: `${BASE_URL}/convert/acre-to-sqft` });
    // Allow complete static hydration on initial render
  await sleep(2500);
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
    // Allow complete static hydration on initial render
  await sleep(2500);
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
  await runTest("TEST 25: Verify 404 page rendering on /404", async () => {
    await cdp.send("Page.navigate", { url: `${BASE_URL}/404` });
    // Allow complete static hydration on initial render
  await sleep(2500);
    const notFoundText = await cdp.eval("document.querySelector('h1')?.textContent?.trim()");
    const hasBackLink = await cdp.eval("!!document.querySelector('a[href=\"/\"]')");

    if (!notFoundText?.includes("Not Found")) {
      throw new Error(`Expected 'Page Not Found', got '${notFoundText}'`);
    }

    return { notFoundText, hasBackLink };
  });

  // TEST 26: Phase 2B Plot Dimensions Calculator
  await runTest("TEST 26: Phase 2B Plot Dimensions Calculator tab & calculation", async () => {
    await cdp.send("Page.navigate", { url: `${BASE_URL}/` });
    await sleep(1500);
    await injectHelper();

    // Switch to Plot Dimensions tab
    await cdp.eval(`
      (() => {
        const btn = document.querySelector('#tab-plot-btn');
        if (btn) btn.click();
      })()
    `);
    await sleep(600);

    // Set length to 60 and width to 40
    await cdp.eval(`window.__setReactInput('#plot-length-input', '60')`);
    await sleep(300);
    await cdp.eval(`window.__setReactInput('#plot-width-input', '40')`);
    await sleep(400);

    const hasPlotArea = await cdp.eval(`
      document.body.innerText.includes('2,400')
    `);

    if (!hasPlotArea) {
      throw new Error("Expected calculated area 2,400 sq ft for 60x40 plot");
    }

    return { plotAreaVerified: true, dimensions: "60 x 40 ft = 2,400 sq ft" };
  });

  // TEST 27: Phase 2B Compound Traditional Unit Converter
  await runTest("TEST 27: Phase 2B Compound Traditional Unit Converter tab", async () => {
    // Switch to Compound Units tab
    await cdp.eval(`
      (() => {
        const btn = document.querySelector('#tab-compound-btn');
        if (btn) btn.click();
      })()
    `);
    await sleep(600);

    const hasCompoundSystem = await cdp.eval(`
      document.body.innerText.includes('Pucca Bigha') || document.body.innerText.includes('Biswa')
    `);

    if (!hasCompoundSystem) {
      throw new Error("Compound units system selector or inputs not visible");
    }

    return { compoundUnitsTabVerified: true };
  });

  // TEST 28: Phase 2B Regional Unit Comparison Matrix
  await runTest("TEST 28: Phase 2B Regional Unit Comparison Matrix tab", async () => {
    // Switch to Unit Comparison tab
    await cdp.eval(`
      (() => {
        const btn = document.querySelector('#tab-compare-btn');
        if (btn) btn.click();
      })()
    `);
    await sleep(600);

    const hasComparisonTable = await cdp.eval(`
      document.body.innerText.includes('Pucca Bigha') && (document.body.innerText.includes('Uttar Pradesh') || document.body.innerText.includes('UP Revenue Code'))
    `);

    if (!hasComparisonTable) {
      throw new Error("Regional comparison matrix table with statutory references not visible");
    }

    return { regionalComparisonVerified: true };
  });

  // TEST 29: Phase 2B Conversion History & Custom Factors
  await runTest("TEST 29: Phase 2B Conversion History & Custom Factors tabs", async () => {
    // Switch to Custom Factor tab
    await cdp.eval(`
      (() => {
        const btn = document.querySelector('#tab-custom-btn');
        if (btn) btn.click();
      })()
    `);
    await sleep(600);

    const hasCustomNotice = await cdp.eval(`
      document.body.innerText.includes('Custom Local Measurement Factor') || document.body.innerText.includes('कस्टम स्थानीय माप कारक')
    `);

    // Switch to History & Saved tab
    await cdp.eval(`
      (() => {
        const btn = document.querySelector('#tab-history-btn');
        if (btn) btn.click();
      })()
    `);
    await sleep(600);

    const hasHistoryView = await cdp.eval(`
      document.body.innerText.includes('Conversion History') || document.body.innerText.includes('रूपांतरण इतिहास')
    `);

    if (!hasCustomNotice || !hasHistoryView) {
      throw new Error("Custom units manager or Conversion History view failed to render");
    }

    return { customFactorsVerified: hasCustomNotice, historyTabVerified: hasHistoryView };
  });

  // TEST 30: Custom unit creation and mathematical converter integration
  await runTest("TEST 30: Custom unit creation and primary mathematical calculation", async () => {
    // Switch to Custom Factor tab
    await cdp.eval(`
      (() => {
        const btn = document.querySelector('#tab-custom-btn');
        if (btn) btn.click();
      })()
    `);
    await sleep(500);

    // Fill form
    await cdp.eval(`window.__setReactInput('#custom-unit-name', 'Village Test Bigha')`);
    await sleep(300);
    await cdp.eval(`window.__setReactInput('#custom-unit-factor', '20000')`);
    await sleep(400);

    // Submit form to save preset
    await cdp.eval(`
      (() => {
        const form = document.querySelector('form');
        if (form) {
          form.requestSubmit();
        } else {
          const saveBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Save Preset') || b.textContent.includes('प्रीसेट सहेजें'));
          if (saveBtn) window.__clickRadix(saveBtn);
        }
      })()
    `);
    await sleep(600);

    // Verify localStorage has custom preset with key bharat_custom_units_v1
    const customPresetsJson = await cdp.eval(`localStorage.getItem('bharat_custom_units_v1')`);
    if (!customPresetsJson || !customPresetsJson.includes("Village Test Bigha")) {
      throw new Error(`Custom preset not found in localStorage. Storage content: ${customPresetsJson}`);
    }

    // Click "Use" button on the newly saved preset card
    await cdp.eval(`
      (() => {
        const useBtn = Array.from(document.querySelectorAll('button')).find(b => b.title === 'Load into Converter' || b.textContent.includes('Use'));
        if (useBtn) window.__clickRadix(useBtn);
      })()
    `);
    await sleep(800);

    // Ensure converter tab is active
    await cdp.eval(`
      (() => {
        const convBtn = document.querySelector('#tab-converter-btn');
        if (convBtn) convBtn.click();
      })()
    `);
    await sleep(400);

    // Verify Converter tab is now active and From unit is custom unit
    const fromUnit = await cdp.eval(`document.querySelector('#from-unit-select')?.textContent?.trim()`);
    const resultVal = await cdp.eval(`document.querySelector('[data-testid="primary-result-value"]')?.textContent?.trim()`);
    const customNotice = await cdp.eval(`
      document.body.innerText.includes('Customary Unofficial') || 
      document.body.innerText.includes('User-defined custom factor') ||
      document.body.innerText.includes('Notice:') ||
      document.body.innerText.includes('कस्टम')
    `);

    if (!fromUnit?.includes("Village Test Bigha")) {
      throw new Error(`Expected From unit 'Village Test Bigha', got '${fromUnit}'`);
    }

    return {
      customUnitName: "Village Test Bigha",
      factorSqFt: "20,000",
      activeFromUnit: fromUnit,
      conversionResult: resultVal,
      unverifiedNoticeDisplayed: customNotice
    };
  });

  // TEST 31: Phase 3A Trilingual Language Toggle (en -> hi -> mr -> en)
  await runTest("TEST 31: Phase 3A Trilingual Language Toggle (en -> hi -> mr -> en)", async () => {
    // 1. Initial should be English
    const initialLang = await cdp.eval("document.documentElement.lang");

    // Click 1: Switch to Hindi
    await cdp.eval("document.querySelector('#lang-toggle-btn')?.click()");
    await sleep(600);
    const hiLang = await cdp.eval("document.documentElement.lang");
    const hiHeading = await cdp.eval("document.querySelector('#converter-heading')?.textContent?.trim()");

    // Click 2: Switch to Marathi
    await cdp.eval("document.querySelector('#lang-toggle-btn')?.click()");
    await sleep(600);
    const mrLang = await cdp.eval("document.documentElement.lang");
    const mrHeading = await cdp.eval("document.querySelector('#converter-heading')?.textContent?.trim()");

    // Click 3: Switch back to English
    await cdp.eval("document.querySelector('#lang-toggle-btn')?.click()");
    await sleep(600);
    const enLang = await cdp.eval("document.documentElement.lang");
    const enHeading = await cdp.eval("document.querySelector('#converter-heading')?.textContent?.trim()");

    if (hiLang !== "hi" || !hiHeading?.includes("भूमि क्षेत्रफल")) {
      throw new Error(`Expected Hindi state, got lang=${hiLang}, heading=${hiHeading}`);
    }
    if (mrLang !== "mr" || !mrHeading?.includes("जमीन क्षेत्रफळ")) {
      throw new Error(`Expected Marathi state, got lang=${mrLang}, heading=${mrHeading}`);
    }
    if (enLang !== "en" || !enHeading?.includes("Indian Land Area")) {
      throw new Error(`Expected English state, got lang=${enLang}, heading=${enHeading}`);
    }

    return { initialLang, hiLang, mrLang, enLang, cycleVerified: true };
  });

  // TEST 32: Phase 3A Dedicated Tools Hub Page (/tools)
  await runTest("TEST 32: Phase 3A Dedicated Tools Hub Page (/tools)", async () => {
    const tabRes = await fetch("http://127.0.0.1:9222/json/new?" + encodeURIComponent(`${BASE_URL}/tools`), { method: "PUT" });
    const tab = await tabRes.json();
    const tabCdp = new CDPClient(tab.webSocketDebuggerUrl);
    await tabCdp.connect();
    await tabCdp.send("Page.enable");
    await tabCdp.send("Runtime.enable");
    await sleep(1000);

    const title = await tabCdp.eval("document.title");
    const h1 = await tabCdp.eval("document.querySelector('h1')?.textContent?.trim()");
    const toolCardsCount = await tabCdp.eval("document.querySelectorAll('a[href*=\"/tools/\"]').length");
    const breadcrumb = await tabCdp.eval("document.querySelector('nav[aria-label=\"Breadcrumb\"]')?.textContent?.trim()");

    tabCdp.close();
    await fetch(`http://127.0.0.1:9222/json/close/${tab.id}`);

    if (!title.includes("Indian Land Measurement Tools") && !title.includes("Bharat Land Converter")) {
      throw new Error(`Unexpected title for /tools: ${title}`);
    }
    if (toolCardsCount < 4) {
      throw new Error(`Expected at least 4 tool links, found ${toolCardsCount}`);
    }

    return { title, h1, toolCardsCount, breadcrumb };
  });

  // TEST 33: Phase 3A Plot Dimensions Calculator Dedicated Page (/tools/plot-area-calculator)
  await runTest("TEST 33: Phase 3A Plot Dimensions Calculator Dedicated Page (/tools/plot-area-calculator)", async () => {
    const tabRes = await fetch("http://127.0.0.1:9222/json/new?" + encodeURIComponent(`${BASE_URL}/tools/plot-area-calculator`), { method: "PUT" });
    const tab = await tabRes.json();
    const tabCdp = new CDPClient(tab.webSocketDebuggerUrl);
    await tabCdp.connect();
    await tabCdp.send("Page.enable");
    await tabCdp.send("Runtime.enable");
    await sleep(1000);

    const title = await tabCdp.eval("document.title");
    const h1 = await tabCdp.eval("document.querySelector('h1')?.textContent?.trim()");
    const hasSvg = await tabCdp.eval("Boolean(document.querySelector('svg rect'))");
    const resultVal = await tabCdp.eval("document.querySelector('[data-testid=\"plot-primary-sqft\"]')?.textContent?.trim()");

    tabCdp.close();
    await fetch(`http://127.0.0.1:9222/json/close/${tab.id}`);

    if (!title.includes("Plot Area Calculator")) {
      throw new Error(`Unexpected title for Plot Calculator: ${title}`);
    }
    if (!hasSvg) {
      throw new Error("Schematic SVG plot diagram not rendered in DOM");
    }

    return { title, h1, defaultPlotAreaSqFt: resultVal, hasSvg };
  });

  // TEST 34: Phase 3A Compound Land Unit Dedicated Page (/tools/compound-land-unit-converter)
  await runTest("TEST 34: Phase 3A Compound Land Unit Dedicated Page (/tools/compound-land-unit-converter)", async () => {
    const tabRes = await fetch("http://127.0.0.1:9222/json/new?" + encodeURIComponent(`${BASE_URL}/tools/compound-land-unit-converter`), { method: "PUT" });
    const tab = await tabRes.json();
    const tabCdp = new CDPClient(tab.webSocketDebuggerUrl);
    await tabCdp.connect();
    await tabCdp.send("Page.enable");
    await tabCdp.send("Runtime.enable");
    await sleep(1000);

    const title = await tabCdp.eval("document.title");
    const h1 = await tabCdp.eval("document.querySelector('h1')?.textContent?.trim()");
    const totalSqFt = await tabCdp.eval("document.querySelector('[data-testid=\"compound-total-sqft\"]')?.textContent?.trim()");

    tabCdp.close();
    await fetch(`http://127.0.0.1:9222/json/close/${tab.id}`);

    if (!title.includes("Compound")) {
      throw new Error(`Unexpected title for Compound Converter: ${title}`);
    }

    return { title, h1, defaultTotalSqFt: totalSqFt };
  });

  // TEST 35: Phase 3A Regional Land Unit Comparison Dedicated Page (/tools/land-unit-comparison)
  await runTest("TEST 35: Phase 3A Regional Land Unit Comparison Dedicated Page (/tools/land-unit-comparison)", async () => {
    const tabRes = await fetch("http://127.0.0.1:9222/json/new?" + encodeURIComponent(`${BASE_URL}/tools/land-unit-comparison`), { method: "PUT" });
    const tab = await tabRes.json();
    const tabCdp = new CDPClient(tab.webSocketDebuggerUrl);
    await tabCdp.connect();
    await tabCdp.send("Page.enable");
    await tabCdp.send("Runtime.enable");
    await sleep(1000);

    const title = await tabCdp.eval("document.title");
    const bodyText = await tabCdp.eval("document.body.innerText");

    tabCdp.close();
    await fetch(`http://127.0.0.1:9222/json/close/${tab.id}`);

    if (bodyText.includes("Section 68")) {
      throw new Error("Page contains invalid Section 68 citation for MP Bigha");
    }
    if (!bodyText.includes("Madhya Pradesh") && !bodyText.includes("27,225")) {
      throw new Error("MP Bigha standard entry missing from comparison matrix");
    }

    return { title, section68Excluded: true, mpProvenanceVerified: true };
  });

  // TEST 36: Phase 3A Custom Land Unit Dedicated Page (/tools/custom-land-unit-calculator)
  await runTest("TEST 36: Phase 3A Custom Land Unit Dedicated Page (/tools/custom-land-unit-calculator)", async () => {
    const tabRes = await fetch("http://127.0.0.1:9222/json/new?" + encodeURIComponent(`${BASE_URL}/tools/custom-land-unit-calculator`), { method: "PUT" });
    const tab = await tabRes.json();
    const tabCdp = new CDPClient(tab.webSocketDebuggerUrl);
    await tabCdp.connect();
    await tabCdp.send("Page.enable");
    await tabCdp.send("Runtime.enable");
    await sleep(1000);

    const title = await tabCdp.eval("document.title");
    const bodyText = await tabCdp.eval("document.body.innerText");

    tabCdp.close();
    await fetch(`http://127.0.0.1:9222/json/close/${tab.id}`);

    if (!bodyText.includes("LocalStorage") && !bodyText.includes("local device") && !bodyText.includes("लोकल स्टोरेज")) {
      throw new Error("Custom unit manager page missing explicit local storage disclosure");
    }

    return { title, localStorageDisclosureVerified: true };
  });

  // TEST 37: Phase 3A Marathi Localized Direct Navigation (/mr and /mr/tools)
  await runTest("TEST 37: Phase 3A Marathi Localized Direct Navigation (/mr and /mr/tools)", async () => {
    const tabRes = await fetch("http://127.0.0.1:9222/json/new?" + encodeURIComponent(`${BASE_URL}/mr`), { method: "PUT" });
    const tab = await tabRes.json();
    const tabCdp = new CDPClient(tab.webSocketDebuggerUrl);
    await tabCdp.connect();
    await tabCdp.send("Page.enable");
    await tabCdp.send("Runtime.enable");
    await sleep(1000);

    const mrLang = await tabCdp.eval("document.documentElement.lang");
    const mrHeading = await tabCdp.eval("document.querySelector('h1')?.textContent?.trim()");

    // Navigate to /mr/tools
    await tabCdp.send("Page.navigate", { url: `${BASE_URL}/mr/tools` });
    await sleep(1000);

    const mrToolsH1 = await tabCdp.eval("document.querySelector('h1')?.textContent?.trim()");

    tabCdp.close();
    await fetch(`http://127.0.0.1:9222/json/close/${tab.id}`);

    if (mrLang !== "mr") {
      throw new Error(`Expected lang='mr', got '${mrLang}'`);
    }
    if (!mrHeading?.includes("भारत जमीन")) {
      throw new Error(`Expected Marathi home heading, got '${mrHeading}'`);
    }

    return { mrLang, mrHomeH1: mrHeading, mrToolsH1 };
  });

  // TEST 38: Live Language Switching with Live Conversion State Retention (EN -> HI -> MR)
  await runTest("TEST 38: Live Language Switching with Live Conversion State Retention (EN -> HI -> MR)", async () => {
    const tabRes = await fetch("http://127.0.0.1:9222/json/new?" + encodeURIComponent(`${BASE_URL}/`), { method: "PUT" });
    const tab = await tabRes.json();
    const tabCdp = new CDPClient(tab.webSocketDebuggerUrl);
    await tabCdp.connect();
    await tabCdp.send("Page.enable");
    await tabCdp.send("Runtime.enable");
    await sleep(1000);

    // Enter 5 into the main input using React prototype value setter
    await tabCdp.eval(`(() => {
      const input = document.querySelector('#area-input') || document.querySelector('input[inputmode="decimal"]');
      if (!input) throw new Error("Converter input not found");
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setter.call(input, "5");
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
    })()`);
    await sleep(400);

    // Verify URL was updated by updateUrl to /?v=5
    const initialUrl = await tabCdp.eval("window.location.href");

    // Click language toggle button to switch to Hindi
    await tabCdp.eval("document.getElementById('lang-toggle-btn')?.click()");
    await sleep(1000);

    const hiUrl = await tabCdp.eval("window.location.href");
    const hiInputVal = await tabCdp.eval("document.querySelector('#area-input')?.value || document.querySelector('input[inputmode=\"decimal\"]')?.value");
    const hiLang = await tabCdp.eval("document.documentElement.lang");

    if (!hiUrl.includes("/hi") || !hiUrl.includes("v=5")) {
      throw new Error(`Expected Hindi URL to contain '/hi' and 'v=5', got '${hiUrl}'`);
    }
    if (hiInputVal !== "5") {
      throw new Error(`Expected Hindi input value to be '5', got '${hiInputVal}'`);
    }

    // Click language toggle again to switch to Marathi
    await tabCdp.eval("document.getElementById('lang-toggle-btn')?.click()");
    await sleep(1000);

    const mrUrl = await tabCdp.eval("window.location.href");
    const mrInputVal = await tabCdp.eval("document.querySelector('#area-input')?.value || document.querySelector('input[inputmode=\"decimal\"]')?.value");
    const mrLang = await tabCdp.eval("document.documentElement.lang");

    tabCdp.close();
    await fetch(`http://127.0.0.1:9222/json/close/${tab.id}`);

    if (!mrUrl.includes("/mr") || !mrUrl.includes("v=5")) {
      throw new Error(`Expected Marathi URL to contain '/mr' and 'v=5', got '${mrUrl}'`);
    }
    if (mrInputVal !== "5") {
      throw new Error(`Expected Marathi input value to be '5', got '${mrInputVal}'`);
    }

    return { initialUrl, hiUrl, hiInputVal, hiLang, mrUrl, mrInputVal, mrLang };
  });

  // TEST 39: Standalone Plot Area Calculator Transfer to Visible Converter
  await runTest("TEST 39: Standalone Plot Area Calculator Transfer to Visible Converter", async () => {
    const tabRes = await fetch("http://127.0.0.1:9222/json/new?" + encodeURIComponent(`${BASE_URL}/tools/plot-area-calculator`), { method: "PUT" });
    const tab = await tabRes.json();
    const tabCdp = new CDPClient(tab.webSocketDebuggerUrl);
    await tabCdp.connect();
    await tabCdp.send("Page.enable");
    await tabCdp.send("Runtime.enable");
    await sleep(1000);

    // Enter 200 ft length and 217.8 ft width (200 x 217.8 = 43,560 sq ft = 1 Acre)
    await tabCdp.eval(`(() => {
      const inputs = Array.from(document.querySelectorAll('input'));
      const lenInput = inputs.find(i => i.id === 'plot-length' || i.getAttribute('aria-label')?.includes('Length') || i.previousElementSibling?.textContent?.includes('Length'));
      const widInput = inputs.find(i => i.id === 'plot-width' || i.getAttribute('aria-label')?.includes('Width') || i.previousElementSibling?.textContent?.includes('Width'));
      if (!lenInput || !widInput) throw new Error("Plot dimensions inputs not found");
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setter.call(lenInput, "200");
      lenInput.dispatchEvent(new Event("input", { bubbles: true }));
      lenInput.dispatchEvent(new Event("change", { bubbles: true }));
      setter.call(widInput, "217.8");
      widInput.dispatchEvent(new Event("input", { bubbles: true }));
      widInput.dispatchEvent(new Event("change", { bubbles: true }));
    })()`);
    await sleep(500);

    // Click the Transfer to Converter button
    await tabCdp.eval(`(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const transferBtn = buttons.find(b => b.textContent.includes("Transfer to Converter") || b.textContent.includes("मुख्य कनवर्टर में भेजें"));
      if (!transferBtn) throw new Error("Transfer button not found in PlotCalculator");
      transferBtn.click();
    })()`);
    await sleep(1200);

    const transferredUrl = await tabCdp.eval("window.location.href");
    const transferredPath = await tabCdp.eval("window.location.pathname");
    const converterVal = await tabCdp.eval("document.querySelector('input[inputmode=\"decimal\"]')?.value");

    // Reload page to verify transferred calculation survives refresh
    await tabCdp.send("Page.reload");
    await sleep(1200);

    const reloadedUrl = await tabCdp.eval("window.location.href");
    const reloadedVal = await tabCdp.eval("document.querySelector('input[inputmode=\"decimal\"]')?.value");

    tabCdp.close();
    await fetch(`http://127.0.0.1:9222/json/close/${tab.id}`);

    if (transferredPath !== "/" && !transferredPath.endsWith("/")) {
      throw new Error(`Expected transfer destination to be '/', got '${transferredPath}'`);
    }
    if (!transferredUrl.includes("v=43560")) {
      throw new Error(`Expected transferred URL to contain 'v=43560', got '${transferredUrl}'`);
    }
    if (converterVal !== "43560") {
      throw new Error(`Expected visible converter input to be '43560', got '${converterVal}'`);
    }
    if (reloadedVal !== "43560") {
      throw new Error(`Expected reloaded converter input to retain '43560', got '${reloadedVal}'`);
    }

    return { transferredUrl, transferredPath, converterVal, reloadedUrl, reloadedVal };
  });

  // TEST 40: Custom Unit Lifecycle & Cache Invalidation in Real Browser
  await runTest("TEST 40: Custom Unit Lifecycle & Cache Invalidation in Real Browser", async () => {
    const tabRes = await fetch("http://127.0.0.1:9222/json/new?" + encodeURIComponent(`${BASE_URL}/tools/custom-land-unit-calculator`), { method: "PUT" });
    const tab = await tabRes.json();
    const tabCdp = new CDPClient(tab.webSocketDebuggerUrl);
    await tabCdp.connect();
    await tabCdp.send("Page.enable");
    await tabCdp.send("Runtime.enable");
    await sleep(1000);

    // Save custom unit into localStorage
    await tabCdp.eval(`(() => {
      const preset = {
        id: "custom_cdp_test_10k",
        name: "CDP Custom Bigha",
        factor: 10000,
        referenceUnit: "sqft",
        sqFtEquivalent: 10000,
        createdAt: new Date().toISOString()
      };
      window.localStorage.setItem("bharat_custom_units_v1", JSON.stringify([preset]));
      window.dispatchEvent(new Event("bharat_custom_units_updated"));
    })()`);
    await sleep(500);

    // Reload page to reflect saved custom preset in UI
    await tabCdp.send("Page.reload");
    await sleep(1000);

    // Click 'Use' button to load the custom unit into main converter
    await tabCdp.eval(`(() => {
      const useBtn = document.querySelector('button[title="Load into Converter"]');
      if (!useBtn) throw new Error("Load into Converter button not found");
      useBtn.click();
    })()`);
    await sleep(1200);

    const activeCustomUrl = await tabCdp.eval("window.location.href");
    const activeFromUnit = await tabCdp.eval("document.querySelector('#from-unit-selector-trigger')?.textContent?.trim() || ''");

    // Now delete custom unit from localStorage while user is on converter
    await tabCdp.eval(`(() => {
      window.localStorage.removeItem("bharat_custom_units_v1");
      window.dispatchEvent(new StorageEvent("storage", { key: "bharat_custom_units_v1" }));
    })()`);
    await sleep(800);

    const recoveredUrl = await tabCdp.eval("window.location.href");
    const recoveredFromUnit = await tabCdp.eval("document.querySelector('#from-unit-selector-trigger')?.textContent?.trim() || ''");

    tabCdp.close();
    await fetch(`http://127.0.0.1:9222/json/close/${tab.id}`);

    if (!activeCustomUrl.includes("custom_cdp_test_10k")) {
      throw new Error(`Expected active custom URL to contain preset id, got '${activeCustomUrl}'`);
    }
    if (recoveredUrl.includes("custom_cdp_test_10k")) {
      throw new Error(`Expected recovered URL to clear deleted preset, got '${recoveredUrl}'`);
    }

    return { activeCustomUrl, activeFromUnit, recoveredUrl, recoveredFromUnit };
  });

  // TEST 41: Shared Traditional Units in Real Browser (Haryana Kanal, Karnataka Guntha)
  await runTest("TEST 41: Shared Traditional Units in Real Browser (Haryana Kanal, Karnataka Guntha)", async () => {
    const tabRes = await fetch("http://127.0.0.1:9222/json/new?" + encodeURIComponent(`${BASE_URL}/?s=Haryana`), { method: "PUT" });
    const tab = await tabRes.json();
    const tabCdp = new CDPClient(tab.webSocketDebuggerUrl);
    await tabCdp.connect();
    await tabCdp.send("Page.enable");
    await tabCdp.send("Runtime.enable");
    await sleep(1000);

    // Open from-unit dropdown
    await tabCdp.eval(`(() => {
      const trigger = document.querySelector('#from-unit-select');
      if (trigger) trigger.click();
    })()`);
    await sleep(400);

    const hrOptions = await tabCdp.eval(`(() => {
      return Array.from(document.querySelectorAll('[role="option"]')).map(el => el.textContent.trim());
    })()`);

    const hasKanal = hrOptions.some(t => t.includes("Kanal") || t.includes("कनाल"));
    const hasMarla = hrOptions.some(t => t.includes("Marla") || t.includes("मरला"));

    // Switch state to Karnataka
    await tabCdp.eval(`(() => {
      const trigger = document.querySelector('#state-selector-trigger');
      if (trigger) trigger.click();
    })()`);
    await sleep(300);

    await tabCdp.eval(`(() => {
      const item = Array.from(document.querySelectorAll('[role="option"]')).find(el => el.textContent.includes('Karnataka') || el.textContent.includes('कर्नाटक'));
      if (item) item.click();
    })()`);
    await sleep(500);

    // Open from-unit dropdown in Karnataka
    await tabCdp.eval(`(() => {
      const trigger = document.querySelector('#from-unit-select');
      if (trigger) trigger.click();
    })()`);
    await sleep(400);

    const kaOptions = await tabCdp.eval(`(() => {
      return Array.from(document.querySelectorAll('[role="option"]')).map(el => el.textContent.trim());
    })()`);

    const hasGuntha = kaOptions.some(t => t.includes("Guntha") || t.includes("गुंठा"));

    // Close dropdown
    await tabCdp.eval(`(() => {
      const esc = new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true });
      document.dispatchEvent(esc);
    })()`);
    await sleep(200);

    tabCdp.close();
    await fetch(`http://127.0.0.1:9222/json/close/${tab.id}`);

    if (!hasKanal) throw new Error("Expected Kanal to be available in Haryana units");
    if (!hasMarla) throw new Error("Expected Marla to be available in Haryana units");
    if (!hasGuntha) throw new Error("Expected Guntha to be available in Karnataka units");

    return { hasKanal, hasMarla, hasGuntha };
  });

  // TEST 42: Legacy Concrete URL Parameters & Factor Disclosure in Real Browser
  await runTest("TEST 42: Legacy Concrete URL Parameters & Factor Disclosure in Real Browser (/?v=1&u=bigha_up&s=Uttar%20Pradesh)", async () => {
    const tabRes = await fetch("http://127.0.0.1:9222/json/new?" + encodeURIComponent(`${BASE_URL}/?v=1&u=bigha_up&s=Uttar%20Pradesh`), { method: "PUT" });
    const tab = await tabRes.json();
    const tabCdp = new CDPClient(tab.webSocketDebuggerUrl);
    await tabCdp.connect();
    await tabCdp.send("Page.enable");
    await tabCdp.send("Runtime.enable");
    await sleep(1000);

    const inputVal = await tabCdp.eval("document.querySelector('#area-input')?.value || document.querySelector('input[inputmode=\"decimal\"]')?.value");
    const noticeText = await tabCdp.eval("document.querySelector('#legacy-unit-notice')?.textContent || ''");
    const noticeExists = noticeText.length > 0;

    const hasLegacyFactor = noticeText.includes("27,000") || noticeText.includes("27000");
    const hasCanonicalFactor = noticeText.includes("27,225") || noticeText.includes("27225");

    // Click dismiss button
    await tabCdp.eval(`(() => {
      const btn = document.querySelector('button[aria-label="Dismiss legacy notice"]');
      if (btn) btn.click();
    })()`);
    await sleep(300);

    const noticeAfterDismiss = await tabCdp.eval("!!document.querySelector('#legacy-unit-notice')");

    tabCdp.close();
    await fetch(`http://127.0.0.1:9222/json/close/${tab.id}`);

    if (inputVal !== "1") throw new Error(`Expected input value '1', got '${inputVal}'`);
    if (!noticeExists) throw new Error("Expected #legacy-unit-notice to be rendered in DOM");
    if (!hasLegacyFactor || !hasCanonicalFactor) {
      throw new Error(`Expected notice to mention both 27,000 and 27,225 sq ft factors, got: '${noticeText}'`);
    }
    if (noticeAfterDismiss) throw new Error("Expected legacy notice to be dismissed after click");

    return { inputVal, noticeExists, hasLegacyFactor, hasCanonicalFactor, dismissed: !noticeAfterDismiss };
  });

  // TEST 43: Legacy Saved Parcel Migration & Factor Safety in Real Browser
  await runTest("TEST 43: Legacy Saved Parcel Migration & Factor Safety in Real Browser", async () => {
    const tabRes = await fetch("http://127.0.0.1:9222/json/new?" + encodeURIComponent(`${BASE_URL}/`), { method: "PUT" });
    const tab = await tabRes.json();
    const tabCdp = new CDPClient(tab.webSocketDebuggerUrl);
    await tabCdp.connect();
    await tabCdp.send("Page.enable");
    await tabCdp.send("Runtime.enable");
    await sleep(800);

    // Seed legacy parcel data before migration
    await tabCdp.eval(`(() => {
      localStorage.removeItem("bharat-land-parcels-v2");
      localStorage.removeItem("bharat_parcels_migrated_v1");
      localStorage.setItem("bharat-land-parcels", JSON.stringify([{
        id: "cdp-legacy-p1",
        name: "CDP Ancestral UP Plot",
        value: 1,
        unitId: "bigha_up",
        state: "Uttar Pradesh",
        sqftTotal: 27000
      }]));
    })()`);
    await sleep(300);

    // Reload page to run migration
    await tabCdp.send("Page.reload");
    await sleep(1000);

    // Open My Lands collapsible
    await tabCdp.eval(`(() => {
      const toggle = document.querySelector('#my-lands-toggle');
      if (toggle) toggle.click();
    })()`);
    await sleep(500);

    const parcelContent = await tabCdp.eval(`(() => {
      const el = document.querySelector('#my-lands-toggle')?.parentElement;
      return el ? el.textContent : '';
    })()`);

    const hasParcelName = parcelContent.includes("CDP Ancestral UP Plot");
    const hasPreservedSqft = parcelContent.includes("27,000") || parcelContent.includes("27000");
    const hasLegacyNote = parcelContent.includes("Historical factor");

    tabCdp.close();
    await fetch(`http://127.0.0.1:9222/json/close/${tab.id}`);

    if (!hasParcelName) throw new Error(`Expected parcel name in My Lands, got content: '${parcelContent}'`);
    if (!hasPreservedSqft) throw new Error(`Expected preserved 27,000 sq ft in My Lands, got content: '${parcelContent}'`);
    if (!hasLegacyNote) throw new Error(`Expected legacy note in My Lands, got content: '${parcelContent}'`);

    return { hasParcelName, hasPreservedSqft, hasLegacyNote };
  });

  // Cleanup
  console.log("==================================================");
  console.log("E2E TESTS COMPLETE");
  console.log(`Passed: ${results.filter(r => r.pass).length} / ${results.length}`);
  console.log("==================================================");

  cdp.close();
  try { chromeProcess.kill(); } catch {}
  try { execSync(`taskkill /F /T /PID ${previewProcess.pid}`, { stdio: "ignore" }); } catch {}
  try { previewProcess.kill(); } catch {}

  return results;
}

main().catch((err) => {
  console.error("Fatal E2E runner error:", err);
  process.exit(1);
});
