import { spawn } from "child_process";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE_URL = "http://127.0.0.1:4173";

const preview = spawn("npx", ["vite", "preview", "--port", "4173"], { shell: true, stdio: "ignore" });
await new Promise(r => setTimeout(r, 1500));

const chrome = spawn(
  CHROME_PATH,
  [
    "--headless=new",
    "--remote-debugging-port=9224",
    "--user-data-dir=C:\\Users\\Girish Lade\\AppData\\Local\\Temp\\chrome-debug-4",
    "--disable-gpu",
    "about:blank",
  ],
  { stdio: "ignore" }
);
await new Promise(r => setTimeout(r, 1500));

const tabRes = await fetch("http://127.0.0.1:9224/json/new?" + encodeURIComponent(BASE_URL), { method: "PUT" });
const tab = await tabRes.json();

const ws = new WebSocket(tab.webSocketDebuggerUrl);
await new Promise(resolve => ws.onopen = resolve);

function send(method, params = {}) {
  return new Promise((resolve) => {
    const id = Math.floor(Math.random() * 100000);
    const handler = (msg) => {
      const data = JSON.parse(msg.data);
      if (data.id === id) {
        ws.removeEventListener("message", handler);
        resolve(data.result);
      }
    };
    ws.addEventListener("message", handler);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

await send("Runtime.enable");
await send("Page.enable");
await new Promise(r => setTimeout(r, 1000));

const evalRes = async (expr) => {
  const r = await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true });
  return r?.result?.value;
};

// Set input to 1
await evalRes(`
  (() => {
    const el = document.querySelector('#area-input');
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    setter.call(el, '1');
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  })()
`);

// Search Square Feet and click Convert To
await evalRes(`
  (() => {
    const search = document.querySelector('#interactive-unit-search');
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    setter.call(search, 'Square Feet');
    search.dispatchEvent(new Event('input', { bubbles: true }));
    search.dispatchEvent(new Event('change', { bubbles: true }));
  })()
`);
await new Promise(r => setTimeout(r, 500));

const clicked = await evalRes(`
  (() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Convert To'));
    if (btn) { btn.click(); return true; }
    return false;
  })()
`);
console.log("Convert To clicked:", clicked);
await new Promise(r => setTimeout(r, 500));

const resultVal = await evalRes(`document.querySelector('[data-testid="primary-result-value"]')?.textContent?.trim()`);
console.log("Observed result:", resultVal);

ws.close();
chrome.kill();
preview.kill();
