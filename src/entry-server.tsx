import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server.js";
import { AppShell, AppRoutes } from "./App";

export function render(url: string): string {
  return renderToString(
    <AppShell>
      <StaticRouter location={url}>
        <AppRoutes />
      </StaticRouter>
    </AppShell>
  );
}
