import { spawn } from "child_process";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE_URL = "http://127.0.0.1:4173";

const preview = spawn("npx", ["vite", "preview", "--port", "4173"], { shell: true, stdio: "ignore" });
await new Promise(r => setTimeout(r, 1500));

const chrome = spawn(
  CHROME_PATH,
  [
    "--headless=new",
    "--remote-debugging-port=9225",
    "--user-data-dir=C:\\Users\\Girish Lade\\AppData\\Local\\Temp\\chrome-debug-6",
    "--disable-gpu",
    "about:blank",
  ],
  { stdio: "ignore" }
);
await new Promise(r => setTimeout(r, 1500));

const tabRes = await fetch("http://127.0.0.1:9225/json/new?" + encodeURIComponent(BASE_URL), { method: "PUT" });
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

await new Promise(r => setTimeout(r, 2500));

// Click to-unit-select trigger
await evalRes(`document.querySelector('#to-unit-select').click()`);
await new Promise(r => setTimeout(r, 600));

// Find option with Square Feet
const clickRes = await evalRes(`
  (() => {
    const items = Array.from(document.querySelectorAll('[role="option"]'));
    const item = items.find(el => el.textContent.includes('Square Feet'));
    if (!item) return { found: false, all: items.map(i => i.textContent) };
    
    // In Radix Select, option clicks respond to pointerup/click
    item.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true }));
    item.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
    item.click();
    return { found: true, text: item.textContent };
  })()
`);
console.log("Click option result:", clickRes);

await new Promise(r => setTimeout(r, 400));

const val = await evalRes(`document.querySelector('[data-testid="primary-result-value"]')?.textContent?.trim()`);
console.log("Result value:", val);

ws.close();
chrome.kill();
preview.kill();
