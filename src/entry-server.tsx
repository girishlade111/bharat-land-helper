import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server.js";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppRoutes } from "./App";

export function render(url: string): string {
  return renderToString(
    <TooltipProvider>
      <StaticRouter location={url}>
        <AppRoutes />
      </StaticRouter>
    </TooltipProvider>
  );
}
