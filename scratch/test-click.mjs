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
    "--user-data-dir=C:\\Users\\Girish Lade\\AppData\\Local\\Temp\\chrome-debug-3",
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

// Get coordinates of to-unit-select
const rect = await evalRes(`
  (() => {
    const el = document.querySelector('#to-unit-select');
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  })()
`);

console.log("Coordinates:", rect);

await send("Input.dispatchMouseEvent", { type: "mousePressed", x: rect.x, y: rect.y, button: "left", clickCount: 1 });
await send("Input.dispatchMouseEvent", { type: "mouseReleased", x: rect.x, y: rect.y, button: "left", clickCount: 1 });

await new Promise(r => setTimeout(r, 600));

const options = await evalRes(`Array.from(document.querySelectorAll('[role="option"]')).map(el => el.textContent)`);
console.log("Found options count:", options?.length, "Sample options:", options?.slice(0, 5));

ws.close();
chrome.kill();
preview.kill();
