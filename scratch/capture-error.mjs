import { spawn } from "child_process";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE_URL = "http://127.0.0.1:4173";

const preview = spawn("npx", ["vite", "preview", "--port", "4173"], { shell: true, stdio: "ignore" });
await new Promise(r => setTimeout(r, 1500));

const chrome = spawn(
  CHROME_PATH,
  [
    "--headless=new",
    "--remote-debugging-port=9223",
    "--user-data-dir=C:\\Users\\Girish Lade\\AppData\\Local\\Temp\\chrome-debug",
    "--disable-gpu",
    "about:blank",
  ],
  { stdio: "ignore" }
);
await new Promise(r => setTimeout(r, 1500));

const tabRes = await fetch("http://127.0.0.1:9223/json/new?" + encodeURIComponent(BASE_URL), { method: "PUT" });
const tab = await tabRes.json();

const ws = new WebSocket(tab.webSocketDebuggerUrl);
await new Promise(resolve => ws.onopen = resolve);

ws.send(JSON.stringify({ id: 1, method: "Runtime.enable" }));
ws.send(JSON.stringify({ id: 2, method: "Page.enable" }));

ws.onmessage = (msg) => {
  const data = JSON.parse(msg.data);
  if (data.method === "Runtime.exceptionThrown") {
    console.log("EXCEPTION:", JSON.stringify(data.params.exceptionDetails, null, 2));
  }
};

await new Promise(r => setTimeout(r, 3000));
ws.close();
chrome.kill();
preview.kill();
